/**
 * Live end-to-end x402 payment test.
 *
 * Deployer wallet = skill owner (funds the test, can't call invokeSkill on own skill)
 * Agent wallet    = fresh ephemeral wallet simulating a paying agent
 *
 * Steps:
 *  1. Setup: deployer wraps 0G→W0G if needed, sends W0G + gas to agent wallet
 *  2. Agent approves SkillNFT to spend W0G
 *  3. Agent calls invokeSkill(tokenId) on-chain
 *  4. Agent signs EIP-191 "SkillFun payment proof: {txHash}"
 *  5. POST /api/mcp/payment/prove → get proof token
 *  6. POST /mcp/:bundleId/mcp tools/call WITH proof → skill content returned
 *  B. Replay same txHash → confirm idempotent (same token, no duplicate)
 *  C. Wrong wallet header → 402 wallet_mismatch
 */

import { createWalletClient, createPublicClient, http, parseUnits, formatUnits, parseEther } from
  "/home/runner/workspace/node_modules/.pnpm/viem@2.55.8_bufferutil@4.1.0_typescript@5.9.3_utf-8-validate@5.0.10_zod@3.25.76/node_modules/viem/_cjs/index.js";
import { privateKeyToAccount, generatePrivateKey } from
  "/home/runner/workspace/node_modules/.pnpm/viem@2.55.8_bufferutil@4.1.0_typescript@5.9.3_utf-8-validate@5.0.10_zod@3.25.76/node_modules/viem/_cjs/accounts/index.js";

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
if (!PRIVATE_KEY) throw new Error("DEPLOYER_PRIVATE_KEY not set");

const SKILL_NFT = "0x1f76DEBCf09a1901a002FD1B4d2C636fd2AF4DAF";
const W0G       = "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c";
const BUNDLE_ID = "bd_uOIs5p3wytcxF-oJw5GC";
const TOKEN_ID  = 3n;
const API_BASE  = "http://localhost:8080";

const CHAIN = {
  id: 16661, name: "0G Mainnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: { default: { http: ["https://evmrpc.0g.ai"] } },
};

const ERC20_ABI = [
  { name: "balanceOf", inputs: [{ name: "account", type: "address" }],                                                        outputs: [{ type: "uint256" }], stateMutability: "view",       type: "function" },
  { name: "allowance", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],                   outputs: [{ type: "uint256" }], stateMutability: "view",       type: "function" },
  { name: "approve",   inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],                  outputs: [{ type: "bool"    }], stateMutability: "nonpayable", type: "function" },
  { name: "transfer",  inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],                       outputs: [{ type: "bool"    }], stateMutability: "nonpayable", type: "function" },
  { name: "decimals",  inputs: [],                                                                                            outputs: [{ type: "uint8"   }], stateMutability: "view",       type: "function" },
];

const W0G_DEPOSIT_ABI = [
  { name: "deposit",  inputs: [], outputs: [], stateMutability: "payable",    type: "function" },
];

const SKILL_ABI = [
  { name: "invokeSkill",   inputs: [{ name: "tokenId", type: "uint256" }], outputs: [],                stateMutability: "nonpayable", type: "function" },
  { name: "getSkillPrice", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "uint256" }], stateMutability: "view",   type: "function" },
];

const hr   = ()       => console.log("─".repeat(64));
const step = (n, msg) => { console.log(""); hr(); console.log(`  Step ${n}: ${msg}`); hr(); };
const ok   = (msg)    => console.log(`✅  ${msg}`);
const info = (k, v)   => console.log(`    ${String(k).padEnd(24)}: ${v}`);
const fail = (msg)    => { console.error(`❌  ${msg}`); process.exit(1); };
const sleep = (ms)    => new Promise(r => setTimeout(r, ms));

/** 0G RPC sometimes returns "no matching receipts found" before the block settles.
 *  Retry with exponential back-off up to 60 s total. */
async function waitReceipt(hash, label = "") {
  const start = Date.now();
  let attempt = 0;
  while (Date.now() - start < 90_000) {
    try {
      const r = await publicClient.getTransactionReceipt({ hash });
      if (r) return r;
    } catch { /* not yet */ }
    attempt++;
    const delay = Math.min(3000 * attempt, 12000);
    process.stdout.write(`    ${label ? label + " — " : ""}waiting ${delay/1000}s (attempt ${attempt})...\r`);
    await sleep(delay);
  }
  fail(`Receipt not found after 90s for ${hash}`);
}

// ── Wallets ────────────────────────────────────────────────────────────────
const deployerPk  = PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`;
const deployer    = privateKeyToAccount(deployerPk);
const agentPk     = generatePrivateKey();
const agent       = privateKeyToAccount(agentPk);

const publicClient   = createPublicClient({ chain: CHAIN, transport: http() });
const deployerClient = createWalletClient({ account: deployer, chain: CHAIN, transport: http() });
const agentWalletClient = createWalletClient({ account: agent, chain: CHAIN, transport: http() });

info("Deployer (skill owner)", deployer.address);
info("Agent (paying wallet)", agent.address);

// ── Step 1: Fund agent wallet ───────────────────────────────────────────────
step(1, "Setup — fund agent wallet with W0G + gas");

const decimals = await publicClient.readContract({ address: W0G, abi: ERC20_ABI, functionName: "decimals", args: [] });

// Get skill price (fallback 0.01)
let skillPrice;
try {
  skillPrice = await publicClient.readContract({ address: SKILL_NFT, abi: SKILL_ABI, functionName: "getSkillPrice", args: [TOKEN_ID] });
  info("Skill price (on-chain)", `${formatUnits(skillPrice, decimals)} W0G`);
} catch {
  skillPrice = parseUnits("0.01", Number(decimals));
  info("Skill price (fallback)", `${formatUnits(skillPrice, decimals)} W0G`);
}

// Deployer: wrap native 0G → W0G if balance too low
let deployerW0G = await publicClient.readContract({ address: W0G, abi: ERC20_ABI, functionName: "balanceOf", args: [deployer.address] });
info("Deployer W0G balance", `${formatUnits(deployerW0G, decimals)} W0G`);

const needed = skillPrice * 2n; // a bit extra
if (deployerW0G < needed) {
  info("Wrapping 0.1 native 0G → W0G", "...");
  const wrapTx = await deployerClient.writeContract({
    address: W0G, abi: W0G_DEPOSIT_ABI, functionName: "deposit",
    value: parseUnits("0.1", 18),
  });
  await waitReceipt(wrapTx);
  deployerW0G = await publicClient.readContract({ address: W0G, abi: ERC20_ABI, functionName: "balanceOf", args: [deployer.address] });
  info("Deployer W0G after wrap", `${formatUnits(deployerW0G, decimals)} W0G`);
  ok("Wrapped 0G → W0G");
}

// Send W0G to agent
info("Sending W0G to agent", "...");
const transferTx = await deployerClient.writeContract({
  address: W0G, abi: ERC20_ABI, functionName: "transfer",
  args: [agent.address, skillPrice * 2n],
});
await waitReceipt(transferTx);
info("W0G transfer txHash", transferTx);

// Send native 0G gas to agent
info("Sending 0.02 native 0G gas to agent", "...");
const gasTx = await deployerClient.sendTransaction({
  to: agent.address, value: parseEther("0.02"),
});
await waitReceipt(gasTx);

const agentW0G = await publicClient.readContract({ address: W0G, abi: ERC20_ABI, functionName: "balanceOf", args: [agent.address] });
info("Agent W0G balance", `${formatUnits(agentW0G, decimals)} W0G`);
ok("Agent wallet funded ✓");

// ── Step 2: Agent approves SkillNFT to spend W0G ──────────────────────────
step(2, "Agent approves SkillNFT to spend W0G");

const approveTx = await agentWalletClient.writeContract({
  address: W0G, abi: ERC20_ABI, functionName: "approve",
  args: [SKILL_NFT, skillPrice * 10n],
});
info("Approve txHash", approveTx);
await waitReceipt(approveTx);
ok("Approved ✓");

// ── Step 3: Agent calls invokeSkill(tokenId) ──────────────────────────────
step(3, `Agent calls invokeSkill(${TOKEN_ID})`);

const invokeTxHash = await agentWalletClient.writeContract({
  address: SKILL_NFT, abi: SKILL_ABI, functionName: "invokeSkill", args: [TOKEN_ID],
});
info("invokeSkill txHash", invokeTxHash);
info("Waiting for receipt", "...");

const receipt = await waitReceipt(invokeTxHash);
info("Status", receipt.status);
info("Block", receipt.blockNumber.toString());

if (receipt.status !== "success") fail("invokeSkill tx failed on-chain");
ok("invokeSkill confirmed on-chain ✓");

// ── Step 4: Agent signs EIP-191 proof message ─────────────────────────────
step(4, "Agent signs EIP-191 proof message");

const message   = `SkillFun payment proof: ${invokeTxHash}`;
info("Message", message);
const signature = await agentWalletClient.signMessage({ message });
info("Signature", `${signature.slice(0, 20)}...`);
ok("Signed ✓");

// ── Step 5: POST /api/mcp/payment/prove ───────────────────────────────────
step(5, "POST /api/mcp/payment/prove");

const proveRes  = await fetch(`${API_BASE}/api/mcp/payment/prove`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    txHash:      invokeTxHash,
    tokenId:     Number(TOKEN_ID),
    agentWallet: agent.address,
    signature,
  }),
});
info("HTTP status", proveRes.status);
const proveBody = await proveRes.json();
console.log(JSON.stringify(proveBody, null, 2));

if (!proveRes.ok) fail(`prove endpoint returned ${proveRes.status}: ${JSON.stringify(proveBody)}`);
const proofToken = proveBody.proof;
ok(`Proof token issued ✓`);
info("proof (prefix)", proofToken.slice(0, 24) + "...");
info("skillId",        proveBody.skillId);
info("contentVersion", proveBody.contentVersion);

// ── Step 6: tools/call WITH valid proof ───────────────────────────────────
step(6, "tools/call WITH proof → expect skill content (200)");

const mcpRes = await fetch(`${API_BASE}/mcp/${BUNDLE_ID}/mcp`, {
  method: "POST",
  headers: {
    "Content-Type":        "application/json",
    "X-402-Payment-Proof": proofToken,
    "X-402-Agent-Wallet":  agent.address,
  },
  body: JSON.stringify({
    jsonrpc: "2.0", id: 10, method: "tools/call",
    params: { name: `test-dkl5:${TOKEN_ID}`, arguments: { query: "draw a simple spiral" } },
  }),
});
info("HTTP status", mcpRes.status);
const mcpBody = await mcpRes.json();
console.log(JSON.stringify(mcpBody, null, 2));

if (!mcpRes.ok) fail("tools/call failed after payment");
ok("tools/call returned skill content — x402 COMPLETE ✓");

// ── Bonus B: Replay same txHash (idempotency) ─────────────────────────────
step("B", "Replay same txHash → same proof returned (idempotent)");

const replayRes  = await fetch(`${API_BASE}/api/mcp/payment/prove`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ txHash: invokeTxHash, tokenId: Number(TOKEN_ID), agentWallet: agent.address, signature }),
});
const replayBody = await replayRes.json();
info("HTTP status", replayRes.status);

if (replayRes.ok && replayBody.proof === proofToken) {
  ok("Idempotent: same token, no duplicate created ✓");
} else {
  console.log(JSON.stringify(replayBody, null, 2));
  fail("Idempotency check failed");
}

// ── Bonus C: Wrong wallet header → 402 ────────────────────────────────────
step("C", "tools/call with WRONG X-402-Agent-Wallet → expect 402 wallet_mismatch");

const wrongRes = await fetch(`${API_BASE}/mcp/${BUNDLE_ID}/mcp`, {
  method: "POST",
  headers: {
    "Content-Type":        "application/json",
    "X-402-Payment-Proof": proofToken,
    "X-402-Agent-Wallet":  "0x0000000000000000000000000000000000000001",  // wrong wallet
  },
  body: JSON.stringify({
    jsonrpc: "2.0", id: 11, method: "tools/call",
    params: { name: `test-dkl5:${TOKEN_ID}`, arguments: { query: "test" } },
  }),
});
info("HTTP status", wrongRes.status);
const wrongBody = await wrongRes.json();
info("reason", wrongBody.reason ?? JSON.stringify(wrongBody));

if (wrongRes.status === 402 && wrongBody.reason === "wallet_mismatch") {
  ok("Correctly rejected with 402 wallet_mismatch ✓");
} else {
  console.log(JSON.stringify(wrongBody, null, 2));
  fail("Expected 402 wallet_mismatch");
}

hr();
console.log("\n🎉  All steps passed — MCP + x402 end-to-end verified!\n");
