import { Router } from "express";
import { db } from "@workspace/db";
import { pendingClaimsTable, githubVerificationsTable } from "@workspace/db";
import { eq, desc, inArray, and } from "drizzle-orm";
import { generateId } from "../lib/id.js";
import { apiError, ErrorCode } from "../lib/errors.js";
import { authMiddleware } from "../middleware/auth.js";
import { getSkillOnChain } from "../services/chain.js";
import { logger } from "../lib/logger.js";

const PLATFORM_OWNER = process.env.DEPLOYER_ADDRESS?.toLowerCase();

const router = Router();

// POST /api/claims — submit a claim request
//
// Security model:
// - GitHub OAuth session proves the user controls the GitHub account.
// - EIP-712 wallet signature proves the user controls the destination wallet.
// - On-chain manifestOwner is read directly from the blockchain (not from the DB)
//   so it cannot be forged via any DB-level manipulation.
// - DB enforces at most one active (pending/approved) claim per tokenId via
//   unique constraint; concurrent duplicate requests are rejected atomically.
router.post("/claims", authMiddleware("submit-claim"), async (req, res) => {
  const githubUsername = req.session.githubUsername;
  if (!githubUsername) {
    apiError(res, ErrorCode.UNAUTHORIZED, "GitHub authentication required to submit a claim");
    return;
  }

  // walletAddress is recovered from the EIP-712 signature — not from the request body
  const walletAddress = req.walletAddress!;

  const { tokenId } = req.body as { tokenId?: number };
  if (tokenId === undefined || typeof tokenId !== "number" || !Number.isInteger(tokenId) || tokenId < 0) {
    apiError(res, ErrorCode.INVALID_INPUT, "tokenId must be a non-negative integer");
    return;
  }

  // ---- On-chain verification (source of truth) ----------------------------
  // Read manifestOwner directly from the blockchain. This cannot be forged
  // via any DB record manipulation since it is the immutable on-chain state.
  let onChainManifestOwner: string;
  try {
    const onChain = await getSkillOnChain(tokenId);
    onChainManifestOwner = String(onChain.manifestOwner);
  } catch {
    apiError(res, ErrorCode.RPC_ERROR, "Failed to read token data from chain");
    return;
  }

  if (!onChainManifestOwner) {
    apiError(res, ErrorCode.NOT_FOUND, "Token does not exist on-chain or has no manifestOwner");
    return;
  }

  // manifestOwner is "owner/repo" — github username is the part before "/"
  const repoOwner = onChainManifestOwner.split("/")[0];
  if (repoOwner.toLowerCase() !== githubUsername.toLowerCase()) {
    logger.warn({ tokenId, onChainManifestOwner, githubUsername }, "claim rejected: github user != repo owner");
    apiError(res, ErrorCode.FORBIDDEN, "Your GitHub account does not match the on-chain repository owner for this token");
    return;
  }

  // ---- Atomic insert/re-open with strict conflict protection ---------------
  // We run everything inside a transaction so that:
  //   - concurrent requests cannot both pass the active-claim check
  //   - if the unique constraint fires anyway (e.g. true concurrency), we
  //     catch it and return 409 instead of crashing
  let claim;
  try {
    claim = await db.transaction(async (tx) => {
      // Read the existing row (if any) with a row-level lock intent
      const [existing] = await tx
        .select()
        .from(pendingClaimsTable)
        .where(eq(pendingClaimsTable.tokenId, tokenId))
        .limit(1);

      if (existing) {
        if (existing.status === "pending" || existing.status === "approved") {
          // Active claim — refuse to overwrite regardless of who is asking
          return null;
        }
        // Rejected or completed — allow re-opening, but only if the row is
        // still in a terminal state (another concurrent request may have already
        // re-opened it, flipping it back to pending before this update runs).
        // The WHERE clause makes the update a no-op in that race, returning 0 rows.
        const [updated] = await tx
          .update(pendingClaimsTable)
          .set({ id: generateId("cl"), githubUsername, walletAddress, status: "pending", updatedAt: new Date() })
          .where(
            and(
              eq(pendingClaimsTable.tokenId, tokenId),
              // Only rejected claims may be re-submitted; completed = token
              // already transferred on-chain, so never re-open.
              inArray(pendingClaimsTable.status, ["rejected"])
            )
          )
          .returning();
        // If 0 rows matched, another request already re-opened — treat as conflict
        if (!updated) return null;
        return updated;
      }

      // No existing record — insert fresh
      const [inserted] = await tx
        .insert(pendingClaimsTable)
        .values({ id: generateId("cl"), tokenId, githubUsername, walletAddress })
        .returning();
      return inserted;
    });
  } catch (err: unknown) {
    // Unique constraint fired on truly concurrent insert — treat as conflict
    if (err instanceof Error && (err.message.includes("unique") || err.message.includes("duplicate"))) {
      apiError(res, ErrorCode.CONFLICT, "An active claim for this token already exists");
      return;
    }
    throw err;
  }

  if (!claim) {
    apiError(res, ErrorCode.CONFLICT, "An active or approved claim for this token already exists");
    return;
  }

  // Sync wallet address to github_verifications (outside the claim transaction)
  await db.insert(githubVerificationsTable).values({
    id:             generateId("gv"),
    githubUsername,
    evmAddress:     walletAddress,
  }).onConflictDoUpdate({
    target: githubVerificationsTable.githubUsername,
    set: { evmAddress: walletAddress, verifiedAt: new Date() },
  });

  logger.info({ claimId: claim.id, tokenId, githubUsername, walletAddress }, "claim submitted");
  res.status(201).json({ claim });
});

// GET /api/claims/pending — list pending claims (platform owner only)
router.get("/claims/pending", authMiddleware("admin:list-claims"), async (req, res) => {
  if (!PLATFORM_OWNER || req.walletAddress?.toLowerCase() !== PLATFORM_OWNER) {
    apiError(res, ErrorCode.FORBIDDEN, "Platform owner access required");
    return;
  }

  const claims = await db
    .select()
    .from(pendingClaimsTable)
    .where(eq(pendingClaimsTable.status, "pending"))
    .orderBy(desc(pendingClaimsTable.createdAt));

  res.json({ claims });
});

// PATCH /api/claims/:id — approve or reject a pending claim (platform owner only)
//
// Allowed transitions (enforced at DB level so concurrent mutations are safe):
//   pending  → approved | rejected
//   approved → rejected  (e.g. if oracle update hasn't happened yet)
//   completed is immutable — the token has already transferred on-chain.
router.patch("/claims/:id", authMiddleware("admin:update-claim"), async (req, res) => {
  if (!PLATFORM_OWNER || req.walletAddress?.toLowerCase() !== PLATFORM_OWNER) {
    apiError(res, ErrorCode.FORBIDDEN, "Platform owner access required");
    return;
  }

  const claimId = req.params.id as string;
  const { status } = req.body as { status?: "approved" | "rejected" };
  if (!status || !["approved", "rejected"].includes(status)) {
    apiError(res, ErrorCode.INVALID_INPUT, "status must be 'approved' or 'rejected'");
    return;
  }

  // The WHERE clause enforces the transition matrix atomically:
  // only rows that are NOT yet completed can be updated.
  // If 0 rows are updated, either the claim does not exist or it is completed.
  const [updated] = await db
    .update(pendingClaimsTable)
    .set({ status, updatedAt: new Date() })
    .where(
      and(
        eq(pendingClaimsTable.id, claimId),
        // completed is immutable — block any transition out of it
        inArray(pendingClaimsTable.status, ["pending", "approved"])
      )
    )
    .returning();

  if (!updated) {
    // Distinguish "not found" from "completed (immutable)"
    const [existing] = await db
      .select({ status: pendingClaimsTable.status })
      .from(pendingClaimsTable)
      .where(eq(pendingClaimsTable.id, claimId))
      .limit(1);

    if (!existing) {
      apiError(res, ErrorCode.NOT_FOUND, "Claim not found");
    } else {
      apiError(res, ErrorCode.CONFLICT, `Claim is '${existing.status}' and cannot be updated`);
    }
    return;
  }

  logger.info({ claimId, status }, "claim status updated");
  res.json({ claim: updated });
});

export default router;
