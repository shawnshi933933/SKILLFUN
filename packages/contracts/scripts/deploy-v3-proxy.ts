/**
 * Deploy SkillNFT V3 as a UUPS proxy on 0G Chain (chainId 16661).
 *
 * Steps:
 *  1. Deploy SkillNFTV3 implementation contract
 *  2. Deploy ERC1967Proxy with encoded initialize() call
 *  3. Wire Oracle → new proxy address
 *  4. Import existing V2 tokens (preserving token IDs & metadata)
 *  5. Update packages/abi/src/addresses.json
 *
 * Usage:
 *   npx hardhat run scripts/deploy-v3-proxy.ts --network zeroG
 */

import { ethers } from "hardhat";
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";

// ── Config ────────────────────────────────────────────────────────────────────

const ORACLE_ADDR   = "0xD01885aE4E9d30B44C73E8f9B8ceA04869e70167";
const VERIFIER_ADDR = "0x3d1FCb4b625fe38C5fbF0b0186A3a319cc5F0b36";
const W0G_ADDR      = "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c";
const OLD_NFT_ADDR  = "0x8d7473cE478FA46C16998d576879aD7c909344e0"; // V2

// V2 tokens to migrate.
// minter: who called registerSkill() on V2 (not stored on-chain in V2).
// to: "" = was held by old contract (contract-custody) → replaced with proxyAddr.
const V2_TOKENS: Array<{ tokenId: number; minter: string; to: string }> = [
  { tokenId: 1, minter: "0xc2C1B81A335399F546E42498cC334424E4E61718", to: "0xc2C1B81A335399F546E42498cC334424E4E61718" },
  { tokenId: 2, minter: "0xc2C1B81A335399F546E42498cC334424E4E61718", to: "0xc2C1B81A335399F546E42498cC334424E4E61718" },
  { tokenId: 3, minter: "0x0000000000000000000000000000000000000000", to: "" }, // community-minted, contract custody
];

const OLD_ABI = [
  "function manifestOwner(uint256) view returns (string)",
  "function tokenURI(uint256) view returns (string)",
  "function basePrice(uint256) view returns (uint256)",
  "function ownerOf(uint256) view returns (address)",
  "function intelligentDataOf(uint256) view returns (tuple(string dataDescription, bytes32 dataHash)[])",
];

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer :", deployer.address);
  console.log("Balance  :", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // ── 1. Fetch live V2 token data ───────────────────────────────────────────
  console.log("── Fetching V2 token data ───────────────────────────────────────");
  const oldNFT = new ethers.Contract(OLD_NFT_ADDR, OLD_ABI, deployer);

  type TokenData = {
    tokenId: number; repoUrl: string; skillURI: string; rootHash: string;
    to: string; basePrice: bigint; minter: string;
  };
  const tokenData: TokenData[] = [];

  for (const t of V2_TOKENS) {
    try {
      const repoUrl  = await oldNFT.manifestOwner(t.tokenId);
      const skillURI = await oldNFT.tokenURI(t.tokenId);
      const bp: bigint = await oldNFT.basePrice(t.tokenId);
      const data     = await oldNFT.intelligentDataOf(t.tokenId);
      const rootHash: string = data.length > 0 ? data[0].dataHash : ethers.ZeroHash;
      const onChainOwner: string = await oldNFT.ownerOf(t.tokenId);
      console.log(`  #${t.tokenId}: repo="${repoUrl}"  onChainOwner=${onChainOwner}`);
      tokenData.push({ tokenId: t.tokenId, repoUrl, skillURI, rootHash,
        to: t.to || "PROXY", basePrice: bp, minter: t.minter });
    } catch (e: any) {
      console.warn(`  #${t.tokenId}: fetch failed — ${e.shortMessage ?? e.message}`);
    }
  }

  // ── 2. Deploy implementation ──────────────────────────────────────────────
  console.log("\n── Deploying SkillNFTV3 implementation ─────────────────────────");
  const ImplFactory = await ethers.getContractFactory("SkillNFTV3");
  const impl = await ImplFactory.deploy();
  await impl.waitForDeployment();
  const implAddr = await impl.getAddress();
  console.log("Implementation:", implAddr);

  // ── 3. Deploy ERC1967Proxy ────────────────────────────────────────────────
  console.log("\n── Deploying ERC1967Proxy ───────────────────────────────────────");
  const initData = ImplFactory.interface.encodeFunctionData("initialize", [
    ORACLE_ADDR, VERIFIER_ADDR, deployer.address, W0G_ADDR,
    4, // startTokenId — V2 had tokens 0..3, next new token = 4
  ]);

  const ProxyFactory = await ethers.getContractFactory("ERC1967Proxy");
  const proxy = await ProxyFactory.deploy(implAddr, initData);
  await proxy.waitForDeployment();
  const proxyAddr = await proxy.getAddress();
  console.log("Proxy (new SkillNFT):", proxyAddr);

  // Attach V3 ABI to proxy address
  const skillNFT = ImplFactory.attach(proxyAddr) as any;

  // Quick sanity check
  const nameOnChain = await skillNFT.name();
  console.log("Contract name via proxy:", nameOnChain, "✓");

  // ── 4. Wire Oracle → new proxy ────────────────────────────────────────────
  console.log("\n── Wiring Oracle ────────────────────────────────────────────────");
  const oracle = new ethers.Contract(
    ORACLE_ADDR,
    ["function setSkillNFT(address) external", "function owner() view returns (address)"],
    deployer
  );
  const oracleOwner: string = await oracle.owner();
  if (oracleOwner.toLowerCase() === deployer.address.toLowerCase()) {
    const tx = await oracle.setSkillNFT(proxyAddr);
    await tx.wait();
    console.log("Oracle.setSkillNFT →", proxyAddr, "✓");
  } else {
    console.warn("⚠  Oracle owner is", oracleOwner, "— call setSkillNFT manually.");
  }

  // ── 5. Import V2 tokens ───────────────────────────────────────────────────
  console.log("\n── Importing V2 tokens ──────────────────────────────────────────");
  for (const t of tokenData) {
    const recipient = t.to === "PROXY" ? proxyAddr : t.to;
    try {
      const tx = await skillNFT.adminImportToken(
        t.tokenId, t.repoUrl, t.skillURI, t.rootHash,
        recipient, t.basePrice, t.minter
      );
      await tx.wait();
      console.log(`  #${t.tokenId} → ${recipient} ✓`);
    } catch (e: any) {
      console.warn(`  #${t.tokenId} import failed: ${e.shortMessage ?? e.message}`);
    }
  }

  // ── 6. Post-deploy verification ───────────────────────────────────────────
  console.log("\n── Verification ─────────────────────────────────────────────────");
  for (const t of tokenData) {
    try {
      const owner  = await skillNFT.ownerOf(t.tokenId);
      const minter = await skillNFT.minter(t.tokenId);
      console.log(`  #${t.tokenId}  owner=${owner}  minter=${minter}`);
    } catch (e) {
      console.warn(`  #${t.tokenId}  ownerOf failed`);
    }
  }

  // ── 7. Update addresses.json ──────────────────────────────────────────────
  const addrPath = join(__dirname, "../../abi/src/addresses.json");
  const addrs    = JSON.parse(readFileSync(addrPath, "utf-8"));
  addrs["16661"]["SkillNFT_v3"] = proxyAddr;
  addrs["16661"]["SkillNFT"]    = proxyAddr; // main pointer → V3
  writeFileSync(addrPath, JSON.stringify(addrs, null, 2));
  console.log("\n── addresses.json updated ───────────────────────────────────────");
  console.log("  SkillNFT       =", proxyAddr);
  console.log("  Implementation =", implAddr);
  console.log("\n✅  V3 proxy deployment complete.");
  console.log("   Next: pnpm --filter @workspace/contracts export-abi");
  console.log("         then restart API server + frontend.\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
