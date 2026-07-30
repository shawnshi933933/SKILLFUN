/**
 * MCP (Model Context Protocol) JSON-RPC 2.0 handler
 *
 * Routes:
 *   POST /mcp/:bundleId/mcp   — JSON-RPC 2.0 dispatcher
 *   GET  /mcp/:bundleId/tools — tools list shortcut (no auth)
 *
 * x402 payment model (v4):
 *   tools/call and skill resources/read require X-402-Payment-Proof header.
 *   If missing or stale (contentVersion mismatch) → HTTP 402 with W0G settlement details.
 *   Agent pays on-chain via:
 *     • selfAuthorize(tokenId)         — unclaimed skills (free, just needs gas)
 *     • purchaseAuthorization(tokenId) — claimed skills (approve W0G first, then call)
 *   Then POSTs txHash to /api/mcp/payment/prove to receive a proof token,
 *   then retries with X-402-Payment-Proof: <token>.
 */

import { Router, type Request, type Response } from "express";
import { createPublicClient, http } from "viem";
import { db } from "@workspace/db";
import {
  bundlesTable,
  bundleSkillsTable,
  skillsTable,
  paymentProofsTable,
} from "@workspace/db";
import { eq, asc, and } from "drizzle-orm";
import { downloadSkillContent } from "../services/storage.js";
import { getAddresses, ZEROG_MAINNET, SkillNFT_ABI } from "@workspace/abi";
import { logger } from "../lib/logger.js";

const router = Router();

const SKILL_NFT_ADDRESS = getAddresses(16661).SkillNFT;
const MCP_PROTOCOL_VERSION = "2024-11-05";
const W0G_ADDRESS = "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c";

const chainClient = createPublicClient({
  chain: ZEROG_MAINNET,
  transport: http(process.env.ZEROG_RPC_URL ?? "https://evmrpc.0g.ai"),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonRpcOk(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

function jsonRpcError(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

/** Parse "{bundleSlug}:{tokenId}" tool name → tokenId */
function parseToolName(name: string): number | null {
  const parts = name.split(":");
  if (parts.length < 2) return null;
  const tokenId = parseInt(parts[parts.length - 1], 10);
  return Number.isFinite(tokenId) ? tokenId : null;
}

/** Check X-402-Payment-Proof + X-402-Agent-Wallet headers against DB */
async function validateProof(
  proofToken: string | undefined,
  agentWallet: string | undefined,
  skillId: string,
  contentVersion: number
): Promise<{ valid: true } | { valid: false; reason: string }> {
  if (!proofToken) return { valid: false, reason: "missing_proof" };
  if (!agentWallet) return { valid: false, reason: "missing_wallet" };

  const [proof] = await db
    .select()
    .from(paymentProofsTable)
    .where(eq(paymentProofsTable.token, proofToken))
    .limit(1);

  if (!proof) return { valid: false, reason: "unknown_token" };
  if (proof.agentWallet !== agentWallet.toLowerCase()) return { valid: false, reason: "wallet_mismatch" };
  if (proof.skillId !== skillId) return { valid: false, reason: "wrong_skill" };
  if (proof.contentVersion !== contentVersion) return { valid: false, reason: "stale_version" };
  if (proof.expiresAt && proof.expiresAt < new Date()) return { valid: false, reason: "expired" };

  return { valid: true };
}

/**
 * Return HTTP 402 challenge for a skill.
 *
 * Method is determined by on-chain ownership:
 *   • ownerOf == SkillNFT contract → skill is unclaimed → selfAuthorize (free, gas-only)
 *   • ownerOf == real wallet       → skill is claimed  → purchaseAuthorization (requires W0G approval)
 *
 * This is authoritative: basePrice is irrelevant for method selection. A claimed skill
 * with basePrice=0 still requires purchaseAuthorization (which will transfer 0 W0G).
 */
async function send402(
  res: Response,
  skill: { skillId: string; tokenId: number | null; meta: unknown },
  reason: string
) {
  const meta = (skill.meta as Record<string, unknown>) ?? {};
  const basePrice = (meta.basePrice as string | number | undefined) ?? "0";

  if (skill.tokenId == null) {
    res.status(503).json({ error: "Skill has no on-chain token — cannot determine payment method." });
    return;
  }

  let method: string;
  try {
    const owner = await chainClient.readContract({
      address: SKILL_NFT_ADDRESS as `0x${string}`,
      abi: SkillNFT_ABI,
      functionName: "ownerOf",
      args: [BigInt(skill.tokenId)],
    }) as string;
    // Unclaimed: NFT is held by the SkillNFT contract itself
    method = owner.toLowerCase() === SKILL_NFT_ADDRESS.toLowerCase()
      ? "selfAuthorize"
      : "purchaseAuthorization";
  } catch (err) {
    // ownerOf reverted — token may not exist or RPC is unavailable. Return explicit 503.
    logger.error({ err, tokenId: skill.tokenId }, "send402: ownerOf check failed — cannot issue 402");
    res.status(503).json({
      error: "Temporarily unable to determine skill ownership. Please retry in a few seconds.",
      tokenId: skill.tokenId,
    });
    return;
  }

  res.status(402).json({
    error: "Payment required",
    reason,
    x402Version: 1,
    accepts: [
      {
        scheme: "exact",
        network: "0g-mainnet",
        currency: "W0G",
        tokenAddress: W0G_ADDRESS,
        amount: String(basePrice),
        payTo: SKILL_NFT_ADDRESS,
        // selfAuthorize:         unclaimed skill — free, no W0G approval needed
        // purchaseAuthorization: claimed skill  — approve W0G first (even if amount=0)
        method,
        tokenId: skill.tokenId,
      },
    ],
    proveEndpoint: "/api/mcp/payment/prove",
  });
}

// ---------------------------------------------------------------------------
// GET /:bundleId/tools — free tools list (no auth)
// ---------------------------------------------------------------------------
router.get("/:bundleId/tools", async (req, res) => {
  const bundleId = req.params.bundleId as string;

  const [bundle] = await db
    .select()
    .from(bundlesTable)
    .where(eq(bundlesTable.bundleId, bundleId))
    .limit(1);

  if (!bundle) {
    res.status(404).json({ error: "Bundle not found" });
    return;
  }

  const bundleSkills = await db
    .select({ skill: skillsTable })
    .from(bundleSkillsTable)
    .innerJoin(skillsTable, eq(bundleSkillsTable.skillId, skillsTable.skillId))
    .where(eq(bundleSkillsTable.bundleId, bundleId))
    .orderBy(asc(bundleSkillsTable.position));

  const tools = bundleSkills.map(({ skill }) => buildTool(bundle.subdomain, skill));
  res.json({ bundleId, subdomain: bundle.subdomain, tools });
});

// ---------------------------------------------------------------------------
// POST /:bundleId/mcp — JSON-RPC 2.0 dispatcher
// ---------------------------------------------------------------------------
router.post("/:bundleId/mcp", async (req, res) => {
  const bundleId = req.params.bundleId as string;
  const body = req.body as { jsonrpc?: string; id?: unknown; method?: string; params?: unknown };

  // Validate JSON-RPC envelope
  if (body.jsonrpc !== "2.0" || !body.method) {
    res.status(400).json(jsonRpcError(body.id ?? null, -32600, "Invalid JSON-RPC request"));
    return;
  }

  const id = body.id ?? null;
  const method = body.method;
  const params = (body.params ?? {}) as Record<string, unknown>;

  // Load bundle (needed by most methods)
  const [bundle] = await db
    .select()
    .from(bundlesTable)
    .where(eq(bundlesTable.bundleId, bundleId))
    .limit(1);

  if (!bundle) {
    res.status(404).json(jsonRpcError(id, -32001, "Bundle not found"));
    return;
  }

  try {
    switch (method) {
      // ── initialize ─────────────────────────────────────────────────────────
      case "initialize": {
        res.json(jsonRpcOk(id, {
          protocolVersion: MCP_PROTOCOL_VERSION,
          serverInfo: { name: "SkillFun MCP Gateway", version: "1.0.0" },
          capabilities: { tools: { listChanged: false }, resources: { listChanged: false } },
          _skillfun: {
            bundleId: bundle.bundleId,
            subdomain: bundle.subdomain,
            name: bundle.name,
            description: bundle.description ?? "",
            workflow: bundle.workflow ?? "",
            paymentInfo: {
              currency: "W0G",
              tokenAddress: W0G_ADDRESS,
              skillNFTContract: SKILL_NFT_ADDRESS,
              // Unclaimed skills: selfAuthorize(tokenId) — free
              // Claimed skills:   approve W0G → purchaseAuthorization(tokenId)
              method: "purchaseAuthorization",
              proveEndpoint: "/api/mcp/payment/prove",
              model: "pay-per-version: proof valid until creator updates skill content",
            },
          },
        }));
        return;
      }

      // ── notifications/initialized (no-op) ──────────────────────────────────
      case "notifications/initialized":
      case "ping": {
        res.status(200).end();
        return;
      }

      // ── tools/list ─────────────────────────────────────────────────────────
      case "tools/list": {
        const bundleSkills = await db
          .select({ skill: skillsTable })
          .from(bundleSkillsTable)
          .innerJoin(skillsTable, eq(bundleSkillsTable.skillId, skillsTable.skillId))
          .where(eq(bundleSkillsTable.bundleId, bundleId))
          .orderBy(asc(bundleSkillsTable.position));

        const tools = bundleSkills.map(({ skill }) => buildTool(bundle.subdomain, skill));
        res.json(jsonRpcOk(id, { tools }));
        return;
      }

      // ── tools/call ─────────────────────────────────────────────────────────
      case "tools/call": {
        const toolName = params.name as string | undefined;
        if (!toolName) {
          res.json(jsonRpcError(id, -32602, "params.name is required"));
          return;
        }

        const tokenId = parseToolName(toolName);
        if (tokenId === null) {
          res.json(jsonRpcError(id, -32602, `Invalid tool name format: "${toolName}". Expected "{bundle}:{tokenId}"`));
          return;
        }

        // Find the skill in this bundle
        const [row] = await db
          .select({ skill: skillsTable })
          .from(bundleSkillsTable)
          .innerJoin(skillsTable, eq(bundleSkillsTable.skillId, skillsTable.skillId))
          .where(and(
            eq(bundleSkillsTable.bundleId, bundleId),
            eq(skillsTable.tokenId, tokenId)
          ))
          .limit(1);

        if (!row) {
          res.json(jsonRpcError(id, -32001, `Tool "${toolName}" not found in bundle "${bundleId}"`));
          return;
        }

        const { skill } = row;

        // ── x402 proof check ───────────────────────────────────────────────
        const proofToken   = req.headers["x-402-payment-proof"] as string | undefined;
        const agentWallet  = req.headers["x-402-agent-wallet"]  as string | undefined;
        const proofCheck = await validateProof(proofToken, agentWallet, skill.skillId, skill.contentVersion);

        if (!proofCheck.valid) {
          logger.info({ bundleId, toolName, reason: proofCheck.reason }, "mcp tools/call 402");
          await send402(res, skill, proofCheck.reason);
          return;
        }

        // ── fetch + decrypt content from 0G ───────────────────────────────
        if (!skill.rootHash) {
          res.json(jsonRpcError(id, -32001, "Skill content not yet uploaded to 0G Storage"));
          return;
        }

        try {
          const content = await downloadSkillContent(skill.rootHash);
          logger.info({ bundleId, toolName, skillId: skill.skillId }, "mcp tools/call success");
          res.json(jsonRpcOk(id, {
            content: [{ type: "text", text: content }],
            _skillfun: {
              skillId: skill.skillId,
              contentVersion: skill.contentVersion,
              rootHash: skill.rootHash,
            },
          }));
        } catch (err) {
          logger.error({ err, skillId: skill.skillId, rootHash: skill.rootHash }, "mcp 0G fetch failed");
          res.json(jsonRpcError(id, -32001, "Failed to fetch skill content from 0G Storage. Content may not be finalized yet."));
        }
        return;
      }

      // ── resources/list ─────────────────────────────────────────────────────
      case "resources/list": {
        const bundleSkills = await db
          .select({ skill: skillsTable })
          .from(bundleSkillsTable)
          .innerJoin(skillsTable, eq(bundleSkillsTable.skillId, skillsTable.skillId))
          .where(eq(bundleSkillsTable.bundleId, bundleId))
          .orderBy(asc(bundleSkillsTable.position));

        const resources = [
          {
            uri: `skillfun://${bundleId}/workflow.md`,
            name: "Bundle Workflow",
            description: "Orchestration playbook — how to sequence the Skills in this Bundle",
            mimeType: "text/markdown",
            annotations: { audience: ["assistant"], payment: "free" },
          },
          ...bundleSkills.map(({ skill }) => ({
            uri: `skillfun://${bundleId}/skills/${skill.tokenId}`,
            name: skillDisplayName(skill, bundle.subdomain),
            description: (skill.meta as Record<string, unknown>)?.description as string ?? "",
            mimeType: "text/plain",
            annotations: { audience: ["assistant"], payment: "x402-W0G" },
          })),
        ];

        res.json(jsonRpcOk(id, { resources }));
        return;
      }

      // ── resources/read ─────────────────────────────────────────────────────
      case "resources/read": {
        const uri = params.uri as string | undefined;
        if (!uri) {
          res.json(jsonRpcError(id, -32602, "params.uri is required"));
          return;
        }

        // Free: workflow resource
        if (uri === `skillfun://${bundleId}/workflow.md`) {
          res.json(jsonRpcOk(id, {
            contents: [{
              uri,
              mimeType: "text/markdown",
              text: bundle.workflow ?? "No workflow defined for this bundle yet.",
            }],
          }));
          return;
        }

        // Paid: skill resource
        const skillTokenMatch = uri.match(/^skillfun:\/\/[^/]+\/skills\/(\d+)$/);
        if (!skillTokenMatch) {
          res.json(jsonRpcError(id, -32602, `Unknown resource URI: "${uri}"`));
          return;
        }

        const tokenId = parseInt(skillTokenMatch[1], 10);
        const [row] = await db
          .select({ skill: skillsTable })
          .from(bundleSkillsTable)
          .innerJoin(skillsTable, eq(bundleSkillsTable.skillId, skillsTable.skillId))
          .where(and(
            eq(bundleSkillsTable.bundleId, bundleId),
            eq(skillsTable.tokenId, tokenId)
          ))
          .limit(1);

        if (!row) {
          res.json(jsonRpcError(id, -32001, `Skill resource not found: "${uri}"`));
          return;
        }

        const { skill } = row;

        // x402 check
        const proofToken  = req.headers["x-402-payment-proof"] as string | undefined;
        const agentWallet = req.headers["x-402-agent-wallet"]  as string | undefined;
        const proofCheck = await validateProof(proofToken, agentWallet, skill.skillId, skill.contentVersion);

        if (!proofCheck.valid) {
          await send402(res, skill, proofCheck.reason);
          return;
        }

        if (!skill.rootHash) {
          res.json(jsonRpcError(id, -32001, "Skill content not yet uploaded to 0G Storage"));
          return;
        }

        try {
          const content = await downloadSkillContent(skill.rootHash);
          res.json(jsonRpcOk(id, {
            contents: [{ uri, mimeType: "text/plain", text: content }],
          }));
        } catch (err) {
          logger.error({ err, skillId: skill.skillId }, "mcp resources/read 0G fetch failed");
          res.json(jsonRpcError(id, -32001, "Failed to fetch skill content from 0G Storage."));
        }
        return;
      }

      // ── unknown method ─────────────────────────────────────────────────────
      default: {
        res.json(jsonRpcError(id, -32601, `Method not found: "${method}"`));
      }
    }
  } catch (err) {
    logger.error({ err, bundleId, method }, "mcp handler error");
    res.status(500).json(jsonRpcError(id, -32000, "Internal server error"));
  }
});

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function skillDisplayName(skill: typeof skillsTable.$inferSelect, bundleSubdomain: string): string {
  const meta = (skill.meta as Record<string, unknown>) ?? {};
  return (meta.name as string) || skill.repoUrl.split("/").pop() || `${bundleSubdomain}:${skill.tokenId}`;
}

function buildTool(bundleSubdomain: string, skill: typeof skillsTable.$inferSelect) {
  const meta = (skill.meta as Record<string, unknown>) ?? {};
  const description = (meta.description as string) || (meta.name as string) || skill.repoUrl;
  return {
    name: `${bundleSubdomain}:${skill.tokenId ?? skill.skillId}`,
    description,
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string" as const,
          description: "Your query or input for this skill",
        },
      },
    },
    _skillfun: {
      skillId: skill.skillId,
      tokenId: skill.tokenId,
      contentVersion: skill.contentVersion,
      payment: "x402-W0G",
    },
  };
}

export default router;
