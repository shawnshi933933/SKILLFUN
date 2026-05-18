import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockBundles } from "@/data/mockBundles";
import { TrendingUp, Coins, Shield, AlertTriangle, CheckCircle, ArrowUpRight, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const MY_POSITIONS = mockBundles.filter((b) => (b.myStaked ?? 0) > 0);
const TOTAL_STAKED = MY_POSITIONS.reduce((s, b) => s + (b.myStaked ?? 0), 0);
const DAILY_YIELD = MY_POSITIONS.reduce((s, b) => s + (b.myStaked ?? 0) * b.apy / 100 / 365, 0);

export default function Stake() {
  const { toast } = useToast();
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [amount, setAmount] = useState("500");
  const [staking, setStaking] = useState(false);
  const [unstaking, setUnstaking] = useState<string | null>(null);

  const handleStake = async () => {
    if (!selectedBundle) return;
    setStaking(true);
    await new Promise((r) => setTimeout(r, 1800));
    setStaking(false);
    const bundle = mockBundles.find((b) => b.id === selectedBundle);
    toast({ title: "Staked!", description: `${amount} SKILL staked to ${bundle?.name} (mock — Sepolia testnet)` });
    setSelectedBundle(null);
  };

  const handleUnstake = async (id: string) => {
    setUnstaking(id);
    await new Promise((r) => setTimeout(r, 1800));
    setUnstaking(null);
    const bundle = mockBundles.find((b) => b.id === id);
    toast({ title: "Unstaked", description: `Position withdrawn from ${bundle?.name} (mock)` });
  };

  const bundle = selectedBundle ? mockBundles.find((b) => b.id === selectedBundle) : null;
  const estimatedDailyYield = bundle ? parseInt(amount) * bundle.apy / 100 / 365 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Stake SKILL Tokens</h1>
          <p className="text-muted-foreground">Back Bundles you believe in. Earn 50% of Curator Markup fees as yield. Slashing applies for curator misconduct.</p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Staked", value: `${TOTAL_STAKED.toLocaleString()} SKILL`, icon: <Coins className="w-5 h-5 text-emerald-400" />, color: "text-emerald-400" },
            { label: "Est. Daily Yield", value: `${DAILY_YIELD.toFixed(2)} SKILL`, icon: <TrendingUp className="w-5 h-5 text-accent" />, color: "text-accent" },
            { label: "Active Positions", value: `${MY_POSITIONS.length}`, icon: <Layers className="w-5 h-5 text-primary" />, color: "text-primary" },
            { label: "Slashing Events", value: "0", icon: <Shield className="w-5 h-5 text-emerald-400" />, color: "text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-white/10 rounded-xl p-4" data-testid={`stat-${s.label.toLowerCase().replace(/\s/g, "-")}`}>
              <div className="mb-2">{s.icon}</div>
              <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Stake widget + bundle list */}
          <div className="lg:col-span-2 space-y-6">

            {/* My Positions */}
            {MY_POSITIONS.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-4">My Positions</h2>
                <div className="space-y-3">
                  {MY_POSITIONS.map((b) => (
                    <div key={b.id} className="bg-card border border-white/10 rounded-xl p-5" data-testid={`position-${b.id}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{b.name}</h3>
                            <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">{b.apy.toFixed(1)}% APY</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">by {b.curatorAddress} · +{b.curatorMarkup}% markup</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">Staked</div>
                          <div className="font-mono font-semibold text-foreground">{(b.myStaked ?? 0).toLocaleString()} SKILL</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">Daily Yield</div>
                          <div className="font-mono font-semibold text-emerald-400">+{((b.myStaked ?? 0) * b.apy / 100 / 365).toFixed(2)} SKILL</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">Annual Yield</div>
                          <div className="font-mono font-semibold text-accent">+{((b.myStaked ?? 0) * b.apy / 100).toFixed(0)} SKILL</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/app/bundle/${b.id}`}>
                          <Button variant="outline" size="sm" className="border-white/20 gap-1 text-xs">
                            <ArrowUpRight className="w-3 h-3" /> View Bundle
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1 text-xs" onClick={() => handleUnstake(b.id)} disabled={unstaking === b.id} data-testid={`button-unstake-${b.id}`}>
                          {unstaking === b.id ? "Unstaking..." : "Unstake"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Bundles */}
            <div>
              <h2 className="font-semibold text-lg mb-4">All Bundles</h2>
              <div className="space-y-3">
                {mockBundles.map((b) => (
                  <div key={b.id}
                    onClick={() => setSelectedBundle(b.id === selectedBundle ? null : b.id)}
                    data-testid={`bundle-row-${b.id}`}
                    className={`flex items-center justify-between p-5 rounded-xl border cursor-pointer transition-all ${selectedBundle === b.id ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"} bg-card`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{b.name}</h3>
                        {(b.myStaked ?? 0) > 0 && (
                          <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">Staked</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">by {b.curatorAddress} · {b.constituentSkillIds.length} skills · +{b.curatorMarkup}% markup</p>
                    </div>
                    <div className="flex items-center gap-6 text-right shrink-0 ml-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">Pool</div>
                        <div className="font-mono text-sm">{(b.stakerPool / 1000).toFixed(1)}K SKILL</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">APY</div>
                        <div className="font-mono font-bold text-emerald-400">{b.apy.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Stake Panel */}
          <div className="space-y-5">
            <div className="bg-card border border-white/10 rounded-2xl p-5 sticky top-24">
              <h3 className="font-semibold mb-4">Stake SKILL</h3>

              {!selectedBundle ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Layers className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  Select a Bundle from the list to stake
                </div>
              ) : (
                <>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 mb-4">
                    <div className="font-medium text-sm mb-0.5">{bundle?.name}</div>
                    <div className="text-xs text-muted-foreground">by {bundle?.curatorAddress}</div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm text-muted-foreground mb-2 block">Amount (SKILL)</label>
                    <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-background border-white/10 font-mono" data-testid="input-stake-amount" />
                    <div className="flex gap-2 mt-2">
                      {["100", "500", "1000", "5000"].map((a) => (
                        <button key={a} onClick={() => setAmount(a)} className={`flex-1 py-1 rounded text-xs font-mono transition-colors ${amount === a ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>{a}</button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">APY</span>
                      <span className="font-mono text-emerald-400">{bundle?.apy.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily yield</span>
                      <span className="font-mono text-foreground">+{estimatedDailyYield.toFixed(2)} SKILL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Annual yield</span>
                      <span className="font-mono text-foreground">+{(parseInt(amount || "0") * (bundle?.apy ?? 0) / 100).toFixed(0)} SKILL</span>
                    </div>
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 mb-4 flex items-start gap-2 text-xs text-amber-400">
                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                    Staking carries slashing risk if the curator misbehaves. Research the bundle before staking.
                  </div>

                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={handleStake} disabled={staking || !amount || parseInt(amount) <= 0} data-testid="button-confirm-stake">
                    <Coins className="w-4 h-4" />
                    {staking ? "Staking..." : `Stake ${parseInt(amount || "0").toLocaleString()} SKILL`}
                  </Button>
                </>
              )}
            </div>

            {/* How staking works */}
            <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="font-semibold text-sm mb-1">How Staking Works</div>
              {[
                { icon: <Coins className="w-3 h-3" />, text: "Stake SKILL tokens to any Bundle", color: "text-emerald-400" },
                { icon: <TrendingUp className="w-3 h-3" />, text: "Earn 50% of all Markup fees as yield", color: "text-accent" },
                { icon: <Shield className="w-3 h-3" />, text: "Staking signals curator quality to agents", color: "text-primary" },
                { icon: <AlertTriangle className="w-3 h-3" />, text: "Misconduct slashes your staked SKILL", color: "text-amber-400" },
              ].map((item) => (
                <div key={item.text} className={`flex items-center gap-2 text-xs ${item.color}`}>
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Slash History */}
            <div className="bg-card border border-amber-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <div className="font-semibold text-sm">Slash History (Protocol-wide)</div>
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                Slashes are applied when a curator is found to have manipulated pricing, delivered degraded skills, or failed SLA commitments. Stakers in that bundle lose a portion of their stake proportionally.
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-muted-foreground">
                      <th className="text-left pb-2 font-medium">Bundle</th>
                      <th className="text-left pb-2 font-medium">Reason</th>
                      <th className="text-right pb-2 font-medium">Slash %</th>
                      <th className="text-right pb-2 font-medium">SKILL Lost</th>
                      <th className="text-right pb-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { bundle: "DeFi Quant Suite", reason: "SLA breach (>2s latency)", pct: "5%", lost: "12,400 SKILL", date: "Apr 28, 2026", severity: "low" },
                      { bundle: "Crypto Alpha Bundle", reason: "Pricing manipulation detected", pct: "15%", lost: "38,700 SKILL", date: "Mar 14, 2026", severity: "high" },
                      { bundle: "Social Intel Pack", reason: "Stale data / degraded output", pct: "8%", lost: "9,200 SKILL", date: "Feb 02, 2026", severity: "medium" },
                      { bundle: "Research Toolkit", reason: "Unauthorized skill substitution", pct: "20%", lost: "51,000 SKILL", date: "Jan 11, 2026", severity: "high" },
                    ].map((row) => (
                      <tr key={row.date + row.bundle} className="text-muted-foreground hover:bg-white/5 transition-colors">
                        <td className="py-2.5 text-foreground font-medium">{row.bundle}</td>
                        <td className="py-2.5">{row.reason}</td>
                        <td className={`py-2.5 text-right font-mono font-bold ${row.severity === "high" ? "text-red-400" : row.severity === "medium" ? "text-amber-400" : "text-yellow-300"}`}>{row.pct}</td>
                        <td className="py-2.5 text-right font-mono text-red-400/80">{row.lost}</td>
                        <td className="py-2.5 text-right">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-xs text-muted-foreground/60 flex items-center gap-1">
                <Shield className="w-3 h-3 text-primary" />
                Slash decisions are made by on-chain governance vote. All events are immutably recorded.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
