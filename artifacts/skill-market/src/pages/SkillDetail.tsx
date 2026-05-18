import { useRoute, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { mockSkills } from "@/data/mockSkills";
import { mockBundles } from "@/data/mockBundles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Bot, User, Lock, Shield, AlertTriangle, Clock, ArrowLeft, Hash, ExternalLink, Layers, Coins } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import SkillTryPanel from "@/components/SkillTryPanel";

const COLORS = ["hsl(265,85%,65%)", "hsl(217,91%,65%)", "hsl(185,85%,55%)"];

const mockActivity = [
  { type: "agent", label: "GPT-Agent-7f2a", action: "invoked via x402 MCP", time: "2m ago" },
  { type: "agent", label: "Claude-Agent-3x9", action: "invoked via x402 MCP", time: "11m ago" },
  { type: "human", label: "0x8f3a...b4c5", action: "purchased Skill NFT", time: "18m ago" },
  { type: "agent", label: "AutoGPT-9z1k", action: "invoked via x402 MCP", time: "34m ago" },
  { type: "human", label: "0x1c4b...d2e3", action: "transferred Skill NFT", time: "1h ago" },
  { type: "agent", label: "Grok-Agent-4p7", action: "invoked via x402 MCP", time: "2h ago" },
];

export default function SkillDetail() {
  const [, params] = useRoute("/app/skill/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [purchasing, setPurchasing] = useState(false);

  const skill = mockSkills.find((s) => s.id === params?.id);
  const bundles = mockBundles.filter((b) => b.constituentSkillIds.includes(params?.id ?? ""));

  if (!skill) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground mb-4">Skill not found</div>
          <Button onClick={() => setLocation("/app/market")}>Back to Market</Button>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: "Creator Royalty", value: skill.creatorShare },
    { name: "Owner Income", value: skill.ownerShare },
  ];

  const handleBuy = () => {
    setPurchasing(true);
    setTimeout(() => {
      setPurchasing(false);
      toast({ title: "Purchase simulated", description: "Skill NFT acquired (mock — Sepolia testnet)" });
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <button onClick={() => setLocation("/app/market")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors" data-testid="button-back-market">
          <ArrowLeft className="w-4 h-4" /> Back to Market
        </button>

        {skill.isTimelockPending && (
          <div className="mb-6 flex items-center gap-3 bg-orange-500/10 border border-orange-500/30 rounded-xl px-5 py-3 text-orange-400" data-testid="banner-timelock">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-semibold">72hr Timelock Active — </span>
              <span className="text-sm">Creator submitted a metadata update. NFT holders can veto before it takes effect.</span>
            </div>
            <Button size="sm" variant="outline" className="ml-auto border-orange-500/40 text-orange-400 hover:bg-orange-500/10 shrink-0" data-testid="button-veto-update">
              Vote Veto
            </Button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left — Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline" className="border-primary/30 text-primary">{skill.category}</Badge>
                {skill.ownerAddress ? (
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">NFT Owned</Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/30 text-amber-400">Platform Custody</Badge>
                )}
                {skill.encryptionEnabled && (
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 gap-1">
                    <Lock className="w-3 h-3" /> AES-256
                  </Badge>
                )}
                <Badge variant="outline" className="border-accent/30 text-accent gap-1">
                  <Shield className="w-3 h-3" /> ERC-8183 MCP
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-2">{skill.name}</h1>
              <p className="font-mono text-sm text-muted-foreground/60 mb-3">{skill.mcpToolName}()</p>
              <p className="text-muted-foreground text-lg leading-relaxed">{skill.description}</p>
              <div className="mt-4 flex flex-col gap-1 text-sm">
                <p className="text-muted-foreground">Created by <span className="text-primary font-medium">{skill.creatorAddress}</span></p>
                {skill.ownerAddress && (
                  <p className="text-muted-foreground">Owned by <span className="text-blue-400 font-mono">{skill.ownerAddress.slice(0, 10)}...{skill.ownerAddress.slice(-6)}</span></p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {skill.tags.map((tag) => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">{tag}</span>
                ))}
              </div>
            </div>

            <SkillTryPanel skillId={skill.id} skillName={skill.name} category={skill.category} />

            {/* Bundles containing this skill */}
            {bundles.length > 0 && (
              <div className="bg-card border border-accent/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-accent" />
                  <h3 className="font-semibold text-sm">Available in {bundles.length} Bundle{bundles.length > 1 ? "s" : ""}</h3>
                </div>
                <div className="space-y-2">
                  {bundles.map((b) => (
                    <div key={b.id} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 cursor-pointer hover:bg-accent/10 transition-colors" onClick={() => setLocation(`/app/bundle/${b.id}`)}>
                      <div>
                        <div className="font-medium text-sm">{b.name}</div>
                        <div className="text-xs text-muted-foreground">by {b.curatorAddress} · +{b.curatorMarkup}% markup · {b.apy.toFixed(1)}% APY</div>
                      </div>
                      <Badge variant="outline" className="border-accent/30 text-accent text-xs">{b.invocations.toLocaleString()} calls</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Tabs defaultValue="versions">
              <TabsList className="bg-card border border-white/10">
                <TabsTrigger value="versions" data-testid="tab-versions">Version History</TabsTrigger>
                <TabsTrigger value="activity" data-testid="tab-activity">Activity Feed</TabsTrigger>
              </TabsList>

              <TabsContent value="versions" className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 bg-card border border-white/10 rounded-lg px-4 py-2">
                  <Lock className="w-3 h-3 text-primary" />
                  Content Hash Locked — version history immutably stored on IPFS. Platform acts as version notary.
                </div>
                {skill.versions.map((v, i) => (
                  <div key={v.id} className={`bg-card border rounded-xl p-4 ${i === 0 ? "border-primary/30" : "border-white/10"}`} data-testid={`version-${v.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-mono font-semibold ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>{v.id}</span>
                        {i === 0 && <Badge variant="outline" className="text-xs border-primary/30 text-primary">Latest</Badge>}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(v.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-2">
                      <Hash className="w-3 h-3" />
                      <span>{v.cid}</span>
                      <ExternalLink className="w-3 h-3 cursor-pointer hover:text-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">{v.changeSummary}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="activity" className="mt-4 space-y-2">
                {mockActivity.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 bg-card border border-white/10 rounded-lg px-4 py-3" data-testid={`activity-${i}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${a.type === "agent" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
                      {a.type === "agent" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-mono font-medium">{a.label}</span>
                      <span className="text-sm text-muted-foreground"> {a.action}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{a.time}</span>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right — Price Panel */}
          <div className="space-y-5">
            <div className="bg-card border border-white/10 rounded-2xl p-5">
              <div className="text-xs text-muted-foreground mb-1">Base Price per Call</div>
              <div className="text-3xl font-bold font-mono text-foreground mb-1">{skill.basePrice} ETH</div>
              <div className="text-xs text-muted-foreground mb-4">{skill.invocations.toLocaleString()} total invocations · {skill.bundleCount} bundles</div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4 text-xs space-y-1.5">
                <div className="font-medium text-primary mb-1.5">MCP Endpoint</div>
                <div className="font-mono text-muted-foreground break-all">
                  GET /mcp/{skill.mcpToolName}
                </div>
                <div className="text-muted-foreground/70">→ HTTP 402 → x402 USDC → Execute</div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-2" onClick={handleBuy} disabled={purchasing} data-testid="button-buy-access">
                {purchasing ? "Processing..." : `Buy Skill NFT — Own the Asset`}
              </Button>
              <Button variant="outline" className="w-full border-white/20 hover:bg-white/5" onClick={() => setLocation(`/app/stake`)} data-testid="button-stake">
                Stake SKILL Tokens → Earn Yield
              </Button>
            </div>

            {/* Revenue Split */}
            <div className="bg-card border border-white/10 rounded-2xl p-5">
              <div className="text-xs text-muted-foreground mb-4">Revenue Split (per Base Price call)</div>
              <div className="flex items-center gap-4">
                <PieChart width={100} height={100}>
                  <Pie data={pieData} cx={45} cy={45} innerRadius={28} outerRadius={45} dataKey="value" strokeWidth={0}>
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="space-y-3 flex-1">
                  {pieData.map((entry, i) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                        <span className="text-muted-foreground">{entry.name}</span>
                      </div>
                      <span className="font-mono font-medium">{entry.value}%</span>
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground/60 pt-1 border-t border-white/10">
                    + curator markup split 50/50 between curator & stakers
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings estimate */}
            <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="text-xs text-muted-foreground">Earnings Estimate (Owner)</div>
              <div className="space-y-2">
                {[
                  { label: "Per invocation", value: `${(skill.basePrice * 0.9).toFixed(4)} ETH`, color: "text-blue-400" },
                  { label: "Daily (at current rate)", value: `${((skill.invocations / 365) * skill.basePrice * 0.9).toFixed(3)} ETH`, color: "text-foreground" },
                  { label: "Royalty rate", value: `${skill.royaltyRate}%`, color: "text-purple-400" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className={`font-mono font-medium ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="text-xs text-muted-foreground">Security Status</div>
              <div className="flex items-center gap-2 text-sm">
                <Lock className="w-4 h-4 text-primary" /> <span>Content Hash Locked</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-emerald-400" /> <span>Creator Stake Active</span>
              </div>
              {skill.encryptionEnabled && (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <Lock className="w-4 h-4" /> <span>AES-256 Payload Encryption</span>
                </div>
              )}
              {skill.isTimelockPending ? (
                <div className="flex items-center gap-2 text-sm text-orange-400">
                  <Clock className="w-4 h-4" /> <span>72hr Timelock Pending</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <Shield className="w-4 h-4" /> <span>No Pending Updates</span>
                </div>
              )}
              <div className="text-xs font-mono text-muted-foreground pt-1 border-t border-white/10 break-all">
                {skill.contentHash.slice(0, 22)}...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
