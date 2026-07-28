/**
 * export-abi.ts
 *
 * After `hardhat compile`, copy the relevant ABI arrays from Hardhat artifacts
 * into packages/abi/src/ so the frontend and backend can import them without
 * depending on hardhat directly.
 *
 * Run: pnpm --filter @workspace/contracts run export-abi
 */
import * as fs from "fs";
import * as path from "path";

const CONTRACTS = ["SkillFunOracle", "SkillNFT"] as const;
const ARTIFACTS_DIR = path.resolve(__dirname, "../artifacts/contracts");
const ABI_SRC_DIR = path.resolve(__dirname, "../../../packages/abi/src");

function main() {
  fs.mkdirSync(ABI_SRC_DIR, { recursive: true });

  for (const name of CONTRACTS) {
    const artifactPath = path.join(ARTIFACTS_DIR, `${name}.sol`, `${name}.json`);
    if (!fs.existsSync(artifactPath)) {
      console.error(`❌ Artifact not found: ${artifactPath}`);
      console.error("   Did you run `hardhat compile` first?");
      process.exit(1);
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
    const destPath = path.join(ABI_SRC_DIR, `${name}.abi.json`);
    fs.writeFileSync(destPath, JSON.stringify(artifact.abi, null, 2));
    console.log(`✅ Exported ${name} ABI → ${destPath}`);
  }

  console.log("\nDone. Re-generate packages/abi/src/index.ts if ABI changed.");
}

main();
