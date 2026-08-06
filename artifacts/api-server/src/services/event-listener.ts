/**
 * On-chain event listener for SkillNFT v4 events.
 *
 * Uses block-range polling (every 30s) rather than WebSocket subscriptions
 * since the 0G RPC doesn't guarantee stable WebSocket connections.
 *
 * Watched events:
 *   Authorization(from, to, tokenId) → upsert curator_authorizations
 *   AuthorizationsPurged(tokenId)    → mark all curator_authorizations revoked; clear content cache
 *   DataHashUpdated(tokenId, ...)    → clear content cache; update rootHash + bump contentVersion
 */

import { createPublicClient, http, parseAbi } from "viem";
import { db } from "@workspace/db";
import {
  curatorAuthorizationsTable,
  skillContentCacheTable,
  skillsTable,
} from "@workspace/db";
import { eq, isNull } from "drizzle-orm";
import { ZEROG_MAINNET, SkillNFTV3_ABI, getAddresses } from "@workspace/abi";
import { logger } from "../lib/logger.js";
import { nanoid } from "nanoid";

const CHAIN_ID = 16661;
const SKILL_NFT_ADDRESS = getAddresses(CHAIN_ID).SkillNFT as `0x${string}`;
const POLL_INTERVAL_MS  = 30_000;
const BLOCK_CHUNK       = 2000n; // max blocks per getLogs call

const client = createPublicClient({
  chain: ZEROG_MAINNET,
  transport: http(process.env.ZEROG_RPC_URL ?? "https://evmrpc.0g.ai"),
});

// Typed event ABI fragments
const EVENTS_ABI = parseAbi([
  "event Authorization(address indexed _from, address indexed _to, uint256 indexed _tokenId)",
  "event AuthorizationsPurged(uint256 indexed tokenId)",
  "event DataHashUpdated(uint256 indexed tokenId, bytes32 oldHash, bytes32 newHash)",
]);

const AUTH_EVENT         = EVENTS_ABI[0];
const AUTH_PURGED_EVENT  = EVENTS_ABI[1];
const DATA_UPDATED_EVENT = EVENTS_ABI[2];

let lastProcessedBlock: bigint | null = null;
let running = false;

// ---------------------------------------------------------------------------
// Polling loop
// ---------------------------------------------------------------------------

async function processRange(fromBlock: bigint, toBlock: bigint): Promise<void> {
  try {
    const [authLogs, purgedLogs, dataLogs] = await Promise.all([
      client.getLogs({ address: SKILL_NFT_ADDRESS, event: AUTH_EVENT,         fromBlock, toBlock }),
      client.getLogs({ address: SKILL_NFT_ADDRESS, event: AUTH_PURGED_EVENT,  fromBlock, toBlock }),
      client.getLogs({ address: SKILL_NFT_ADDRESS, event: DATA_UPDATED_EVENT, fromBlock, toBlock }),
    ]);

    // ── Authorization(from, to, tokenId) ──────────────────────────────────
    for (const log of authLogs) {
      const curatorWallet = (log.args._to as string | undefined)?.toLowerCase();
      const tokenIdBig    = log.args._tokenId as bigint | undefined;
      if (!curatorWallet || tokenIdBig == null) continue;
      const tokenId = Number(tokenIdBig);

      // authEpoch is not present in the current contract (v6+); default to 0.
      const authEpoch = 0;

      await db.insert(curatorAuthorizationsTable)
        .values({
          id:           `ca_${nanoid(20)}`,
          tokenId,
          curatorWallet,
          authEpoch,
          revokedAt: null,
        })
        .onConflictDoUpdate({
          target: [curatorAuthorizationsTable.tokenId, curatorAuthorizationsTable.curatorWallet],
          set: { authEpoch, revokedAt: null, authorizedAt: new Date() },
        });

      logger.info({ tokenId, curatorWallet, authEpoch }, "event-listener: Authorization upserted");
    }

    // ── AuthorizationsPurged(tokenId) ──────────────────────────────────────
    for (const log of purgedLogs) {
      const tokenIdBig = log.args.tokenId as bigint | undefined;
      if (tokenIdBig == null) continue;
      const tokenId = Number(tokenIdBig);

      // Mark all curator_authorizations for this tokenId as revoked
      await db.update(curatorAuthorizationsTable)
        .set({ revokedAt: new Date() })
        .where(eq(curatorAuthorizationsTable.tokenId, tokenId));

      // Clear content cache
      await db.delete(skillContentCacheTable)
        .where(eq(skillContentCacheTable.tokenId, tokenId));

      logger.info({ tokenId }, "event-listener: AuthorizationsPurged — cache cleared, auths revoked");
    }

    // ── DataHashUpdated(tokenId, oldHash, newHash) ─────────────────────────
    for (const log of dataLogs) {
      const tokenIdBig = log.args.tokenId as bigint | undefined;
      const newHash    = log.args.newHash  as `0x${string}` | undefined;
      if (tokenIdBig == null) continue;
      const tokenId = Number(tokenIdBig);

      // Clear content cache
      await db.delete(skillContentCacheTable)
        .where(eq(skillContentCacheTable.tokenId, tokenId));

      // Update rootHash + bump contentVersion; also read mintStatus so we know
      // whether to flag curators for re-auth (see below).
      let mintStatus: string | null = null;
      if (newHash) {
        const [existing] = await db
          .select({ contentVersion: skillsTable.contentVersion, mintStatus: skillsTable.mintStatus })
          .from(skillsTable)
          .where(eq(skillsTable.tokenId, tokenId))
          .limit(1);

        if (existing) {
          mintStatus = existing.mintStatus;
          await db.update(skillsTable)
            .set({ rootHash: newHash, contentVersion: existing.contentVersion + 1, updatedAt: new Date() })
            .where(eq(skillsTable.tokenId, tokenId));
        }
      }

      // ── curator re-auth flagging ────────────────────────────────────────────
      // DataHashUpdated fires for two different callers:
      //   • authorizedUpdateDataHash  (curator-initiated, only valid for unclaimed skills)
      //   • updateDataHash            (creator/owner-initiated, only valid for claimed skills)
      //
      // For UNCLAIMED skills: the update always goes through prepare-sync, which
      // already marks OTHER curators with authEpoch = -1 while excluding the
      // syncing curator. Repeating it here would wrongly re-flag the syncing
      // curator, so we skip the update entirely for unclaimed skills.
      //
      // For CLAIMED skills: the creator pushed new content — all curators must
      // re-review, so we apply the authEpoch = -1 update as before.
      let curatorsMarked = 0;
      if (mintStatus !== "minted") {
        // claimed (or unknown) — flag all curators for re-auth
        const { rowCount } = await db
          .update(curatorAuthorizationsTable)
          .set({ authEpoch: -1 })
          .where(
            eq(curatorAuthorizationsTable.tokenId, tokenId)
            // isNull check omitted intentionally: re-flag even curators whose
            // revokedAt was set by a prior AuthorizationsPurged so they see new content.
          );
        curatorsMarked = rowCount ?? 0;
      }

      logger.info(
        { tokenId, newHash, mintStatus, curatorsMarked,
          skippedReason: mintStatus === "minted" ? "unclaimed — prepare-sync handles re-auth" : undefined },
        "event-listener: DataHashUpdated — cache cleared",
      );
    }

    const total = authLogs.length + purgedLogs.length + dataLogs.length;
    if (total > 0) {
      logger.info({ fromBlock: fromBlock.toString(), toBlock: toBlock.toString(), auth: authLogs.length, purged: purgedLogs.length, data: dataLogs.length }, "event-listener: processed");
    }
  } catch (err) {
    logger.warn({ err, fromBlock: fromBlock.toString(), toBlock: toBlock.toString() }, "event-listener: getLogs failed");
  }
}

async function pollOnce(): Promise<void> {
  try {
    const currentBlock = await client.getBlockNumber();

    if (lastProcessedBlock === null) {
      // On first run, start from recent history (last ~1000 blocks ≈ ~30 min on 0G)
      lastProcessedBlock = currentBlock > 1000n ? currentBlock - 1000n : 0n;
    }

    if (currentBlock <= lastProcessedBlock) return;

    let from = lastProcessedBlock + 1n;
    while (from <= currentBlock) {
      const to = (from + BLOCK_CHUNK - 1n) < currentBlock ? (from + BLOCK_CHUNK - 1n) : currentBlock;
      await processRange(from, to);
      from = to + 1n;
    }

    lastProcessedBlock = currentBlock;
  } catch (err) {
    logger.warn({ err }, "event-listener: poll error");
  }
}

export function startEventListener(): void {
  if (running) return;
  running = true;
  logger.info({ address: SKILL_NFT_ADDRESS, interval: POLL_INTERVAL_MS }, "event-listener: starting");

  void pollOnce();
  const interval = setInterval(() => { void pollOnce(); }, POLL_INTERVAL_MS);
  interval.unref();
}
