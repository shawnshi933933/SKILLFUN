import { useRoute, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { mockSkills } from "@/data/mockSkills";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Bot, User, Lock, Shield, AlertTriangle, Clock, ArrowLeft, Hash, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["hsl(265,85%,65%)", "hsl(185,85%,55%)", "hsl(217,32%,40%)"];

function buildBondingCurve(holders: number, basePrice: number) {
  return Array.from({ length: Math.max(holders + 5, 10) }, (_, i) => ({
    holders: i,
    price: +(basePrice * (1 + i * 0.012)).toFixed(4),
  }));
}

const mockActivity = [
  { type: "agent", label: "GPT-Agent-7f2a", action: "purchased access", time: "2m ago" },
  { type: "human", label: "0x8f3a...b4c5", action: "bought 5 shares", time: "11m ago" },
  { type: "agent", label: "Claude-Agent-3x9", action: "purchased access", time: "18m ago" },
  { type: "human", label: "0x1c4b...d2e3", action: "bought 10 shares", time: "34m ago" },
  { type: "agent", label: "AutoGPT-9z1k", action: "purchased access", time: "1h ago" },
  { type: "human", label: "0xa2e1...f6d7", action: "bought 2 shares", time: "2h ago" },
];

export default function SkillDetail() {
  const [, params] = useRoute("/app/skill/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [purchasing, setPurchasing] = useState(false);
  const [staking, setStaking] = useState(false);

  const skill = mockSkills.find((s) => s.id === params?.id);

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
    { name: "Creator", value: skill.shares.creator },
    { name: "Early Holders", value: skill.shares.earlyHolders },
    { name: "Platform", value: skill.shares.platform },
  ];

  const curveData = buildBondingCurve(skill.totalHolders, skill.price);

  const handleBuy = () => {
    setPurchasing(true);
    setTimeout(() => {
      setPurchasing(false);
      toast({ title: "Purchase simulated", description: "Access unlocked (mock — Sepolia testnet)" });
    }, 1800);
  };

  const handleStake = () => {
    setStaking(true);
    setTimeout(() => {
      setStaking(false);
      toast({ title: "Shares acquired", description: "5 shares purchased (mock — Sepolia testnet)" });
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
              <span className="text-sm">Creator submitted a metadata update. Shareholders can veto before it takes effect.</span>
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
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="border-primary/30 text-primary">{skill.category}</Badge>
                {skill.claimedBy ? (
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">Claimed</Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/30 text-amber-400">Unclaimed — Platform Custody</Badge>
                )}
                <Badge variant="outline" className="border-accent/30 text-accent gap-1">
                  <Shield className="w-3 h-3" /> ERC-8004 Compatible
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-3">{skill.name}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">{skill.description}</p>
              {skill.claimedBy && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Created by <span className="text-primary font-medium">{skill.claimedBy}</span>
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                {skill.tags.map((tag) => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

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
              <div className="text-xs text-muted-foreground mb-1">Current Price (Bonding Curve)</div>
              <div className="text-3xl font-bold font-mono text-foreground mb-1">{skill.price} ETH</div>
              <div className="text-xs text-muted-foreground">{skill.totalHolders} holders · {skill.agentPurchaseCount.toLocaleString()} agent buys</div>

              <div className="mt-5 mb-3">
                <div className="text-xs text-muted-foreground mb-2">Price vs Holders</div>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={curveData}>
                    <XAxis dataKey="holders" tick={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ background: "hsl(222,47%,10%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                      labelFormatter={(v) => `${v} holders`}
                      formatter={(v: number) => [`${v} ETH`, "Price"]}
                    />
                    <Line type="monotone" dataKey="price" stroke="hsl(265,85%,65%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleBuy} disabled={purchasing} data-testid="button-buy-access">
                  {purchasing ? "Processing..." : `Unlock Access — ${skill.price} ETH`}
                </Button>
                <Button variant="outline" className="w-full border-white/20 hover:bg-white/5" onClick={handleStake} disabled={staking} data-testid="button-buy-shares">
                  {staking ? "Acquiring..." : "Buy Shares (Earn from Usage)"}
                </Button>
              </div>
            </div>

            <div className="bg-card border border-white/10 rounded-2xl p-5">
              <div className="text-xs text-muted-foreground mb-4">Share Distribution</div>
              <div className="flex items-center gap-4">
                <PieChart width={100} height={100}>
                  <Pie data={pieData} cx={45} cy={45} innerRadius={28} outerRadius={45} dataKey="value" strokeWidth={0}>
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="space-y-2 flex-1">
                  {pieData.map((entry, i) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                        <span className="text-muted-foreground">{entry.name}</span>
                      </div>
                      <span className="font-mono font-medium">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="text-xs text-muted-foreground">Security Status</div>
              <div className="flex items-center gap-2 text-sm">
                <Lock className="w-4 h-4 text-primary" />
                <span>Content Hash Locked</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Creator Stake Active</span>
              </div>
              {skill.isTimelockPending ? (
                <div className="flex items-center gap-2 text-sm text-orange-400">
                  <Clock className="w-4 h-4" />
                  <span>72hr Timelock Pending</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <Shield className="w-4 h-4" />
                  <span>No Pending Updates</span>
                </div>
              )}
              <div className="text-xs font-mono text-muted-foreground pt-1 border-t border-white/10 break-all">
                {skill.contentHash.slice(0, 20)}...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
