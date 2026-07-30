/**
 * Deploy a new SkillFunOracle and wire it to the v4 SkillNFT.
 *
 * Usage: DEPLOYER_PRIVATE_KEY=0x... node scripts/deploy-oracle.mjs
 *
 * The deployer is used as coldWallet during development.
 * In production, replace coldWallet with an offline hardware wallet.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
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

const ZEROG_MAINNET = {
  id: 16661,
  name: "0G Mainnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: { default: { http: ["https://evmrpc.0g.ai"] } },
};

const SKILL_NFT_V4 = "0xfd5d67840915fa25af61b68bdb30bc6bb61fe4f8";

const hr   = () => console.log("─".repeat(64));
const step = (n, msg) => { console.log(""); hr(); console.log(`  ${n}: ${msg}`); hr(); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function waitReceipt(pub, hash, label = "") {
  const start = Date.now();
  let attempt = 0;
  while (Date.now() - start < 120_000) {
    try {
      const r = await pub.getTransactionReceipt({ hash });
      if (r) return r;
    } catch { /* not yet */ }
    attempt++;
    const delay = Math.min(3000 * attempt, 12000);
    process.stdout.write(`    ${label ? label + " — " : ""}waiting ${delay/1000}s (attempt ${attempt})...\r`);
    await sleep(delay);
  }
  throw new Error(`Receipt not found after 120s for ${hash}`);
}

// ── 1: Compile SkillFunOracle.sol ────────────────────────────────────────────
step("1", "Compile SkillFunOracle.sol");

const oracleSrc = readFileSync(resolve(ROOT, "packages/contracts/contracts/SkillFunOracle.sol"), "utf8");

const input = {
  language: "Solidity",
  sources: { "SkillFunOracle.sol": { content: oracleSrc } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    evmVersion: "cancun",
    outputSelection: {
      "SkillFunOracle.sol": { "SkillFunOracle": ["abi", "evm.bytecode.object"] },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
if (output.errors) {
  const fatal = output.errors.filter(e => e.severity === "error");
  if (fatal.length) { fatal.forEach(e => console.error(e.formattedMessage)); process.exit(1); }
  output.errors.forEach(e => console.warn("  ⚠ ", e.formattedMessage.split("\n")[0]));
}

const contract  = output.contracts["SkillFunOracle.sol"]["SkillFunOracle"];
const abi       = contract.abi;
const bytecode  = "0x" + contract.evm.bytecode.object;
console.log(`✅  Compiled — bytecode size: ${bytecode.length / 2 - 1} bytes`);

// ── 2: Deploy ────────────────────────────────────────────────────────────────
step("2", "Deploy SkillFunOracle to 0G Mainnet (chainId 16661)");

const privKey = process.env.DEPLOYER_PRIVATE_KEY;
if (!privKey) { console.error("❌  DEPLOYER_PRIVATE_KEY not set"); process.exit(1); }

const account      = privateKeyToAccount(privKey);
const publicClient = createPublicClient({ chain: ZEROG_MAINNET, transport: http() });
const walletClient = createWalletClient({ account, chain: ZEROG_MAINNET, transport: http() });

console.log(`    Deployer (coldWallet): ${account.address}`);

// Constructor(address _coldWallet)
const deployHash = await walletClient.deployContract({
  abi,
  bytecode,
  args: [account.address], // deployer acts as coldWallet during dev
  gas: 1_000_000n,
});
console.log(`    Deploy tx: ${deployHash}`);
const deployReceipt = await waitReceipt(publicClient, deployHash, "deploy");
const ORACLE_V2 = deployReceipt.contractAddress;
console.log(`\n✅  New Oracle deployed at: ${ORACLE_V2}`);

// ── 3: Wire Oracle → v4 SkillNFT via setSkillNFT ────────────────────────────
step("3", "setSkillNFT on new Oracle");

const setSkillNFTAbi = [
  { name: "setSkillNFT", inputs: [{ name: "_skillNFT", type: "address" }], outputs: [], stateMutability: "nonpayable", type: "function" },
];
const wireHash = await walletClient.writeContract({
  address: ORACLE_V2,
  abi: setSkillNFTAbi,
  functionName: "setSkillNFT",
  args: [SKILL_NFT_V4],
  gas: 100_000n,
});
console.log(`    setSkillNFT tx: ${wireHash}`);
await waitReceipt(publicClient, wireHash, "setSkillNFT");
console.log(`\n✅  Oracle wired to SkillNFT v4 (${SKILL_NFT_V4})`);

// ── 4: Update addresses.json ─────────────────────────────────────────────────
step("4", "Update packages/abi/src/addresses.json");

const addrPath = resolve(ROOT, "packages/abi/src/addresses.json");
const addresses = JSON.parse(readFileSync(addrPath, "utf8"));
addresses["16661"]["SkillFunOracle"] = ORACLE_V2;
writeFileSync(addrPath, JSON.stringify(addresses, null, 2) + "\n");
console.log(`✅  addresses.json updated`);

// ── 5: Update compile-and-deploy script with new Oracle address ───────────────
step("5", "Update compile-and-deploy-skillfun.mjs with new Oracle address");

const deployScriptPath = resolve(ROOT, "scripts/compile-and-deploy-skillfun.mjs");
let deployScript = readFileSync(deployScriptPath, "utf8");
deployScript = deployScript.replace(
  /const ORACLE_ADDRESS\s*=\s*"0x[0-9a-fA-F]+"/,
  `const ORACLE_ADDRESS   = "${ORACLE_V2}"`
);
writeFileSync(deployScriptPath, deployScript);
console.log(`✅  compile-and-deploy-skillfun.mjs updated`);

console.log("");
hr();
console.log("  Oracle deployment complete!");
hr();
console.log(`  SkillFunOracle (v2): ${ORACLE_V2}`);
console.log(`  SkillNFT (v4):       ${SKILL_NFT_V4}`);
console.log(`  coldWallet:          ${account.address}`);
console.log(`  claim() path:        ✅ now operational on v4 SkillNFT`);
console.log("");
