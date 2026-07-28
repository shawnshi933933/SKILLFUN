// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SkillFunOracle
 * @notice On-chain registry of verified GitHub → wallet mappings for SkillFun claim flow.
 *
 * Architecture:
 *  - Only the designated `coldWallet` can call `setVerifiedClaims`.
 *    The cold wallet is an offline hardware wallet operated by the platform.
 *  - The SkillNFT contract (set at deploy time) can call `clearVerifiedClaim`
 *    after a successful claim, making each Oracle entry one-time-use.
 *  - `verifiedOwner[tokenId]` is the wallet address that is allowed to claim
 *    the NFT with the given tokenId.
 *
 * Security properties:
 *  - No hot signing key in the backend — the Oracle is only writable by cold wallet.
 *  - Each entry is cleared on claim, preventing replay.
 *  - All writes are on-chain and publicly auditable.
 */
contract SkillFunOracle {
    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    /// @notice The cold wallet address that is the only entity allowed to
    ///         write verified claims.
    address public immutable coldWallet;

    /// @notice The SkillNFT contract address, the only entity allowed to clear
    ///         verified claims (called during `claim()`).
    address public skillNFT;

    /// @notice tokenId → verified wallet address allowed to claim.
    mapping(uint256 => address) public verifiedOwner;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event VerifiedClaimsSet(uint256[] tokenIds, address[] owners);
    event VerifiedClaimCleared(uint256 indexed tokenId);
    event SkillNFTSet(address indexed skillNFT);

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    error OnlyColdWallet();
    error OnlySkillNFT();
    error ArrayLengthMismatch();
    error SkillNFTAlreadySet();
    error ZeroAddress();

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(address _coldWallet) {
        if (_coldWallet == address(0)) revert ZeroAddress();
        coldWallet = _coldWallet;
    }

    // -------------------------------------------------------------------------
    // Admin: called once after SkillNFT is deployed
    // -------------------------------------------------------------------------

    /**
     * @notice Set the SkillNFT contract address. Can only be called once by
     *         the cold wallet.
     * @param _skillNFT Address of the deployed SkillNFT contract.
     */
    function setSkillNFT(address _skillNFT) external {
        if (msg.sender != coldWallet) revert OnlyColdWallet();
        if (skillNFT != address(0)) revert SkillNFTAlreadySet();
        if (_skillNFT == address(0)) revert ZeroAddress();
        skillNFT = _skillNFT;
        emit SkillNFTSet(_skillNFT);
    }

    // -------------------------------------------------------------------------
    // Cold wallet writes
    // -------------------------------------------------------------------------

    /**
     * @notice Batch-write verified claim mappings. Only callable by coldWallet.
     * @param tokenIds  Array of NFT token IDs.
     * @param owners    Array of wallet addresses authorised to claim each token.
     */
    function setVerifiedClaims(
        uint256[] calldata tokenIds,
        address[] calldata owners
    ) external {
        if (msg.sender != coldWallet) revert OnlyColdWallet();
        if (tokenIds.length != owners.length) revert ArrayLengthMismatch();

        for (uint256 i = 0; i < tokenIds.length; i++) {
            verifiedOwner[tokenIds[i]] = owners[i];
        }

        emit VerifiedClaimsSet(tokenIds, owners);
    }

    // -------------------------------------------------------------------------
    // SkillNFT writes
    // -------------------------------------------------------------------------

    /**
     * @notice Clear a verified claim entry after the NFT has been claimed.
     *         Only callable by the SkillNFT contract.
     * @param tokenId The token that was just claimed.
     */
    function clearVerifiedClaim(uint256 tokenId) external {
        if (msg.sender != skillNFT) revert OnlySkillNFT();
        delete verifiedOwner[tokenId];
        emit VerifiedClaimCleared(tokenId);
    }
}
