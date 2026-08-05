/**
 * Creator skill management dashboard.
 * Route: /app/creator/skills
 *
 * Shows all Skill NFTs owned by the connected wallet.
 * Creators can update the invocation price and push new skill content.
 */

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SkillNFT_ABI, getAddresses } from "@workspace/abi";
import { creatorApi, type CreatorSkill } from "@/lib/api";
import { useEip712Sign } from "@/hooks/use-eip712";
import { formatUnits, parseUnits } from "viem";
import { Textarea } from "@/components/ui/textarea";
import {
  Wand2, DollarSign, RefreshCw, ExternalLink, Loader2,
  ChevronDown, ChevronUp, FileText, CheckCircle2, AlertTriangle,
  Zap, Github, RotateCcw, Pencil, Users, Coins, Info, Sparkles,
} from "lucide-react";

const SKILL_NFT_ADDRESS = getAddresses(16661).SkillNFT as `0x${string}`;
const ZEROG_SCAN = "https://chainscan.0g.ai";

// ---------------------------------------------------------------------------
// SetPricePanel
// ---------------------------------------------------------------------------

function SetPricePanel({ skill, onSuccess }: { skill: CreatorSkill; onSuccess: () => void }) {
  const { toast } = useToast();
  const [priceInput, setPriceInput] = useState(() => {
    try { return formatUnits(BigInt(skill.basePrice), 18); } catch { return "0"; }
  });

  const {
    writeContract, data: txHash, isPending: isSigning,
    error: writeError, reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (writeError) {
      toast({ title: "Set price failed", description: (writeError as Error).message.slice(0, 120), variant: "destructive" });
      reset();
    }
  }, [writeError]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isConfirmed) {
      toast({ title: "Price updated", description: `Base price set to ${priceInput} W0G` });
      onSuccess();
    }
  }, [isConfirmed]); // eslint-disable-line react-hooks/exhaustive-deps

  const busy = isSigning || isConfirming;

  const handleSet = () => {
    const v = parseFloat(priceInput);
    if (isNaN(v) || v < 0) { toast({ title: "Invalid price", variant: "destructive" }); return; }
    const wei = v === 0 ? 0n : parseUnits(priceInput, 18);
    writeContract({
      address: SKILL_NFT_ADDRESS,
      abi: SkillNFT_ABI as readonly object[],
      functionName: "setBasePrice",
      args: [BigInt(skill.tokenId), wei],
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="0"
          step="0.001"
          value={priceInput}
          onChange={e => setPriceInput(e.target.value)}
          className="w-36 bg-background border-white/10 text-sm h-8"
          placeholder="0.01"
          disabled={busy}
        />
        <span className="text-xs text-muted-foreground">W0G</span>
        <Button
          size="sm"
          disabled={busy}
          onClick={handleSet}
          className="h-8 px-3 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
          variant="outline"
          data-testid={`button-set-price-${skill.tokenId}`}
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <DollarSign className="w-3 h-3 mr-1" />}
          {isSigning ? "Confirm…" : isConfirming ? "Saving…" : "Set Price"}
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground/60">
        Set to 0 to make the skill free. Agents who already authorized continue at their price.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// UpdateContentPanel
// ---------------------------------------------------------------------------

type UpdatePhase = "idle" | "fetching" | "uploading" | "signing" | "confirming" | "done" | "error";

const PHASE_LABEL: Record<UpdatePhase, string> = {
  idle:       "Sync from GitHub",
  fetching:   "Fetching skill.md…",
  uploading:  "Uploading to 0G…",
  signing:    "Confirm in wallet…",
  confirming: "Waiting for block…",
  done:       "Synced!",
  error:      "Retry",
};

const PHASE_DETAIL: Partial<Record<UpdatePhase, string>> = {
  fetching:   "Reading latest skill.md from your GitHub repo",
  uploading:  "Uploading new content to 0G Storage",
  signing:    "Sign updateDataHash in your wallet",
  confirming: "Waiting for on-chain confirmation",
  done:       "Content updated — curators will be prompted to re-authorize",
};

function UpdateContentPanel({ skill, onSuccess }: { skill: CreatorSkill; onSuccess: () => void }) {
  const { toast } = useToast();
  const sign = useEip712Sign();
  const [phase, setPhase]         = useState<UpdatePhase>("idle");
  const [errMsg, setErrMsg]       = useState("");
  const [newRootHash, setNewRootHash] = useState<string | null>(null);
  const [privateRepo, setPrivateRepo] = useState(false);

  const { writeContractAsync } = useWriteContract();

  const busy = phase !== "idle" && phase !== "done" && phase !== "error";

  const handleSync = async () => {
    setPhase("fetching");
    setErrMsg("");
    setNewRootHash(null);
    setPrivateRepo(false);

    try {
      // Step 1: Backend fetches from GitHub + uploads to 0G
      setPhase("uploading"); // backend does fetch+upload atomically; show uploading after brief delay
      const sigHeader = await sign("user:update-content");
      setPhase("uploading");
      const result = await creatorApi.updateContent(
        skill.skillId,
        { fromGithub: true },
        sigHeader,
      );

      // If content hasn't changed, skip the on-chain step entirely
      if (result.noChange) {
        const existingHash = result.rootHash ?? "";
        setNewRootHash(existingHash || null);
        setPhase("done");
        toast({
          title: "Already up to date",
          description: "The content on 0G matches your GitHub repo — no on-chain update needed.",
        });
        onSuccess();
        return;
      }

      const rh = result.newRootHash!;
      setNewRootHash(rh);

      // Step 2: Call updateDataHash on-chain
      setPhase("signing");
      const hashBytes32 = rh.startsWith("0x") ? rh as `0x${string}` : `0x${rh}` as `0x${string}`;
      const tx = await writeContractAsync({
        address: SKILL_NFT_ADDRESS,
        abi: SkillNFT_ABI as readonly object[],
        functionName: "updateDataHash",
        args: [BigInt(skill.tokenId), hashBytes32, 0n],
      });

      // Step 3: Wait for confirmation (0G Chain can be slow — use 120 s timeout)
      setPhase("confirming");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await waitForTransactionReceipt(wagmiConfig as any, { hash: tx, timeout: 120_000 });

      setPhase("done");
      toast({
        title: "Content synced",
        description: `Skill #${skill.tokenId} updated from GitHub. Curators will be prompted to re-authorize.`,
      });
      onSuccess();
    } catch (err) {
      const msg = (err as Error).message ?? "Sync failed";
      const isPrivate = (err as Error & { possiblyPrivate?: boolean }).possiblyPrivate === true;
      setErrMsg(msg.slice(0, 160));
      setPhase("error");
      setPrivateRepo(isPrivate);
      if (!isPrivate) {
        toast({ title: "Sync failed", description: msg.slice(0, 120), variant: "destructive" });
      }
    }
  };

  const repoDisplay = skill.repoUrl.replace(/^https?:\/\/github\.com\//, "");
  const githubUrl   = skill.repoUrl.startsWith("http")
    ? skill.repoUrl
    : `https://github.com/${skill.repoUrl}`;

  return (
    <div className="space-y-3">
      {/* Source info */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
        <Github className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
        <span className="text-xs font-mono text-muted-foreground/80 flex-1 truncate">{repoDisplay}</span>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          title="Open on GitHub"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Phase progress (while active or done) */}
      {phase !== "idle" && !privateRepo && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
          phase === "done"
            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
            : phase === "error"
            ? "bg-destructive/10 border border-destructive/20 text-destructive"
            : "bg-primary/5 border border-primary/15 text-muted-foreground"
        }`}>
          {phase === "done" ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          ) : phase === "error" ? (
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          )}
          <span>{phase === "error" ? errMsg : (PHASE_DETAIL[phase] ?? PHASE_LABEL[phase])}</span>
          {newRootHash && phase === "done" && (
            <span className="ml-auto font-mono text-[10px] text-emerald-400/60 truncate max-w-[140px]">
              {newRootHash.slice(0, 18)}…
            </span>
          )}
        </div>
      )}

      {/* Private-repo banner */}
      {privateRepo && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
          <div className="flex-1">
            <span className="font-medium">This repo appears to be private.</span>
            <span className="text-amber-400/70 ml-1">Grant GitHub access so SkillFun can read it.</span>
          </div>
          <a
            href={`/api/auth/github?scope=repo&return_to=${encodeURIComponent(window.location.pathname)}`}
            className="shrink-0 font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-2 whitespace-nowrap"
          >
            Grant access →
          </a>
        </div>
      )}

      {/* Action button */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          disabled={busy}
          onClick={handleSync}
          className="h-8 px-3 text-xs bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
          variant="outline"
          data-testid={`button-update-content-${skill.tokenId}`}
        >
          {busy ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : phase === "done" ? (
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
          ) : phase === "error" ? (
            <RotateCcw className="w-3 h-3 mr-1" />
          ) : (
            <Github className="w-3 h-3 mr-1" />
          )}
          {PHASE_LABEL[phase]}
        </Button>
        {phase === "idle" && (
          <span className="text-[10px] text-muted-foreground/50">
            Fetches the latest <code className="text-primary/70">skill.md</code> from your repo
          </span>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
        Reads <code className="text-primary/60">skill.md</code> from GitHub, uploads to 0G Storage, and records the new hash on-chain.
        Existing curator authorizations will be flagged for re-review.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EditMetaPanel — edit name/description/instructions (tags & capabilities are AI-managed)
// ---------------------------------------------------------------------------

function EditMetaPanel({ skill, onSuccess }: { skill: CreatorSkill; onSuccess: () => void }) {
  const { toast } = useToast();
  const sign = useEip712Sign();

  const m = skill.meta as Record<string, unknown>;

  // Editable fields — tags and capabilities intentionally excluded (AI-managed)
  const [fields, setFields] = useState({
    name:         (m.name         as string) ?? skill.skillName ?? "",
    description:  (m.description  as string) ?? "",
    instructions: (m.instructions as string) ?? "",
  });
  const [saving,      setSaving]      = useState(false);
  const [aiStatus,    setAiStatus]    = useState<"idle" | "loading" | "done" | "error">("idle");

  // Live-update AI-managed fields after re-analyze without refreshing the whole page
  const [aiTags,         setAiTags]         = useState<string[] | null>(null);
  const [aiCapabilities, setAiCapabilities] = useState<string[] | null>(null);

  const currentTags:   string[] = aiTags         ?? (Array.isArray(m.tags)         ? (m.tags         as string[]) : []);
  const currentCaps:   string[] = aiCapabilities ?? (Array.isArray(m.capabilities) ? (m.capabilities as string[]) : []);

  const set = (k: keyof typeof fields, v: string) =>
    setFields(s => ({ ...s, [k]: v }));

  const handleSave = async () => {
    if (!fields.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      const sigHeader = await sign("update-skill");
      const newMeta: Record<string, unknown> = {
        ...m,                               // preserves AI-managed tags & capabilities
        name:         fields.name.trim(),
        description:  fields.description.trim(),
        instructions: fields.instructions.trim(),
      };
      await creatorApi.updateMeta(skill.skillId, newMeta, sigHeader);
      toast({ title: "Info updated", description: "Skill metadata saved." });
      onSuccess();
    } catch (err) {
      toast({
        title: "Save failed",
        description: (err as Error).message?.slice(0, 140) ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAiReAnalyze = async () => {
    setAiStatus("loading");
    try {
      const sigHeader = await sign("update-skill");
      const result = await creatorApi.aiReAnalyze(skill.skillId, sigHeader);
      setAiTags(result.tags);
      setAiCapabilities(result.capabilities);
      setAiStatus("done");
      toast({
        title: "AI analysis complete",
        description: `${result.tags.length} tags · ${result.capabilities.length} capabilities updated.`,
      });
      onSuccess(); // refresh parent to show updated meta
    } catch (err) {
      setAiStatus("error");
      toast({
        title: "AI re-analyze failed",
        description: (err as Error).message?.slice(0, 140) ?? "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Name */}
      <div className="space-y-1">
        <label className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">Name</label>
        <Input
          value={fields.name}
          onChange={e => set("name", e.target.value)}
          placeholder="Skill name"
          className="h-8 text-xs bg-white/5 border-white/10"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">Description</label>
        <Textarea
          value={fields.description}
          onChange={e => set("description", e.target.value)}
          placeholder="What this skill does"
          rows={3}
          className="text-xs bg-white/5 border-white/10 resize-none"
        />
      </div>

      {/* Instructions for Agents */}
      <div className="space-y-1">
        <label className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">Instructions for Agents</label>
        <Textarea
          value={fields.instructions}
          onChange={e => set("instructions", e.target.value)}
          placeholder="How an agent should invoke this skill"
          rows={2}
          className="text-xs bg-white/5 border-white/10 resize-none"
        />
      </div>

      <Button
        size="sm"
        onClick={handleSave}
        disabled={saving}
        className="h-8 px-4 text-xs"
      >
        {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
        {saving ? "Saving…" : "Save Changes"}
      </Button>

      <p className="text-[10px] text-muted-foreground/40 leading-relaxed">
        Updates the off-chain record only — no gas required. Curators and agents will see the new info immediately.
      </p>

      {/* ── AI-managed section: Tags + Capabilities ───────────────────────────── */}
      <div className="mt-4 pt-3 border-t border-white/8 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-violet-400" /> AI-Managed Fields
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAiReAnalyze}
            disabled={aiStatus === "loading"}
            className={`h-6 px-2 text-[10px] gap-1 transition-colors ${
              aiStatus === "done"
                ? "border-violet-500/40 text-violet-300 bg-violet-500/10"
                : aiStatus === "error"
                ? "border-red-500/30 text-red-400"
                : "border-white/10 text-muted-foreground hover:text-violet-300"
            }`}
          >
            {aiStatus === "loading"
              ? <><Loader2 className="w-2.5 h-2.5 animate-spin" /> Analyzing…</>
              : <><Sparkles className="w-2.5 h-2.5" /> Re-analyze with AI</>}
          </Button>
        </div>

        {/* Capabilities (read-only) */}
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground/50 uppercase tracking-wide">Capabilities</label>
          {currentCaps.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 p-2 bg-white/4 border border-white/8 rounded-lg min-h-[34px] items-center">
              {currentCaps.map(cap => (
                <code key={cap} className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] text-primary">
                  {cap}
                </code>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-white/4 border border-dashed border-white/8 rounded-lg min-h-[34px] text-[10px] text-muted-foreground/30">
              <Sparkles className="w-3 h-3" /> Click "Re-analyze with AI" to generate
            </div>
          )}
        </div>

        {/* Tags (read-only) */}
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground/50 uppercase tracking-wide">Tags</label>
          {currentTags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 p-2 bg-white/4 border border-white/8 rounded-lg min-h-[34px] items-center">
              {currentTags.map(tag => (
                <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-300">
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-white/4 border border-dashed border-white/8 rounded-lg min-h-[34px] text-[10px] text-muted-foreground/30">
              <Sparkles className="w-3 h-3" /> Click "Re-analyze with AI" to generate
            </div>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground/30 leading-relaxed flex items-start gap-1">
          <Info className="w-3 h-3 shrink-0 mt-0.5" />
          Tags and capabilities are AI-generated and cannot be edited manually. Use "Re-analyze" after a content sync to refresh them.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CuratorsPanel — shows who authorized this skill + estimated auth-fee revenue
// ---------------------------------------------------------------------------

function CuratorsPanel({ skill }: { skill: CreatorSkill }) {
  const { data, isLoading, error } = useQuery({
    queryKey:  ["skill-authorizations", skill.skillId],
    queryFn:   () => creatorApi.listAuthorizations(skill.skillId),
    staleTime: 60_000,
  });

  const maskWallet = (w: string) =>
    w.length >= 10 ? `${w.slice(0, 6)}…${w.slice(-4)}` : w;

  const estimatedRevenueW0G = (() => {
    if (!data || data.activeCount === 0) return null;
    try {
      const price = Number(BigInt(skill.basePrice)) / 1e18;
      return price > 0 ? (data.activeCount * price).toFixed(4) : null;
    } catch { return null; }
  })();

  if (isLoading) return (
    <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading authorizations…
    </div>
  );

  if (error || !data) return (
    <p className="text-xs text-destructive py-2">Failed to load authorizations.</p>
  );

  return (
    <div className="space-y-3">
      {/* Summary chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
          <CheckCircle2 className="w-3 h-3" /> {data.activeCount} Active
        </span>
        {data.revokedCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-medium text-red-400">
            {data.revokedCount} Revoked
          </span>
        )}
        {estimatedRevenueW0G && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
            <Coins className="w-3 h-3" /> ~{estimatedRevenueW0G} W0G auth fees
          </span>
        )}
      </div>

      {data.curators.length === 0 ? (
        <p className="text-xs text-muted-foreground/50 py-1">
          No curators have authorized this skill yet.
        </p>
      ) : (
        <div className="divide-y divide-white/5 rounded-lg border border-white/8 overflow-hidden">
          {data.curators.map((c) => (
            <div key={c.curatorWallet}
              className="flex items-center justify-between px-3 py-2 text-xs hover:bg-white/[0.03] transition-colors"
            >
              <span className="font-mono text-muted-foreground/80">{maskWallet(c.curatorWallet)}</span>
              <div className="flex items-center gap-2">
                {c.isActive ? (
                  <span className="text-emerald-400 text-[10px]">Active</span>
                ) : (
                  <span className="text-red-400/70 text-[10px]">Revoked</span>
                )}
                {c.authorizedAt && (
                  <span className="text-muted-foreground/40 text-[10px]">
                    {new Date(c.authorizedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/30 leading-relaxed flex items-center gap-1">
        <Info className="w-3 h-3 shrink-0" />
        Auth fee estimate = active curators × current base price. Actual fees paid may differ if the price changed.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SkillCard
// ---------------------------------------------------------------------------

function SkillCard({ skill, onRefresh }: { skill: CreatorSkill; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState<null | "price" | "content" | "edit" | "curators">(null);

  const basePriceDisplay = (() => {
    try {
      const wei = BigInt(skill.basePrice);
      if (wei === 0n) return <span className="text-emerald-400">Free</span>;
      return <span>{formatUnits(wei, 18)} W0G</span>;
    } catch { return <span className="text-muted-foreground">—</span>; }
  })();

  return (
    <div className="bg-card border border-white/10 rounded-xl overflow-hidden">
      {/* Header row */}
      <div className="p-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm">{skill.skillName}</span>
            <span className="text-xs font-mono text-muted-foreground/60">#{skill.tokenId}</span>
            {skill.isClaimed ? (
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">Claimed</Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">Unclaimed</Badge>
            )}
            <Badge variant="outline" className="text-[10px] border-white/20 text-muted-foreground">
              v{skill.contentVersion}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span className="font-mono">{skill.repoUrl}</span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {basePriceDisplay}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className={`h-7 px-2 text-xs gap-1 border transition-colors ${
              expanded === "price"
                ? "border-amber-500/40 text-amber-300 bg-amber-500/10"
                : "border-white/10 text-muted-foreground hover:text-amber-300"
            }`}
            onClick={() => setExpanded(expanded === "price" ? null : "price")}
            data-testid={`button-expand-price-${skill.tokenId}`}
          >
            <DollarSign className="w-3 h-3" />
            Price
            {expanded === "price" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`h-7 px-2 text-xs gap-1 border transition-colors ${
              expanded === "content"
                ? "border-primary/40 text-primary bg-primary/10"
                : "border-white/10 text-muted-foreground hover:text-primary"
            }`}
            onClick={() => setExpanded(expanded === "content" ? null : "content")}
            data-testid={`button-expand-content-${skill.tokenId}`}
          >
            <FileText className="w-3 h-3" />
            Content
            {expanded === "content" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`h-7 px-2 text-xs gap-1 border transition-colors ${
              expanded === "edit"
                ? "border-violet-500/40 text-violet-300 bg-violet-500/10"
                : "border-white/10 text-muted-foreground hover:text-violet-300"
            }`}
            onClick={() => setExpanded(expanded === "edit" ? null : "edit")}
            data-testid={`button-expand-edit-${skill.tokenId}`}
          >
            <Pencil className="w-3 h-3" />
            Edit
            {expanded === "edit" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`h-7 px-2 text-xs gap-1 border transition-colors ${
              expanded === "curators"
                ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                : "border-white/10 text-muted-foreground hover:text-emerald-300"
            }`}
            onClick={() => setExpanded(expanded === "curators" ? null : "curators")}
            data-testid={`button-expand-curators-${skill.tokenId}`}
          >
            <Users className="w-3 h-3" />
            Curators
            {expanded === "curators" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
          <a
            href={`${ZEROG_SCAN}/nft/${SKILL_NFT_ADDRESS}/${skill.tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-7 px-2 flex items-center text-[10px] text-muted-foreground/40 hover:text-muted-foreground gap-1 border border-white/5 rounded-md"
            data-testid={`link-scan-${skill.tokenId}`}
          >
            <ExternalLink className="w-2.5 h-2.5" /> Scan
          </a>
        </div>
      </div>

      {/* Expanded: Set Price */}
      {expanded === "price" && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3">
          <p className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-amber-400" /> Set Invocation Price
          </p>
          <SetPricePanel skill={skill} onSuccess={() => { setExpanded(null); onRefresh(); }} />
        </div>
      )}

      {/* Expanded: Update Content */}
      {expanded === "content" && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3">
          <p className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1">
            <FileText className="w-3 h-3 text-primary" /> Update Skill Content (skill.md)
          </p>
          <UpdateContentPanel skill={skill} onSuccess={() => { setExpanded(null); onRefresh(); }} />
        </div>
      )}

      {/* Expanded: Edit Info */}
      {expanded === "edit" && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3">
          <p className="text-xs text-muted-foreground mb-3 font-medium flex items-center gap-1">
            <Pencil className="w-3 h-3 text-violet-400" /> Edit Skill Info
          </p>
          <EditMetaPanel skill={skill} onSuccess={() => { setExpanded(null); onRefresh(); }} />
        </div>
      )}

      {/* Expanded: Curators */}
      {expanded === "curators" && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3">
          <p className="text-xs text-muted-foreground mb-3 font-medium flex items-center gap-1">
            <Users className="w-3 h-3 text-emerald-400" /> Authorized Curators
          </p>
          <CuratorsPanel skill={skill} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function CreatorSkills({ asPanel = false }: { asPanel?: boolean }) {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["creator-skills", address?.toLowerCase()],
    queryFn:  () => creatorApi.listOwned(address!),
    enabled:  !!address,
    staleTime: 20_000,
  });

  const skills = data?.skills ?? [];

  if (!address) {
    const inner = (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Wand2 className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Creator Dashboard</h1>
          <p className="text-muted-foreground max-w-sm">
            Connect your wallet to manage your Skill NFTs on 0G Chain.
          </p>
        </div>
        <ConnectButton />
      </div>
    );
    if (asPanel) return inner;
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        {inner}
      </div>
    );
  }

  const content = (
    <div className="max-w-4xl mx-auto px-4 pb-16" style={{ paddingTop: asPanel ? "1.5rem" : "6rem" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-primary" />
              Creator Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage the Skill NFTs in your wallet — update pricing and content
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-white/20 gap-1"
            onClick={() => void refetch()}
            disabled={isFetching}
            data-testid="button-refresh-creator"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        {skills.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-card border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold font-mono">{skills.length}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Owned Skills</div>
            </div>
            <div className="bg-card border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {skills.filter(s => s.isClaimed).length}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Claimed</div>
            </div>
            <div className="bg-card border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold font-mono text-blue-400">
                {skills.filter(s => !s.isClaimed).length}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Unclaimed</div>
            </div>
          </div>
        )}

        {/* Info callout */}
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl text-xs text-muted-foreground leading-relaxed">
          <div className="font-semibold text-primary mb-1 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Creator actions
          </div>
          <strong>Set Price</strong> — change the W0G agents pay per invocation via <code className="text-primary/80">setBasePrice</code>.{" "}
          <strong>Update Content</strong> — push a new <code className="text-primary/80">skill.md</code> to 0G Storage and record the new hash on-chain via <code className="text-primary/80">updateDataHash</code>.
          Content updates prompt existing curators to re-review and re-authorize.
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading your Skill NFTs…</span>
          </div>
        ) : error ? (
          <div className="text-center py-20 space-y-3">
            <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-muted-foreground text-sm">Failed to load skills</p>
            <Button size="sm" variant="outline" onClick={() => void refetch()}>Retry</Button>
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Wand2 className="w-10 h-10 text-muted-foreground/30 mx-auto" />
            <div>
              <p className="text-muted-foreground mb-1">No Skill NFTs in this wallet</p>
              <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto">
                Mint a Skill iNFT to start. Once minted and confirmed, it will appear here.
              </p>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              onClick={() => window.location.href = "/app/create"}
            >
              <Zap className="w-4 h-4" /> Mint a Skill
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {skills.map(skill => (
              <SkillCard
                key={skill.skillId}
                skill={skill}
                onRefresh={() => void refetch()}
              />
            ))}
          </div>
        )}

        {skills.length > 0 && (
          <p className="mt-6 text-xs text-muted-foreground/50 text-center">
            Ownership is read live from 0G Chain (chainId 16661). Only NFTs held by your wallet are shown.
          </p>
        )}
      </div>
  );

  if (asPanel) return content;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      {content}
    </div>
  );
}
