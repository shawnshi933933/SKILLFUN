-- Migration: add tx_hash column to pending_claims
-- Stores the on-chain transaction hash when a creator calls SkillNFT.claim().
ALTER TABLE "pending_claims" ADD COLUMN IF NOT EXISTS "tx_hash" text;
