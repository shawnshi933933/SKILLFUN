/**
 * GET /api/assets/:rootHash
 *
 * Proxy endpoint that downloads a raw (unencrypted) file from 0G Storage
 * and serves it over HTTP with a long-lived cache.
 *
 * Used for public assets (e.g. the SkillFun NFT logo image) whose rootHash
 * is baked into NFT tokenURI metadata.
 */

import { Router } from "express";
import { downloadRawFile } from "../services/storage.js";

const router = Router();

// In-process LRU cache: rootHash → Buffer (max ~20 MB total, unbounded entries but assets are small)
const assetCache = new Map<string, { data: Buffer; contentType: string; cachedAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const CONTENT_TYPES: Record<string, string> = {
  png:  "image/png",
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  gif:  "image/gif",
  webp: "image/webp",
  svg:  "image/svg+xml",
};

/** Detect content type from file magic bytes. Falls back to octet-stream. */
function sniffContentType(buf: Buffer): string {
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "image/gif";
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "image/webp";
  return "application/octet-stream";
}

router.get("/assets/:rootHash", async (req, res) => {
  const { rootHash } = req.params;

  // Basic validation: must be hex with optional 0x prefix, 32 bytes = 64 hex chars
  const hexOnly = rootHash.replace(/^0x/, "");
  if (!/^[0-9a-fA-F]{64}$/.test(hexOnly)) {
    res.status(400).json({ error: "Invalid rootHash" });
    return;
  }

  const normalized = `0x${hexOnly.toLowerCase()}`;

  // Serve from cache if fresh
  const cached = assetCache.get(normalized);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    res.setHeader("Content-Type", cached.contentType);
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    res.setHeader("X-Cache", "HIT");
    res.send(cached.data);
    return;
  }

  try {
    const data        = await downloadRawFile(normalized);
    const contentType = sniffContentType(data);

    assetCache.set(normalized, { data, contentType, cachedAt: Date.now() });

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    res.setHeader("X-Cache", "MISS");
    res.send(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: "Failed to fetch asset from 0G Storage", detail: msg });
  }
});

export default router;
