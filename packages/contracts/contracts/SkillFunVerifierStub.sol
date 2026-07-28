// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IERC7857DataVerifier.sol";
import "./interfaces/IERC7857Types.sol";

/// @title SkillFunVerifierStub
/// @notice POC stub verifier — accepts any proof without validation.
///         Replace with a real 0G Compute TEE verifier in Step 4.
///         The stub returns empty outputs; SkillNFT treats empty outputs as
///         "no data hash update" (dataHash is updated explicitly via updateDataHash).
contract SkillFunVerifierStub is IERC7857DataVerifier {
    function verifyTransferValidity(
        TransferValidityProof[] calldata _proofs
    ) external pure override returns (TransferValidityProofOutput[] memory outputs) {
        // Stub: return one empty output per proof, accepting all transfers.
        outputs = new TransferValidityProofOutput[](_proofs.length);
    }
}
