-- Migration: add per-skill AES key, bundle servicePrice, curator_authorizations, skill_content_cache
-- Run once against the live DB.

-- 1. Add aes_key column to skills (nullable; null = legacy platform-wide key)
ALTER TABLE "skills" ADD COLUMN IF NOT EXISTS "aes_key" text;

-- 2. Add service_price column to bundles (nullable; null = free bundle)
ALTER TABLE "bundles" ADD COLUMN IF NOT EXISTS "service_price" text;

-- 3. Add workflow column to bundles if not already present (migration guard)
ALTER TABLE "bundles" ADD COLUMN IF NOT EXISTS "workflow" text;

-- 4. Create curator_authorizations table
CREATE TABLE IF NOT EXISTS "curator_authorizations" (
  "id"             text PRIMARY KEY NOT NULL,
  "token_id"       integer NOT NULL,
  "curator_wallet" text NOT NULL,
  "auth_epoch"     integer NOT NULL DEFAULT 0,
  "authorized_at"  timestamp DEFAULT now() NOT NULL,
  "revoked_at"     timestamp
);

CREATE UNIQUE INDEX IF NOT EXISTS "curator_auth_token_wallet_unique"
  ON "curator_authorizations" USING btree ("token_id", "curator_wallet");

CREATE INDEX IF NOT EXISTS "curator_auth_token_idx"
  ON "curator_authorizations" USING btree ("token_id");

CREATE INDEX IF NOT EXISTS "curator_auth_wallet_idx"
  ON "curator_authorizations" USING btree ("curator_wallet");

-- 6. Add bundle_id to payment_proofs (nullable for backward compat with legacy records)
ALTER TABLE "payment_proofs" ADD COLUMN IF NOT EXISTS "bundle_id" text;

-- Replace the old txHash-only unique index with (txHash, bundleId) to scope proofs per bundle
DROP INDEX IF EXISTS "payment_proofs_tx_hash_unique";
CREATE UNIQUE INDEX IF NOT EXISTS "payment_proofs_tx_bundle_unique"
  ON "payment_proofs" USING btree ("tx_hash", "bundle_id");

CREATE INDEX IF NOT EXISTS "payment_proofs_bundle_idx"
  ON "payment_proofs" USING btree ("bundle_id");

-- 7. Create skill_content_cache table
CREATE TABLE IF NOT EXISTS "skill_content_cache" (
  "token_id"          integer PRIMARY KEY NOT NULL,
  "content_version"   integer NOT NULL,
  "decrypted_content" text NOT NULL,
  "cached_at"         timestamp DEFAULT now() NOT NULL
);
