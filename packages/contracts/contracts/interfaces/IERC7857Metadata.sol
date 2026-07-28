// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IERC7857Types.sol";

/// @title IERC7857Metadata
/// @notice Metadata extension for ERC-7857 intelligent NFTs.
interface IERC7857Metadata {
    /// @notice Collection name (ERC-721 compatible).
    function name() external view returns (string memory);

    /// @notice Collection symbol (ERC-721 compatible).
    function symbol() external view returns (string memory);

    /// @notice Returns all intelligent data records for a token.
    ///         Each record's `dataHash` is the 0G Storage root hash of the
    ///         encrypted payload currently accessible to the token owner.
    /// @param _tokenId  The token identifier.
    function intelligentDataOf(uint256 _tokenId)
        external
        view
        returns (IntelligentData[] memory);
}
