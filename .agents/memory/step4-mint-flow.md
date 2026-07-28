---
name: Step 4 Mint Flow
description: How community skill submission → on-chain mint works; key decisions and gotchas.
---

## Flow

1. **Community submit** — `POST /api/skills` (no auth required; optional wallet sig to set ownerAddress)
2. **Admin reviews** — via `/api/admin/skills` list (requires EIP-712 admin sig)
3. **Admin mints** — `POST /api/admin/skills/:id/mint` (admin sig):
   a. Builds manifest JSON
   b. Uploads to 0G Storage via `@0glabs/0g-ts-sdk` (uses ethers + deployer privkey)
   c. Falls back to `keccak256(manifestJSON)` as rootHash if upload fails
   d. Calls `SkillNFT.registerSkill(repoUrl, skillUri, rootHash32)` via viem walletClient
   e. Parses `SkillRegistered` or `Transfer` event from receipt to get tokenId
   f. Updates DB: `mintStatus=minted, tokenId, skillUri, rootHash`

## registerSkill ABI signature

```
function registerSkill(string repoUrl, string skillURI, bytes32 rootHash) returns (uint256 tokenId)
```

First arg is `repoUrl` (acts as manifestOwner), NOT `address`. The on-chain `manifestOwner` mapping records this string for ERC-7857 compliance.

## 0G Storage SDK notes

- Package: `@0glabs/0g-ts-sdk` (ethers is a peer dep — must install separately)
- Node: `ZgFile.fromFilePath(tmpFilePath)` → `file.merkleTree()` → `tree.rootHash()`
- Upload: `new Indexer(rpc).upload(zgFile, evmRpc, ethersSigner)`
- Mainnet indexer: `https://indexer-storage-mainnet-standard.0g.ai`
- Download URL: `<indexer>/file?cid=<rootHash>`
- SDK is ESM-only; dynamically imported in the service to avoid ESM/CJS mismatch

**Why:** Dynamic import is required because the build target is ESM but some ethers/0g internals have CJS-only code paths that break with static imports at module load time.

## Auth relaxation: POST /skills

`POST /api/skills` was relaxed to unauthenticated for community mint intake.
Security boundary is at `POST /admin/skills/:id/mint` (admin EIP-712 required).
`verifyWalletSignature()` was added to auth.ts as a stateless helper (no session-nonce check).

**Why:** Community mint means anyone should be able to submit a skill; gating is at admin review + on-chain mint, not at form submission.

## wagmi version

RainbowKit 2.x requires `wagmi@2` (NOT wagmi@3). `wagmi@3.7.4` was originally installed and caused "Cannot read properties of null (reading 'useRef')" — multiple React instances from incompatible peer deps. Fixed by `pnpm add wagmi@2`.
