import { createHash } from "crypto";
import { logger } from "../lib/logger.js";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

// TTL presets in milliseconds
export const TTL = {
  BALANCE:        15_000,   // 15 s  — strong realtime
  ORACLE:         30_000,   // 30 s  — near-realtime
  SKILL_METADATA: 300_000,  // 5 min — low-frequency change
} as const;

const store = new Map<string, CacheEntry<unknown>>();

/**
 * Build a canonical cache key.
 * Format: {chainId}:{method}:{paramsHash}
 */
export function cacheKey(chainId: number, method: string, params?: unknown): string {
  const paramsHash = params !== undefined
    ? createHash("sha256").update(JSON.stringify(params)).digest("hex").slice(0, 16)
    : "noparams";
  return `${chainId}:${method}:${paramsHash}`;
}

export function get<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) {
    logger.debug({ key, result: "miss" }, "cache");
    return undefined;
  }
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    logger.debug({ key, result: "expired" }, "cache");
    return undefined;
  }
  logger.debug({ key, result: "hit" }, "cache");
  return entry.value as T;
}

export function set<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/** Remove a single key. */
export function invalidate(key: string): void {
  store.delete(key);
  logger.debug({ key }, "cache invalidated");
}

/** Remove all keys that start with the given prefix. */
export function invalidatePrefix(prefix: string): void {
  let count = 0;
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
      count++;
    }
  }
  logger.debug({ prefix, count }, "cache prefix invalidated");
}

/**
 * Wrap an async function with the cache.
 * Errors are NOT cached — only successful results are stored.
 */
export async function cached<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T> {
  const hit = get<T>(key);
  if (hit !== undefined) return hit;

  const value = await fn(); // throws on error — not cached
  set(key, value, ttlMs);
  return value;
}
