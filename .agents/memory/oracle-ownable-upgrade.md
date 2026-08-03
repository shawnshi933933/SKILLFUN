---
name: Oracle Ownable Upgrade
description: SkillFunOracle V3 + new SkillNFT deployed 2026-08-03; owner is user's wallet; contracts are fully wired
---

# Oracle Ownable Upgrade

## Current live contracts (0G Mainnet, chainId 16661)

| Contract | Address |
|---|---|
| SkillFunOracle V3 | `0xD01885aE4E9d30B44C73E8f9B8ceA04869e70167` |
| SkillNFT | `0x390e723bAeE68503bB12DC7a8F1264F1A4A23535` |
| SkillFunVerifierStub | `0x3d1FCb4b625fe38C5fbF0b0186A3a319cc5F0b36` |

## Key design decisions

**Oracle owner**: `0xC56f7063FD6D199ccc443dbbF4283be602D46343` (user's MetaMask wallet). Signs `setVerifiedClaims` directly via MetaMask from the admin panel.

**Deployer** (`0xbb32…`): NOT an operator. If backend write-oracle is ever needed again, the Oracle owner must call `addOperator(0xbb32…)` via MetaMask.

**`setSkillNFT` is now updateable** (removed one-time restriction). Oracle owner can call it again if SkillNFT is redeployed.

**`setOracle` on SkillNFT**: SkillNFT owner (deployer `0xbb32…`) can call `setOracle(address)` to point SkillNFT at a new Oracle without full redeployment.

**Why:** Previous Oracle had immutable `coldWallet`; SkillNFT had immutable `oracle`. Required full redeploy to change either. Both are now mutable with owner-only access.

## Admin auth (backend)

`artifacts/api-server/src/routes/claims.ts` — `isAdminWallet()` accepts both `DEPLOYER_ADDRESS` and `ORACLE_OWNER_ADDRESS` env vars (no hardcoded fallback). Set `ORACLE_OWNER_ADDRESS=0xc56f70…` in env to allow the Oracle owner to manage claims.

## Abandoned contracts

- Oracle V1 (immutable coldWallet): `0x8071937558Ed2fD56AcE1d925B6f70BB40E09743`
- Oracle V2 (Ownable, but skillNFT locked): `0xbcf97897300c3cAF412142b973FF4a86Afd99CB8`
- Old SkillNFT (immutable oracle): `0xF119d7FB60f897D79b10b23C843ED706bFB59F79`
