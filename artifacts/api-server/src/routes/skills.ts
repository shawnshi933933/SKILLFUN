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

// POST /api/skills — register a new skill intent (requires wallet auth)
// Creates a DB record in "pending" status. tokenId and mintStatus are server-controlled
// and updated only by the trusted mint indexer (PATCH /api/admin/skills/:id/mint).
router.post("/skills", authMiddleware("register-skill"), async (req, res) => {
  const { repoUrl, skillUri, rootHash, meta } = req.body as {
    repoUrl?: string;
    skillUri?: string;
    rootHash?: string;
    meta?: Record<string, unknown>;
  };

  if (!repoUrl) {
    apiError(res, ErrorCode.INVALID_INPUT, "repoUrl is required");
    return;
  }

  const skillId = generateId("sk");
  const [skill] = await db
    .insert(skillsTable)
    .values({
      skillId,
      repoUrl,
      skillUri:      skillUri ?? null,
      rootHash:      rootHash ?? null,
      // manifestOwner is locked to repoUrl at creation — immutable thereafter
      manifestOwner: repoUrl,
      ownerAddress:  req.walletAddress ?? null,
      meta:          meta ?? {},
      // mintStatus, reviewStatus, and tokenId are server-controlled — never user-settable
    })
    .returning();

  logger.info({ skillId, repoUrl, owner: req.walletAddress }, "skill registered");
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
