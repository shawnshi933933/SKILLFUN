/**
 * deploy-skillnft.ts
 *
 * Deploys a fresh SkillNFT contract pointing to the current SkillFunOracle V2,
 * then updates packages/abi/src/addresses.json with the new address.
 *
 * Usage:
 *   ORACLE_ADDRESS=0x... VERIFIER_ADDRESS=0x... OWNER_ADDRESS=0x... \
 *   npx hardhat run scripts/deploy-skillnft.ts --network zeroG
 *
 * Defaults (0G Mainnet):
 *   ORACLE_ADDRESS   = 0xbcf97897300c3cAF412142b973FF4a86Afd99CB8 (Oracle V2)
 *   VERIFIER_ADDRESS = 0x1839900b599F2ff7Ecb100F457f034D574eE9492 (SkillFunVerifierStub)
 *   W0G_ADDRESS      = 0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c
 *   OWNER_ADDRESS    = deployer (backend key that calls registerSkill)
 */
import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();

  const oracleAddress   = process.env.ORACLE_ADDRESS   || "0xbcf97897300c3cAF412142b973FF4a86Afd99CB8";
  const verifierAddress = process.env.VERIFIER_ADDRESS || "0x1839900b599F2ff7Ecb100F457f034D574eE9492";
  const w0gAddress      = process.env.W0G_ADDRESS      || "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c";
  const ownerAddress    = process.env.OWNER_ADDRESS    || deployer.address;

  console.log("=".repeat(60));
  console.log("SkillNFT Redeployment (mutable oracle pointer)");
  console.log("=".repeat(60));
  console.log(`Network:   ${network.name} (chainId: ${network.config.chainId})`);
  console.log(`Deployer:  ${deployer.address}`);
  console.log(`Oracle:    ${oracleAddress}`);
  console.log(`Verifier:  ${verifierAddress}`);
  console.log(`W0G:       ${w0gAddress}`);
  console.log(`Owner:     ${ownerAddress}`);
  console.log("-".repeat(60));

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance:   ${ethers.formatEther(balance)} 0G`);

  // ------------------------------------------------------------------
  // 1. Deploy SkillNFT
  // ------------------------------------------------------------------
  const NFTFactory = await ethers.getContractFactory("SkillNFT");
  const skillNFT = await NFTFactory.deploy(oracleAddress, verifierAddress, ownerAddress, w0gAddress);
  await skillNFT.waitForDeployment();
  const skillNFTAddress = await skillNFT.getAddress();
  console.log(`\n✅ SkillNFT deployed: ${skillNFTAddress}`);

  // ------------------------------------------------------------------
  // 2. Verify Oracle is correctly wired
  // ------------------------------------------------------------------
  const oracleOnChain = await skillNFT.oracle();
  console.log(`✅ oracle() on SkillNFT: ${oracleOnChain}`);
  if (oracleOnChain.toLowerCase() !== oracleAddress.toLowerCase()) {
    throw new Error("Oracle address mismatch after deploy!");
  }

  // ------------------------------------------------------------------
  // 3. Update addresses.json
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
    SkillNFT: skillNFTAddress,
  };
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log(`✅ addresses.json updated`);

  // ------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------
  console.log("\n" + "=".repeat(60));
  console.log("Deployment complete");
  console.log("=".repeat(60));
  console.log(`SkillNFT (new)      : ${skillNFTAddress}`);
  console.log(`Oracle V2           : ${oracleAddress}`);
  console.log(`Chain ID            : ${chainId}`);
  console.log("=".repeat(60));
  console.log("\n⚠️  Next: update SkillFunOracle.setSkillNFT → new SkillNFT address");
  console.log("   (Oracle owner must call setSkillNFT — but SkillNFTAlreadySet will revert)");
  console.log("   Use a fresh Oracle deploy or add a resetSkillNFT owner function if needed.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
