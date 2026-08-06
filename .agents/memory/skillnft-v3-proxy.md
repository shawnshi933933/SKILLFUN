---
name: SkillNFT V3 UUPS Proxy Deployment
description: UUPS proxy deployment details — new contract address, migration status, and Oracle wiring requirement
---

## Deployment (0G Mainnet, chainId 16661)

- **Proxy (new SkillNFT address)**: `0x4cEC76bF3ef70c81b064045D57454a20396A8587`
- **Implementation**: `0x277A0295B9a0dDbEb0bF72A677ea4836c4D44759`
- **Oracle** (unchanged): `0xD01885aE4E9d30B44C73E8f9B8ceA04869e70167`
- V2 legacy address (retired): `0x8d7473cE478FA46C16998d576879aD7c909344e0`

## What V3 adds vs V2

- `minter(tokenId)` mapping — records msg.sender on every `registerSkill()`
- `adminImportToken(tokenId, ...)` — owner-only, migrates tokens from V2 preserving IDs
- `setMinterBatch(tokenIds[], minters[])` — owner-only, back-fill minter for old tokens
- `w0g` changed from `immutable` → storage (required for proxy pattern)
- Inherits: `Initializable, ERC721Upgradeable, ERC721URIStorageUpgradeable, OwnableUpgradeable, UUPSUpgradeable`

## Migrated tokens

| Token | Owner on V3 | Minter |
|-------|-------------|--------|
| #1 Zf Coin | `0xc2C1B81A33...61718` | `0xc2C1B81A33...61718` |
| #2 mattpocock/code-review | `0xc2C1B81A33...61718` | `0xc2C1B81A33...61718` |
| #3 vercel-labs/web-design-guidelines | V3 proxy (contract custody) | 0x0 (unknown, community-minted) |

Token #3 minter is zero — can be set later with `setMinterBatch` if minter address is found.

## ⚠ Oracle wiring PENDING

Oracle owner: `0xC56f7063FD6D199ccc443dbbF4283be602D46343`
Oracle still points to old V2 address. `claim()` will fail until Oracle owner calls:
```
oracle.setSkillNFT("0x4cEC76bF3ef70c81b064045D57454a20396A8587")
```
Script ready: `packages/contracts/scripts/wire-oracle-v3.ts`
Run: `DEPLOYER_PRIVATE_KEY=<oracle-owner-pk> npx hardhat run scripts/wire-oracle-v3.ts --network zeroG`

## Future upgrades

To upgrade the implementation (add new features without changing address):
```typescript
// Deploy new implementation
const NewImpl = await ethers.getContractFactory("SkillNFTV4");
const newImpl = await NewImpl.deploy();
// Upgrade through proxy (owner-only)
const proxy = SkillNFTV3__factory.attach(PROXY_ADDR);
await proxy.upgradeToAndCall(newImpl.address, "0x");
```
**Why:** UUPS stores upgrade logic in implementation — `upgradeToAndCall` is callable from the proxy itself, guarded by `onlyOwner` in `_authorizeUpgrade`.
**How to apply:** Every new implementation contract must extend `UUPSUpgradeable` and preserve the exact storage slot order from V3 (only append new vars at the end).
