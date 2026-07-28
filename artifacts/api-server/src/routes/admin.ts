import { Router } from "express";
import { db } from "@workspace/db";
import { pendingClaimsTable, skillsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { apiError, ErrorCode } from "../lib/errors.js";
import { authMiddleware } from "../middleware/auth.js";
import { getOnChainOwner, mintSkillOnChain } from "../services/chain.js";
import { uploadSkillManifest } from "../services/storage.js";
import { invalidatePrefix, cacheKey } from "../services/cache.js";
import { logger } from "../lib/logger.js";

const PLATFORM_OWNER = process.env.DEPLOYER_ADDRESS?.toLowerCase();

const router = Router();

/**
 * POST /api/admin/claims/:id/complete
 *
 * Trusted admin action: verify on-chain that the token has been transferred
 * to the claimant's wallet, then mark the DB claim as `completed`.
 */
router.post(
  "/admin/claims/:id/complete",
  authMiddleware("admin:complete-claim"),
  async (req, res) => {
    if (!PLATFORM_OWNER || req.walletAddress?.toLowerCase() !== PLATFORM_OWNER) {
      apiError(res, ErrorCode.FORBIDDEN, "Platform owner access required");
      return;
    }

    const claimId = req.params.id as string;

    const [claim] = await db
      .select()
      .from(pendingClaimsTable)
      .where(eq(pendingClaimsTable.id, claimId))
      .limit(1);

    if (!claim) {
      apiError(res, ErrorCode.NOT_FOUND, "Claim not found");
      return;
    }

    if (claim.status !== "approved") {
      apiError(res, ErrorCode.INVALID_INPUT, `Claim must be in 'approved' status (current: '${claim.status}')`);
      return;
    }

    const onChainOwner = await getOnChainOwner(claim.tokenId).catch(() => null);
    if (!onChainOwner) {
      apiError(res, ErrorCode.RPC_ERROR, "Failed to read on-chain owner");
      return;
    }

    if (onChainOwner.toLowerCase() !== claim.walletAddress.toLowerCase()) {
      apiError(
        res, ErrorCode.FORBIDDEN,
        `On-chain token owner (${onChainOwner}) does not match claim wallet (${claim.walletAddress}).`
      );
      return;
    }

    const [updated] = await db
      .update(pendingClaimsTable)
      .set({ status: "completed", updatedAt: new Date() })
      .where(
        and(
          eq(pendingClaimsTable.id, claimId),
          eq(pendingClaimsTable.status, "approved")
        )
      )
      .returning();

    if (!updated) {
      apiError(res, ErrorCode.CONFLICT, "Claim status changed concurrently; please retry");
      return;
    }

    await db
      .update(skillsTable)
      .set({ mintStatus: "claimed", ownerAddress: claim.walletAddress, updatedAt: new Date() })
      .where(eq(skillsTable.tokenId, claim.tokenId));

    invalidatePrefix(cacheKey(16661, "getSkillOnChain", claim.tokenId));
    invalidatePrefix(cacheKey(16661, "getOnChainOwner", claim.tokenId));

    logger.info({ claimId, tokenId: claim.tokenId, walletAddress: claim.walletAddress }, "claim completed");
    res.json({ claim: updated });
  }
);

/**
 * POST /api/admin/skills/:id/mint
 *
 * Uploads the skill manifest to 0G Storage, then calls SkillNFT.registerSkill()
 * on-chain using the deployer wallet. Updates the DB with tokenId + skillUri + rootHash.
 *
 * Security: requires platform-owner EIP-712 signature (admin:mint-skill).
 *
 * Body (optional overrides):
 *   { name?, description?, category?, basePrice?, version?, capabilities? }
 */
router.post(
  "/admin/skills/:id/mint",
  authMiddleware("admin:mint-skill"),
  async (req, res) => {
    if (!PLATFORM_OWNER || req.walletAddress?.toLowerCase() !== PLATFORM_OWNER) {
      apiError(res, ErrorCode.FORBIDDEN, "Platform owner access required");
      return;
    }

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

    if (skill.mintStatus === "minted" || skill.mintStatus === "claimed") {
      apiError(res, ErrorCode.CONFLICT, `Skill is already in '${skill.mintStatus}' state`);
      return;
    }

    // Mark as 'minting' to prevent double-mint races
    const [locked] = await db
      .update(skillsTable)
      .set({ mintStatus: "minting", updatedAt: new Date() })
      .where(and(
        eq(skillsTable.skillId, skillId),
        eq(skillsTable.mintStatus, "pending")  // only advance from pending
      ))
      .returning();

    // If another request already moved it to 'minting', that's fine — continue;
    // if it was already 'minted'/'claimed' the check above would have caught it.
    if (!locked && skill.mintStatus !== "minting") {
      apiError(res, ErrorCode.CONFLICT, "Skill state changed concurrently; retry");
      return;
    }

    // ── Build manifest ────────────────────────────────────────────────────
    const meta = (skill.meta ?? {}) as Record<string, unknown>;
    const overrides = req.body as Record<string, unknown>;
    const manifest: Record<string, unknown> = {
      skillId:       skill.skillId,
      repoUrl:       skill.repoUrl,
      manifestOwner: skill.manifestOwner,
      name:          overrides.name          ?? meta.name          ?? skill.repoUrl.split("/").pop(),
      description:   overrides.description   ?? meta.description   ?? "",
      category:      overrides.category      ?? meta.category      ?? "Code",
      version:       overrides.version       ?? meta.version       ?? "1.0.0",
      basePrice:     overrides.basePrice     ?? meta.basePrice     ?? 0,
      capabilities:  overrides.capabilities  ?? meta.capabilities  ?? [],
      mintedAt:      new Date().toISOString(),
      chainId:       16661,
    };

    // ── Upload to 0G Storage ──────────────────────────────────────────────
    let uploadResult;
    try {
      uploadResult = await uploadSkillManifest(manifest);
    } catch (err) {
      // Roll back minting lock
      await db
        .update(skillsTable)
        .set({ mintStatus: "pending", updatedAt: new Date() })
        .where(eq(skillsTable.skillId, skillId));
      logger.error({ err, skillId }, "storage upload failed");
      apiError(res, ErrorCode.RPC_ERROR, "Failed to upload manifest to 0G Storage");
      return;
    }

    // ── On-chain mint ─────────────────────────────────────────────────────
    let tokenId: number;
    try {
      const result = await mintSkillOnChain(
        skill.manifestOwner,
        uploadResult.skillUri,
        uploadResult.rootHash
      );
      tokenId = result.tokenId;
      logger.info({ skillId, tokenId, txHash: result.txHash, uploaded: uploadResult.uploaded }, "skill minted on-chain");
    } catch (err) {
      // Roll back minting lock
      await db
        .update(skillsTable)
        .set({ mintStatus: "pending", updatedAt: new Date() })
        .where(eq(skillsTable.skillId, skillId));
      logger.error({ err, skillId }, "on-chain mint failed");
      apiError(res, ErrorCode.RPC_ERROR, `On-chain registerSkill failed: ${(err as Error).message}`);
      return;
    }

    // ── Update DB ─────────────────────────────────────────────────────────
    const [updated] = await db
      .update(skillsTable)
      .set({
        mintStatus: "minted",
        tokenId,
        skillUri:  uploadResult.skillUri,
        rootHash:  uploadResult.rootHash,
        meta:      { ...meta, ...manifest } as Record<string, unknown>,
        updatedAt: new Date(),
      })
      .where(eq(skillsTable.skillId, skillId))
      .returning();

    // Invalidate any cached on-chain data for this tokenId
    invalidatePrefix(cacheKey(16661, "getSkillOnChain", tokenId));

    res.json({
      skill: updated,
      storage: { uploaded: uploadResult.uploaded, rootHash: uploadResult.rootHash },
    });
  }
);

/**
 * GET /api/admin/skills
 * List all skills (any status) — admin view for the mint dashboard.
 */
router.get(
  "/admin/skills",
  authMiddleware("admin:list-skills"),
  async (req, res) => {
    if (!PLATFORM_OWNER || req.walletAddress?.toLowerCase() !== PLATFORM_OWNER) {
      apiError(res, ErrorCode.FORBIDDEN, "Platform owner access required");
      return;
    }

    const skills = await db.select().from(skillsTable).orderBy(skillsTable.createdAt);
    res.json({ skills });
  }
);

export default router;
