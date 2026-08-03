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
import {
  Wand2, DollarSign, RefreshCw, ExternalLink, Loader2,
  ChevronDown, ChevronUp, FileText, CheckCircle2, AlertTriangle,
  Zap, Github, RotateCcw,
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
  const [phase, setPhase]       = useState<UpdatePhase>("idle");
  const [errMsg, setErrMsg]     = useState("");
  const [newRootHash, setNewRootHash] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  const busy = phase !== "idle" && phase !== "done" && phase !== "error";

  const handleSync = async () => {
    setPhase("fetching");
    setErrMsg("");
    setNewRootHash(null);

    try {
      // Step 1: Backend fetches from GitHub + uploads to 0G
      setPhase("uploading"); // backend does fetch+upload atomically; show uploading after brief delay
      const sigHeader = await sign("user:update-content");
      setPhase("uploading");
      const { newRootHash: rh } = await creatorApi.updateContent(
        skill.skillId,
        { fromGithub: true },
        sigHeader,
      );
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

      // Step 3: Wait for confirmation
      setPhase("confirming");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await waitForTransactionReceipt(wagmiConfig as any, { hash: tx });

      setPhase("done");
      toast({
        title: "Content synced",
        description: `Skill #${skill.tokenId} updated from GitHub. Curators will be prompted to re-authorize.`,
      });
      onSuccess();
    } catch (err) {
      const msg = (err as Error).message ?? "Sync failed";
      setErrMsg(msg.slice(0, 160));
      setPhase("error");
      toast({ title: "Sync failed", description: msg.slice(0, 120), variant: "destructive" });
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
      {phase !== "idle" && (
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
// SkillCard
// ---------------------------------------------------------------------------

function SkillCard({ skill, onRefresh }: { skill: CreatorSkill; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState<null | "price" | "content">(null);

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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function CreatorSkills() {
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
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">

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
    </div>
  );
}
