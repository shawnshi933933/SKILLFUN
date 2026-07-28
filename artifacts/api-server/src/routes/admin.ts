import { Router } from "express";
import { db } from "@workspace/db";
import { pendingClaimsTable, skillsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { apiError, ErrorCode } from "../lib/errors.js";
import { authMiddleware } from "../middleware/auth.js";
import { getOnChainOwner } from "../services/chain.js";
import { invalidatePrefix, cacheKey } from "../services/cache.js";
import { logger } from "../lib/logger.js";

const PLATFORM_OWNER = process.env.DEPLOYER_ADDRESS?.toLowerCase();

const router = Router();

/**
 * POST /api/admin/claims/:id/complete
 *
 * Trusted admin action: verify on-chain that the token has been transferred
 * to the claimant's wallet, then mark the DB claim as `completed`.
 *
 * Security: requires platform owner EIP-712 signature. Does NOT advance
 * the claim on the user's behalf — it only records what already happened
 * on-chain. The oracle workflow must have already called
 * SkillFunOracle.setVerifiedClaims() and the user must have called
 * SkillNFT.claim() before this endpoint will succeed.
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

    // Load the claim
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
      apiError(
        res,
        ErrorCode.INVALID_INPUT,
        `Claim must be in 'approved' status to complete (current: '${claim.status}')`
      );
      return;
    }

    // ---- On-chain verification -------------------------------------------
    // Confirm the token's ERC-721 owner is now the claimant's wallet.
    // This is the authoritative source of truth; we never mark completed
    // based on DB state alone.
    const onChainOwner = await getOnChainOwner(claim.tokenId).catch(() => null);
    if (!onChainOwner) {
      apiError(res, ErrorCode.RPC_ERROR, "Failed to read on-chain owner");
      return;
    }

    if (onChainOwner.toLowerCase() !== claim.walletAddress.toLowerCase()) {
      apiError(
        res,
        ErrorCode.FORBIDDEN,
        `On-chain token owner (${onChainOwner}) does not match claim wallet (${claim.walletAddress}). ` +
          "The user must call SkillNFT.claim() on-chain before this endpoint can complete the claim."
      );
      return;
    }

    // ---- Mark completed (atomically, only if still approved) ----------------
    const [updated] = await db
      .update(pendingClaimsTable)
      .set({ status: "completed", updatedAt: new Date() })
      .where(
        and(
          eq(pendingClaimsTable.id, claimId),
          eq(pendingClaimsTable.status, "approved") // guard against concurrent state changes
        )
      )
      .returning();

    if (!updated) {
      apiError(res, ErrorCode.CONFLICT, "Claim status changed concurrently; please retry");
      return;
    }

    // Update the skill's mintStatus to 'claimed' in the DB
    await db
      .update(skillsTable)
      .set({ mintStatus: "claimed", ownerAddress: claim.walletAddress, updatedAt: new Date() })
      .where(eq(skillsTable.tokenId, claim.tokenId));

    // Invalidate the chain cache for this token so future reads reflect new owner
    invalidatePrefix(cacheKey(16661, "getSkillOnChain", claim.tokenId));
    invalidatePrefix(cacheKey(16661, "getOnChainOwner", claim.tokenId));

    logger.info(
      { claimId, tokenId: claim.tokenId, walletAddress: claim.walletAddress },
      "claim completed — on-chain transfer confirmed"
    );

    res.json({ claim: updated });
  }
);

export default router;
