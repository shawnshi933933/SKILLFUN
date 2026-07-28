// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./IERC7857Metadata.sol";
import "./IERC7857Types.sol";

/// @title IERC7857
/// @notice Main interface for ERC-7857: AI Agents NFT with Private Metadata.
///         Extends ERC-721 with verifiable encrypted-data transfer and
///         usage-authorization controls.
interface IERC7857 is IERC721, IERC7857Metadata {

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    /// @notice Emitted when `_from` grants usage rights to `_to` for `_tokenId`.
    event Authorization(
        address indexed _from,
        address indexed _to,
        uint256 indexed _tokenId
    );

    /// @notice Emitted when `_from` revokes usage rights from `_to` for `_tokenId`.
    event AuthorizationRevoked(
        address indexed _from,
        address indexed _to,
        uint256 indexed _tokenId
    );

    /// @notice Emitted when a token is transferred via `iTransfer` (with proof).
    event Transferred(
        uint256 indexed _tokenId,
        address indexed _from,
        address indexed _to
    );

    // -------------------------------------------------------------------------
    // Core functions
    // -------------------------------------------------------------------------

    /// @notice Transfer a token to `_to`, supplying proofs that the encrypted
    ///         payload was re-keyed for the new owner on the storage layer.
    /// @param _to       Recipient address.
    /// @param _tokenId  Token to transfer.
    /// @param _proofs   One TransferValidityProof per IntelligentData item.
    ///                  POC: pass an empty array until 0G Compute is wired in (Step 4).
    function iTransfer(
        address _to,
        uint256 _tokenId,
        TransferValidityProof[] calldata _proofs
    ) external;

    /// @notice Clone a token to `_to` — mint a new token with fresh encrypted
    ///         data derived from the source token.
    /// @param _to       Recipient of the cloned token.
    /// @param _tokenId  Source token to clone from.
    /// @param _proofs   Proofs that the cloned payload is valid.
    /// @return _newTokenId  The ID of the newly minted clone.
    function iClone(
        address _to,
        uint256 _tokenId,
        TransferValidityProof[] calldata _proofs
    ) external returns (uint256 _newTokenId);

    /// @notice Grant usage rights for `_tokenId` to `_user`.
    ///         The authorized user may invoke the skill but does not own the NFT.
    /// @param _tokenId  Token to authorize usage for.
    /// @param _user     Address to receive usage rights.
    function authorizeUsage(uint256 _tokenId, address _user) external;

    /// @notice Revoke usage rights for `_tokenId` from `_user`.
    /// @param _tokenId  Token to revoke usage from.
    /// @param _user     Address to lose usage rights.
    function revokeAuthorization(uint256 _tokenId, address _user) external;
}
