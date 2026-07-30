---
name: SkillFun Architecture
description: Core design decisions for SkillFun — ERC-7857 on 0G Chain, x402 payment model, contract versions
---

# SkillFun Architecture

## Contract versions
- v4 (old): `0xfd5d67840915fa25af61b68bdb30bc6bb61fe4f8` — no setBasePrice
- v5 (current): `0x36cc7DBE8d2d3C0B44223e60CE94912ED8e11D72` — added setBasePrice(tokenId, newPriceWei)

## Revenue model
- Curator authorization: pays `basePrice` W0G to Skill NFT Owner (100% to Owner)
  - unclaimed skill → `selfAuthorize(tokenId)` — free (gas only)
  - claimed skill → `purchaseAuthorization(tokenId)` — pays basePrice to NFT owner
- Per-invocation: Agent sends W0G ERC-20 directly to `bundle.ownerAddress` (Curator) — 100% to Curator

**Why:** No platform cut on-chain. Creator/Owner split concept is dead in the new x402 model.

## x402 agent payment flow (v5)
1. Agent calls tools/call → HTTP 402
2. 402 response: `{ method: "erc20-transfer", payTo: curatorWallet, amount: servicePrice }`
3. Agent sends `w0g.transfer(payTo, amount)` — no approve, no invokeSkill
4. Agent POSTs `{ txHash, tokenId, bundleId, agentWallet, signature }` to `/api/mcp/payment/prove`
5. Server verifies ERC-20 Transfer log on-chain, issues proof scoped to (skillId, bundleId, contentVersion)

**Why:** bundleId scopes the proof — same skill in different bundles gets separate proofs.

## Community vs Mine mint
- community: `basePriceWei = "0"`, NFT goes to SkillNFT contract, selfAuthorize is free
- mine: `basePriceWei = user-set value`, NFT goes to user wallet, purchaseAuthorization costs basePrice
- **Fix applied (2026-07-30):** CreateSkill.tsx zeroes out basePrice when ownerMode === "community"

## setBasePrice
- Added in v5. Only NFT owner can call. Emits BasePriceUpdated event.
- Frontend: no UI yet — planned for Curator skills page
- Stats endpoint reads on-chain basePrice via `getOnChainBasePrice(tokenId)` in chain.ts, returns as `basePriceWei` in `/api/skills/:id/stats`
