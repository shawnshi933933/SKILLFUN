import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import SkillCard from "@/components/SkillCard";
import { mockSkills } from "@/data/mockSkills";
import { ArrowRight, Zap, Shield, Bot, TrendingUp, Lock, RefreshCw, Users, Code2 } from "lucide-react";

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
              for the Machine Age
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
              { label: "Skills Listed", value: "847" },
              { label: "Agent Purchases", value: "12,441" },
              { label: "Volume (USDC)", value: "1.2M" },
              { label: "Pending Claims", value: "38" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card/60 border border-white/10 rounded-xl p-4 backdrop-blur-sm" data-testid={`stat-${stat.label.toLowerCase().replace(/\s|\(|\)/g, "-")}`}>
                <div className="text-2xl font-bold font-mono text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why SkillMarket</h2>
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
                desc: "AI Agents discover, pay for, and consume Skills without human intervention — using x402 micropayments and ERC-8004 identity. Skills earn while you sleep.",
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
              <div key={pillar.title} className={`relative bg-card border border-white/10 rounded-2xl p-8 overflow-hidden`}>
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
                { step: "03", label: "Agent/Human Uses", sub: "x402 micropayment", icon: <Bot className="w-5 h-5" /> },
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
              持股者再投资 → 联合曲线价格上升 → 吸引更多用户和 Agent → 使用量增加 → 飞轮持续加速
            </div>
          </div>
        </div>
      </section>

      {/* Three Roles */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">三类参与者，一个共同的 Skill 经济体</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">无论你是构建者、投资者还是自主 Agent，每一次交互都在为 Skill 创造价值。</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Code2 className="w-6 h-6" />,
                role: "创作者",
                roleEn: "Creator",
                color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
                glow: "from-purple-500/10",
                bullets: [
                  "将 AI Skill 铸造为 ERC-8239 NFT",
                  "自主设定股份结构与定价",
                  "每次调用均可获得 50% 使用费",
                ],
                cta: "开始创作",
                href: "/app/create",
              },
              {
                icon: <Users className="w-6 h-6" />,
                role: "用户",
                roleEn: "User",
                color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                glow: "from-blue-500/10",
                bullets: [
                  "浏览市场，按需购买 Skill 访问权",
                  "早期持股，随使用量增长获利",
                  "持股者共享 30% 平台使用收益",
                ],
                cta: "浏览市场",
                href: "/app/market",
              },
              {
                icon: <Bot className="w-6 h-6" />,
                role: "AI Agent",
                roleEn: "Agent",
                color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
                glow: "from-cyan-500/10",
                bullets: [
                  "通过 REST API 自主发现 Skill",
                  "x402 协议完成 USDC 微支付",
                  "无需人工干预，全链路自动执行",
                ],
                cta: "查看 Agent API",
                href: "/app/agent-api",
              },
            ].map((r) => (
              <div key={r.role} className="relative bg-card border border-white/10 rounded-2xl p-7 flex flex-col overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${r.glow} to-transparent`} />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${r.color}`}>
                    {r.icon}
                  </div>
                  <div className="mb-1">
                    <span className="font-bold text-xl">{r.role}</span>
                    <span className="text-muted-foreground text-sm ml-2">/ {r.roleEn}</span>
                  </div>
                  <ul className="space-y-2 mt-4 mb-6 flex-1">
                    {r.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5">·</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 hover:bg-white/5 w-full"
                    onClick={() => setLocation(r.href)}
                    data-testid={`button-role-${r.roleEn.toLowerCase()}`}
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
        SkillMarket — ERC-8239 Skill Registry · Built on Sepolia Testnet · POC
      </footer>
    </div>
  );
}
