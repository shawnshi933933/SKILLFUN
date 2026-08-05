import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import SkillCard, { type SkillCardData } from "@/components/SkillCard";
import BundleCard, { type BundleCardData } from "@/components/BundleCard";
import { statsApi, skillsApi, bundlesApi, type DbSkill, type DbBundle } from "@/lib/api";
import { ArrowRight, Bot, Code2, Layers, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toString();
}

function skillToCard(s: DbSkill): SkillCardData {
  const meta = (s.meta ?? {}) as Record<string, unknown>;
  return {
    id:                s.skillId,
    name:              (meta.name as string)         || s.repoUrl.split("/").pop() || s.repoUrl,
    description:       (meta.description as string)  || "",
    basePrice:         (meta.basePrice as number)    ?? 0,
    invocations:       0,
    creatorShare:      10,
    ownerShare:        90,
    royaltyRate:       10,
    encryptionEnabled: true,
    isTimelockPending: false,
    contentHash:       s.rootHash ?? "",
    tokenId:           s.tokenId,
    mintStatus:        s.mintStatus,
    ownerAddress:      s.ownerAddress,
    isLive:            s.mintStatus === "minted" || s.mintStatus === "claimed",
    tags:              (meta.tags as string[])       ?? [],
    bundleCount:       s.bundleCount,
  };
}

function bundleToCard(b: DbBundle): BundleCardData {
  const meta = (b.meta ?? {}) as Record<string, unknown>;
  return {
    id:             b.bundleId,
    name:           b.name,
    description:    b.description ?? "",
    curatorAddress: b.ownerAddress,
    skillCount:     (meta.skillCount as number) ?? 0,
    apy:            0,
    stakerPool:     0,
    invocations:    0,
    curatorMarkup:  0,
    tags:           (meta.tags as string[])  ?? [],
    isLive:         true,
    servicePrice:   b.servicePrice,
  };
}

// ── Stat skeleton ──────────────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <div className="bg-card/60 border border-white/10 rounded-xl p-4 backdrop-blur-sm animate-pulse">
      <div className="h-8 w-16 bg-white/10 rounded mb-2" />
      <div className="h-3 w-24 bg-white/5 rounded" />
    </div>
  );
}

// ── Agent Connect block ────────────────────────────────────────────────────

function AgentConnectBlock() {
  const [open, setOpen]     = useState(false);
  const [copied, setCopied] = useState(false);

  const snippet = `# 1. Discover bundles
GET /api/bundles

# 2. Call the MCP endpoint (agent pays via x402)
GET /mcp/{bundle-subdomain}
→ HTTP 402 Payment Required
→ Send W0G via x402 header
→ Access granted`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="font-semibold text-amber-300 text-sm">Connect as Agent</div>
            <div className="text-xs text-amber-400/70">x402 autonomous payments · ERC-8183 MCP endpoint</div>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-amber-400/60" /> : <ChevronDown className="w-4 h-4 text-amber-400/60" />}
      </button>

      {open && (
        <div className="px-6 pb-5 space-y-3">
          <div className="relative bg-black/40 border border-white/10 rounded-xl p-4">
            <pre className="text-xs text-white/70 font-mono whitespace-pre leading-relaxed overflow-x-auto">{snippet}</pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 gap-1.5 text-xs"
              onClick={() => window.open("/mcp/agent-guide.md", "_blank")}
            >
              Full Agent Guide <ArrowRight className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 hover:bg-white/5 text-xs"
              onClick={() => { window.location.href = "/app/market?tab=bundles"; }}
            >
              Browse Bundles
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function Landing() {
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: statsApi.get,
    staleTime: 60_000,
  });

  const { data: skillsData } = useQuery({
    queryKey: ["landing-skills"],
    queryFn: () => skillsApi.list({ status: "minted" }),
    staleTime: 60_000,
  });

  const { data: bundlesData } = useQuery({
    queryKey: ["landing-bundles"],
    queryFn: () => bundlesApi.list(),
    staleTime: 60_000,
  });

  const featuredSkills: SkillCardData[] = (skillsData?.skills ?? [])
    .slice(0, 4)
    .map(skillToCard);

  const featuredBundles: BundleCardData[] = (bundlesData?.bundles ?? [])
    .slice(0, 3)
    .map(bundleToCard);

  const liveStats = [
    { label: "Skills Listed",      value: stats ? formatCompact(stats.totalSkills)      : null },
    { label: "Bundles Curated",    value: stats ? formatCompact(stats.totalBundles)     : null },
    { label: "Agent Invocations",  value: stats ? formatCompact(stats.totalInvocations) : null },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative max-w-5xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/10 px-4 py-1.5 text-sm">
            ERC-7857 iNFT · ERC-8183 MCP · x402 A2A Payments · 0G Chain
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            A Skill is a
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent">
              Programmable Asset
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Mint AI Agent Skills as sovereign NFTs. Bundle them into products. Let agents pay autonomously via x402. Every invocation earns — forever.
          </p>

          {/* Live stats */}
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-14">
            {statsLoading
              ? Array.from({ length: 3 }).map((_, i) => <StatSkeleton key={i} />)
              : liveStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-card/60 border border-white/10 rounded-xl p-4 backdrop-blur-sm"
                  >
                    <div className="text-2xl font-bold text-foreground">{stat.value ?? "—"}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
          </div>

          {/* Three role CTAs */}
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {/* Creator */}
            <button
              onClick={() => setLocation("/app/create")}
              className="group bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 rounded-2xl p-5 text-left transition-all"
              data-testid="cta-mint-skill"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                <Code2 className="w-5 h-5 text-primary" />
              </div>
              <div className="font-semibold text-sm mb-1">Mint Skill NFT</div>
              <div className="text-xs text-muted-foreground leading-relaxed">Register your AI skill on-chain. Earn 10% royalty on every invocation, forever.</div>
              <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
                Start creating <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            {/* Curator */}
            <button
              onClick={() => setLocation("/app/curator/skills")}
              className="group bg-accent/10 hover:bg-accent/20 border border-accent/30 hover:border-accent/50 rounded-2xl p-5 text-left transition-all"
              data-testid="cta-curate-bundle"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                <Layers className="w-5 h-5 text-accent" />
              </div>
              <div className="font-semibold text-sm mb-1">Curate a Bundle</div>
              <div className="text-xs text-muted-foreground leading-relaxed">Assemble Skills into a themed product with one MCP URL. Earn 50% of markup fees.</div>
              <div className="mt-3 flex items-center gap-1 text-xs text-accent font-medium">
                Open curator panel <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            {/* Agent */}
            <button
              onClick={() => setLocation("/app/market?tab=bundles")}
              className="group bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 rounded-2xl p-5 text-left transition-all"
              data-testid="cta-connect-agent"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4 group-hover:bg-amber-500/30 transition-colors">
                <Bot className="w-5 h-5 text-amber-400" />
              </div>
              <div className="font-semibold text-sm mb-1">Connect as Agent</div>
              <div className="text-xs text-muted-foreground leading-relaxed">Discover Bundles, call via MCP, pay autonomously with x402. No human approval.</div>
              <div className="mt-3 flex items-center gap-1 text-xs text-amber-400 font-medium">
                Browse bundles <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ── Featured Skills ───────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-semibold">Featured Skills</h2>
              <p className="text-muted-foreground text-sm mt-1">Top Skill NFTs on 0G Chain</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 hover:bg-white/5"
              onClick={() => setLocation("/app/market")}
              data-testid="button-view-all-skills"
            >
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>

          {featuredSkills.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredSkills.map((skill) => <SkillCard key={skill.id} skill={skill} />)}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card border border-white/10 rounded-2xl p-5 animate-pulse h-48" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Popular Bundles ───────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-semibold">Popular Bundles</h2>
              <p className="text-muted-foreground text-sm mt-1">Curated skill sets with single MCP endpoints</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-accent/30 text-accent hover:bg-accent/10"
              onClick={() => setLocation("/app/market?tab=bundles")}
              data-testid="button-view-all-bundles"
            >
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>

          {featuredBundles.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-5">
              {featuredBundles.map((bundle) => <BundleCard key={bundle.id} bundle={bundle} />)}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card border border-white/10 rounded-2xl p-5 animate-pulse h-48" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-card/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-3">How It Works</h2>
          <p className="text-muted-foreground mb-14">Three steps from expertise to autonomous on-chain income.</p>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              {
                step: "01",
                title: "Register",
                desc: "Creator mints their AI skill as an ERC-7857 iNFT. Content is encrypted and stored on 0G Storage. Earns 10% royalty perpetually.",
                color: "text-primary border-primary/40 bg-primary/10",
              },
              {
                step: "02",
                title: "Curate",
                desc: "Curator bundles skills into a themed product published on a single ERC-8183 MCP endpoint. Sets markup and earns 50% of fees.",
                color: "text-accent border-accent/40 bg-accent/10",
              },
              {
                step: "03",
                title: "Earn",
                desc: "AI agents discover the bundle, pay via x402, and invoke the skill. Fees split on-chain instantly — creator, owner, curator, staker all earn.",
                color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
              },
            ].map((s) => (
              <div key={s.step} className="bg-card border border-white/10 rounded-2xl p-6">
                <div className={`inline-flex w-10 h-10 rounded-xl border items-center justify-center mb-4 ${s.color}`}>
                  <span className="text-xs font-mono font-bold">{s.step}</span>
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Agent Connect ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">Integrate Your Agent</h2>
            <p className="text-muted-foreground text-sm">One MCP endpoint. Autonomous x402 payments. Zero human approval.</p>
          </div>
          <AgentConnectBlock />
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-card/30">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-card border border-primary/20 rounded-2xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(139,92,246,0.08),transparent)]" />
            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">Treat your Skill as an Asset</h2>
              <p className="text-muted-foreground mb-8 text-sm">
                {stats && stats.totalSkills > 0
                  ? `${formatCompact(stats.totalSkills)} Skills already on 0G Chain.`
                  : "The registry is live on 0G Chain."}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8"
                  onClick={() => setLocation("/app/create")}
                  data-testid="button-cta-mint"
                >
                  Mint a Skill <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-accent/30 text-accent hover:bg-accent/10 gap-2"
                  onClick={() => setLocation("/app/curator/skills")}
                  data-testid="button-cta-curate"
                >
                  <Layers className="w-4 h-4" /> Curate a Bundle
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 0G Strip ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0a0a0f] via-[#0d1a2e] to-[#0a0a0f] border-t border-cyan-500/20 py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase">Powered by 0G</span>
          <span className="text-white/20">·</span>
          <span className="text-xs text-white/40">0G Chain (16661) · 0G Storage · 0G DA</span>
        </div>
      </div>

      <footer className="border-t border-white/10 py-8 px-4 text-center text-sm text-muted-foreground">
        SkillFun — ERC-7857 iNFT Registry · ERC-8183 MCP · x402 A2A Payments · Built on 0G Chain
      </footer>
    </div>
  );
}
