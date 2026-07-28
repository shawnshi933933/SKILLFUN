// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SkillFunOracle.sol";

/**
 * @title SkillNFT
 * @notice ERC-721 with ERC-7857-inspired iNFT pattern for SkillFun.
 *
 * Mint Flow:
 *  - `registerSkill(repoUrl, skillURI)` mints the NFT to `address(this)`
 *    (contract self-custody). The `manifestOwner[tokenId]` stores the GitHub
 *    repo path so the backend can verify claim eligibility off-chain.
 *
 * Claim Flow:
 *  1. Platform backend verifies GitHub ownership off-chain.
 *  2. Cold wallet calls `oracle.setVerifiedClaims([tokenId], [walletAddr])`.
 *  3. User calls `claim(tokenId)` — contract verifies
 *     `msg.sender == oracle.verifiedOwner[tokenId]`, transfers NFT,
 *     then clears the Oracle entry (one-time use).
 *
 * Invoke Flow:
 *  - `invokeSkill(tokenId)` is payable and emits `SkillInvoked`.
 *    Full x402 payment distribution is implemented in a later step.
 *
 * Security:
 *  - The contract never holds ETH beyond what `invokeSkill` receives; those
 *    funds should be distributed or withdrawn (future step).
 *  - Self-custodied tokens can only leave via `claim()` — not transferable
 *    while in contract custody.
 */
contract SkillNFT is ERC721, ERC721URIStorage, Ownable {
    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    SkillFunOracle public immutable oracle;

    uint256 private _nextTokenId;

    /// @notice tokenId → GitHub repo path (e.g. "alice/weather-skill")
    mapping(uint256 => string) public manifestOwner;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event SkillRegistered(
        uint256 indexed tokenId,
        string repoUrl,
        string skillURI
    );
    event SkillClaimed(
        uint256 indexed tokenId,
        address indexed claimer
    );
    event SkillInvoked(
        uint256 indexed tokenId,
        address indexed caller,
        uint256 value
    );

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    error NotVerifiedClaimer();
    error AlreadyClaimed();
    error TokenNotInCustody();

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    /**
     * @param _oracle  Address of the deployed SkillFunOracle contract.
     * @param _owner   Platform deployer address (receives Ownable ownership).
     */
    constructor(address _oracle, address _owner)
        ERC721("SkillFun Skill NFT", "SKILL")
        Ownable(_owner)
    {
        oracle = SkillFunOracle(_oracle);
    }

    // -------------------------------------------------------------------------
    // Core functions
    // -------------------------------------------------------------------------

    /**
     * @notice Register a skill: mint the NFT to this contract (self-custody).
     * @param repoUrl   GitHub repo path (e.g. "alice/weather-skill").
     * @param skillURI  Metadata URI pointing to the skill manifest on 0G Storage.
     * @return tokenId  The minted token ID.
     */
    function registerSkill(
        string calldata repoUrl,
        string calldata skillURI
    ) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        manifestOwner[tokenId] = repoUrl;

        _safeMint(address(this), tokenId);
        _setTokenURI(tokenId, skillURI);

        emit SkillRegistered(tokenId, repoUrl, skillURI);
    }

    /**
     * @notice Claim an NFT. Caller must be the verified owner in the Oracle.
     * @param tokenId  The token to claim.
     */
    function claim(uint256 tokenId) external {
        // Verify this token is still in contract custody
        if (ownerOf(tokenId) != address(this)) revert AlreadyClaimed();

        // Verify msg.sender matches Oracle's verified mapping
        address verified = oracle.verifiedOwner(tokenId);
        if (verified == address(0) || verified != msg.sender) {
            revert NotVerifiedClaimer();
        }

        // Transfer NFT to claimer
        _transfer(address(this), msg.sender, tokenId);

        // Clear the Oracle entry (one-time use)
        oracle.clearVerifiedClaim(tokenId);

        emit SkillClaimed(tokenId, msg.sender);
    }

    /**
     * @notice Invoke a skill. Payable — value is held for x402 distribution
     *         (stub: full distribution logic is implemented in Step 8).
     * @param tokenId  The skill NFT to invoke.
     */
    function invokeSkill(uint256 tokenId) external payable {
        // Token must exist
        ownerOf(tokenId); // reverts with ERC721NonexistentToken if not minted

        emit SkillInvoked(tokenId, msg.sender, msg.value);
    }

    /**
     * @notice Withdraw accumulated invokeSkill payments to the contract owner.
     *         Stub until full x402 payment logic is added.
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool ok, ) = owner().call{value: balance}("");
        require(ok, "Transfer failed");
    }

    // -------------------------------------------------------------------------
    // ERC-721 receiver — allows this contract to hold its own NFTs
    // -------------------------------------------------------------------------

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

    // -------------------------------------------------------------------------
    // ERC-721 overrides (required by Solidity for multiple inheritance)
    // -------------------------------------------------------------------------

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
