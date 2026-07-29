import { Router } from "express";
import { db } from "@workspace/db";
import { skillsTable } from "@workspace/db";
import { eq, desc, and, SQL } from "drizzle-orm";
import { generateId } from "../lib/id.js";
import { apiError, ErrorCode } from "../lib/errors.js";
import { authMiddleware, verifyWalletSignature } from "../middleware/auth.js";
import { getSkillOnChain, mintSkillOnChain, getOnChainOwner } from "../services/chain.js";
import { uploadSkillManifest } from "../services/storage.js";
import { invalidatePrefix, cacheKey } from "../services/cache.js";
import { getAddresses } from "@workspace/abi";
import { logger } from "../lib/logger.js";

const SKILL_NFT_ADDRESS = getAddresses(16661).SkillNFT.toLowerCase();

const router = Router();

// GET /api/skills
router.get("/skills", async (req, res) => {
  const { status, owner, repo } = req.query as Record<string, string | undefined>;

  const conditions: SQL[] = [];
  if (status) conditions.push(eq(skillsTable.mintStatus, status as "pending" | "minting" | "minted" | "claimed"));
  if (owner) conditions.push(eq(skillsTable.ownerAddress, owner.toLowerCase()));
  if (repo)  conditions.push(eq(skillsTable.repoUrl, repo));

  const skills = await db
    .select()
    .from(skillsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(skillsTable.createdAt))
    .limit(100);

  res.json({ skills });
});

// GET /api/skills/:id
router.get("/skills/:id", async (req, res) => {
  const skillId = req.params.id as string;
  const [skill] = await db
    .select()
    .from(skillsTable)
    .where(eq(skillsTable.skillId, skillId))
    .limit(1);

  if (!skill) {
    apiError(res, ErrorCode.NOT_FOUND, "Skill not found");
    return;
  }

  let onChain = null;
  if (skill.tokenId !== null) {
    try {
      onChain = await getSkillOnChain(skill.tokenId);
    } catch {
      logger.warn({ skillId: skill.skillId, tokenId: skill.tokenId }, "failed to fetch on-chain data");
    }
  }

  res.json({ skill, onChain });
});

/**
 * POST /api/skills
 *
 * Community mint intake: anyone may submit a skill for review.
 * Unauthenticated — the submission is just a DB record in "pending" status.
 * The security boundary is at admin approval + on-chain mint, not here.
 *
 * If a valid X-Wallet-Signature is present we record that address as owner;
 * otherwise ownerAddress comes from the optional body field.
 *
 * Server-controlled fields (tokenId, mintStatus, reviewStatus, manifestOwner)
 * are never settable by the caller.
 */
router.post("/skills", async (req, res) => {
  // Optional wallet auth — attach wallet address if signature is present
  const sigHeader = req.headers["x-wallet-signature"] as string | undefined;
  let callerAddress: string | null = null;
  if (sigHeader) {
    try {
      const { verifyWalletSignature } = await import("../middleware/auth.js");
      callerAddress = await verifyWalletSignature(sigHeader, "register-skill");
    } catch {
      // Signature present but invalid → reject (prevent spoofing ownerAddress)
      apiError(res, ErrorCode.UNAUTHORIZED, "Invalid wallet signature");
      return;
    }
  }

  const { repoUrl, manifestOwner, ownerAddress: bodyAddress, meta } = req.body as {
    repoUrl?:       string;
    manifestOwner?: string;
    ownerAddress?:  string;
    meta?:          Record<string, unknown>;
  };

  if (!repoUrl) {
    apiError(res, ErrorCode.INVALID_INPUT, "repoUrl is required");
    return;
  }

  // manifestOwner defaults to repoUrl for community mint
  const resolvedManifestOwner = (manifestOwner ?? repoUrl).trim();
  // Wallet address: authenticated sig > explicit body field > null
  const resolvedOwner = callerAddress ?? (bodyAddress?.toLowerCase() ?? null);

  const skillId = generateId("sk");
  const [skill] = await db
    .insert(skillsTable)
    .values({
      skillId,
      repoUrl:       repoUrl.trim(),
      skillUri:      null,
      rootHash:      null,
      manifestOwner: resolvedManifestOwner,
      ownerAddress:  resolvedOwner,
      meta:          meta ?? {},
    })
    .returning();

  logger.info({ skillId, repoUrl, owner: resolvedOwner }, "skill registered (pending review)");
  res.status(201).json({ skill });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/skills/prepare-mint
//
// Step 1 of self-mint: any connected wallet can call this.
// Validates EIP-712 sig, uploads manifest to 0G Storage, creates a DB record
// in "pending" status, and returns the parameters the frontend needs to call
// SkillNFT.registerSkill() directly from the user's wallet.
//
// The caller decides the `to` address:
//   • Their own wallet  → "My Repo"  (NFT goes to them)
//   • SkillNFT contract → "Not My Repo" (platform custody until GitHub claim)
// ─────────────────────────────────────────────────────────────────────────────
router.post("/skills/prepare-mint", async (req, res) => {
  const sigHeader = req.headers["x-wallet-signature"] as string | undefined;
  if (!sigHeader) {
    apiError(res, ErrorCode.UNAUTHORIZED, "Missing X-Wallet-Signature header");
    return;
  }

  let callerAddress: string;
  try {
    callerAddress = await verifyWalletSignature(sigHeader, "user:prepare-mint");
  } catch (err) {
    apiError(res, ErrorCode.UNAUTHORIZED, (err as Error).message);
    return;
  }

  const { repoUrl, ownerMode, meta, skillFileContent, fileType } = req.body as {
    repoUrl:           string;
    ownerMode:         "mine" | "community";
    meta?:             Record<string, unknown>;
    /** Raw file content fetched from GitHub (skill.md / skillfun.json) */
    skillFileContent?: string;
    /** "skillfun.json" | "skill.md" | "README.md" */
    fileType?:         string;
  };

  if (!repoUrl?.trim()) {
    apiError(res, ErrorCode.INVALID_INPUT, "repoUrl is required");
    return;
  }
  if (ownerMode !== "mine" && ownerMode !== "community") {
    apiError(res, ErrorCode.INVALID_INPUT, "ownerMode must be 'mine' or 'community'");
    return;
  }

  const skillId          = generateId("sk");
  const resolvedMeta     = meta ?? {};
  const resolvedOwner    = ownerMode === "mine" ? callerAddress : callerAddress; // always record submitter
  const manifestOwnerVal = (repoUrl as string).trim();

  // Build manifest envelope for 0G Storage
  const manifest: Record<string, unknown> = {
    skillId,
    repoUrl:       manifestOwnerVal,
    manifestOwner: manifestOwnerVal,
    ownerMode,
    submittedBy:   callerAddress,
    ...resolvedMeta,
    ...(fileType ? { sourceFile: fileType } : {}),
    mintedAt:  new Date().toISOString(),
    chainId:   16661,
  };

  // Upload to 0G Storage (falls back to keccak256 if unavailable).
  // When skillFileContent is provided (fetched from GitHub) that real file
  // is what gets stored — the rootHash anchors the actual skill definition.
  let uploadResult: { rootHash: string; skillUri: string; uploaded: boolean };
  try {
    uploadResult = await uploadSkillManifest(manifest, skillFileContent ?? undefined);
  } catch (err) {
    logger.error({ err, skillId }, "0G Storage upload failed in prepare-mint");
    apiError(res, ErrorCode.RPC_ERROR, "Failed to upload manifest");
    return;
  }

  // Create DB record (pending — confirmed after user's tx lands)
  const [skill] = await db
    .insert(skillsTable)
    .values({
      skillId,
      repoUrl:       manifestOwnerVal,
      skillUri:      uploadResult.skillUri,
      rootHash:      uploadResult.rootHash,
      manifestOwner: manifestOwnerVal,
      ownerAddress:  resolvedOwner,
      meta:          { ...resolvedMeta, ownerMode } as Record<string, unknown>,
    })
    .returning();

  logger.info({ skillId, repoUrl, ownerMode, caller: callerAddress }, "prepare-mint: manifest ready");

  res.status(201).json({
    skillId,
    rootHash:         uploadResult.rootHash,
    skillUri:         uploadResult.skillUri,
    manifestOwner:    manifestOwnerVal,
    skillNFTAddress:  SKILL_NFT_ADDRESS,
    w0gAddress:       "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c",
    storage:          { uploaded: uploadResult.uploaded },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/skills/:id/confirm-mint
//
// Step 2 of self-mint: called after the user's registerSkill() tx is confirmed.
// Validates EIP-712 sig, reads on-chain tokenId owner, updates DB to minted.
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/skills/:id/confirm-mint", async (req, res) => {
  const sigHeader = req.headers["x-wallet-signature"] as string | undefined;
  if (!sigHeader) {
    apiError(res, ErrorCode.UNAUTHORIZED, "Missing X-Wallet-Signature header");
    return;
  }

  let callerAddress: string;
  try {
    callerAddress = await verifyWalletSignature(sigHeader, "user:confirm-mint");
  } catch (err) {
    apiError(res, ErrorCode.UNAUTHORIZED, (err as Error).message);
    return;
  }

  const skillId = req.params.id as string;
  const { tokenId, txHash } = req.body as { tokenId: number; txHash: string };

  if (tokenId == null || !Number.isFinite(tokenId) || !txHash) {
    apiError(res, ErrorCode.INVALID_INPUT, "tokenId and txHash are required");
    return;
  }

  const [skill] = await db
    .select()
    .from(skillsTable)
    .where(eq(skillsTable.skillId, skillId))
    .limit(1);

  if (!skill) {
    apiError(res, ErrorCode.NOT_FOUND, "Skill not found");
    return;
  }
  if (skill.mintStatus === "minted" || skill.mintStatus === "claimed") {
    apiError(res, ErrorCode.CONFLICT, `Skill already in '${skill.mintStatus}' state`);
    return;
  }

  // Verify the caller actually submitted this skill
  if (skill.ownerAddress?.toLowerCase() !== callerAddress.toLowerCase()) {
    apiError(res, ErrorCode.FORBIDDEN, "Not the skill submitter");
    return;
  }

  // Read on-chain owner to confirm the tx landed
  const onChainOwner = await getOnChainOwner(tokenId).catch(() => null);
  if (!onChainOwner) {
    apiError(res, ErrorCode.RPC_ERROR, "Token not found on-chain — tx may still be pending");
    return;
  }

  // Determine the final ownerAddress for this skill:
  // "mine" → user's address; "community" → platform (SkillNFT contract)
  const ownerMode = (skill.meta as Record<string, unknown>)?.ownerMode as string | undefined;
  const finalOwner = ownerMode === "mine" ? callerAddress : SKILL_NFT_ADDRESS;

  const [updated] = await db
    .update(skillsTable)
    .set({
      mintStatus:   "minted",
      tokenId,
      ownerAddress: finalOwner,
      meta: {
        ...(skill.meta as Record<string, unknown>),
        txHash,
        mintedAt: new Date().toISOString(),
      },
      updatedAt: new Date(),
    })
    .where(eq(skillsTable.skillId, skillId))
    .returning();

  invalidatePrefix(cacheKey(16661, "getSkillOnChain", tokenId));
  logger.info({ skillId, tokenId, txHash, ownerMode, finalOwner }, "confirm-mint: skill minted");

  res.json({ skill: updated, onChainOwner });
});

// PATCH /api/skills/:id — update user-editable metadata (owner only)
// NOTE: tokenId, mintStatus, reviewStatus, and manifestOwner are intentionally excluded.
// Those fields are server-controlled by the trusted mint/indexing workflow only.
router.patch("/skills/:id", authMiddleware("update-skill"), async (req, res) => {
  const skillId = req.params.id as string;
  const [existing] = await db
    .select()
    .from(skillsTable)
    .where(eq(skillsTable.skillId, skillId))
    .limit(1);

  if (!existing) {
    apiError(res, ErrorCode.NOT_FOUND, "Skill not found");
    return;
  }
  if (existing.ownerAddress?.toLowerCase() !== req.walletAddress?.toLowerCase()) {
    apiError(res, ErrorCode.FORBIDDEN, "Not the skill owner");
    return;
  }

  // Only user-editable fields; server-controlled fields (tokenId, mintStatus,
  // reviewStatus, manifestOwner) cannot be updated through this endpoint.
  const { skillUri, rootHash, meta } = req.body as {
    skillUri?: string;
    rootHash?: string;
    meta?: Record<string, unknown>;
  };

  const [updated] = await db
    .update(skillsTable)
    .set({
      ...(skillUri !== undefined && { skillUri }),
      ...(rootHash !== undefined && { rootHash }),
      ...(meta     !== undefined && { meta }),
      updatedAt: new Date(),
    })
    .where(eq(skillsTable.skillId, skillId))
    .returning();

  res.json({ skill: updated });
});

export default router;
