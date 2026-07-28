/**
 * Typed BFF API client.
 * All chain reads go through /api — the frontend never calls an RPC directly.
 */

// ---------------------------------------------------------------------------
// Base
// ---------------------------------------------------------------------------
const API_BASE = "/api";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = (body as { error?: { message?: string } })?.error?.message ?? res.statusText;
    throw new Error(msg);
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
}

export interface DbBundle {
  bundleId:     string;
  subdomain:    string;
  name:         string;
  description:  string | null;
  ownerAddress: string;
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
  address:    string;
  balanceWei: string;
  balanceA0GI: string;
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------
export const skillsApi = {
  list: (params?: { status?: MintStatus; owner?: string; repo?: string }) =>
    apiFetch<{ skills: DbSkill[] }>("/skills" + (params ? "?" + new URLSearchParams(params as Record<string,string>).toString() : "")),

  get: (id: string) =>
    apiFetch<{ skill: DbSkill; onChain: OnChainSkillData | null }>(`/skills/${id}`),
};

// ---------------------------------------------------------------------------
// Bundles
// ---------------------------------------------------------------------------
export const bundlesApi = {
  list: () => apiFetch<{ bundles: DbBundle[] }>("/bundles"),

  get: (id: string) =>
    apiFetch<{ bundle: DbBundle; skills: (DbSkill & { position: number })[] }>(`/bundles/${id}`),
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
  me: () => apiFetch<{ authenticated: boolean; githubUsername?: string; evmAddress?: string }>("/auth/me"),
};
