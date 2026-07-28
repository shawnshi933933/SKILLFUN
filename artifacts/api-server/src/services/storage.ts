/**
 * 0G Storage upload service.
 *
 * Uploads a skill manifest JSON to 0G Storage mainnet via the indexer RPC.
 * Falls back to a deterministic keccak256 hash if the upload fails, so the
 * rest of the mint pipeline can always proceed.
 *
 * Peer dep: ethers (required by @0glabs/0g-ts-sdk)
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { keccak256, toBytes } from "viem";
import { logger } from "../lib/logger.js";

const INDEXER_RPC =
  process.env.ZG_INDEXER_RPC ??
  "https://indexer-storage-mainnet-standard.0g.ai";

const EVM_RPC = process.env.ZEROG_RPC_URL ?? "https://evmrpc.0g.ai";

export interface UploadResult {
  rootHash: `0x${string}`;
  skillUri: string;
  /** true if we actually uploaded to 0G Storage; false = local-hash fallback */
  uploaded: boolean;
}

/**
 * Upload skill content to 0G Storage and return the content hash.
 *
 * @param manifest    Metadata envelope — always included in the upload.
 * @param rawContent  Optional raw file fetched from GitHub (skill.md / skillfun.json).
 *                    When provided, THIS is what gets uploaded so the rootHash
 *                    anchors the real skill definition, not just form data.
 *                    The manifest is JSON-stringified and appended as a comment
 *                    so both are preserved in the same blob.
 *
 * Falls back to keccak256 if upload fails so the mint pipeline always proceeds.
 */
export async function uploadSkillManifest(
  manifest: Record<string, unknown>,
  rawContent?: string
): Promise<UploadResult> {
  // Build the blob to upload:
  //   • If we have the real GitHub file content, upload that (with a metadata footer).
  //   • Otherwise upload the manifest JSON envelope.
  const uploadBlob = rawContent
    ? `${rawContent}\n\n<!-- skillfun-manifest\n${JSON.stringify(manifest, null, 2)}\n-->`
    : JSON.stringify(manifest, null, 2);

  const json      = uploadBlob;   // kept for naming consistency below
  const jsonBytes = Buffer.from(uploadBlob, "utf8");

  // ── Local fallback hash (always computed) ──────────────────────────────────
  const localRootHash = keccak256(toBytes(json)) as `0x${string}`;
  const localSkillUri = `data:text/plain;charset=utf-8,${encodeURIComponent(json.slice(0, 800))}`;

  // ── 0G Storage upload (best-effort) ───────────────────────────────────────
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    logger.warn("DEPLOYER_PRIVATE_KEY not set — using local hash for storage");
    return { rootHash: localRootHash, skillUri: localSkillUri, uploaded: false };
  }

  let tmpFile: string | null = null;
  try {
    // Write content to a temp file (ZgFile.fromFilePath requires a path)
    const ext = rawContent ? (rawContent.trimStart().startsWith("{") ? ".json" : ".md") : ".json";
    tmpFile = path.join(os.tmpdir(), `skillfun-upload-${Date.now()}${ext}`);
    fs.writeFileSync(tmpFile, jsonBytes);

    // Dynamic import to avoid top-level ESM issues
    const { ZgFile, Indexer } = await import("@0glabs/0g-ts-sdk");
    const { ethers }           = await import("ethers");

    const zgFile = await ZgFile.fromFilePath(tmpFile);
    const [tree, treeErr] = await zgFile.merkleTree();

    if (treeErr || !tree) {
      logger.warn({ err: treeErr }, "0G merkle tree failed — using local hash");
      await zgFile.close();
      return { rootHash: localRootHash, skillUri: localSkillUri, uploaded: false };
    }

    const rawRootHash = tree.rootHash() as string;
    const rootHash: `0x${string}` = rawRootHash.startsWith("0x")
      ? (rawRootHash as `0x${string}`)
      : `0x${rawRootHash}`;

    const skillUri = `${INDEXER_RPC}/file?cid=${rootHash}`;

    // Upload
    const provider = new ethers.JsonRpcProvider(EVM_RPC);
    const signer   = new ethers.Wallet(
      privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`,
      provider
    );
    const indexer = new Indexer(INDEXER_RPC);

    const [tx, uploadErr] = await indexer.upload(zgFile, EVM_RPC, signer);
    await zgFile.close();

    if (uploadErr) {
      logger.warn({ err: uploadErr }, "0G Storage upload failed — using local hash");
      return { rootHash: localRootHash, skillUri: localSkillUri, uploaded: false };
    }

    logger.info({ rootHash, tx, indexer: INDEXER_RPC }, "0G Storage upload success");
    return { rootHash, skillUri, uploaded: true };
  } catch (err) {
    logger.warn({ err }, "0G Storage upload threw — using local hash");
    return { rootHash: localRootHash, skillUri: localSkillUri, uploaded: false };
  } finally {
    if (tmpFile) {
      try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
    }
  }
}
