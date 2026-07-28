CREATE TYPE "public"."claim_status" AS ENUM('pending', 'approved', 'rejected', 'completed');--> statement-breakpoint
CREATE TYPE "public"."mint_status" AS ENUM('pending', 'minting', 'minted', 'claimed');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "bundle_skills" (
	"bundle_id" text NOT NULL,
	"skill_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bundles" (
	"bundle_id" text PRIMARY KEY NOT NULL,
	"subdomain" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"owner_address" text NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "github_verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"github_username" text NOT NULL,
	"evm_address" text NOT NULL,
	"verified_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pending_claims" (
	"id" text PRIMARY KEY NOT NULL,
	"token_id" integer NOT NULL,
	"github_username" text NOT NULL,
	"wallet_address" text NOT NULL,
	"status" "claim_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"skill_id" text PRIMARY KEY NOT NULL,
	"token_id" integer,
	"repo_url" text NOT NULL,
	"skill_uri" text,
	"root_hash" text,
	"manifest_owner" text NOT NULL,
	"mint_status" "mint_status" DEFAULT 'pending' NOT NULL,
	"review_status" "review_status" DEFAULT 'pending' NOT NULL,
	"owner_address" text,
	"meta" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bundle_skills" ADD CONSTRAINT "bundle_skills_bundle_id_bundles_bundle_id_fk" FOREIGN KEY ("bundle_id") REFERENCES "public"."bundles"("bundle_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bundle_skills" ADD CONSTRAINT "bundle_skills_skill_id_skills_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("skill_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "bundle_skills_pk" ON "bundle_skills" USING btree ("bundle_id","skill_id");--> statement-breakpoint
CREATE INDEX "bundle_skills_bundle_idx" ON "bundle_skills" USING btree ("bundle_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bundles_subdomain_unique" ON "bundles" USING btree ("subdomain");--> statement-breakpoint
CREATE INDEX "bundles_owner_idx" ON "bundles" USING btree ("owner_address");--> statement-breakpoint
CREATE UNIQUE INDEX "github_verifications_username_unique" ON "github_verifications" USING btree ("github_username");--> statement-breakpoint
CREATE INDEX "github_verifications_evm_idx" ON "github_verifications" USING btree ("evm_address");--> statement-breakpoint
CREATE UNIQUE INDEX "pending_claims_token_unique" ON "pending_claims" USING btree ("token_id");--> statement-breakpoint
CREATE INDEX "pending_claims_wallet_idx" ON "pending_claims" USING btree ("wallet_address");--> statement-breakpoint
CREATE INDEX "pending_claims_status_idx" ON "pending_claims" USING btree ("status");--> statement-breakpoint
CREATE INDEX "skills_token_id_idx" ON "skills" USING btree ("token_id");--> statement-breakpoint
CREATE INDEX "skills_owner_idx" ON "skills" USING btree ("owner_address");--> statement-breakpoint
CREATE INDEX "skills_mint_status_idx" ON "skills" USING btree ("mint_status");