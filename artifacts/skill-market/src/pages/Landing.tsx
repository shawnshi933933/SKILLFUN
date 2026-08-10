import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { statsApi } from "@/lib/api";
import { ArrowRight, Bot, Code2, Layers } from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toString();
}

// ── Main component ─────────────────────────────────────────────────────────

export default function Landing() {
  const [, setLocation] = useLocation();

  const { data: stats } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: statsApi.get,
    staleTime: 60_000,
  });

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
          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            {[
              { label: "ERC-7857", href: "https://docs.0g.ai/developer-hub/building-on-0g/agentic-id/erc7857" },
              { label: "Model Context Protocol", href: "https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro" },
              { label: "x402", href: "https://x402.org/" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/8 text-sm font-medium hover:bg-primary/15 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            A Skill is a
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-accent">
              Programmable Asset
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Mint AI Agent Skills as ERC-7857 NFTs on 0G Chain. Bundle them into MCP products. Let agents pay autonomously via x402.
          </p>

          {/* Live stats */}
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-14">
            {liveStats.map((stat) => (
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
              className="group bg-primary/8 hover:bg-primary/15 border border-primary/25 hover:border-primary/45 rounded-2xl p-5 text-left transition-all flex flex-col"
              data-testid="cta-mint-skill"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
                <Code2 className="w-5 h-5 text-primary" />
              </div>
              <div className="font-semibold text-sm mb-1">Mint Skill NFT</div>
              <div className="text-xs text-muted-foreground leading-relaxed flex-1">Mint your GitHub repo as an ERC-7857 NFT. Content is encrypted and stored on 0G Storage.</div>
              <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
                Start creating <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            {/* Curator */}
            <button
              onClick={() => setLocation("/app/curator/skills")}
              className="group bg-accent/8 hover:bg-accent/15 border border-accent/25 hover:border-accent/45 rounded-2xl p-5 text-left transition-all flex flex-col"
              data-testid="cta-curate-bundle"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center mb-4 group-hover:bg-accent/25 transition-colors">
                <Layers className="w-5 h-5 text-accent" />
              </div>
              <div className="font-semibold text-sm mb-1">Curate a Bundle</div>
              <div className="text-xs text-muted-foreground leading-relaxed flex-1">Bundle Skills into one MCP endpoint. Set your price and accept x402 payments from agents.</div>
              <div className="mt-3 flex items-center gap-1 text-xs text-accent font-medium">
                Open curator panel <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            {/* Agent */}
            <button
              onClick={() => setLocation("/app/market?tab=bundles")}
              className="group bg-amber-50 hover:bg-amber-100/70 border border-amber-200 hover:border-amber-300 rounded-2xl p-5 text-left transition-all flex flex-col"
              data-testid="cta-connect-agent"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center mb-4 group-hover:bg-amber-200/70 transition-colors">
                <Bot className="w-5 h-5 text-amber-700" />
              </div>
              <div className="font-semibold text-sm mb-1">Connect as Agent</div>
              <div className="text-xs text-muted-foreground leading-relaxed flex-1">Discover Bundles, call via MCP, pay autonomously with x402. No human approval needed.</div>
              <div className="mt-3 flex items-center gap-1 text-xs text-amber-700 font-medium">
                Browse bundles <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          </div>
        </div>
      </section>


      <div className="bg-primary/5 border-t border-primary/15 py-4" />

      <footer className="border-t border-border py-8 px-4">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {[
            "ERC-7857",
            "Model Context Protocol",
            "x402",
          ].map((label) => (
            <span
              key={label}
              className="px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-xs font-medium text-primary tracking-wide"
            >
              {label}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
