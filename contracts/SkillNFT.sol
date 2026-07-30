// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// ── Interfaces ─────────────────────────────────────────────────────────────────

interface ISkillFunOracle {
    function verifiedOwner(uint256 tokenId) external view returns (address);
    function clearVerifiedClaim(uint256 tokenId) external;
}

interface IERC7857DataVerifier {
    // Placeholder — verifier interface not exercised in MVP path
}

// ── Structs / Enums ────────────────────────────────────────────────────────────

enum OracleType { GitHub, GitLab, Bitbucket }

struct AccessProof {
    bytes32 oldDataHash;
    bytes32 newDataHash;
    bytes   nonce;
    bytes   encryptedPubKey;
    bytes   proof;
}

struct OwnershipProof {
    OracleType oracleType;
    bytes32    oldDataHash;
    bytes32    newDataHash;
    bytes      sealedKey;
    bytes      encryptedPubKey;
    bytes      nonce;
    bytes      proof;
}

struct TransferValidityProof {
    AccessProof   accessProof;
    OwnershipProof ownershipProof;
}

struct IntelligentData {
    string  dataDescription;
    bytes32 dataHash;
}

// ── Contract ───────────────────────────────────────────────────────────────────

/**
 * @title SkillNFT v4
 * @notice ERC-721 NFT representing an AI Skill on SkillFun.
 *
 * Authorization model (v4):
 *  - Unclaimed skill (ownerOf == address(this)):
 *      Anyone calls selfAuthorize(tokenId) for free.
 *      isAuthorized returns true for everyone (open access).
 *  - Claimed skill (ownerOf == real address):
 *      Curator calls purchaseAuthorization(tokenId),
 *      which transfers basePrice W0G from caller to NFT owner
 *      and adds caller to the authorized list.
 *  - On claim(): authEpoch[tokenId]++ resets all prior authorizations O(1).
 */
contract SkillNFT is ERC721, Ownable {

    // ── State ──────────────────────────────────────────────────────────────────

    IERC20             public immutable w0g;
    ISkillFunOracle    public oracle;
    IERC7857DataVerifier public verifier;

    uint256 private _nextTokenId;

    /// @dev Repo URL / GitHub identifier stored per token
    mapping(uint256 => string)  public manifestOwner;
    /// @dev ERC-7857 intelligent data entries per token
    mapping(uint256 => IntelligentData[]) private _intelligentData;
    /// @dev W0G price per invocation
    mapping(uint256 => uint256) public basePrice;

    // ── Epoch-based authorization ──────────────────────────────────────────────
    /// @dev Incremented on claim() to mass-invalidate all prior authorizations
    mapping(uint256 => uint256) public authEpoch;
    /// @dev authorized[tokenId][epoch][address] → bool
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) private _authorized;

    // ── Events ─────────────────────────────────────────────────────────────────
    event SkillRegistered(uint256 indexed tokenId, string repoUrl, string skillURI, bytes32 rootHash);
    event SkillClaimed(uint256 indexed tokenId, address indexed claimer);
    event SkillInvoked(uint256 indexed tokenId, address indexed caller, uint256 value);
    event Authorization(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    event AuthorizationRevoked(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    /// @notice Emitted when claim() resets all authorizations for a tokenId
    event AuthorizationsPurged(uint256 indexed tokenId);
    event DataHashUpdated(uint256 indexed tokenId, bytes32 oldHash, bytes32 newHash);
    event MetadataUpdate(uint256 _tokenId);
    event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId);
    event Transferred(uint256 indexed _tokenId, address indexed _from, address indexed _to);

    // ── Errors ─────────────────────────────────────────────────────────────────
    error NotOwnerOrAuthorized();
    error NotTokenOwner();
    error NotVerifiedClaimer();
    error AlreadyClaimed();
    error ProofLengthMismatch();

    // ── Constructor ────────────────────────────────────────────────────────────
    constructor(
        address _oracle,
        address _verifier,
        address _owner,
        address _w0g
    ) ERC721("SkillFun Skill", "SKILL") Ownable(_owner) {
        oracle   = ISkillFunOracle(_oracle);
        verifier = IERC7857DataVerifier(_verifier);
        w0g      = IERC20(_w0g);
    }

    // ── Admin ──────────────────────────────────────────────────────────────────
    /**
     * @notice Update the Oracle address. Only callable by the contract owner.
     *         Needed when the Oracle is redeployed (e.g. after a SkillNFT upgrade).
     */
    function setOracle(address _oracle) external onlyOwner {
        oracle = ISkillFunOracle(_oracle);
    }

    // ── ERC-721 receiver ───────────────────────────────────────────────────────
    function onERC721Received(address, address, uint256, bytes calldata)
        external pure returns (bytes4)
    {
        return this.onERC721Received.selector;
    }

    // ── Skill registration ─────────────────────────────────────────────────────
    /**
     * @notice Register a new Skill NFT.
     * @param repoUrl  GitHub / source repo URL (stored as manifestOwner identifier)
     * @param skillURI URI pointing to skill metadata / 0G Storage path
     * @param rootHash keccak256 root of the encrypted skill content
     * @param to       Recipient: use msg.sender for "My Repo" mode,
     *                 address(this) for community (unclaimed) mode.
     * @param _basePrice W0G wei charged per purchaseAuthorization
     */
    function registerSkill(
        string  calldata repoUrl,
        string  calldata skillURI,
        bytes32          rootHash,
        address          to,
        uint256          _basePrice
    ) external returns (uint256 tokenId) {
        tokenId = ++_nextTokenId;
        _mint(to, tokenId);

        manifestOwner[tokenId] = repoUrl;
        basePrice[tokenId]     = _basePrice;

        _intelligentData[tokenId].push(IntelligentData({
            dataDescription: skillURI,
            dataHash:        rootHash
        }));

        emit SkillRegistered(tokenId, repoUrl, skillURI, rootHash);
    }

    // ── Claim ──────────────────────────────────────────────────────────────────
    /**
     * @notice GitHub owner claims their Skill NFT after Oracle verification.
     *         Resets all prior Curator authorizations via epoch increment.
     */
    function claim(uint256 tokenId) external {
        if (ownerOf(tokenId) != address(this)) revert AlreadyClaimed();
        if (oracle.verifiedOwner(tokenId) != msg.sender) revert NotVerifiedClaimer();

        // Transfer NFT to the verified owner
        _transfer(address(this), msg.sender, tokenId);

        // Clear Oracle record
        oracle.clearVerifiedClaim(tokenId);

        // Mass-invalidate all existing Curator authorizations
        authEpoch[tokenId]++;
        emit AuthorizationsPurged(tokenId);

        emit SkillClaimed(tokenId, msg.sender);
    }

    // ── Authorization (self-serve) ─────────────────────────────────────────────

    /**
     * @notice For UNCLAIMED skills: anyone may self-authorize for free.
     *         This records on-chain intent; the server checks isAuthorized
     *         before decrypting content.
     */
    function selfAuthorize(uint256 tokenId) external {
        require(ownerOf(tokenId) == address(this), "SkillNFT: skill already claimed");
        _authorized[tokenId][authEpoch[tokenId]][msg.sender] = true;
        emit Authorization(address(this), msg.sender, tokenId);
    }

    /**
     * @notice For CLAIMED skills: pay basePrice W0G to the NFT owner,
     *         receive content-access authorization for the current epoch.
     *         If basePrice == 0, authorized for free.
     */
    function purchaseAuthorization(uint256 tokenId) external {
        address nftOwner = ownerOf(tokenId);
        require(nftOwner != address(this), "SkillNFT: skill not yet claimed");
        require(nftOwner != msg.sender,    "SkillNFT: owner cannot purchase own authorization");

        uint256 price = basePrice[tokenId];
        if (price > 0) {
            bool ok = IERC20(w0g).transferFrom(msg.sender, nftOwner, price);
            require(ok, "SkillNFT: W0G transfer failed");
        }

        _authorized[tokenId][authEpoch[tokenId]][msg.sender] = true;
        emit Authorization(nftOwner, msg.sender, tokenId);
    }

    /**
     * @notice Legacy: NFT owner can manually authorize an address (emergency use).
     */
    function authorizeUsage(uint256 _tokenId, address _user) external {
        if (ownerOf(_tokenId) != msg.sender) revert NotTokenOwner();
        _authorized[_tokenId][authEpoch[_tokenId]][_user] = true;
        emit Authorization(msg.sender, _user, _tokenId);
    }

    /**
     * @notice NFT owner revokes a specific authorization.
     */
    function revokeAuthorization(uint256 _tokenId, address _user) external {
        if (ownerOf(_tokenId) != msg.sender) revert NotTokenOwner();
        _authorized[_tokenId][authEpoch[_tokenId]][_user] = false;
        emit AuthorizationRevoked(msg.sender, _user, _tokenId);
    }

    /**
     * @notice Check authorization for current epoch.
     *         Unclaimed skills: always returns true (open access).
     */
    function isAuthorized(uint256 tokenId, address user) external view returns (bool) {
        if (ownerOf(tokenId) == address(this)) return true; // unclaimed = open
        return _authorized[tokenId][authEpoch[tokenId]][user];
    }

    // ── Invoke skill (usage metering / on-chain accounting) ───────────────────
    /**
     * @notice Record a skill invocation on-chain.
     *         Caller must be authorized (or skill must be unclaimed).
     *         W0G is NOT charged here — payment happens via purchaseAuthorization.
     *         Kept for on-chain usage telemetry / future metered billing.
     */
    function invokeSkill(uint256 tokenId) external {
        bool unclaimed = ownerOf(tokenId) == address(this);
        bool authorized = unclaimed || _authorized[tokenId][authEpoch[tokenId]][msg.sender];
        if (!authorized) revert NotOwnerOrAuthorized();

        emit SkillInvoked(tokenId, msg.sender, 0);
    }

    // ── Data hash updates ──────────────────────────────────────────────────────
    /**
     * @notice NFT owner updates the content hash (e.g. after re-encrypting skill.md).
     */
    function updateDataHash(uint256 tokenId, bytes32 newHash, uint256 index) external {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        require(index < _intelligentData[tokenId].length, "SkillNFT: index out of bounds");

        bytes32 oldHash = _intelligentData[tokenId][index].dataHash;
        _intelligentData[tokenId][index].dataHash = newHash;

        emit DataHashUpdated(tokenId, oldHash, newHash);
        emit MetadataUpdate(tokenId);
    }

    // ── ERC-7857 Intelligent Data ──────────────────────────────────────────────

    function intelligentDataOf(uint256 _tokenId)
        external view returns (IntelligentData[] memory)
    {
        return _intelligentData[_tokenId];
    }

    function iClone(
        address _to,
        uint256 _tokenId,
        TransferValidityProof[] calldata _proofs
    ) external returns (uint256 _newTokenId) {
        if (ownerOf(_tokenId) != msg.sender) revert NotTokenOwner();
        if (_proofs.length == 0) revert ProofLengthMismatch();

        _newTokenId = ++_nextTokenId;
        _mint(_to, _newTokenId);

        IntelligentData[] storage src = _intelligentData[_tokenId];
        for (uint256 i = 0; i < src.length; i++) {
            _intelligentData[_newTokenId].push(src[i]);
        }
        basePrice[_newTokenId]     = basePrice[_tokenId];
        manifestOwner[_newTokenId] = manifestOwner[_tokenId];

        emit Transferred(_newTokenId, address(0), _to);
    }

    function iTransfer(
        address _to,
        uint256 _tokenId,
        TransferValidityProof[] calldata _proofs
    ) external {
        if (ownerOf(_tokenId) != msg.sender) revert NotTokenOwner();
        if (_proofs.length == 0) revert ProofLengthMismatch();

        _transfer(msg.sender, _to, _tokenId);
        emit Transferred(_tokenId, msg.sender, _to);
    }

    // ── Admin ──────────────────────────────────────────────────────────────────

    function setVerifier(address _verifier) external onlyOwner {
        verifier = IERC7857DataVerifier(_verifier);
    }

    // ── Token URI ──────────────────────────────────────────────────────────────

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        IntelligentData[] storage data = _intelligentData[tokenId];
        if (data.length > 0) return data[0].dataDescription;
        return "";
    }

    // ── ERC-165 ────────────────────────────────────────────────────────────────

    function supportsInterface(bytes4 interfaceId)
        public view override returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
