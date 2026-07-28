// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/IERC7857.sol";
import "./interfaces/IERC7857DataVerifier.sol";
import "./interfaces/IERC7857Types.sol";
import "./SkillFunOracle.sol";

/// @title SkillNFT
/// @notice Full ERC-7857 implementation for SkillFun — AI Skill NFTs with
///         private metadata anchored on 0G Storage.
///
/// ┌─────────────────────────────────────────────────────────────────┐
/// │  ERC-7857 compliance                                            │
/// │  • intelligentDataOf()  → 0G Storage rootHash per token        │
/// │  • iTransfer()          → proof-verified ownership transfer     │
/// │  • iClone()             → mint a new skill from an existing one │
/// │  • authorizeUsage()     → grant usage rights (not ownership)   │
/// │  • revokeAuthorization()→ revoke usage rights                  │
/// │                                                                 │
/// │  SkillFun extensions (on top of ERC-7857)                      │
/// │  • manifestOwner        → GitHub repo path, locked at mint      │
/// │  • claim()              → Oracle-verified GitHub→wallet claim   │
/// │  • invokeSkill()        → payable invocation (x402, Step 8)    │
/// └─────────────────────────────────────────────────────────────────┘
///
/// POC notes:
///  - TransferValidityProof verification is handled by a stub verifier.
///    Swap verifier address for a real 0G Compute TEE verifier in Step 4.
///  - invokeSkill() payment distribution is a stub; implemented in Step 8.
///  - iClone() mints a new token but does not duplicate 0G Storage data;
///    the caller must supply a fresh rootHash for the clone.
contract SkillNFT is ERC721, ERC721URIStorage, Ownable, IERC7857 {

    // ─────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────

    /// @notice The Oracle that maps tokenId → verified claimer wallet.
    SkillFunOracle public immutable oracle;

    /// @notice The ERC-7857 data verifier (stub in POC; real TEE in Step 4).
    IERC7857DataVerifier public verifier;

    uint256 private _nextTokenId;

    /// @notice tokenId → GitHub repo path (e.g. "alice/weather-skill").
    ///         Locked at mint. Used by backend to verify claim eligibility.
    mapping(uint256 => string) public manifestOwner;

    /// @notice ERC-7857: tokenId → array of intelligent data records.
    ///         Each record's dataHash is the current 0G Storage rootHash.
    mapping(uint256 => IntelligentData[]) private _intelligentData;

    /// @notice ERC-7857: tokenId → user → usage authorization.
    mapping(uint256 => mapping(address => bool)) private _authorized;

    // ─────────────────────────────────────────────────────────────────
    // Events (SkillFun extensions)
    // ─────────────────────────────────────────────────────────────────

    event SkillRegistered(
        uint256 indexed tokenId,
        string  repoUrl,
        string  skillURI,
        bytes32 rootHash
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
    /// @notice Emitted when the 0G Storage rootHash is updated (e.g. after
    ///         proxy re-encryption during a claim or iTransfer).
    event DataHashUpdated(
        uint256 indexed tokenId,
        bytes32 oldHash,
        bytes32 newHash
    );

    // ─────────────────────────────────────────────────────────────────
    // Errors
    // ─────────────────────────────────────────────────────────────────

    error NotVerifiedClaimer();
    error AlreadyClaimed();
    error NotTokenOwner();
    error NotOwnerOrAuthorized();
    error ProofLengthMismatch();

    // ─────────────────────────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────────────────────────

    /// @param _oracle    Address of the deployed SkillFunOracle.
    /// @param _verifier  Address of the ERC-7857 data verifier (stub for POC).
    /// @param _owner     Platform deployer — receives Ownable ownership.
    constructor(address _oracle, address _verifier, address _owner)
        ERC721("SkillFun Skill", "SKILL")
        Ownable(_owner)
    {
        oracle   = SkillFunOracle(_oracle);
        verifier = IERC7857DataVerifier(_verifier);
    }

    // ─────────────────────────────────────────────────────────────────
    // SkillFun: Mint
    // ─────────────────────────────────────────────────────────────────

    /// @notice Register a skill: mint to address(this) (self-custody until claimed).
    /// @param repoUrl   GitHub repo path — becomes manifestOwner, locked forever.
    /// @param skillURI  Metadata URI (points to manifest on 0G Storage).
    /// @param rootHash  0G Storage root hash of the encrypted skill payload.
    ///                  Stored as the first IntelligentData entry.
    /// @return tokenId  The minted token ID.
    function registerSkill(
        string  calldata repoUrl,
        string  calldata skillURI,
        bytes32          rootHash
    ) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        manifestOwner[tokenId] = repoUrl;

        _safeMint(address(this), tokenId);
        _setTokenURI(tokenId, skillURI);

        // Anchor the 0G Storage rootHash as ERC-7857 IntelligentData
        _intelligentData[tokenId].push(IntelligentData({
            dataDescription: "skill-payload",
            dataHash:        rootHash
        }));

        emit SkillRegistered(tokenId, repoUrl, skillURI, rootHash);
    }

    // ─────────────────────────────────────────────────────────────────
    // SkillFun: Oracle Claim
    // ─────────────────────────────────────────────────────────────────

    /// @notice Claim an NFT from contract custody.
    ///         Caller must be the address the cold wallet registered in the Oracle.
    ///         After a successful claim the caller should call updateDataHash()
    ///         once 0G Storage proxy re-encryption is complete (Step 4).
    /// @param tokenId  The token to claim.
    function claim(uint256 tokenId) external {
        if (ownerOf(tokenId) != address(this)) revert AlreadyClaimed();

        address verified = oracle.verifiedOwner(tokenId);
        if (verified == address(0) || verified != msg.sender) {
            revert NotVerifiedClaimer();
        }

        _transfer(address(this), msg.sender, tokenId);
        oracle.clearVerifiedClaim(tokenId);

        emit SkillClaimed(tokenId, msg.sender);
    }

    // ─────────────────────────────────────────────────────────────────
    // SkillFun: Invoke (x402 stub)
    // ─────────────────────────────────────────────────────────────────

    /// @notice Invoke a skill. Payable — value reserved for x402 distribution (Step 8).
    ///         Owner or any address authorized via authorizeUsage() may call this.
    /// @param tokenId  The skill NFT to invoke.
    function invokeSkill(uint256 tokenId) external payable {
        address owner_ = ownerOf(tokenId); // reverts if not minted
        if (owner_ != msg.sender && !_authorized[tokenId][msg.sender]) {
            revert NotOwnerOrAuthorized();
        }
        emit SkillInvoked(tokenId, msg.sender, msg.value);
    }

    /// @notice Withdraw accumulated invokeSkill payments. Stub until Step 8.
    function withdraw() external onlyOwner {
        (bool ok, ) = owner().call{value: address(this).balance}("");
        require(ok, "Transfer failed");
    }

    // ─────────────────────────────────────────────────────────────────
    // ERC-7857: iTransfer
    // ─────────────────────────────────────────────────────────────────

    /// @inheritdoc IERC7857
    /// @dev POC: stub verifier accepts any proof (including empty array).
    ///      Step 4 replaces verifier with 0G Compute TEE contract.
    ///      After iTransfer, call updateDataHash() with the new rootHash
    ///      once 0G Storage proxy re-encryption completes.
    function iTransfer(
        address _to,
        uint256 _tokenId,
        TransferValidityProof[] calldata _proofs
    ) external override {
        if (ownerOf(_tokenId) != msg.sender) revert NotTokenOwner();

        IntelligentData[] storage data = _intelligentData[_tokenId];
        if (_proofs.length != 0 && _proofs.length != data.length) {
            revert ProofLengthMismatch();
        }

        // Verify proofs (stub: no-op, returns empty outputs)
        if (_proofs.length > 0) {
            TransferValidityProofOutput[] memory outputs =
                verifier.verifyTransferValidity(_proofs);
            // Update data hashes from verifier output when provided
            for (uint256 i = 0; i < outputs.length; i++) {
                if (outputs[i].newDataHash != bytes32(0)) {
                    bytes32 old = data[i].dataHash;
                    data[i].dataHash = outputs[i].newDataHash;
                    emit DataHashUpdated(_tokenId, old, outputs[i].newDataHash);
                }
            }
        }

        _transfer(msg.sender, _to, _tokenId);
        emit Transferred(_tokenId, msg.sender, _to);
    }

    // ─────────────────────────────────────────────────────────────────
    // ERC-7857: iClone
    // ─────────────────────────────────────────────────────────────────

    /// @inheritdoc IERC7857
    /// @dev Mints a new token. The first proof's newDataHash (if non-zero)
    ///      is used as the clone's initial rootHash. Supply a fresh 0G
    ///      Storage rootHash via the proof or call updateDataHash() after.
    function iClone(
        address _to,
        uint256 _tokenId,
        TransferValidityProof[] calldata _proofs
    ) external override returns (uint256 _newTokenId) {
        if (ownerOf(_tokenId) != msg.sender) revert NotTokenOwner();

        _newTokenId = _nextTokenId++;

        // Derive initial rootHash from proof output (or inherit from source)
        bytes32 cloneHash = _intelligentData[_tokenId].length > 0
            ? _intelligentData[_tokenId][0].dataHash
            : bytes32(0);

        if (_proofs.length > 0) {
            TransferValidityProofOutput[] memory outputs =
                verifier.verifyTransferValidity(_proofs);
            if (outputs.length > 0 && outputs[0].newDataHash != bytes32(0)) {
                cloneHash = outputs[0].newDataHash;
            }
        }

        _safeMint(_to, _newTokenId);
        _setTokenURI(_newTokenId, tokenURI(_tokenId));

        _intelligentData[_newTokenId].push(IntelligentData({
            dataDescription: "skill-payload",
            dataHash:        cloneHash
        }));

        // Clone inherits the same manifestOwner (same GitHub source)
        manifestOwner[_newTokenId] = manifestOwner[_tokenId];
    }

    // ─────────────────────────────────────────────────────────────────
    // ERC-7857: Usage Authorization
    // ─────────────────────────────────────────────────────────────────

    /// @inheritdoc IERC7857
    function authorizeUsage(uint256 _tokenId, address _user) external override {
        if (ownerOf(_tokenId) != msg.sender) revert NotTokenOwner();
        _authorized[_tokenId][_user] = true;
        emit Authorization(msg.sender, _user, _tokenId);
    }

    /// @inheritdoc IERC7857
    function revokeAuthorization(uint256 _tokenId, address _user) external override {
        if (ownerOf(_tokenId) != msg.sender) revert NotTokenOwner();
        _authorized[_tokenId][_user] = false;
        emit AuthorizationRevoked(msg.sender, _user, _tokenId);
    }

    /// @notice Check whether `user` has usage authorization for `tokenId`.
    function isAuthorized(uint256 tokenId, address user) external view returns (bool) {
        return _authorized[tokenId][user];
    }

    // ─────────────────────────────────────────────────────────────────
    // ERC-7857 Metadata: intelligentDataOf
    // ─────────────────────────────────────────────────────────────────

    /// @inheritdoc IERC7857Metadata
    function intelligentDataOf(uint256 _tokenId)
        external
        view
        override
        returns (IntelligentData[] memory)
    {
        return _intelligentData[_tokenId];
    }

    // ─────────────────────────────────────────────────────────────────
    // Data hash management (called after 0G Storage events)
    // ─────────────────────────────────────────────────────────────────

    /// @notice Update the 0G Storage rootHash for a token.
    ///         Called by the token owner after proxy re-encryption completes
    ///         (e.g. after claim, or after a manual iTransfer).
    /// @param tokenId   Token to update.
    /// @param newHash   New 0G Storage root hash.
    /// @param index     Index in the IntelligentData array (0 for "skill-payload").
    function updateDataHash(
        uint256 tokenId,
        bytes32 newHash,
        uint256 index
    ) external {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        bytes32 old = _intelligentData[tokenId][index].dataHash;
        _intelligentData[tokenId][index].dataHash = newHash;
        emit DataHashUpdated(tokenId, old, newHash);
    }

    /// @notice Platform owner can update verifier address (e.g. upgrade to real TEE).
    function setVerifier(address _verifier) external onlyOwner {
        verifier = IERC7857DataVerifier(_verifier);
    }

    // ─────────────────────────────────────────────────────────────────
    // ERC-721 receiver — allows this contract to hold its own NFTs
    // ─────────────────────────────────────────────────────────────────

    function onERC721Received(
        address, address, uint256, bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

    // ─────────────────────────────────────────────────────────────────
    // supportsInterface — declares ERC-7857 compliance
    // ─────────────────────────────────────────────────────────────────

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC7857).interfaceId          ||
            interfaceId == type(IERC7857Metadata).interfaceId  ||
            super.supportsInterface(interfaceId);
    }

    // ─────────────────────────────────────────────────────────────────
    // Required overrides
    // ─────────────────────────────────────────────────────────────────

    function tokenURI(uint256 tokenId)
        public view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function name()
        public view
        override(ERC721, IERC7857Metadata)
        returns (string memory)
    {
        return super.name();
    }

    function symbol()
        public view
        override(ERC721, IERC7857Metadata)
        returns (string memory)
    {
        return super.symbol();
    }
}
