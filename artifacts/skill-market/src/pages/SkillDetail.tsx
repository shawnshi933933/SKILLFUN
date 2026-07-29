import { useRoute, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { useSkill, useChainOracle } from "@/hooks/use-skills";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot, Lock, Shield, Clock, ArrowLeft, Hash,
  ExternalLink, Layers, Loader2, AlertCircle, CheckCircle2,
  Github, Database, FileCode2,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { type DbSkill } from "@/lib/api";

const EXPLORER      = "https://chainscan.0g.ai";
const SKILL_NFT_ADDR = "0x1f76DEBCf09a1901a002FD1B4d2C636fd2AF4DAF";

const mockActivity = [
  { type: "agent", label: "GPT-Agent-7f2a", action: "invoked via x402 MCP", time: "2m ago" },
  { type: "agent", label: "Claude-Agent-3x9", action: "invoked via x402 MCP", time: "11m ago" },
  { type: "human", label: "0x8f3a...b4c5", action: "purchased Skill NFT", time: "18m ago" },
];

function getMeta(skill: DbSkill, key: string, fallback: unknown) {
  return (skill.meta as Record<string, unknown>)[key] ?? fallback;
}

export default function SkillDetail() {
  const [, params] = useRoute("/app/skill/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [purchasing, setPurchasing] = useState(false);

  const { data, isLoading, error } = useSkill(params?.id);

  // Also fetch on-chain oracle status if we have a tokenId
  const tokenId = data?.skill?.tokenId ?? null;
  const { data: oracleData } = useChainOracle(tokenId);

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
  const basePrice   = (meta.basePrice as number | undefined) ?? 0;
  const creatorShare = (meta.creatorShare as number | undefined) ?? 80;
  const ownerShare   = (meta.ownerShare as number | undefined) ?? 10;
  const royaltyRate  = (meta.royaltyRate as number | undefined) ?? 5;
  const invocations  = (meta.invocations as number | undefined) ?? 0;

  const isMinted  = skill.mintStatus === "minted" || skill.mintStatus === "claimed";
  const isClaimed = skill.mintStatus === "claimed";

  const handleBuy = () => {
    setPurchasing(true);
    setTimeout(() => {
      setPurchasing(false);
      toast({ title: "Purchase simulated", description: "ERC-7857 iNFT acquired (demo — 0G Chain)" });
    }, 1800);
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Base Price", value: basePrice > 0 ? `${basePrice} W0G` : "—" },
                { label: "Invocations", value: invocations.toLocaleString() },
                { label: "Creator Share", value: `${creatorShare}%` },
                { label: "Royalty", value: `${royaltyRate}%` },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-white/10 rounded-xl p-3">
                  <div className="text-xs text-muted-foreground mb-0.5">{stat.label}</div>
                  <div className="font-mono font-semibold text-sm">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="activity">
              <TabsList className="bg-card border border-white/10">
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="chain">On-Chain</TabsTrigger>
                <TabsTrigger value="meta">Metadata</TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="mt-4">
                <div className="space-y-2">
                  {mockActivity.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 bg-card border border-white/10 rounded-xl px-4 py-3 text-sm">
                      {a.type === "agent" ? (
                        <Bot className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-accent/20 border border-accent/30 shrink-0" />
                      )}
                      <span className="font-mono text-xs text-muted-foreground truncate">{a.label}</span>
                      <span className="text-muted-foreground text-xs flex-1">{a.action}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{a.time}</span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Live x402 activity will appear here after MCP integration (Step 8)
                  </p>
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
                  <div className="flex items-center gap-2 text-muted-foreground font-medium mb-1">
                    <Database className="w-3.5 h-3.5" /> 0G Storage
                  </div>
                  {skill.skillUri
                    ? <LinkRow label="Skill URI" href={skill.skillUri} text={skill.skillUri.slice(0, 52) + (skill.skillUri.length > 52 ? "…" : "")} />
                    : <div className="text-muted-foreground italic">Not yet uploaded to 0G Storage</div>
                  }
                  {skill.rootHash && <CopyRow label="Root Hash" value={skill.rootHash} mono />}
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
            {/* Buy card */}
            <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Base Price</div>
                  <div className="text-2xl font-bold font-mono">
                    {basePrice > 0 ? `${basePrice} W0G` : "—"}
                  </div>
                </div>
                <Badge className={`${isMinted ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-white/5 text-muted-foreground border-white/10"} border`}>
                  {skill.mintStatus}
                </Badge>
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white gap-2"
                onClick={handleBuy}
                disabled={purchasing || !isMinted}
                data-testid="button-buy-skill"
              >
                {purchasing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {purchasing ? "Processing…" : isMinted ? "Buy Skill NFT" : "Coming Soon"}
              </Button>

              {!isMinted && (
                <p className="text-xs text-muted-foreground text-center">
                  This skill is pending on-chain registration
                </p>
              )}
            </div>

            {/* Revenue split */}
            <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="text-xs text-muted-foreground">Revenue Split (per invocation)</div>
              {[
                { label: "Platform fee", value: "10%", color: "bg-white/20" },
                { label: "Creator royalty", value: `${Math.round(creatorShare * 0.9)}%`, color: "bg-primary/60" },
                { label: "Owner income", value: `${Math.round(ownerShare * 0.9)}%`, color: "bg-accent/60" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-sm ${row.color}`} />
                    <span className="text-muted-foreground">{row.label}</span>
                  </div>
                  <span className="font-mono font-medium">{row.value}</span>
                </div>
              ))}
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
