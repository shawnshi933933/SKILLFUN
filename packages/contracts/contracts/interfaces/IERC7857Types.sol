// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Oracle type for the verification system
enum OracleType { TEE, ZKP }

/// @notice Proof of data access — signed by the receiver (or their delegate)
struct AccessProof {
    bytes32 oldDataHash;     // Hash of the current (old) encrypted data
    bytes32 newDataHash;     // Hash of the new encrypted data (re-keyed for new owner)
    bytes   nonce;           // Replay-protection nonce
    bytes   encryptedPubKey; // New owner's public key, encrypted. Empty = use ETH pubkey.
    bytes   proof;           // TEE attestation or ZKP
}

/// @notice Proof of data ownership transfer
struct OwnershipProof {
    OracleType oracleType;   // TEE or ZKP
    bytes32 oldDataHash;
    bytes32 newDataHash;
    bytes   sealedKey;       // New data key, sealed for the new owner
    bytes   encryptedPubKey;
    bytes   nonce;
    bytes   proof;
}

/// @notice Combined proof required for iTransfer / iClone
struct TransferValidityProof {
    AccessProof   accessProof;
    OwnershipProof ownershipProof;
}

/// @notice Output returned by the on-chain verifier
struct TransferValidityProofOutput {
    bytes32 oldDataHash;
    bytes32 newDataHash;
    bytes   sealedKey;
    bytes   encryptedPubKey;
    bytes   wantedKey;
    address accessAssistant;
    bytes   accessProofNonce;
    bytes   ownershipProofNonce;
}

/// @notice Per-token intelligent data record (maps to 0G Storage root hash)
struct IntelligentData {
    string  dataDescription; // Human-readable label, e.g. "skill-payload"
    bytes32 dataHash;        // 0G Storage root hash of the encrypted payload
}
