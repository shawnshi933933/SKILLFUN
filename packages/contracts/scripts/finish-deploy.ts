import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const ORACLE_V3 = "0xD01885aE4E9d30B44C73E8f9B8ceA04869e70167";
  const NEW_OWNER = "0xc56f7063fd6d199ccc443dbbf4283be602d46343";

  const abi = [
    "function owner() view returns (address)",
    "function transferOwnership(address newOwner) external",
  ];
  const oracle = new ethers.Contract(ORACLE_V3, abi, deployer);

  const currentOwner = await oracle.owner();
  console.log("Current owner:", currentOwner);

  if (currentOwner.toLowerCase() === deployer.address.toLowerCase()) {
    const tx = await oracle.transferOwnership(NEW_OWNER);
    await tx.wait();
    console.log("✅ Ownership transferred to:", NEW_OWNER);
  } else {
    console.log("Already transferred or wrong signer");
  }
  console.log("Final owner:", await oracle.owner());
}
main().catch(e => { console.error(e); process.exitCode = 1; });
