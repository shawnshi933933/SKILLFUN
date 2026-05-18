import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import SkillCard from "@/components/SkillCard";
import BundleCard from "@/components/BundleCard";
import { mockSkills } from "@/data/mockSkills";
import { mockBundles } from "@/data/mockBundles";
import {
  ArrowRight, Zap, Bot, TrendingUp, Lock, RefreshCw,
  Code2, Globe, Layers, Coins, AlertTriangle, CheckCircle2, Shield
} from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const featuredSkills = mockSkills.slice(0, 4);
  const featuredBundles = mockBundles.slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative max-w-5xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/10 px-4 py-1.5 text-sm">
            ERC-8239 Skill NFT · ERC-8183 MCP Endpoint · x402 A2A Payments · Sepolia Testnet
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            A Skill is a
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent">
              Programmable Asset
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
            Mint AI Agent Skills as sovereign NFTs. Bundle them into products. Let agents pay autonomously via x402. Every invocation earns — forever.
          </p>
          <p className="text-sm text-muted-foreground/60 mb-10">
            Creator earns royalties · Owner holds NFT · Curator bundles skills · Staker earns yield · Agent invokes via single MCP URL
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8" onClick={() => setLocation("/app/market")} data-testid="button-launch-app">
              Browse Market <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg" className="border-white/20 hover:bg-white/5 gap-2" onClick={() => setLocation("/app/agent-api")} data-testid="button-agent-api">
              <Bot className="w-4 h-4" /> For Agents
            </Button>
          </div>

          {/* Live Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: "Skills Listed", value: "847" },
              { label: "Bundles Curated", value: "214" },
              { label: "Agent Invocations", value: "289K" },
              { label: "Total Volume (ETH)", value: "7,841" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card/60 border border-white/10 rounded-xl p-4 backdrop-blur-sm" data-testid={`stat-${stat.label.toLowerCase().replace(/\s|\(|\)/g, "-")}`}>
                <div className="text-2xl font-bold font-mono text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-red-500/30 text-red-400 bg-red-500/10 px-3 py-1 text-xs">The Problem</Badge>
            <h2 className="text-3xl font-bold mb-4">AI Expertise Has No Sovereign Form</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Skills live behind corporate walls. Agents can't pay autonomously. Creators earn $0 in royalties.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Lock className="w-6 h-6 text-red-400" />, title: "$0 Royalties for Creators", desc: "AI skills exist as locked API calls. Creators cannot own, sell, or earn royalties on the intelligence they've built. There's no on-chain identity for AI capabilities.", border: "border-red-500/20", glow: "from-red-500/10" },
              { icon: <Bot className="w-6 h-6 text-orange-400" />, title: "Agents Need Human Approval", desc: "AI Agents need human approval for every transaction. There are no autonomous payment rails — making machine-to-machine commerce impossible at scale.", border: "border-orange-500/20", glow: "from-orange-500/10" },
              { icon: <AlertTriangle className="w-6 h-6 text-amber-400" />, title: "No Trust, No Provenance", desc: "Skill updates happen silently. Buyers have no way to verify what changed. There's no slashing, no veto, no recourse for skill holders.", border: "border-amber-500/20", glow: "from-amber-500/10" },
            ].map((p) => (
              <div key={p.title} className={`relative bg-card border rounded-2xl p-8 overflow-hidden ${p.border}`}>
                <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${p.glow} to-transparent`} />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">{p.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{p.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Primitives */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/10 px-3 py-1 text-xs">The Solution</Badge>
            <h2 className="text-3xl font-bold mb-4">Three Primitives, One Protocol</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">SkillFun solves the three deepest problems in the AI economy with three composable on-chain primitives.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Zap className="w-6 h-6 text-primary" />, title: "Skill NFT", subtitle: "ERC-8239 · Immutable Ownership", desc: "Every AI skill is minted as an on-chain NFT. Creator earns 10% royalties forever. The Owner holds the NFT and earns 90% of base price per call. Content-hash locked, 72hr timelock, creator stake slashing.", glow: "from-primary/20" },
              { icon: <Layers className="w-6 h-6 text-accent" />, title: "Bundle", subtitle: "Curator product · Single MCP endpoint", desc: "Curators assemble Skills into themed Bundles exposed on a single ERC-8183 MCP URL. They add a markup; stakers back the bundle with SKILL tokens and earn yield. AI agents call one URL for multiple capabilities.", glow: "from-accent/20" },
              { icon: <Bot className="w-6 h-6 text-emerald-400" />, title: "x402 A2A Payments", subtitle: "Autonomous Agent-to-Agent commerce", desc: "Agents discover Skills/Bundles, receive 402 Payment Required, send USDC via x402. No human approval. Agent identity via ERC-8004. ZK/TEE execution via ERC-8220. Blob storage via EIP-4844.", glow: "from-emerald-500/20" },
            ].map((p) => (
              <div key={p.title} className="relative bg-card border border-white/10 rounded-2xl p-8 overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${p.glow} to-transparent`} />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">{p.icon}</div>
                  <h3 className="text-xl font-bold mb-1">{p.title}</h3>
                  <p className="text-sm text-primary mb-3">{p.subtitle}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fee Model */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-accent/30 text-accent bg-accent/10 px-3 py-1 text-xs">Fee Model</Badge>
            <h2 className="text-3xl font-bold mb-4">Every Call. Automatic Split. On-Chain.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Total invoice = <strong className="text-foreground">Base Price + Curator Markup</strong>. Platform takes 10% off the top, then splits the remainder transparently on-chain.
            </p>
          </div>
          <div className="bg-card border border-white/10 rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-xs text-muted-foreground mb-2">Example Invoice</div>
                  <div className="text-2xl font-bold font-mono">0.115 ETH</div>
                  <div className="text-xs text-muted-foreground mt-1">Base Price 0.100 + Curator Markup 0.015</div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Platform Fee (10% off total invoice)", amount: "0.0115 ETH", color: "text-muted-foreground", bg: "bg-white/5" },
                    { label: "Creator Royalty (10% of net Base)", amount: "0.0090 ETH", color: "text-purple-400", bg: "bg-purple-500/10 border border-purple-500/20" },
                    { label: "Owner Income (90% of net Base)", amount: "0.0810 ETH", color: "text-blue-400", bg: "bg-blue-500/10 border border-blue-500/20" },
                    { label: "Curator Share (50% of net Markup)", amount: "0.0068 ETH", color: "text-accent", bg: "bg-accent/10 border border-accent/20" },
                    { label: "Staker Pool (50% of net Markup)", amount: "0.0068 ETH", color: "text-emerald-400", bg: "bg-emerald-500/10 border border-emerald-500/20" },
                  ].map((row) => (
                    <div key={row.label} className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm ${row.bg}`}>
                      <span className={row.color}>{row.label}</span>
                      <span className={`font-mono font-medium ${row.color}`}>{row.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Five Participant Roles</div>
                {[
                  { role: "Creator", desc: "Mints Skill NFT, earns 10% royalty on every Base Price call. Perpetual, on-chain.", color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
                  { role: "Owner", desc: "Holds the Skill NFT. Earns 90% of Base Price on every invocation. Can sell/transfer NFT.", color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
                  { role: "Curator", desc: "Assembles Bundles, sets Markup %. Earns 50% of all Markup fees. No NFT ownership required.", color: "text-accent border-accent/30 bg-accent/10" },
                  { role: "Staker", desc: "Stakes SKILL tokens to Bundles. Earns 50% of Markup fees as yield. Slashed for misconduct.", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
                  { role: "Agent", desc: "Invokes via single MCP URL. Pays x402 per call. No human approval needed. ERC-8004 identity.", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
                ].map((r) => (
                  <div key={r.role} className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm ${r.color}`}>
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <div><span className="font-semibold">{r.role} — </span><span className="opacity-80 font-normal">{r.desc}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-white/20 text-muted-foreground px-3 py-1 text-xs">How It Works</Badge>
            <h2 className="text-3xl font-bold mb-4">From Mint to Machine Revenue</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Five steps from AI expertise to autonomous on-chain income.</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute left-[27px] top-8 bottom-8 w-px bg-gradient-to-b from-primary/40 via-accent/20 to-transparent" />
            <div className="space-y-5">
              {[
                { step: "01", title: "Creator Mints a Skill NFT", desc: "Upload your AI skill, set base price. Minted as ERC-8239 NFT with immutable IPFS content hash. Encrypted payload optional (AES-256 / KMS). Creator stakes ETH to signal trust.", color: "bg-primary/20 border-primary/40 text-primary", tag: "Creator" },
                { step: "02", title: "Owner Holds the Asset", desc: "The NFT can be sold on secondary markets. Owner earns 90% of every Base Price invocation — passive, perpetual, on-chain income. Creator continues to earn 10% royalty regardless of who owns it.", color: "bg-blue-500/20 border-blue-500/40 text-blue-400", tag: "Owner" },
                { step: "03", title: "Curator Bundles Skills into a Product", desc: "Curators select Skills, set a Markup %, and publish a Bundle with a single ERC-8183 MCP endpoint. No NFT ownership required. The Bundle is discoverable by AI agents immediately.", color: "bg-accent/20 border-accent/40 text-accent", tag: "Curator" },
                { step: "04", title: "Stakers Back the Bundle", desc: "SKILL token holders stake to Bundles they believe in. Stakers earn 50% of Markup fees as yield. Misbehaving curators slash the staker pool — aligning incentives with quality.", color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400", tag: "Staker" },
                { step: "05", title: "Agent Invokes via x402", desc: "Agent GETs the MCP URL → receives HTTP 402 → sends USDC via x402 → fee splits on-chain instantly. Agent identity via ERC-8004. ZK proof of execution via ERC-8220.", color: "bg-purple-500/20 border-purple-500/40 text-purple-400", tag: "Agent" },
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

      {/* Five Roles */}
      <section className="py-24 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Five Ways to Participate</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Every role generates value. Every interaction earns. The economy is self-reinforcing.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: <Code2 className="w-5 h-5" />, role: "Creator", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", earn: "10% royalty perpetually", cta: "Mint Skill", href: "/app/create" },
              { icon: <Coins className="w-5 h-5" />, role: "Owner", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", earn: "90% of base price / call", cta: "Browse Market", href: "/app/market" },
              { icon: <Layers className="w-5 h-5" />, role: "Curator", color: "text-accent bg-accent/10 border-accent/20", earn: "50% of markup fees", cta: "Create Bundle", href: "/app/create-bundle" },
              { icon: <TrendingUp className="w-5 h-5" />, role: "Staker", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", earn: "50% of markup as yield", cta: "Stake SKILL", href: "/app/stake" },
              { icon: <Bot className="w-5 h-5" />, role: "Agent", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", earn: "Autonomous skill access", cta: "View API", href: "/app/agent-api" },
            ].map((r) => (
              <div key={r.role} className="bg-card border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${r.color}`}>{r.icon}</div>
                <h3 className="font-bold text-base mb-1">{r.role}</h3>
                <p className="text-xs text-muted-foreground mb-4 flex-1">{r.earn}</p>
                <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/5 w-full text-xs" onClick={() => setLocation(r.href)} data-testid={`button-role-${r.role.toLowerCase()}`}>
                  {r.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-accent/30 text-accent bg-accent/10 px-3 py-1 text-xs">Market Opportunity</Badge>
            <h2 className="text-3xl font-bold mb-4">A $47B Market Taking Shape Now</h2>
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
                <div className="font-semibold mb-0.5">SkillFun is the infrastructure layer</div>
                <div className="text-sm text-muted-foreground">Every AI agent that needs a skill must go through a registry. We're building that registry — with ownership, payments, and trust built in.</div>
              </div>
            </div>
            <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 shrink-0" onClick={() => setLocation("/app/market")}>
              Explore Market <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Skills */}
      <section className="py-24 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold">Featured Skills</h2>
              <p className="text-muted-foreground text-sm mt-1">Top-performing Skill NFTs by invocation count</p>
            </div>
            <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/5" onClick={() => setLocation("/app/market")} data-testid="button-view-all-skills">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredSkills.map((skill) => <SkillCard key={skill.id} skill={skill} />)}
          </div>
        </div>
      </section>

      {/* Featured Bundles */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold">Popular Bundles</h2>
              <p className="text-muted-foreground text-sm mt-1">Curated skill combinations with single MCP endpoints</p>
            </div>
            <Button variant="outline" size="sm" className="border-accent/30 text-accent hover:bg-accent/10" onClick={() => setLocation("/app/market")} data-testid="button-view-all-bundles">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {featuredBundles.map((bundle) => <BundleCard key={bundle.id} bundle={bundle} />)}
          </div>
        </div>
      </section>

      {/* Flywheel */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">The Economic Flywheel</h2>
          <p className="text-muted-foreground mb-12 max-w-xl mx-auto">Every invocation generates value. Every fee is split on-chain. Every role earns.</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {[
              { step: "01", label: "Creator Mints", sub: "ERC-8239 NFT", icon: <Code2 className="w-5 h-5" />, color: "text-purple-400" },
              { step: "02", label: "Owner Earns", sub: "90% base price", icon: <Coins className="w-5 h-5" />, color: "text-blue-400" },
              { step: "03", label: "Curator Bundles", sub: "Single MCP URL", icon: <Layers className="w-5 h-5" />, color: "text-accent" },
              { step: "04", label: "Staker Backs", sub: "SKILL token yield", icon: <TrendingUp className="w-5 h-5" />, color: "text-emerald-400" },
              { step: "05", label: "Agent Pays", sub: "x402 autonomous", icon: <Bot className="w-5 h-5" />, color: "text-amber-400" },
            ].map((n, i) => (
              <div key={n.step} className="relative">
                <div className="bg-card border border-white/10 rounded-xl p-4 text-left">
                  <div className="text-white/30 text-xs font-mono mb-2">{n.step}</div>
                  <div className={`mb-2 ${n.color}`}>{n.icon}</div>
                  <div className={`font-semibold text-sm mb-0.5 ${n.color}`}>{n.label}</div>
                  <div className="text-xs text-muted-foreground">{n.sub}</div>
                </div>
                {i < 4 && <div className="hidden md:block absolute top-1/2 -right-2 z-10 text-white/30 text-lg">→</div>}
              </div>
            ))}
          </div>
          <div className="p-4 border border-primary/20 rounded-xl bg-primary/5 text-sm text-primary/80 mb-8">
            <RefreshCw className="w-4 h-4 inline mr-2" />
            More invocations → More earnings → More creators → More skills → Better bundles → More agent demand → Flywheel accelerates
          </div>
          <Button variant="outline" className="border-white/20 hover:bg-white/5 gap-2" onClick={() => setLocation("/app/flywheel")}>
            View Live Flywheel Dashboard <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-card border border-primary/20 rounded-2xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(139,92,246,0.1),transparent)]" />
            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">Treat your Skill as an Asset</h2>
              <p className="text-muted-foreground mb-8">847 Skills already generating autonomous revenue on Sepolia.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-10" onClick={() => setLocation("/app/market")} data-testid="button-cta-launch">
                  Browse Market <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/5 gap-2" onClick={() => setLocation("/app/create")}>
                  Mint a Skill
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 px-4 text-center text-sm text-muted-foreground">
        SkillFun — ERC-8239 Skill Registry · ERC-8183 MCP · x402 A2A Payments · Built on Sepolia Testnet · POC
      </footer>
    </div>
  );
}
