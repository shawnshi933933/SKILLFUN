import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import SkillCard from "@/components/SkillCard";
import { mockSkills } from "@/data/mockSkills";
import { ArrowRight, Zap, Shield, Bot, TrendingUp, Lock, RefreshCw, Users, Code2, AlertTriangle, Globe } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const featured = mockSkills.slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative max-w-5xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/10 px-4 py-1.5 text-sm">
            Based on ERC-8239 · ERC-8004 Compatible · Sepolia Testnet
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            The Skill Economy
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent">
              Built for the AI Era
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            AI Agent Skills as sovereign NFTs. Traded by humans and autonomous agents alike. Every Skill earns — every holder profits.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8"
              onClick={() => setLocation("/app/market")}
              data-testid="button-launch-app"
            >
              Launch App <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/20 hover:bg-white/5 gap-2"
              onClick={() => setLocation("/app/agent-api")}
              data-testid="button-agent-api"
            >
              <Bot className="w-4 h-4" />
              For Agents
            </Button>
          </div>

          {/* Live Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: "Skills Listed", value: "847", href: null },
              { label: "Agent Purchases", value: "12,441", href: null },
              { label: "Volume (USDC)", value: "1.2M", href: null },
              { label: "Pending Claims", value: "38", href: "/app/claim" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`bg-card/60 border border-white/10 rounded-xl p-4 backdrop-blur-sm ${stat.href ? "cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all" : ""}`}
                onClick={() => stat.href && setLocation(stat.href)}
                data-testid={`stat-${stat.label.toLowerCase().replace(/\s|\(|\)/g, "-")}`}
              >
                <div className="text-2xl font-bold font-mono text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                {stat.href && <div className="text-xs text-primary mt-1">View claims →</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-red-500/30 text-red-400 bg-red-500/10 px-3 py-1 text-xs">
              The Problem
            </Badge>
            <h2 className="text-3xl font-bold mb-4">The AI Economy is Broken</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              AI capabilities are exploding — but the infrastructure to own, monetize, and trade them autonomously doesn't exist yet.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Lock className="w-6 h-6 text-red-400" />,
                title: "Expertise Has No Sovereign Form",
                desc: "AI skills exist as locked API calls behind corporate walls. Creators can't own, sell, or earn royalties on the intelligence they've built. There's no on-chain identity for AI capabilities.",
                border: "border-red-500/20",
                glow: "from-red-500/10",
              },
              {
                icon: <Bot className="w-6 h-6 text-orange-400" />,
                title: "Agents Can't Buy Autonomously",
                desc: "AI Agents need human approval for every transaction. There are no payment rails for autonomous agent-to-agent commerce — making machine economies impossible to operate at scale.",
                border: "border-orange-500/20",
                glow: "from-orange-500/10",
              },
              {
                icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
                title: "No Trust, No Provenance",
                desc: "When an AI Skill updates, buyers have no way to verify the change. Malicious updates can silently alter behavior. There's no slashing, no veto, no recourse for Skill holders.",
                border: "border-amber-500/20",
                glow: "from-amber-500/10",
              },
            ].map((p) => (
              <div key={p.title} className={`relative bg-card border rounded-2xl p-8 overflow-hidden ${p.border}`}>
                <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${p.glow} to-transparent`} />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                    {p.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{p.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why SkillFun — Three Pillars */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/10 px-3 py-1 text-xs">
              The Solution
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Why SkillFun</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Solving the three deepest problems in the AI Agent economy — all in one protocol.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Lock className="w-6 h-6 text-primary" />,
                title: "Skill Sovereignty",
                subtitle: "Your Skill. Your NFT. Forever.",
                desc: "Every Skill is minted as an ERC-8239 NFT with an immutable content hash. Creators retain perpetual on-chain ownership and royalties on every transaction.",
                glow: "from-primary/20",
              },
              {
                icon: <Bot className="w-6 h-6 text-accent" />,
                title: "Machine Economy",
                subtitle: "Agent-to-Agent autonomous trading",
                desc: "AI Agents discover, pay for, and consume Skills without human intervention — using x402 to acquire call rights and ERC-8004 identity. Skills earn while you sleep.",
                glow: "from-accent/20",
              },
              {
                icon: <Shield className="w-6 h-6 text-emerald-400" />,
                title: "Security & Evolution",
                subtitle: "ZK-verified. Version-tracked. Slashing-protected.",
                desc: "Content hash locking, 72-hour timelocks with shareholder veto, and creator stake slashing create a three-layer defense against malicious updates.",
                glow: "from-emerald-500/20",
              },
            ].map((pillar) => (
              <div key={pillar.title} className="relative bg-card border border-white/10 rounded-2xl p-8 overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${pillar.glow} to-transparent`} />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                    {pillar.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-1">{pillar.title}</h3>
                  <p className="text-sm text-primary mb-3">{pillar.subtitle}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-accent/30 text-accent bg-accent/10 px-3 py-1 text-xs">
              Market Opportunity
            </Badge>
            <h2 className="text-3xl font-bold mb-4">A $47B Market Taking Shape Now</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The AI Agent economy is generating real volume today — and SkillFun is building the infrastructure layer.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {[
              { value: "$47B", label: "AI Agent Economy TAM by 2030", color: "text-primary" },
              { value: "500M+", label: "AI Agents projected on-chain by 2027", color: "text-accent" },
              { value: "23%", label: "DEX volume already driven by AI agents", color: "text-emerald-400" },
              { value: "$8.7B", label: "AI services market today", color: "text-purple-400" },
            ].map((m) => (
              <div key={m.label} className="bg-card border border-white/10 rounded-2xl p-6 text-center">
                <div className={`text-3xl font-bold font-mono mb-2 ${m.color}`}>{m.value}</div>
                <div className="text-xs text-muted-foreground leading-snug">{m.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-card border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold mb-0.5">SkillFun sits at the infrastructure layer</div>
                <div className="text-sm text-muted-foreground">Every AI agent that needs a skill must go through a registry. We're building that registry — with ownership, payments, and trust built in.</div>
              </div>
            </div>
            <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 shrink-0" onClick={() => setLocation("/app/market")}>
              Explore Market <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-white/20 text-muted-foreground px-3 py-1 text-xs">
              How It Works
            </Badge>
            <h2 className="text-3xl font-bold mb-4">From Mint to Machine Revenue</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Five steps from expertise to autonomous income — for creators, investors, and AI agents alike.
            </p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute left-[27px] top-8 bottom-8 w-px bg-gradient-to-b from-primary/40 via-accent/20 to-transparent" />
            <div className="space-y-5">
              {[
                {
                  step: "01",
                  title: "Creator Mints a Skill NFT",
                  desc: "Upload your AI Skill, set pricing and share structure. It's minted as an ERC-8239 NFT with an immutable IPFS content hash. Staking ETH signals trust to buyers.",
                  color: "bg-primary/20 border-primary/40 text-primary",
                  tag: "Creator",
                },
                {
                  step: "02",
                  title: "Early Holders Buy Shares on the Bonding Curve",
                  desc: "Investors buy fractional shares of the Skill. As more holders join, price rises. Shareholders earn 30% of every future usage fee — a perpetual income stream.",
                  color: "bg-blue-500/20 border-blue-500/40 text-blue-400",
                  tag: "Investor",
                },
                {
                  step: "03",
                  title: "Agents & Humans Discover and Pay via x402",
                  desc: "AI Agents call GET /api/skills, receive a 402 Payment Required response, then send USDC via x402 to acquire call rights — a license, not a per-call charge. No human approval needed.",
                  color: "bg-accent/20 border-accent/40 text-accent",
                  tag: "Agent / Human",
                },
                {
                  step: "04",
                  title: "Fees Auto-Split On-Chain",
                  desc: "Every usage fee is automatically distributed: Creator 50%, Shareholders 30%, Platform 20%. No invoices, no delays — instant on-chain settlement.",
                  color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
                  tag: "Protocol",
                },
                {
                  step: "05",
                  title: "Flywheel Accelerates",
                  desc: "Shareholders reinvest earnings → bonding curve price rises → more creators and agents are attracted → usage grows → fees increase. The loop is self-reinforcing and fully on-chain.",
                  color: "bg-purple-500/20 border-purple-500/40 text-purple-400",
                  tag: "Growth",
                },
              ].map((s) => (
                <div key={s.step} className="flex gap-5 items-start">
                  <div className={`w-14 h-14 rounded-xl border flex items-center justify-center shrink-0 ${s.color}`}>
                    <div className="text-sm font-mono font-bold">{s.step}</div>
                  </div>
                  <div className="bg-card border border-white/10 rounded-2xl p-5 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-semibold">{s.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${s.color}`}>{s.tag}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Flywheel */}
      <section className="py-24 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">The Economic Flywheel</h2>
          <p className="text-muted-foreground mb-16 max-w-xl mx-auto">
            Every interaction generates value. Every Skill usage feeds the system. Every holder earns.
          </p>
          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { step: "01", label: "Skill Minted", sub: "Creator uploads + stakes", icon: <Zap className="w-5 h-5" /> },
                { step: "02", label: "Shares Sold", sub: "Early holders invest", icon: <TrendingUp className="w-5 h-5" /> },
                { step: "03", label: "Agent/Human Uses", sub: "x402 payment — acquires call rights", icon: <Bot className="w-5 h-5" /> },
                { step: "04", label: "Fees Distributed", sub: "Creator 50% · Holders 30% · Platform 20%", icon: <RefreshCw className="w-5 h-5" /> },
              ].map((step, i) => (
                <div key={step.step} className="relative">
                  <div className="bg-card border border-white/10 rounded-xl p-5 text-left">
                    <div className="text-primary/40 text-xs font-mono mb-3">{step.step}</div>
                    <div className="text-primary mb-3">{step.icon}</div>
                    <div className="font-semibold text-sm mb-1">{step.label}</div>
                    <div className="text-xs text-muted-foreground">{step.sub}</div>
                  </div>
                  {i < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 z-10 text-primary/40">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 border border-primary/20 rounded-xl bg-primary/5 text-sm text-primary/80">
              Shareholders reinvest → Bonding curve rises → More users and Agents attracted → Usage grows → Flywheel accelerates
            </div>
          </div>
          <div className="mt-8">
            <Button variant="outline" className="border-white/20 hover:bg-white/5 gap-2" onClick={() => setLocation("/app/flywheel")}>
              View Live Flywheel Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Three Roles */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Three Ways to Participate</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Whether you build, invest, or automate — every interaction generates value in the Skill Economy.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Code2 className="w-6 h-6" />,
                role: "Creator",
                color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
                glow: "from-purple-500/10",
                bullets: [
                  "Mint AI Skills as ERC-8239 NFTs",
                  "Set your own share structure and pricing",
                  "Earn 50% of every usage fee, forever",
                ],
                cta: "Create a Skill",
                href: "/app/create",
              },
              {
                icon: <Users className="w-6 h-6" />,
                role: "User",
                color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                glow: "from-blue-500/10",
                bullets: [
                  "Browse the market and buy Skill access",
                  "Invest in early shares to profit as usage grows",
                  "Shareholders earn 30% of all platform fees",
                ],
                cta: "Browse Market",
                href: "/app/market",
              },
              {
                icon: <Bot className="w-6 h-6" />,
                role: "AI Agent",
                color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
                glow: "from-cyan-500/10",
                bullets: [
                  "Discover Skills autonomously via REST API",
                  "Pay via x402 to acquire call rights — no approval needed",
                  "Fully automated, end-to-end machine commerce",
                ],
                cta: "View Agent API",
                href: "/app/agent-api",
              },
            ].map((r) => (
              <div key={r.role} className="relative bg-card border border-white/10 rounded-2xl p-7 flex flex-col overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${r.glow} to-transparent`} />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${r.color}`}>
                    {r.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-4">{r.role}</h3>
                  <ul className="space-y-2 mb-6 flex-1">
                    {r.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5 shrink-0">·</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 hover:bg-white/5 w-full"
                    onClick={() => setLocation(r.href)}
                    data-testid={`button-role-${r.role.toLowerCase().replace(" ", "-")}`}
                  >
                    {r.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Skills */}
      <section className="py-24 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold">Featured Skills</h2>
            <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/5" onClick={() => setLocation("/app/market")} data-testid="button-view-all-skills">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-card border border-primary/20 rounded-2xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(139,92,246,0.1),transparent)]" />
            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">Ready to enter the Machine Economy?</h2>
              <p className="text-muted-foreground mb-8">
                Join 847 Skills already generating autonomous revenue.
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-10"
                onClick={() => setLocation("/app/market")}
                data-testid="button-cta-launch"
              >
                Launch App <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 px-4 text-center text-sm text-muted-foreground">
        SkillFun — ERC-8239 Skill Registry · Built on Sepolia Testnet · POC
      </footer>
    </div>
  );
}
