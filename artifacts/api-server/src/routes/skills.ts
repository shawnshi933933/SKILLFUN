import { Router } from "express";
import { db } from "@workspace/db";
import { skillsTable } from "@workspace/db";
import { eq, desc, and, SQL } from "drizzle-orm";
import { generateId } from "../lib/id.js";
import { apiError, ErrorCode } from "../lib/errors.js";
import { authMiddleware } from "../middleware/auth.js";
import { getSkillOnChain } from "../services/chain.js";
import { logger } from "../lib/logger.js";

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
