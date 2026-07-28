// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IERC7857Types.sol";

/// @title IERC7857DataVerifier
/// @notice On-chain verifier for ERC-7857 data transfer proofs (TEE or ZKP).
///         SkillFun POC: a stub verifier is used; plug in 0G Compute TEE in Step 4.
interface IERC7857DataVerifier {
    /// @notice Verify that encrypted data was correctly re-keyed for the new owner.
    /// @param _proofs  One proof per IntelligentData item being transferred.
    /// @return         Structured outputs with the new data hashes and sealed keys.
    function verifyTransferValidity(
        TransferValidityProof[] calldata _proofs
    ) external returns (TransferValidityProofOutput[] memory);
}
