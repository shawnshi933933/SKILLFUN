/**
 * Deploy a clean SkillNFT V3 UUPS proxy — no imported tokens, tokenId starts at 0.
 *
 * Usage:
 *   npx hardhat run scripts/deploy-v3-fresh.ts --network zeroG
 */

import { ethers } from "hardhat";
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";

const ORACLE_ADDR   = "0xD01885aE4E9d30B44C73E8f9B8ceA04869e70167";
const VERIFIER_ADDR = "0x3d1FCb4b625fe38C5fbF0b0186A3a319cc5F0b36";
const W0G_ADDR      = "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer :", deployer.address);
  console.log("Balance  :", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 1. Deploy implementation
  console.log("── Deploying SkillNFTV3 implementation ─────────────────────────");
  const ImplFactory = await ethers.getContractFactory("SkillNFTV3");
  const impl = await ImplFactory.deploy();
  await impl.waitForDeployment();
  const implAddr = await impl.getAddress();
  console.log("Implementation:", implAddr);

  // 2. Deploy ERC1967Proxy with initialize(startTokenId = 0)
  console.log("\n── Deploying ERC1967Proxy ───────────────────────────────────────");
  const initData = ImplFactory.interface.encodeFunctionData("initialize", [
    ORACLE_ADDR, VERIFIER_ADDR, deployer.address, W0G_ADDR,
    0, // startTokenId = 0 — completely fresh
  ]);
  const ProxyFactory = await ethers.getContractFactory("ERC1967Proxy");
  const proxy = await ProxyFactory.deploy(implAddr, initData);
  await proxy.waitForDeployment();
  const proxyAddr = await proxy.getAddress();
  console.log("Proxy (new SkillNFT):", proxyAddr);

  // Sanity check
  const skillNFT = ImplFactory.attach(proxyAddr) as any;
  console.log("Contract name via proxy:", await skillNFT.name(), "✓");

  // 3. Wire Oracle (if deployer is Oracle owner)
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
    console.warn("⚠  Oracle owner is", oracleOwner, "— run wire-oracle-v3.ts with Oracle owner key.");
  }

  // 4. Update addresses.json
  const addrPath = join(__dirname, "../../abi/src/addresses.json");
  const addrs    = JSON.parse(readFileSync(addrPath, "utf-8"));
  addrs["16661"]["SkillNFT_v3"] = proxyAddr;
  addrs["16661"]["SkillNFT"]    = proxyAddr;
  writeFileSync(addrPath, JSON.stringify(addrs, null, 2));

  console.log("\n── addresses.json updated ───────────────────────────────────────");
  console.log("  SkillNFT       =", proxyAddr);
  console.log("  Implementation =", implAddr);
  console.log("\n✅  Fresh V3 proxy ready — token IDs start at 0.");
  console.log("   Run: pnpm --filter @workspace/contracts export-abi");
  console.log("         then restart API server + frontend.\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
