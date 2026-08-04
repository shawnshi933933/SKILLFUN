---
name: SkillNFT V2 deployment
description: New SkillNFT with authorizedUpdateDataHash deployed but not yet wired into the Oracle. Describes what's needed to activate on-chain curator sync.
---

## What was deployed

SkillNFT V2 at `0x8d7473cE478FA46C16998d576879aD7c909344e0` (0G Mainnet, chainId 16661).
Adds `authorizedUpdateDataHash(tokenId, newHash, index)` — allows an authorized curator to update the on-chain data hash for an *unclaimed* skill without NFT ownership.

`addresses.json` still points to the OLD SkillNFT (`0x390e723bAeE68503bB12DC7a8F1264F1A4A23535`).
The `SkillNFT_v2` key holds the new address in addresses.json.

## What's needed to activate full on-chain curator sync

1. Oracle owner (`0xC56f7063FD6D199ccc443dbbF4283be602D46343`) calls:
   `oracle.setSkillNFT("0x8d7473cE478FA46C16998d576879aD7c909344e0")`
   Oracle: `0xD01885aE4E9d30B44C73E8f9B8ceA04869e70167`

2. Update `addresses.json` SkillNFT key to `0x8d7473cE478FA46C16998d576879aD7c909344e0`

3. Curators re-call `selfAuthorize(tokenId)` on the new contract (old authorizations are on old contract; the `_authorized` mapping is not migrated).

**Why:** `DEPLOYER_PRIVATE_KEY` is `0xbb32AD3470290635a852EDc5F2895B75497cA368` (the minter), not the Oracle owner. `onlyOwner` functions on Oracle require `0xC56f70...`.

## Current partial feature

`prepare-sync` endpoint: verifies `isAuthorized` on OLD contract, fetches GitHub, uploads to 0G, updates DB + contentVersion + invalidates curator auth epochs. No on-chain TX.

Frontend "Sync Content" button: calls prepare-sync, shows Syncing → Done. Content stays fresh for agents. On-chain dataHash updates on creator claim.
