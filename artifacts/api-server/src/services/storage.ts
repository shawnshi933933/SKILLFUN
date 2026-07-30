/**
 * 0G Storage upload/download service — encrypted, direct-node (no indexer).
 *
 * Design (ERC-7857 compliant):
 *   1. Skill content is AES-256-GCM encrypted before upload.
 *   2. Encrypted bytes are uploaded to 0G Storage → rootHash.
 *   3. tokenURI = data URI JSON with name, description, storagePointer, etc.
 *   4. NFT stores: tokenURI (readable metadata) + rootHash (0G pointer, bytes32).
 *   5. On invoke: download by rootHash → decrypt → return skill content.
 *
 * Encryption key is deterministically derived from SESSION_SECRET + rootHash
 * using HKDF-SHA-256 so no key storage is needed (re-derivable at any time).
 *
 * Mainnet storage nodes (from config-mainnet-turbo.toml):
 *   All 4 boot nodes respond on port 5678 with chainId 16661.
 *   No public indexer DNS exists — we connect directly.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { logger } from "../lib/logger.js";

// ── Mainnet config ────────────────────────────────────────────────────────────

const MAINNET_NODES: string[] = (
  process.env.ZG_STORAGE_NODES ??
  "http://34.66.131.173:5678,http://34.60.163.4:5678,http://34.169.236.186:5678,http://34.71.110.60:5678"
).split(",").map(s => s.trim()).filter(Boolean);

const MAINNET_FLOW_CONTRACT =
  process.env.ZG_FLOW_CONTRACT ?? "0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526";

const EVM_RPC = process.env.ZEROG_RPC_URL ?? "https://evmrpc.0g.ai";

// ── Encryption helpers ────────────────────────────────────────────────────────

const ALGORITHM = "aes-256-gcm" as const;
const IV_LEN    = 12;   // 96-bit IV for GCM
const TAG_LEN   = 16;   // 128-bit auth tag

/**
 * Derive a 32-byte AES key from the platform secret + rootHash.
 * Deterministic → no need to store keys; re-derive at download time.
 */
function deriveKey(rootHashHex: string): Buffer {
  const secret = process.env.SESSION_SECRET ?? "skillfun-insecure-default-secret";
  // HKDF: extract phase
  const prk = crypto.createHmac("sha256", "skillfun-storage-v1")
    .update(secret)
    .digest();
  // HKDF: expand phase with rootHash as info
  return crypto.createHmac("sha256", prk)
    .update(`encrypt:${rootHashHex}`)
    .digest();
}

/**
 * Derive the legacy platform-wide AES key from SESSION_SECRET.
 * Used only for skills uploaded before per-skill keys were introduced.
 */
function derivePlatformKey(): Buffer {
  const secret = process.env.SESSION_SECRET ?? "skillfun-insecure-default-secret";
  return crypto.createHash("sha256").update(`platform-key:${secret}`).digest();
}

/**
 * Generate a fresh random AES-256 key for a new skill.
 * Returns 32 bytes of cryptographically random data.
 */
export function generateSkillAesKey(): Buffer {
  return crypto.randomBytes(32);
}

/**
 * Encrypt plaintext bytes with the given AES-256-GCM key.
 * If no key is provided, falls back to the legacy platform-wide key.
 * Output layout: [ 12B IV ][ 16B GCM tag ][ ciphertext... ]
 */
export function encryptContent(plaintext: Buffer, key?: Buffer): Buffer {
  const aesKey = key ?? derivePlatformKey();
  const iv     = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGORITHM, aesKey, iv);
  const enc    = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag    = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]);
}

/**
 * Decrypt bytes produced by encryptContent().
 * If no key is provided, falls back to the legacy platform-wide key.
 */
export function decryptContent(encrypted: Buffer, key?: Buffer): Buffer {
  const aesKey   = key ?? derivePlatformKey();
  const iv       = encrypted.subarray(0, IV_LEN);
  const tag      = encrypted.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const body     = encrypted.subarray(IV_LEN + TAG_LEN);
  const decipher = crypto.createDecipheriv(ALGORITHM, aesKey, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body), decipher.final()]);
}

// ── Public result types ───────────────────────────────────────────────────────

export interface UploadResult {
  /** 0G Storage Merkle root hash (bytes32 hex) — stored on-chain in IntelligentData */
  rootHash: `0x${string}`;
  /**
   * ERC-721 tokenURI — a data:application/json;base64,... URI containing
   * human-readable metadata + the storagePointer for agents.
   */
  skillUri: string;
  /** true = actually uploaded to 0G; false = local-hash fallback */
  uploaded: boolean;
  /**
   * 0G Storage sequential transaction index (from Flow contract submission).
   * Use with zgs_getFileInfoByTxSeq for direct-node verification.
   * null when uploaded=false (fallback hash, not a real 0G upload).
   */
  txSeq: number | null;
  /**
   * Per-skill AES-256-GCM encryption key (hex, 32 bytes).
   * Store this in the DB alongside the skill record — it is NEVER sent on-chain.
   * Required to decrypt content downloaded from 0G Storage.
   */
  aesKey: string;
}

// ── Build ERC-721 tokenURI JSON ───────────────────────────────────────────────

/**
 * Build a self-contained ERC-721 metadata JSON encoded as a data URI.
 * This is what gets stored as `tokenURI` in the NFT.
 *
 * Follows the OpenSea metadata standard + ERC-7857 skillfun extensions.
 * Agents read this to discover the storagePointer → download + decrypt skill content.
 */
export function buildTokenURI(params: {
  skillId:        string;
  repoUrl:        string;
  rootHash:       string;
  meta?:          Record<string, unknown>;
  uploaded:       boolean;
  txSeq?:         number | null;
}): string {
  const { skillId, repoUrl, rootHash, meta = {}, uploaded, txSeq } = params;

  const displayName = (meta.name as string) ||
    repoUrl.split("/").slice(-2).join(" / ") ||
    "SkillFun Skill";

  const description = (meta.description as string) ||
    `AI Agent Skill sourced from ${repoUrl}. Encrypted on 0G Storage. ` +
    `Invoke via SkillFun Protocol on 0G Chain (chainId: 16661).`;

  const metadata = {
    name:         `SkillFun: ${displayName}`,
    description,
    external_url: `https://github.com/${repoUrl}`,
    image:        "https://skillfun.xyz/skill-nft-image.png",
    attributes: [
      { trait_type: "Repository",      value: repoUrl },
      { trait_type: "Chain",           value: "0G Mainnet" },
      { trait_type: "Chain ID",        value: "16661" },
      { trait_type: "Storage",         value: uploaded ? "0G Storage" : "Fallback Hash" },
      { trait_type: "Encrypted",       value: "Yes (AES-256-GCM)" },
      { trait_type: "Standard",        value: "ERC-7857" },
      ...(meta.version ? [{ trait_type: "Version", value: String(meta.version) }] : []),
      ...(meta.category ? [{ trait_type: "Category", value: String(meta.category) }] : []),
    ],
    /** ERC-7857 / SkillFun extension — agents use this to fetch skill content */
    skillfun: {
      skillId,
      repoUrl,
      storagePointer: `0g://${rootHash}`,
      rootHash,
      ...(txSeq != null ? { txSeq } : {}),
      chainId:       16661,
      encrypted:     true,
      algorithm:     "AES-256-GCM",
      /**
       * Verify file exists directly on a 0G storage node:
       *   POST <nodeUrl>  body: {"jsonrpc":"2.0","method":"zgs_getFileInfoByTxSeq","params":[<txSeq>],"id":1}
       * Note: StorageScan (storagescan.0g.ai) does NOT index direct-node uploads;
       *       use node RPC or the verifyEndpoint below instead.
       */
      verifyEndpoint:  `/api/skills/${skillId}/verify`,
      contentEndpoint: `/api/skills/${skillId}/content`,
    },
  };

  const json  = JSON.stringify(metadata);
  const b64   = Buffer.from(json, "utf8").toString("base64");
  return `data:application/json;base64,${b64}`;
}

// ── Main upload function ──────────────────────────────────────────────────────

/**
 * Encrypt skill content and upload to 0G Storage mainnet (direct node).
 *
 * @param skillId   DB skill ID (embedded in the tokenURI metadata).
 * @param repoUrl   GitHub repo URL (embedded in metadata + used for display).
 * @param manifest  Form metadata — name, description, category, etc.
 * @param rawContent  Raw file fetched from GitHub (skill.md / skillfun.json).
 *                    When provided, THIS content is what gets encrypted + uploaded,
 *                    so the rootHash anchors the actual skill definition.
 *
 * Falls back to keccak256 if upload fails so the mint pipeline always proceeds.
 */
export async function uploadSkillManifest(
  manifest: Record<string, unknown>,
  rawContent?: string
): Promise<UploadResult>;

/** Legacy overload — accepts (manifest, rawContent?) or (skillId, repoUrl, manifest, rawContent?) */
export async function uploadSkillManifest(
  skillIdOrManifest: string | Record<string, unknown>,
  repoUrlOrContent?: string,
  manifestArg?: Record<string, unknown>,
  rawContent?: string
): Promise<UploadResult>;

export async function uploadSkillManifest(
  skillIdOrManifest: string | Record<string, unknown>,
  repoUrlOrContent?: string,
  manifestArg?: Record<string, unknown>,
  rawContentArg?: string
): Promise<UploadResult> {
  // Resolve overloads
  let skillId:    string;
  let repoUrl:    string;
  let manifest:   Record<string, unknown>;
  let rawContent: string | undefined;

  if (typeof skillIdOrManifest === "object") {
    // Legacy: uploadSkillManifest(manifest, rawContent?)
    manifest   = skillIdOrManifest;
    rawContent = repoUrlOrContent;
    skillId    = (manifest.skillId as string) ?? "sk_unknown";
    repoUrl    = (manifest.repoUrl as string) ?? "";
  } else {
    skillId    = skillIdOrManifest;
    repoUrl    = repoUrlOrContent ?? "";
    manifest   = manifestArg ?? {};
    rawContent = rawContentArg;
  }

  // Generate a fresh per-skill AES-256 key — stored in DB, never on-chain
  const skillAesKey = generateSkillAesKey();
  const aesKeyHex  = skillAesKey.toString("hex");

  // Build plaintext payload: raw skill file + manifest envelope
  const plaintextPayload = rawContent
    ? `${rawContent}\n\n<!-- skillfun-manifest\n${JSON.stringify(manifest, null, 2)}\n-->`
    : JSON.stringify({ ...manifest, skillId, repoUrl }, null, 2);

  const plaintextBytes = Buffer.from(plaintextPayload, "utf8");

  // Fallback rootHash (keccak256 of plaintext) — used if upload fails
  const { keccak256, toBytes } = await import("viem");
  const fallbackRootHash = keccak256(toBytes(plaintextPayload)) as `0x${string}`;

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    logger.warn("DEPLOYER_PRIVATE_KEY not set — using local keccak256 hash");
    return {
      rootHash: fallbackRootHash,
      skillUri: buildTokenURI({ skillId, repoUrl, rootHash: fallbackRootHash, meta: manifest, uploaded: false, txSeq: null }),
      uploaded: false,
      txSeq: null,
      aesKey: aesKeyHex,
    };
  }

  // Encrypt content with the per-skill key before upload
  const encryptedBytes = encryptContent(plaintextBytes, skillAesKey);
  logger.info({ skillId, plaintextLen: plaintextBytes.length, encryptedLen: encryptedBytes.length }, "skill content encrypted (per-skill key)");

  let tmpFile: string | null = null;
  try {
    tmpFile = path.join(os.tmpdir(), `skillfun-upload-${Date.now()}.bin`);
    fs.writeFileSync(tmpFile, encryptedBytes);

    const { ZgFile, StorageNode, Uploader, getFlowContract } = await import("@0gfoundation/0g-storage-ts-sdk");
    const { ethers } = await import("ethers");

    // Merkle tree of encrypted bytes
    const zgFile = await ZgFile.fromFilePath(tmpFile);
    const [tree, treeErr] = await zgFile.merkleTree();
    if (treeErr || !tree) {
      logger.warn({ err: treeErr, skillId }, "0G merkle tree failed — using fallback hash");
      await zgFile.close();
      return {
        rootHash: fallbackRootHash,
        skillUri: buildTokenURI({ skillId, repoUrl, rootHash: fallbackRootHash, meta: manifest, uploaded: false, txSeq: null }),
        uploaded: false,
        txSeq: null,
        aesKey: aesKeyHex,
      };
    }

    const rawRootHash = tree.rootHash() as string;
    const rootHash: `0x${string}` = rawRootHash.startsWith("0x")
      ? (rawRootHash as `0x${string}`)
      : `0x${rawRootHash}`;

    // Connect directly to mainnet storage nodes
    const provider    = new ethers.JsonRpcProvider(EVM_RPC);
    const signer      = new ethers.Wallet(
      privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`,
      provider
    );
    const nodeClients = MAINNET_NODES.map((url: string) => new StorageNode(url));
    const flow        = getFlowContract(MAINNET_FLOW_CONTRACT, signer);
    const uploader    = new Uploader(nodeClients, EVM_RPC, flow);

    const [tx, uploadErr] = await uploader.splitableUpload(zgFile, {
      expectedReplica: 1,
      skipTx:          false,
      finalityRequired: true,
      taskSize:        1,
    });
    await zgFile.close();

    if (uploadErr) {
      logger.warn({ err: uploadErr, skillId }, "0G Storage upload failed — using fallback hash");
      return {
        rootHash: fallbackRootHash,
        skillUri: buildTokenURI({ skillId, repoUrl, rootHash: fallbackRootHash, meta: manifest, uploaded: false, txSeq: null }),
        uploaded: false,
        txSeq: null,
        aesKey: aesKeyHex,
      };
    }

    // Extract txSeq — the Flow contract submission index, used for direct-node verification.
    // StorageScan does NOT work for direct-node uploads (it requires the public indexer).
    const txSeq: number | null = (tx as { txSeq?: number })?.txSeq ?? null;

    // Build tokenURI now that we have rootHash + txSeq
    const skillUri = buildTokenURI({ skillId, repoUrl, rootHash, meta: manifest, uploaded: true, txSeq });

    logger.info({ rootHash, txSeq, skillId }, "0G Storage upload success (encrypted, per-skill key)");
    return { rootHash, skillUri, uploaded: true, txSeq, aesKey: aesKeyHex };
  } catch (err) {
    logger.warn({ err, skillId }, "0G Storage upload threw — using fallback hash");
    return {
      rootHash: fallbackRootHash,
      skillUri: buildTokenURI({ skillId, repoUrl, rootHash: fallbackRootHash, meta: manifest, uploaded: false, txSeq: null }),
      uploaded: false,
      txSeq: null,
      aesKey: aesKeyHex,
    };
  } finally {
    if (tmpFile) {
      try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
    }
  }
}

// ── Direct-node file verification ────────────────────────────────────────────

/**
 * Verify a file exists on 0G Storage mainnet by querying a node directly.
 *
 * StorageScan (storagescan.0g.ai) relies on an indexer that we bypass, so it
 * will NOT find our files. This function calls zgs_getFileInfo(rootHash, false)
 * directly on a storage node — the authoritative source of truth.
 *
 * @returns Object with finalized, txSeq, size — or throws if not found.
 */
export async function verifyFileOnNode(rootHash: string): Promise<{
  finalized: boolean;
  txSeq:     number;
  size:      number;
  node:      string;
}> {
  const normalizedHash = rootHash.startsWith("0x") ? rootHash : `0x${rootHash}`;

  const { StorageNode } = await import("@0gfoundation/0g-storage-ts-sdk");

  const errors: string[] = [];
  for (const nodeUrl of MAINNET_NODES) {
    try {
      const node = new StorageNode(nodeUrl);
      // zgs_getFileInfo(root, needAvailable) — pass false to allow pruned files
      const info = await node.getFileInfo(normalizedHash, false);
      if (info && info.tx) {
        return {
          finalized: info.finalized ?? false,
          txSeq:     info.tx.seq,
          size:      info.tx.size,
          node:      nodeUrl,
        };
      }
    } catch (e) {
      errors.push(`${nodeUrl}: ${(e as Error).message}`);
    }
  }
  throw new Error(`File not found on any mainnet node. Errors: ${errors.join("; ")}`);
}

// ── Download + decrypt ────────────────────────────────────────────────────────

/**
 * Download encrypted skill content from 0G Storage and decrypt it.
 *
 * @param rootHash  0G Storage Merkle root hash (from NFT's intelligentDataOf).
 * @param aesKey    Per-skill AES key (hex string, 32 bytes). If omitted, falls back
 *                  to the legacy platform-wide key for backward compatibility.
 * @returns         Decrypted plaintext content (skill.md / skillfun.json).
 *
 * Throws if download fails on all nodes and no local backup exists.
 */
export async function downloadSkillContent(rootHash: string, aesKey?: string | null): Promise<string> {
  const normalizedHash = rootHash.startsWith("0x") ? rootHash : `0x${rootHash}`;
  const keyBuf = aesKey ? Buffer.from(aesKey, "hex") : undefined;

  const { StorageNode, Downloader } = await import("@0gfoundation/0g-storage-ts-sdk");
  const nodeClients = MAINNET_NODES.map((url: string) => new StorageNode(url));
  const downloader  = new Downloader(nodeClients);

  const tmpFile = path.join(os.tmpdir(), `skillfun-dl-${Date.now()}.bin`);
  try {
    const dlErr = await downloader.downloadFile(normalizedHash, tmpFile, false);
    if (dlErr) {
      throw new Error(`0G download failed: ${dlErr}`);
    }

    const encryptedBytes = fs.readFileSync(tmpFile);
    const decrypted      = decryptContent(encryptedBytes, keyBuf);
    logger.info({ rootHash: normalizedHash, size: encryptedBytes.length, perSkillKey: !!aesKey }, "0G download + decrypt OK");
    return decrypted.toString("utf8");
  } finally {
    try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
  }
}
