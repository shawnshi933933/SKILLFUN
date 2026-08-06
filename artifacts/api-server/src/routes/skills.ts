import crypto from "node:crypto";
import { Router } from "express";
import { db } from "@workspace/db";
import { skillsTable, paymentProofsTable, curatorAuthorizationsTable, bundleSkillsTable, skillContentCacheTable, invocationLogsTable } from "@workspace/db";
import { analyzeSkillContent } from "../services/ai.js";
import { eq, desc, and, SQL, count, isNull, getTableColumns, sql, inArray } from "drizzle-orm";
import { generateId } from "../lib/id.js";
import { apiError, ErrorCode } from "../lib/errors.js";
import { authMiddleware, verifyWalletSignature } from "../middleware/auth.js";
import { getSkillOnChain, mintSkillOnChain, getOnChainOwner, getOnChainBasePrice } from "../services/chain.js";
import { uploadSkillManifest, downloadSkillContent, verifyFileOnNode } from "../services/storage.js";
import { invalidatePrefix, cacheKey } from "../services/cache.js";
import { getAddresses } from "@workspace/abi";
import { logger } from "../lib/logger.js";

const SKILL_NFT_ADDRESS = getAddresses(16661).SkillNFT.toLowerCase();

const router = Router();

// ── GitHub stars in-memory cache (1 hour TTL) ─────────────────────────────
const githubStarsCache = new Map<string, { stars: number; fetchedAt: number }>();
const GITHUB_CACHE_TTL = 60 * 60 * 1000;

/** Extract "owner/repo" from any repoUrl variant:
 *  - "owner/repo"
 *  - "owner/repo/subpath/..."    (monorepo skill)
 *  - "https://github.com/owner/repo"
 *  - "https://github.com/owner/repo/tree/main/skills/foo"
 */
function extractOwnerRepo(repoUrl: string): string | null {
  // Strip protocol + github.com prefix if present
  const stripped = repoUrl
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/^github\.com\//, "");
  const parts = stripped.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  return `${parts[0]}/${parts[1]}`;
}

async function fetchGithubStars(repoUrl: string): Promise<number> {
  const ownerRepo = extractOwnerRepo(repoUrl);
  if (!ownerRepo) return 0;

  const cached = githubStarsCache.get(ownerRepo);
  if (cached && Date.now() - cached.fetchedAt < GITHUB_CACHE_TTL) return cached.stars;

  try {
    const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
    // Use OAuth client credentials for higher rate limit (5000 req/hr vs 60)
    const clientId     = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (clientId && clientSecret) {
      headers["Authorization"] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
    }

    const res = await fetch(`https://api.github.com/repos/${ownerRepo}`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return cached?.stars ?? 0;
    const data = await res.json() as { stargazers_count?: number };
    const stars = data.stargazers_count ?? 0;
    githubStarsCache.set(ownerRepo, { stars, fetchedAt: Date.now() });
    return stars;
  } catch {
    return cached?.stars ?? 0;
  }
}

// GET /api/skills
// Query params: status, owner, repo, tag (filter by tag in meta.tags JSONB array)
router.get("/skills", async (req, res) => {
  const { status, owner, repo, tag } = req.query as Record<string, string | undefined>;

  const conditions: SQL[] = [];
  if (status) conditions.push(eq(skillsTable.mintStatus, status as "pending" | "minting" | "minted" | "claimed"));
  if (owner) conditions.push(eq(skillsTable.ownerAddress, owner.toLowerCase()));
  if (repo)  conditions.push(sql`lower(rtrim(${skillsTable.repoUrl}, '/')) = lower(${repo.replace(/\/+$/, "")})`);
  // JSONB containment: meta->'tags' @> '["blockchain"]'
  if (tag)   conditions.push(sql`${skillsTable.meta}->'tags' @> ${JSON.stringify([tag.toLowerCase().trim()])}::jsonb`);

  // Include bundle count and real invocation count via LEFT JOINs
  const rows = await db
    .select({
      ...getTableColumns(skillsTable),
      bundleCount:      count(bundleSkillsTable.bundleId),
      invocationCount:  sql<number>`count(distinct ${invocationLogsTable.id})`,
    })
    .from(skillsTable)
    .leftJoin(bundleSkillsTable,   eq(bundleSkillsTable.skillId,   skillsTable.skillId))
    .leftJoin(invocationLogsTable, eq(invocationLogsTable.skillId, skillsTable.skillId))
    .where(conditions.length ? and(...conditions) : undefined)
    .groupBy(skillsTable.skillId)
    .orderBy(desc(skillsTable.createdAt))
    .limit(100);

  // Fetch GitHub stars in parallel (best-effort)
  const skills = await Promise.all(
    rows.map(async (row) => ({
      ...row,
      githubStars: await fetchGithubStars(row.repoUrl),
    })),
  );

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

  // Normalize repoUrl: strip trailing slashes and whitespace so "owner/repo/"
  // and "owner/repo" are treated as the same repo everywhere in the system.
  const normalizedRepoUrl = repoUrl.trim().replace(/\/+$/, "");

  // ── Server-side GitHub ownership guard (ownerMode: "mine") ──────────────
  // Prevents anyone from minting someone else's repo as their own by calling
  // the API directly (bypassing the frontend ownership check).
  if (ownerMode === "mine") {
    const sessionGithubUser = (req.session as Record<string, unknown>)?.githubUsername as string | undefined;
    if (!sessionGithubUser) {
      apiError(res, ErrorCode.UNAUTHORIZED,
        "GitHub login required to mint in 'My Repo' mode. Complete GitHub OAuth in the Create flow first.");
      return;
    }
    // repoUrl format: "owner/repo[/tree/branch/...]" — owner is always first segment
    const repoOwner = normalizedRepoUrl.split("/")[0].toLowerCase();
    if (sessionGithubUser.toLowerCase() !== repoOwner) {
      apiError(res, ErrorCode.FORBIDDEN,
        `GitHub ownership mismatch: repo belongs to '${repoOwner}' but you are authenticated as '${sessionGithubUser}'. Use 'Not My Repo' mode to mint repos you don't own.`);
      return;
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  // ── Repo uniqueness guard ────────────────────────────────────────────────
  // Block minting if this repo already has a minted or claimed Skill NFT.
  // Pending records (not yet on-chain) are ignored — they may be stale drafts.
  // Use sql`lower()` to tolerate case differences, and strip trailing slash
  // from stored values so old records with a trailing slash are also caught.
  let existing: { skillId: string; tokenId: number | null; repoUrl: string } | undefined;
  try {
    [existing] = await db
      .select({ skillId: skillsTable.skillId, tokenId: skillsTable.tokenId, repoUrl: skillsTable.repoUrl })
      .from(skillsTable)
      .where(
        and(
          sql`lower(rtrim(${skillsTable.repoUrl}, '/')) = lower(${normalizedRepoUrl})`,
          inArray(skillsTable.mintStatus, ["minted", "claimed"]),
        )
      )
      .limit(1);
  } catch (err) {
    logger.error({ err, normalizedRepoUrl }, "prepare-mint: uniqueness check failed");
    apiError(res, ErrorCode.INTERNAL, "Database error during uniqueness check");
    return;
  }

  if (existing) {
    apiError(res, ErrorCode.CONFLICT,
      `This repo already has a minted Skill NFT (skillId: ${existing.skillId}` +
      (existing.tokenId != null ? `, token #${existing.tokenId}` : "") + "). Each repo can only be minted once.",
    );
    return;
  }
  // ─────────────────────────────────────────────────────────────────────────

  const skillId          = generateId("sk");
  const resolvedMeta     = meta ?? {};
  const resolvedOwner    = ownerMode === "mine" ? callerAddress : callerAddress; // always record submitter
  const manifestOwnerVal = normalizedRepoUrl;

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

  // Encrypt + upload to 0G Storage (falls back to keccak256 if unavailable).
  // When skillFileContent is provided (fetched from GitHub) that real file
  // is what gets encrypted and stored — the rootHash anchors the actual skill.
  let uploadResult: { rootHash: string; skillUri: string; uploaded: boolean; txSeq?: number | null; aesKey: string };
  try {
    uploadResult = await uploadSkillManifest(
      skillId,
      manifestOwnerVal,
      manifest,
      skillFileContent ?? undefined
    );
  } catch (err) {
    logger.error({ err, skillId }, "0G Storage upload failed in prepare-mint");
    apiError(res, ErrorCode.RPC_ERROR, "Failed to upload manifest");
    return;
  }

  // Compute content SHA-256 so the first sync can detect no-change correctly.
  // Only set when real skill file content was provided (not just the manifest envelope).
  const contentSha256 = skillFileContent
    ? crypto.createHash("sha256").update(skillFileContent.trim(), "utf8").digest("hex")
    : undefined;

  // Create DB record (pending — confirmed after user's tx lands)
  // aesKey is stored in DB only — never sent to client or on-chain
  let skill: typeof skillsTable.$inferSelect;
  try {
    [skill] = await db
      .insert(skillsTable)
      .values({
        skillId,
        repoUrl:       manifestOwnerVal,
        skillUri:      uploadResult.skillUri,
        rootHash:      uploadResult.rootHash,
        aesKey:        uploadResult.aesKey,
        manifestOwner: manifestOwnerVal,
        ownerAddress:  resolvedOwner,
        meta: {
          ...resolvedMeta,
          ownerMode,
          ...(uploadResult.txSeq != null ? { storeTxSeq: uploadResult.txSeq } : {}),
          storageUploaded: uploadResult.uploaded,
          ...(contentSha256 ? { contentSha256 } : {}),
        } as Record<string, unknown>,
      })
      .returning();
  } catch (err) {
    logger.error({ err, skillId }, "prepare-mint: DB insert failed");
    apiError(res, ErrorCode.INTERNAL, "Failed to create skill record");
    return;
  }

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
// Reads on-chain tokenId owner, updates DB to minted.
//
// No EIP-712 signature required here — the skillId itself is an unguessable
// server-generated token (only returned to the original prepare-mint caller),
// which serves as proof of identity. The on-chain ownerOf(tokenId) is the
// ground truth for ownership; the DB is updated to match it.
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/skills/:id/confirm-mint", async (req, res) => {
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

  // Read on-chain owner to confirm the tx landed
  const onChainOwner = await getOnChainOwner(tokenId).catch(() => null);
  if (!onChainOwner) {
    apiError(res, ErrorCode.RPC_ERROR, "Token not found on-chain — tx may still be pending");
    return;
  }

  // Determine the final ownerAddress for this skill:
  // "mine" → actual on-chain NFT owner; "community" → platform (SkillNFT contract)
  const ownerMode = (skill.meta as Record<string, unknown>)?.ownerMode as string | undefined;
  const finalOwner = ownerMode === "mine" ? onChainOwner : SKILL_NFT_ADDRESS;
  const callerAddress = onChainOwner; // used below for logging

  // Auto-generate MCP tool schema now that we have tokenId
  const existingMeta = skill.meta as Record<string, unknown>;
  const mcpToolSchema = {
    description: (existingMeta.description as string) || (existingMeta.name as string) || skill.repoUrl,
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Your query or input for this skill" },
      },
    },
  };

  const [updated] = await db
    .update(skillsTable)
    .set({
      mintStatus:   "minted",
      tokenId,
      ownerAddress: finalOwner,
      meta: {
        ...existingMeta,
        txHash,
        mintedAt: new Date().toISOString(),
        mcpToolSchema,
      },
      updatedAt: new Date(),
    })
    .where(eq(skillsTable.skillId, skillId))
    .returning();

  invalidatePrefix(cacheKey(16661, "getSkillOnChain", tokenId));
  logger.info({ skillId, tokenId, txHash, ownerMode, finalOwner }, "confirm-mint: skill minted");

  res.json({ skill: updated, onChainOwner });
});

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/skills/:id/verify
//
// Verify a skill's encrypted content exists on a 0G Storage mainnet node.
// Calls zgs_getFileInfo(rootHash, false) directly — does NOT rely on StorageScan.
//
// StorageScan only indexes files submitted via the public indexer service.
// Since mainnet has no public indexer DNS, direct-node uploads are invisible
// to StorageScan. This endpoint is the authoritative verification method.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/skills/:id/verify", async (req, res) => {
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

  if (!skill.rootHash) {
    apiError(res, ErrorCode.NOT_FOUND, "No rootHash — skill not yet uploaded to 0G Storage");
    return;
  }

  // Check if this is a real 0G upload (uploaded=true) or a fallback hash
  const meta = (skill.meta as Record<string, unknown>) ?? {};
  const isRealUpload = meta.storageUploaded === true;
  const txSeq = meta.storeTxSeq as number | undefined;

  try {
    const verified = await verifyFileOnNode(skill.rootHash);
    res.json({
      skillId,
      rootHash:       skill.rootHash,
      storagePointer: `0g://${skill.rootHash}`,
      txSeq:          verified.txSeq,
      finalized:      verified.finalized,
      size:           verified.size,
      verifiedOnNode: verified.node,
      verifiedAt:     new Date().toISOString(),
      note: "Verified directly on 0G storage node. StorageScan cannot index direct-node uploads (no public mainnet indexer).",
    });
  } catch (err) {
    // If stored txSeq exists, fall back to txSeq-based verification
    if (txSeq != null) {
      res.json({
        skillId,
        rootHash:       skill.rootHash,
        storagePointer: `0g://${skill.rootHash}`,
        txSeq,
        finalized:      isRealUpload,
        size:           null,
        verifiedOnNode: null,
        verifiedAt:     new Date().toISOString(),
        note: "Node query failed; txSeq from upload record returned. File was confirmed finalized at upload time.",
      });
      return;
    }
    logger.warn({ err, skillId, rootHash: skill.rootHash }, "0G verify failed");
    apiError(res, ErrorCode.RPC_ERROR, `Verification failed: ${(err as Error).message}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/skills/:id/content
//
// Downloads and decrypts the encrypted skill content from 0G Storage.
// Used by AI agents and the UI to fetch the actual skill payload.
//
// Authorization (checked in order):
//   1. Require a valid EIP-712 wallet signature (X-Wallet-Signature header).
//   2. Caller must be the on-chain NFT owner (ownerOf(tokenId)) OR the
//      recorded creator (skill.ownerAddress) — whichever is current.
//
// Rationale: the content is encrypted precisely because it should be
// accessible ONLY to the NFT holder. Anyone who obtained the rootHash
// from the tokenURI must still prove wallet ownership to decrypt.
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/skills/:id/content",
  authMiddleware("fetch-skill-content"),
  async (req, res) => {
    const skillId       = req.params.id as string;
    const callerAddress = req.walletAddress!.toLowerCase();

    const [skill] = await db
      .select()
      .from(skillsTable)
      .where(eq(skillsTable.skillId, skillId))
      .limit(1);

    if (!skill) {
      apiError(res, ErrorCode.NOT_FOUND, "Skill not found");
      return;
    }

    if (!skill.rootHash) {
      apiError(res, ErrorCode.NOT_FOUND, "No 0G Storage rootHash for this skill — not yet uploaded");
      return;
    }

    // ── Ownership check ──────────────────────────────────────────────────────
    // Allow access if caller is the recorded creator OR the current on-chain NFT owner.
    const dbOwner = skill.ownerAddress?.toLowerCase();
    let authorized = callerAddress === dbOwner;

    if (!authorized && skill.tokenId != null) {
      const onChainOwner = await getOnChainOwner(skill.tokenId).catch(() => null);
      if (onChainOwner && onChainOwner.toLowerCase() === callerAddress) {
        authorized = true;
      }
    }

    if (!authorized) {
      logger.warn({ skillId, callerAddress, dbOwner, tokenId: skill.tokenId },
        "content fetch denied — caller does not own skill NFT");
      apiError(res, ErrorCode.UNAUTHORIZED,
        "Access denied. You must own this Skill NFT to fetch its content. " +
        "Sign with the wallet that holds token #" + (skill.tokenId ?? "(pending mint)") + "."
      );
      return;
    }
    // ─────────────────────────────────────────────────────────────────────────

    try {
      const content = await downloadSkillContent(skill.rootHash);
      logger.info({ skillId, callerAddress, rootHash: skill.rootHash }, "skill content fetched from 0G");
      res.json({
        skillId,
        rootHash:       skill.rootHash,
        storagePointer: `0g://${skill.rootHash}`,
        content,
        fetchedAt:      new Date().toISOString(),
      });
    } catch (err) {
      logger.warn({ err, skillId, rootHash: skill.rootHash }, "0G content fetch failed");
      apiError(res, ErrorCode.RPC_ERROR,
        `Failed to fetch content from 0G Storage (rootHash: ${skill.rootHash}). ` +
        "The content may not yet be finalized on storage nodes."
      );
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/skills/:id/stats  (public)
//
// Returns aggregate invocation count and W0G revenue for a skill.
// No auth required — only totals are exposed, never proof tokens.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/skills/:id/stats", async (req, res) => {
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

  const [[{ total }], rawActivity] = await Promise.all([
    db.select({ total: count() })
      .from(invocationLogsTable)
      .where(eq(invocationLogsTable.skillId, skillId)),
    db.select({ agentWallet: invocationLogsTable.agentWallet, calledAt: invocationLogsTable.calledAt })
      .from(invocationLogsTable)
      .where(eq(invocationLogsTable.skillId, skillId))
      .orderBy(desc(invocationLogsTable.calledAt))
      .limit(50),
  ]);

  // Mask wallet: show first 6 + last 4 chars
  const maskWallet = (w: string) =>
    w.length > 10 ? `${w.slice(0, 6)}…${w.slice(-4)}` : w;

  const recentActivity = rawActivity.map((row) => ({
    agentWalletMasked: maskWallet(row.agentWallet),
    issuedAt: row.calledAt,
  }));

  // Read basePrice from chain when possible — owner may have changed it after mint
  let basePriceWei = "0";
  if (skill.tokenId != null) {
    try {
      basePriceWei = (await getOnChainBasePrice(skill.tokenId)).toString();
    } catch {
      // chain read failed — fall back to meta
      const metaPrice = ((skill.meta as Record<string, unknown>)?.basePrice as number | undefined) ?? 0;
      basePriceWei = BigInt(Math.round(metaPrice * 1e18)).toString();
    }
  }

  const basePriceEther = Number(BigInt(basePriceWei)) / 1e18;

  res.json({
    skillId,
    invocations:  Number(total),
    revenueW0G:   Number(total) * basePriceEther,
    basePriceWei,
    recentActivity,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/skills/:id/proofs
//
// Paginated list of payment proof issuances for a skill.
// Owner-only: caller must have signed with the skill's ownerAddress.
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/skills/:id/proofs",
  authMiddleware("fetch-skill-proofs"),
  async (req, res) => {
    const skillId       = req.params.id as string;
    const callerAddress = req.walletAddress!.toLowerCase();

    const page  = Math.max(1, parseInt((req.query.page  as string) || "1",  10));
    const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || "20", 10)));
    const offset = (page - 1) * limit;

    const [skill] = await db
      .select()
      .from(skillsTable)
      .where(eq(skillsTable.skillId, skillId))
      .limit(1);

    if (!skill) {
      apiError(res, ErrorCode.NOT_FOUND, "Skill not found");
      return;
    }
    if (skill.ownerAddress?.toLowerCase() !== callerAddress) {
      apiError(res, ErrorCode.FORBIDDEN, "Only the skill owner can view proof history");
      return;
    }

    const [proofs, [{ total }]] = await Promise.all([
      db
        .select()
        .from(paymentProofsTable)
        .where(eq(paymentProofsTable.skillId, skillId))
        .orderBy(desc(paymentProofsTable.issuedAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(paymentProofsTable)
        .where(eq(paymentProofsTable.skillId, skillId)),
    ]);

    const basePrice = ((skill.meta as Record<string, unknown>)?.basePrice as number | undefined) ?? 0;

    res.json({
      proofs,
      total,
      page,
      limit,
      invocations: total,
      revenueW0G:  total * basePrice,
    });
  }
);

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

  // Increment contentVersion whenever rootHash changes — invalidates all agent proofs
  const rootHashChanged = rootHash !== undefined && rootHash !== existing.rootHash;

  const [updated] = await db
    .update(skillsTable)
    .set({
      ...(skillUri !== undefined && { skillUri }),
      ...(rootHash !== undefined && { rootHash }),
      ...(meta     !== undefined && { meta }),
      ...(rootHashChanged && { contentVersion: (existing.contentVersion ?? 1) + 1 }),
      updatedAt: new Date(),
    })
    .where(eq(skillsTable.skillId, skillId))
    .returning();

  if (rootHashChanged) {
    logger.info({ skillId, newContentVersion: updated.contentVersion }, "skill rootHash updated — contentVersion incremented, agent proofs invalidated");
  }

  res.json({ skill: updated });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/skills/:id/update-content
//
// Creator uploads new skill.md content for a minted skill they own.
// Flow:
//   1. Verify caller is on-chain NFT owner via EIP-712 sig
//   2. Upload new content to 0G Storage (generates new AES key + rootHash)
//   3. Increment contentVersion + update rootHash/skillUri/aesKey in DB
//   4. Mark active curator_authorizations as needs_reauth (authEpoch = -1)
//   5. Return new rootHash — frontend then calls updateDataHash(tokenId, hash, 0) on-chain
// ─────────────────────────────────────────────────────────────────────────────
router.post("/skills/:id/update-content", async (req, res) => {
  const skillId   = req.params.id as string;
  const sigHeader = req.headers["x-wallet-signature"] as string | undefined;

  if (!sigHeader) {
    apiError(res, ErrorCode.UNAUTHORIZED, "X-Wallet-Signature header required");
    return;
  }

  let callerAddress: string;
  try {
    callerAddress = await verifyWalletSignature(sigHeader, "user:update-content");
  } catch (err) {
    apiError(res, ErrorCode.UNAUTHORIZED, "Invalid wallet signature");
    return;
  }

  // Fetch skill
  const [skill] = await db
    .select()
    .from(skillsTable)
    .where(eq(skillsTable.skillId, skillId))
    .limit(1);

  if (!skill) {
    apiError(res, ErrorCode.NOT_FOUND, "Skill not found");
    return;
  }
  if (skill.mintStatus !== "minted" && skill.mintStatus !== "claimed") {
    apiError(res, ErrorCode.INVALID_INPUT, "Skill must be minted before content can be updated");
    return;
  }
  if (skill.tokenId == null) {
    apiError(res, ErrorCode.INVALID_INPUT, "Skill has no tokenId");
    return;
  }

  // Verify caller is the live on-chain NFT owner
  const onChainOwner = await getOnChainOwner(skill.tokenId);
  if (!onChainOwner || onChainOwner.toLowerCase() !== callerAddress.toLowerCase()) {
    apiError(res, ErrorCode.FORBIDDEN, "Caller is not the on-chain NFT owner");
    return;
  }

  const { content, fromGithub } = req.body as { content?: string; fromGithub?: boolean };

  let resolvedContent: string;

  if (fromGithub) {
    // Fetch latest skill file directly from the GitHub repo
    const parts = skill.repoUrl.replace(/^https?:\/\/github\.com\//, "").split("/");
    const [ghOwner, ghRepo] = parts;
    if (!ghOwner || !ghRepo) {
      apiError(res, ErrorCode.INVALID_INPUT, `Cannot parse repoUrl as owner/repo: ${skill.repoUrl}`);
      return;
    }
    // Use session token for private-repo fallback (requires repo OAuth scope)
    const ghToken: string | undefined = req.session?.githubToken;
    let fetched: string | null = null;

    // Try raw.githubusercontent.com first; fall back to Contents API for private repos
    outer: for (const branch of ["main", "master"]) {
      for (const filename of ["skill.md", "skillfun.json", "README.md"]) {
        // 1. Public raw fetch
        try {
          const rawUrl = `https://raw.githubusercontent.com/${ghOwner}/${ghRepo}/${branch}/${filename}`;
          const r = await fetch(rawUrl, { signal: AbortSignal.timeout(10_000), headers: { "Cache-Control": "no-cache" } });
          if (r.status === 200) { fetched = await r.text(); break outer; }
        } catch { /* try Contents API */ }

        // 2. Private-repo fallback via GitHub Contents API (needs repo-scope token)
        if (ghToken) {
          try {
            const apiUrl = `https://api.github.com/repos/${ghOwner}/${ghRepo}/contents/${filename}?ref=${branch}`;
            const apiRes = await fetch(apiUrl, {
              signal: AbortSignal.timeout(10_000),
              headers: {
                Authorization:   `Bearer ${ghToken}`,
                Accept:          "application/vnd.github.v3+json",
                "User-Agent":    "SkillFun/1.0",
                "Cache-Control": "no-cache",
              },
            });
            if (apiRes.status === 200) {
              const data = await apiRes.json() as { content?: string; encoding?: string };
              if (data.encoding === "base64" && data.content) {
                fetched = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8");
                break outer;
              }
            }
          } catch { /* try next file/branch */ }
        }
      }
    }

    if (!fetched) {
      const hasRepoScope = req.session?.githubTokenHasRepoScope ?? false;
      const possiblyPrivate = !ghToken || !hasRepoScope;
      apiError(res, ErrorCode.NOT_FOUND,
        `Could not fetch skill file from GitHub repo: ${skill.repoUrl}`,
        undefined,
        { possiblyPrivate },
      );
      return;
    }
    resolvedContent = fetched;
    logger.info({ skillId, repoUrl: skill.repoUrl }, "skill content fetched from GitHub for update");
  } else {
    if (!content || typeof content !== "string" || !content.trim()) {
      apiError(res, ErrorCode.INVALID_INPUT, "Either fromGithub:true or a content string is required");
      return;
    }
    resolvedContent = content.trim();
  }

  // Check content SHA-256 BEFORE uploading to 0G.
  // Uploading is not idempotent (random AES key + IV each time), so we compare
  // a SHA-256 of the raw text stored in meta rather than the 0G rootHash.
  const newContentSha = crypto.createHash("sha256").update(resolvedContent.trim(), "utf8").digest("hex");
  const meta = (skill.meta as Record<string, unknown>) ?? {};
  const existingContentSha = meta.contentSha256 as string | undefined;

  if (existingContentSha && existingContentSha === newContentSha) {
    logger.info({ skillId, contentSha: newContentSha }, "update-content: content unchanged (SHA-256 match), skipping upload");
    res.json({
      skillId,
      rootHash:       skill.rootHash,
      contentVersion: skill.contentVersion ?? 1,
      noChange:       true,
      message:        "Content is identical to the current version — no update needed.",
    });
    return;
  }

  // Upload new content to 0G Storage
  const manifest: Record<string, unknown> = {
    skillId:   skill.skillId,
    repoUrl:   skill.repoUrl,
    name:      meta.name ?? skill.repoUrl.split("/").pop(),
    ...meta,
    updatedAt: new Date().toISOString(),
  };

  const { rootHash: newRootHash, skillUri: newSkillUri, aesKey: newAesKey } =
    await uploadSkillManifest(skill.skillId, skill.repoUrl, manifest, resolvedContent.trim());

  const newContentVersion = (skill.contentVersion ?? 1) + 1;

  // Update skill in DB: new rootHash, skillUri, aesKey, incremented contentVersion,
  // and store the content SHA-256 so future sync calls can skip unchanged content.
  const [updatedSkill] = await db
    .update(skillsTable)
    .set({
      rootHash:       newRootHash,
      skillUri:       newSkillUri,
      aesKey:         newAesKey ?? skill.aesKey,
      contentVersion: newContentVersion,
      updatedAt:      new Date(),
      meta:           { ...meta, contentSha256: newContentSha },
    })
    .where(eq(skillsTable.skillId, skillId))
    .returning();

  // Mark all active (non-revoked) curator authorizations as needs_reauth
  // by setting authEpoch = -1 (sentinel value checked in computeStatus)
  const { rowCount } = await db
    .update(curatorAuthorizationsTable)
    .set({ authEpoch: -1 })
    .where(
      and(
        eq(curatorAuthorizationsTable.tokenId, skill.tokenId),
        isNull(curatorAuthorizationsTable.revokedAt),
      )
    );

  logger.info(
    { skillId, tokenId: skill.tokenId, newRootHash, newContentVersion, curatorsMarked: rowCount ?? 0 },
    "skill content updated — curator authorizations flagged for re-review"
  );

  res.json({
    skill:          updatedSkill,
    newRootHash,
    newSkillUri,
    newContentVersion,
    curatorsMarked: rowCount ?? 0,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/skills/:id/prepare-sync
//
// Curator-triggered content sync for *unclaimed* skills.
// Flow:
//   1. Verify skill is unclaimed (mintStatus === 'minted', NFT held by contract)
//   2. Verify caller has on-chain authorization via _authorized mapping
//      (i.e. they previously called selfAuthorize for this tokenId)
//   3. Fetch latest content from GitHub + upload to 0G Storage
//   4. Update DB rootHash, contentVersion, mark curator authorizations needs_reauth
//   5. Return { rootHash, noChange } — the curator's wallet calls
//      authorizedUpdateDataHash(tokenId, rootHash, 0) on-chain separately
//
// Crucially: this endpoint does NOT call updateDataHash on-chain.
// The curator's wallet submits that transaction in the browser.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/skills/:id/prepare-sync", async (req, res) => {
  const skillId   = req.params.id as string;
  const sigHeader = req.headers["x-wallet-signature"] as string | undefined;

  if (!sigHeader) {
    apiError(res, ErrorCode.UNAUTHORIZED, "X-Wallet-Signature header required");
    return;
  }

  let callerAddress: string;
  try {
    callerAddress = await verifyWalletSignature(sigHeader, "user:prepare-sync");
  } catch {
    apiError(res, ErrorCode.UNAUTHORIZED, "Invalid wallet signature");
    return;
  }

  // Fetch skill
  const [skill] = await db
    .select()
    .from(skillsTable)
    .where(eq(skillsTable.skillId, skillId))
    .limit(1);

  if (!skill) {
    apiError(res, ErrorCode.NOT_FOUND, "Skill not found");
    return;
  }

  // Only unclaimed skills — claimed skills use the creator's update-content flow
  if (skill.mintStatus !== "minted") {
    apiError(
      res,
      ErrorCode.INVALID_INPUT,
      skill.mintStatus === "claimed"
        ? "This skill has been claimed — only the NFT owner can update its content"
        : "Skill must be minted before content can be synced"
    );
    return;
  }
  if (skill.tokenId == null) {
    apiError(res, ErrorCode.INVALID_INPUT, "Skill has no tokenId");
    return;
  }

  // Verify caller has on-chain authorization for this tokenId
  // We read the _authorized mapping via isAuthorized(tokenId, caller)
  const { isAuthorizedOnChain } = await import("../services/chain.js");
  const authorized = await isAuthorizedOnChain(skill.tokenId, callerAddress).catch(() => false);
  if (!authorized) {
    apiError(
      res,
      ErrorCode.FORBIDDEN,
      "You have not authorized this skill. Call selfAuthorize() first."
    );
    return;
  }

  // Fetch latest content from GitHub
  const parts = skill.repoUrl.replace(/^https?:\/\/github\.com\//, "").split("/");
  const [owner, repo] = parts;
  if (!owner || !repo) {
    apiError(res, ErrorCode.INVALID_INPUT, `Cannot parse repoUrl as owner/repo: ${skill.repoUrl}`);
    return;
  }

  let fetched: string | null = null;
  outer: for (const branch of ["main", "master"]) {
    for (const filename of ["skill.md", "skillfun.json", "README.md"]) {
      try {
        const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filename}`;
        const r = await fetch(url, { signal: AbortSignal.timeout(10_000), headers: { "Cache-Control": "no-cache" } });
        if (r.status === 200) { fetched = await r.text(); break outer; }
      } catch { /* try next */ }
    }
  }
  if (!fetched) {
    apiError(res, ErrorCode.NOT_FOUND, `Could not fetch skill file from GitHub repo: ${skill.repoUrl}`);
    return;
  }

  // SHA-256 dedup check — same as update-content
  const newContentSha = crypto.createHash("sha256").update(fetched.trim(), "utf8").digest("hex");
  const meta = (skill.meta as Record<string, unknown>) ?? {};
  if (meta.contentSha256 === newContentSha) {
    // Content hasn't changed — clear any stale authEpoch = -1 flags for ALL curators
    // on this tokenId. The sentinel means "content changed, please re-review"; if the
    // content is provably identical there is nothing to re-review for anyone.
    const { rowCount: clearedReauth } = await db
      .update(curatorAuthorizationsTable)
      .set({ authEpoch: 0 })
      .where(
        and(
          eq(curatorAuthorizationsTable.tokenId, skill.tokenId),
          sql`${curatorAuthorizationsTable.authEpoch} = -1`,
        )
      );

    logger.info({ skillId, callerAddress, clearedReauth }, "prepare-sync: content unchanged, cleared stale re-auth flags");
    res.json({
      skillId,
      rootHash:       skill.rootHash,
      contentVersion: skill.contentVersion ?? 1,
      noChange:       true,
      clearedReauth:  clearedReauth ?? 0,
      message:        "Content is identical to the current version — no update needed.",
    });
    return;
  }

  // Upload to 0G Storage
  const manifest: Record<string, unknown> = {
    skillId:   skill.skillId,
    repoUrl:   skill.repoUrl,
    name:      meta.name ?? skill.repoUrl.split("/").pop(),
    ...meta,
    updatedAt: new Date().toISOString(),
  };

  const { rootHash: newRootHash, skillUri: newSkillUri, aesKey: newAesKey } =
    await uploadSkillManifest(skill.skillId, skill.repoUrl, manifest, fetched.trim());

  const newContentVersion = (skill.contentVersion ?? 1) + 1;

  const [updatedSkill] = await db
    .update(skillsTable)
    .set({
      rootHash:       newRootHash,
      skillUri:       newSkillUri,
      aesKey:         newAesKey ?? skill.aesKey,
      contentVersion: newContentVersion,
      updatedAt:      new Date(),
      meta:           { ...meta, contentSha256: newContentSha },
    })
    .where(eq(skillsTable.skillId, skillId))
    .returning();

  // Mark active curator authorizations as needs_reauth — but NOT the caller who just
  // synced the content. They are the one updating it; they don't need to re-review
  // their own change. Only other curators (if any) need to re-authorize.
  const { rowCount } = await db
    .update(curatorAuthorizationsTable)
    .set({ authEpoch: -1 })
    .where(
      and(
        eq(curatorAuthorizationsTable.tokenId, skill.tokenId),
        isNull(curatorAuthorizationsTable.revokedAt),
        sql`LOWER(${curatorAuthorizationsTable.curatorWallet}) != LOWER(${callerAddress})`,
      )
    );

  logger.info(
    { skillId, tokenId: skill.tokenId, newRootHash, newContentVersion, callerAddress, curatorsMarked: rowCount ?? 0 },
    "prepare-sync: content updated by curator, awaiting on-chain authorizedUpdateDataHash"
  );

  res.json({
    skillId,
    rootHash:           newRootHash,
    skillUri:           newSkillUri,
    contentVersion:     newContentVersion,
    curatorsMarked:     rowCount ?? 0,
    noChange:           false,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/skills/:id/ai-re-analyze
//
// Re-analyzes the skill's cached content with AI and updates tags + capabilities.
// Owner-only (EIP-712 auth).  No blockchain transaction required.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/skills/:id/ai-re-analyze", authMiddleware("update-skill"), async (req, res) => {
  const skillId = req.params.id as string;

  const [existing] = await db
    .select()
    .from(skillsTable)
    .where(eq(skillsTable.skillId, skillId))
    .limit(1);

  if (!existing) { apiError(res, ErrorCode.NOT_FOUND, "Skill not found"); return; }
  if (existing.ownerAddress?.toLowerCase() !== req.walletAddress?.toLowerCase()) {
    apiError(res, ErrorCode.FORBIDDEN, "Not the skill owner"); return;
  }
  if (!existing.tokenId) {
    apiError(res, ErrorCode.INVALID_INPUT, "Skill must be minted before AI can analyze it"); return;
  }

  // Fetch cached decrypted content (populated by fetch-skill-content endpoint)
  const [cache] = await db
    .select()
    .from(skillContentCacheTable)
    .where(eq(skillContentCacheTable.tokenId, existing.tokenId))
    .limit(1);

  if (!cache) {
    apiError(res, ErrorCode.NOT_FOUND, "No cached skill content found. Open the skill detail page to load its content first.");
    return;
  }

  // Collect existing marketplace tags so AI can prefer reusing them
  const rows = await db.select({ meta: skillsTable.meta }).from(skillsTable);
  const existingDbTags = Array.from(new Set(
    rows
      .flatMap(r => {
        const m = r.meta as Record<string, unknown> | null;
        const t = m?.tags;
        return Array.isArray(t) ? (t as string[]) : [];
      })
      .map(s => String(s).toLowerCase().trim())
      .filter(Boolean)
  )).slice(0, 60);

  // Detect file type from content
  const rawContent = cache.decryptedContent;
  const fileType   = rawContent.trimStart().startsWith("{") ? "skillfun.json" : "skill.md";

  // Call AI service
  let aiResult;
  try {
    aiResult = await analyzeSkillContent(rawContent, fileType, existing.repoUrl ?? "unknown", existingDbTags);
  } catch (err) {
    logger.error({ err, skillId }, "ai-re-analyze: AI call failed");
    apiError(res, ErrorCode.INTERNAL, "AI analysis failed — please try again later");
    return;
  }

  // Patch skill meta — only tags and capabilities (preserve all other meta fields)
  const currentMeta = (existing.meta as Record<string, unknown>) ?? {};
  const newMeta = { ...currentMeta, tags: aiResult.tags, capabilities: aiResult.capabilities };

  await db
    .update(skillsTable)
    .set({ meta: newMeta, updatedAt: new Date() })
    .where(eq(skillsTable.skillId, skillId));

  logger.info({ skillId, tags: aiResult.tags, capCount: aiResult.capabilities.length }, "ai-re-analyze: updated skill tags + capabilities");

  res.json({ tags: aiResult.tags, capabilities: aiResult.capabilities });
});

export default router;
