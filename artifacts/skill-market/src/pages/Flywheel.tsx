import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Bot, Zap, TrendingUp, Users, Shield, Lock, Clock, RefreshCw } from "lucide-react";

const volumeData = [
  { day: "Mon", volume: 48200, agents: 980 },
  { day: "Tue", volume: 62400, agents: 1240 },
  { day: "Wed", volume: 55900, agents: 1100 },
  { day: "Thu", volume: 78300, agents: 1560 },
  { day: "Fri", volume: 91200, agents: 1820 },
  { day: "Sat", volume: 84600, agents: 1690 },
  { day: "Sun", volume: 102500, agents: 2050 },
];

const mockFeed = [
  { type: "agent", msg: "GPT-Agent-7f2a purchased Whale Wallet Tracker", time: "2s ago", color: "text-accent" },
  { type: "mint", msg: "New skill minted: MEV Sandwich Detector", time: "14s ago", color: "text-primary" },
  { type: "human", msg: "0x8f3a...b4c5 bought 10 shares of Yield Optimizer", time: "31s ago", color: "text-foreground" },
  { type: "agent", msg: "Claude-3-opus purchased Smart Contract Auditor", time: "48s ago", color: "text-accent" },
  { type: "claim", msg: "@tradingmaster claimed Algorithmic Trading Bot ($380 earnings)", time: "1m ago", color: "text-emerald-400" },
  { type: "agent", msg: "AutoGPT-9z1k purchased Sentiment Analysis Engine", time: "1m ago", color: "text-accent" },
  { type: "human", msg: "0x2c9d...f1e2 bought 5 shares of MEV Bot Strategy", time: "2m ago", color: "text-foreground" },
  { type: "mint", msg: "New skill minted: Cross-chain Bridge Optimizer", time: "3m ago", color: "text-primary" },
];

const STATS = [
  { label: "Total Skills", value: "847", icon: <Zap className="w-5 h-5 text-primary" />, delta: "+12 today" },
  { label: "Total Volume", value: "$1.2M USDC", icon: <TrendingUp className="w-5 h-5 text-accent" />, delta: "+$102K today" },
  { label: "Agent Purchases", value: "12,441", icon: <Bot className="w-5 h-5 text-accent" />, delta: "+2,050 today" },
  { label: "Pending Claims", value: "38", icon: <Users className="w-5 h-5 text-amber-400" />, delta: "4 new KOLs" },
  { label: "Creator Earnings", value: "$680K", icon: <TrendingUp className="w-5 h-5 text-emerald-400" />, delta: "Distributed" },
  { label: "Holder Earnings", value: "$408K", icon: <RefreshCw className="w-5 h-5 text-purple-400" />, delta: "Auto-split" },
];

const FLOW_NODES = [
  { id: 1, label: "Creator Mints", sub: "ERC-8239 NFT + IPFS hash", color: "border-primary/40 bg-primary/10 text-primary" },
  { id: 2, label: "Shares Sold", sub: "Early holders invest at base price", color: "border-blue-500/40 bg-blue-500/10 text-blue-400" },
  { id: 3, label: "Agent / Human Uses", sub: "x402 payment — acquires call rights", color: "border-accent/40 bg-accent/10 text-accent" },
  { id: 4, label: "Fees Collected", sub: "Auto-split on each transaction", color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
  { id: 5, label: "Holders Earn", sub: "Creator 50% · Holders 30% · Platform 20%", color: "border-purple-500/40 bg-purple-500/10 text-purple-400" },
  { id: 6, label: "KOL Claims", sub: "Attributions → promotion → more users", color: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
];

export default function Flywheel() {
  const [feedItems, setFeedItems] = useState(mockFeed);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      const newItem = {
        type: "agent",
        msg: `Agent-${Math.random().toString(36).slice(2, 6).toUpperCase()} purchased ${["Whale Tracker", "Yield Optimizer", "Smart Auditor", "MEV Bot"][Math.floor(Math.random() * 4)]}`,
        time: "just now",
        color: "text-accent",
      };
      setFeedItems((f) => [newItem, ...f.slice(0, 7)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Economic Flywheel</h1>
          <p className="text-muted-foreground">The self-reinforcing value loop powering the Machine Economy.</p>
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
          <h2 className="font-semibold text-lg mb-8 text-center">Economic Flow</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-center">
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
              Holders reinvest → Price rises → More users attracted → Flywheel accelerates
            </div>
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
                    name === "volume" ? `$${(v / 1000).toFixed(1)}K` : v.toLocaleString(),
                    name === "volume" ? "Volume" : "Agent Buys",
                  ]}
                />
                <Bar dataKey="volume" fill="hsl(265,85%,65%)" radius={[4, 4, 0, 0]} opacity={0.8} />
                <Bar dataKey="agents" fill="hsl(185,85%,55%)" radius={[4, 4, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-primary/80" />Volume (USDC)</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-accent/60" />Agent Purchases</div>
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

        {/* Slashing Info */}
        <div className="bg-card border border-white/10 rounded-2xl p-8">
          <h2 className="font-semibold text-lg mb-6">Three-Layer Security Model</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Lock className="w-5 h-5 text-primary" />,
                title: "Content Hash Lock",
                desc: "Every Skill version is stored with an immutable SHA-256 content hash. Any change to the Skill's code is detectable — Agents verify the hash before execution.",
                color: "border-primary/20 bg-primary/5",
              },
              {
                icon: <Clock className="w-5 h-5 text-amber-400" />,
                title: "72hr Timelock + Veto",
                desc: "Metadata updates enter a 72-hour timelock. Skill shareholders holding 30%+ can vote to block suspicious updates before they take effect.",
                color: "border-amber-500/20 bg-amber-500/5",
              },
              {
                icon: <Shield className="w-5 h-5 text-emerald-400" />,
                title: "Creator Stake + Slashing",
                desc: "Creators stake ETH proportional to their Skill's market cap. Verified malicious updates slash the stake — 50% compensates victims, 20% rewards reporters.",
                color: "border-emerald-500/20 bg-emerald-500/5",
              },
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
