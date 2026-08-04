/**
 * GET /api/stats
 *
 * Public aggregate stats for the landing page.
 * Cached in-memory for 60 seconds — no auth required.
 */
import { Router } from "express";
import { db } from "@workspace/db";
import { skillsTable, paymentProofsTable, bundlesTable } from "@workspace/db";
import { count, inArray } from "drizzle-orm";

const router = Router();

interface StatsCache {
  totalSkills:      number;
  totalBundles:     number;
  totalInvocations: number;
  cachedAt:         number;
}

let cache: StatsCache | null = null;
const CACHE_TTL_MS = 60_000; // 60 s

router.get("/stats", async (_req, res) => {
  if (cache && Date.now() - cache.cachedAt < CACHE_TTL_MS) {
    res.json(cache);
    return;
  }

  const [[skills], [bundles], [invocations]] = await Promise.all([
    db.select({ total: count() }).from(skillsTable)
      .where(inArray(skillsTable.mintStatus, ["minted", "claimed"])),
    db.select({ total: count() }).from(bundlesTable),
    db.select({ total: count() }).from(paymentProofsTable),
  ]);

  cache = {
    totalSkills:      skills.total,
    totalBundles:     bundles.total,
    totalInvocations: invocations.total,
    cachedAt:         Date.now(),
  };

  res.json(cache);
});

export default router;
