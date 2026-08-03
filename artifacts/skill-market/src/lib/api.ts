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
  basePrice: string | null;
  createdAt: string;
  updatedAt: string;
  isLive: boolean;
  version: number;
}

export interface DbBundle {
  id: string;
  bundleName: string;
  description: string | null;
  tags: string[] | null;
  coverImageUrl: string | null;
  serviceEndpoint: string | null;
  priceWei: string | null;
  ownerAddress: string | null;
  createdAt: string;
  updatedAt: string;
  isLive: boolean;
  skills?: DbSkill[];
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

  create: (
    data: {
      repoUrl: string;
      skillName: string;
      description?: string;
      tags?: string[];
      coverImageUrl?: string;
    },
    sigHeader: string
  ) =>
    apiFetch<{ skill: DbSkill }>("/skills", {
      method: "POST",
      headers: { "X-Wallet-Signature": sigHeader },
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

  logout: () =>
    apiFetch<{ ok: boolean }>("/auth/logout", { method: "POST" }),
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
