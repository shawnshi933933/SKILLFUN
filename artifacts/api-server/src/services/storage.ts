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
 * Upload a skill manifest JSON blob to 0G Storage and return the content hash.
 * If the private key is missing or upload fails, returns a keccak256 fallback
 * so the on-chain mint can still proceed in the demo.
 */
export async function uploadSkillManifest(
  manifest: Record<string, unknown>
): Promise<UploadResult> {
  const json = JSON.stringify(manifest, null, 2);
  const jsonBytes = Buffer.from(json, "utf8");

  // ── Local fallback hash (always computed) ──────────────────────────────────
  const localRootHash = keccak256(toBytes(json)) as `0x${string}`;
  const localSkillUri = `data:application/json;charset=utf-8,${encodeURIComponent(json.slice(0, 800))}`;

  // ── 0G Storage upload (best-effort) ───────────────────────────────────────
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    logger.warn("DEPLOYER_PRIVATE_KEY not set — using local hash for storage");
    return { rootHash: localRootHash, skillUri: localSkillUri, uploaded: false };
  }

  let tmpFile: string | null = null;
  try {
    // Write manifest to a temp file (ZgFile.fromFilePath requires a path)
    tmpFile = path.join(os.tmpdir(), `skillfun-manifest-${Date.now()}.json`);
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
