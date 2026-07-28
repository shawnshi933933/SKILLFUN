import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("=".repeat(60));
  console.log("SkillFun Contract Deployment");
  console.log("=".repeat(60));
  console.log(`Network:   ${network.name} (chainId: ${network.config.chainId})`);
  console.log(`Deployer:  ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance:   ${ethers.formatEther(balance)} ETH`);
  console.log("-".repeat(60));

  // ------------------------------------------------------------------
  // 1. Deploy SkillFunOracle
  //    coldWallet = deployer for testnet; use a separate hardware wallet
  //    address in production.
  // ------------------------------------------------------------------
  const coldWallet = process.env.COLD_WALLET_ADDRESS || deployer.address;
  console.log(`Cold wallet: ${coldWallet}`);

  const OracleFactory = await ethers.getContractFactory("SkillFunOracle");
  const oracle = await OracleFactory.deploy(coldWallet);
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log(`\n✅ SkillFunOracle deployed: ${oracleAddress}`);

  // ------------------------------------------------------------------
  // 2. Deploy SkillNFT (passing Oracle address + deployer as owner)
  // ------------------------------------------------------------------
  const ownerAddress = process.env.OWNER_ADDRESS || deployer.address;
  const NFTFactory = await ethers.getContractFactory("SkillNFT");
  const skillNFT = await NFTFactory.deploy(oracleAddress, ownerAddress);
  await skillNFT.waitForDeployment();
  const skillNFTAddress = await skillNFT.getAddress();
  console.log(`✅ SkillNFT deployed:       ${skillNFTAddress}`);

  // ------------------------------------------------------------------
  // 3. Wire Oracle → SkillNFT (so Oracle can accept clearVerifiedClaim)
  //    This must be called from the cold wallet; on testnet deployer == cold wallet.
  // ------------------------------------------------------------------
  console.log("\nWiring Oracle → SkillNFT...");
  const tx = await oracle.setSkillNFT(skillNFTAddress);
  await tx.wait();
  console.log(`✅ Oracle.skillNFT set to ${skillNFTAddress}`);

  // ------------------------------------------------------------------
  // 4. Persist addresses to packages/abi/addresses.json
  // ------------------------------------------------------------------
  const chainId = network.config.chainId ?? 31337;
  const addressesPath = path.resolve(
    __dirname,
    "../../../packages/abi/src/addresses.json"
  );

  let addresses: Record<string, Record<string, string>> = {};
  if (fs.existsSync(addressesPath)) {
    addresses = JSON.parse(fs.readFileSync(addressesPath, "utf-8"));
  }

  addresses[String(chainId)] = {
    SkillFunOracle: oracleAddress,
    SkillNFT: skillNFTAddress,
  };

  fs.mkdirSync(path.dirname(addressesPath), { recursive: true });
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log(`\n✅ Addresses written to packages/abi/src/addresses.json`);

  // ------------------------------------------------------------------
  // 5. Summary
  // ------------------------------------------------------------------
  console.log("\n" + "=".repeat(60));
  console.log("Deployment complete");
  console.log("=".repeat(60));
  console.log(`SkillFunOracle : ${oracleAddress}`);
  console.log(`SkillNFT       : ${skillNFTAddress}`);
  console.log(`Chain ID       : ${chainId}`);
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
