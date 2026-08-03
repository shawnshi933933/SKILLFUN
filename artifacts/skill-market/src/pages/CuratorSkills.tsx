/**
 * Curator authorization management panel.
 * Route: /app/curator/skills
 *
 * Shows the curator's bundle list first. Each bundle card displays an auth
 * health summary (Active / Re-auth needed / Pending / Revoked). Clicking a
 * bundle expands an inline accordion showing the skill rows for that bundle.
 */

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useLocation } from "wouter";
import {
  Shield, AlertTriangle, CheckCircle2, Clock, RefreshCw,
  ExternalLink, Loader2, ChevronDown, ChevronRight, Layers, RotateCcw, Info,
  Package, Globe, ZapOff, Pencil, Check, Plus, X, Search, Coins,
} from "lucide-react";
import { useCuratorAuthorizations, useAuthorizeSkill, type AuthorizePhase } from "@/hooks/use-curator";
import { bundlesApi, skillsApi, type DbBundle, type CuratorAuthorization, type AuthStatus } from "@/lib/api";
import { useEip712Sign } from "@/hooks/use-eip712";
import { formatUnits } from "viem";

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

interface StatusConfig {
  label:     string;
  icon:      React.ReactNode;
  className: string;
}

function getStatusConfig(status: AuthStatus): StatusConfig {
  switch (status) {
    case "active":
      return {
        label: "Active",
        icon:  <CheckCircle2 className="w-3.5 h-3.5" />,
        className: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
      };
    case "needs_reauth":
      return {
        label: "Re-auth needed",
        icon:  <AlertTriangle className="w-3.5 h-3.5" />,
        className: "border-amber-500/40 text-amber-400 bg-amber-500/10",
      };
    case "pending":
      return {
        label: "Not authorized",
        icon:  <Clock className="w-3.5 h-3.5" />,
        className: "border-muted-foreground/30 text-muted-foreground bg-white/5",
      };
    case "revoked":
      return {
        label: "Revoked",
        icon:  <RotateCcw className="w-3.5 h-3.5" />,
        className: "border-red-500/40 text-red-400 bg-red-500/10",
      };
  }
}

function StatusBadge({ status }: { status: AuthStatus }) {
  const cfg = getStatusConfig(status);
  return (
    <Badge variant="outline" className={`flex items-center gap-1 text-xs px-2 py-0.5 ${cfg.className}`}>
      {cfg.icon}
      {cfg.label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Phase label for the authorize button
// ---------------------------------------------------------------------------

const PHASE_LABEL: Record<AuthorizePhase, string> = {
  idle:            "",
  approving_w0g:   "Approving W0G…",
  waiting_approve: "Confirming approval…",
  authorizing:     "Authorizing…",
  waiting_auth:    "Confirming…",
  done:            "Authorized!",
  error:           "Failed",
};

// ---------------------------------------------------------------------------
// Single skill row component
// ---------------------------------------------------------------------------

function SkillRow({ skill }: { skill: CuratorAuthorization }) {
  const { toast } = useToast();
  const { state, authorize, reset } = useAuthorizeSkill();

  const isActionable = skill.status === "needs_reauth" || skill.status === "pending" || skill.status === "revoked";
  const isActive = state.phase !== "idle" && state.phase !== "done" && state.phase !== "error";

  const basePriceW0G = (() => {
    try {
      const wei = BigInt(skill.basePrice);
      if (wei === 0n) return null;
      return `${formatUnits(wei, 18)} W0G`;
    } catch {
      return null;
    }
  })();

  const handleAuthorize = async () => {
    reset();
    try {
      const tx = await authorize({
        tokenId:   skill.tokenId,
        isClaimed: skill.isClaimed,
        basePrice: skill.basePrice,
      });
      toast({
        title: "Authorization successful",
        description: `Skill #${skill.tokenId} authorized. Tx: ${tx?.slice(0, 10)}…`,
      });
    } catch (err) {
      toast({
        title: "Authorization failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const short = (addr: string | null) =>
    addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "—";

  return (
    <div
      className={`grid grid-cols-[1fr_auto] gap-4 items-center p-4 rounded-xl border transition-all ${
        skill.status === "needs_reauth"
          ? "border-amber-500/20 bg-amber-500/5"
          : skill.status === "active"
          ? "border-white/10 hover:border-white/20"
          : skill.status === "pending"
          ? "border-dashed border-white/10"
          : "border-red-500/20 bg-red-500/5"
      }`}
      data-testid={`auth-row-${skill.tokenId}`}
    >
      {/* Left: skill info */}
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm truncate">{skill.skillName}</span>
          <span className="text-xs font-mono text-muted-foreground/60">#{skill.tokenId}</span>
          <StatusBadge status={skill.status} />
          {!skill.isClaimed && (
            <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400 bg-blue-500/5">
              Unclaimed
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="font-mono">{skill.repoUrl}</span>
          {basePriceW0G && (
            <span className="text-amber-400/80">{basePriceW0G} / invoke</span>
          )}
          {skill.nftOwner && skill.isClaimed && (
            <span className="font-mono">owner: {short(skill.nftOwner)}</span>
          )}
          {!skill.isClaimed && <span className="text-blue-400/70">Unclaimed — free to authorize</span>}
        </div>
        {skill.status === "needs_reauth" && (
          <div className="text-xs text-amber-400/80 flex items-center gap-1 mt-1">
            <Info className="w-3 h-3" />
            {skill.storedEpoch === -1
              ? "Content updated by creator — re-authorize to confirm you've reviewed the new version"
              : `Epoch reset (was ${skill.storedEpoch ?? "?"} → now ${skill.onChainEpoch}) — re-authorize to restore access`}
          </div>
        )}
        {skill.authorizedAt && (
          <div className="text-[10px] text-muted-foreground/50">
            Authorized {new Date(skill.authorizedAt).toLocaleDateString()}
            {skill.revokedAt && ` · Revoked ${new Date(skill.revokedAt).toLocaleDateString()}`}
          </div>
        )}
      </div>

      {/* Right: action */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        {isActionable && (
          <Button
            size="sm"
            disabled={isActive}
            onClick={handleAuthorize}
            data-testid={`button-authorize-${skill.tokenId}`}
            className={
              skill.status === "active"
                ? "border-white/20 text-sm"
                : skill.isClaimed
                ? "bg-amber-500 hover:bg-amber-600 text-black text-xs px-3"
                : "bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3"
            }
            variant={skill.status === "active" ? "outline" : "default"}
          >
            {isActive ? (
              <><Loader2 className="w-3 h-3 animate-spin mr-1" />{PHASE_LABEL[state.phase]}</>
            ) : skill.status === "needs_reauth" ? (
              <><RefreshCw className="w-3 h-3 mr-1" />Re-authorize</>
            ) : (
              <><Shield className="w-3 h-3 mr-1" />Authorize</>
            )}
          </Button>
        )}
        {state.phase === "error" && (
          <span className="text-[10px] text-red-400 max-w-[160px] text-right">{state.error?.slice(0, 80)}</span>
        )}
        <a
          href={`https://chainscan.0g.ai/token/${skill.tokenId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground flex items-center gap-1"
          data-testid={`link-scan-${skill.tokenId}`}
        >
          <ExternalLink className="w-2.5 h-2.5" /> 0G Scan
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline skill-picker panel — add skills to a bundle without leaving the page
// ---------------------------------------------------------------------------

interface AddSkillsPanelProps {
  bundleId: string;
  onClose:  () => void;
  /** Called after a successful save so the parent can refresh */
  onSaved:  () => void;
}

function AddSkillsPanel({ bundleId, onClose, onSaved }: AddSkillsPanelProps) {
  const { toast }       = useToast();
  const sign            = useEip712Sign();
  const queryClient     = useQueryClient();
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving,   setSaving]   = useState(false);

  // Fetch the bundle's current skills (authoritative list from DB).
  // Save is BLOCKED until this succeeds — updateSkills is a full-replace PUT,
  // so proceeding without the existing list would silently drop them.
  const {
    data:       bundleData,
    isLoading:  loadingBundle,
    isError:    bundleError,
    refetch:    refetchBundle,
  } = useQuery({
    queryKey: ["bundle", bundleId],
    queryFn:  () => bundlesApi.get(bundleId),
    staleTime: 30_000,
    retry: 2,
  });

  // Fetch all minted + claimed skills from the platform
  const { data: mintedData,  isLoading: loadingMinted }  = useQuery({
    queryKey: ["all-minted-skills"],
    queryFn:  () => skillsApi.list({ status: "minted" }),
    staleTime: 30_000,
  });
  const { data: claimedData, isLoading: loadingClaimed } = useQuery({
    queryKey: ["all-claimed-skills"],
    queryFn:  () => skillsApi.list({ status: "claimed" }),
    staleTime: 30_000,
  });

  const isLoading = loadingBundle || loadingMinted || loadingClaimed;

  // Existing skill IDs — only set when bundleData has successfully loaded.
  // Keeping this undefined while loading/errored lets handleSave guard against
  // accidentally submitting an empty list.
  const existingSkillIds: string[] | undefined = bundleData
    ? bundleData.skills.map(s => s.skillId)
    : undefined;

  // Combine + deduplicate; exclude skills already in this bundle.
  // When existingSkillIds is still undefined (bundle not loaded), show nothing.
  const existingSet = new Set(existingSkillIds ?? []);
  const allAvailable = existingSkillIds === undefined ? [] : [
    ...(mintedData?.skills  ?? []),
    ...(claimedData?.skills ?? []),
  ].filter((s, idx, arr) =>
    s.tokenId !== null &&
    !existingSet.has(s.skillId) &&
    arr.findIndex(x => x.skillId === s.skillId) === idx   // deduplicate
  );

  // Filter by search query
  const query = search.trim().toLowerCase();
  const displayed = query
    ? allAvailable.filter(s => {
        const name = ((s.meta as Record<string, unknown>)?.name as string ?? "").toLowerCase();
        return name.includes(query) || s.repoUrl.toLowerCase().includes(query);
      })
    : allAvailable;

  const toggle = (skillId: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(skillId) ? next.delete(skillId) : next.add(skillId);
      return next;
    });

  const handleSave = async () => {
    // Hard guard: never call updateSkills without the authoritative existing list.
    // existingSkillIds is undefined while loading or when the bundle fetch failed.
    if (existingSkillIds === undefined) {
      toast({
        title:       "Cannot save yet",
        description: "Bundle data is still loading. Please wait and try again.",
        variant:     "destructive",
      });
      return;
    }
    if (selected.size === 0) { onClose(); return; }
    setSaving(true);
    try {
      const sigHeader = await sign("update-bundle-skills");
      // Defensive merge: deduplicate in case existingSkillIds already contains
      // any of the newly selected IDs (e.g. concurrent edits).
      const merged = Array.from(new Set([...existingSkillIds, ...Array.from(selected)]));
      await bundlesApi.updateSkills(bundleId, merged, sigHeader);
      toast({
        title:       "Bundle updated",
        description: `${selected.size} skill${selected.size !== 1 ? "s" : ""} added.`,
      });
      void queryClient.invalidateQueries({ queryKey: ["curator-authorizations"] });
      void queryClient.invalidateQueries({ queryKey: ["bundles-list"] });
      void queryClient.invalidateQueries({ queryKey: ["bundle", bundleId] });
      onSaved();
    } catch (err) {
      toast({
        title:       "Failed to update skills",
        description: (err as Error).message,
        variant:     "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
      {/* Panel header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-primary/90 flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Skills to Bundle
        </span>
        <button
          onClick={onClose}
          className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          aria-label="Close skill picker"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 pointer-events-none" />
        <input
          type="text"
          placeholder="Search skills…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
      </div>

      {/* Bundle fetch error — block the entire panel so the user can't save */}
      {bundleError && (
        <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-red-500/30 bg-red-500/5 text-xs text-red-400">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Could not load bundle skills. Saving is disabled to prevent data loss.
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-[10px] border-red-500/30 text-red-400 hover:bg-red-500/10"
            onClick={() => void refetchBundle()}
          >
            <RefreshCw className="w-3 h-3 mr-1" />Retry
          </Button>
        </div>
      )}

      {/* Skill list */}
      <div className="max-h-64 overflow-y-auto space-y-1.5 pr-0.5">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground text-xs">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading skills…
          </div>
        ) : displayed.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground/50">
            {allAvailable.length === 0
              ? "All available skills are already in this bundle."
              : "No skills match your search."}
          </div>
        ) : (
          displayed.map(skill => {
            const meta     = (skill.meta as Record<string, unknown>) ?? {};
            const name     = (meta.name as string | undefined) ?? skill.repoUrl;
            const checked  = selected.has(skill.skillId);
            return (
              <button
                key={skill.skillId}
                onClick={() => toggle(skill.skillId)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                  checked
                    ? "border-primary/40 bg-primary/10"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/20 hover:bg-white/5"
                }`}
              >
                {/* Checkbox indicator */}
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  checked ? "border-primary bg-primary" : "border-white/20"
                }`}>
                  {checked && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                </div>

                {/* Skill info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-medium truncate">{name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground/50">#{skill.tokenId}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/50 font-mono truncate block">{skill.repoUrl}</span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
        <span className="text-[11px] text-muted-foreground/50">
          {selected.size > 0
            ? `${selected.size} skill${selected.size !== 1 ? "s" : ""} selected`
            : "Select skills to add"}
        </span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="text-xs h-7 px-2" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="text-xs h-7 px-3 bg-primary hover:bg-primary/90"
            onClick={handleSave}
            disabled={saving || selected.size === 0 || existingSkillIds === undefined}
            title={existingSkillIds === undefined ? "Waiting for bundle data to load…" : undefined}
          >
            {saving
              ? <><Loader2 className="w-3 h-3 animate-spin mr-1" />Saving…</>
              : <><Plus className="w-3 h-3 mr-1" />Add {selected.size > 0 ? selected.size : ""} Skill{selected.size !== 1 ? "s" : ""}</>
            }
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Auth pill — compact colored count chip
// ---------------------------------------------------------------------------

interface PillProps {
  count:     number;
  label:     string;
  color:     "emerald" | "amber" | "muted" | "red";
}

const PILL_COLORS: Record<PillProps["color"], string> = {
  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  amber:   "text-amber-400 bg-amber-500/10 border-amber-500/30",
  muted:   "text-muted-foreground bg-white/5 border-white/10",
  red:     "text-red-400 bg-red-500/10 border-red-500/30",
};

function AuthPill({ count, label, color }: PillProps) {
  if (count === 0) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${PILL_COLORS[color]}`}>
      {count} {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Service-price helpers (mirrors BundleCard.tsx formatServicePrice)
// ---------------------------------------------------------------------------

function formatServicePrice(wei: string | null | undefined): string {
  if (!wei || wei === "0") return "Free";
  try {
    const w0g = Number(BigInt(wei)) / 1e18;
    return `${w0g.toPrecision(6).replace(/\.?0+$/, "")} W0G`;
  } catch {
    return "Free";
  }
}

// ---------------------------------------------------------------------------
// Bundle card with accordion + inline price editor
// ---------------------------------------------------------------------------

interface BundleCardProps {
  bundle:   DbBundle;
  skills:   CuratorAuthorization[];
  defaultOpen?: boolean;
}

function BundleCard({ bundle, skills, defaultOpen = false }: BundleCardProps) {
  const [expanded,    setExpanded]    = useState(defaultOpen);
  const [pickerOpen,  setPickerOpen]  = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { address } = useAccount();
  const sign = useEip712Sign();
  const queryClient = useQueryClient();

  // Price editing state
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput,   setPriceInput]   = useState("");
  const [savingPrice,  setSavingPrice]  = useState(false);

  const isOwner = !!address && address.toLowerCase() === bundle.ownerAddress.toLowerCase();

  const handleEditPrice = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't toggle accordion
    const currentW0G = bundle.servicePrice && bundle.servicePrice !== "0"
      ? (Number(BigInt(bundle.servicePrice)) / 1e18).toFixed(4).replace(/\.?0+$/, "")
      : "";
    setPriceInput(currentW0G);
    setEditingPrice(true);
  };

  const handleSavePrice = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setSavingPrice(true);
      const wei = priceInput.trim() === ""
        ? null
        : String(BigInt(Math.round(parseFloat(priceInput) * 1e18)));
      const sigHeader = await sign("update-bundle");
      await bundlesApi.update(bundle.bundleId, { servicePrice: wei }, sigHeader);
      await queryClient.invalidateQueries({ queryKey: ["bundles-list"] });
      setEditingPrice(false);
      toast({ title: "Price updated" });
    } catch (err) {
      toast({ title: "Failed to update price", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSavingPrice(false);
    }
  };

  const handleCancelPrice = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPrice(false);
  };

  const openPicker  = (e: React.MouseEvent) => { e.stopPropagation(); setExpanded(true); setPickerOpen(true); };
  const closePicker = () => setPickerOpen(false);

  const active      = skills.filter((s) => s.status === "active").length;
  const needsReauth = skills.filter((s) => s.status === "needs_reauth").length;
  const pending     = skills.filter((s) => s.status === "pending").length;
  const revoked     = skills.filter((s) => s.status === "revoked").length;

  const sortedSkills = [
    ...skills.filter((s) => s.status === "needs_reauth"),
    ...skills.filter((s) => s.status === "pending"),
    ...skills.filter((s) => s.status === "active"),
    ...skills.filter((s) => s.status === "revoked"),
  ];

  const hasUrgent = needsReauth > 0;
  const priceLabel = formatServicePrice(bundle.servicePrice);

  return (
    <div
      className={`rounded-2xl border transition-all ${
        hasUrgent
          ? "border-amber-500/30 bg-amber-500/[0.04]"
          : "border-white/10 bg-card"
      }`}
      data-testid={`bundle-card-${bundle.bundleId}`}
    >
      {/* Card header — click to expand/collapse */}
      <button
        className="w-full text-left px-5 py-4 flex items-center gap-4"
        onClick={() => !editingPrice && setExpanded((v) => !v)}
        data-testid={`bundle-card-toggle-${bundle.bundleId}`}
      >
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          hasUrgent ? "bg-amber-500/10" : "bg-primary/10"
        }`}>
          <Package className={`w-5 h-5 ${hasUrgent ? "text-amber-400" : "text-primary"}`} />
        </div>

        {/* Name + subdomain + price */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{bundle.name}</span>
            {hasUrgent && (
              <span className="text-[10px] text-amber-400 font-medium bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5">
                Action required
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground/60 flex-wrap">
            <Globe className="w-3 h-3" />
            <span className="font-mono">{bundle.subdomain}</span>
            <span className="text-muted-foreground/30">·</span>
            <span>{skills.length} skill{skills.length !== 1 ? "s" : ""}</span>
            <span className="text-muted-foreground/30">·</span>

            {/* Inline price display / editor */}
            {editingPrice ? (
              <span className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Input
                  type="number"
                  min="0"
                  step="0.0001"
                  placeholder="0 = Free"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="h-6 w-24 font-mono text-xs bg-background border-white/20 px-2 py-0"
                  disabled={savingPrice}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleSavePrice(e as unknown as React.MouseEvent);
                    if (e.key === "Escape") handleCancelPrice(e as unknown as React.MouseEvent);
                  }}
                />
                <span className="text-muted-foreground/60">W0G</span>
                <button
                  onClick={(e) => void handleSavePrice(e)}
                  disabled={savingPrice}
                  className="text-emerald-400 hover:text-emerald-300 disabled:opacity-50 transition-colors"
                  title="Save price"
                >
                  {savingPrice
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleCancelPrice}
                  disabled={savingPrice}
                  className="text-muted-foreground/60 hover:text-foreground transition-colors"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <span className="text-muted-foreground/40 text-[10px]">blank = free</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Coins className="w-3 h-3" />
                <span className={priceLabel === "Free" ? "text-emerald-400/70" : "text-amber-400/80"}>
                  {priceLabel}{priceLabel !== "Free" ? " / invoke" : ""}
                </span>
                {isOwner && (
                  <button
                    onClick={handleEditPrice}
                    className="text-muted-foreground/30 hover:text-primary transition-colors ml-0.5"
                    title="Edit service price"
                    data-testid={`button-edit-price-${bundle.bundleId}`}
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Auth pills */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {skills.length === 0 ? (
            <span className="text-xs text-muted-foreground/50 italic">No skills added</span>
          ) : (
            <>
              <AuthPill count={active}      label="Active"          color="emerald" />
              <AuthPill count={needsReauth} label="Re-auth needed"  color="amber" />
              <AuthPill count={pending}     label="Pending"         color="muted" />
              <AuthPill count={revoked}     label="Revoked"         color="red" />
            </>
          )}
        </div>

        {/* Chevron */}
        <div className="shrink-0 ml-2 text-muted-foreground/40">
          {expanded
            ? <ChevronDown className="w-4 h-4" />
            : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-white/[0.06] px-5 pb-5 pt-4 space-y-3">
          {/* Info tip */}
          <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/15 rounded-xl text-xs text-muted-foreground leading-relaxed">
            <Info className="w-3.5 h-3.5 text-primary/60 shrink-0 mt-0.5" />
            <span>
              Authorize each Skill so agents can access it through this Bundle.{" "}
              <strong>Unclaimed</strong> skills are free to authorize.{" "}
              <strong>Claimed</strong> skills require the base price in W0G.
            </span>
          </div>

          {/* Skill rows */}
          {sortedSkills.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground/50 space-y-3">
              <ZapOff className="w-7 h-7 mx-auto opacity-30" />
              <p>No skills in this bundle yet.</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1"
                  onClick={openPicker}
                  data-testid={`button-add-skills-${bundle.bundleId}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Skills
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-xs"
                  onClick={() => setLocation(`/app/bundle/${bundle.bundleId}`)}
                >
                  Manage bundle skills
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedSkills.map((skill) => (
                <SkillRow key={`${skill.skillId}-${skill.tokenId}`} skill={skill} />
              ))}
            </div>
          )}

          {/* Inline skill picker */}
          {pickerOpen && (
            <AddSkillsPanel
              bundleId={bundle.bundleId}
              onClose={closePicker}
              onSaved={closePicker}
            />
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            {!pickerOpen && (
              <button
                onClick={openPicker}
                className="text-xs text-muted-foreground/40 hover:text-primary flex items-center gap-1 transition-colors"
                data-testid={`button-add-skills-footer-${bundle.bundleId}`}
              >
                <Plus className="w-3 h-3" />
                Add skills
              </button>
            )}
            <button
              onClick={() => setLocation(`/app/bundle/${bundle.bundleId}`)}
              className="text-xs text-muted-foreground/40 hover:text-muted-foreground flex items-center gap-1 transition-colors ml-auto"
            >
              <ExternalLink className="w-3 h-3" />
              View bundle details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Global summary bar
// ---------------------------------------------------------------------------

function SummaryBar({ active, needsReauth, pending, revoked }: {
  active: number; needsReauth: number; pending: number; revoked: number;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5 text-sm">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span className="font-mono font-semibold text-emerald-400">{active}</span>
        <span className="text-muted-foreground/60 text-xs">Active</span>
      </div>
      <span className="text-muted-foreground/20">·</span>
      <div className="flex items-center gap-1.5 text-sm">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <span className="font-mono font-semibold text-amber-400">{needsReauth}</span>
        <span className="text-muted-foreground/60 text-xs">Re-auth needed</span>
      </div>
      <span className="text-muted-foreground/20">·</span>
      <div className="flex items-center gap-1.5 text-sm">
        <Clock className="w-4 h-4 text-muted-foreground/50" />
        <span className="font-mono font-semibold text-muted-foreground">{pending}</span>
        <span className="text-muted-foreground/60 text-xs">Pending</span>
      </div>
      {revoked > 0 && (
        <>
          <span className="text-muted-foreground/20">·</span>
          <div className="flex items-center gap-1.5 text-sm">
            <RotateCcw className="w-4 h-4 text-red-400" />
            <span className="font-mono font-semibold text-red-400">{revoked}</span>
            <span className="text-muted-foreground/60 text-xs">Revoked</span>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function CuratorSkills() {
  const { address } = useAccount();
  const [, setLocation] = useLocation();

  const { data: authData, isLoading: authLoading, error: authError, refetch, isFetching } =
    useCuratorAuthorizations(address);

  const { data: bundlesData, isLoading: bundlesLoading } = useQuery({
    queryKey: ["bundles-list"],
    queryFn:  () => bundlesApi.list(),
    enabled:  !!address,
    staleTime: 30_000,
  });

  // ── Not connected ─────────────────────────────────────────────────────────
  if (!address) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Curator Dashboard</h1>
            <p className="text-muted-foreground max-w-sm">
              Connect your wallet to manage Skill authorizations for your Bundles on 0G Chain.
            </p>
          </div>
          <ConnectButton />
        </div>
      </div>
    );
  }

  const isLoading = authLoading || bundlesLoading;

  // My bundles — filtered by wallet
  const myBundles = (bundlesData?.bundles ?? []).filter(
    (b) => b.ownerAddress.toLowerCase() === address.toLowerCase()
  );

  const authorizations = authData?.authorizations ?? [];

  // Build a map: bundleId → skills in that bundle (from the authorizations list)
  const skillsByBundle = new Map<string, CuratorAuthorization[]>();
  for (const bundle of myBundles) {
    skillsByBundle.set(bundle.bundleId, []);
  }
  for (const auth of authorizations) {
    for (const bid of auth.bundleIds) {
      if (skillsByBundle.has(bid)) {
        skillsByBundle.get(bid)!.push(auth);
      }
    }
  }

  // Global counts across all bundles (deduplicated by tokenId)
  const seen = new Set<number>();
  const dedupedAuths: CuratorAuthorization[] = [];
  for (const auth of authorizations) {
    if (!seen.has(auth.tokenId)) {
      seen.add(auth.tokenId);
      dedupedAuths.push(auth);
    }
  }
  const globalActive      = dedupedAuths.filter((a) => a.status === "active").length;
  const globalNeedsReauth = dedupedAuths.filter((a) => a.status === "needs_reauth").length;
  const globalPending     = dedupedAuths.filter((a) => a.status === "pending").length;
  const globalRevoked     = dedupedAuths.filter((a) => a.status === "revoked").length;

  // Open bundles with urgent items by default
  const urgentBundleIds = new Set(
    authorizations
      .filter((a) => a.status === "needs_reauth")
      .flatMap((a) => a.bundleIds)
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Curator Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage Skill authorizations for your Bundles
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 gap-1"
              onClick={() => void refetch()}
              disabled={isFetching}
              data-testid="button-refresh-authorizations"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-accent/30 text-accent gap-1"
              onClick={() => setLocation("/app/create-bundle")}
              data-testid="button-create-bundle"
            >
              <Layers className="w-3.5 h-3.5" />
              New Bundle
            </Button>
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading your bundles…</span>
          </div>

        /* Error */
        ) : authError ? (
          <div className="text-center py-20 space-y-3">
            <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-muted-foreground text-sm">Failed to load authorizations</p>
            <Button size="sm" variant="outline" onClick={() => void refetch()}>Retry</Button>
          </div>

        /* No bundles */
        ) : myBundles.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-muted/20 border border-white/10 flex items-center justify-center mx-auto">
              <Layers className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-muted-foreground mb-1">You don't have any Bundles yet</p>
              <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto">
                Create a Bundle to start curating Skills for agents on 0G Chain.
              </p>
            </div>
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              onClick={() => setLocation("/app/create-bundle")}
              data-testid="button-create-first-bundle"
            >
              <Layers className="w-4 h-4" />
              Create a Bundle
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

        /* Bundle list */
        ) : (
          <>
            {/* Global summary + urgent alert */}
            {dedupedAuths.length > 0 && (
              <div className="mb-5">
                <SummaryBar
                  active={globalActive}
                  needsReauth={globalNeedsReauth}
                  pending={globalPending}
                  revoked={globalRevoked}
                />
              </div>
            )}

            {globalNeedsReauth > 0 && (
              <div className="mb-5 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-400">
                  <strong>
                    {globalNeedsReauth} skill{globalNeedsReauth > 1 ? "s" : ""} need re-authorization
                  </strong>
                  {" — "}
                  {authorizations.some((a) => a.status === "needs_reauth" && a.storedEpoch === -1)
                    ? "a creator updated skill content. Review and re-authorize to restore agent access."
                    : "the authorization epoch reset. Re-authorize to restore agent access."}
                </div>
              </div>
            )}

            {/* Bundle cards */}
            <div className="space-y-3">
              {myBundles.map((bundle) => (
                <BundleCard
                  key={bundle.bundleId}
                  bundle={bundle}
                  skills={skillsByBundle.get(bundle.bundleId) ?? []}
                  defaultOpen={urgentBundleIds.has(bundle.bundleId)}
                />
              ))}
            </div>

            {/* Footer note */}
            <p className="mt-8 text-xs text-muted-foreground/50 text-center">
              Authorization status is read live from 0G Chain (chainId 16661).
              On-chain events are processed every ~30 seconds by the platform event listener.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
