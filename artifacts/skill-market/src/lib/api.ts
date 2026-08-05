/**
 * Typed BFF API client.
 * All chain reads go through /api — the frontend never calls an RPC directly.
 */

// ---------------------------------------------------------------------------
// Base
// ---------------------------------------------------------------------------
const API_BASE = "/api";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // Destructure so `...restInit` never overrides the merged `headers` object.
  const { headers: extraHeaders, ...restInit } = init ?? {};
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...extraHeaders },
    ...restInit,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const errBody = body as { error?: { message?: string; possiblyPrivate?: boolean } };
    const msg = errBody?.error?.message ?? res.statusText;
    const err = new Error(msg) as Error & { possiblyPrivate?: boolean };
    if (errBody?.error?.possiblyPrivate) err.possiblyPrivate = true;
    throw err;
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Types (mirror lib/db schema)
// ---------------------------------------------------------------------------
export type MintStatus     = "pending" | "minting" | "minted" | "claimed";
export type ReviewStatus   = "pending" | "approved" | "rejected";
export type ClaimStatus    = "pending" | "approved" | "rejected" | "completed";

export interface DbSkill {
  skillId:       string;
  tokenId:       number | null;
  repoUrl:       string;
  skillUri:      string | null;
  rootHash:      string | null;
  manifestOwner: string;
  mintStatus:    MintStatus;
  reviewStatus:  ReviewStatus;
  ownerAddress:  string | null;
  meta:          Record<string, unknown>;
  createdAt:     string;
  updatedAt:     string;
  /** Number of bundles this skill is included in (server-computed) */
  bundleCount?:  number;
  /** GitHub repository star count (server-fetched, cached 1 h) */
  githubStars?:  number;
}

export interface DbBundle {
  bundleId:     string;
  subdomain:    string;
  name:         string;
  description:  string | null;
  /** Markdown describing how agents should use the skills in this bundle. */
  workflow:     string | null;
  ownerAddress: string;
  /** W0G wei (integer string) agents pay per proof. null = free. */
  servicePrice: string | null;
  meta:         Record<string, unknown>;
  createdAt:    string;
  updatedAt:    string;
}

export interface OnChainSkillData {
  tokenId:         number;
  manifestOwner:   string;
  intelligentData: unknown[];
  owner:           string | null;
}

export interface ChainBalance {
  address:     string;
  balanceWei:  string;
  balance0G: string;
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------
export interface CreateSkillInput {
  repoUrl:       string;   // "owner/repo"
  manifestOwner: string;   // same as repoUrl for community mint
  ownerAddress?: string;
  meta?: {
    name?:         string;
    description?:  string;
    instructions?: string;
    category?:     string;
    version?:      string;
    basePrice?:    number;
    capabilities?: string[];
    tags?:         string[];
  };
}

// Self-mint flow types
export interface PrepareMintInput {
  repoUrl:            string;
  ownerMode:          "mine" | "community";
  /** Raw file content fetched from GitHub (skill.md / skillfun.json). */
  skillFileContent?:  string;
  /** "skillfun.json" | "skill.md" | "README.md" */
  fileType?:          string;
  /** W0G price per invocation in wei (bigint as decimal string). e.g. "10000000000000000" = 0.01 W0G */
  basePriceWei?:      string;
  meta?: {
    name?:         string;
    description?:  string;
    instructions?: string;
    category?:     string;
    version?:      string;
    basePrice?:    number;
    capabilities?: string[];
    tags?:         string[];
  };
}

// GitHub manifest fetch
export interface GitHubManifestResult {
  found:       boolean;
  fileType:    string | null;
  rawContent:  string | null;
  parsed: {
    name?:         string;
    description?:  string;
    version?:      string;
    category?:     string;
    basePrice?:    number;
    capabilities?: string[];
    tags?:         string[];
  };
  githubUrl:        string;
  warning?:         string;
  /** True when the repo may be private and no repo-scope token is in the session */
  possiblyPrivate?: boolean;
}

export interface PrepareMintResponse {
  skillId:         string;
  rootHash:        string;
  skillUri:        string;
  manifestOwner:   string;
  skillNFTAddress: string;
  /** W0G ERC-20 contract address — needed for approve before invokeSkill */
  w0gAddress:      string;
  storage:         { uploaded: boolean };
}

export interface ConfirmMintResponse {
  skill:        DbSkill;
  onChainOwner: string;
}

export const skillsApi = {
  list: (params?: { status?: MintStatus; owner?: string; repo?: string }) =>
    apiFetch<{ skills: DbSkill[] }>(
      "/skills" + (params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "")
    ),

  get: (id: string) =>
    apiFetch<{ skill: DbSkill; onChain: OnChainSkillData | null }>(`/skills/${id}`),

  create: (input: CreateSkillInput) =>
    apiFetch<{ skill: DbSkill }>("/skills", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /** Step 1 of self-mint: upload manifest (+ real skill file if fetched), create DB record */
  prepareMint: (input: PrepareMintInput, sigHeader: string) =>
    apiFetch<PrepareMintResponse>("/skills/prepare-mint", {
      method: "POST",
      headers: { "X-Wallet-Signature": sigHeader },
      body: JSON.stringify(input),
    }),

  /** Step 2 of self-mint: confirm tx landed, update DB to minted.
   *  No wallet signature required — skillId is unguessable, backend verifies
   *  ownership via on-chain ownerOf(tokenId). */
  confirmMint: (skillId: string, body: { tokenId: number; txHash: string }) =>
    apiFetch<ConfirmMintResponse>(`/skills/${skillId}/confirm-mint`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

// ---------------------------------------------------------------------------
// GitHub
// ---------------------------------------------------------------------------

export interface AiAnalyzeResult {
  description:  string;
  capabilities: string[];
  tags:         string[];
  instructions: string;
}

export const githubApi = {
  /** Fetch skill manifest from a public GitHub repo (no auth required). */
  fetchSkillManifest: (repo: string) =>
    apiFetch<GitHubManifestResult>(
      `/github/skill-manifest?repo=${encodeURIComponent(repo)}`
    ),

  /** Analyze raw skill.md content with AI to extract structured metadata. */
  aiAnalyze: (body: { rawContent: string; fileType: string; repoUrl: string }) =>
    apiFetch<AiAnalyzeResult>("/github/ai-analyze", {
      method: "POST",
      body:   JSON.stringify(body),
    }),
};

// ---------------------------------------------------------------------------
// Payment proofs
// ---------------------------------------------------------------------------
/** Sensitive proof fields (token, txHash, full agentWallet) are never returned
 *  on public endpoints. This type represents only what analytics exposes. */
export interface ActivityEvent {
  skillId:           string;
  skillName:         string;
  /** Masked: 0x1234…5678 — full wallet is never exposed publicly */
  agentWalletMasked: string;
  contentVersion:    number;
  issuedAt:          string;
}

/** Full proof record — only returned to authenticated skill owners via /api/skills/:id/proofs */
export interface PaymentProof {
  token:          string;
  skillId:        string;
  contentVersion: number;
  agentWallet:    string;
  txHash:         string;
  issuedAt:       string;
  expiresAt:      string | null;
}

export interface SkillProofsResponse {
  proofs:      PaymentProof[];
  total:       number;
  page:        number;
  limit:       number;
  invocations: number;
  revenueW0G:  number;
}

export interface BundleSkillBreakdown {
  skillId:     string;
  skillName:   string;
  invocations: number;
  revenueW0G:  number;
}

export interface BundleAnalyticsResponse {
  invocations:    number;
  revenueW0G:     number;
  recentActivity: ActivityEvent[];
  skillBreakdown: BundleSkillBreakdown[];
}

// ---------------------------------------------------------------------------
// Bundles
// ---------------------------------------------------------------------------
export const bundlesApi = {
  list: () => apiFetch<{ bundles: DbBundle[] }>("/bundles"),

  get: (id: string) =>
    apiFetch<{ bundle: DbBundle; skills: (DbSkill & { position: number })[] }>(`/bundles/${id}`),

  analytics: (id: string) =>
    apiFetch<BundleAnalyticsResponse>(`/bundles/${id}/analytics`),

  create: (
    body: { subdomain: string; name: string; description?: string; meta?: Record<string, unknown> },
    sigHeader: string,
  ) =>
    apiFetch<{ bundle: DbBundle }>("/bundles", {
      method: "POST",
      headers: { "X-Wallet-Signature": sigHeader },
      body: JSON.stringify(body),
    }),

  update: (
    bundleId: string,
    body: { name?: string; description?: string; servicePrice?: string | null; workflow?: string },
    sigHeader: string,
  ) =>
    apiFetch<{ bundle: DbBundle }>(`/bundles/${bundleId}`, {
      method: "PUT",
      headers: { "X-Wallet-Signature": sigHeader },
      body: JSON.stringify(body),
    }),

  updateSkills: (bundleId: string, skillIds: string[], sigHeader: string) =>
    apiFetch<{ success: boolean; count: number }>(`/bundles/${bundleId}/skills`, {
      method: "PUT",
      headers: { "X-Wallet-Signature": sigHeader },
      body: JSON.stringify({ skillIds }),
    }),
};

export interface SkillStatsResponse {
  skillId:      string;
  invocations:  number;
  revenueW0G:   number;
  /** On-chain basePrice in W0G wei, as decimal string. Present when skill is minted. */
  basePriceWei?: string;
}

// ---------------------------------------------------------------------------
// Skills (proofs — owner-only)
// ---------------------------------------------------------------------------
export const proofsApi = {
  list: (skillId: string, sigHeader: string, page = 1, limit = 20) =>
    apiFetch<SkillProofsResponse>(`/skills/${skillId}/proofs?page=${page}&limit=${limit}`, {
      headers: { "X-Wallet-Signature": sigHeader },
    }),

  stats: (skillId: string) =>
    apiFetch<SkillStatsResponse>(`/skills/${skillId}/stats`),
};

// ---------------------------------------------------------------------------
// Platform stats (landing page)
// ---------------------------------------------------------------------------
export interface PlatformStats {
  totalSkills:      number;
  totalBundles:     number;
  totalInvocations: number;
  cachedAt:         number;
}

export const statsApi = {
  get: () => apiFetch<PlatformStats>("/stats"),
};

// ---------------------------------------------------------------------------
// Chain reads (BFF — no direct RPC from frontend)
// ---------------------------------------------------------------------------
export const chainApi = {
  skill: (tokenId: number) =>
    apiFetch<OnChainSkillData>(`/chain/skill/${tokenId}`),

  balance: (address: string) =>
    apiFetch<ChainBalance>(`/chain/balance/${address}`),

  oracle: (tokenId: number) =>
    apiFetch<{ tokenId: number; verifiedOwner: string }>(`/chain/oracle/${tokenId}`),
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const authApi = {
  challenge: () => apiFetch<{ nonce: string }>("/auth/challenge"),
  me: () =>
    apiFetch<{ authenticated: boolean; githubUsername?: string; evmAddress?: string }>("/auth/me"),
  linkWallet: (sigHeader: string) =>
    apiFetch<{ success: boolean; evmAddress: string }>("/auth/link-wallet", {
      method: "POST",
      headers: { "X-Wallet-Signature": sigHeader },
      body: JSON.stringify({}),
    }),
};

// ---------------------------------------------------------------------------
// Claims
// ---------------------------------------------------------------------------
export interface DbClaim {
  id:             string;
  tokenId:        number;
  githubUsername: string;
  walletAddress:  string;
  status:         ClaimStatus;
  txHash:         string | null;
  createdAt:      string;
  updatedAt:      string;
}

export const claimsApi = {
  submit: (tokenId: number, sigHeader: string) =>
    apiFetch<{ claim: DbClaim }>("/claims", {
      method: "POST",
      headers: { "X-Wallet-Signature": sigHeader },
      body: JSON.stringify({ tokenId }),
    }),
  mine: () => apiFetch<{ claims: DbClaim[] }>("/claims/mine"),
  complete: (claimId: string, txHash: string, sigHeader: string) =>
    apiFetch<{ claim: DbClaim }>(`/claims/${claimId}/complete`, {
      method: "POST",
      headers: { "X-Wallet-Signature": sigHeader },
      body: JSON.stringify({ txHash }),
    }),
};

// ---------------------------------------------------------------------------
// Curator authorizations
// ---------------------------------------------------------------------------

export type AuthStatus = "active" | "needs_reauth" | "revoked" | "pending";

export interface CuratorAuthorization {
  tokenId:        number;
  skillId:        string;
  skillName:      string;
  repoUrl:        string;
  ownerAddress:   string | null;
  /** Live on-chain NFT owner — null means unclaimed */
  nftOwner:       string | null;
  /** true if the NFT is held by a real wallet (not SkillNFT contract) */
  isClaimed:      boolean;
  /** On-chain basePrice in W0G wei, as decimal string */
  basePrice:      string;
  authorizedAt:   string | null;
  revokedAt:      string | null;
  storedEpoch:    number | null;
  onChainEpoch:   number;
  isAuthorized:   boolean;
  status:         AuthStatus;
  contentVersion: number;
  bundleIds:      string[];
}

export interface CuratorAuthorizationsResponse {
  authorizations: CuratorAuthorization[];
  curatorWallet:  string;
}

export interface PrepareSyncResponse {
  skillId:        string;
  rootHash:       string | null;
  skillUri?:      string;
  contentVersion: number;
  curatorsMarked?: number;
  noChange:       boolean;
  message?:       string;
}

export const curatorApi = {
  listAuthorizations: (wallet: string) =>
    apiFetch<CuratorAuthorizationsResponse>(
      `/curator/authorizations?wallet=${encodeURIComponent(wallet)}`
    ),

  getAuthorizationStatus: (tokenId: number, wallet: string) =>
    apiFetch<CuratorAuthorization & { status: AuthStatus }>(
      `/curator/authorizations/${tokenId}/status?wallet=${encodeURIComponent(wallet)}`
    ),

  /** Delete a bundle (owner only). Cascades to skills list and payment proofs. */
  deleteBundle: (bundleId: string, sigHeader: string) =>
    apiFetch<{ success: boolean }>(`/bundles/${bundleId}`, {
      method:  "DELETE",
      headers: { "X-Wallet-Signature": sigHeader },
    }),

  /**
   * Curator-triggered content sync for an unclaimed skill.
   * Fetches latest GitHub content, uploads to 0G Storage, updates DB.
   * Returns the new rootHash — the curator's wallet must then call
   * authorizedUpdateDataHash(tokenId, rootHash, 0) on-chain.
   */
  prepareSync: (skillId: string, sigHeader: string) =>
    apiFetch<PrepareSyncResponse>(`/skills/${skillId}/prepare-sync`, {
      method:  "POST",
      headers: { "X-Wallet-Signature": sigHeader },
      body:    JSON.stringify({}),
    }),
};

// ---------------------------------------------------------------------------
// Creator skill management
// ---------------------------------------------------------------------------

export interface CreatorSkill {
  skillId:        string;
  tokenId:        number;
  repoUrl:        string;
  skillName:      string;
  mintStatus:     string;
  contentVersion: number;
  rootHash:       string | null;
  /** On-chain base price in W0G wei (decimal string) */
  basePrice:      string;
  isOwner:        boolean;
  nftOwner:       string | null;
  isClaimed:      boolean;
  meta:           Record<string, unknown>;
}

export const creatorApi = {
  /** List all minted Skill NFTs currently owned by the given wallet (live on-chain check). */
  listOwned: (wallet: string) =>
    apiFetch<{ skills: CreatorSkill[]; wallet: string }>(
      `/creator/skills?wallet=${encodeURIComponent(wallet)}`
    ),

  /**
   * Update user-editable metadata fields (name, description, category, etc.)
   * without touching 0G Storage or on-chain data.
   * Requires an EIP-712 wallet signature with action "update-skill".
   */
  updateMeta: (
    skillId:   string,
    meta:      Record<string, unknown>,
    sigHeader: string,
  ) =>
    apiFetch<{ skill: Record<string, unknown> }>(`/skills/${skillId}`, {
      method:  "PATCH",
      headers: { "X-Wallet-Signature": sigHeader },
      body:    JSON.stringify({ meta }),
    }),

  /**
   * Sync skill content from GitHub (fromGithub: true) or upload provided content.
   * Uploads to 0G Storage, increments contentVersion in DB,
   * and marks curator_authorizations for this tokenId as needs_reauth.
   * Returns the new rootHash — the caller must then submit updateDataHash on-chain.
   */
  updateContent: (
    skillId:   string,
    options:   { fromGithub: true } | { fromGithub?: false; content: string },
    sigHeader: string,
  ) =>
    apiFetch<{
      newRootHash?:      string;
      newSkillUri?:      string;
      newContentVersion?: number;
      curatorsMarked?:   number;
      noChange?:         boolean;
      message?:          string;
      rootHash?:         string;
    }>(`/skills/${skillId}/update-content`, {
      method:  "POST",
      headers: { "X-Wallet-Signature": sigHeader },
      body:    JSON.stringify(options),
    }),
};

// ---------------------------------------------------------------------------
// Admin (deployer-wallet only)
// ---------------------------------------------------------------------------
export const adminApi = {
  mintSkill: (skillId: string, sigHeader: string, overrides?: Record<string, unknown>) =>
    apiFetch<{ skill: DbSkill; storage: { uploaded: boolean; rootHash: string } }>(
      `/admin/skills/${skillId}/mint`,
      {
        method: "POST",
        headers: { "X-Wallet-Signature": sigHeader },
        body: JSON.stringify(overrides ?? {}),
      }
    ),

  listSkills: (sigHeader: string) =>
    apiFetch<{ skills: DbSkill[] }>("/admin/skills", {
      headers: { "X-Wallet-Signature": sigHeader },
    }),

  /** List all pending Skill claims (deployer only). */
  listClaims: (sigHeader: string) =>
    apiFetch<{ claims: DbClaim[] }>("/claims/pending", {
      headers: { "X-Wallet-Signature": sigHeader },
    }),

  /** Approve or reject a claim (deployer only). */
  updateClaim: (claimId: string, status: "approved" | "rejected", sigHeader: string) =>
    apiFetch<{ claim: DbClaim }>(`/claims/${claimId}`, {
      method: "PATCH",
      headers: { "X-Wallet-Signature": sigHeader },
      body: JSON.stringify({ status }),
    }),

  /** Fetch platform config (deployer address, oracle address). */
  getConfig: () =>
    apiFetch<{ deployerAddress: string; oracleAddress: string }>("/admin/config"),
};
