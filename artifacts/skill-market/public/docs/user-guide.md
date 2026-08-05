# SkillFun Platform Guide

> **SkillFun** turns your AI agent skills into sovereign on-chain assets.  
> Built on **0G Chain** — ERC-7857 iNFT · MCP · x402 A2A Payments.

---

## Table of Contents

1. [Overview](#overview)
2. [Role: Creator — Mint a Skill NFT](#role-creator--mint-a-skill-nft)
3. [Role: Curator — Build a Bundle](#role-curator--build-a-bundle)
4. [Role: Agent — Connect and Pay Autonomously](#role-agent--connect-and-pay-autonomously)
5. [Update Skill Content (Oracle)](#update-skill-content-oracle)
6. [Claim Your Skill NFT](#claim-your-skill-nft)
7. [Fee Model](#fee-model)
8. [Agent Integration Reference](#agent-integration-reference)

---

## Overview

SkillFun has three roles:

| Role | What they do |
|---|---|
| **Creator** | Registers a GitHub repo as an ERC-7857 iNFT. Content is AES-256 encrypted and stored on 0G Storage. |
| **Curator** | Bundles one or more Skills into a product with a single MCP endpoint. Sets service price and earns x402 payments from agents. |
| **Agent** | Discovers bundles via REST API, calls via MCP, pays autonomously per proof via x402. No human approval needed. |

---

## Role: Creator — Mint a Skill NFT

### Prerequisites

- A GitHub account with a repository containing your skill (code, prompts, workflows, etc.)
- A wallet connected to **0G Chain** (Chain ID: 16661, RPC: `https://evmrpc-testnet.0g.ai`)
- Some W0G for gas (get from the 0G faucet)

### Step 1 — Connect GitHub

1. Go to **Creator → Create Skill** (or click **Mint Skill NFT** on the home page)
2. Click **Connect GitHub** — you will be redirected to GitHub OAuth
3. Authorize SkillFun to read your repository list

### Step 2 — Fill in Skill Details

| Field | Description |
|---|---|
| **Repository URL** | Your GitHub repo, e.g. `yourname/your-skill-repo` |
| **Skill Name** | Human-readable name shown on the market |
| **Description** | What this skill does (shown on SkillCard and SkillDetail) |
| **Tags** | Comma-separated keywords (e.g. `code-review, typescript, analysis`) |
| **Instructions** | How agents should invoke this skill (shown to curators/agents) |
| **Capabilities** | Tool names this skill exposes (e.g. `review_diff`, `analyze_repo`) |
| **Base Price** | W0G per Curator authorization (0 = free, curators authorize for free) |

### Step 3 — Sign and Mint

1. Click **Prepare Mint** — the server verifies your GitHub ownership of the repo, encrypts the skill content with AES-256, and uploads it to 0G Storage
2. Sign the EIP-712 message with your wallet — this proves on-chain ownership
3. Click **Mint NFT** — sends the `mint()` transaction on 0G Chain
4. Wait for confirmation (~2–5 seconds on 0G mainnet)

Your skill now appears in the **Creator** tab and on the public **Market**.

### After Minting

- The **Skill NFT** (ERC-7857) lives in your wallet — you own it
- The encrypted content is stored on 0G Storage, addressed by a root hash locked into the NFT
- Curators can pay your `basePrice` W0G to get an authorization key to include your skill in their bundle

---

## Role: Curator — Build a Bundle

### Prerequisites

- A wallet connected to 0G Chain
- At least one live Skill NFT to add

### Step 1 — Browse Skills

Go to **Curator → Skills** to see all available skills. You can filter by tags, search by name, and click into any skill to see its base price and capabilities.

### Step 2 — Authorize Skills

Before adding a skill to your bundle, you must **authorize** it:

1. Open the skill's detail page
2. Click **Authorize** (this pays `basePrice` W0G to the NFT owner's wallet)
3. The authorization is recorded on-chain — you now have a decryption key to serve this skill

> Skills with `basePrice = 0` are authorized for free.

### Step 3 — Create a Bundle

1. Go to **Curator → Create Bundle**
2. Fill in:
   - **Bundle Name** — shown publicly on the market
   - **Description** — what this bundle does, who it's for
   - **Service Price** — W0G wei per agent invocation (e.g. `10000000000000000` = 0.01 W0G). Set to `0` for free.
   - **Tags** — searchable keywords
3. Add your authorized skills to the bundle (drag to reorder if needed)
4. Click **Create Bundle**

### Step 4 — Your MCP Endpoint is Live

After creation, your bundle has a unique MCP endpoint:

```
https://<your-subdomain>.skillfun.xyz/mcp
```

Agents can call this endpoint and pay via x402. You receive the `servicePrice` W0G for every proof issued.

### Update Bundle Settings

Go to **Curator → Bundles** → select your bundle → **Edit** to change the name, description, service price, or skill list at any time.

---

## Role: Agent — Connect and Pay Autonomously

### Discover Bundles

```http
GET https://app.skillfun.xyz/api/bundles
```

Response includes all live bundles with their MCP endpoint URL, service price, and skill list.

### Call the MCP Endpoint

```http
GET https://<bundle-subdomain>.skillfun.xyz/mcp
```

If the bundle has a service price > 0, the server responds with:

```http
HTTP/1.1 402 Payment Required
X-Payment-Required: {"amount":"<wei>","currency":"W0G","chain":16661,"recipient":"<curator-wallet>"}
```

### Pay with x402

Attach a signed payment header and retry:

```http
GET https://<bundle-subdomain>.skillfun.xyz/mcp
X-Payment: <signed-x402-payment-proof>
```

On success, the server responds with the MCP tool manifest (JSON) and issues a payment proof.

### Invoke a Skill Tool

Once you have the MCP manifest, call individual tools:

```http
POST https://<bundle-subdomain>.skillfun.xyz/mcp/invoke
Content-Type: application/json
X-Payment: <proof>

{
  "tool": "review_diff",
  "params": { "diff": "..." }
}
```

### Python Agent Example

```python
import httpx

BASE = "https://app.skillfun.xyz"

# 1. Discover bundles
bundles = httpx.get(f"{BASE}/api/bundles").json()["bundles"]
target = next(b for b in bundles if "code-review" in b["name"].lower())
mcp_url = f"https://{target['subdomain']}.skillfun.xyz/mcp"

# 2. Call MCP — handle 402
r = httpx.get(mcp_url)
if r.status_code == 402:
    payment_info = r.json()
    proof = sign_x402(payment_info)  # your x402 signing logic
    r = httpx.get(mcp_url, headers={"X-Payment": proof})

manifest = r.json()
print("Available tools:", [t["name"] for t in manifest["tools"]])
```

---

## Update Skill Content (Oracle)

If your skill's code or prompts have changed and you want to update the on-chain content:

### Method 1 — Re-upload via Creator Panel

1. Go to **Creator → Skills** → select your skill
2. Click **Update Content** (only available if you own the NFT)
3. The new content is encrypted and uploaded to 0G Storage
4. Click **Write Oracle** to record the new root hash on-chain via the Oracle contract

> The Oracle contract holds the verified content hash. Curators who have already authorized your skill will receive the updated content automatically.

### Method 2 — Oracle Admin (Claim flow)

If you transferred the NFT or need to update the verified owner on-chain:

1. Go to **Claim**
2. Connect GitHub → the system finds your registered repos
3. Submit a claim — an admin verifies GitHub ownership
4. Once approved, click **Write Oracle** to set your wallet as the verified owner on the `SkillNFT` contract

---

## Claim Your Skill NFT

The **Claim** flow is for creators who:
- Registered a skill from a GitHub repo they own
- Need to prove on-chain that their wallet matches the GitHub owner

Steps:
1. Go to **Claim** in the top navigation
2. Connect your GitHub account (OAuth)
3. The system matches your GitHub repos to registered skills
4. Click **Submit Claim** for any matching skill
5. After admin approval, the Oracle marks your wallet as the verified owner

---

## Fee Model

| Payment | Goes to | When |
|---|---|---|
| **Base Price** (W0G) | NFT Owner | When a Curator calls `authorizeAccess()` on the SkillNFT contract |
| **Service Price** (W0G) | Curator | Every time an agent calls the MCP endpoint and pays via x402 |

- There are no platform fees or royalty splits in the current version
- All payments are on-chain, instant, and permissionless
- Agents pay Curators; Curators pay Creators — no intermediary holds funds

---

## Agent Integration Reference

### REST API

| Endpoint | Method | Description |
|---|---|---|
| `/api/bundles` | GET | List all live bundles |
| `/api/bundles/:id` | GET | Bundle detail with skill list |
| `/api/skills` | GET | List all skills (filter by `?status=minted&tag=xxx`) |
| `/api/skills/:id` | GET | Skill detail with on-chain data |
| `/api/stats` | GET | Platform stats (total skills, bundles, invocations) |

### MCP Endpoint

| Endpoint | Method | Description |
|---|---|---|
| `https://<subdomain>.skillfun.xyz/mcp` | GET | MCP tool manifest (requires x402 if priced) |
| `https://<subdomain>.skillfun.xyz/mcp/invoke` | POST | Invoke a specific skill tool |

### x402 Payment Headers

```
X-Payment-Required: {"amount":"<wei string>","currency":"W0G","chain":16661,"recipient":"<address>","nonce":"<uuid>"}
X-Payment: <base64-encoded signed payment proof>
```

### 0G Chain Details

| Parameter | Value |
|---|---|
| Chain ID | `16661` |
| Currency | W0G (18 decimals) |
| SkillNFT Contract | `0x8d7473cE478FA46C16998d576879aD7c909344e0` |

---

*Built on [0G Chain](https://0g.ai) · [ERC-7857 iNFT Standard](https://eips.ethereum.org/EIPS/eip-7857)*
