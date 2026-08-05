/**
 * MCP (Model Context Protocol) JSON-RPC 2.0 handler
 *
 * Routes:
 *   POST /mcp/:bundleId/mcp   — JSON-RPC 2.0 dispatcher
 *   GET  /mcp/:bundleId/tools — tools list shortcut (no auth)
 *
 * x402 payment model (v5 — ERC-20 Transfer):
 *   tools/call and skill resources/read require X-402-Payment-Proof header.
 *   If missing or stale (contentVersion mismatch) → HTTP 402 with:
 *     { method: "erc20-transfer", payTo: bundle.ownerAddress, amount: bundle.servicePrice }
 *   Agent sends W0G ERC-20 directly to the Curator's wallet, then POSTs txHash
 *   to /api/mcp/payment/prove with bundleId, receives a proof token,
 *   and retries with X-402-Payment-Proof: <token>.
 *
 *   Additionally, before serving content, the server verifies:
 *     isAuthorized(tokenId, bundle.ownerAddress) on-chain
 *   If the Curator's wallet is not authorized on SkillNFT, content is withheld
 *   (even if a valid proof token is present — the Curator must authorize first).
 */

import { Router, type Request, type Response } from "express";
import { createPublicClient, http } from "viem";
import { db } from "@workspace/db";
import {
  bundlesTable,
  bundleSkillsTable,
  skillsTable,
  paymentProofsTable,
  skillContentCacheTable,
  invocationLogsTable,
} from "@workspace/db";
import { eq, asc, and } from "drizzle-orm";
import { downloadSkillContent } from "../services/storage.js"; // used in getSkillContent helper
import { getAddresses, ZEROG_MAINNET, SkillNFT_ABI } from "@workspace/abi";
import { logger } from "../lib/logger.js";

const router = Router();

const SKILL_NFT_ADDRESS = getAddresses(16661).SkillNFT;
const MCP_PROTOCOL_VERSION = "2024-11-05";
const W0G_ADDRESS = "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c";

const chainClient = createPublicClient({
  chain: ZEROG_MAINNET,
  transport: http(process.env.ZEROG_RPC_URL ?? "https://evmrpc.0g.ai"),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonRpcOk(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

function jsonRpcError(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

/** Parse "{bundleSlug}:{tokenId}" tool name → tokenId */
function parseToolName(name: string): number | null {
  const parts = name.split(":");
  if (parts.length < 2) return null;
  const tokenId = parseInt(parts[parts.length - 1], 10);
  return Number.isFinite(tokenId) ? tokenId : null;
}

/**
 * Check X-402-Payment-Proof + X-402-Agent-Wallet headers against DB.
 *
 * Bundle-scoped: a proof is only valid for the bundle it was issued for.
 * This prevents cross-bundle replay (paying a cheaper bundle → using proof on an expensive one).
 */
async function validateProof(
  proofToken:   string | undefined,
  agentWallet:  string | undefined,
  skillId:      string,
  contentVersion: number,
  bundleId:     string
): Promise<{ valid: true } | { valid: false; reason: string }> {
  if (!proofToken)  return { valid: false, reason: "missing_proof" };
  if (!agentWallet) return { valid: false, reason: "missing_wallet" };

  const [proof] = await db
    .select()
    .from(paymentProofsTable)
    .where(eq(paymentProofsTable.token, proofToken))
    .limit(1);

  if (!proof)                                                    return { valid: false, reason: "unknown_token" };
  if (proof.agentWallet !== agentWallet.toLowerCase())           return { valid: false, reason: "wallet_mismatch" };
  if (proof.skillId !== skillId)                                 return { valid: false, reason: "wrong_skill" };
  if (proof.contentVersion !== contentVersion)                   return { valid: false, reason: "stale_version" };
  if (proof.bundleId !== null && proof.bundleId !== bundleId)    return { valid: false, reason: "wrong_bundle" };
  if (proof.expiresAt && proof.expiresAt < new Date())           return { valid: false, reason: "expired" };

  return { valid: true };
}

/**
 * Return HTTP 402 challenge.
 *
 * v5 model (erc20-transfer):
 *   Agent sends W0G ERC-20 directly to bundle.ownerAddress (the Curator's wallet).
 *   Amount = bundle.servicePrice (in W0G wei); "0" if the bundle is free.
 *   Agent then POSTs txHash + bundleId to /api/mcp/payment/prove.
 *
 * No on-chain ownerOf check required — payTo is always the Curator's wallet.
 */
function send402(
  res: Response,
  skill: { skillId: string; tokenId: number | null; meta: unknown },
  bundle: { bundleId: string; ownerAddress: string; servicePrice: string | null },
  reason: string
) {
  if (skill.tokenId == null) {
    res.status(503).json({ error: "Skill has no on-chain token — cannot serve content." });
    return;
  }

  const isFreeBundle = !bundle.servicePrice || bundle.servicePrice === "0";

  res.status(402).json({
    error: "Payment required",
    reason,
    x402Version: 1,
    accepts: [
      {
        scheme: "exact",
        network: "0g-mainnet",
        currency: "W0G",
        tokenAddress: W0G_ADDRESS,
        amount:    bundle.servicePrice ?? "0",
        payTo:     bundle.ownerAddress,
        method:    "erc20-transfer",
        tokenId:   skill.tokenId,
        bundleId:  bundle.bundleId,
      },
    ],
    proveEndpoint: "/api/mcp/payment/prove",
    ...(isFreeBundle && {
      freeAccess: {
        instructions:
          "This Bundle is free — no W0G transfer needed. " +
          "IMPORTANT: use your wallet address in ALL LOWERCASE when building the signMessage string and in agentWallet fields (e.g. address.toLowerCase()). " +
          "Sign the message in `signMessage` with your agent wallet (EIP-191 personal_sign / eth_sign / signMessage), " +
          "then POST the fields in `proveBody` (with your actual lowercase address and signature) to the proveEndpoint. " +
          "You will receive a `proof` token; include it as the `X-402-Payment-Proof` header and your wallet as `X-402-Agent-Wallet` on the next tools/call.",
        signMessage: `SkillFun free access: ${bundle.bundleId}:${skill.tokenId}:{your_wallet_address_LOWERCASE}`,
        addressNote: "Replace {your_wallet_address_LOWERCASE} with address.toLowerCase() — the server always lowercases before verifying. Using checksummed (mixed-case) address will cause signature mismatch.",
        proveBody: {
          tokenId:     skill.tokenId,
          bundleId:    bundle.bundleId,
          agentWallet: "{your_wallet_address_LOWERCASE}",
          signature:   "{YOUR_EIP191_SIGNATURE}",
        },
        retryWith: {
          header_X_402_Payment_Proof: "{proof from proveEndpoint response}",
          header_X_402_Agent_Wallet:  "{your_wallet_address_LOWERCASE}",
        },
      },
    }),
  });
}

/**
 * Check on-chain isAuthorized(tokenId, curatorWallet).
 * Returns true if the Curator (bundle.ownerAddress) is authorized to access this skill.
 * Also returns true for unclaimed skills (isAuthorized returns true for everyone).
 */
async function checkCuratorAuthorized(tokenId: number, curatorWallet: string): Promise<boolean> {
  try {
    const authorized = await chainClient.readContract({
      address: SKILL_NFT_ADDRESS as `0x${string}`,
      abi: SkillNFT_ABI,
      functionName: "isAuthorized",
      args: [BigInt(tokenId), curatorWallet as `0x${string}`],
    }) as boolean;
    return authorized;
  } catch (err) {
    logger.warn({ err, tokenId, curatorWallet }, "checkCuratorAuthorized: RPC error — defaulting to false");
    return false;
  }
}

/**
 * Fetch skill content — checks DB cache first, falls back to 0G download + decrypt.
 * Cache key is (tokenId, contentVersion).
 */
async function getSkillContent(skill: {
  tokenId: number | null;
  skillId: string;
  rootHash: string | null;
  aesKey: string | null;
  contentVersion: number;
}): Promise<string> {
  if (!skill.rootHash) throw new Error("Skill content not yet uploaded to 0G Storage");
  if (skill.tokenId == null) throw new Error("Skill has no on-chain token");

  // Check cache
  const [cached] = await db
    .select()
    .from(skillContentCacheTable)
    .where(eq(skillContentCacheTable.tokenId, skill.tokenId))
    .limit(1);

  if (cached && cached.contentVersion === skill.contentVersion) {
    return cached.decryptedContent;
  }

  // Cache miss — download + decrypt
  const content = await downloadSkillContent(skill.rootHash, skill.aesKey);

  // Persist to cache (upsert)
  await db.insert(skillContentCacheTable)
    .values({
      tokenId:          skill.tokenId,
      contentVersion:   skill.contentVersion,
      decryptedContent: content,
      cachedAt:         new Date(),
    })
    .onConflictDoUpdate({
      target: skillContentCacheTable.tokenId,
      set: {
        contentVersion:   skill.contentVersion,
        decryptedContent: content,
        cachedAt:         new Date(),
      },
    });

  return content;
}

// ---------------------------------------------------------------------------
// GET / — machine-readable Bundle discovery index (/.well-known/mcp convention)
//
// Returns all active Bundles with their MCP base URLs so that agents (and
// future MCP clients) can enumerate available Bundles without user input.
// Mounted before /:bundleId so it is never swallowed by the wildcard route.
// ---------------------------------------------------------------------------
router.get("/", async (req, res) => {
  // Pagination: ?limit (default 500, max 1000) + ?offset (default 0)
  // Agents should keep fetching with increasing offset until bundles.length < limit.
  const rawLimit  = parseInt((req.query.limit  as string) ?? "500", 10);
  const rawOffset = parseInt((req.query.offset as string) ?? "0",   10);
  const limit  = Math.min(Math.max(Number.isFinite(rawLimit)  ? rawLimit  : 500, 1), 1000);
  const offset = Math.max(Number.isFinite(rawOffset) ? rawOffset : 0, 0);

  const bundles = await db
    .select()
    .from(bundlesTable)
    .orderBy(asc(bundlesTable.createdAt))
    .limit(limit)
    .offset(offset);

  const proto   = (req.get("x-forwarded-proto") ?? req.protocol).split(",")[0].trim();
  const host    = req.get("x-forwarded-host") ?? req.get("host") ?? "localhost";
  const baseUrl = `${proto}://${host}`;

  const index = bundles.map((b) => ({
    bundleId:     b.bundleId,
    title:        b.name,
    description:  b.description ?? null,
    servicePrice: b.servicePrice ?? "0",
    mcpBaseUrl:   `${baseUrl}/mcp/${b.bundleId}`,
    mcpUrl:       `${baseUrl}/mcp/${b.bundleId}/mcp`,
    toolsUrl:     `${baseUrl}/mcp/${b.bundleId}/tools`,
    guideUrl:     `${baseUrl}/mcp/${b.bundleId}/agent-guide.md`,
  }));

  res.json({
    protocol:    "skillfun-mcp",
    version:     "1",
    bundlesUrl:  `${baseUrl}/api/bundles`,
    agentGuide:  `${baseUrl}/mcp/agent-guide.md`,
    pagination:  { limit, offset, hasMore: bundles.length === limit },
    bundles:     index,
  });
});

// ---------------------------------------------------------------------------
// GET /agent-guide.md — UNIVERSAL onboarding guide (no bundleId, works for any bundle)
// ---------------------------------------------------------------------------
router.get("/agent-guide.md", (_req, res) => {
  const md = `# SkillFun MCP — Universal Agent Guide

> **Read this once.** After reading, you can work with any SkillFun Bundle — just give a Bundle's
> MCP endpoint URL and you'll know exactly what to do. All Bundle-specific details (price, who to
> pay, which tools exist) are self-described by the MCP server itself.

---

## 0. Onboarding Flow — What to Ask Your User

> **Run this flow first**, before anything else. Collect the required inputs from your user,
> then proceed to Section 1 onwards autonomously.

### Step 0.1 — Discover available Bundles

**Before asking the user anything**, call the discovery endpoint to list all available Bundles:

\`\`\`http
GET {ORIGIN}/api/bundles
\`\`\`

\`{ORIGIN}\` is the base URL of the SkillFun server (e.g. \`https://example.com\`).
You can also use \`GET {ORIGIN}/mcp\` which returns a richer index with pre-built MCP URLs:

\`\`\`http
GET {ORIGIN}/mcp
\`\`\`

Both endpoints return a list of Bundles. Each entry includes:
- \`bundleId\` — the Bundle identifier
- \`title\` (or \`name\`) — human-readable name
- \`servicePrice\` — cost in W0G wei (\`"0"\` = free)
- \`mcpBaseUrl\` — the MCP base URL for this Bundle (format: \`{ORIGIN}/mcp/{bundleId}\`)

\`GET {ORIGIN}/mcp\` also returns a \`pagination\` object: \`{ limit, offset, hasMore }\`.
If \`hasMore\` is \`true\`, fetch the next page with \`?limit={limit}&offset={offset+limit}\` and
repeat until \`hasMore\` is \`false\`. Default page size is 500, max is 1000.

**If the user's intent clearly matches one Bundle name**, select it automatically and proceed.
**Otherwise**, present the list to your user and say:
> "I found the following Skill Bundles on this SkillFun server. Which one would you like to use?"
> _(list each Bundle with its title, description, and price)_

Once you have the target Bundle, set \`{MCP_BASE} = mcpBaseUrl\`, then call \`GET {MCP_BASE}/tools\`
to confirm it is reachable and \`POST {MCP_BASE}/mcp\` (initialize) to discover the Bundle name,
tools, and payment details. Report back to your user: Bundle name, number of Skills, and the service price.

### Step 0.2 — Set up your agent wallet

You need an EVM-compatible wallet on 0G Chain (chainId 16661) to sign proofs and, for paid
Bundles, send W0G transfers. Choose **one** of these options and tell your user which you chose:

**Option A — User provides a private key**
> "Do you have a dedicated agent wallet private key I can use? If so, please share it securely.
> I will use it only for SkillFun proof signing and W0G transfers on 0G Chain."

**Option B — Generate a new wallet (recommended for isolation)**
> "I can generate a fresh wallet for this session. I'll display the address so you can fund it.
> Note: keep the private key secret and only fund it with the amount needed."

If generating: derive a wallet, display the address, and move to Step 0.3.

### Step 0.3 — Fund the wallet (paid Bundles only)

After \`initialize\` reveals the service price:

- If **servicePrice = 0 (Free)**: no funding needed. Skip to Step 0.4.
- If **servicePrice > 0 (Paid)**: tell your user:
  > "This Bundle charges **{PRICE_W0G} W0G** per Skill access proof.
  > Please send at least **{PRICE_W0G} W0G** (plus a small amount for gas) to my wallet:
  >
  > \`{AGENT_WALLET_ADDRESS}\`
  >
  > Network: 0G Mainnet (chainId 16661) · Token: W0G (\`0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c\`)
  >
  > Let me know once the transfer is confirmed."

**If the agent wallet has native 0G but not enough W0G — wrap it yourself:**

W0G is the ERC-20 wrapped form of native 0G. The W0G contract has a \`deposit()\` function:
send native 0G as the transaction value, and the contract mints an equal amount of W0G ERC-20 to your wallet.
No approval step, no DEX, no user action needed.

Steps (execute with your agent private key):

1. Check native 0G balance:
   \`\`\`
   eth_getBalance(agentWallet, "latest")   // returns wei
   \`\`\`
2. Decide how much to wrap (leave ~0.01 0G for gas):
   \`\`\`
   wrapAmount = nativeBalance - 0.01 ether   // in wei
   \`\`\`
3. Call \`deposit()\` on the W0G contract:
   \`\`\`
   to:    0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c
   value: wrapAmount  (in wei)
   data:  0xd0e30db0  (= keccak256("deposit()")[0:4])
   \`\`\`
   Sign and broadcast with \`eth_sendRawTransaction\`. Wait for the receipt.
4. Verify W0G balance:
   \`\`\`
   eth_call balanceOf(agentWallet) on 0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c
   \`\`\`

After the wrap confirms, your agent wallet now holds W0G and can proceed to pay the Bundle.

Poll \`balanceOf({AGENT_WALLET_ADDRESS})\` on the W0G contract until the balance is sufficient,
then confirm to your user and proceed automatically.

### Step 0.4 — Confirm and proceed

Once wallet is funded (or Bundle is free), tell your user:
> "Setup complete. I'm now connecting to the Bundle and retrieving the Skill content.
> You don't need to do anything else — I'll handle signing, payment, and proof verification."

Then execute Sections 3–6 (initialize → list tools → prove → call) fully autonomously.

---

## 1. What Is SkillFun?

SkillFun is a Web3 AI Skill Marketplace on 0G Chain (chainId 16661). Skills are encrypted
documents (instructions, prompts, configs, data) stored on-chain. Curators package Skills into
Bundles and expose them over the Model Context Protocol (MCP).

**Key properties:**
- Skills are encrypted at rest on 0G decentralized storage — only paying agents decrypt them.
- Payment is a direct ERC-20 W0G transfer to the Curator wallet. No smart-contract interaction, no approve step.
- Pay once per content version. Call unlimited times until the creator updates the Skill.
- Free Skills exist too — only a wallet signature is required (no transfer).

---

## 2. The Four Endpoints (same for every Bundle)

Given any Bundle MCP base URL \`{MCP_BASE}\` (e.g. \`https://example.com/mcp/bd_abc123\`):

| Route | Method | Purpose |
|-------|--------|---------|
| \`{MCP_BASE}/mcp\` | POST | MCP JSON-RPC 2.0 — initialize · tools/list · tools/call |
| \`{MCP_BASE}/tools\` | GET | Free tools list shortcut (no auth) |
| \`{BASE_URL}/api/mcp/payment/prove\` | POST | Exchange payment evidence for a reusable proof token |
| \`{MCP_BASE}/agent-guide.md\` | GET | Bundle-specific version of this guide (pre-filled values) |

\`{BASE_URL}\` is the origin part of \`{MCP_BASE}\` (e.g. \`https://example.com\`).

---

## 3. Step 0 — Discover Everything via \`initialize\`

Always start with an \`initialize\` call. The response tells you the Bundle name, workflow
instructions, and exactly how to pay.

\`\`\`http
POST {MCP_BASE}/mcp
Content-Type: application/json

{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}
\`\`\`

Response (excerpt):
\`\`\`json
{
  "result": {
    "serverInfo": { "name": "{BUNDLE_NAME}" },
    "_skillfun": {
      "bundleId":    "{BUNDLE_ID}",
      "workflow":    "... Curator's orchestration instructions ...",
      "paymentInfo": {
        "method":       "erc20-transfer",
        "currency":     "W0G",
        "tokenAddress": "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c",
        "payTo":        "{CURATOR_WALLET}",
        "proveEndpoint":"{BASE_URL}/api/mcp/payment/prove"
      }
    }
  }
}
\`\`\`

Save \`_skillfun.bundleId\`, \`paymentInfo.payTo\`, and \`paymentInfo.proveEndpoint\` — you'll need them.

---

## 4. Step 1 — List Tools (free)

\`\`\`
GET {MCP_BASE}/tools
\`\`\`

Response:
\`\`\`json
{
  "tools": [
    {
      "name": "{TOOL_NAME}",
      "_skillfun": { "tokenId": 0 }
    }
  ]
}
\`\`\`

Tool names follow the format \`{bundle-slug}:{tokenId}\`. Save \`_skillfun.tokenId\` for each tool.

---

## 5. Step 2 — Call a Tool (first attempt → HTTP 402)

\`\`\`http
POST {MCP_BASE}/mcp
Content-Type: application/json

{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"{TOOL_NAME}","arguments":{}}}
\`\`\`

If a proof token is missing or stale, the server returns **HTTP 402**:

\`\`\`json
{
  "error": "Payment required",
  "accepts": [{
    "scheme":       "exact",
    "network":      "0g-mainnet",
    "currency":     "W0G",
    "tokenAddress": "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c",
    "amount":       "{AMOUNT_WEI}",
    "payTo":        "{CURATOR_WALLET}",
    "method":       "erc20-transfer",
    "tokenId":      0,
    "bundleId":     "{BUNDLE_ID}"
  }],
  "proveEndpoint": "/api/mcp/payment/prove"
}
\`\`\`

Check \`accepts[0].amount\`:
- \`"0"\` or missing → **Free flow** (Section 6A)
- Any other value → **Paid flow** (Section 6B)

---

## 6A. Free Flow — sign a message, get proof, retry

**Sign this EIP-191 message with your agent wallet:**
\`\`\`
SkillFun free access: {BUNDLE_ID}:{TOKEN_ID}:{your_wallet_address_LOWERCASE}
\`\`\`
⚠️ **Address must be all-lowercase** (\`address.toLowerCase()\`). The server lowercases before verifying — using checksummed (mixed-case) address causes a signature mismatch error.

**POST to prove endpoint:**
\`\`\`http
POST {BASE_URL}/api/mcp/payment/prove
Content-Type: application/json

{
  "tokenId":     {TOKEN_ID},
  "bundleId":    "{BUNDLE_ID}",
  "agentWallet": "{your_wallet_address_LOWERCASE}",
  "signature":   "{YOUR_SIGNATURE}"
}
\`\`\`

Response: \`{ "proof": "abc123...", "skillId": "...", "contentVersion": 1 }\`

**Retry tools/call with proof headers:**
\`\`\`http
POST {MCP_BASE}/mcp
Content-Type: application/json
X-402-Payment-Proof: {proof}
X-402-Agent-Wallet:  {YOUR_WALLET_ADDRESS}

{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"{TOOL_NAME}","arguments":{}}}
\`\`\`

---

## 6B. Paid Flow — transfer W0G, sign, get proof, retry

**Transfer W0G on 0G Chain:**
- Token: \`0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c\` (W0G ERC-20)
- Recipient: \`{CURATOR_WALLET}\` (from \`payTo\` in the 402 response)
- Amount: \`{AMOUNT_WEI}\` wei (from \`amount\` in the 402 response)
- Chain ID: 16661 · RPC: \`https://evmrpc.0g.ai\`
- Standard \`transfer(address, uint256)\` — no approve, no contract call

Wait for confirmation and save the \`txHash\`.

**Sign this EIP-191 message:**
\`\`\`
SkillFun payment proof: {txHash}
\`\`\`

**POST to prove endpoint:**
\`\`\`http
POST {BASE_URL}/api/mcp/payment/prove
Content-Type: application/json

{
  "txHash":      "{txHash}",
  "tokenId":     {TOKEN_ID},
  "bundleId":    "{BUNDLE_ID}",
  "agentWallet": "{YOUR_WALLET_ADDRESS}",
  "signature":   "{YOUR_SIGNATURE}"
}
\`\`\`

**Retry tools/call** — same as Free Flow step above, using the \`proof\` from the response.

---

## 7. Required Headers Summary

| Header | Required for | Value |
|--------|-------------|-------|
| \`Content-Type\` | All POST requests | \`application/json\` |
| \`X-402-Payment-Proof\` | tools/call | The \`proof\` string from /prove |
| \`X-402-Agent-Wallet\` | tools/call | Your wallet address (EIP-55 checksum) |

---

## 8. Proof Lifetime

- A proof covers **(skillId + bundleId + contentVersion)**.
- **No expiry** unless the response includes a non-null \`expiresAt\`.
- **Reusable**: call the same tool unlimited times with the same proof.
- **Invalidated** only when the Skill creator updates the on-chain content (new \`contentVersion\`).
  The server returns \`stale_version\` — pay again for the new version.
- **/prove is idempotent**: sending the same txHash or free-signature again returns the same proof (\`reissued: true\`). Safe to retry on network failure.

---

## 9. Universal TypeScript Template

\`\`\`typescript
import { createWalletClient, createPublicClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";

// ── Config ────────────────────────────────────────────────────────────────────
const MCP_BASE = "https://YOUR_DOMAIN/mcp/YOUR_BUNDLE_ID"; // ← only thing you change
const account  = privateKeyToAccount("0xYOUR_PRIVATE_KEY");
const chain    = { id: 16661, name: "0G Mainnet",
  nativeCurrency: { name: "0G", symbol: "A0GI", decimals: 18 },
  rpcUrls: { default: { http: ["https://evmrpc.0g.ai"] } } };
const pub    = createPublicClient({ chain, transport: http("https://evmrpc.0g.ai") });
const wallet = createWalletClient({ account, chain, transport: http("https://evmrpc.0g.ai") });
const erc20  = parseAbi(["function transfer(address,uint256) returns (bool)"]);

const sign = (msg: string) => account.signMessage({ message: msg });

// ── 0. Initialize — discover bundle info ─────────────────────────────────────
const init = await fetch(MCP_BASE + "/mcp", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 0, method: "initialize", params: {} }),
}).then(r => r.json());
const { bundleId, paymentInfo } = init.result._skillfun;
const BASE_URL   = new URL(MCP_BASE).origin;
const PROVE_URL  = BASE_URL + "/api/mcp/payment/prove";

// ── 1. List tools ─────────────────────────────────────────────────────────────
const { tools } = await fetch(MCP_BASE + "/tools").then(r => r.json());
const tool    = tools[0]; // pick the tool you need
const toolName = tool.name;
const tokenId  = tool._skillfun.tokenId;

// ── 2. First call → expect 402 ────────────────────────────────────────────────
const r1 = await fetch(MCP_BASE + "/mcp", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call",
    params: { name: toolName, arguments: {} } }),
});
const data402 = r1.status === 402 ? await r1.json() : null;

// ── 3. Get proof ──────────────────────────────────────────────────────────────
let proof: string;
if (!data402 || data402.accepts[0].amount === "0") {
  // Free flow
  const sig = await sign(\`SkillFun free access: \${bundleId}:\${tokenId}:\${account.address.toLowerCase()}\`);
  const p = await fetch(PROVE_URL, { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokenId, bundleId, agentWallet: account.address.toLowerCase(), signature: sig }) }).then(r => r.json());
  proof = p.proof;
} else {
  // Paid flow
  const { amount, payTo } = data402.accepts[0];
  const txHash = await wallet.writeContract({
    address: "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c",
    abi: erc20, functionName: "transfer", args: [payTo, BigInt(amount)],
  });
  await pub.waitForTransactionReceipt({ hash: txHash });
  const sig = await sign(\`SkillFun payment proof: \${txHash}\`);
  const p = await fetch(PROVE_URL, { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ txHash, tokenId, bundleId, agentWallet: account.address, signature: sig }) }).then(r => r.json());
  proof = p.proof;
}

// ── 4. Call with proof ────────────────────────────────────────────────────────
const result = await fetch(MCP_BASE + "/mcp", {
  method: "POST",
  headers: { "Content-Type": "application/json",
    "X-402-Payment-Proof": proof, "X-402-Agent-Wallet": account.address },
  body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/call",
    params: { name: toolName, arguments: {} } }),
}).then(r => r.json());

console.log(result.result.content[0].text);
\`\`\`

---

## 10. Troubleshooting

| Error / Status | Cause | Fix |
|----------------|-------|-----|
| HTTP 402 \`missing_proof\` | \`X-402-Payment-Proof\` header absent | Complete steps 6A or 6B to obtain a proof |
| \`unknown_token\` | Proof string not found in DB | Re-run the /prove step |
| \`wallet_mismatch\` | \`X-402-Agent-Wallet\` differs from signing wallet | Use the same address in both the signature and the header |
| \`wrong_bundle\` | Proof issued for a different bundleId | Prove for the correct bundleId |
| \`stale_version\` | Creator updated Skill content on-chain | Pay again to get a fresh proof for the new version |
| \`not_authorized\` | Curator hasn't authorized this Skill on-chain | Contact the Bundle Curator |
| \`unknown_tool\` | Tool name not in this bundle | Fetch \`GET {MCP_BASE}/tools\` and pick an exact name |
| HTTP 400 \`tokenId … required\` | Missing fields in /prove body | Include all: \`tokenId\`, \`bundleId\`, \`agentWallet\`, \`signature\` (+ \`txHash\` for paid) |
| \`W0G transfer … less than required\` | Sent wrong amount | Use the exact \`amount\` value (in wei) from the 402 response |
| \`No valid W0G Transfer found\` | Wrong txHash, wrong token, or wrong recipient | Verify the tx transfers W0G (\`0x1cd0…\`) to the address in \`payTo\` |
| \`Transaction not found or still pending\` | Tx not yet confirmed | Wait a few seconds and retry /prove |

---

## 11. Network & Contract Reference

| | |
|-|-|
| **Chain**     | 0G Mainnet (chainId 16661) |
| **RPC**       | \`https://evmrpc.0g.ai\` |
| **W0G token** | \`0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c\` |
| **SkillNFT**  | \`0x390e723bAeE68503bB12DC7a8F1264F1A4A23535\` |
| **Explorer**  | https://chainscan.0g.ai |

---

*SkillFun Universal Agent Guide · protocol v1 · [Source](https://github.com/skillfun)*
`;

  res.type("text/markdown; charset=utf-8").send(md);
});

// ---------------------------------------------------------------------------
// GET /:bundleId/agent-guide.md — bundle-specific onboarding document
// ---------------------------------------------------------------------------
router.get("/:bundleId/agent-guide.md", async (req, res) => {
  const bundleId = req.params.bundleId as string;

  const [bundle] = await db
    .select()
    .from(bundlesTable)
    .where(eq(bundlesTable.bundleId, bundleId))
    .limit(1);

  if (!bundle) { res.status(404).type("text/plain").send("Bundle not found"); return; }

  const bundleSkills = await db
    .select({ skill: skillsTable })
    .from(bundleSkillsTable)
    .innerJoin(skillsTable, eq(bundleSkillsTable.skillId, skillsTable.skillId))
    .where(eq(bundleSkillsTable.bundleId, bundleId))
    .orderBy(asc(bundleSkillsTable.position));

  // Build base URL from forwarded headers (works behind Replit proxy)
  const proto   = (req.get("x-forwarded-proto") ?? req.protocol).split(",")[0].trim();
  const host    = req.get("x-forwarded-host") ?? req.get("host") ?? "localhost";
  const baseUrl = `${proto}://${host}`;
  const mcpBase  = `${baseUrl}/mcp/${bundleId}`;
  const mcpUrl   = `${mcpBase}/mcp`;
  const toolsUrl = `${mcpBase}/tools`;
  const proveUrl = `${baseUrl}/api/mcp/payment/prove`;
  const guideUrl = `${mcpBase}/agent-guide.md`;

  const sp         = bundle.servicePrice;
  const isFree     = !sp || sp === "0";
  const priceWei   = sp ?? "0";
  const priceW0G   = isFree ? "0" : (Number(priceWei) / 1e18).toString();

  // Tools table
  const toolRows = bundleSkills.length
    ? bundleSkills.map(({ skill }) => {
        const meta        = (skill.meta ?? {}) as Record<string, unknown>;
        const skillName   = (meta.name as string)        || skill.repoUrl.split("/").pop() || skill.repoUrl;
        const skillDesc   = (meta.description as string) || "—";
        return `| \`${bundle.subdomain}:${skill.tokenId}\` | ${skillName} | ${skillDesc.slice(0, 70)} |`;
      }).join("\n")
    : "| _(no skills yet)_ | — | — |";

  const eg = bundleSkills[0];
  const egName    = eg ? `${bundle.subdomain}:${eg.skill.tokenId}` : "bundle-slug:0";
  const egTokenId = eg?.skill.tokenId ?? 0;

  const now = new Date().toISOString().slice(0, 10);

  const md = `# SkillFun MCP Agent Guide — ${bundle.name}

> **Copy this entire document and paste it into your agent's context window.**
> After reading, your agent knows exactly how to discover, pay for, and call every Skill in this Bundle.

---

## 1. What Is This?

**SkillFun** is a Web3 AI Skill Marketplace built on 0G Chain (chainId 16661).
Skills are encrypted documents (instructions, configs, data) stored on-chain.
This Bundle — **${bundle.name}** (\`${bundleId}\`) — exposes ${bundleSkills.length} Skill(s) through a single MCP endpoint.

**Payment model:** ${isFree
    ? "All Skills in this Bundle are **free**. No on-chain transfer needed — just sign a message."
    : `**${priceW0G} W0G** per proof (ERC-20 transfer to Curator wallet). Pay once, call unlimited times until the creator updates the Skill.`}

---

## 2. Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| \`/mcp/${bundleId}/mcp\`          | POST | MCP JSON-RPC 2.0 (initialize · tools/list · tools/call) |
| \`/mcp/${bundleId}/tools\`        | GET  | Free tools list (no auth required) |
| \`/api/mcp/payment/prove\`        | POST | Exchange payment proof for access token |
| \`/mcp/${bundleId}/agent-guide.md\` | GET  | This document (always up-to-date) |

**Base URL:** \`${baseUrl}\`

---

## 3. Available Skills (Tools)

| Tool Name | Skill | Description |
|-----------|-------|-------------|
${toolRows}

Tool names use the format \`{bundle-slug}:{tokenId}\`.

---

## 4. Step-by-Step: ${isFree ? "Free Skill Access" : "Paid Skill Access (x402)"}

${isFree ? `### Free Flow — sign a message, get a proof, call the skill

**Step 1 — List tools (optional, already shown above)**
\`\`\`
GET ${toolsUrl}
\`\`\`

**Step 2 — Call a tool (first attempt → HTTP 402)**
\`\`\`http
POST ${mcpUrl}
Content-Type: application/json

{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"${egName}","arguments":{}}}
\`\`\`
Server replies with HTTP 402 and a JSON body. Ignore the payment amount — for free bundles, only the \`tokenId\` and \`bundleId\` fields matter.

**Step 3 — Sign the free-access message (EIP-191 personal_sign)**
\`\`\`
Message: "SkillFun free access: ${bundleId}:${egTokenId}:{your_wallet_address_LOWERCASE}"
\`\`\`
⚠️ **Address MUST be all-lowercase** — use \`address.toLowerCase()\`. The server lowercases the address before verifying the signature. Using checksummed (mixed-case EIP-55) address will always fail with a signature mismatch, even if the signature itself is valid.
Use \`eth_sign\` / \`personal_sign\` / \`account.signMessage()\` — standard EIP-191.

**Step 4 — POST to prove endpoint**
\`\`\`http
POST ${proveUrl}
Content-Type: application/json

{
  "tokenId":     ${egTokenId},
  "bundleId":    "${bundleId}",
  "agentWallet": "{your_wallet_address_LOWERCASE}",
  "signature":   "{YOUR_SIGNATURE}"
}
\`\`\`
Response:
\`\`\`json
{ "proof": "abc123...", "skillId": "sk_...", "contentVersion": 1, "expiresAt": null }
\`\`\`

**Step 5 — Retry tools/call with proof headers**
\`\`\`http
POST ${mcpUrl}
Content-Type: application/json
X-402-Payment-Proof: {proof}
X-402-Agent-Wallet:  {YOUR_WALLET_ADDRESS}

{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"${egName}","arguments":{}}}
\`\`\`
Server decrypts the Skill content from 0G Storage and returns it as MCP TextContent.`

    : `### Paid Flow — transfer W0G, sign a message, get a proof, call the skill

**Step 1 — List tools (optional, already shown above)**
\`\`\`
GET ${toolsUrl}
\`\`\`

**Step 2 — Call a tool (first attempt → HTTP 402)**
\`\`\`http
POST ${mcpUrl}
Content-Type: application/json

{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"${egName}","arguments":{}}}
\`\`\`
The 402 response body:
\`\`\`json
{
  "error": "Payment required",
  "accepts": [{
    "scheme": "exact",
    "network": "0g-mainnet",
    "currency": "W0G",
    "tokenAddress": "${W0G_ADDRESS}",
    "amount": "${priceWei}",
    "payTo": "${bundle.ownerAddress}",
    "method": "erc20-transfer",
    "tokenId": ${egTokenId},
    "bundleId": "${bundleId}"
  }],
  "proveEndpoint": "/api/mcp/payment/prove"
}
\`\`\`

**Step 3 — Send ERC-20 W0G transfer on 0G Chain**
- **Token contract:** \`${W0G_ADDRESS}\` (W0G)
- **Recipient (Curator wallet):** \`${bundle.ownerAddress}\`
- **Amount:** \`${priceWei}\` wei = **${priceW0G} W0G**
- **Chain ID:** 16661 · RPC: \`https://evmrpc.0g.ai\`
- This is a direct \`transfer(address, uint256)\` ERC-20 call. No \`approve\` step, no contract interaction.

Wait for the transaction to be mined. Save the \`txHash\`.

**Step 4 — Sign the payment proof message (EIP-191 personal_sign)**
\`\`\`
Message: "SkillFun payment proof: {txHash}"
\`\`\`
Replace \`{txHash}\` with the actual transaction hash from Step 3.

**Step 5 — POST to prove endpoint**
\`\`\`http
POST ${proveUrl}
Content-Type: application/json

{
  "txHash":      "{txHash}",
  "tokenId":     ${egTokenId},
  "bundleId":    "${bundleId}",
  "agentWallet": "{YOUR_WALLET_ADDRESS}",
  "signature":   "{YOUR_SIGNATURE}"
}
\`\`\`
Response:
\`\`\`json
{ "proof": "abc123...", "skillId": "sk_...", "contentVersion": 1, "expiresAt": null }
\`\`\`

**Step 6 — Retry tools/call with proof headers**
\`\`\`http
POST ${mcpUrl}
Content-Type: application/json
X-402-Payment-Proof: {proof}
X-402-Agent-Wallet:  {YOUR_WALLET_ADDRESS}

{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"${egName}","arguments":{}}}
\`\`\`
Server decrypts the Skill content from 0G Storage and returns it as MCP TextContent.`}

---

## 5. Required HTTP Headers Summary

| Header | Required when | Value |
|--------|--------------|-------|
| \`Content-Type\` | All POST requests | \`application/json\` |
| \`X-402-Payment-Proof\` | tools/call | The \`proof\` string from /prove |
| \`X-402-Agent-Wallet\` | tools/call | Your agent wallet address (EIP-55 checksum) |

---

## 6. Proof Token Lifetime

- A proof is scoped to **(skillId, bundleId, contentVersion)**.
- It is valid **indefinitely** — no expiry — unless \`expiresAt\` is set in the response.
- It is **reusable**: call the same tool unlimited times with the same proof.
- It becomes **stale** (\`stale_version\` error) only when the Skill creator updates the encrypted content on-chain (new contentVersion). You must pay again to get a fresh proof.
- Calling \`/prove\` multiple times with the same txHash (or free signature) is **idempotent** — you get the same proof back (\`reissued: true\`). Safe to retry on network failure.

---

## 7. Full TypeScript Example

\`\`\`typescript
import { createWalletClient, createPublicClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const account  = privateKeyToAccount("0xYOUR_PRIVATE_KEY");
const chain    = {
  id: 16661, name: "0G Mainnet",
  nativeCurrency: { name: "0G", symbol: "A0GI", decimals: 18 },
  rpcUrls: { default: { http: ["https://evmrpc.0g.ai"] } },
};
const pubClient    = createPublicClient({ chain, transport: http("https://evmrpc.0g.ai") });
const walletClient = createWalletClient({ account, chain, transport: http("https://evmrpc.0g.ai") });

const MCP_URL   = "${mcpUrl}";
const PROVE_URL = "${proveUrl}";
const BUNDLE_ID = "${bundleId}";
const TOKEN_ID  = ${egTokenId};
const TOOL_NAME = "${egName}";
${isFree ? "" : `const W0G       = "${W0G_ADDRESS}";
const PAY_TO    = "${bundle.ownerAddress}";
const AMOUNT    = ${priceWei}n; // ${priceW0G} W0G
`}
// Helper: sign EIP-191 message
const sign = (msg: string) => account.signMessage({ message: msg });

async function callSkill() {
  // 1. First attempt (will 402)
  const r1 = await fetch(MCP_URL, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call",
      params: { name: TOOL_NAME, arguments: {} } }),
  });
  if (r1.status !== 402) throw new Error("Expected 402");

${isFree ? `  // 2. Free proof
  const freeSig = await sign(\`SkillFun free access: \${BUNDLE_ID}:\${TOKEN_ID}:\${account.address.toLowerCase()}\`);
  const prove = await fetch(PROVE_URL, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokenId: TOKEN_ID, bundleId: BUNDLE_ID,
      agentWallet: account.address.toLowerCase(), signature: freeSig }),
  }).then(r => r.json());` : `  // 2. Send W0G transfer
  const erc20 = parseAbi(["function transfer(address to, uint256 amount) returns (bool)"]);
  const txHash = await walletClient.writeContract({
    address: W0G, abi: erc20, functionName: "transfer", args: [PAY_TO, AMOUNT],
  });
  await pubClient.waitForTransactionReceipt({ hash: txHash });

  // 3. Prove payment
  const paidSig = await sign(\`SkillFun payment proof: \${txHash}\`);
  const prove = await fetch(PROVE_URL, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ txHash, tokenId: TOKEN_ID, bundleId: BUNDLE_ID,
      agentWallet: account.address, signature: paidSig }),
  }).then(r => r.json());`}

  // ${isFree ? "3" : "4"}. Retry with proof
  const r2 = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-402-Payment-Proof": prove.proof,
      "X-402-Agent-Wallet":  account.address,
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/call",
      params: { name: TOOL_NAME, arguments: {} } }),
  }).then(r => r.json());

  console.log(r2.result.content[0].text);
}

callSkill().catch(console.error);
\`\`\`

---

## 8. Troubleshooting

| Error / Status | Cause | Fix |
|----------------|-------|-----|
| HTTP 402 \`missing_proof\` | \`X-402-Payment-Proof\` header absent | Complete steps 3–5 (free) or 3–6 (paid) to get a proof |
| \`unknown_token\` | Proof string not in DB | Re-run the /prove step |
| \`wallet_mismatch\` | \`X-402-Agent-Wallet\` differs from wallet that signed | Use exactly the same address in both the signature and the header |
| \`wrong_bundle\` | Proof was issued for a different bundleId | Get a new proof for \`${bundleId}\` |
| \`stale_version\` | Skill creator updated content on-chain | Pay again — the content version changed |
| \`not_authorized\` | Curator hasn't authorized this Skill on-chain | Contact the Bundle curator (\`${bundle.ownerAddress}\`) |
| \`unknown_tool\` | Tool name not found in this bundle | Fetch \`GET ${toolsUrl}\` and pick an exact tool name |
| HTTP 400 \`tokenId … required\` | Missing fields in /prove body | Include all fields: \`tokenId\`, \`bundleId\`, \`agentWallet\`, \`signature\`${isFree ? "" : " (+ \`txHash\` for paid)"} |
| HTTP 400 \`W0G transfer … less than required\` | Sent less W0G than servicePrice | Transfer exactly \`${priceWei}\` wei (\`${priceW0G} W0G\`) |
| \`No valid W0G Transfer found\` | txHash belongs to a different tx or wrong token | Verify the txHash is for a W0G (\`${W0G_ADDRESS}\`) transfer to \`${bundle.ownerAddress}\` |
| \`Transaction not found or still pending\` | Tx not yet mined | Wait a few seconds and retry /prove |

---

## 9. Network & Contract Reference

| | |
|-|--|
| **Chain**          | 0G Mainnet (chainId 16661) |
| **RPC**            | \`https://evmrpc.0g.ai\` |
| **W0G token**      | \`${W0G_ADDRESS}\` |
| **SkillNFT**       | \`0x390e723bAeE68503bB12DC7a8F1264F1A4A23535\` |
| **Curator wallet** | \`${bundle.ownerAddress}\` |
| **Explorer**       | https://chainscan.0g.ai |

---

*Generated by SkillFun · Bundle \`${bundleId}\` · ${now} · [Refresh](${guideUrl})*
`;

  res.type("text/markdown; charset=utf-8").send(md);
});

// ---------------------------------------------------------------------------
// GET /:bundleId/tools — free tools list (no auth)
// ---------------------------------------------------------------------------
router.get("/:bundleId/tools", async (req, res) => {
  const bundleId = req.params.bundleId as string;

  const [bundle] = await db
    .select()
    .from(bundlesTable)
    .where(eq(bundlesTable.bundleId, bundleId))
    .limit(1);

  if (!bundle) {
    res.status(404).json({ error: "Bundle not found" });
    return;
  }

  const bundleSkills = await db
    .select({ skill: skillsTable })
    .from(bundleSkillsTable)
    .innerJoin(skillsTable, eq(bundleSkillsTable.skillId, skillsTable.skillId))
    .where(eq(bundleSkillsTable.bundleId, bundleId))
    .orderBy(asc(bundleSkillsTable.position));

  const tools = bundleSkills.map(({ skill }) => buildTool(bundle.subdomain, skill));
  res.json({ bundleId, subdomain: bundle.subdomain, tools });
});

// ---------------------------------------------------------------------------
// POST /:bundleId/mcp — JSON-RPC 2.0 dispatcher
// ---------------------------------------------------------------------------
router.post("/:bundleId/mcp", async (req, res) => {
  const bundleId = req.params.bundleId as string;
  const body = req.body as { jsonrpc?: string; id?: unknown; method?: string; params?: unknown };

  // Validate JSON-RPC envelope
  if (body.jsonrpc !== "2.0" || !body.method) {
    res.status(400).json(jsonRpcError(body.id ?? null, -32600, "Invalid JSON-RPC request"));
    return;
  }

  const id = body.id ?? null;
  const method = body.method;
  const params = (body.params ?? {}) as Record<string, unknown>;

  // Load bundle (needed by most methods)
  const [bundle] = await db
    .select()
    .from(bundlesTable)
    .where(eq(bundlesTable.bundleId, bundleId))
    .limit(1);

  if (!bundle) {
    res.status(404).json(jsonRpcError(id, -32001, "Bundle not found"));
    return;
  }

  try {
    switch (method) {
      // ── initialize ─────────────────────────────────────────────────────────
      case "initialize": {
        res.json(jsonRpcOk(id, {
          protocolVersion: MCP_PROTOCOL_VERSION,
          serverInfo: { name: "SkillFun MCP Gateway", version: "1.0.0" },
          capabilities: { tools: { listChanged: false }, resources: { listChanged: false } },
          _skillfun: {
            bundleId: bundle.bundleId,
            subdomain: bundle.subdomain,
            name: bundle.name,
            description: bundle.description ?? "",
            workflow: bundle.workflow ?? "",
            paymentInfo: {
              currency:    "W0G",
              tokenAddress: W0G_ADDRESS,
              method:      "erc20-transfer",
              payTo:       bundle.ownerAddress,
              amount:      bundle.servicePrice ?? "0",
              proveEndpoint: "/api/mcp/payment/prove",
              model: "pay-per-version: proof valid until Curator updates skill content",
            },
          },
        }));
        return;
      }

      // ── notifications/initialized (no-op) ──────────────────────────────────
      case "notifications/initialized":
      case "ping": {
        res.status(200).end();
        return;
      }

      // ── tools/list ─────────────────────────────────────────────────────────
      case "tools/list": {
        const bundleSkills = await db
          .select({ skill: skillsTable })
          .from(bundleSkillsTable)
          .innerJoin(skillsTable, eq(bundleSkillsTable.skillId, skillsTable.skillId))
          .where(eq(bundleSkillsTable.bundleId, bundleId))
          .orderBy(asc(bundleSkillsTable.position));

        const tools = bundleSkills.map(({ skill }) => buildTool(bundle.subdomain, skill));
        res.json(jsonRpcOk(id, { tools }));
        return;
      }

      // ── tools/call ─────────────────────────────────────────────────────────
      case "tools/call": {
        const toolName = params.name as string | undefined;
        if (!toolName) {
          res.json(jsonRpcError(id, -32602, "params.name is required"));
          return;
        }

        const tokenId = parseToolName(toolName);
        if (tokenId === null) {
          res.json(jsonRpcError(id, -32602, `Invalid tool name format: "${toolName}". Expected "{bundle}:{tokenId}"`));
          return;
        }

        // Find the skill in this bundle
        const [row] = await db
          .select({ skill: skillsTable })
          .from(bundleSkillsTable)
          .innerJoin(skillsTable, eq(bundleSkillsTable.skillId, skillsTable.skillId))
          .where(and(
            eq(bundleSkillsTable.bundleId, bundleId),
            eq(skillsTable.tokenId, tokenId)
          ))
          .limit(1);

        if (!row) {
          res.json(jsonRpcError(id, -32001, `Tool "${toolName}" not found in bundle "${bundleId}"`));
          return;
        }

        const { skill } = row;

        // ── x402 proof check (bundle-scoped) ──────────────────────────────
        const proofToken   = req.headers["x-402-payment-proof"] as string | undefined;
        const agentWallet  = req.headers["x-402-agent-wallet"]  as string | undefined;
        const proofCheck = await validateProof(proofToken, agentWallet, skill.skillId, skill.contentVersion, bundleId);

        if (!proofCheck.valid) {
          logger.info({ bundleId, toolName, reason: proofCheck.reason }, "mcp tools/call 402");
          send402(res, skill, bundle, proofCheck.reason);
          return;
        }

        // ── isAuthorized check: Curator must be authorized on SkillNFT ────
        if (skill.tokenId != null) {
          const curatorAuthorized = await checkCuratorAuthorized(skill.tokenId, bundle.ownerAddress);
          if (!curatorAuthorized) {
            res.json(jsonRpcError(id, -32403,
              `Curator wallet ${bundle.ownerAddress} is not authorized for skill tokenId=${skill.tokenId}. ` +
              `The Curator must call selfAuthorize(${skill.tokenId}) (unclaimed) or purchaseAuthorization(${skill.tokenId}) (claimed) on the SkillNFT contract.`
            ));
            return;
          }
        }

        // ── fetch + decrypt content (cache-first) ─────────────────────────
        try {
          const content = await getSkillContent(skill);
          // Log the invocation — fire-and-forget so it never blocks the response.
          // One row per tools/call; drives both the Invocations counter and the Activity feed.
          db.insert(invocationLogsTable).values({
            id:          `inv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
            skillId:     skill.skillId,
            bundleId,
            agentWallet: agentWallet?.toLowerCase() ?? "unknown",
            proofToken:  proofToken ?? null,
          }).catch((err) => logger.warn({ err, skillId: skill.skillId }, "mcp: failed to log invocation"));
          logger.info({ bundleId, toolName, skillId: skill.skillId }, "mcp tools/call success");
          res.json(jsonRpcOk(id, {
            content: [{ type: "text", text: content }],
            _skillfun: {
              skillId: skill.skillId,
              contentVersion: skill.contentVersion,
              rootHash: skill.rootHash,
            },
          }));
        } catch (err) {
          logger.error({ err, skillId: skill.skillId, rootHash: skill.rootHash }, "mcp 0G fetch failed");
          res.json(jsonRpcError(id, -32001, "Failed to fetch skill content from 0G Storage. Content may not be finalized yet."));
        }
        return;
      }

      // ── resources/list ─────────────────────────────────────────────────────
      case "resources/list": {
        const bundleSkills = await db
          .select({ skill: skillsTable })
          .from(bundleSkillsTable)
          .innerJoin(skillsTable, eq(bundleSkillsTable.skillId, skillsTable.skillId))
          .where(eq(bundleSkillsTable.bundleId, bundleId))
          .orderBy(asc(bundleSkillsTable.position));

        const resources = [
          {
            uri: `skillfun://${bundleId}/workflow.md`,
            name: "Bundle Workflow",
            description: "Orchestration playbook — how to sequence the Skills in this Bundle",
            mimeType: "text/markdown",
            annotations: { audience: ["assistant"], payment: "free" },
          },
          ...bundleSkills.map(({ skill }) => ({
            uri: `skillfun://${bundleId}/skills/${skill.tokenId}`,
            name: skillDisplayName(skill, bundle.subdomain),
            description: (skill.meta as Record<string, unknown>)?.description as string ?? "",
            mimeType: "text/plain",
            annotations: { audience: ["assistant"], payment: "x402-W0G" },
          })),
        ];

        res.json(jsonRpcOk(id, { resources }));
        return;
      }

      // ── resources/read ─────────────────────────────────────────────────────
      case "resources/read": {
        const uri = params.uri as string | undefined;
        if (!uri) {
          res.json(jsonRpcError(id, -32602, "params.uri is required"));
          return;
        }

        // Free: workflow resource
        if (uri === `skillfun://${bundleId}/workflow.md`) {
          res.json(jsonRpcOk(id, {
            contents: [{
              uri,
              mimeType: "text/markdown",
              text: bundle.workflow ?? "No workflow defined for this bundle yet.",
            }],
          }));
          return;
        }

        // Paid: skill resource
        const skillTokenMatch = uri.match(/^skillfun:\/\/[^/]+\/skills\/(\d+)$/);
        if (!skillTokenMatch) {
          res.json(jsonRpcError(id, -32602, `Unknown resource URI: "${uri}"`));
          return;
        }

        const tokenId = parseInt(skillTokenMatch[1], 10);
        const [row] = await db
          .select({ skill: skillsTable })
          .from(bundleSkillsTable)
          .innerJoin(skillsTable, eq(bundleSkillsTable.skillId, skillsTable.skillId))
          .where(and(
            eq(bundleSkillsTable.bundleId, bundleId),
            eq(skillsTable.tokenId, tokenId)
          ))
          .limit(1);

        if (!row) {
          res.json(jsonRpcError(id, -32001, `Skill resource not found: "${uri}"`));
          return;
        }

        const { skill } = row;

        // x402 check (bundle-scoped)
        const proofToken  = req.headers["x-402-payment-proof"] as string | undefined;
        const agentWallet = req.headers["x-402-agent-wallet"]  as string | undefined;
        const proofCheck = await validateProof(proofToken, agentWallet, skill.skillId, skill.contentVersion, bundleId);

        if (!proofCheck.valid) {
          send402(res, skill, bundle, proofCheck.reason);
          return;
        }

        // isAuthorized check
        if (skill.tokenId != null) {
          const curatorAuthorized = await checkCuratorAuthorized(skill.tokenId, bundle.ownerAddress);
          if (!curatorAuthorized) {
            res.json(jsonRpcError(id, -32403,
              `Curator wallet ${bundle.ownerAddress} is not authorized for skill tokenId=${skill.tokenId}. ` +
              `Call selfAuthorize or purchaseAuthorization on the SkillNFT contract first.`
            ));
            return;
          }
        }

        try {
          const content = await getSkillContent(skill);
          res.json(jsonRpcOk(id, {
            contents: [{ uri, mimeType: "text/plain", text: content }],
          }));
        } catch (err) {
          logger.error({ err, skillId: skill.skillId }, "mcp resources/read 0G fetch failed");
          res.json(jsonRpcError(id, -32001, "Failed to fetch skill content from 0G Storage."));
        }
        return;
      }

      // ── unknown method ─────────────────────────────────────────────────────
      default: {
        res.json(jsonRpcError(id, -32601, `Method not found: "${method}"`));
      }
    }
  } catch (err) {
    logger.error({ err, bundleId, method }, "mcp handler error");
    res.status(500).json(jsonRpcError(id, -32000, "Internal server error"));
  }
});

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function skillDisplayName(skill: typeof skillsTable.$inferSelect, bundleSubdomain: string): string {
  const meta = (skill.meta as Record<string, unknown>) ?? {};
  return (meta.name as string) || skill.repoUrl.split("/").pop() || `${bundleSubdomain}:${skill.tokenId}`;
}

function buildTool(bundleSubdomain: string, skill: typeof skillsTable.$inferSelect) {
  const meta = (skill.meta as Record<string, unknown>) ?? {};
  const description = (meta.description as string) || (meta.name as string) || skill.repoUrl;
  return {
    name: `${bundleSubdomain}:${skill.tokenId ?? skill.skillId}`,
    description,
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string" as const,
          description: "Your query or input for this skill",
        },
      },
    },
    _skillfun: {
      skillId: skill.skillId,
      tokenId: skill.tokenId,
      contentVersion: skill.contentVersion,
      /** AI-generated list of MCP tool / function names this skill exposes. */
      capabilities: Array.isArray(meta.capabilities) ? (meta.capabilities as string[]) : [],
      payment: "x402-W0G",
    },
  };
}

export default router;
