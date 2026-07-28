import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { SkillFunOracle, SkillNFT } from "../typechain-types";

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

async function deployFixture() {
  const [deployer, coldWallet, alice, bob] = await ethers.getSigners();

  // 1. Deploy Oracle with coldWallet
  const OracleFactory = await ethers.getContractFactory("SkillFunOracle");
  const oracle: SkillFunOracle = await OracleFactory.connect(deployer).deploy(
    coldWallet.address
  );
  await oracle.waitForDeployment();

  // 2. Deploy SkillNFT
  const NFTFactory = await ethers.getContractFactory("SkillNFT");
  const skillNFT: SkillNFT = await NFTFactory.connect(deployer).deploy(
    await oracle.getAddress(),
    deployer.address
  );
  await skillNFT.waitForDeployment();

  // 3. Wire Oracle → SkillNFT (called by coldWallet)
  await oracle.connect(coldWallet).setSkillNFT(await skillNFT.getAddress());

  return { oracle, skillNFT, deployer, coldWallet, alice, bob };
}

// ---------------------------------------------------------------------------
// SkillFunOracle tests
// ---------------------------------------------------------------------------

describe("SkillFunOracle", () => {
  it("stores coldWallet correctly", async () => {
    const { oracle, coldWallet } = await loadFixture(deployFixture);
    expect(await oracle.coldWallet()).to.equal(coldWallet.address);
  });

  it("setSkillNFT can only be called once by coldWallet", async () => {
    const { oracle, coldWallet, alice } = await loadFixture(deployFixture);

    // Already set in fixture — second call must revert
    await expect(
      oracle.connect(coldWallet).setSkillNFT(alice.address)
    ).to.be.revertedWithCustomError(oracle, "SkillNFTAlreadySet");

    // Non-cold-wallet call must also revert
    await expect(
      oracle.connect(alice).setSkillNFT(alice.address)
    ).to.be.revertedWithCustomError(oracle, "OnlyColdWallet");
  });

  it("setVerifiedClaims stores mappings correctly", async () => {
    const { oracle, coldWallet, alice, bob } = await loadFixture(deployFixture);

    await oracle
      .connect(coldWallet)
      .setVerifiedClaims([0, 1], [alice.address, bob.address]);

    expect(await oracle.verifiedOwner(0)).to.equal(alice.address);
    expect(await oracle.verifiedOwner(1)).to.equal(bob.address);
  });

  it("setVerifiedClaims reverts if not called by coldWallet", async () => {
    const { oracle, alice } = await loadFixture(deployFixture);

    await expect(
      oracle.connect(alice).setVerifiedClaims([0], [alice.address])
    ).to.be.revertedWithCustomError(oracle, "OnlyColdWallet");
  });

  it("setVerifiedClaims reverts on array length mismatch", async () => {
    const { oracle, coldWallet, alice } = await loadFixture(deployFixture);

    await expect(
      oracle.connect(coldWallet).setVerifiedClaims([0, 1], [alice.address])
    ).to.be.revertedWithCustomError(oracle, "ArrayLengthMismatch");
  });

  it("clearVerifiedClaim reverts if not called by SkillNFT", async () => {
    const { oracle, coldWallet, alice } = await loadFixture(deployFixture);

    await oracle.connect(coldWallet).setVerifiedClaims([0], [alice.address]);

    await expect(
      oracle.connect(alice).clearVerifiedClaim(0)
    ).to.be.revertedWithCustomError(oracle, "OnlySkillNFT");
  });
});

// ---------------------------------------------------------------------------
// SkillNFT tests
// ---------------------------------------------------------------------------

describe("SkillNFT", () => {
  it("registerSkill mints to address(this) and stores manifestOwner", async () => {
    const { skillNFT, deployer } = await loadFixture(deployFixture);

    const repoUrl = "alice/weather-skill";
    const skillURI = "ipfs://Qm123";

    const tx = await skillNFT
      .connect(deployer)
      .registerSkill(repoUrl, skillURI);
    const receipt = await tx.wait();

    // Token 0 should be owned by the contract itself
    expect(await skillNFT.ownerOf(0)).to.equal(await skillNFT.getAddress());

    // manifestOwner should be set
    expect(await skillNFT.manifestOwner(0)).to.equal(repoUrl);

    // tokenURI should be set
    expect(await skillNFT.tokenURI(0)).to.equal(skillURI);

    // Event should have been emitted
    await expect(tx)
      .to.emit(skillNFT, "SkillRegistered")
      .withArgs(0, repoUrl, skillURI);
  });

  it("registerSkill only callable by owner", async () => {
    const { skillNFT, alice } = await loadFixture(deployFixture);

    await expect(
      skillNFT.connect(alice).registerSkill("alice/skill", "ipfs://x")
    ).to.be.revertedWithCustomError(skillNFT, "OwnableUnauthorizedAccount");
  });

  it("claim happy path: verified claimer receives NFT and Oracle entry is cleared", async () => {
    const { skillNFT, oracle, deployer, coldWallet, alice } =
      await loadFixture(deployFixture);

    // Mint skill
    await skillNFT.connect(deployer).registerSkill("alice/skill", "ipfs://a");

    // Cold wallet sets Oracle claim for alice
    await oracle.connect(coldWallet).setVerifiedClaims([0], [alice.address]);
    expect(await oracle.verifiedOwner(0)).to.equal(alice.address);

    // Alice claims
    const tx = await skillNFT.connect(alice).claim(0);
    await tx.wait();

    // NFT now owned by alice
    expect(await skillNFT.ownerOf(0)).to.equal(alice.address);

    // Oracle entry cleared (one-time use)
    expect(await oracle.verifiedOwner(0)).to.equal(ethers.ZeroAddress);

    // Event emitted
    await expect(tx).to.emit(skillNFT, "SkillClaimed").withArgs(0, alice.address);
  });

  it("claim fails if Oracle entry not set", async () => {
    const { skillNFT, deployer, alice } = await loadFixture(deployFixture);

    await skillNFT.connect(deployer).registerSkill("alice/skill", "ipfs://a");

    await expect(skillNFT.connect(alice).claim(0)).to.be.revertedWithCustomError(
      skillNFT,
      "NotVerifiedClaimer"
    );
  });

  it("claim fails if wrong wallet calls (Bob tries to claim Alice's slot)", async () => {
    const { skillNFT, oracle, deployer, coldWallet, alice, bob } =
      await loadFixture(deployFixture);

    await skillNFT.connect(deployer).registerSkill("alice/skill", "ipfs://a");
    await oracle.connect(coldWallet).setVerifiedClaims([0], [alice.address]);

    // Bob tries to claim
    await expect(skillNFT.connect(bob).claim(0)).to.be.revertedWithCustomError(
      skillNFT,
      "NotVerifiedClaimer"
    );
  });

  it("claim fails if token was already claimed (double-claim attempt)", async () => {
    const { skillNFT, oracle, deployer, coldWallet, alice } =
      await loadFixture(deployFixture);

    await skillNFT.connect(deployer).registerSkill("alice/skill", "ipfs://a");
    await oracle.connect(coldWallet).setVerifiedClaims([0], [alice.address]);
    await skillNFT.connect(alice).claim(0);

    // Alice tries to claim again — NFT is no longer held by contract
    await expect(skillNFT.connect(alice).claim(0)).to.be.revertedWithCustomError(
      skillNFT,
      "AlreadyClaimed"
    );
  });

  it("invokeSkill emits SkillInvoked with correct value", async () => {
    const { skillNFT, oracle, deployer, coldWallet, alice, bob } =
      await loadFixture(deployFixture);

    await skillNFT.connect(deployer).registerSkill("alice/skill", "ipfs://a");
    await oracle.connect(coldWallet).setVerifiedClaims([0], [alice.address]);
    await skillNFT.connect(alice).claim(0);

    const invokeValue = ethers.parseEther("0.01");
    const tx = await skillNFT
      .connect(bob)
      .invokeSkill(0, { value: invokeValue });

    await expect(tx)
      .to.emit(skillNFT, "SkillInvoked")
      .withArgs(0, bob.address, invokeValue);
  });

  it("invokeSkill reverts on non-existent token", async () => {
    const { skillNFT, bob } = await loadFixture(deployFixture);

    await expect(
      skillNFT.connect(bob).invokeSkill(999, { value: 0 })
    ).to.be.revertedWithCustomError(skillNFT, "ERC721NonexistentToken");
  });

  it("supports ERC-165 interface detection", async () => {
    const { skillNFT } = await loadFixture(deployFixture);
    // ERC-721 interface id
    expect(await skillNFT.supportsInterface("0x80ac58cd")).to.be.true;
  });
});
