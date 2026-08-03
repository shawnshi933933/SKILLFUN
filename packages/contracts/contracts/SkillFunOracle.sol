// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SkillFunOracle
 * @notice On-chain registry of verified GitHub → wallet mappings for SkillFun claim flow.
 *
 * Architecture:
 *  - The contract `owner` (and any approved `operators`) can call `setVerifiedClaims`.
 *  - Ownership is transferable via `transferOwnership(newOwner)` — the owner may
 *    hand control to a cold wallet at any time without redeployment.
 *  - The owner may grant/revoke operator status to additional hot-wallet addresses.
 *  - The SkillNFT contract (set once by the owner) can call `clearVerifiedClaim`
 *    after a successful claim, making each Oracle entry one-time-use.
 *  - `verifiedOwner[tokenId]` is the wallet address that is allowed to claim
 *    the NFT with the given tokenId.
 *
 * Security properties:
 *  - Only owner or operators can write verified claims.
 *  - Ownership is fully transferable to a cold wallet.
 *  - Each entry is cleared on claim, preventing replay.
 *  - All writes are on-chain and publicly auditable.
 */
contract SkillFunOracle is Ownable {
    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    /// @notice The SkillNFT contract address, the only entity allowed to clear
    ///         verified claims (called during `claim()`).
    address public skillNFT;

    /// @notice tokenId → verified wallet address allowed to claim.
    mapping(uint256 => address) public verifiedOwner;

    /// @notice Approved operator addresses that can call setVerifiedClaims.
    mapping(address => bool) public operators;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event VerifiedClaimsSet(uint256[] tokenIds, address[] owners);
    event VerifiedClaimCleared(uint256 indexed tokenId);
    event SkillNFTSet(address indexed skillNFT);
    event OperatorAdded(address indexed operator);
    event OperatorRemoved(address indexed operator);

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    error OnlyAuthorized();
    error OnlySkillNFT();
    error ArrayLengthMismatch();
    error SkillNFTAlreadySet();
    error ZeroAddress();

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------

    modifier onlyAuthorized() {
        if (msg.sender != owner() && !operators[msg.sender]) revert OnlyAuthorized();
        _;
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    /// @param initialOwner The address that will own the contract on deployment.
    constructor(address initialOwner) Ownable(initialOwner) {
        if (initialOwner == address(0)) revert ZeroAddress();
    }

    // -------------------------------------------------------------------------
    // Owner: operator management
    // -------------------------------------------------------------------------

    /// @notice Approve an operator address to call setVerifiedClaims.
    function addOperator(address operator) external onlyOwner {
        if (operator == address(0)) revert ZeroAddress();
        operators[operator] = true;
        emit OperatorAdded(operator);
    }

    /// @notice Revoke an operator's access.
    function removeOperator(address operator) external onlyOwner {
        operators[operator] = false;
        emit OperatorRemoved(operator);
    }

    // -------------------------------------------------------------------------
    // Owner: one-time SkillNFT wiring
    // -------------------------------------------------------------------------

    /**
     * @notice Set the SkillNFT contract address. Can only be called once by the owner.
     * @param _skillNFT Address of the deployed SkillNFT contract.
     */
    function setSkillNFT(address _skillNFT) external onlyOwner {
        if (skillNFT != address(0)) revert SkillNFTAlreadySet();
        if (_skillNFT == address(0)) revert ZeroAddress();
        skillNFT = _skillNFT;
        emit SkillNFTSet(_skillNFT);
    }

    // -------------------------------------------------------------------------
    // Oracle writes (owner or operator)
    // -------------------------------------------------------------------------

    /**
     * @notice Batch-write verified claim mappings. Callable by owner or operators.
     * @param tokenIds  Array of NFT token IDs.
     * @param owners    Array of wallet addresses authorised to claim each token.
     */
    function setVerifiedClaims(
        uint256[] calldata tokenIds,
        address[] calldata owners
    ) external onlyAuthorized {
        if (tokenIds.length != owners.length) revert ArrayLengthMismatch();

        for (uint256 i = 0; i < tokenIds.length; i++) {
            verifiedOwner[tokenIds[i]] = owners[i];
        }

        emit VerifiedClaimsSet(tokenIds, owners);
    }

    // -------------------------------------------------------------------------
    // SkillNFT writes (clearVerifiedClaim — one-time-use enforcement)
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
