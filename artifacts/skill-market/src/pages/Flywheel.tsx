import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Bot, Zap, TrendingUp, Layers, Lock, Clock, Shield, RefreshCw, Code2, Coins } from "lucide-react";

const volumeData = [
  { day: "Mon", volume: 48200, invocations: 980 },
  { day: "Tue", volume: 62400, invocations: 1240 },
  { day: "Wed", volume: 55900, invocations: 1100 },
  { day: "Thu", volume: 78300, invocations: 1560 },
  { day: "Fri", volume: 91200, invocations: 1820 },
  { day: "Sat", volume: 84600, invocations: 1690 },
  { day: "Sun", volume: 102500, invocations: 2050 },
];

const mockFeedBase = [
  { type: "agent", msg: "GPT-Agent-7f2a invoked DeFi Alpha Suite via x402", time: "2s ago", color: "text-accent" },
  { type: "mint", msg: "New Skill minted: MEV Sandwich Detector", time: "14s ago", color: "text-primary" },
  { type: "stake", msg: "1,200 SKILL staked to Web3 Research Terminal by @staker_xyz", time: "31s ago", color: "text-emerald-400" },
  { type: "agent", msg: "Claude-3-opus invoked Smart Contract Auditor bundle", time: "48s ago", color: "text-accent" },
  { type: "kol", msg: "@tradingmaster claimed Momentum Trading Signal (earned 0.8 ETH)", time: "1m ago", color: "text-amber-400" },
  { type: "agent", msg: "AutoGPT-9z1k invoked Sentiment Analysis Engine", time: "1m ago", color: "text-accent" },
  { type: "bundle", msg: "New Bundle curated: NFT Alpha Kit by @nft_curator", time: "2m ago", color: "text-blue-400" },
  { type: "mint", msg: "New Skill minted: Cross-chain Bridge Optimizer", time: "3m ago", color: "text-primary" },
];

const STATS = [
  { label: "Total Skills", value: "847", icon: <Zap className="w-5 h-5 text-primary" />, delta: "+12 today" },
  { label: "Bundles Curated", value: "214", icon: <Layers className="w-5 h-5 text-accent" />, delta: "+8 today" },
  { label: "Agent Invocations", value: "289K", icon: <Bot className="w-5 h-5 text-accent" />, delta: "+2,050 today" },
  { label: "SKILL Staked", value: "84K", icon: <Coins className="w-5 h-5 text-emerald-400" />, delta: "+3.2K today" },
  { label: "Creator Royalties", value: "↗ 24 ETH", icon: <Code2 className="w-5 h-5 text-purple-400" />, delta: "Today" },
  { label: "Staker Yield", value: "↗ 18 ETH", icon: <TrendingUp className="w-5 h-5 text-amber-400" />, delta: "Today" },
];

const FLOW_NODES = [
  { id: 1, label: "Creator", sub: "Mints Skill NFT — earns 10% royalty perpetually", color: "border-primary/40 bg-primary/10 text-primary" },
  { id: 2, label: "Bundle", sub: "Curator adds markup, wraps Skills → single MCP endpoint", color: "border-accent/40 bg-accent/10 text-accent" },
  { id: 3, label: "Staker", sub: "Stakes SKILL to a Bundle → earns 50% of curator markup", color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
  { id: 4, label: "Agent", sub: "Discovers Bundle via MCP, pays via x402 USDC — autonomous", color: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
  { id: 5, label: "Revenue Split", sub: "10% platform off top · Base → Creator/Owner · Markup → Curator/Stakers", color: "border-purple-500/40 bg-purple-500/10 text-purple-400" },
];

export default function Flywheel() {
  const [feedItems, setFeedItems] = useState(mockFeedBase);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      const options = [
        { type: "agent", msg: `Agent-${Math.random().toString(36).slice(2, 6).toUpperCase()} invoked ${["DeFi Alpha Suite", "Web3 Research Terminal", "Builder Dev Pack", "NFT Alpha Kit"][Math.floor(Math.random() * 4)]}`, time: "just now", color: "text-accent" },
        { type: "stake", msg: `${Math.floor(Math.random() * 500 + 100)} SKILL staked to ${["DeFi Alpha Suite", "Portfolio Pro"][Math.floor(Math.random() * 2)]}`, time: "just now", color: "text-emerald-400" },
      ];
      setFeedItems((f) => [options[Math.floor(Math.random() * options.length)], ...f.slice(0, 7)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Economic Flywheel</h1>
          <p className="text-muted-foreground">The self-reinforcing value loop powering the Machine Economy. Five roles, one protocol.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {STATS.map((s) => (
            <div key={s.label} className="bg-card border border-white/10 rounded-xl p-4" data-testid={`stat-${s.label.toLowerCase().replace(/\s/g, "-")}`}>
              <div className="mb-2">{s.icon}</div>
              <div className="text-xl font-bold font-mono">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              <div className="text-xs text-emerald-400 mt-1">{s.delta}</div>
            </div>
          ))}
        </div>

        {/* Flow Diagram */}
        <div className="bg-card border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="font-semibold text-lg mb-8 text-center">The 5-Node Economic Flywheel</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-center">
            {FLOW_NODES.map((node, i) => (
              <div key={node.id} className="relative flex flex-col items-center gap-2">
                <div className={`w-full border rounded-xl p-4 text-center ${node.color}`}>
                  <div className="text-xs font-mono opacity-50 mb-1">0{node.id}</div>
                  <div className="font-semibold text-sm mb-1">{node.label}</div>
                  <div className="text-xs opacity-70">{node.sub}</div>
                </div>
                {i < FLOW_NODES.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-white/30 text-lg">→</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary">
              <RefreshCw className="w-4 h-4" />
              More invocations → More earnings → More creators → Better bundles → More agent demand → Flywheel accelerates
            </div>
          </div>
        </div>

        {/* Fee breakdown callout */}
        <div className="bg-card border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="font-semibold mb-4">Fee Split Per Invocation</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { label: "Platform (10% off total invoice)", pct: "10%", color: "text-muted-foreground bg-white/5 border-white/10" },
              { label: "Creator Royalty (10% of net Base)", pct: "~9% net", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
              { label: "Owner Income (90% of net Base)", pct: "~81% net", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
              { label: "Curator Share (50% of net Markup)", pct: "~45% of Markup", color: "text-accent bg-accent/10 border-accent/20" },
              { label: "Staker Pool (50% of net Markup)", pct: "~45% of Markup", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
            ].map((f) => (
              <div key={f.label} className={`border rounded-xl p-4 text-center ${f.color}`}>
                <div className="text-xl font-bold font-mono mb-1">{f.pct}</div>
                <div className="text-xs opacity-80">{f.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Volume Chart */}
          <div className="lg:col-span-2 bg-card border border-white/10 rounded-2xl p-6">
            <h2 className="font-semibold mb-5">7-Day Platform Activity</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={volumeData} barGap={4}>
                <XAxis dataKey="day" tick={{ fill: "hsl(215,20.2%,65.1%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "hsl(222,47%,10%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(v: number, name: string) => [
                    name === "volume" ? `${(v / 1000).toFixed(1)}K ETH` : v.toLocaleString(),
                    name === "volume" ? "Volume" : "Agent Invocations",
                  ]}
                />
                <Bar dataKey="volume" fill="hsl(265,85%,65%)" radius={[4, 4, 0, 0]} opacity={0.8} />
                <Bar dataKey="invocations" fill="hsl(185,85%,55%)" radius={[4, 4, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-primary/80" />Volume (ETH)</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-accent/60" />Agent Invocations</div>
            </div>
          </div>

          {/* Live Feed */}
          <div className="bg-card border border-white/10 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <h2 className="font-semibold">Live Activity</h2>
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            </div>
            <div className="flex-1 space-y-2 overflow-hidden">
              {feedItems.map((item, i) => (
                <div key={`${tick}-${i}`} className={`text-xs py-2 border-b border-white/5 last:border-0 ${item.color} transition-all`} data-testid={`feed-item-${i}`}>
                  <span>{item.msg}</span>
                  <span className="text-muted-foreground ml-2">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Model */}
        <div className="bg-card border border-white/10 rounded-2xl p-8">
          <h2 className="font-semibold text-lg mb-6">Three-Layer Security Model</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Lock className="w-5 h-5 text-primary" />, title: "Content Hash Lock", desc: "Every Skill version is stored with an immutable SHA-256 content hash on IPFS. Any change to the Skill's code is detectable — Agents verify the hash before execution.", color: "border-primary/20 bg-primary/5" },
              { icon: <Clock className="w-5 h-5 text-amber-400" />, title: "72hr Timelock + Veto", desc: "Metadata updates enter a 72-hour timelock. NFT holders can vote to block suspicious updates before they take effect. Requires 30%+ holder consensus.", color: "border-amber-500/20 bg-amber-500/5" },
              { icon: <Shield className="w-5 h-5 text-emerald-400" />, title: "Creator Stake + Slashing", desc: "Creators stake ETH proportional to their Skill's market cap. Verified malicious updates slash the stake — 50% compensates victims, 20% rewards reporters.", color: "border-emerald-500/20 bg-emerald-500/5" },
            ].map((layer) => (
              <div key={layer.title} className={`border rounded-xl p-6 ${layer.color}`}>
                <div className="flex items-center gap-3 mb-3">
                  {layer.icon}
                  <h3 className="font-semibold">{layer.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{layer.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
