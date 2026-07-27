import { useRoute, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { mockBundles } from "@/data/mockBundles";
import { mockSkills } from "@/data/mockSkills";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Bot, Layers, TrendingUp, Coins, Shield, Lock, ExternalLink, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const mockAgentActivity = [
  { agent: "GPT-Agent-7f2a", skill: "Whale Wallet Tracker", time: "45s ago" },
  { agent: "Claude-opus-3x9", skill: "Yield Farming Optimizer", time: "2m ago" },
  { agent: "AutoGPT-9z1k", skill: "Sentiment Analysis Engine", time: "4m ago" },
  { agent: "Grok-Agent-4p7", skill: "MEV Bot Strategy", time: "7m ago" },
  { agent: "GPT-Agent-2k9a", skill: "Whale Wallet Tracker", time: "11m ago" },
];

export default function BundleDetail() {
  const [, params] = useRoute("/app/bundle/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [staking, setStaking] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("500");

  const bundle = mockBundles.find((b) => b.id === params?.id);

  if (!bundle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground mb-4">Bundle not found</div>
          <Button onClick={() => setLocation("/app/market")}>Back to Market</Button>
        </div>
      </div>
    );
  }

  const skills = bundle.constituentSkillIds
    .map((id) => mockSkills.find((s) => s.id === id))
    .filter(Boolean);

  const handleStake = () => {
    setStaking(true);
    setTimeout(() => {
      setStaking(false);
      toast({ title: "Staked successfully", description: `${stakeAmount} SKILL staked to ${bundle.name} (mock — 0G Chain)` });
    }, 1800);
  };

  const totalBasePrice = skills.reduce((s, k) => s + (k?.basePrice ?? 0), 0);
  const bundleTotal = totalBasePrice * (1 + bundle.curatorMarkup / 100);
  const platformFee = bundleTotal * 0.1;
  const curatorEarning = (bundleTotal * bundle.curatorMarkup / 100 / bundleTotal) * bundleTotal * 0.5 * (1 - 0.1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <button onClick={() => setLocation("/app/market")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors" data-testid="button-back-market">
          <ArrowLeft className="w-4 h-4" /> Back to Market
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left — Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline" className="border-accent/30 text-accent gap-1">
                  <Layers className="w-3 h-3" /> Bundle
                </Badge>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                  {bundle.apy.toFixed(1)}% APY
                </Badge>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  ERC-8183 MCP
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-2">{bundle.name}</h1>
              <p className="text-muted-foreground text-sm mb-1">
                Curated by <span className="text-accent font-medium">{bundle.curatorAddress}</span>
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {bundle.tags.map((tag) => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">{tag}</span>
                ))}
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">{bundle.description}</p>
            </div>

            {/* MCP Endpoint */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm text-primary">Single MCP Endpoint (ERC-8183)</h3>
              </div>
              <div className="font-mono text-sm bg-background border border-white/10 rounded-lg px-4 py-3 mb-3">
                <span className="text-muted-foreground">GET </span>
                <span className="text-foreground">https://mcp.skillfun.xyz/bundle/{bundle.id}</span>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Returns HTTP 402 → Agent sends USDC via x402 → Executes all {skills.length} skills in one call</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Agent identity verified via ERC-8004 · ZK execution proof via ERC-8220</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Fee split happens on-chain atomically — no delays, no invoices</span>
                </div>
              </div>
            </div>

            {/* Constituent Skills */}
            <div>
              <h3 className="font-semibold mb-4">Skills in this Bundle ({skills.length})</h3>
              <div className="space-y-3">
                {skills.map((skill) => skill && (
                  <Link key={skill.id} href={`/app/skill/${skill.id}`}>
                    <div className="flex items-center justify-between bg-card border border-white/10 rounded-xl px-5 py-4 hover:border-primary/30 hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <Zap className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{skill.name}</div>
                          <div className="font-mono text-xs text-muted-foreground/60">{skill.mcpToolName}()</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="text-xs text-muted-foreground">Base Price</div>
                          <div className="font-mono text-sm">{skill.basePrice} ETH</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Invocations</div>
                          <div className="flex items-center gap-1 text-accent font-mono text-sm">
                            <Bot className="w-3 h-3" /> {skill.invocations.toLocaleString()}
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground/40" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <Tabs defaultValue="activity">
              <TabsList className="bg-card border border-white/10">
                <TabsTrigger value="activity" data-testid="tab-activity">Agent Activity</TabsTrigger>
                <TabsTrigger value="economics" data-testid="tab-economics">Economics</TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="mt-4 space-y-2">
                {mockAgentActivity.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 bg-card border border-white/10 rounded-lg px-4 py-3" data-testid={`agent-activity-${i}`}>
                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-mono font-medium text-accent">{a.agent}</span>
                      <span className="text-sm text-muted-foreground"> invoked </span>
                      <span className="text-sm font-medium">{a.skill}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{a.time}</span>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="economics" className="mt-4">
                <div className="bg-card border border-white/10 rounded-xl p-5 space-y-4">
                  <h4 className="font-semibold text-sm">Per-Invocation Revenue Breakdown</h4>
                  <div className="space-y-2">
                    {[
                      { label: "Total invoice (Base + Markup)", amount: `~${bundleTotal.toFixed(4)} ETH`, color: "text-foreground", bg: "bg-white/5" },
                      { label: "Platform Fee (10% off top)", amount: `~${platformFee.toFixed(4)} ETH`, color: "text-muted-foreground", bg: "bg-white/5" },
                      { label: "Owner Income (90% of each Base Price)", amount: "Distributed per Skill Owner", color: "text-blue-400", bg: "bg-blue-500/10 border border-blue-500/20" },
                      { label: `Curator Share (50% of ${bundle.curatorMarkup}% markup)`, amount: `~${(totalBasePrice * bundle.curatorMarkup / 100 * 0.5 * 0.9).toFixed(5)} ETH`, color: "text-accent", bg: "bg-accent/10 border border-accent/20" },
                      { label: "Staker Pool (50% of markup)", amount: `~${(totalBasePrice * bundle.curatorMarkup / 100 * 0.5 * 0.9).toFixed(5)} ETH`, color: "text-emerald-400", bg: "bg-emerald-500/10 border border-emerald-500/20" },
                    ].map((row) => (
                      <div key={row.label} className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm ${row.bg}`}>
                        <span className={row.color}>{row.label}</span>
                        <span className={`font-mono font-medium ${row.color}`}>{row.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right — Stake Panel */}
          <div className="space-y-5">
            <div className="bg-card border border-white/10 rounded-2xl p-5">
              <div className="text-xs text-muted-foreground mb-1">Total Invocations</div>
              <div className="text-3xl font-bold font-mono text-foreground mb-0.5">{bundle.invocations.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mb-4">Lifetime invocations via MCP</div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Curator Markup</div>
                  <div className="font-mono font-bold text-primary">+{bundle.curatorMarkup}%</div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Staker APY</div>
                  <div className="font-mono font-bold text-emerald-400">{bundle.apy.toFixed(1)}%</div>
                </div>
              </div>

              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2 mb-2" onClick={() => setLocation("/app/stake")} data-testid="button-stake-bundle">
                <TrendingUp className="w-4 h-4" /> Stake SKILL to Earn {bundle.apy.toFixed(1)}% APY
              </Button>
              <p className="text-xs text-muted-foreground text-center">Staking supports the bundle's trust score. Slashing applies for curator misconduct.</p>
            </div>

            {/* Staker Pool */}
            <div className="bg-card border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-sm">SKILL Staker Pool</span>
              </div>
              <div className="text-2xl font-bold font-mono mb-1">{bundle.stakerPool.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mb-4">SKILL tokens staked</div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-accent rounded-full" style={{ width: `${Math.min(bundle.stakerPool / 500, 100)}%` }} />
              </div>
              <div className="text-xs text-muted-foreground">{bundle.stakerPool > 20000 ? "High confidence" : bundle.stakerPool > 10000 ? "Medium confidence" : "Growing"} — staking signals curator quality</div>
            </div>

            {/* Quick Stake Widget */}
            <div className="bg-card border border-white/10 rounded-2xl p-5">
              <div className="text-sm font-semibold mb-3">Quick Stake</div>
              <div className="flex gap-2 mb-3">
                {["100", "500", "1000", "5000"].map((amt) => (
                  <button key={amt} onClick={() => setStakeAmount(amt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-colors ${stakeAmount === amt ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
                    {amt}
                  </button>
                ))}
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-3 text-sm">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Stake amount</span>
                  <span className="font-mono text-foreground">{parseInt(stakeAmount).toLocaleString()} SKILL</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Est. daily yield</span>
                  <span className="font-mono text-emerald-400">+{(parseInt(stakeAmount) * bundle.apy / 100 / 365).toFixed(2)} SKILL</span>
                </div>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={handleStake} disabled={staking} data-testid="button-confirm-stake">
                <Coins className="w-4 h-4" />
                {staking ? "Staking..." : `Stake ${parseInt(stakeAmount).toLocaleString()} SKILL`}
              </Button>
            </div>

            {/* Security */}
            <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="text-xs text-muted-foreground">Bundle Security</div>
              <div className="flex items-center gap-2 text-sm">
                <Lock className="w-4 h-4 text-primary" /> <span>All Skill hashes locked</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-emerald-400" /> <span>Staker slashing enabled</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Bot className="w-4 h-4 text-accent" /> <span>A2A x402 payments active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
