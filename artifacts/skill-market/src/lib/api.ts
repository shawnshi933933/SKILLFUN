// api.ts — typed fetch helpers for the SkillFun API server

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body?.error ?? body?.message ?? message;
    } catch { /* ignore */ }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DbSkill {
  id: string;
  /** Same as `id` — the canonical string primary key returned by the server. */
  skillId?: string;
  repoUrl: string;
  githubUsername: string;
  skillName: string;
  description: string | null;
  tags: string[] | null;
  coverImageUrl: string | null;
  storageRootHash: string | null;
  skillUri: string | null;
  tokenId: number | null;
  mintStatus: "pending" | "minted" | "claimed";
  ownerAddress: string | null;
  /** The GitHub identity (username or org/repo) that owns the skill manifest. */
  manifestOwner: string | null;
  basePrice: string | null;
  createdAt: string;
  updatedAt: string;
  isLive: boolean;
  version: number;
  meta?: Record<string, unknown> | null;
}

export interface DbBundle {
  id: string;
  /** Same as `id` — the canonical string primary key returned by the server. */
  bundleId?: string;
  bundleName: string;
  /** Human-readable display name (may differ from bundleName). */
  name?: string | null;
  description: string | null;
  tags: string[] | null;
  coverImageUrl: string | null;
  serviceEndpoint: string | null;
  priceWei: string | null;
  /** Per-proof price charged to agents (W0G wei). */
  servicePrice?: string | null;
  ownerAddress: string | null;
  createdAt: string;
  updatedAt: string;
  isLive: boolean;
  skills?: DbSkill[];
  meta?: Record<string, unknown> | null;
}

export interface DbClaim {
  id: string;
  tokenId: number;
  githubUsername: string;
  walletAddress: string;
  status: "pending" | "approved" | "rejected" | "completed";
  txHash: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AuthStatus = "active" | "needs_reauth" | "revoked" | "pending";

export interface CuratorAuthorization {
  tokenId: number;
  skillId: string;
  skillName: string;
  repoUrl: string;
  ownerAddress: string | null;
  nftOwner: string | null;
  isClaimed: boolean;
  basePrice: string;
  authorizedAt: string | null;
  revokedAt: string | null;
  storedEpoch: number | null;
  onChainEpoch: number;
  isAuthorized: boolean;
  status: AuthStatus;
  contentVersion: number;
  bundleIds: string[];
}

export interface CreateSkillInput {
  repoUrl: string;
  skillName: string;
  description?: string;
  tags?: string[];
  coverImageUrl?: string;
}

export interface PrepareMintInput {
  repoUrl: string;
  ownerMode: "mine" | "community";
  meta?: Record<string, unknown>;
  skillFileContent?: string;
  fileType?: string;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const skillsApi = {
  list: (params?: { limit?: number; offset?: number; tag?: string }) => {
    const qs = new URLSearchParams();
    if (params?.limit != null) qs.set("limit", String(params.limit));
    if (params?.offset != null) qs.set("offset", String(params.offset));
    if (params?.tag) qs.set("tag", params.tag);
    const query = qs.toString() ? `?${qs}` : "";
    return apiFetch<{ skills: DbSkill[]; total: number }>(`/skills${query}`);
  },

  get: (id: string) => apiFetch<{ skill: DbSkill }>(`/skills/${id}`),

  create: (data: CreateSkillInput, sigHeader: string) =>
    apiFetch<{ skill: DbSkill }>("/skills", {
      method: "POST",
      headers: { "X-Wallet-Signature": sigHeader },
      body: JSON.stringify(data),
    }),

  prepareMint: (data: PrepareMintInput, sigHeader: string) =>
    apiFetch<{
      skillId: string;
      rootHash: string;
      skillUri: string;
      manifestOwner: string;
      skillNFTAddress: string;
      w0gAddress: string;
      storage: { uploaded: boolean };
    }>("/skills/prepare-mint", {
      method: "POST",
      headers: { "X-Wallet-Signature": sigHeader },
      body: JSON.stringify(data),
    }),

  confirmMint: (id: string, data: { tokenId: number; txHash: string }) =>
    apiFetch<{ skill: DbSkill; onChainOwner: string }>(`/skills/${id}/confirm-mint`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

export const bundlesApi = {
  list: (params?: { limit?: number; offset?: number; tag?: string }) => {
    const qs = new URLSearchParams();
    if (params?.limit != null) qs.set("limit", String(params.limit));
    if (params?.offset != null) qs.set("offset", String(params.offset));
    if (params?.tag) qs.set("tag", params.tag);
    const query = qs.toString() ? `?${qs}` : "";
    return apiFetch<{ bundles: (DbBundle & { skillCount?: number })[]; total: number }>(
      `/bundles${query}`
    );
  },

  get: (id: string) =>
    apiFetch<{ bundle: DbBundle & { skills: DbSkill[] } }>(`/bundles/${id}`),

  create: (
    data: {
      bundleName: string;
      description?: string;
      tags?: string[];
      coverImageUrl?: string;
      serviceEndpoint?: string;
      priceWei?: string;
      skillIds?: string[];
    },
    sigHeader: string
  ) =>
    apiFetch<{ bundle: DbBundle }>("/bundles", {
      method: "POST",
      headers: { "X-Wallet-Signature": sigHeader },
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: Partial<{
      bundleName: string;
      description: string;
      tags: string[];
      coverImageUrl: string;
      serviceEndpoint: string;
      priceWei: string;
      skillIds: string[];
      isLive: boolean;
    }>,
    sigHeader: string
  ) =>
    apiFetch<{ bundle: DbBundle }>(`/bundles/${id}`, {
      method: "PATCH",
      headers: { "X-Wallet-Signature": sigHeader },
      body: JSON.stringify(data),
    }),

  analytics: (id: string) =>
    apiFetch<{ bundleId: string; totalInvocations: number; uniqueAgents: number; totalEarnedWei: string }>(
      `/bundles/${id}/analytics`
    ),
};

export const claimsApi = {
  submit: (tokenId: number, sigHeader: string) =>
    apiFetch<{ claim: DbClaim }>("/claims", {
      method: "POST",
      headers: { "X-Wallet-Signature": sigHeader },
      body: JSON.stringify({ tokenId }),
    }),

  complete: (claimId: string, txHash: string, sigHeader: string) =>
    apiFetch<{ claim: DbClaim }>(`/claims/${claimId}/complete`, {
      method: "POST",
      headers: { "X-Wallet-Signature": sigHeader },
      body: JSON.stringify({ txHash }),
    }),

  getForToken: (tokenId: number, sigHeader: string) =>
    apiFetch<{ claim: DbClaim | null }>(`/claims/token/${tokenId}`, {
      headers: { "X-Wallet-Signature": sigHeader },
    }),
};

export const authApi = {
  githubStart: () =>
    apiFetch<{ url: string }>("/auth/github/start"),

  githubCallback: (code: string, state: string) =>
    apiFetch<{ username: string }>(`/auth/github/callback?code=${code}&state=${state}`),

  session: () =>
    apiFetch<{ githubUsername: string | null }>("/auth/session"),

  me: () =>
    apiFetch<{ githubUsername: string | null; walletAddress: string | null }>("/auth/me"),

  challenge: () =>
    apiFetch<{ nonce: string }>("/auth/challenge"),

  logout: () =>
    apiFetch<{ ok: boolean }>("/auth/logout", { method: "POST" }),
};

// ---------------------------------------------------------------------------
// Curator authorizations (agent wallet — on-chain authorization management)
// ---------------------------------------------------------------------------

export const curatorApi = {
  listAuthorizations: (wallet: string) =>
    apiFetch<{ authorizations: CuratorAuthorization[]; curatorWallet: string }>(
      `/curator/authorizations?wallet=${encodeURIComponent(wallet)}`
    ),

  getAuthorizationStatus: (tokenId: number, wallet: string) =>
    apiFetch<{
      tokenId: number;
      skillId: string;
      skillName: string;
      nftOwner: string | null;
      isClaimed: boolean;
      basePrice: string;
      storedEpoch: number | null;
      onChainEpoch: number;
      isAuthorized: boolean;
      status: AuthStatus;
      authorizedAt: string | null;
      revokedAt: string | null;
    }>(`/curator/authorizations/${tokenId}/status?wallet=${encodeURIComponent(wallet)}`),
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

  /** Batch-write Oracle verifications for all approved claims in one tx (server-side, requires operator). */
  writeBatchOracle: (sigHeader: string) =>
    apiFetch<{ txHash: string; claimIds: string[] }>("/claims/batch-write-oracle", {
      method: "POST",
      headers: { "X-Wallet-Signature": sigHeader },
    }),

  /** Fetch platform config (deployer address, oracle address). */
  getConfig: () =>
    apiFetch<{ deployerAddress: string; oracleAddress: string }>("/admin/config"),
};

// ---------------------------------------------------------------------------
// GitHub manifest fetch + AI analysis
// ---------------------------------------------------------------------------

export interface GitHubManifestResult {
  found: boolean;
  fileType: string | null;
  rawContent: string | null;
  parsed: {
    name?: string;
    description?: string;
    version?: string;
    category?: string;
    basePrice?: number;
    capabilities?: string[];
    tags?: string[];
  };
  githubUrl: string;
  warning?: string;
}

export const githubApi = {
  fetchSkillManifest: (repo: string) =>
    apiFetch<GitHubManifestResult>(`/github/skill-manifest?repo=${encodeURIComponent(repo)}`),

  aiAnalyze: (body: { rawContent: string; fileType: string; repoUrl: string }) =>
    apiFetch<{
      description?: string;
      capabilities: string[];
      tags: string[];
      instructions?: string;
    }>("/github/ai-analyze", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ---------------------------------------------------------------------------
// Chain reads (BFF — reads on-chain state via API server)
// ---------------------------------------------------------------------------

export const chainApi = {
  skill: (tokenId: number) =>
    apiFetch<{ tokenId: number; owner: string; skillUri: string | null }>(`/chain/skill/${tokenId}`),

  balance: (address: string) =>
    apiFetch<{ address: string; balanceWei: string; balanceEther: string }>(`/chain/balance/${address}`),

  oracle: (tokenId: number) =>
    apiFetch<{ tokenId: number; verifiedOwner: string | null; hasClaims: boolean }>(`/chain/oracle/${tokenId}`),
};

// ---------------------------------------------------------------------------
// Proofs / skill stats (public)
// ---------------------------------------------------------------------------

export const proofsApi = {
  stats: (skillId: string) =>
    apiFetch<{ skillId: string; invocationCount: number; totalEarnedWei: string }>(`/skills/${skillId}/stats`),
};
