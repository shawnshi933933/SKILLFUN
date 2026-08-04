---
name: SkillNFT V2 deployment
description: SkillNFT V2 is now the active contract. Migration complete — Oracle must be wired by owner, curators must re-selfAuthorize on V2.
---

## Active addresses (0G Mainnet, chainId 16661)

- **SkillNFT (active)**: `0x8d7473cE478FA46C16998d576879aD7c909344e0` — V2, has `authorizedUpdateDataHash`
- **SkillNFT_v1 (archive)**: `0x390e723bAeE68503bB12DC7a8F1264F1A4A23535` — old contract, no longer used
- **Oracle**: `0xD01885aE4E9d30B44C73E8f9B8ceA04869e70167`

## Migration status

`addresses.json` SkillNFT key → V2. API server + frontend both use V2.

**Remaining user action**: Oracle owner (`0xC56f7063FD6D199ccc443dbbF4283be602D46343`) must call
`oracle.setSkillNFT("0x8d7473cE478FA46C16998d576879aD7c909344e0")` from the Admin panel
(`/app/admin/claims` → "Contract Migration" panel at the top).

Until that TX confirms, `intelligentDataOf(tokenId).dataHash` won't update from curator sync.

## Curator re-authorization

All `_authorized[tokenId][curator]` mappings are on the OLD contract — they do NOT migrate.
After Oracle wiring, curators must call `selfAuthorize(tokenId)` on V2 for each unclaimed skill.
The Curator Dashboard shows an amber banner prompting re-auth when V2 returns `isAuthorized == false`.

## Sync flow (complete)

1. Curator clicks "Sync Content" on an unclaimed skill
2. `prepare-sync` API: GitHub fetch → 0G upload → DB update → returns `rootHash`
3. Frontend: `writeContractAsync` → `authorizedUpdateDataHash(tokenId, rootHash, 0)` on V2
4. Phases shown: Syncing → Sign on-chain → Confirming TX → Done

**Why `index = 0`**: SkillNFT stores a single data entry per token; index 0 is the primary slot.
