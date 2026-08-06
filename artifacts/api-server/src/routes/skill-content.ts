/**
 * GET /api/skills/:tokenId/content
 *
 * Decryption oracle for Curators.
 *
 * Authentication: EIP-191 personal_sign of "SkillFun content access: {tokenId}"
 *   Header: X-Curator-Wallet   — wallet address
 *   Header: X-Curator-Signature — hex signature
 *
 * Authorization: on-chain isAuthorized(tokenId, curatorWallet)
 *
 * Caching: decrypted content is cached in skill_content_cache per tokenId+contentVersion.
 *   Invalidated by AuthorizationsPurged and DataHashUpdated events (via event-listener.ts).
 */

import { Router } from "express";
import { createPublicClient, http, recoverMessageAddress } from "viem";
import { db } from "@workspace/db";
import {
  skillsTable,
  skillContentCacheTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { ZEROG_MAINNET, SkillNFTV3_ABI, getAddresses } from "@workspace/abi";
import { downloadSkillContent } from "../services/storage.js";
import { apiError, ErrorCode } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

const router = Router();

const CHAIN_ID = 16661;
const SKILL_NFT_ADDRESS = getAddresses(CHAIN_ID).SkillNFT as `0x${string}`;

const chainClient = createPublicClient({
  chain: ZEROG_MAINNET,
  transport: http(process.env.ZEROG_RPC_URL ?? "https://evmrpc.0g.ai"),
});

// GET /api/skills/:tokenId/content
router.get("/skills/:tokenId/content", async (req, res) => {
  const rawTokenId = req.params.tokenId;
  const tokenId = parseInt(rawTokenId, 10);

  if (!Number.isFinite(tokenId) || tokenId < 0) {
    apiError(res, ErrorCode.INVALID_INPUT, "tokenId must be a non-negative integer");
    return;
  }

  // ── 1. Verify curator identity via EIP-191 signature ─────────────────────
  const rawWallet    = req.headers["x-curator-wallet"]    as string | undefined;
  const rawSignature = req.headers["x-curator-signature"] as string | undefined;

  if (!rawWallet || !rawSignature) {
    apiError(res, ErrorCode.UNAUTHORIZED,
      "X-Curator-Wallet and X-Curator-Signature headers are required"
    );
    return;
  }

  const proofMessage = `SkillFun content access: ${tokenId}`;
  let recoveredWallet: string;
  try {
    recoveredWallet = (await recoverMessageAddress({
      message:   proofMessage,
      signature: rawSignature as `0x${string}`,
    })).toLowerCase();
  } catch {
    apiError(res, ErrorCode.INVALID_INPUT, "Invalid signature — cannot recover signer address.");
    return;
  }

  if (recoveredWallet !== rawWallet.toLowerCase()) {
    apiError(res, ErrorCode.FORBIDDEN,
      `Signature mismatch: recovered ${recoveredWallet} but X-Curator-Wallet is ${rawWallet}`
    );
    return;
  }

  const curatorWallet = recoveredWallet;

  // ── 2. Look up skill by tokenId ─────────────────────────────────────────
  const [skill] = await db
    .select()
    .from(skillsTable)
    .where(eq(skillsTable.tokenId, tokenId))
    .limit(1);

  if (!skill) {
    apiError(res, ErrorCode.NOT_FOUND, `No skill found for tokenId=${tokenId}`);
    return;
  }

  if (!skill.rootHash) {
    apiError(res, ErrorCode.NOT_FOUND, "Skill content not yet uploaded to 0G Storage");
    return;
  }

  // ── 3. Check on-chain isAuthorized(tokenId, curatorWallet) ──────────────
  let isAuthorized: boolean;
  try {
    isAuthorized = await chainClient.readContract({
      address: SKILL_NFT_ADDRESS,
      abi: SkillNFTV3_ABI,
      functionName: "isAuthorized",
      args: [BigInt(tokenId), curatorWallet as `0x${string}`],
    }) as boolean;
  } catch (err) {
    logger.error({ err, tokenId, curatorWallet }, "skill-content: isAuthorized check failed");
    apiError(res, ErrorCode.RPC_ERROR,
      "Temporarily unable to verify authorization. Please retry in a few seconds."
    );
    return;
  }

  if (!isAuthorized) {
    res.status(403).json({
      error: "Not authorized",
      message: `Wallet ${curatorWallet} is not authorized for tokenId=${tokenId}. ` +
        `Call selfAuthorize(${tokenId}) (unclaimed) or purchaseAuthorization(${tokenId}) (claimed) on the SkillNFT contract.`,
      tokenId,
      curatorWallet,
    });
    return;
  }

  // ── 4. Check content cache ────────────────────────────────────────────────
  const [cached] = await db
    .select()
    .from(skillContentCacheTable)
    .where(eq(skillContentCacheTable.tokenId, tokenId))
    .limit(1);

  if (cached && cached.contentVersion === skill.contentVersion) {
    logger.info({ tokenId, curatorWallet, contentVersion: skill.contentVersion }, "skill-content: cache hit");
    res.json({
      content:        cached.decryptedContent,
      skillId:        skill.skillId,
      tokenId,
      contentVersion: skill.contentVersion,
      cached:         true,
    });
    return;
  }

  // ── 5. Cache miss — download from 0G Storage and decrypt ──────────────────
  let decryptedContent: string;
  try {
    decryptedContent = await downloadSkillContent(skill.rootHash, skill.aesKey);
    logger.info({ tokenId, curatorWallet, rootHash: skill.rootHash }, "skill-content: downloaded + decrypted");
  } catch (err) {
    logger.error({ err, tokenId, rootHash: skill.rootHash }, "skill-content: download/decrypt failed");
    apiError(res, ErrorCode.RPC_ERROR, "Failed to fetch skill content from 0G Storage. Content may not be finalized yet.");
    return;
  }

  // ── 6. Store in cache ─────────────────────────────────────────────────────
  try {
    await db.insert(skillContentCacheTable)
      .values({
        tokenId,
        contentVersion: skill.contentVersion,
        decryptedContent,
        cachedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: skillContentCacheTable.tokenId,
        set: {
          contentVersion:   skill.contentVersion,
          decryptedContent,
          cachedAt:         new Date(),
        },
      });
  } catch (err) {
    logger.warn({ err, tokenId }, "skill-content: cache write failed (non-fatal)");
  }

  res.json({
    content:        decryptedContent,
    skillId:        skill.skillId,
    tokenId,
    contentVersion: skill.contentVersion,
    cached:         false,
  });
});

export default router;
