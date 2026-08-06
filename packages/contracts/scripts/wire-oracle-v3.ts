/**
 * Wire the Oracle to the new V3 proxy address.
 * Must be run from the Oracle owner's wallet (0xC56f7063FD6D199ccc443dbbF4283be602D46343).
 *
 * Usage:
 *   DEPLOYER_PRIVATE_KEY=<oracle-owner-pk> npx hardhat run scripts/wire-oracle-v3.ts --network zeroG
 */
import { ethers } from "hardhat";

const ORACLE_ADDR    = "0xD01885aE4E9d30B44C73E8f9B8ceA04869e70167";
const NEW_SKILLNFT   = "0x16221091Fe04BFEFe54Cd02234946c7eFDB37477"; // V3 proxy (fresh)

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Signer:", signer.address);

  const oracle = new ethers.Contract(
    ORACLE_ADDR,
    [
      "function setSkillNFT(address) external",
      "function skillNFT() view returns (address)",
      "function owner() view returns (address)",
    ],
    signer
  );

  const owner = await oracle.owner();
  const current = await oracle.skillNFT();
  console.log("Oracle owner  :", owner);
  console.log("Current skillNFT:", current);

  if (signer.address.toLowerCase() !== owner.toLowerCase()) {
    console.error("❌ Signer is not Oracle owner. Use the Oracle owner's private key.");
    process.exit(1);
  }

  const tx = await oracle.setSkillNFT(NEW_SKILLNFT);
  await tx.wait();
  console.log("✅ Oracle.setSkillNFT →", NEW_SKILLNFT);
  console.log("   Oracle.skillNFT now:", await oracle.skillNFT());
}

main().catch((e) => { console.error(e); process.exit(1); });
