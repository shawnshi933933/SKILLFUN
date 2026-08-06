/**
 * Creator skill management API
 *
 * GET /api/creator/skills?wallet=0x...
 *   Returns all minted Skill NFTs owned by the connected wallet, enriched with
 *   live on-chain base price and ownership status.
 */

import { Router } from "express";
import { createPublicClient, http, formatUnits } from "viem";
import { db } from "@workspace/db";
import { skillsTable, curatorAuthorizationsTable } from "@workspace/db";
import { eq, and, inArray, isNull } from "drizzle-orm";
import { SkillNFTV3_ABI, getAddresses, ZEROG_MAINNET } from "@workspace/abi";
import { apiError, ErrorCode } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

const router = Router();
const CHAIN_ID        = 16661;
const SKILL_NFT_ADDR  = getAddresses(CHAIN_ID).SkillNFT as `0x${string}`;

const chainClient = createPublicClient({
  chain: ZEROG_MAINNET,
  transport: http(process.env.ZEROG_RPC_URL ?? "https://evmrpc.0g.ai"),
});

export interface CreatorSkillEntry {
  skillId:        string;
  tokenId:        number;
  repoUrl:        string;
  skillName:      string;
  mintStatus:     string;
  contentVersion: number;
  rootHash:       string | null;
  /** On-chain base price in W0G wei (decimal string) */
  basePrice:      string;
  /** True if the NFT owner matches the query wallet (live on-chain check) */
  isOwner:        boolean;
  /** Live on-chain NFT owner address */
  nftOwner:       string | null;
  /** True if NFT is held by a real wallet (not SkillNFT contract) */
  isClaimed:      boolean;
  meta:           Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// GET /api/creator/skills?wallet=0x...
// ---------------------------------------------------------------------------

router.get("/creator/skills", async (req, res) => {
  const rawWallet = req.query.wallet as string | undefined;
  if (!rawWallet || !/^0x[0-9a-fA-F]{40}$/.test(rawWallet)) {
    apiError(res, ErrorCode.INVALID_INPUT, "wallet query parameter must be a valid EVM address (0x...)");
    return;
  }
  const wallet = rawWallet.toLowerCase();

  // 1. Fetch all minted skills where ownerAddress = wallet (DB-level filter)
  const dbSkills = await db
    .select()
    .from(skillsTable)
    .where(
      and(
        eq(skillsTable.ownerAddress, wallet),
        inArray(skillsTable.mintStatus, ["minted", "claimed"]),
      )
    )
    .orderBy(skillsTable.createdAt);

  // Also include skills with tokenId where on-chain owner might be this wallet
  // (handles the case where ownerAddress wasn't updated after a transfer)
  const mintedWithTokenId = dbSkills.filter(s => s.tokenId != null);

  // 2. Batch on-chain reads: ownerOf + basePrice per tokenId
  const onChainMap = new Map<number, { owner: string; basePrice: bigint }>();
  await Promise.all(
    mintedWithTokenId.map(async (skill) => {
      try {
        const [owner, price] = await Promise.all([
          chainClient.readContract({
            address: SKILL_NFT_ADDR,
            abi: SkillNFTV3_ABI,
            functionName: "ownerOf",
            args: [BigInt(skill.tokenId!)],
          }) as Promise<string>,
          chainClient.readContract({
            address: SKILL_NFT_ADDR,
            abi: SkillNFTV3_ABI,
            functionName: "basePrice",
            args: [BigInt(skill.tokenId!)],
          }) as Promise<bigint>,
        ]);
        onChainMap.set(skill.tokenId!, { owner: owner.toLowerCase(), basePrice: price });
      } catch (err) {
        logger.warn({ err, tokenId: skill.tokenId }, "creator: on-chain read failed");
        onChainMap.set(skill.tokenId!, { owner: wallet, basePrice: 0n });
      }
    })
  );

  // 3. Build response — include only skills where wallet is the on-chain owner
  const skills: CreatorSkillEntry[] = [];

  for (const skill of mintedWithTokenId) {
    if (skill.tokenId == null) continue;
    const on      = onChainMap.get(skill.tokenId);
    const nftOwner = on?.owner ?? null;
    const isOwner  = nftOwner === wallet;

    // Skip if wallet no longer owns this NFT
    if (!isOwner) continue;

    const isClaimed = nftOwner !== null && nftOwner !== SKILL_NFT_ADDR.toLowerCase();
    const meta      = (skill.meta as Record<string, unknown>) ?? {};
    const skillName = (meta.name as string) || skill.repoUrl.split("/").pop() || skill.skillId;

    skills.push({
      skillId:        skill.skillId,
      tokenId:        skill.tokenId,
      repoUrl:        skill.repoUrl,
      skillName,
      mintStatus:     skill.mintStatus,
      contentVersion: skill.contentVersion,
      rootHash:       skill.rootHash,
      basePrice:      (on?.basePrice ?? 0n).toString(),
      isOwner,
      nftOwner,
      isClaimed,
      meta,
    });
  }

  res.json({ skills, wallet });
});

// ---------------------------------------------------------------------------
// GET /api/creator/skills/:skillId/authorizations
// Returns the list of curators who have authorized this skill + counts.
// Public-read — data is visible on-chain anyway.
// ---------------------------------------------------------------------------

router.get("/creator/skills/:skillId/authorizations", async (req, res) => {
  const { skillId } = req.params;

  const [skill] = await db
    .select({ tokenId: skillsTable.tokenId })
    .from(skillsTable)
    .where(eq(skillsTable.skillId, skillId))
    .limit(1);

  if (!skill || skill.tokenId == null) {
    res.json({ curators: [], activeCount: 0, revokedCount: 0 });
    return;
  }

  const rows = await db
    .select({
      curatorWallet: curatorAuthorizationsTable.curatorWallet,
      authorizedAt:  curatorAuthorizationsTable.authorizedAt,
      revokedAt:     curatorAuthorizationsTable.revokedAt,
      authEpoch:     curatorAuthorizationsTable.authEpoch,
    })
    .from(curatorAuthorizationsTable)
    .where(eq(curatorAuthorizationsTable.tokenId, skill.tokenId))
    .orderBy(curatorAuthorizationsTable.authorizedAt);

  const curators = rows.map((r) => ({
    curatorWallet: r.curatorWallet,
    authorizedAt:  r.authorizedAt?.toISOString() ?? null,
    revokedAt:     r.revokedAt?.toISOString() ?? null,
    isActive:      r.revokedAt === null && r.authEpoch !== -1,
  }));

  res.json({
    curators,
    activeCount:  curators.filter((c) => c.isActive).length,
    revokedCount: curators.filter((c) => !c.isActive).length,
  });
});

export default router;
