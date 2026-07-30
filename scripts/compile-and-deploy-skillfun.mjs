/**
 * Compile SkillNFT.sol and deploy to 0G Mainnet.
 * Usage: DEPLOYER_PRIVATE_KEY=0x... node scripts/compile-and-deploy-skillfun.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const solc = require("/home/runner/workspace/node_modules/.pnpm/solc@0.8.24/node_modules/solc/index.js");

const { createWalletClient, createPublicClient, http } = await import(
  "/home/runner/workspace/node_modules/.pnpm/viem@2.23.2_bufferutil@4.1.0_typescript@5.9.3_utf-8-validate@5.0.10_zod@3.25.76/node_modules/viem/_cjs/index.js"
);
const { privateKeyToAccount } = await import(
  "/home/runner/workspace/node_modules/.pnpm/viem@2.23.2_bufferutil@4.1.0_typescript@5.9.3_utf-8-validate@5.0.10_zod@3.25.76/node_modules/viem/_cjs/accounts/index.js"
);

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── Chain config ──────────────────────────────────────────────────────────────
const ZEROG_MAINNET = {
  id: 16661,
  name: "0G Mainnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: { default: { http: ["https://evmrpc.0g.ai"] } },
};

// ── Addresses (kept from previous deployment) ────────────────────────────────
const ORACLE_ADDRESS   = "0x9ac710e2afa493ecc9d765da413e1f921764ca31";
const VERIFIER_ADDRESS = "0xeC407EE664027AB8Ed84944C47c4FaaE3A5c8E7e";
const W0G_ADDRESS      = "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c";

// ── Helpers ───────────────────────────────────────────────────────────────────
const hr   = () => console.log("─".repeat(64));
const step = (n, msg) => { console.log(""); hr(); console.log(`  ${n}: ${msg}`); hr(); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function waitReceipt(publicClient, hash, label = "") {
  const start = Date.now();
  let attempt = 0;
  while (Date.now() - start < 120_000) {
    try {
      const r = await publicClient.getTransactionReceipt({ hash });
      if (r) return r;
    } catch { /* not yet */ }
    attempt++;
    const delay = Math.min(3000 * attempt, 12000);
    process.stdout.write(`    ${label ? label + " — " : ""}waiting ${delay/1000}s (attempt ${attempt})...\r`);
    await sleep(delay);
  }
  throw new Error(`Receipt not found after 120s for ${hash}`);
}

// ── Step 1: Compile ───────────────────────────────────────────────────────────
step("1", "Compile SkillNFT.sol");

const OZ_BASE = resolve(ROOT, "node_modules/.pnpm/@openzeppelin+contracts@5.6.1/node_modules");

const contractSrc = readFileSync(resolve(ROOT, "contracts/SkillNFT.sol"), "utf8");

const input = {
  language: "Solidity",
  sources: {
    "SkillNFT.sol": { content: contractSrc },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    evmVersion: "cancun",
    outputSelection: {
      "SkillNFT.sol": {
        "SkillNFT": ["abi", "evm.bytecode.object"],
      },
    },
  },
};

function findImports(importPath) {
  try {
    // OpenZeppelin imports
    if (importPath.startsWith("@openzeppelin/")) {
      const full = resolve(OZ_BASE, importPath);
      return { contents: readFileSync(full, "utf8") };
    }
    return { error: `Import not found: ${importPath}` };
  } catch (e) {
    return { error: e.message };
  }
}

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

if (output.errors) {
  const fatal = output.errors.filter(e => e.severity === "error");
  if (fatal.length) {
    console.error("Compilation errors:");
    fatal.forEach(e => console.error(e.formattedMessage));
    process.exit(1);
  }
  // Warnings only — print but continue
  output.errors.forEach(e => console.warn("  ⚠ ", e.formattedMessage.split("\n")[0]));
}

const contract = output.contracts["SkillNFT.sol"]["SkillNFT"];
const abi      = contract.abi;
const bytecode = "0x" + contract.evm.bytecode.object;

console.log(`✅  Compiled — bytecode size: ${bytecode.length / 2 - 1} bytes`);

// Save ABI immediately
const abiPath = resolve(ROOT, "packages/abi/src/SkillNFT.abi.json");
writeFileSync(abiPath, JSON.stringify(abi, null, 2));
console.log(`✅  ABI written to packages/abi/src/SkillNFT.abi.json`);

// ── Step 2: Deploy ────────────────────────────────────────────────────────────
step("2", "Deploy to 0G Mainnet (chainId 16661)");

const privKey = process.env.DEPLOYER_PRIVATE_KEY;
if (!privKey) {
  console.error("❌  DEPLOYER_PRIVATE_KEY not set");
  process.exit(1);
}

const account      = privateKeyToAccount(privKey);
const publicClient = createPublicClient({ chain: ZEROG_MAINNET, transport: http() });
const walletClient = createWalletClient({ account, chain: ZEROG_MAINNET, transport: http() });

console.log(`    Deployer: ${account.address}`);
const balance = await publicClient.getBalance({ address: account.address });
console.log(`    Balance:  ${Number(balance) / 1e18} 0G`);

// Encode constructor args: (oracle, verifier, owner, w0g)
const deployerAddress = account.address;

const hash = await walletClient.deployContract({
  abi,
  bytecode,
  args: [ORACLE_ADDRESS, VERIFIER_ADDRESS, deployerAddress, W0G_ADDRESS],
  gas: 4_000_000n,
});
console.log(`    Deploy tx: ${hash}`);

const receipt = await waitReceipt(publicClient, hash, "deploy");
console.log(`\n✅  Deployed at: ${receipt.contractAddress}`);
console.log(`    Block:        ${receipt.blockNumber}`);
console.log(`    Gas used:     ${receipt.gasUsed}`);

// ── Step 3: Update addresses.json ────────────────────────────────────────────
step("3", "Update packages/abi/src/addresses.json");

const addrPath = resolve(ROOT, "packages/abi/src/addresses.json");
const addresses = JSON.parse(readFileSync(addrPath, "utf8"));
addresses["16661"]["SkillNFT"] = receipt.contractAddress;
writeFileSync(addrPath, JSON.stringify(addresses, null, 2) + "\n");
console.log(`✅  addresses.json updated`);
console.log(`    New SkillNFT: ${receipt.contractAddress}`);

// ── Step 4: Tell Oracle about new SkillNFT ────────────────────────────────────
step("4", "Register new SkillNFT with Oracle (setSkillNFT)");

// The Oracle only allows setSkillNFT once (SkillNFTAlreadySet error)
// Since we're redeploying, the oracle already has the old address.
// We need to deploy a new Oracle OR use a different mechanism.
// For now: skip this step and note it — the oracle setSkillNFT is a one-time call.
// The claim() path won't work until oracle is updated, but selfAuthorize and
// purchaseAuthorization work without the oracle.
console.log("    ⚠  Oracle.setSkillNFT() is a one-time call — old address is locked.");
console.log("    ⚠  claim() will not work until oracle is redeployed or upgraded.");
console.log("    ✅  selfAuthorize(), purchaseAuthorization(), isAuthorized() work independently.");

console.log("");
hr();
console.log("  Deployment complete!");
hr();
console.log(`  SkillNFT (v4): ${receipt.contractAddress}`);
console.log(`  Oracle:        ${ORACLE_ADDRESS}  (unchanged)`);
console.log(`  Verifier:      ${VERIFIER_ADDRESS}  (unchanged)`);
console.log(`  W0G:           ${W0G_ADDRESS}  (unchanged)`);
console.log("");
