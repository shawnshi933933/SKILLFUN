import {
  pgTable,
  text,
  integer,
  timestamp,
  pgEnum,
  jsonb,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const mintStatusEnum = pgEnum("mint_status", [
  "pending",    // registered in DB, not yet on-chain
  "minting",    // tx submitted, waiting confirmation
  "minted",     // on-chain, held by contract (self-custody)
  "claimed",    // transferred to creator wallet
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "pending",
  "approved",
  "rejected",
]);

export const claimStatusEnum = pgEnum("claim_status", [
  "pending",    // awaiting cold wallet Oracle update
  "approved",   // Oracle updated, user can now call claim()
  "rejected",   // rejected by platform
  "completed",  // user called claim() on-chain
]);

// ---------------------------------------------------------------------------
// skills
// ---------------------------------------------------------------------------
export const skillsTable = pgTable(
  "skills",
  {
    skillId:       text("skill_id").primaryKey(),             // sk_xxxxxxxxxxxxxxxxxxxx
    tokenId:       integer("token_id"),                       // null until minted on-chain
    repoUrl:       text("repo_url").notNull(),                // e.g. "alice/weather-skill"
    skillUri:      text("skill_uri"),                         // 0G Storage metadata URI
    rootHash:       text("root_hash"),                         // 0G Storage root hash (bytes32 hex)
    contentVersion: integer("content_version").notNull().default(1), // increments on each rootHash update
    manifestOwner: text("manifest_owner").notNull(),          // GitHub repo path (locked at mint)
    mintStatus:    mintStatusEnum("mint_status").notNull().default("pending"),
    reviewStatus:  reviewStatusEnum("review_status").notNull().default("pending"),
    ownerAddress:  text("owner_address"),                     // submitter's EVM address
    /** Per-skill AES-256-GCM key (hex, 32 bytes). Null for skills encrypted with the
     *  legacy platform-wide key (SESSION_SECRET). New skills always have a per-skill key. */
    aesKey:        text("aes_key"),
    meta:          jsonb("meta").$type<Record<string, unknown>>().default({}),
    createdAt:     timestamp("created_at").notNull().defaultNow(),
    updatedAt:     timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("skills_token_id_idx").on(t.tokenId),
    index("skills_owner_idx").on(t.ownerAddress),
    index("skills_mint_status_idx").on(t.mintStatus),
  ]
);

export const insertSkillSchema = createInsertSchema(skillsTable).omit({
  createdAt: true,
  updatedAt: true,
});
export const selectSkillSchema = createSelectSchema(skillsTable);
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skillsTable.$inferSelect;

// ---------------------------------------------------------------------------
// bundles
// ---------------------------------------------------------------------------
export const bundlesTable = pgTable(
  "bundles",
  {
    bundleId:    text("bundle_id").primaryKey(),             // bd_xxxxxxxxxxxxxxxxxxxx
    subdomain:   text("subdomain").notNull(),                // e.g. "defi-tools"
    name:        text("name").notNull(),
    description: text("description"),
    workflow:    text("workflow"),                            // MCP orchestration playbook shown to agents on initialize
    ownerAddress: text("owner_address").notNull(),           // EVM address of bundle creator (= Curator wallet)
    /** x402 price in W0G wei that agents must transfer to ownerAddress per access.
     *  Null means free (no x402 payment required). */
    servicePrice: text("service_price"),
    meta:        jsonb("meta").$type<Record<string, unknown>>().default({}),
    createdAt:   timestamp("created_at").notNull().defaultNow(),
    updatedAt:   timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("bundles_subdomain_unique").on(t.subdomain),
    index("bundles_owner_idx").on(t.ownerAddress),
  ]
);

export const insertBundleSchema = createInsertSchema(bundlesTable).omit({
  createdAt: true,
  updatedAt: true,
});
export const selectBundleSchema = createSelectSchema(bundlesTable);
export type InsertBundle = z.infer<typeof insertBundleSchema>;
export type Bundle = typeof bundlesTable.$inferSelect;

// ---------------------------------------------------------------------------
// bundle_skills (join table with ordering)
// ---------------------------------------------------------------------------
export const bundleSkillsTable = pgTable(
  "bundle_skills",
  {
    bundleId:  text("bundle_id").notNull().references(() => bundlesTable.bundleId, { onDelete: "cascade" }),
    skillId:   text("skill_id").notNull().references(() => skillsTable.skillId, { onDelete: "cascade" }),
    position:  integer("position").notNull().default(0),
    addedAt:   timestamp("added_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("bundle_skills_pk").on(t.bundleId, t.skillId),
    index("bundle_skills_bundle_idx").on(t.bundleId),
  ]
);

export type BundleSkill = typeof bundleSkillsTable.$inferSelect;

// ---------------------------------------------------------------------------
// pending_claims
// ---------------------------------------------------------------------------
export const pendingClaimsTable = pgTable(
  "pending_claims",
  {
    id:             text("id").primaryKey(),
    tokenId:        integer("token_id").notNull(),
    githubUsername: text("github_username").notNull(),
    walletAddress:  text("wallet_address").notNull(),
    status:         claimStatusEnum("status").notNull().default("pending"),
    createdAt:      timestamp("created_at").notNull().defaultNow(),
    updatedAt:      timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    // One claim record per on-chain token. Enforces uniqueness atomically at
    // the DB level — concurrent insert attempts hit this constraint, making
    // the application-level duplicate check a fast-path optimisation only.
    uniqueIndex("pending_claims_token_unique").on(t.tokenId),
    index("pending_claims_wallet_idx").on(t.walletAddress),
    index("pending_claims_status_idx").on(t.status),
  ]
);

export type PendingClaim = typeof pendingClaimsTable.$inferSelect;

// ---------------------------------------------------------------------------
// github_verifications
// ---------------------------------------------------------------------------
export const githubVerificationsTable = pgTable(
  "github_verifications",
  {
    id:             text("id").primaryKey(),
    githubUsername: text("github_username").notNull(),
    evmAddress:     text("evm_address").notNull(),
    verifiedAt:     timestamp("verified_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("github_verifications_username_unique").on(t.githubUsername),
    index("github_verifications_evm_idx").on(t.evmAddress),
  ]
);

export type GithubVerification = typeof githubVerificationsTable.$inferSelect;

// ---------------------------------------------------------------------------
// payment_proofs  (MCP x402 — one proof per agent per skill version)
// ---------------------------------------------------------------------------
export const paymentProofsTable = pgTable(
  "payment_proofs",
  {
    token:          text("token").primaryKey(),                   // opaque 32-byte hex
    skillId:        text("skill_id").notNull().references(() => skillsTable.skillId, { onDelete: "cascade" }),
    contentVersion: integer("content_version").notNull(),         // skill.contentVersion at issuance
    agentWallet:    text("agent_wallet").notNull(),               // EVM address of the agent
    txHash:         text("tx_hash").notNull(),                    // on-chain tx; unique per (txHash, bundleId)
    /** Bundle the proof was issued for. Null on legacy records (pre-v5 x402 flow).
     *  Prevents cross-bundle replay: a proof issued for bundleA cannot be used on bundleB. */
    bundleId:       text("bundle_id"),
    issuedAt:       timestamp("issued_at").notNull().defaultNow(),
    expiresAt:      timestamp("expires_at"),                     // null = version-gated only
  },
  (t) => [
    index("payment_proofs_skill_idx").on(t.skillId),
    index("payment_proofs_wallet_idx").on(t.agentWallet),
    index("payment_proofs_bundle_idx").on(t.bundleId),
    // One (txHash, bundleId) pair can ever produce one proof
    // (prevents replaying the same payment across bundles or across versions)
    uniqueIndex("payment_proofs_tx_bundle_unique").on(t.txHash, t.bundleId),
  ]
);

export type PaymentProof = typeof paymentProofsTable.$inferSelect;

// ---------------------------------------------------------------------------
// curator_authorizations  (tracks who authorized which skill + epoch)
// ---------------------------------------------------------------------------
export const curatorAuthorizationsTable = pgTable(
  "curator_authorizations",
  {
    id:           text("id").primaryKey(),                      // ca_xxxx
    tokenId:      integer("token_id").notNull(),
    curatorWallet: text("curator_wallet").notNull(),            // lowercased EVM address
    authEpoch:    integer("auth_epoch").notNull().default(0),   // epoch at authorization time
    authorizedAt: timestamp("authorized_at").notNull().defaultNow(),
    revokedAt:    timestamp("revoked_at"),                      // set when AuthorizationsPurged fires
  },
  (t) => [
    uniqueIndex("curator_auth_token_wallet_unique").on(t.tokenId, t.curatorWallet),
    index("curator_auth_token_idx").on(t.tokenId),
    index("curator_auth_wallet_idx").on(t.curatorWallet),
  ]
);

export type CuratorAuthorization = typeof curatorAuthorizationsTable.$inferSelect;

// ---------------------------------------------------------------------------
// skill_content_cache  (server-side decrypted content cache)
// ---------------------------------------------------------------------------
export const skillContentCacheTable = pgTable(
  "skill_content_cache",
  {
    tokenId:        integer("token_id").primaryKey(),
    contentVersion: integer("content_version").notNull(),
    decryptedContent: text("decrypted_content").notNull(),
    cachedAt:       timestamp("cached_at").notNull().defaultNow(),
  }
);

export type SkillContentCache = typeof skillContentCacheTable.$inferSelect;
