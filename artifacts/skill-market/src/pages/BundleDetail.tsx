import { useRoute, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { useBundle } from "@/hooks/use-skills";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Bot, Layers, Coins, Shield, Lock,
  ExternalLink, Zap, Loader2, AlertCircle, Package,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { type DbSkill, type DbBundle } from "@/lib/api";

const mockAgentActivity = [
  { agent: "GPT-Agent-7f2a", skill: "—", time: "45s ago" },
  { agent: "Claude-opus-3x9", skill: "—", time: "2m ago" },
];

function getMeta<T>(obj: DbBundle | DbSkill, key: string, fallback: T): T {
  return ((obj.meta as Record<string, unknown>)[key] as T) ?? fallback;
}

export default function BundleDetail() {
  const [, params] = useRoute("/app/bundle/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [staking, setStaking]       = useState(false);
  const [stakeAmount, setStakeAmount] = useState("500");

  const { data, isLoading, error } = useBundle(params?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data?.bundle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <div className="text-muted-foreground">{error ? "Failed to load bundle" : "Bundle not found"}</div>
          <Button onClick={() => setLocation("/app/market")}>Back to Market</Button>
        </div>
      </div>
    );
  }

  const { bundle, skills } = data;

  const apy           = getMeta<number>(bundle, "apy", 0);
  const stakerPool    = getMeta<number>(bundle, "stakerPool", 0);
  const invocations   = getMeta<number>(bundle, "invocations", 0);
  const curatorMarkup = getMeta<number>(bundle, "curatorMarkup", 10);
  const tags          = getMeta<string[]>(bundle, "tags", []);

  const totalBasePrice = skills.reduce((s, k) => s + getMeta<number>(k, "basePrice", 0), 0);
  const bundleTotal    = totalBasePrice * (1 + curatorMarkup / 100);

  const handleStake = () => {
    setStaking(true);
    setTimeout(() => {
      setStaking(false);
      toast({
        title: "Staked successfully",
        description: `${stakeAmount} SKILL staked to ${bundle.name} (demo — 0G Chain)`,
      });
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
                <Badge variant="outline" className="border-accent/30 text-accent gap-1">
                  <Layers className="w-3 h-3" /> Bundle
                </Badge>
                {apy > 0 && (
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                    {apy.toFixed(1)}% APY
                  </Badge>
                )}
                <Badge variant="outline" className="border-primary/30 text-primary">
                  ERC-8183 MCP
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live on 0G
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-2">{bundle.name}</h1>
              {bundle.description && (
                <p className="text-muted-foreground text-sm mb-2">{bundle.description}</p>
              )}
              <p className="text-muted-foreground text-sm mb-3">
                Curated by{" "}
                <span className="font-mono text-accent text-xs">
                  {bundle.ownerAddress.slice(0, 8)}…{bundle.ownerAddress.slice(-6)}
                </span>
              </p>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-white/10 text-muted-foreground text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Skills", value: String(skills.length) },
                { label: "Invocations", value: invocations.toLocaleString() },
                { label: "Staker Pool", value: stakerPool > 0 ? `${stakerPool.toLocaleString()} SKILL` : "—" },
                { label: "Curator Markup", value: `${curatorMarkup}%` },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-white/10 rounded-xl p-3">
                  <div className="text-xs text-muted-foreground mb-0.5">{stat.label}</div>
                  <div className="font-mono font-semibold text-sm">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="skills">
              <TabsList className="bg-card border border-white/10">
                <TabsTrigger value="skills">Skills ({skills.length})</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="skills" className="mt-4">
                {skills.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
                    <Package className="w-8 h-8" />
                    <span className="text-sm">No skills in this bundle yet</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {skills.map((skill) => {
                      const skillName = getMeta<string>(skill, "name", skill.repoUrl.split("/").pop() ?? skill.skillId);
                      const basePrice = getMeta<number>(skill, "basePrice", 0);
                      return (
                        <Link key={skill.skillId} href={`/app/skill/${skill.skillId}`}>
                          <div className="flex items-center gap-3 bg-card border border-white/10 rounded-xl px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                              <Zap className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{skillName}</div>
                              <div className="text-xs text-muted-foreground font-mono truncate">{skill.repoUrl}</div>
                            </div>
                            <div className="text-right shrink-0">
                              {basePrice > 0 && (
                                <div className="text-xs font-mono text-primary">{basePrice} A0GI</div>
                              )}
                              <Badge className="text-[10px] border mt-0.5" variant="outline">
                                {skill.mintStatus}
                              </Badge>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <div className="space-y-2">
                  {mockAgentActivity.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 bg-card border border-white/10 rounded-xl px-4 py-3 text-sm">
                      <Bot className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-mono text-xs text-muted-foreground">{a.agent}</span>
                      <span className="text-muted-foreground text-xs flex-1">invoked via x402 MCP</span>
                      <span className="text-xs text-muted-foreground shrink-0">{a.time}</span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Live x402 activity will appear here after MCP integration (Step 8)
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Security */}
            <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="text-xs text-muted-foreground">Bundle Security</div>
              <div className="flex items-center gap-2 text-sm"><Lock className="w-4 h-4 text-primary" /> All Skill hashes locked</div>
              <div className="flex items-center gap-2 text-sm"><Shield className="w-4 h-4 text-emerald-400" /> Staker slashing enabled</div>
              <div className="flex items-center gap-2 text-sm"><Bot className="w-4 h-4 text-accent" /> A2A x402 payments active</div>
            </div>
          </div>

          {/* Right — Stake panel */}
          <div className="space-y-4">
            <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Bundle Price</div>
                  <div className="text-2xl font-bold font-mono">
                    {bundleTotal > 0 ? `${bundleTotal.toFixed(4)} A0GI` : "—"}
                  </div>
                </div>
                {apy > 0 && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border">
                    {apy.toFixed(1)}% APY
                  </Badge>
                )}
              </div>

              <div className="text-xs text-muted-foreground">Quick Stake</div>
              <div className="flex gap-1.5">
                {["100", "500", "1000", "5000"].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setStakeAmount(amt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                      stakeAmount === amt
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/5 text-muted-foreground hover:bg-white/10"
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stake</span>
                  <span className="font-mono">{parseInt(stakeAmount).toLocaleString()} SKILL</span>
                </div>
                {apy > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. daily yield</span>
                    <span className="font-mono text-emerald-400">
                      +{(parseInt(stakeAmount) * apy / 100 / 365).toFixed(2)} SKILL
                    </span>
                  </div>
                )}
              </div>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                onClick={handleStake}
                disabled={staking}
                data-testid="button-confirm-stake"
              >
                <Coins className="w-4 h-4" />
                {staking ? "Staking…" : `Stake ${parseInt(stakeAmount).toLocaleString()} SKILL`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
