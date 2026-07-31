/**
 * POST /api/mcp/payment/prove
 *
 * Called by AI agents after sending W0G ERC-20 to the Curator's wallet,
 * OR directly (no TX required) when the bundle's servicePrice is 0 / null.
 *
 * bundleId is REQUIRED — it binds the proof to a specific bundle, preventing
 * a cheaper-bundle payment from minting proofs for an expensive bundle.
 *
 * ── Zero-amount (free) flow ──────────────────────────────────────────────────
 *   When bundle.servicePrice is null or "0", no on-chain TX is needed.
 *   Agent signs:  "SkillFun free access: {bundleId}:{tokenId}:{agentWallet}"
 *   Body:         { tokenId, agentWallet, bundleId, signature }  (no txHash)
 *
 * ── Paid flow ────────────────────────────────────────────────────────────────
 *   1. Validate bundleId + tokenId: verify skill is in bundle (bundle_skills)
 *   2. Fetch tx receipt (must be success)
 *   3. Parse ERC-20 Transfer logs for W0G token:
 *        Transfer(from=agentWallet, to=bundle.ownerAddress, value≥bundle.servicePrice)
 *   4. Verify EIP-191 sig: signer == agentWallet, message = "SkillFun payment proof: {txHash}"
 *   5. Look up skill by tokenId → skillId + contentVersion
 *   6. Upsert payment_proofs with bundleId (idempotent by txHash+bundleId)
 *   7. Return { proof, skillId, contentVersion }
 */

import { Router } from "express";
import crypto from "node:crypto";
import {
  createPublicClient,
  http,
  recoverMessageAddress,
  parseAbiItem,
  decodeEventLog,
} from "viem";
import { db } from "@workspace/db";
import { skillsTable, paymentProofsTable, bundlesTable, bundleSkillsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getAddresses, ZEROG_MAINNET } from "@workspace/abi";
import { apiError, ErrorCode } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

const router = Router();

const W0G_ADDRESS = (process.env.W0G_ADDRESS ?? "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c").toLowerCase();

const client = createPublicClient({
  chain: ZEROG_MAINNET,
  transport: http(process.env.ZEROG_RPC_URL ?? "https://evmrpc.0g.ai"),
});

const TRANSFER_EVENT = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)"
);

// POST /api/mcp/payment/prove
router.post("/mcp/payment/prove", async (req, res) => {
  const {
    txHash,
    tokenId:     rawTokenId,
    agentWallet: rawWallet,
    bundleId,
    signature,
  } = req.body as {
    txHash?:      string;
    tokenId?:     number | string;
    agentWallet?: string;
    bundleId?:    string;
    signature?:   string;
  };

  if (rawTokenId == null || !rawWallet || !bundleId || !signature) {
    apiError(res, ErrorCode.INVALID_INPUT, "tokenId, agentWallet, bundleId, and signature are required");
    return;
  }

  const tokenId     = Number(rawTokenId);
  const agentWallet = rawWallet.toLowerCase();

  if (!Number.isFinite(tokenId) || tokenId < 0) {
    apiError(res, ErrorCode.INVALID_INPUT, "tokenId must be a non-negative integer");
    return;
  }

  // ── 1. Load bundle + verify (bundleId, tokenId) membership ───────────────
  const [bundle] = await db
    .select()
    .from(bundlesTable)
    .where(eq(bundlesTable.bundleId, bundleId))
    .limit(1);

  if (!bundle) {
    apiError(res, ErrorCode.NOT_FOUND, `Bundle "${bundleId}" not found.`);
    return;
  }

  const [membership] = await db
    .select({ skillId: bundleSkillsTable.skillId })
    .from(bundleSkillsTable)
    .innerJoin(skillsTable, eq(bundleSkillsTable.skillId, skillsTable.skillId))
    .where(and(
      eq(bundleSkillsTable.bundleId, bundleId),
      eq(skillsTable.tokenId, tokenId)
    ))
    .limit(1);

  if (!membership) {
    apiError(res, ErrorCode.INVALID_INPUT,
      `tokenId=${tokenId} is not a skill in bundle "${bundleId}". Check the bundleId or tokenId and retry.`
    );
    return;
  }

  const isFree = !bundle.servicePrice || bundle.servicePrice === "0";

  // ── 2a. FREE path — no on-chain TX required ───────────────────────────────
  // Agent signs: "SkillFun free access: {bundleId}:{tokenId}:{agentWallet}"
  if (isFree) {
    const freeMessage = `SkillFun free access: ${bundleId}:${tokenId}:${agentWallet}`;
    let recoveredSigner: string;
    try {
      recoveredSigner = (await recoverMessageAddress({
        message:   freeMessage,
        signature: signature as `0x${string}`,
      })).toLowerCase();
    } catch {
      apiError(res, ErrorCode.INVALID_INPUT, "Invalid signature — cannot recover signer address.");
      return;
    }

    if (recoveredSigner !== agentWallet) {
      apiError(res, ErrorCode.FORBIDDEN,
        `Signature mismatch: recovered ${recoveredSigner} but agentWallet is ${agentWallet}. ` +
        `Sign "SkillFun free access: ${bundleId}:${tokenId}:${agentWallet}" with your agent wallet.`
      );
      return;
    }

    // Idempotency: same (agentWallet, bundleId, tokenId) → same proof
    // Use a stable synthetic key since there's no txHash
    const freeKey = `free:${agentWallet}:${bundleId}:${tokenId}`;
    const [skill] = await db.select().from(skillsTable).where(eq(skillsTable.tokenId, tokenId)).limit(1);
    if (!skill) { apiError(res, ErrorCode.NOT_FOUND, `No skill found for tokenId=${tokenId}.`); return; }

    const [existingFree] = await db
      .select()
      .from(paymentProofsTable)
      .where(and(
        eq(paymentProofsTable.txHash,   freeKey),
        eq(paymentProofsTable.bundleId, bundleId)
      ))
      .limit(1);

    if (existingFree) {
      logger.info({ skillId: skill.skillId, agentWallet, bundleId }, "mcp/prove: reissuing free proof");
      res.json({ proof: existingFree.token, skillId: existingFree.skillId, contentVersion: existingFree.contentVersion, expiresAt: null, reissued: true, free: true });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    await db.insert(paymentProofsTable).values({
      token,
      skillId:        skill.skillId,
      contentVersion: skill.contentVersion,
      agentWallet,
      txHash:         freeKey,
      bundleId,
      expiresAt:      null,
    });

    logger.info({ skillId: skill.skillId, agentWallet, bundleId }, "mcp/prove: free proof issued");
    res.status(201).json({ proof: token, skillId: skill.skillId, contentVersion: skill.contentVersion, expiresAt: null, reissued: false, free: true });
    return;
  }

  // ── 2b. PAID path — verify on-chain W0G Transfer ──────────────────────────
  if (!txHash) {
    apiError(res, ErrorCode.INVALID_INPUT, "txHash is required for paid bundles");
    return;
  }

  if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    apiError(res, ErrorCode.INVALID_INPUT, "txHash must be a valid 0x-prefixed 32-byte hex string");
    return;
  }

  let receipt: Awaited<ReturnType<typeof client.getTransactionReceipt>>;
  try {
    receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });
  } catch (err) {
    logger.warn({ err, txHash }, "mcp/prove: receipt fetch failed");
    apiError(res, ErrorCode.RPC_ERROR, "Transaction not found or still pending. Please wait for confirmation.");
    return;
  }

  if (receipt.status !== "success") {
    apiError(res, ErrorCode.INVALID_INPUT, "Transaction failed on-chain. No proof issued.");
    return;
  }

  const expectedRecipient = bundle.ownerAddress.toLowerCase();
  const requiredPrice     = BigInt(bundle.servicePrice!);
  const w0gLogs = receipt.logs.filter((log) => log.address.toLowerCase() === W0G_ADDRESS);
  let transferVerified = false;

  for (const log of w0gLogs) {
    try {
      const decoded = decodeEventLog({ abi: [TRANSFER_EVENT], topics: log.topics, data: log.data });
      if (decoded.eventName !== "Transfer") continue;
      const { from, to, value } = decoded.args as { from: string; to: string; value: bigint };
      if (from.toLowerCase() !== agentWallet) continue;
      if (to.toLowerCase() !== expectedRecipient) continue;
      if (value < requiredPrice) {
        apiError(res, ErrorCode.INVALID_INPUT, `W0G transfer value ${value} is less than required servicePrice ${requiredPrice}.`);
        return;
      }
      transferVerified = true;
      break;
    } catch { /* not a Transfer event */ }
  }

  if (!transferVerified) {
    apiError(res, ErrorCode.INVALID_INPUT,
      `No valid W0G ERC-20 Transfer found in tx ${txHash}. ` +
      `Expected Transfer(from=${agentWallet}, to=${expectedRecipient}) on W0G (${W0G_ADDRESS}).`
    );
    return;
  }

  // Verify EIP-191 signature
  const proofMessage = `SkillFun payment proof: ${txHash}`;
  let recoveredSigner: string;
  try {
    recoveredSigner = (await recoverMessageAddress({ message: proofMessage, signature: signature as `0x${string}` })).toLowerCase();
  } catch {
    apiError(res, ErrorCode.INVALID_INPUT, "Invalid signature — cannot recover signer address.");
    return;
  }

  if (recoveredSigner !== agentWallet) {
    apiError(res, ErrorCode.FORBIDDEN,
      `Signature mismatch: recovered ${recoveredSigner} but agentWallet is ${agentWallet}. ` +
      `Sign "SkillFun payment proof: ${txHash}" with your agent wallet.`
    );
    return;
  }

  // Look up skill
  const [skill] = await db.select().from(skillsTable).where(eq(skillsTable.tokenId, tokenId)).limit(1);
  if (!skill) { apiError(res, ErrorCode.NOT_FOUND, `No skill found for tokenId=${tokenId}.`); return; }

  // Idempotency
  const [existingByTx] = await db
    .select()
    .from(paymentProofsTable)
    .where(and(eq(paymentProofsTable.txHash, txHash), eq(paymentProofsTable.bundleId, bundleId)))
    .limit(1);

  if (existingByTx) {
    logger.info({ skillId: skill.skillId, txHash, agentWallet, bundleId }, "mcp/prove: reissuing existing proof");
    res.json({ proof: existingByTx.token, skillId: existingByTx.skillId, contentVersion: existingByTx.contentVersion, expiresAt: null, reissued: true });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  await db.insert(paymentProofsTable).values({ token, skillId: skill.skillId, contentVersion: skill.contentVersion, agentWallet, txHash, bundleId, expiresAt: null });

  logger.info({ skillId: skill.skillId, contentVersion: skill.contentVersion, agentWallet, txHash, bundleId }, "mcp/prove: proof issued (erc20-transfer)");
  res.status(201).json({ proof: token, skillId: skill.skillId, contentVersion: skill.contentVersion, expiresAt: null, reissued: false });
});

export default router;
