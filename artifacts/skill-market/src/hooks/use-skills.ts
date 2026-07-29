import { useQuery } from "@tanstack/react-query";
import { skillsApi, bundlesApi, chainApi, authApi, proofsApi } from "@/lib/api";

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------
export function useSkills(params?: Parameters<typeof skillsApi.list>[0]) {
  return useQuery({
    queryKey: ["skills", params],
    queryFn: () => skillsApi.list(params),
    staleTime: 30_000,
  });
}

export function useSkill(id: string | undefined) {
  return useQuery({
    queryKey: ["skill", id],
    queryFn: () => skillsApi.get(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// Bundles
// ---------------------------------------------------------------------------
export function useBundles() {
  return useQuery({
    queryKey: ["bundles"],
    queryFn: () => bundlesApi.list(),
    staleTime: 30_000,
  });
}

export function useBundle(id: string | undefined) {
  return useQuery({
    queryKey: ["bundle", id],
    queryFn: () => bundlesApi.get(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useBundleAnalytics(id: string | undefined) {
  return useQuery({
    queryKey: ["bundle-analytics", id],
    queryFn: () => bundlesApi.analytics(id!),
    enabled: !!id,
    staleTime: 20_000,
    refetchInterval: 30_000,
  });
}

// ---------------------------------------------------------------------------
// Skill stats (public — invocation count + W0G earned)
// ---------------------------------------------------------------------------
export function useSkillStats(id: string | undefined) {
  return useQuery({
    queryKey: ["skill-stats", id],
    queryFn: () => proofsApi.stats(id!),
    enabled: !!id,
    staleTime: 20_000,
    refetchInterval: 30_000,
  });
}

// ---------------------------------------------------------------------------
// Chain reads (BFF)
// ---------------------------------------------------------------------------
export function useChainSkill(tokenId: number | null | undefined) {
  return useQuery({
    queryKey: ["chain-skill", tokenId],
    queryFn: () => chainApi.skill(tokenId!),
    enabled: tokenId != null,
    staleTime: 15_000,
  });
}

export function useChainBalance(address: string | undefined) {
  return useQuery({
    queryKey: ["chain-balance", address?.toLowerCase()],
    queryFn: () => chainApi.balance(address!),
    enabled: !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useChainOracle(tokenId: number | null | undefined) {
  return useQuery({
    queryKey: ["chain-oracle", tokenId],
    queryFn: () => chainApi.oracle(tokenId!),
    enabled: tokenId != null,
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export function useAuthMe() {
  return useQuery({
    queryKey: ["auth-me"],
    queryFn: () => authApi.me(),
    staleTime: 60_000,
  });
}
