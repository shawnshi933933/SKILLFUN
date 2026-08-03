/**
 * Curator authorization management API
 *
 * GET /api/curator/authorizations?wallet=0x...
 *   Returns all skills associated with the wallet's bundles, enriched with
 *   live on-chain authorization status, epoch comparison, and claim info.
 *
 * GET /api/curator/authorizations/:tokenId/status?wallet=0x...
 *   Single skill authorization status.
 *
 * These are intentionally public-read endpoints — the data is visible on-chain.
 * The destructive actions (selfAuthorize / purchaseAuthorization) happen on-chain
 * from the user's wallet, not through this API.
 */

import { Router } from "express";
import { createPublicClient, http } from "viem";
import { db } from "@workspace/db";
import {
  curatorAuthorizationsTable,
  skillsTable,
  bundlesTable,
  bundleSkillsTable,
} from "@workspace/db";
import { eq, and, inArray, notInArray } from "drizzle-orm";
import { SkillNFT_ABI, getAddresses, ZEROG_MAINNET } from "@workspace/abi";
import { apiError, ErrorCode } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

const router = Router();
const CHAIN_ID = 16661;
const SKILL_NFT_ADDRESS = getAddresses(CHAIN_ID).SkillNFT as `0x${string}`;

const chainClient = createPublicClient({
  chain: ZEROG_MAINNET,
  transport: http(process.env.ZEROG_RPC_URL ?? "https://evmrpc.0g.ai"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AuthStatus = "active" | "needs_reauth" | "revoked" | "pending";

export interface AuthorizationEntry {
  tokenId:       number;
  skillId:       string;
  skillName:     string;
  repoUrl:       string;
  /** DB ownerAddress (creator/submitter) */
  ownerAddress:  string | null;
  /** Live on-chain NFT owner (null = unclaimed, held by SkillNFT contract) */
  nftOwner:      string | null;
  isClaimed:     boolean;
  /** On-chain basePrice in wei (as decimal string) */
  basePrice:     string;
  authorizedAt:  string | null;
  revokedAt:     string | null;
  storedEpoch:   number | null;
  onChainEpoch:  number;
  isAuthorized:  boolean;
  status:        AuthStatus;
  contentVersion: number;
  /** Bundles this skill appears in (that the curator owns) */
  bundleIds:     string[];
}

// ---------------------------------------------------------------------------
// Helper: on-chain reads for a single tokenId
// ---------------------------------------------------------------------------

async function readOnChain(tokenId: number, curatorWallet: string): Promise<{
  isAuthorized: boolean;
  onChainEpoch: number;
  nftOwner:     string | null;
  basePrice:    bigint;
}> {
  const [isAuth, epoch, owner, price] = await Promise.allSettled([
    chainClient.readContract({
      address: SKILL_NFT_ADDRESS,
      abi: SkillNFT_ABI,
      functionName: "isAuthorized",
      args: [BigInt(tokenId), curatorWallet as `0x${string}`],
    }),
    chainClient.readContract({
      address: SKILL_NFT_ADDRESS,
      abi: SkillNFT_ABI,
      functionName: "authEpoch",
      args: [BigInt(tokenId)],
    }),
    chainClient.readContract({
      address: SKILL_NFT_ADDRESS,
      abi: SkillNFT_ABI,
      functionName: "ownerOf",
      args: [BigInt(tokenId)],
    }),
    chainClient.readContract({
      address: SKILL_NFT_ADDRESS,
      abi: SkillNFT_ABI,
      functionName: "basePrice",
      args: [BigInt(tokenId)],
    }),
  ]);

  return {
    isAuthorized: isAuth.status === "fulfilled" ? (isAuth.value as boolean) : false,
    onChainEpoch: epoch.status === "fulfilled" ? Number(epoch.value as bigint) : 0,
    nftOwner:     owner.status === "fulfilled" ? (owner.value as string).toLowerCase() : null,
    basePrice:    price.status === "fulfilled" ? (price.value as bigint) : 0n,
  };
}

function computeStatus(
  isAuthorized: boolean,
  revokedAt: Date | null,
  storedEpoch: number | null,
  onChainEpoch: number,
  isPending: boolean
): AuthStatus {
  if (isPending)      return "pending";
  // authEpoch === -1 is a sentinel set by the creator update-content endpoint to
  // force re-authorization after new skill content is pushed (Task #88).
  if (storedEpoch === -1) return "needs_reauth";
  if (isAuthorized)   return "active";
  if (revokedAt)      return "revoked";
  // Not authorized + no explicit revoke → epoch must have reset
  return "needs_reauth";
}

// ---------------------------------------------------------------------------
// GET /api/curator/authorizations?wallet=0x...
// ---------------------------------------------------------------------------

router.get("/curator/authorizations", async (req, res) => {
  const rawWallet = req.query.wallet as string | undefined;
  if (!rawWallet || !/^0x[0-9a-fA-F]{40}$/.test(rawWallet)) {
    apiError(res, ErrorCode.INVALID_INPUT, "wallet query parameter must be a valid EVM address (0x...)");
    return;
  }
  const curatorWallet = rawWallet.toLowerCase();

  // ── 1. Skills already in curator_authorizations ──────────────────────────
  const authRows = await db
    .select({ auth: curatorAuthorizationsTable, skill: skillsTable })
    .from(curatorAuthorizationsTable)
    .innerJoin(
      skillsTable,
      and(
        eq(skillsTable.tokenId, curatorAuthorizationsTable.tokenId),
      )
    )
    .where(eq(curatorAuthorizationsTable.curatorWallet, curatorWallet));

  // ── 2. Bundles owned by this curator ─────────────────────────────────────
  const curatorBundles = await db
    .select({ bundleId: bundlesTable.bundleId })
    .from(bundlesTable)
    .where(eq(bundlesTable.ownerAddress, curatorWallet));

  const curatorBundleIds = curatorBundles.map((b) => b.bundleId);

  // ── 3. Skills in those bundles → build bundleId map ──────────────────────
  let bundleSkillRows: Array<{ skillId: string; tokenId: number | null; bundleId: string }> = [];
  if (curatorBundleIds.length > 0) {
    bundleSkillRows = (
      await db
        .select({
          skillId:  skillsTable.skillId,
          tokenId:  skillsTable.tokenId,
          bundleId: bundleSkillsTable.bundleId,
        })
        .from(bundleSkillsTable)
        .innerJoin(skillsTable, eq(bundleSkillsTable.skillId, skillsTable.skillId))
        .where(inArray(bundleSkillsTable.bundleId, curatorBundleIds))
    );
  }

  // Build a map: tokenId → bundleIds[]
  const tokenBundleMap = new Map<number, string[]>();
  for (const row of bundleSkillRows) {
    if (row.tokenId == null) continue;
    const existing = tokenBundleMap.get(row.tokenId) ?? [];
    if (!existing.includes(row.bundleId)) existing.push(row.bundleId);
    tokenBundleMap.set(row.tokenId, existing);
  }

  // ── 4. Skills in bundles but NOT in curator_authorizations (pending) ──────
  const authorizedTokenIds = new Set(authRows.map((r) => r.auth.tokenId));
  const pendingSkillIds = [...new Set(
    bundleSkillRows
      .filter((r) => r.tokenId != null && !authorizedTokenIds.has(r.tokenId!))
      .map((r) => r.skillId)
  )];

  let pendingSkillRows: typeof skillsTable.$inferSelect[] = [];
  if (pendingSkillIds.length > 0) {
    pendingSkillRows = await db
      .select()
      .from(skillsTable)
      .where(inArray(skillsTable.skillId, pendingSkillIds));
  }

  // ── 5. Collect all tokenIds that need on-chain reads ─────────────────────
  const allTokenIds = [
    ...authRows.map((r) => r.auth.tokenId),
    ...pendingSkillRows.filter((s) => s.tokenId != null).map((s) => s.tokenId!),
  ];

  // Deduplicate
  const uniqueTokenIds = [...new Set(allTokenIds)];

  // Batch on-chain reads in parallel
  const onChainMap = new Map<number, {
    isAuthorized: boolean;
    onChainEpoch: number;
    nftOwner:     string | null;
    basePrice:    bigint;
  }>();

  await Promise.all(
    uniqueTokenIds.map(async (tokenId) => {
      try {
        const data = await readOnChain(tokenId, curatorWallet);
        onChainMap.set(tokenId, data);
      } catch (err) {
        logger.warn({ err, tokenId }, "curator: on-chain read failed");
        onChainMap.set(tokenId, { isAuthorized: false, onChainEpoch: 0, nftOwner: null, basePrice: 0n });
      }
    })
  );

  // ── 6. Build response ─────────────────────────────────────────────────────
  const buildEntry = (
    skill: typeof skillsTable.$inferSelect,
    auth: typeof curatorAuthorizationsTable.$inferSelect | null,
    isPending: boolean
  ): AuthorizationEntry | null => {
    if (skill.tokenId == null) return null;
    const on = onChainMap.get(skill.tokenId);
    if (!on) return null;

    const meta     = (skill.meta as Record<string, unknown>) ?? {};
    const skillName = (meta.name as string) || skill.repoUrl.split("/").pop() || skill.skillId;
    const isClaimed = on.nftOwner !== null && on.nftOwner !== SKILL_NFT_ADDRESS.toLowerCase();

    return {
      tokenId:       skill.tokenId,
      skillId:       skill.skillId,
      skillName,
      repoUrl:       skill.repoUrl,
      ownerAddress:  skill.ownerAddress,
      nftOwner:      on.nftOwner,
      isClaimed,
      basePrice:     on.basePrice.toString(),
      authorizedAt:  auth?.authorizedAt?.toISOString() ?? null,
      revokedAt:     auth?.revokedAt?.toISOString() ?? null,
      storedEpoch:   auth?.authEpoch ?? null,
      onChainEpoch:  on.onChainEpoch,
      isAuthorized:  on.isAuthorized,
      status:        computeStatus(on.isAuthorized, auth?.revokedAt ?? null, auth?.authEpoch ?? null, on.onChainEpoch, isPending),
      contentVersion: skill.contentVersion,
      bundleIds:     tokenBundleMap.get(skill.tokenId) ?? [],
    };
  };

  const authorizations: AuthorizationEntry[] = [
    ...authRows.map((r) => buildEntry(r.skill, r.auth, false)),
    ...pendingSkillRows.map((s) => buildEntry(s, null, true)),
  ].filter((e): e is AuthorizationEntry => e !== null);

  // Sort: needs_reauth first, then active, then pending, then revoked
  const ORDER: Record<AuthStatus, number> = { needs_reauth: 0, active: 1, pending: 2, revoked: 3 };
  authorizations.sort((a, b) => ORDER[a.status] - ORDER[b.status]);

  res.json({ authorizations, curatorWallet });
});

// ---------------------------------------------------------------------------
// GET /api/curator/authorizations/:tokenId/status?wallet=0x...
// ---------------------------------------------------------------------------

router.get("/curator/authorizations/:tokenId/status", async (req, res) => {
  const rawWallet = req.query.wallet as string | undefined;
  const rawTokenId = req.params.tokenId;
  const tokenId = parseInt(rawTokenId, 10);

  if (!rawWallet || !/^0x[0-9a-fA-F]{40}$/.test(rawWallet)) {
    apiError(res, ErrorCode.INVALID_INPUT, "wallet query parameter is required");
    return;
  }
  if (!Number.isFinite(tokenId) || tokenId < 0) {
    apiError(res, ErrorCode.INVALID_INPUT, "tokenId must be a non-negative integer");
    return;
  }

  const curatorWallet = rawWallet.toLowerCase();

  const [authRow] = await db
    .select({ auth: curatorAuthorizationsTable, skill: skillsTable })
    .from(curatorAuthorizationsTable)
    .innerJoin(skillsTable, eq(skillsTable.tokenId, curatorAuthorizationsTable.tokenId))
    .where(
      and(
        eq(curatorAuthorizationsTable.tokenId, tokenId),
        eq(curatorAuthorizationsTable.curatorWallet, curatorWallet)
      )
    )
    .limit(1);

  // Skill must exist even if not yet authorized
  const [skillRow] = await db
    .select()
    .from(skillsTable)
    .where(eq(skillsTable.tokenId, tokenId))
    .limit(1);

  if (!skillRow) {
    apiError(res, ErrorCode.NOT_FOUND, `No skill found for tokenId=${tokenId}`);
    return;
  }

  let onChain = { isAuthorized: false, onChainEpoch: 0, nftOwner: null as string | null, basePrice: 0n };
  try {
    onChain = await readOnChain(tokenId, curatorWallet);
  } catch (err) {
    logger.warn({ err, tokenId }, "curator/status: on-chain read failed");
  }

  const auth   = authRow?.auth ?? null;
  const meta   = (skillRow.meta as Record<string, unknown>) ?? {};
  const isClaimed = onChain.nftOwner !== null && onChain.nftOwner !== SKILL_NFT_ADDRESS.toLowerCase();

  res.json({
    tokenId,
    skillId:      skillRow.skillId,
    skillName:    (meta.name as string) || skillRow.repoUrl,
    nftOwner:     onChain.nftOwner,
    isClaimed,
    basePrice:    onChain.basePrice.toString(),
    storedEpoch:  auth?.authEpoch ?? null,
    onChainEpoch: onChain.onChainEpoch,
    isAuthorized: onChain.isAuthorized,
    status:       computeStatus(onChain.isAuthorized, auth?.revokedAt ?? null, auth?.authEpoch ?? null, onChain.onChainEpoch, auth === null),
    authorizedAt: auth?.authorizedAt?.toISOString() ?? null,
    revokedAt:    auth?.revokedAt?.toISOString() ?? null,
  });
});

export default router;
