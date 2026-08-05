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
    skillCount:     b.skillCount  ?? 0,
    apy:            0,
    stakerPool:     0,
    invocations:    b.invocations ?? 0,
    curatorMarkup:  0,
    tags:           (meta.tags as string[])  ?? [],
    isLive:         true,
    servicePrice:   b.servicePrice,
  };
}

// ── Stat skeleton ──────────────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 animate-pulse">
      <div className="h-8 w-16 bg-muted rounded mb-2" />
      <div className="h-3 w-24 bg-muted/60 rounded" />
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
    <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <div className="font-semibold text-amber-800 text-sm">Connect as Agent</div>
            <div className="text-xs text-amber-600/80">x402 autonomous payments · MCP endpoint</div>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-amber-500" /> : <ChevronDown className="w-4 h-4 text-amber-500" />}
      </button>

      {open && (
        <div className="px-6 pb-5 space-y-3">
          <div className="relative bg-muted border border-border rounded-xl p-4">
            <pre className="text-xs text-foreground/80 font-mono whitespace-pre leading-relaxed overflow-x-auto">{snippet}</pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-background border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50 gap-1.5 text-xs"
              onClick={() => window.open("/mcp/agent-guide.md", "_blank")}
            >
              Full Agent Guide <ArrowRight className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-border hover:bg-muted text-xs"
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
    queryFn: () => skillsApi.list(),
    staleTime: 60_000,
  });

  const { data: bundlesData } = useQuery({
    queryKey: ["landing-bundles"],
    queryFn: () => bundlesApi.list(),
    staleTime: 60_000,
  });

  const featuredSkills: SkillCardData[] = (skillsData?.skills ?? [])
    .filter(s => s.mintStatus === "minted" || s.mintStatus === "claimed")
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative max-w-5xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/8 px-4 py-1.5 text-sm">
            ERC-7857 iNFT · MCP · x402 A2A Payments · 0G Chain
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            A Skill is a
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-accent">
              Programmable Asset
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Mint AI Agent Skills as sovereign NFTs on 0G Chain. Bundle them into MCP products. Let agents pay autonomously via x402.
          </p>

          {/* Live stats */}
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-14">
            {statsLoading
              ? Array.from({ length: 3 }).map((_, i) => <StatSkeleton key={i} />)
              : liveStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-card border border-border rounded-xl p-4 shadow-sm"
                  >
                    <div className="text-2xl font-bold text-foreground tabular-nums">{stat.value ?? "—"}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
          </div>

          {/* Three role CTAs */}
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {/* Creator */}
            <button
              onClick={() => setLocation("/app/create")}
              className="group bg-primary/8 hover:bg-primary/15 border border-primary/25 hover:border-primary/45 rounded-2xl p-5 text-left transition-all"
              data-testid="cta-mint-skill"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
                <Code2 className="w-5 h-5 text-primary" />
              </div>
              <div className="font-semibold text-sm mb-1">Mint Skill NFT</div>
              <div className="text-xs text-muted-foreground leading-relaxed">Mint your GitHub repo as an ERC-7857 iNFT. Content is encrypted and stored on 0G Storage.</div>
              <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
                Start creating <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            {/* Curator */}
            <button
              onClick={() => setLocation("/app/curator/skills")}
              className="group bg-accent/8 hover:bg-accent/15 border border-accent/25 hover:border-accent/45 rounded-2xl p-5 text-left transition-all"
              data-testid="cta-curate-bundle"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center mb-4 group-hover:bg-accent/25 transition-colors">
                <Layers className="w-5 h-5 text-accent" />
              </div>
              <div className="font-semibold text-sm mb-1">Curate a Bundle</div>
              <div className="text-xs text-muted-foreground leading-relaxed">Bundle Skills into a product with one MCP endpoint. Set your service price and accept x402 payments from agents.</div>
              <div className="mt-3 flex items-center gap-1 text-xs text-accent font-medium">
                Open curator panel <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            {/* Agent */}
            <button
              onClick={() => setLocation("/app/market?tab=bundles")}
              className="group bg-amber-50 hover:bg-amber-100/70 border border-amber-200 hover:border-amber-300 rounded-2xl p-5 text-left transition-all"
              data-testid="cta-connect-agent"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center mb-4 group-hover:bg-amber-200/70 transition-colors">
                <Bot className="w-5 h-5 text-amber-700" />
              </div>
              <div className="font-semibold text-sm mb-1">Connect as Agent</div>
              <div className="text-xs text-muted-foreground leading-relaxed">Discover Bundles, call via MCP, pay autonomously with x402. No human approval needed.</div>
              <div className="mt-3 flex items-center gap-1 text-xs text-amber-700 font-medium">
                Browse bundles <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ── Featured Skills ───────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-muted/40">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-semibold">Featured Skills</h2>
              <p className="text-muted-foreground text-sm mt-1">Top Skill NFTs on 0G Chain</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-border hover:bg-muted"
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
                <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse h-48" />
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
                <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse h-48" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-muted/40">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-3">How It Works</h2>
          <p className="text-muted-foreground mb-14">Three steps from expertise to autonomous on-chain income.</p>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              {
                step: "01",
                title: "Register",
                desc: "Creator mints a GitHub repo as an ERC-7857 iNFT on 0G Chain. Content is AES-256 encrypted and stored on 0G Storage.",
                color: "text-primary border-primary/40 bg-primary/10",
              },
              {
                step: "02",
                title: "Curate",
                desc: "Curator bundles Skills into a product with a single MCP endpoint. Set your service price and start accepting x402 payments from agents.",
                color: "text-accent border-accent/40 bg-accent/10",
              },
              {
                step: "03",
                title: "Invoke",
                desc: "AI agents discover bundles, call via MCP, and pay autonomously via x402. NFT owners earn W0G per authorization — on-chain, instantly.",
                color: "text-emerald-700 border-emerald-500/40 bg-emerald-500/10",
              },
            ].map((s) => (
              <div key={s.step} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
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
      <section className="py-24 px-4 bg-muted/40">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-card border border-primary/15 rounded-2xl p-12 relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(124,58,237,0.05),transparent)]" />
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
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8 rounded-full"
                  onClick={() => setLocation("/app/create")}
                  data-testid="button-cta-mint"
                >
                  Mint a Skill <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-accent/30 text-accent hover:bg-accent/10 gap-2 rounded-full"
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
      <div className="bg-primary/5 border-t border-primary/15 py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Powered by 0G</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="text-xs text-muted-foreground">0G Chain (16661) · 0G Storage · 0G DA</span>
        </div>
      </div>

      <footer className="border-t border-border py-8 px-4 text-center text-sm text-muted-foreground">
        SkillFun — ERC-7857 iNFT Registry · MCP · x402 A2A Payments · Built on 0G Chain
      </footer>
    </div>
  );
}
