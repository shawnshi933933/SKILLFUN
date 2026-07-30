---
name: SkillFun Architecture
description: Core design decisions — ERC-7857 on 0G Chain, self-mint flow, contract addresses, key quirks
---

## Deployed Contracts (0G Mainnet, chainId 16661) — v4 (self-serve auth)

| Contract | Address |
|---|---|
| `SkillFunOracle` | `0x687a12ff978426DA9F731E7c6c2223f113b4C0f5` |
| `SkillFunVerifierStub` | `0xeC407EE664027AB8Ed84944C47c4FaaE3A5c8E7e` |
| `SkillNFT` **v4** | `0xab1e292c82efa285e70e3fdd0843d66b71055db4` |
| **W0G ERC-20** | `0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c` |

Deployer: `0xbb32AD3470290635a852EDc5F2895B75497cA368`

Previous v3 SkillNFT (deprecated): `0x1f76DEBCf09a1901a002FD1B4d2C636fd2AF4DAF`
Previous v2 SkillNFT (deprecated): `0x27c2Cf883e822B3D8C4cA1FA0877e3eBC4bf79A1`
Previous v1 SkillNFT (deprecated): `0x3030F26d3d61B43866a3c166d8f49A9C29A27c5A`

## Self-Serve Authorization Architecture (v4)

`registerSkill(repoUrl, skillURI, rootHash, to, _basePrice)` — open to anyone.

- `_basePrice` = W0G wei charged via `purchaseAuthorization` (not invokeSkill)
- **"My Repo" mode**: `to = userAddress` → NFT goes to user's wallet immediately
- **"Community" mode**: `to = address(this)` → NFT held by SkillNFT contract; real GitHub owner claims via Oracle later

### Authorization model (v4)

- **Unclaimed** (`ownerOf == contract`): `selfAuthorize(tokenId)` — free, no approval needed. `isAuthorized` returns `true` for everyone.
- **Claimed** (`ownerOf == real wallet`): `purchaseAuthorization(tokenId)` — transfers `basePrice` W0G from caller to NFT owner, adds caller to authorized list.
- **On `claim()`**: `authEpoch[tokenId]++` resets all prior authorizations O(1). Emits `AuthorizationsPurged(tokenId)`.
- `invokeSkill(tokenId)` — still exists for on-chain usage telemetry, but **no longer transfers W0G**. Just emits `SkillInvoked` event.

### Oracle limitation (v4)

`SkillFunOracle.setSkillNFT()` is a one-time call — already points to old v3 contract. `claim()` path is blocked until Oracle is redeployed. All other functions work independently of the Oracle.

Frontend self-mint flow:
1. `POST /api/skills/prepare-mint` → uploads manifest, returns `{skillId, rootHash, skillUri, manifestOwner, skillNFTAddress, w0gAddress}`
2. wagmi `writeContractAsync` → `SkillNFT.registerSkill(manifestOwner, skillUri, rootHash32, to, basePriceBigInt)`
3. `waitForTransactionReceipt` → parse `SkillRegistered` or `Transfer` event for tokenId
4. `PATCH /api/skills/:id/confirm-mint` → DB mintStatus=minted

## Key Decisions

- **Token symbol is "0G"** (not "A0GI") — corrected everywhere in UI and wagmi chain config
- **wagmi v2 not v3** — RainbowKit 2.x requires `wagmi@2`; v3 causes "Invalid hook call / multiple React instances"
- **`@workspace/abi` not available in Vite frontend** — inline ABI fragments directly in hooks instead of importing from workspace package
- **EIP-712 for prepare + confirm** — stateless `verifyWalletSignature` (no session nonce); timestamp window ±5 min is the replay guard
- **0G Storage fallback** — `uploadSkillManifest()` falls back to `keccak256(manifestJSON)` if upload fails; mint still proceeds
- **tokenId parsed from receipt** — decode `SkillRegistered` event first, fallback to `Transfer` event

## Roadmap State

- ✅ Step 1: Contracts deployed (ERC-7857, Oracle, Verifier, W0G payments)
- ✅ Step 2: Backend API (Express + Drizzle + PostgreSQL)
- ✅ Step 3: Market frontend (React + wagmi v2 + RainbowKit)
- ✅ Step 4: Self-mint flow (user calls contract directly, `to` + `basePrice` params)
- 🔲 Step 5: Claim flow (GitHub OAuth → Oracle batch → `claim()`)
- 🔲 Step 7: Bundle MCP server (ERC-8183)
- 🔲 Step 8: x402 agent invoke UI (approve W0G → invokeSkill)
