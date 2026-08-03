---
name: Oracle Ownable Upgrade
description: New SkillFunOracle (Ownable + operators) deployed 2026-08-03; owner is user's wallet; deployer key is NOT authorized
---

# Oracle Ownable Upgrade

## The rule
The new SkillFunOracle at `0xbcf97897300c3cAF412142b973FF4a86Afd99CB8` uses OpenZeppelin Ownable + an operator whitelist. Only `owner()` or approved operators can call `setVerifiedClaims`.

**Owner**: `0xC56f7063FD6D199ccc443dbbF4283be602D46343` (user's MetaMask wallet)
**Deployer** (`0xbb32AD3470290635a852EDc5F2895B75497cA368`): was the initial owner, transferred ownership immediately during deploy. **Was NOT added as an operator** because the deploy script skips `addOperator` when operator == deployer address. The backend `writeOracleVerification` function in `chain.ts` still exists but its signer is no longer authorized.

**Why:** The deploy script `deploy-oracle.ts` has a guard `if (operatorAddr && operatorAddr !== deployer.address)` to avoid wasting gas adding the deployer when they're already the owner. After ownership transfer the deployer becomes an unauthorized address.

**How to apply:**
- If the backend write-oracle flow needs to be re-enabled, the owner (`0xc56f70…`) must call `addOperator(0xbb32…)` via MetaMask.
- The admin UI (`AdminClaims.tsx`) reads `owner()` from the Oracle contract to determine if the connected wallet can write claims; this is correct.
- The old `POST /api/claims/:id/write-oracle` backend route has been removed.

## ABI change summary
New functions vs old (immutable coldWallet) contract:
- Removed: `coldWallet()` (immutable)
- Added: `owner()`, `transferOwnership()`, `renounceOwnership()` (from Ownable)
- Added: `addOperator(address)`, `removeOperator(address)`, `operators(address)`

## Addresses
- Old Oracle (immutable coldWallet): `0x8071937558Ed2fD56AcE1d925B6f70BB40E09743` — still on-chain, abandoned
- New Oracle (Ownable + operators): `0xbcf97897300c3cAF412142b973FF4a86Afd99CB8` — active
- SkillNFT (unchanged): `0xF119d7FB60f897D79b10b23C843ED706bFB59F79` — wired to new Oracle
