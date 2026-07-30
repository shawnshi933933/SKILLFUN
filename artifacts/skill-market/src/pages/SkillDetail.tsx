import { useRoute, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { useSkill, useChainOracle, useSkillStats } from "@/hooks/use-skills";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot, Lock, Shield, Clock, ArrowLeft, Hash, Zap,
  ExternalLink, Loader2, AlertCircle, CheckCircle2,
  Github, Database, FileCode2, Download, KeyRound, RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { useEip712Sign } from "@/hooks/use-eip712";
import { type DbSkill } from "@/lib/api";

const EXPLORER      = "https://chainscan.0g.ai";
const SKILL_NFT_ADDR = "0x36cc7DBE8d2d3C0B44223e60CE94912ED8e11D72"; // v5

function getMeta(skill: DbSkill, key: string, fallback: unknown) {
  return (skill.meta as Record<string, unknown>)[key] ?? fallback;
}

export default function SkillDetail() {
  const [, params] = useRoute("/app/skill/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();


  const [fetchingContent, setFetchingContent] = useState(false);
  const [skillContent, setSkillContent] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    finalized: boolean; txSeq: number; size: number; verifiedOnNode: string; note: string;
  } | null>(null);

  const { address: connectedAddress } = useAccount();
  const sign = useEip712Sign();

  const { data, isLoading, error } = useSkill(params?.id);

  // Also fetch on-chain oracle status if we have a tokenId
  const tokenId = data?.skill?.tokenId ?? null;
  const { data: oracleData } = useChainOracle(tokenId);

  // Live proof stats (public — invocations count + W0G earned)
  const {
    data: statsData,
    refetch: refetchStats,
    isFetching: statsRefetching,
    dataUpdatedAt: statsUpdatedAt,
  } = useSkillStats(params?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data?.skill) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <div className="text-muted-foreground">{error ? "Failed to load skill" : "Skill not found"}</div>
          <Button onClick={() => setLocation("/app/market")}>Back to Market</Button>
        </div>
      </div>
    );
  }

  const { skill, onChain } = data;
  const meta = skill.meta as Record<string, unknown>;

  const name        = (meta.name as string | undefined) ?? skill.repoUrl.split("/").pop() ?? skill.skillId;
  const description = (meta.description as string | undefined) ?? `Registered from ${skill.repoUrl}`;
  const category    = (meta.category as string | undefined) ?? "Code";
  const version     = (meta.version as string | undefined) ?? "1.0.0";
  // Prefer chain-read basePrice (from stats); fall back to meta until stats load
  const basePrice = statsData?.basePriceWei != null
    ? Number(BigInt(statsData.basePriceWei)) / 1e18
    : ((meta.basePrice as number | undefined) ?? 0);
  const creatorShare = (meta.creatorShare as number | undefined) ?? 80;
  const ownerShare   = (meta.ownerShare as number | undefined) ?? 10;
  const royaltyRate  = (meta.royaltyRate as number | undefined) ?? 5;
  // Live stats are the sole source of truth — no static meta fallback
  const invocations  = statsData?.invocations ?? 0;
  const revenueW0G   = statsData?.revenueW0G ?? 0;

  const isMinted  = skill.mintStatus === "minted" || skill.mintStatus === "claimed";
  const isClaimed = skill.mintStatus === "claimed";

  const handleVerify = async () => {
    if (!data?.skill?.skillId) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch(`/api/skills/${data.skill.skillId}/verify`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Verification failed");
      setVerifyResult(json);
      toast({ title: json.finalized ? "✅ Verified on 0G Storage" : "⚠️ File found but not finalized", description: `txSeq: ${json.txSeq} · ${json.size} bytes` });
    } catch (err) {
      toast({ title: "Verification failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  const handleFetchContent = async () => {
    if (!data?.skill?.skillId) return;
    if (!connectedAddress) {
      toast({ title: "Wallet required", description: "Connect your wallet to decrypt skill content (NFT ownership check)", variant: "destructive" });
      return;
    }
    setFetchingContent(true);
    setSkillContent(null);
    try {
      // Sign proves wallet ownership — backend verifies you hold the NFT
      const sigHeader = await sign("fetch-skill-content");
      const res = await fetch(`/api/skills/${data.skill.skillId}/content`, {
        headers: { "X-Wallet-Signature": sigHeader },
      });
      const json = await res.json();
      if (!res.ok) {
        // API error shape: { error: { code: string, message: string } }
        const errMsg = (json.error as { message?: string })?.message
          ?? (typeof json.error === "string" ? json.error : null)
          ?? json.message
          ?? "Failed";
        throw new Error(errMsg);
      }
      setSkillContent(json.content as string);
      toast({ title: "Content decrypted ✅", description: `${(json.content as string).length} bytes fetched from 0G Storage` });
    } catch (err) {
      const msg = (err as Error).message ?? "";
      const isOwnershipError =
        msg.includes("Access denied") ||
        msg.includes("UNAUTHORIZED") ||
        msg.includes("own this Skill NFT") ||
        msg.includes("Missing X-Wallet-Signature");
      toast({
        title: isOwnershipError ? "🔒 Not the NFT owner — access denied" : "Fetch failed",
        description: isOwnershipError
          ? "Only the wallet holding this Skill NFT can decrypt its content. Make sure you're connected with the correct address."
          : msg,
        variant: "destructive",
      });
    } finally {
      setFetchingContent(false);
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <button
          onClick={() => setLocation("/app/market")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors"
          data-testid="button-back-market"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Market
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left — Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline" className="border-primary/30 text-primary">{category}</Badge>
                <Badge variant="outline" className="border-white/20 text-muted-foreground">v{version}</Badge>
                {isMinted && (
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    On-Chain
                  </Badge>
                )}
                {isClaimed && (
                  <Badge variant="outline" className="border-accent/40 text-accent gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Claimed
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-2">{name}</h1>
              <p className="text-muted-foreground mb-3">{description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <Hash className="w-3.5 h-3.5" />
                <span>{skill.skillId}</span>
                {skill.tokenId != null && (
                  <>
                    <span className="text-white/20">·</span>
                    <span>Token #{skill.tokenId}</span>
                    <a
                      href={`${EXPLORER}/nft/${SKILL_NFT_ADDR}/${skill.tokenId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {statsUpdatedAt > 0
                    ? <>Updated <span className="tabular-nums">{new Date(statsUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span></>
                    : "Live stats"}
                </span>
                <button
                  onClick={() => refetchStats()}
                  disabled={statsRefetching}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  title="Refresh stats"
                >
                  <RefreshCw className={`w-3 h-3 ${statsRefetching ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Base Price",   value: basePrice > 0 ? `${basePrice} W0G` : "Free" },
                  { label: "Invocations",  value: invocations.toLocaleString() },
                  { label: "W0G Earned",   value: revenueW0G > 0 ? `${revenueW0G.toFixed(4)}` : "—" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card border border-white/10 rounded-xl p-3">
                    <div className="text-xs text-muted-foreground mb-0.5">{stat.label}</div>
                    <div className="font-mono font-semibold text-sm">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="activity">
              <TabsList className="bg-card border border-white/10">
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="chain">On-Chain</TabsTrigger>
                <TabsTrigger value="meta">Metadata</TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="mt-4">
                <div className="space-y-3">
                  {/* Live aggregate stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card border border-white/10 rounded-xl p-3">
                      <div className="text-xs text-muted-foreground mb-0.5">Total Invocations</div>
                      <div className="font-mono font-semibold text-lg">{invocations.toLocaleString()}</div>
                    </div>
                    <div className="bg-card border border-white/10 rounded-xl p-3">
                      <div className="text-xs text-muted-foreground mb-0.5">W0G Earned</div>
                      <div className="font-mono font-semibold text-lg text-emerald-400">
                        {revenueW0G > 0 ? `${revenueW0G.toFixed(4)}` : "—"}
                      </div>
                    </div>
                  </div>

                  {invocations === 0 ? (
                    <div className="text-center py-6 space-y-2">
                      <Bot className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                      <p className="text-sm text-muted-foreground">No agent invocations yet</p>
                      <p className="text-xs text-muted-foreground/60">
                        Live x402 proof issuances will appear here once agents start invoking this skill
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center pt-1">
                      Counts reflect on-chain verified proof issuances via x402 MCP
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="chain" className="mt-4">
                <div className="space-y-3 font-mono text-xs">
                  {onChain ? (
                    <>
                      <Row label="Token ID" value={String(onChain.tokenId)} />
                      <Row label="On-Chain Owner" value={onChain.owner ?? "Self-Custody (Contract)"} mono />
                      <Row label="Manifest Owner" value={String(onChain.manifestOwner)} mono />
                      <Row label="iNFT Data Slots" value={String(onChain.intelligentData?.length ?? 0)} />
                      {oracleData && (
                        <Row
                          label="Oracle Verified Owner"
                          value={oracleData.verifiedOwner === "0x0000000000000000000000000000000000000000"
                            ? "Not set"
                            : oracleData.verifiedOwner}
                          mono
                        />
                      )}
                    </>
                  ) : (
                    <div className="text-muted-foreground text-center py-6">
                      {skill.mintStatus === "pending"
                        ? "Not yet minted on-chain."
                        : "Chain data unavailable."}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="meta" className="mt-4 space-y-3 text-xs">
                {/* GitHub */}
                <div className="bg-card border border-white/10 rounded-xl px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium mb-1">
                    <Github className="w-3.5 h-3.5" /> GitHub
                  </div>
                  <LinkRow label="Repository" href={`https://github.com/${skill.repoUrl}`} text={skill.repoUrl} />
                  <CopyRow  label="Manifest Owner" value={skill.manifestOwner} mono />
                </div>

                {/* 0G Storage */}
                <div className="bg-card border border-white/10 rounded-xl px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <Database className="w-3.5 h-3.5" /> 0G Storage
                    </div>
                    {skill.rootHash && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5">
                        <KeyRound className="w-2.5 h-2.5" /> AES-256-GCM
                      </div>
                    )}
                  </div>

                  {skill.rootHash ? (
                    <>
                      {/* Storage pointer — what the NFT actually stores */}
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-muted-foreground shrink-0">Storage Pointer</span>
                        <span className="font-mono text-primary text-right break-all">
                          0g://{skill.rootHash.slice(0, 18)}…
                        </span>
                      </div>
                      <CopyRow label="Root Hash" value={skill.rootHash} mono />
                      {/* txSeq — direct node verification reference */}
                      {(() => {
                        const m = skill.meta as Record<string, unknown>;
                        const txSeq = verifyResult?.txSeq ?? (m?.storeTxSeq as number | undefined);
                        return txSeq != null ? (
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-muted-foreground shrink-0">Flow txSeq</span>
                            <span className="font-mono text-foreground">#{txSeq}</span>
                          </div>
                        ) : null;
                      })()}

                      {/* Verify on node button — authoritative check (not StorageScan) */}
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-[10px] text-muted-foreground mb-2">
                          StorageScan cannot index direct-node uploads. Use node RPC to verify.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 border-white/20 text-xs h-8 mb-2"
                          onClick={handleVerify}
                          disabled={verifying}
                        >
                          {verifying
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Shield className="w-3 h-3" />}
                          {verifying ? "Querying node…" : "Verify on Storage Node"}
                        </Button>
                        {verifyResult && (
                          <div className="text-[10px] font-mono space-y-1 p-2 rounded bg-emerald-500/5 border border-emerald-500/20">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Status</span>
                              <span className={verifyResult.finalized ? "text-emerald-400" : "text-orange-400"}>
                                {verifyResult.finalized ? "✅ Finalized" : "⏳ Pending"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">txSeq</span>
                              <span>#{verifyResult.txSeq}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Size</span>
                              <span>{verifyResult.size} bytes</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="text-muted-foreground shrink-0">Node</span>
                              <span className="truncate text-right">{verifyResult.verifiedOnNode}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Fetch + decrypt button */}
                      <div className="pt-2 border-t border-white/10">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 border-white/20 text-xs h-8"
                          onClick={handleFetchContent}
                          disabled={fetchingContent}
                        >
                          {fetchingContent
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Download className="w-3 h-3" />}
                          {fetchingContent ? "Decrypting…" : "Fetch & Decrypt Content"}
                        </Button>
                        {skillContent && (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
                              <span>{skillContent.length.toLocaleString()} bytes decrypted</span>
                              <button
                                className="hover:text-foreground transition-colors"
                                onClick={() => {
                                  navigator.clipboard.writeText(skillContent);
                                  toast({ title: "Copied to clipboard" });
                                }}
                              >
                                Copy ↗
                              </button>
                            </div>
                            <pre className="p-3 rounded-lg bg-black/40 text-xs font-mono overflow-auto max-h-96 text-muted-foreground whitespace-pre-wrap break-words border border-white/10">
                              {skillContent}
                            </pre>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground italic">Not yet uploaded to 0G Storage</div>
                  )}
                </div>

                {/* Capabilities & Tags */}
                {(meta.capabilities || meta.tags) && (
                  <div className="bg-card border border-white/10 rounded-xl px-4 py-3 space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground font-medium mb-1">
                      <FileCode2 className="w-3.5 h-3.5" /> Skill Details
                    </div>
                    {meta.capabilities && (
                      <div className="flex flex-wrap gap-1.5">
                        {(meta.capabilities as string[]).map((c) => (
                          <span key={c} className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary font-mono">{c}</span>
                        ))}
                      </div>
                    )}
                    {meta.tags && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(meta.tags as string[]).map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    )}
                    {meta.instructions && (
                      <p className="text-muted-foreground pt-2 border-t border-white/10 leading-relaxed">{meta.instructions as string}</p>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right — Action panel */}
          <div className="space-y-4">
            {/* Access card */}
            <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Base Price</div>
                  <div className="text-2xl font-bold font-mono">
                    {basePrice > 0 ? `${basePrice} W0G` : <span className="text-emerald-400">Free</span>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {basePrice > 0 ? "per Curator authorization" : "Curators authorize for free"}
                  </div>
                </div>
                <Badge className={`${isMinted ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-white/5 text-muted-foreground border-white/10"} border`}>
                  {skill.mintStatus}
                </Badge>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-xs text-muted-foreground leading-relaxed">
                <div className="font-medium text-primary mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Agent Access via x402
                </div>
                Agents invoke this skill through a Curator's MCP Bundle endpoint.
                Curators {basePrice > 0 ? `pay ${basePrice} W0G to authorize, then` : "authorize for free and"} earn revenue on every agent invocation.
              </div>

              {!isMinted && (
                <p className="text-xs text-muted-foreground text-center">
                  This skill is pending on-chain registration
                </p>
              )}
            </div>

            {/* Revenue model */}
            <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="text-xs text-muted-foreground">Revenue Model</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-accent/60" />
                  <span className="text-muted-foreground">Authorization fee</span>
                </div>
                <span className="font-mono font-medium text-accent">100% → Owner</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-primary/60" />
                  <span className="text-muted-foreground">Per-invocation (x402)</span>
                </div>
                <span className="font-mono font-medium text-primary">100% → Curator</span>
              </div>
              <p className="text-xs text-muted-foreground/60 pt-1 border-t border-white/10 leading-relaxed">
                Curators pay <span className="text-foreground font-mono">{basePrice > 0 ? `${basePrice} W0G` : "0 W0G"}</span> to authorize, then keep all agent invocation fees.
              </p>
            </div>

            {/* Security */}
            <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="text-xs text-muted-foreground">Security Status</div>
              <SecurityRow icon={<Lock className="w-4 h-4 text-primary" />} label="ERC-7857 iNFT Standard" />
              <SecurityRow icon={<Shield className="w-4 h-4 text-emerald-400" />} label="0G Chain Mainnet" />
              {skill.rootHash && (
                <SecurityRow icon={<Lock className="w-4 h-4 text-emerald-400" />} label="Content Hash Locked" />
              )}
              {!isMinted && (
                <SecurityRow icon={<Clock className="w-4 h-4 text-orange-400" />} label="Awaiting Mint" orange />
              )}
              {skill.rootHash && (
                <div className="text-xs font-mono text-muted-foreground pt-1 border-t border-white/10 break-all">
                  {skill.rootHash.slice(0, 24)}…
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkRow({ label, href, text }: { label: string; href: string; text: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <a href={href} target="_blank" rel="noreferrer"
         className="text-primary hover:underline font-mono break-all flex items-center gap-1 text-right">
        {text}<ExternalLink className="w-3 h-3 shrink-0" />
      </a>
    </div>
  );
}

function CopyRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const { toast } = useToast();
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <button
        className={`text-right break-all hover:text-foreground transition-colors ${mono ? "font-mono" : ""}`}
        onClick={() => { navigator.clipboard.writeText(value); toast({ title: "Copied" }); }}
        title="Click to copy"
      >{value}</button>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 bg-card border border-white/10 rounded-xl px-4 py-2.5">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-right break-all ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}

function SecurityRow({ icon, label, orange }: { icon: React.ReactNode; label: string; orange?: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${orange ? "text-orange-400" : ""}`}>
      {icon} <span>{label}</span>
    </div>
  );
}
