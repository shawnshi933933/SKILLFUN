/**
 * One-off script: upload the SkillFun logo to 0G Storage mainnet.
 *
 * Usage (from repo root):
 *   cd artifacts/api-server
 *   npx tsx scripts/upload-logo.ts ../../attached_assets/9fe96998ecab6791085e263ffbab848f_1785742916412.png
 */

import path from "node:path";
import fs from "node:fs";
import "dotenv/config";

const filePath = path.resolve(process.argv[2] ?? "../../attached_assets/9fe96998ecab6791085e263ffbab848f_1785742916412.png");

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

console.log(`Uploading ${filePath} (${fs.statSync(filePath).size} bytes) to 0G Storage mainnet…`);

// Import after env is loaded
const { uploadRawFile } = await import("../src/services/storage.js");

try {
  const { rootHash, txSeq } = await uploadRawFile(filePath);
  console.log("\n✅ Upload successful!");
  console.log(`   rootHash : ${rootHash}`);
  console.log(`   txSeq    : ${txSeq}`);
  console.log(`\n   NFT image URL will be:`);
  console.log(`   https://skillfun.xyz/api/assets/${rootHash}`);
  process.exit(0);
} catch (err) {
  console.error("❌ Upload failed:", err);
  process.exit(1);
}
