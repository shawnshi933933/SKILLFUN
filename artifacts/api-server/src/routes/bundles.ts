import { Router } from "express";
import { db } from "@workspace/db";
import { bundlesTable, bundleSkillsTable, skillsTable, paymentProofsTable } from "@workspace/db";
import { eq, desc, asc, inArray, count } from "drizzle-orm";
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/bundles/:id/analytics
//
// Aggregate invocations + W0G revenue across all skills in a bundle.
// Public endpoint — activity events are SANITIZED: no proof tokens, no txHashes,
// no full agent wallet. Leaking proof tokens would allow replay attacks that
// bypass x402 payment (token + agentWallet together satisfy MCP proof validation).
// ─────────────────────────────────────────────────────────────────────────────

/** Mask a wallet address: 0x1234…5678 */
function maskWallet(wallet: string): string {
  if (wallet.length < 12) return wallet;
  return `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;
}

router.get("/bundles/:id/analytics", async (req, res) => {
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
    .select({ skill: skillsTable })
    .from(bundleSkillsTable)
    .innerJoin(skillsTable, eq(bundleSkillsTable.skillId, skillsTable.skillId))
    .where(eq(bundleSkillsTable.bundleId, bundleId));

  const skillIds = bundleSkills.map((r) => r.skill.skillId);

  if (skillIds.length === 0) {
    res.json({ invocations: 0, revenueW0G: 0, recentActivity: [], skillBreakdown: [] });
    return;
  }

  const [rawActivity, countsBySkill] = await Promise.all([
    // Only select non-sensitive columns — never pull token or txHash for public responses
    db
      .select({
        skillId:        paymentProofsTable.skillId,
        agentWallet:    paymentProofsTable.agentWallet,
        contentVersion: paymentProofsTable.contentVersion,
        issuedAt:       paymentProofsTable.issuedAt,
      })
      .from(paymentProofsTable)
      .where(inArray(paymentProofsTable.skillId, skillIds))
      .orderBy(desc(paymentProofsTable.issuedAt))
      .limit(50),
    db
      .select({ skillId: paymentProofsTable.skillId, total: count() })
      .from(paymentProofsTable)
      .where(inArray(paymentProofsTable.skillId, skillIds))
      .groupBy(paymentProofsTable.skillId),
  ]);

  const skillMap = Object.fromEntries(bundleSkills.map((r) => [r.skill.skillId, r.skill]));

  // Sanitize activity: mask agent wallet, omit token + txHash entirely
  const recentActivity = rawActivity.map((row) => {
    const skill     = skillMap[row.skillId];
    const meta      = (skill?.meta as Record<string, unknown>) ?? {};
    const skillName = (meta.name as string | undefined) ?? row.skillId;
    return {
      skillId:           row.skillId,
      skillName,
      agentWalletMasked: maskWallet(row.agentWallet),
      contentVersion:    row.contentVersion,
      issuedAt:          row.issuedAt,
    };
  });

  const skillBreakdown = countsBySkill.map((row) => {
    const skill      = skillMap[row.skillId];
    const meta       = (skill?.meta as Record<string, unknown>) ?? {};
    const basePrice  = (meta.basePrice as number | undefined) ?? 0;
    const skillName  = (meta.name as string | undefined) ?? row.skillId;
    return {
      skillId:     row.skillId,
      skillName,
      invocations: row.total,
      revenueW0G:  row.total * basePrice,
    };
  });

  const totalInvocations = skillBreakdown.reduce((s, r) => s + r.invocations, 0);
  const totalRevenueW0G  = skillBreakdown.reduce((s, r) => s + r.revenueW0G,  0);

  res.json({
    invocations:    totalInvocations,
    revenueW0G:     totalRevenueW0G,
    recentActivity,
    skillBreakdown,
  });
});

// POST /api/bundles — create bundle (requires wallet auth)
router.post("/bundles", authMiddleware("create-bundle"), async (req, res) => {
  const { subdomain, name, description, servicePrice, meta } = req.body as {
    subdomain?: string;
    name?: string;
    description?: string;
    /** x402 price in W0G wei (as string). Null/omit = free bundle. */
    servicePrice?: string | null;
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
  if (servicePrice && !/^\d+$/.test(servicePrice)) {
    apiError(res, ErrorCode.INVALID_INPUT, "servicePrice must be a non-negative integer string (W0G wei)");
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
        servicePrice: servicePrice ?? null,
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

// PUT /api/bundles/:id — update bundle metadata (owner only)
router.put("/bundles/:id", authMiddleware("update-bundle"), async (req, res) => {
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

  const { name, description, workflow, servicePrice, meta } = req.body as {
    name?:         string;
    description?:  string;
    workflow?:     string;
    /** x402 price in W0G wei (as string). Null = free bundle. */
    servicePrice?: string | null;
    meta?:         Record<string, unknown>;
  };

  if (servicePrice !== undefined && servicePrice !== null && !/^\d+$/.test(servicePrice)) {
    apiError(res, ErrorCode.INVALID_INPUT, "servicePrice must be a non-negative integer string (W0G wei)");
    return;
  }

  const [updated] = await db
    .update(bundlesTable)
    .set({
      ...(name         !== undefined && { name }),
      ...(description  !== undefined && { description }),
      ...(workflow     !== undefined && { workflow }),
      ...(servicePrice !== undefined && { servicePrice: servicePrice ?? null }),
      ...(meta         !== undefined && { meta }),
      updatedAt: new Date(),
    })
    .where(eq(bundlesTable.bundleId, bundleId))
    .returning();

  logger.info({ bundleId, updatedFields: Object.keys(req.body) }, "bundle updated");
  res.json({ bundle: updated });
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
