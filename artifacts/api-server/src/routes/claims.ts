import { Router } from "express";
import { db } from "@workspace/db";
import { pendingClaimsTable, githubVerificationsTable, skillsTable } from "@workspace/db";
import { eq, desc, inArray, and } from "drizzle-orm";
import { generateId } from "../lib/id.js";
import { apiError, ErrorCode } from "../lib/errors.js";
import { authMiddleware } from "../middleware/auth.js";
import { getSkillOnChain, writeOracleVerification } from "../services/chain.js";
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
  const [existing] = await db
    .select()
    .from(pendingClaimsTable)
    .where(eq(pendingClaimsTable.id, claimId))
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

// GET /api/claims/mine — list current user's own claims (GitHub session)
router.get("/claims/mine", async (req, res) => {
  const githubUsername = req.session.githubUsername;
  if (!githubUsername) {
    res.json({ claims: [] });
    return;
  }
  const claims = await db
    .select()
    .from(pendingClaimsTable)
    .where(inArray(pendingClaimsTable.status, ["pending", "approved"]))
    .orderBy(desc(pendingClaimsTable.createdAt));
  res.json({ claims });
});

// GET /api/claims/pending — list pending AND approved-but-not-yet-completed claims (platform owner only)
//
// Returning both statuses ensures the admin sees approved claims that still need
// an Oracle write even after a page refresh — they are not "lost" between sessions.
router.get("/claims/pending", authMiddleware("admin:list-claims"), async (req, res) => {
  if (!PLATFORM_OWNER || req.walletAddress?.toLowerCase() !== PLATFORM_OWNER) {
    apiError(res, ErrorCode.FORBIDDEN, "Platform owner access required");
    return;
  }

  const claims = await db
    .select()
    .from(pendingClaimsTable)
    .where(inArray(pendingClaimsTable.status, ["pending", "approved"]))
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
    .select()
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

// GET /api/admin/config — returns platform config visible to the admin UI
router.get("/admin/config", (_req, res) => {
  res.json({ deployerAddress: (process.env.DEPLOYER_ADDRESS ?? "").toLowerCase() });
});

// POST /api/claims/:id/write-oracle — write Oracle verification using the deployer key (server-side)
router.post("/claims/:id/write-oracle", authMiddleware("admin:update-claim"), async (req, res) => {
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
    apiError(res, ErrorCode.CONFLICT, `Claim must be 'approved' to write Oracle; current status is '${claim.status}'`);
    return;
  }
  if (!claim.walletAddress) {
    apiError(res, ErrorCode.CONFLICT, "Claim has no wallet address set");
    return;
  }

  try {
  const { txHash } = req.body as { txHash?: string };
    logger.info({ claimId, txHash, tokenId: claim.tokenId }, "Oracle written via backend");
    res.json({ txHash });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Oracle write failed";
    logger.error({ claimId, err }, "Oracle write failed");
    apiError(res, ErrorCode.INTERNAL, msg);
  }
});

// POST /api/claims/:id/complete — creator calls this after the on-chain claim() succeeds
//
// Security model:
// - EIP-712 wallet signature proves the caller controls the wallet.
// - The wallet must match the walletAddress recorded on the claim (set when the claim
//   was submitted), so only the intended recipient can mark it completed.
// - completed is a terminal state — the endpoint is idempotent for the same txHash.
router.post("/claims/:id/complete", authMiddleware("complete-claim"), async (req, res) => {
  const callerWallet = req.walletAddress!;
  const claimId = req.params.id as string;
  const { txHash } = req.body as { txHash?: string };

  if (!txHash || typeof txHash !== "string" || !txHash.startsWith("0x")) {
    apiError(res, ErrorCode.INVALID_INPUT, "txHash is required and must be a 0x-prefixed hex string");
    return;
  }

  // Fetch the claim and verify ownership before mutating
  const [existing] = await db
    .select()
    .from(pendingClaimsTable)
    .where(eq(pendingClaimsTable.id, claimId))
    .limit(1);

  if (!existing) {
    apiError(res, ErrorCode.NOT_FOUND, "Claim not found");
    return;
  }

  if (existing.walletAddress.toLowerCase() !== callerWallet.toLowerCase()) {
    apiError(res, ErrorCode.FORBIDDEN, "Only the claimant wallet can mark a claim complete");
    return;
  }

  if (existing.status === "completed") {
    // Idempotent — already done, return the existing record
    res.json({ claim: existing });
    return;
  }

  if (existing.status !== "approved") {
    apiError(res, ErrorCode.CONFLICT, `Claim must be 'approved' to complete; current status is '${existing.status}'`);
    return;
  }

  const updated = await db.transaction(async (tx) => {
    const [claim] = await tx
      .update(pendingClaimsTable)
      .set({ status: "completed", txHash, updatedAt: new Date() })
      .where(
        and(
          eq(pendingClaimsTable.id, claimId),
          eq(pendingClaimsTable.status, "approved")
        )
      )
      .returning();

    if (!claim) return null;

    // Also mark the NFT as claimed in the skills table so it no longer shows
    // as claimable to the frontend.
    await tx
      .update(skillsTable)
      .set({ mintStatus: "claimed", ownerAddress: callerWallet.toLowerCase(), updatedAt: new Date() })
      .where(eq(skillsTable.tokenId, existing.tokenId));

    return claim;
  });

  if (!updated) {
    apiError(res, ErrorCode.CONFLICT, "Claim status changed concurrently; please refresh and retry");
    return;
  }

  logger.info({ claimId, txHash, walletAddress: callerWallet }, "claim completed on-chain");
  res.json({ claim: updated });
});

export default router;
