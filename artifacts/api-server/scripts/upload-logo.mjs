/**
 * One-off: upload SkillFun logo to 0G Storage mainnet (unencrypted).
 * Run from repo root: node artifacts/api-server/scripts/upload-logo.mjs
 */

import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env from api-server .env if present
const envPath = path.resolve(__dirname, "../../../.env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
    if (m) process.env[m[1]] ??= m[2].replace(/^['"]|['"]$/g, "");
  }
}

const PRIVATE_KEY  = process.env.DEPLOYER_PRIVATE_KEY;
const EVM_RPC      = process.env.ZEROG_RPC_URL ?? "https://evmrpc.0g.ai";
const FLOW_CONTRACT = process.env.ZG_FLOW_CONTRACT ?? "0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526";
const NODES = (
  process.env.ZG_STORAGE_NODES ??
  "http://34.66.131.173:5678,http://34.60.163.4:5678,http://34.169.236.186:5678,http://34.71.110.60:5678"
).split(",").map(s => s.trim()).filter(Boolean);

const imgPath = path.resolve(__dirname, "../../../attached_assets/9fe96998ecab6791085e263ffbab848f_1785742916412.png");

if (!PRIVATE_KEY) { console.error("❌ DEPLOYER_PRIVATE_KEY not set"); process.exit(1); }
if (!fs.existsSync(imgPath)) { console.error("❌ Image not found:", imgPath); process.exit(1); }

console.log(`Uploading ${imgPath} (${fs.statSync(imgPath).size} bytes)…`);
console.log(`Nodes: ${NODES.join(", ")}`);

const { ZgFile, StorageNode, Uploader, getFlowContract } = await import("@0gfoundation/0g-storage-ts-sdk");
const { ethers } = await import("ethers");

const tmpFile = path.join(os.tmpdir(), `logo-upload-${Date.now()}.bin`);
fs.copyFileSync(imgPath, tmpFile);

try {
  const zgFile = await ZgFile.fromFilePath(tmpFile);
  const [tree, treeErr] = await zgFile.merkleTree();
  if (treeErr || !tree) { console.error("❌ Merkle tree error:", treeErr); process.exit(1); }

  const raw      = tree.rootHash();
  const rootHash = raw.startsWith("0x") ? raw : `0x${raw}`;
  console.log(`rootHash: ${rootHash}`);

  const provider    = new ethers.JsonRpcProvider(EVM_RPC);
  const signer      = new ethers.Wallet(PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`, provider);
  const nodeClients = NODES.map(url => new StorageNode(url));
  const flow        = getFlowContract(FLOW_CONTRACT, signer);
  const uploader    = new Uploader(nodeClients, EVM_RPC, flow);

  console.log("Submitting to 0G Storage (this may take 30-60 s)…");
  const [tx, uploadErr] = await uploader.splitableUpload(zgFile, {
    expectedReplica: 1, skipTx: false, finalityRequired: true, taskSize: 1,
  });
  await zgFile.close();

  if (uploadErr) { console.error("❌ Upload error:", uploadErr); process.exit(1); }

  const txSeq = tx?.txSeq ?? null;
  console.log("\n✅ Upload successful!");
  console.log(`   rootHash : ${rootHash}`);
  console.log(`   txSeq    : ${txSeq}`);
  console.log(`\n   Use this in NFT metadata:`);
  console.log(`   https://skillfun.xyz/api/assets/${rootHash}`);
} finally {
  try { fs.unlinkSync(tmpFile); } catch {}
}
