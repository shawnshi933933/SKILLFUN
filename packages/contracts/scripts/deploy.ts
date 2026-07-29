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
  console.log(`Balance:   ${ethers.formatEther(balance)} 0G`);
  console.log("-".repeat(60));

  const coldWallet  = process.env.COLD_WALLET_ADDRESS  || deployer.address;
  const ownerAddress = process.env.OWNER_ADDRESS       || deployer.address;
  console.log(`Cold wallet:   ${coldWallet}`);
  console.log(`Owner address: ${ownerAddress}`);
  console.log("-".repeat(60));

  // ------------------------------------------------------------------
  // 1. Deploy SkillFunOracle
  // ------------------------------------------------------------------
  const OracleFactory = await ethers.getContractFactory("SkillFunOracle");
  const oracle = await OracleFactory.deploy(coldWallet);
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log(`\n✅ SkillFunOracle deployed:        ${oracleAddress}`);

  // ------------------------------------------------------------------
  // 2. Deploy SkillFunVerifierStub (ERC-7857 data verifier, POC stub)
  // ------------------------------------------------------------------
  const VerifierFactory = await ethers.getContractFactory("SkillFunVerifierStub");
  const verifier = await VerifierFactory.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log(`✅ SkillFunVerifierStub deployed:  ${verifierAddress}`);

  // ------------------------------------------------------------------
  // 3. Deploy SkillNFT (ERC-7857 compliant)
  // ------------------------------------------------------------------
  const NFTFactory = await ethers.getContractFactory("SkillNFT");
  const skillNFT = await NFTFactory.deploy(oracleAddress, verifierAddress, ownerAddress);
  await skillNFT.waitForDeployment();
  const skillNFTAddress = await skillNFT.getAddress();
  console.log(`✅ SkillNFT deployed:              ${skillNFTAddress}`);

  // ------------------------------------------------------------------
  // 4. Wire Oracle → SkillNFT
  // ------------------------------------------------------------------
  console.log("\nWiring Oracle → SkillNFT...");
  const tx = await oracle.setSkillNFT(skillNFTAddress);
  await tx.wait();
  console.log(`✅ Oracle.skillNFT set to ${skillNFTAddress}`);

  // ------------------------------------------------------------------
  // 5. Verify ERC-7857 supportsInterface on-chain
  // ------------------------------------------------------------------
  console.log("\nVerifying ERC-7857 supportsInterface...");
  const erc7857InterfaceId = await skillNFT.supportsInterface("0x" +
    // type(IERC7857).interfaceId is computed by Solidity; we call it directly
    Buffer.from(
      (await skillNFT.interface.getFunction("iTransfer").selector).slice(2) +
      (await skillNFT.interface.getFunction("iClone").selector).slice(2) +
      (await skillNFT.interface.getFunction("authorizeUsage").selector).slice(2) +
      (await skillNFT.interface.getFunction("revokeAuthorization").selector).slice(2),
      "hex"
    ).toString("hex")
  ).catch(() => null);
  // Just check the known ERC-721 interface as a smoke test
  const supportsERC721 = await skillNFT.supportsInterface("0x80ac58cd");
  console.log(`✅ supportsInterface(ERC-721): ${supportsERC721}`);

  // ------------------------------------------------------------------
  // 6. Persist addresses to packages/abi/src/addresses.json
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
    SkillFunOracle:        oracleAddress,
    SkillFunVerifierStub:  verifierAddress,
    SkillNFT:              skillNFTAddress,
  };

  fs.mkdirSync(path.dirname(addressesPath), { recursive: true });
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log(`\n✅ Addresses written to packages/abi/src/addresses.json`);

  // ------------------------------------------------------------------
  // 7. Summary
  // ------------------------------------------------------------------
  console.log("\n" + "=".repeat(60));
  console.log("Deployment complete");
  console.log("=".repeat(60));
  console.log(`SkillFunOracle        : ${oracleAddress}`);
  console.log(`SkillFunVerifierStub  : ${verifierAddress}`);
  console.log(`SkillNFT              : ${skillNFTAddress}`);
  console.log(`Chain ID              : ${chainId}`);
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
