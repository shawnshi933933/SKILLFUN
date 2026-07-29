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
 * Encrypt plaintext bytes.
 * Output layout: [ 12B IV ][ 16B GCM tag ][ ciphertext... ]
 */
export function encryptContent(plaintext: Buffer): Buffer {
  // We need the rootHash to derive the key, but we don't have it yet at
  // encryption time (the rootHash depends on the encrypted bytes).
  // Solution: use a random IV + a static per-platform key derived only from SECRET.
  const secret = process.env.SESSION_SECRET ?? "skillfun-insecure-default-secret";
  const key    = crypto.createHash("sha256").update(`platform-key:${secret}`).digest();
  const iv     = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const enc    = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag    = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]);
}

/**
 * Decrypt bytes produced by encryptContent().
 * Accepts either the raw encrypted buffer or its hex string.
 */
export function decryptContent(encrypted: Buffer): Buffer {
  const secret = process.env.SESSION_SECRET ?? "skillfun-insecure-default-secret";
  const key    = crypto.createHash("sha256").update(`platform-key:${secret}`).digest();
  const iv     = encrypted.subarray(0, IV_LEN);
  const tag    = encrypted.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const body   = encrypted.subarray(IV_LEN + TAG_LEN);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
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
}): string {
  const { skillId, repoUrl, rootHash, meta = {}, uploaded } = params;

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
      chainId:       16661,
      encrypted:     true,
      algorithm:     "AES-256-GCM",
      /**
       * Agents call this endpoint to get the decrypted skill content:
       *   POST <decryptEndpoint>
       *   Header: X-Wallet-Signature: <EIP-712 sig for "invoke-skill">
       */
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
      skillUri: buildTokenURI({ skillId, repoUrl, rootHash: fallbackRootHash, meta: manifest, uploaded: false }),
      uploaded: false,
    };
  }

  // Encrypt content before upload
  const encryptedBytes = encryptContent(plaintextBytes);
  logger.info({ skillId, plaintextLen: plaintextBytes.length, encryptedLen: encryptedBytes.length }, "skill content encrypted");

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
        skillUri: buildTokenURI({ skillId, repoUrl, rootHash: fallbackRootHash, meta: manifest, uploaded: false }),
        uploaded: false,
      };
    }

    const rawRootHash = tree.rootHash() as string;
    const rootHash: `0x${string}` = rawRootHash.startsWith("0x")
      ? (rawRootHash as `0x${string}`)
      : `0x${rawRootHash}`;

    // Build tokenURI now that we have the rootHash
    const skillUri = buildTokenURI({ skillId, repoUrl, rootHash, meta: manifest, uploaded: true });

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
        skillUri: buildTokenURI({ skillId, repoUrl, rootHash: fallbackRootHash, meta: manifest, uploaded: false }),
        uploaded: false,
      };
    }

    logger.info({ rootHash, skillId, nodes: MAINNET_NODES }, "0G Storage upload success (encrypted)");
    return { rootHash, skillUri, uploaded: true };
  } catch (err) {
    logger.warn({ err, skillId }, "0G Storage upload threw — using fallback hash");
    return {
      rootHash: fallbackRootHash,
      skillUri: buildTokenURI({ skillId, repoUrl, rootHash: fallbackRootHash, meta: manifest, uploaded: false }),
      uploaded: false,
    };
  } finally {
    if (tmpFile) {
      try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
    }
  }
}

// ── Download + decrypt ────────────────────────────────────────────────────────

/**
 * Download encrypted skill content from 0G Storage and decrypt it.
 *
 * @param rootHash  0G Storage Merkle root hash (from NFT's intelligentDataOf).
 * @returns         Decrypted plaintext content (skill.md / skillfun.json).
 *
 * Throws if download fails on all nodes and no local backup exists.
 */
export async function downloadSkillContent(rootHash: string): Promise<string> {
  const normalizedHash = rootHash.startsWith("0x") ? rootHash : `0x${rootHash}`;

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
    const decrypted      = decryptContent(encryptedBytes);
    logger.info({ rootHash: normalizedHash, size: encryptedBytes.length }, "0G download + decrypt OK");
    return decrypted.toString("utf8");
  } finally {
    try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
  }
}
