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
  address:     string;
  balanceWei:  string;
  balanceA0GI: string;
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
    category?:     string;
    version?:      string;
    basePrice?:    number;
    capabilities?: string[];
    tags?:         string[];
  };
}

// Self-mint flow types
export interface PrepareMintInput {
  repoUrl:   string;
  ownerMode: "mine" | "community";
  meta?: {
    name?:         string;
    description?:  string;
    category?:     string;
    version?:      string;
    basePrice?:    number;
    capabilities?: string[];
    tags?:         string[];
  };
}

export interface PrepareMintResponse {
  skillId:         string;
  rootHash:        string;
  skillUri:        string;
  manifestOwner:   string;
  skillNFTAddress: string;
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

  /** Step 1 of self-mint: upload manifest, create DB record, get contract call params */
  prepareMint: (input: PrepareMintInput, sigHeader: string) =>
    apiFetch<PrepareMintResponse>("/skills/prepare-mint", {
      method: "POST",
      headers: { "X-Wallet-Signature": sigHeader },
      body: JSON.stringify(input),
    }),

  /** Step 2 of self-mint: confirm tx landed, update DB to minted */
  confirmMint: (skillId: string, body: { tokenId: number; txHash: string }, sigHeader: string) =>
    apiFetch<ConfirmMintResponse>(`/skills/${skillId}/confirm-mint`, {
      method: "PATCH",
      headers: { "X-Wallet-Signature": sigHeader },
      body: JSON.stringify(body),
    }),
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
  me: () =>
    apiFetch<{ authenticated: boolean; githubUsername?: string; evmAddress?: string }>("/auth/me"),
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
};
