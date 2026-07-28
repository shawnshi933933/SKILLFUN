---
name: SkillFun Architecture Decisions
description: Core design decisions for SkillFun POC — chain, contracts, claim flow, backend, frontend
---

## Chain & Standard
- 0G Chain **mainnet**, chainId 16661 (NOT testnet — deploy directly to mainnet)
- ERC-7857 inspired iNFT (not standard ERC-721 only)
- NFT mints to `address(this)` — contract self-custody until claimed

## Claim Flow (Two-Step, Oracle-based)
1. User does GitHub OAuth on SkillFun
2. Backend verifies `authenticated_user == manifestOwner[tokenId]` (stored at mint)
3. Backend writes `pending_claims` to DB
4. Platform operator uses cold wallet to call `oracle.setVerifiedClaims([tokenId], [walletAddr])`
5. User calls `claim(tokenId)` — contract checks `msg.sender == oracle.verifiedOwner[tokenId]`
6. NFT transfers; Oracle entry cleared (one-time use)

**Why:** Eliminates hot signing key. Cold wallet is offline hardware wallet — much harder to compromise than a backend signer. Even if compromised, Oracle updates are on-chain and monitorable.

## manifestOwner
- Stored at mint: `manifestOwner[tokenId] = "alice/weather-skill"` (GitHub repo path)
- Used by backend to verify claim requests
- Public on-chain — anyone can see which GitHub repo each skill came from

## Two Mint Paths
1. **Community Mint**: Anyone submits public GitHub URL → platform backend mints → NFT held by contract → owner claims later
2. **Creator Self-Mint**: Creator does GitHub OAuth first → mints directly → NFT goes straight to Creator wallet (no claim needed)

## 0G Storage
- Skill payloads encrypted AES-256, stored on 0G Storage
- rootHash anchored in NFT metadata
- At Community Mint: encrypted with Platform pubkey
- At Claim: proxy re-encryption rotates to Creator pubkey
- At Self-Mint: Creator pubkey used directly

## Smart Contracts
- `SkillNFT.sol`: `registerSkill()`, `claim()`, `invokeSkill() payable`
- `SkillFunOracle.sol`: `setVerifiedClaims(tokenIds[], owners[])` — coldWallet only
- ABI centralized in `packages/abi/`
- Deploy target: 0G testnet (chainId 16601) — note chainId is 16601 not 16661
- Solidity 0.8.24 + `evmVersion: "cancun"` required for OpenZeppelin v5 (mcopy opcode)
- `setSkillNFT()` must be called on Oracle after SkillNFT is deployed (one-time, cold wallet only)
- 15 tests all pass in `packages/contracts/test/SkillContracts.test.ts`
- Deploy script auto-writes `packages/abi/src/addresses.json` keyed by chainId
- To deploy to 0G testnet: set `ZEROG_RPC_URL`, `DEPLOYER_PRIVATE_KEY`, optionally `COLD_WALLET_ADDRESS` + `OWNER_ADDRESS`

## Backend
- Go + PostgreSQL (BFF pattern, borrowing skillfun-apps schema)
- Key DB tables: skills (sk_xxx), bundles (bd_xxx), bundle_skills, pending_claims
- GitHub OAuth for verification
- All RPC calls go through BFF — frontend never calls RPC directly

## Frontend
- Vite + React + Tailwind + TanStack Query + wagmi + viem + RainbowKit
- Lives in `artifacts/skill-market/`
- Must use BFF for all chain reads

## MCP Architecture
- Global: `api.skillfun.ai/mcp` — bundles.discover, bundles.get
- Per-bundle: `api.skillfun.ai/:subdomain/mcp` — tools/list, tools/call (x402 gated)
- Bundle = server-side DB record, has subdomain + bd_xxx ID

## Tech Spec
- Authoritative doc: `attached_assets/AGENT_TECH_SELECTION_1785145338278.md`
- Cloudflare Workers for frontend deployment
- Docker/server for Go gateway
