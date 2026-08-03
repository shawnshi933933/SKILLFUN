/**
 * deploy-oracle-and-skillnft.ts
 *
 * Deploys a fresh SkillFunOracle (Ownable + operators) and a fresh SkillNFT
 * together, wires them, transfers Oracle ownership to the platform owner wallet,
 * then updates packages/abi/src/addresses.json.
 *
 * Usage (0G Mainnet):
 *   NEW_ORACLE_OWNER=0xc56f7063fd6d199ccc443dbbf4283be602d46343 \
 *   ORACLE_OPERATOR=0xbb32AD3470290635a852EDc5F2895B75497cA368 \
 *   npx hardhat run scripts/deploy-oracle-and-skillnft.ts --network zeroG
 */
import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();

  const newOracleOwner = process.env.NEW_ORACLE_OWNER || deployer.address;
  const operatorAddr   = process.env.ORACLE_OPERATOR  || "";
  const w0gAddress     = process.env.W0G_ADDRESS      || "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c";

  console.log("=".repeat(60));
  console.log("SkillFunOracle V3 + SkillNFT Deployment");
  console.log("=".repeat(60));
  console.log(`Network:        ${network.name} (chainId: ${network.config.chainId})`);
  console.log(`Deployer:       ${deployer.address}`);
  console.log(`Oracle owner:   ${newOracleOwner}`);
  console.log(`Operator:       ${operatorAddr || "(none)"}`);
  console.log(`W0G:            ${w0gAddress}`);
  console.log("-".repeat(60));

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance:        ${ethers.formatEther(balance)} 0G`);

  // ------------------------------------------------------------------
  // 1. Deploy Oracle (deployer = initial owner for wiring steps)
  // ------------------------------------------------------------------
  const OracleFactory = await ethers.getContractFactory("SkillFunOracle");
  const oracle = await OracleFactory.deploy(deployer.address);
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log(`\n✅ SkillFunOracle deployed: ${oracleAddress}`);

  // ------------------------------------------------------------------
  // 2. Deploy SkillFunVerifierStub
  // ------------------------------------------------------------------
  const VerifierFactory = await ethers.getContractFactory("SkillFunVerifierStub");
  const verifier = await VerifierFactory.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log(`✅ SkillFunVerifierStub deployed: ${verifierAddress}`);

  // ------------------------------------------------------------------
  // 3. Deploy SkillNFT pointing to new Oracle
  //    Owner = deployer (backend key — needed to call registerSkill)
  // ------------------------------------------------------------------
  const NFTFactory = await ethers.getContractFactory("SkillNFT");
  const skillNFT = await NFTFactory.deploy(oracleAddress, verifierAddress, deployer.address, w0gAddress);
  await skillNFT.waitForDeployment();
  const skillNFTAddress = await skillNFT.getAddress();
  console.log(`✅ SkillNFT deployed:            ${skillNFTAddress}`);

  // ------------------------------------------------------------------
  // 4. Wire Oracle → SkillNFT
  // ------------------------------------------------------------------
  {
    const tx = await oracle.setSkillNFT(skillNFTAddress);
    await tx.wait();
    console.log(`✅ Oracle.skillNFT set to ${skillNFTAddress}`);
  }

  // ------------------------------------------------------------------
  // 5. Add operator (deployer key as backend operator)
  // ------------------------------------------------------------------
  if (operatorAddr && operatorAddr.toLowerCase() !== deployer.address.toLowerCase()) {
    const tx = await oracle.addOperator(operatorAddr);
    await tx.wait();
    console.log(`✅ Operator added: ${operatorAddr}`);
  }

  // ------------------------------------------------------------------
  // 6. Transfer Oracle ownership to platform owner wallet
  // ------------------------------------------------------------------
  if (newOracleOwner.toLowerCase() !== deployer.address.toLowerCase()) {
    const tx = await oracle.transferOwnership(newOracleOwner);
    await tx.wait();
    console.log(`✅ Oracle ownership transferred to ${newOracleOwner}`);
  }

  const finalOwner = await oracle.owner();
  console.log(`Final Oracle owner: ${finalOwner}`);

  // ------------------------------------------------------------------
  // 7. Update addresses.json
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
    SkillFunOracle:       oracleAddress,
    SkillFunVerifierStub: verifierAddress,
    SkillNFT:             skillNFTAddress,
  };
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log(`✅ addresses.json updated`);

  // ------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------
  console.log("\n" + "=".repeat(60));
  console.log("Deployment complete");
  console.log("=".repeat(60));
  console.log(`SkillFunOracle  : ${oracleAddress}`);
  console.log(`SkillNFT        : ${skillNFTAddress}`);
  console.log(`Oracle owner    : ${finalOwner}`);
  console.log(`Chain ID        : ${chainId}`);
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
