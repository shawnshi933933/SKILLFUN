import { Router } from "express";
import { db } from "@workspace/db";
import { bundlesTable, bundleSkillsTable, skillsTable } from "@workspace/db";
import { eq, desc, asc, inArray } from "drizzle-orm";
import { generateId } from "../lib/id.js";
import { apiError, ErrorCode } from "../lib/errors.js";
import { authMiddleware } from "../middleware/auth.js";
import { logger } from "../lib/logger.js";

const router = Router();

// GET /api/bundles
router.get("/bundles", async (_req, res) => {
  const bundles = await db
    .select()
    .from(bundlesTable)
    .orderBy(desc(bundlesTable.createdAt))
    .limit(100);
  res.json({ bundles });
});

// GET /api/bundles/:id
router.get("/bundles/:id", async (req, res) => {
  const bundleId = req.params.id as string;
  const [bundle] = await db
    .select()
    .from(bundlesTable)
    .where(eq(bundlesTable.bundleId, bundleId))
    .limit(1);

  if (!bundle) {
    apiError(res, ErrorCode.NOT_FOUND, "Bundle not found");
    return;
  }

  const bundleSkills = await db
    .select({ skill: skillsTable, position: bundleSkillsTable.position })
    .from(bundleSkillsTable)
    .innerJoin(skillsTable, eq(bundleSkillsTable.skillId, skillsTable.skillId))
    .where(eq(bundleSkillsTable.bundleId, req.params.id))
    .orderBy(asc(bundleSkillsTable.position));

  res.json({ bundle, skills: bundleSkills.map(r => ({ ...r.skill, position: r.position })) });
});

// POST /api/bundles — create bundle (requires wallet auth)
router.post("/bundles", authMiddleware("create-bundle"), async (req, res) => {
  const { subdomain, name, description, meta } = req.body as {
    subdomain?: string;
    name?: string;
    description?: string;
    meta?: Record<string, unknown>;
  };

  if (!subdomain || !name) {
    apiError(res, ErrorCode.INVALID_INPUT, "subdomain and name are required");
    return;
  }
  if (!/^[a-z0-9-]+$/.test(subdomain)) {
    apiError(res, ErrorCode.INVALID_INPUT, "subdomain must be lowercase alphanumeric with hyphens");
    return;
  }

  try {
    const [bundle] = await db
      .insert(bundlesTable)
      .values({
        bundleId:     generateId("bd"),
        subdomain,
        name,
        description:  description ?? null,
        ownerAddress: req.walletAddress!,
        meta:         meta ?? {},
      })
      .returning();

    logger.info({ bundleId: bundle.bundleId, subdomain, owner: req.walletAddress }, "bundle created");
    res.status(201).json({ bundle });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("unique")) {
      apiError(res, ErrorCode.CONFLICT, "Subdomain already taken");
      return;
    }
    throw err;
  }
});

// PUT /api/bundles/:id/skills — replace skill list with ordered array (owner only)
router.put("/bundles/:id/skills", authMiddleware("update-bundle-skills"), async (req, res) => {
  const bundleId = req.params.id as string;
  const [bundle] = await db
    .select()
    .from(bundlesTable)
    .where(eq(bundlesTable.bundleId, bundleId))
    .limit(1);

  if (!bundle) {
    apiError(res, ErrorCode.NOT_FOUND, "Bundle not found");
    return;
  }
  if (bundle.ownerAddress.toLowerCase() !== req.walletAddress?.toLowerCase()) {
    apiError(res, ErrorCode.FORBIDDEN, "Not the bundle owner");
    return;
  }

  const { skillIds } = req.body as { skillIds?: string[] };
  if (!Array.isArray(skillIds)) {
    apiError(res, ErrorCode.INVALID_INPUT, "skillIds must be an array");
    return;
  }

  // Reject duplicate IDs in the request
  const uniqueIds = new Set(skillIds);
  if (uniqueIds.size !== skillIds.length) {
    apiError(res, ErrorCode.INVALID_INPUT, "skillIds contains duplicate entries");
    return;
  }

  // Validate all requested skill IDs exist before touching the bundle
  if (skillIds.length > 0) {
    const existing = await db
      .select({ skillId: skillsTable.skillId })
      .from(skillsTable)
      .where(inArray(skillsTable.skillId, skillIds));

    const foundIds = new Set(existing.map(r => r.skillId));
    const missing = skillIds.filter(id => !foundIds.has(id));
    if (missing.length > 0) {
      apiError(res, ErrorCode.NOT_FOUND, `Unknown skill IDs: ${missing.join(", ")}`);
      return;
    }
  }

  // Atomic replace: delete then insert inside a single transaction
  await db.transaction(async (tx) => {
    await tx.delete(bundleSkillsTable).where(eq(bundleSkillsTable.bundleId, bundleId));
    if (skillIds.length > 0) {
      await tx.insert(bundleSkillsTable).values(
        skillIds.map((skillId, idx) => ({ bundleId, skillId, position: idx }))
      );
    }
  });

  logger.info({ bundleId, count: skillIds.length }, "bundle skills updated");
  res.json({ success: true, count: skillIds.length });
});

export default router;
