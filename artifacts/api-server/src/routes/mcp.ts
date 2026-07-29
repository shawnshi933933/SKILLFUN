/**
 * POST /api/mcp/payment/prove
 *
 * Called by AI agents after paying on-chain via invokeSkill(tokenId).
 * Verifies the tx on 0G Chain, issues a long-lived proof token bound
 * to (skillId, contentVersion). Idempotent: same tx re-issues the same token.
 *
 * Flow:
 *   1. eth_getTransactionReceipt(txHash) on 0G Chain
 *   2. Confirm tx status=success, to=SkillNFT contract
 *   3. Decode input: confirm invokeSkill(tokenId) with matching tokenId
 *   4. Look up skill by tokenId → get skillId + contentVersion
 *   5. Upsert into payment_proofs (idempotent by unique constraint)
 *   6. Return { proof, skillId, contentVersion, expiresAt: null }
 */

import { Router } from "express";
import crypto from "node:crypto";
import { createPublicClient, http, decodeFunctionData, recoverMessageAddress } from "viem";
import { db } from "@workspace/db";
import { skillsTable, paymentProofsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { SkillNFT_ABI, getAddresses, ZEROG_MAINNET } from "@workspace/abi";
import { apiError, ErrorCode } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

const router = Router();

const CHAIN_ID = 16661;
const addresses = getAddresses(CHAIN_ID);
const SKILL_NFT_ADDRESS = addresses.SkillNFT.toLowerCase();

const client = createPublicClient({
  chain: ZEROG_MAINNET,
  transport: http(process.env.ZEROG_RPC_URL ?? "https://evmrpc.0g.ai"),
});

// POST /api/mcp/payment/prove
router.post("/mcp/payment/prove", async (req, res) => {
  const { txHash, tokenId: rawTokenId, agentWallet: rawWallet, signature } = req.body as {
    txHash?:      string;
    tokenId?:     number | string;
    agentWallet?: string;
    /** EIP-191 personal_sign of the message "SkillFun payment proof: {txHash}" */
    signature?:   string;
  };

  if (!txHash || rawTokenId == null || !rawWallet || !signature) {
    apiError(res, ErrorCode.INVALID_INPUT, "txHash, tokenId, agentWallet, and signature are required");
    return;
  }

  const tokenId   = Number(rawTokenId);
  const agentWallet = rawWallet.toLowerCase();

  if (!Number.isFinite(tokenId) || tokenId < 0) {
    apiError(res, ErrorCode.INVALID_INPUT, "tokenId must be a non-negative integer");
    return;
  }

  if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    apiError(res, ErrorCode.INVALID_INPUT, "txHash must be a valid 0x-prefixed 32-byte hex string");
    return;
  }

  // ── 1. Fetch tx receipt on-chain ────────────────────────────────────────────
  let receipt: Awaited<ReturnType<typeof client.getTransactionReceipt>>;
  try {
    receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });
  } catch (err) {
    logger.warn({ err, txHash }, "mcp/prove: tx receipt fetch failed");
    apiError(res, ErrorCode.RPC_ERROR, "Transaction not found or still pending. Please wait for confirmation.");
    return;
  }

  // ── 2. Confirm tx succeeded and targeted SkillNFT ──────────────────────────
  if (receipt.status !== "success") {
    apiError(res, ErrorCode.INVALID_INPUT, "Transaction failed on-chain. No payment proof issued.");
    return;
  }

  if (receipt.to?.toLowerCase() !== SKILL_NFT_ADDRESS) {
    apiError(res, ErrorCode.INVALID_INPUT,
      `Transaction was not sent to the SkillNFT contract (${SKILL_NFT_ADDRESS}). Got: ${receipt.to}`
    );
    return;
  }

  // ── 3. Decode tx input to confirm invokeSkill(tokenId) ─────────────────────
  let tx: Awaited<ReturnType<typeof client.getTransaction>>;
  try {
    tx = await client.getTransaction({ hash: txHash as `0x${string}` });
  } catch (err) {
    logger.warn({ err, txHash }, "mcp/prove: tx fetch failed");
    apiError(res, ErrorCode.RPC_ERROR, "Failed to fetch transaction details.");
    return;
  }

  let decoded: { functionName: string; args: readonly unknown[] };
  try {
    decoded = decodeFunctionData({ abi: SkillNFT_ABI as readonly object[], data: tx.input });
  } catch {
    apiError(res, ErrorCode.INVALID_INPUT, "Transaction does not call a known SkillNFT function.");
    return;
  }

  if (decoded.functionName !== "invokeSkill") {
    apiError(res, ErrorCode.INVALID_INPUT,
      `Expected invokeSkill, but transaction calls "${decoded.functionName}".`
    );
    return;
  }

  const calledTokenId = Number(decoded.args[0]);
  if (calledTokenId !== tokenId) {
    apiError(res, ErrorCode.INVALID_INPUT,
      `Transaction calls invokeSkill(${calledTokenId}), but you claimed tokenId=${tokenId}.`
    );
    return;
  }

  // ── 3b. Verify caller owns tx.from via signed challenge ────────────────────
  // Agent must sign the deterministic message: "SkillFun payment proof: {txHash}"
  // Server recovers the signer address and asserts it equals tx.from.
  // This prevents anyone from claiming a proof for a tx they didn't submit.
  const proofMessage = `SkillFun payment proof: ${txHash}`;
  let recoveredSigner: string;
  try {
    recoveredSigner = (await recoverMessageAddress({
      message: proofMessage,
      signature: signature as `0x${string}`,
    })).toLowerCase();
  } catch {
    apiError(res, ErrorCode.INVALID_INPUT, "Invalid signature — cannot recover signer address.");
    return;
  }

  const txFrom = tx.from.toLowerCase();
  if (recoveredSigner !== txFrom) {
    apiError(res, ErrorCode.FORBIDDEN,
      `Signature mismatch: recovered ${recoveredSigner}, but tx.from is ${txFrom}. ` +
      `Sign the message "SkillFun payment proof: ${txHash}" with the wallet that submitted the transaction.`
    );
    return;
  }
  const confirmedWallet = txFrom;

  // ── 4. Look up skill by tokenId ─────────────────────────────────────────────
  const [skill] = await db
    .select()
    .from(skillsTable)
    .where(eq(skillsTable.tokenId, tokenId))
    .limit(1);

  if (!skill) {
    apiError(res, ErrorCode.NOT_FOUND,
      `No skill found for tokenId=${tokenId}. The token may not be registered in SkillFun.`
    );
    return;
  }

  // ── 5. Idempotency: check if this exact txHash was already used ─────────────
  // txHash is globally unique in payment_proofs — one tx can produce at most one proof ever.
  // This prevents replaying an old invokeSkill tx to get a proof for a newer contentVersion.
  const [existingByTx] = await db
    .select()
    .from(paymentProofsTable)
    .where(eq(paymentProofsTable.txHash, txHash))
    .limit(1);

  if (existingByTx) {
    logger.info({ skillId: skill.skillId, txHash, confirmedWallet }, "mcp/prove: txHash already used — returning existing proof");
    res.json({
      proof:          existingByTx.token,
      skillId:        existingByTx.skillId,
      contentVersion: existingByTx.contentVersion,
      expiresAt:      null,
      reissued:       true,
    });
    return;
  }

  // ── 6. Issue new proof token ────────────────────────────────────────────────
  // Each distinct txHash produces exactly one proof token.
  // Multiple valid tokens per (skill, version, wallet) are allowed (agent double-paid — their loss).
  // Replay is prevented solely by txHash uniqueness above.
  const token = crypto.randomBytes(32).toString("hex");

  await db.insert(paymentProofsTable).values({
    token,
    skillId:        skill.skillId,
    contentVersion: skill.contentVersion,
    agentWallet:    confirmedWallet,
    txHash,
    expiresAt:      null,
  });

  logger.info({ skillId: skill.skillId, contentVersion: skill.contentVersion, confirmedWallet, txHash }, "mcp/prove: proof issued");

  res.status(201).json({
    proof:          token,
    skillId:        skill.skillId,
    contentVersion: skill.contentVersion,
    expiresAt:      null,
    reissued:       false,
  });
});

export default router;
