/**
 * deploy-oracle.ts
 *
 * Deploys a fresh SkillFunOracle (Ownable + operators design) and:
 *   1. Sets the existing SkillNFT address on the new oracle.
 *   2. Optionally adds a backend operator address.
 *   3. Transfers ownership to the platform owner wallet.
 *   4. Updates packages/abi/src/addresses.json with the new oracle address.
 *
 * Usage:
 *   NEW_ORACLE_OWNER=0x... \
 *   ORACLE_OPERATOR=0x... \
 *   SKILL_NFT_ADDRESS=0x... \
 *   npx hardhat run scripts/deploy-oracle.ts --network zeroG
 */
import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();

  const newOwner       = process.env.NEW_ORACLE_OWNER   || deployer.address;
  const operatorAddr   = process.env.ORACLE_OPERATOR    || "";
  const skillNFTAddr   = process.env.SKILL_NFT_ADDRESS  || "0xF119d7FB60f897D79b10b23C843ED706bFB59F79";

  console.log("=".repeat(60));
  console.log("SkillFunOracle V2 Deployment (Ownable + operators)");
  console.log("=".repeat(60));
  console.log(`Network:       ${network.name} (chainId: ${network.config.chainId})`);
  console.log(`Deployer:      ${deployer.address}`);
  console.log(`New owner:     ${newOwner}`);
  console.log(`Operator:      ${operatorAddr || "(none)"}`);
  console.log(`SkillNFT:      ${skillNFTAddr}`);
  console.log("-".repeat(60));

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance:       ${ethers.formatEther(balance)} 0G`);

  // ------------------------------------------------------------------
  // 1. Deploy SkillFunOracle with deployer as initial owner
  //    (so we can call setSkillNFT / addOperator before transferring)
  // ------------------------------------------------------------------
  const OracleFactory = await ethers.getContractFactory("SkillFunOracle");
  const oracle = await OracleFactory.deploy(deployer.address);
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log(`\n✅ SkillFunOracle deployed: ${oracleAddress}`);

  // ------------------------------------------------------------------
  // 2. Wire SkillNFT
  // ------------------------------------------------------------------
  if (skillNFTAddr) {
    console.log(`\nSetting skillNFT → ${skillNFTAddr}...`);
    const tx = await oracle.setSkillNFT(skillNFTAddr);
    await tx.wait();
    console.log("✅ skillNFT set");
  }

  // ------------------------------------------------------------------
  // 3. Add backend operator (so server can still write Oracle if needed)
  // ------------------------------------------------------------------
  if (operatorAddr && operatorAddr !== deployer.address) {
    console.log(`\nAdding operator ${operatorAddr}...`);
    const tx = await oracle.addOperator(operatorAddr);
    await tx.wait();
    console.log("✅ Operator added");
  }

  // ------------------------------------------------------------------
  // 4. Transfer ownership to the platform owner wallet
  // ------------------------------------------------------------------
  if (newOwner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.log(`\nTransferring ownership to ${newOwner}...`);
    const tx = await oracle.transferOwnership(newOwner);
    await tx.wait();
    console.log(`✅ Ownership transferred`);
  }

  // Verify final owner
  const finalOwner = await oracle.owner();
  console.log(`\nFinal owner on-chain: ${finalOwner}`);

  // ------------------------------------------------------------------
  // 5. Update addresses.json
  // ------------------------------------------------------------------
  const chainId = network.config.chainId ?? 16661;
  const addressesPath = path.resolve(
    __dirname,
    "../../../packages/abi/src/addresses.json"
  );
  const addresses: Record<string, Record<string, string>> = JSON.parse(
    fs.readFileSync(addressesPath, "utf-8")
  );
  addresses[String(chainId)] = {
    ...addresses[String(chainId)],
    SkillFunOracle: oracleAddress,
  };
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log(`✅ addresses.json updated`);

  // ------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------
  console.log("\n" + "=".repeat(60));
  console.log("Deployment complete");
  console.log("=".repeat(60));
  console.log(`SkillFunOracle (new) : ${oracleAddress}`);
  console.log(`Owner               : ${finalOwner}`);
  console.log(`Chain ID            : ${chainId}`);
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
