// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./interfaces/IERC7857.sol";
import "./interfaces/IERC7857DataVerifier.sol";
import "./interfaces/IERC7857Types.sol";
import "./SkillFunOracle.sol";

/// @title SkillNFT V3
/// @notice UUPS-upgradeable ERC-7857 implementation for SkillFun.
///
/// Upgrade notes vs V2:
///  - UUPS proxy pattern: contract address never changes on upgrade.
///  - `w0g` changed from immutable → storage (required for proxy pattern).
///  - `minter` mapping added: records msg.sender on every registerSkill().
///  - `adminImportToken()` added: owner-only, migrates legacy token IDs
///    from the V2 contract while preserving original token IDs and metadata.
///  - `setMinterBatch()` added: back-fill minter for pre-V3 tokens.
///
/// Storage layout (append-only — never reorder existing slots):
///   [inherited: ERC721Upgradeable __gap, ERC721URIStorageUpgradeable __gap,
///               OwnableUpgradeable __gap, UUPSUpgradeable __gap]
///   slot 0+: oracle, verifier, w0g, _nextTokenId, manifestOwner,
///            basePrice, _intelligentData, _authorized
///   NEW V3 → minter (always appended at end)
///
/// @custom:oz-upgrades-unsafe-allow constructor
contract SkillNFTV3 is
    Initializable,
    ERC721Upgradeable,
    ERC721URIStorageUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    IERC7857
{
    // ─────────────────────────────────────────────────────────────────
    // State  (DO NOT reorder — proxy storage layout must stay stable)
    // ─────────────────────────────────────────────────────────────────

    SkillFunOracle       public oracle;
    IERC7857DataVerifier public verifier;
    IERC20               public w0g;          // was immutable in V2; now storage
    uint256              private _nextTokenId;

    mapping(uint256 => string)                        public  manifestOwner;
    mapping(uint256 => uint256)                       public  basePrice;
    mapping(uint256 => IntelligentData[])             private _intelligentData;
    mapping(uint256 => mapping(address => bool))      private _authorized;

    // ── V3 additions (always append below previous slots) ─────────────
    /// @notice tokenId → address that called registerSkill() (or adminImportToken).
    mapping(uint256 => address) public minter;

    // ─────────────────────────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────────────────────────

    event SkillRegistered(uint256 indexed tokenId, string repoUrl, string skillURI, bytes32 rootHash);
    event SkillClaimed(uint256 indexed tokenId, address indexed claimer);
    event SkillInvoked(uint256 indexed tokenId, address indexed caller, uint256 value);
    event DataHashUpdated(uint256 indexed tokenId, bytes32 oldHash, bytes32 newHash);
    event BasePriceUpdated(uint256 indexed tokenId, uint256 oldPrice, uint256 newPrice);

    // ─────────────────────────────────────────────────────────────────
    // Errors
    // ─────────────────────────────────────────────────────────────────

    error NotVerifiedClaimer();
    error AlreadyClaimed();
    error NotTokenOwner();
    error NotOwnerOrAuthorized();
    error ProofLengthMismatch();

    // ─────────────────────────────────────────────────────────────────
    // Constructor — disables initializers on the implementation contract
    // ─────────────────────────────────────────────────────────────────

    constructor() {
        _disableInitializers();
    }

    // ─────────────────────────────────────────────────────────────────
    // Initializer (replaces constructor for proxy deployments)
    // ─────────────────────────────────────────────────────────────────

    /// @param _oracle       Deployed SkillFunOracle address.
    /// @param _verifier     ERC-7857 data verifier address.
    /// @param _owner        Platform owner (receives Ownable ownership).
    /// @param _w0g          W0G ERC-20 token address.
    /// @param startTokenId  Initial value for _nextTokenId (set to V2's
    ///                      next ID so new tokens never collide with migrated ones).
    function initialize(
        address _oracle,
        address _verifier,
        address _owner,
        address _w0g,
        uint256 startTokenId
    ) public initializer {
        __ERC721_init("SkillFun Skill", "SKILL");
        __ERC721URIStorage_init();
        __Ownable_init(_owner);

        oracle        = SkillFunOracle(_oracle);
        verifier      = IERC7857DataVerifier(_verifier);
        w0g           = IERC20(_w0g);
        _nextTokenId  = startTokenId;
    }

    // ─────────────────────────────────────────────────────────────────
    // UUPS: upgrade authorization
    // ─────────────────────────────────────────────────────────────────

    /// @dev Only the owner may authorize an implementation upgrade.
    function _authorizeUpgrade(address /*newImplementation*/) internal override onlyOwner {}

    // ─────────────────────────────────────────────────────────────────
    // SkillFun: Mint
    // ─────────────────────────────────────────────────────────────────

    /// @notice Register a skill — open to anyone.
    /// @param repoUrl    GitHub repo path locked as manifestOwner.
    /// @param skillURI   Metadata URI on 0G Storage.
    /// @param rootHash   0G Storage root hash of the encrypted skill payload.
    /// @param to         Recipient. Pass address(this) for contract-custody mint.
    /// @param _basePrice W0G wei per invokeSkill() call (0 = free).
    function registerSkill(
        string  calldata repoUrl,
        string  calldata skillURI,
        bytes32          rootHash,
        address          to,
        uint256          _basePrice
    ) external returns (uint256 tokenId) {
        require(to != address(0), "SkillNFT: to is zero address");
        tokenId = _nextTokenId++;

        manifestOwner[tokenId] = repoUrl;
        basePrice[tokenId]     = _basePrice;
        minter[tokenId]        = msg.sender;   // ← V3: record original minter

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, skillURI);

        _intelligentData[tokenId].push(IntelligentData({
            dataDescription: "skill-payload",
            dataHash:        rootHash
        }));

        emit SkillRegistered(tokenId, repoUrl, skillURI, rootHash);
    }

    // ─────────────────────────────────────────────────────────────────
    // Admin: migrate V2 tokens with original token IDs
    // ─────────────────────────────────────────────────────────────────

    /// @notice Owner-only. Recreates a legacy V2 token on this proxy, preserving
    ///         the original tokenId. Reverts if the token ID is already minted.
    ///         Call this once per V2 token during migration.
    /// @param tokenId    Original token ID from V2 contract.
    /// @param repoUrl    manifestOwner value from V2.
    /// @param skillURI   tokenURI from V2.
    /// @param rootHash   Most recent rootHash from V2 IntelligentData[0].
    /// @param to         NFT recipient (owner of the V2 token, or address(this)
    ///                   for unclaimed community-minted tokens).
    /// @param _basePrice basePrice from V2.
    /// @param _minter    Address that called registerSkill() on V2.
    function adminImportToken(
        uint256          tokenId,
        string  calldata repoUrl,
        string  calldata skillURI,
        bytes32          rootHash,
        address          to,
        uint256          _basePrice,
        address          _minter
    ) external onlyOwner {
        require(_ownerOf(tokenId) == address(0), "SkillNFT: token already exists");
        require(to != address(0), "SkillNFT: to is zero address");

        manifestOwner[tokenId] = repoUrl;
        basePrice[tokenId]     = _basePrice;
        minter[tokenId]        = _minter;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, skillURI);

        _intelligentData[tokenId].push(IntelligentData({
            dataDescription: "skill-payload",
            dataHash:        rootHash
        }));

        // Advance _nextTokenId past this imported ID so regular mints don't collide
        if (tokenId >= _nextTokenId) {
            _nextTokenId = tokenId + 1;
        }

        emit SkillRegistered(tokenId, repoUrl, skillURI, rootHash);
    }

    /// @notice Owner-only. Back-fill minter for tokens that predate V3
    ///         (can only set once — won't overwrite an existing non-zero minter).
    function setMinterBatch(
        uint256[] calldata tokenIds,
        address[] calldata minters
    ) external onlyOwner {
        require(tokenIds.length == minters.length, "SkillNFT: length mismatch");
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (minter[tokenIds[i]] == address(0)) {
                minter[tokenIds[i]] = minters[i];
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // Admin: pointer updates
    // ─────────────────────────────────────────────────────────────────

    function setOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "SkillNFT: zero address");
        oracle = SkillFunOracle(_oracle);
    }

    function setVerifier(address _verifier) external onlyOwner {
        verifier = IERC7857DataVerifier(_verifier);
    }

    // ─────────────────────────────────────────────────────────────────
    // SkillFun: Oracle Claim
    // ─────────────────────────────────────────────────────────────────

    function claim(uint256 tokenId) external {
        if (ownerOf(tokenId) != address(this)) revert AlreadyClaimed();

        address verified = oracle.verifiedOwner(tokenId);
        if (verified == address(0) || verified != msg.sender) revert NotVerifiedClaimer();

        _transfer(address(this), msg.sender, tokenId);
        oracle.clearVerifiedClaim(tokenId);

        emit SkillClaimed(tokenId, msg.sender);
    }

    // ─────────────────────────────────────────────────────────────────
    // SkillFun: Curator Authorization
    // ─────────────────────────────────────────────────────────────────

    function selfAuthorize(uint256 tokenId) external {
        require(ownerOf(tokenId) == address(this), "SkillNFT: skill is claimed, use purchaseAuthorization");
        _authorized[tokenId][msg.sender] = true;
        emit Authorization(address(this), msg.sender, tokenId);
    }

    function purchaseAuthorization(uint256 tokenId) external {
        address owner_ = ownerOf(tokenId);
        require(owner_ != address(this), "SkillNFT: skill is unclaimed, use selfAuthorize");
        uint256 price = basePrice[tokenId];
        if (price > 0) {
            require(w0g.transferFrom(msg.sender, owner_, price), "SkillNFT: W0G transfer failed");
        }
        _authorized[tokenId][msg.sender] = true;
        emit Authorization(owner_, msg.sender, tokenId);
    }

    // ─────────────────────────────────────────────────────────────────
    // SkillFun: Invoke
    // ─────────────────────────────────────────────────────────────────

    function invokeSkill(uint256 tokenId) external {
        address owner_ = ownerOf(tokenId);
        if (owner_ != msg.sender && !_authorized[tokenId][msg.sender]) revert NotOwnerOrAuthorized();
        uint256 price = basePrice[tokenId];
        if (price > 0) {
            require(w0g.transferFrom(msg.sender, owner_, price), "SkillNFT: W0G transfer failed");
        }
        emit SkillInvoked(tokenId, msg.sender, price);
    }

    // ─────────────────────────────────────────────────────────────────
    // ERC-7857: iTransfer
    // ─────────────────────────────────────────────────────────────────

    function iTransfer(
        address _to,
        uint256 _tokenId,
        TransferValidityProof[] calldata _proofs
    ) external override {
        if (ownerOf(_tokenId) != msg.sender) revert NotTokenOwner();

        IntelligentData[] storage data = _intelligentData[_tokenId];
        if (_proofs.length != 0 && _proofs.length != data.length) revert ProofLengthMismatch();

        if (_proofs.length > 0) {
            TransferValidityProofOutput[] memory outputs = verifier.verifyTransferValidity(_proofs);
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

    function iClone(
        address _to,
        uint256 _tokenId,
        TransferValidityProof[] calldata _proofs
    ) external override returns (uint256 _newTokenId) {
        if (ownerOf(_tokenId) != msg.sender) revert NotTokenOwner();

        _newTokenId = _nextTokenId++;

        bytes32 cloneHash = _intelligentData[_tokenId].length > 0
            ? _intelligentData[_tokenId][0].dataHash
            : bytes32(0);

        if (_proofs.length > 0) {
            TransferValidityProofOutput[] memory outputs = verifier.verifyTransferValidity(_proofs);
            if (outputs.length > 0 && outputs[0].newDataHash != bytes32(0)) {
                cloneHash = outputs[0].newDataHash;
            }
        }

        minter[_newTokenId] = msg.sender;
        _safeMint(_to, _newTokenId);
        _setTokenURI(_newTokenId, tokenURI(_tokenId));

        _intelligentData[_newTokenId].push(IntelligentData({
            dataDescription: "skill-payload",
            dataHash:        cloneHash
        }));

        manifestOwner[_newTokenId] = manifestOwner[_tokenId];
    }

    // ─────────────────────────────────────────────────────────────────
    // ERC-7857: Usage Authorization
    // ─────────────────────────────────────────────────────────────────

    function authorizeUsage(uint256 _tokenId, address _user) external override {
        if (ownerOf(_tokenId) != msg.sender) revert NotTokenOwner();
        _authorized[_tokenId][_user] = true;
        emit Authorization(msg.sender, _user, _tokenId);
    }

    function revokeAuthorization(uint256 _tokenId, address _user) external override {
        if (ownerOf(_tokenId) != msg.sender) revert NotTokenOwner();
        _authorized[_tokenId][_user] = false;
        emit AuthorizationRevoked(msg.sender, _user, _tokenId);
    }

    function isAuthorized(uint256 tokenId, address user) external view returns (bool) {
        return _authorized[tokenId][user];
    }

    // ─────────────────────────────────────────────────────────────────
    // ERC-7857 Metadata
    // ─────────────────────────────────────────────────────────────────

    function intelligentDataOf(uint256 _tokenId)
        external view override returns (IntelligentData[] memory)
    {
        return _intelligentData[_tokenId];
    }

    // ─────────────────────────────────────────────────────────────────
    // Data hash / price management
    // ─────────────────────────────────────────────────────────────────

    function setBasePrice(uint256 tokenId, uint256 newPrice) external {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        uint256 old = basePrice[tokenId];
        basePrice[tokenId] = newPrice;
        emit BasePriceUpdated(tokenId, old, newPrice);
    }

    function updateDataHash(uint256 tokenId, bytes32 newHash, uint256 index) external {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        bytes32 old = _intelligentData[tokenId][index].dataHash;
        _intelligentData[tokenId][index].dataHash = newHash;
        emit DataHashUpdated(tokenId, old, newHash);
    }

    function authorizedUpdateDataHash(uint256 tokenId, bytes32 newHash, uint256 index) external {
        require(ownerOf(tokenId) == address(this), "SkillNFT: skill is claimed, use updateDataHash");
        require(_authorized[tokenId][msg.sender], "SkillNFT: caller is not authorized");
        bytes32 old = _intelligentData[tokenId][index].dataHash;
        _intelligentData[tokenId][index].dataHash = newHash;
        emit DataHashUpdated(tokenId, old, newHash);
    }

    // ─────────────────────────────────────────────────────────────────
    // ERC-721 receiver
    // ─────────────────────────────────────────────────────────────────

    function onERC721Received(address, address, uint256, bytes calldata)
        external pure returns (bytes4)
    {
        return this.onERC721Received.selector;
    }

    // ─────────────────────────────────────────────────────────────────
    // Required overrides
    // ─────────────────────────────────────────────────────────────────

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC7857).interfaceId         ||
            interfaceId == type(IERC7857Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId)
        public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function name()
        public view override(ERC721Upgradeable, IERC7857Metadata)
        returns (string memory)
    {
        return super.name();
    }

    function symbol()
        public view override(ERC721Upgradeable, IERC7857Metadata)
        returns (string memory)
    {
        return super.symbol();
    }
}
