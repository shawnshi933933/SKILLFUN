---
name: 0G Storage Mainnet Config
description: How to upload/download on 0G Storage mainnet — indexer DNS doesn't exist, use direct node IPs
---

## Problem
`indexer-storage-mainnet-standard.0g.ai` and `indexer-storage-mainnet-turbo.0g.ai` return DNS NXDOMAIN — these domains don't exist. Do NOT use them.

## Solution: Direct Node Connection
Use the 4 boot nodes from `config-mainnet-turbo.toml` directly. They run on port 5678, confirm `chainId: 16661`, and are reachable from Replit.

```
http://34.66.131.173:5678
http://34.60.163.4:5678
http://34.169.236.186:5678
http://34.71.110.60:5678
```

## SDK
Use `@0gfoundation/0g-storage-ts-sdk` (not `@0glabs/0g-ts-sdk`).
Import: `StorageNode`, `Uploader`, `Downloader`, `getFlowContract`, `ZgFile`

## Mainnet Contracts
- Flow contract: `0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526` (has code on-chain ✅)
- EVM RPC: `https://evmrpc.0g.ai`

## Upload Pattern (no indexer)
```ts
const nodeClients = MAINNET_NODES.map(url => new StorageNode(url));
const flow = getFlowContract(MAINNET_FLOW_CONTRACT, signer);
const uploader = new Uploader(nodeClients, EVM_RPC, flow);
const [tx, err] = await uploader.splitableUpload(zgFile, { expectedReplica: 1, skipTx: false, finalityRequired: true, taskSize: 1 });
```

## StorageScan — Does NOT work for direct-node uploads
`https://storagescan.0g.ai/?search=<rootHash>` only indexes files submitted via the public indexer service.
Since mainnet has no public indexer DNS and we upload directly to nodes, StorageScan will NEVER find our files.
**Do not link to StorageScan.** Use direct-node RPC instead (see below).

## Correct Verification
`zgs_getFileInfo(rootHash, false)` — takes TWO params: [rootHash, needAvailable(bool)]
`zgs_getFileInfoByTxSeq(txSeq)` — returns `{tx: {dataMerkleRoot, seq, size}, finalized, ...}`
Both work correctly on the 4 mainnet nodes.
`txSeq` comes from `splitableUpload` return value: `(tx as {txSeq?: number})?.txSeq`

## Storage Fee
~30,733,644,962 wei (~0.03 0G) per small file. Deployer wallet balance: ~1.95 0G (sufficient).

## Testnet (Galileo)
- Indexer: `https://indexer-storage-testnet-turbo.0g.ai` ✅ (DNS resolves, JSON-RPC works)
- EVM RPC: `https://evmrpc-testnet.0g.ai`
- Chain ID: 16602
- Flow contract: `0x22e03a6a89b950f1c82ec5e74f8eca321a105296`
- Testnet wallet had 0 balance — testnet upload untested

**Why:** 0G mainnet storage indexer has no public DNS. Must use direct node IPs.
**How to apply:** Any new or updated storage.ts must use the direct-node approach, not `new Indexer(url)`.
