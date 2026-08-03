/**
 * Curator authorization management panel.
 * Route: /app/curator/skills
 *
 * Shows all skills associated with the curator's bundles, with live
 * on-chain authorization status. Curators can re-authorize skills whose
 * epoch has reset (e.g. after a claim).
 */

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useLocation } from "wouter";
import {
  Shield, Wallet, AlertTriangle, CheckCircle2, Clock, RefreshCw,
  ExternalLink, Loader2, ChevronRight, Layers, RotateCcw, Info,
} from "lucide-react";
import { useCuratorAuthorizations, useAuthorizeSkill, type AuthorizePhase } from "@/hooks/use-curator";
import type { CuratorAuthorization, AuthStatus } from "@/lib/api";
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
// Single row component
// ---------------------------------------------------------------------------

function SkillRow({ skill }: { skill: CuratorAuthorization }) {
  const { toast } = useToast();
  const { state, authorize, reset } = useAuthorizeSkill();
  const [, setLocation] = useLocation();

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
        tokenId:  skill.tokenId,
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
        {skill.bundleIds.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            <Layers className="w-3 h-3 text-muted-foreground/50" />
            {skill.bundleIds.map((id) => (
              <button
                key={id}
                onClick={() => setLocation(`/app/bundle/${id}`)}
                className="text-[10px] font-mono text-muted-foreground/60 hover:text-accent transition-colors"
                data-testid={`link-bundle-${id}`}
              >
                {id.slice(0, 12)}…
              </button>
            ))}
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
// Summary cards
// ---------------------------------------------------------------------------

function SummaryCard({ count, label, className }: { count: number; label: string; className: string }) {
  return (
    <div className={`bg-card border rounded-xl p-4 text-center ${className}`}>
      <div className="text-2xl font-bold font-mono">{count}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function CuratorSkills() {
  const { address } = useAccount();
  const [, setLocation] = useLocation();
  const { data, isLoading, error, refetch, isFetching } = useCuratorAuthorizations(address);

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

  const authorizations = data?.authorizations ?? [];
  const active      = authorizations.filter((a) => a.status === "active").length;
  const needsReauth = authorizations.filter((a) => a.status === "needs_reauth").length;
  const pending     = authorizations.filter((a) => a.status === "pending").length;
  const revoked     = authorizations.filter((a) => a.status === "revoked").length;

  // Grouped
  const urgentFirst = [
    ...authorizations.filter((a) => a.status === "needs_reauth"),
    ...authorizations.filter((a) => a.status === "pending"),
    ...authorizations.filter((a) => a.status === "active"),
    ...authorizations.filter((a) => a.status === "revoked"),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Curator Skills
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Authorization status for all Skills in your Bundles
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

        {/* How it works callout */}
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl text-xs text-muted-foreground leading-relaxed">
          <div className="font-semibold text-primary mb-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> How authorization works
          </div>
          Curators must authorize each Skill NFT before agents can access it through their Bundle.
          When a Skill is <strong>unclaimed</strong> (held by the SkillNFT contract) authorization is free —
          just sign the <code className="text-primary/80">selfAuthorize</code> tx.
          When a Skill has been <strong>claimed</strong> by its creator, you pay the base price in W0G
          via <code className="text-primary/80">purchaseAuthorization</code>.
          If the creator claims the skill after you authorized it, the epoch resets and you'll need to
          re-authorize.
        </div>

        {/* Summary cards */}
        {authorizations.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <SummaryCard count={active}      label="Active"          className="border-emerald-500/20" />
            <SummaryCard count={needsReauth} label="Re-auth needed"  className="border-amber-500/20" />
            <SummaryCard count={pending}     label="Not authorized"  className="border-white/10" />
            <SummaryCard count={revoked}     label="Revoked"         className="border-red-500/20" />
          </div>
        )}

        {/* Alert banner for urgent items */}
        {needsReauth > 0 && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-400">
              <strong>{needsReauth} skill{needsReauth > 1 ? "s" : ""} need re-authorization</strong>
              {" — "}
              {authorizations.some(a => a.status === "needs_reauth" && a.storedEpoch === -1)
                ? "a creator updated skill content or the authorization epoch reset. Review the latest content and re-authorize to restore agent access."
                : "their authorization epoch reset (creator claimed or transferred ownership). Re-authorize to restore agent access."}
            </div>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading authorizations…</span>
          </div>
        ) : error ? (
          <div className="text-center py-20 space-y-3">
            <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-muted-foreground text-sm">Failed to load authorizations</p>
            <Button size="sm" variant="outline" onClick={() => void refetch()}>Retry</Button>
          </div>
        ) : urgentFirst.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Shield className="w-10 h-10 text-muted-foreground/30 mx-auto" />
            <div>
              <p className="text-muted-foreground mb-1">No Skills found for your Bundles</p>
              <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto">
                Create a Bundle and add Skills to start managing authorizations.
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
        ) : (
          <div className="space-y-2">
            {urgentFirst.map((skill) => (
              <SkillRow key={`${skill.skillId}-${skill.tokenId}`} skill={skill} />
            ))}
          </div>
        )}

        {/* Footer note */}
        {authorizations.length > 0 && (
          <p className="mt-6 text-xs text-muted-foreground/50 text-center">
            Authorization status is read live from 0G Chain (chainId 16661).
            On-chain events are processed every ~30 seconds by the platform event listener.
          </p>
        )}
      </div>
    </div>
  );
}
