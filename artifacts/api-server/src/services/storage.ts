/**
 * 0G Storage upload service — direct node approach (no indexer required).
 *
 * The public indexer hostnames (indexer-storage-mainnet-*.0g.ai) have no DNS
 * records. Instead, we connect directly to the 4 boot nodes listed in the
 * official config-mainnet-turbo.toml. All four respond on port 5678 with
 * chainId 16661 and are reachable from both Replit and production environments.
 *
 * Peer deps: @0gfoundation/0g-storage-ts-sdk, ethers
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { keccak256, toBytes } from "viem";
import { logger } from "../lib/logger.js";

// ── Mainnet config ────────────────────────────────────────────────────────────
// Boot nodes from config-mainnet-turbo.toml — confirmed reachable, chainId 16661
const MAINNET_NODES: string[] = (
  process.env.ZG_STORAGE_NODES ??
  "http://34.66.131.173:5678,http://34.60.163.4:5678,http://34.169.236.186:5678,http://34.71.110.60:5678"
).split(",").map(s => s.trim()).filter(Boolean);

const MAINNET_FLOW_CONTRACT =
  process.env.ZG_FLOW_CONTRACT ?? "0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526";

const EVM_RPC = process.env.ZEROG_RPC_URL ?? "https://evmrpc.0g.ai";

export interface UploadResult {
  rootHash: `0x${string}`;
  skillUri: string;
  /** true if we actually uploaded to 0G Storage; false = local-hash fallback */
  uploaded: boolean;
}

/**
 * Upload skill content to 0G Storage mainnet (direct node, no indexer).
 *
 * @param manifest    Metadata envelope — always included in the upload.
 * @param rawContent  Optional raw file fetched from GitHub (skill.md / skillfun.json).
 *                    When provided, THIS is what gets uploaded so the rootHash
 *                    anchors the real skill definition, not just form data.
 *
 * Falls back to keccak256 if upload fails so the mint pipeline always proceeds.
 */
export async function uploadSkillManifest(
  manifest: Record<string, unknown>,
  rawContent?: string
): Promise<UploadResult> {
  // Build upload blob
  const uploadBlob = rawContent
    ? `${rawContent}\n\n<!-- skillfun-manifest\n${JSON.stringify(manifest, null, 2)}\n-->`
    : JSON.stringify(manifest, null, 2);

  const jsonBytes = Buffer.from(uploadBlob, "utf8");

  // Local fallback (always computed)
  const localRootHash = keccak256(toBytes(uploadBlob)) as `0x${string}`;
  const localSkillUri = `data:text/plain;charset=utf-8,${encodeURIComponent(uploadBlob.slice(0, 800))}`;

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    logger.warn("DEPLOYER_PRIVATE_KEY not set — using local hash for storage");
    return { rootHash: localRootHash, skillUri: localSkillUri, uploaded: false };
  }

  let tmpFile: string | null = null;
  try {
    const ext = rawContent ? (rawContent.trimStart().startsWith("{") ? ".json" : ".md") : ".json";
    tmpFile = path.join(os.tmpdir(), `skillfun-upload-${Date.now()}${ext}`);
    fs.writeFileSync(tmpFile, jsonBytes);

    const { ZgFile, StorageNode, Uploader, getFlowContract } = await import("@0gfoundation/0g-storage-ts-sdk");
    const { ethers } = await import("ethers");

    // Merkle tree
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

    const skillUri = `https://storagescan.0g.ai/?search=${rootHash}`;

    // Connect directly to mainnet storage nodes (no indexer needed)
    const provider = new ethers.JsonRpcProvider(EVM_RPC);
    const signer   = new ethers.Wallet(
      privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`,
      provider
    );

    const nodeClients = MAINNET_NODES.map((url: string) => new StorageNode(url));
    const flow        = getFlowContract(MAINNET_FLOW_CONTRACT, signer);
    const uploader    = new Uploader(nodeClients, EVM_RPC, flow);

    const [tx, uploadErr] = await uploader.splitableUpload(zgFile, {
      expectedReplica: 1,
      skipTx: false,
      finalityRequired: true,
      taskSize: 1,
    });
    await zgFile.close();

    if (uploadErr) {
      logger.warn({ err: uploadErr }, "0G Storage upload failed — using local hash");
      return { rootHash: localRootHash, skillUri: localSkillUri, uploaded: false };
    }

    logger.info({ rootHash, tx, nodes: MAINNET_NODES }, "0G Storage upload success");
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
