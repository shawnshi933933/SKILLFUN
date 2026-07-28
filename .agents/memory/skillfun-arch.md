---
name: SkillFun Architecture
description: Core design decisions — ERC-7857 on 0G Chain, self-mint flow, contract addresses, key quirks
---

## Deployed Contracts (0G Mainnet, chainId 16661) — v2

| Contract | Address |
|---|---|
| `SkillFunOracle` | `0xE95089DF5F6B296129bAF8701a260F6F1692f13d` |
| `SkillFunVerifierStub` | `0x9b583eCDDAf5ddabAb2D0FB52c1aF596235D13a9` |
| `SkillNFT` | `0x27c2Cf883e822B3D8C4cA1FA0877e3eBC4bf79A1` |

Deployer: `0xbb32AD3470290635a852EDc5F2895B75497cA368`

Previous v1 SkillNFT (deprecated): `0x3030F26d3d61B43866a3c166d8f49A9C29A27c5A`

## Self-Mint Architecture (v2)

`registerSkill(repoUrl, skillURI, rootHash, to)` — open to anyone (no `onlyOwner`).

- **"My Repo" mode**: `to = userAddress` → NFT goes to user's wallet immediately
- **"Community" mode**: `to = address(this)` → NFT held by SkillNFT contract in self-custody; real GitHub owner claims via Oracle later

Frontend self-mint flow (2 EIP-712 sigs + 1 on-chain tx):
1. `POST /api/skills/prepare-mint` (action: `user:prepare-mint`) → uploads manifest to 0G Storage, creates DB record, returns `{skillId, rootHash, skillUri, manifestOwner, skillNFTAddress}`
2. wagmi `writeContractAsync` → `SkillNFT.registerSkill(manifestOwner, skillUri, rootHash32, to)`
3. `waitForTransactionReceipt` → parse `SkillRegistered` or `Transfer` event for tokenId
4. `PATCH /api/skills/:id/confirm-mint` (action: `user:confirm-mint`) → updates DB to `mintStatus=minted`

## Key Decisions

- **wagmi v2 not v3** — RainbowKit 2.x requires `wagmi@2`; v3 causes "Invalid hook call / multiple React instances"
- **`@workspace/abi` not available in Vite frontend** — inline ABI fragments directly in hooks instead of importing from workspace package
- **EIP-712 for prepare + confirm** — stateless `verifyWalletSignature` (no session nonce); timestamp window ±5 min is the replay guard
- **0G Storage fallback** — `uploadSkillManifest()` falls back to `keccak256(manifestJSON)` if upload fails; mint still proceeds
- **`registerSkill` first arg is `repoUrl`/`manifestOwner` (string)** — stored on-chain as `manifestOwner`, used to identify GitHub repo for Oracle claim flow
- **tokenId parsed from receipt** — decode `SkillRegistered` event first, fallback to `Transfer` event

## Roadmap State

- ✅ Step 1: Contracts deployed (ERC-7857, Oracle, Verifier)
- ✅ Step 2: Backend API (Express + Drizzle + PostgreSQL)
- ✅ Step 3: Market frontend (React + wagmi v2 + RainbowKit)
- ✅ Step 4: Self-mint flow (user calls contract directly, `to` param for ownership mode)
- 🔲 Step 5: Claim flow (GitHub OAuth → Oracle batch → `claim()`)
- 🔲 Step 6: Creator self-mint (already done in Step 4)
- 🔲 Step 7: Bundle MCP server (ERC-8183)
- 🔲 Step 8: x402 payments + revenue distribution on `invokeSkill()`
