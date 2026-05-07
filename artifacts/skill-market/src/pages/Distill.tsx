import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Zap, CheckCircle, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GeneratedSkill {
  name: string;
  description: string;
  category: string;
  tags: string[];
  confidence: number;
}

const mockGenerated: GeneratedSkill[] = [
  {
    name: "Momentum Trading Signal",
    description: "Distilled from 2,400+ posts analyzing crypto momentum patterns. Identifies high-probability breakout setups using volume + price action confluence.",
    category: "Trading",
    tags: ["Momentum", "Technical Analysis", "Signals"],
    confidence: 94,
  },
  {
    name: "Risk Management Framework",
    description: "Systematic position sizing and stop-loss framework derived from documented trading losses and recoveries. Battle-tested across 3 bear markets.",
    category: "Trading",
    tags: ["Risk", "Position Sizing", "Portfolio"],
    confidence: 88,
  },
  {
    name: "Crypto Thread Writing",
    description: "High-engagement content structure extracted from 500+ viral threads. Optimized hook formulas, narrative arcs, and CTA patterns.",
    category: "Writing",
    tags: ["Content", "Threads", "Engagement"],
    confidence: 82,
  },
];

const loadingSteps = [
  "Fetching recent posts from X...",
  "Analyzing content patterns...",
  "Identifying core competencies...",
  "Distilling into Skill definitions...",
  "Scoring confidence levels...",
];

export default function Distill() {
  const { toast } = useToast();
  const [handle, setHandle] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "results">("idle");
  const [loadStep, setLoadStep] = useState(0);
  const [minting, setMinting] = useState<number | null>(null);
  const [minted, setMinted] = useState<number[]>([]);

  const handleAnalyze = async () => {
    if (!handle.trim()) return;
    setState("loading");
    setLoadStep(0);
    for (let i = 0; i < loadingSteps.length; i++) {
      await new Promise((r) => setTimeout(r, 700));
      setLoadStep(i + 1);
    }
    setState("results");
  };

  const handleMint = async (idx: number) => {
    setMinting(idx);
    await new Promise((r) => setTimeout(r, 2000));
    setMinting(null);
    setMinted((prev) => [...prev, idx]);
    toast({ title: "Skill Minted for KOL", description: `Held in platform custody until @${handle} claims it` });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">KOL Skill Distiller</h1>
            <p className="text-muted-foreground text-sm">Platform admin tool</p>
          </div>
        </div>
        <p className="text-muted-foreground mb-10 mt-3">
          Enter a Twitter/X handle to AI-distill their expertise into Skill NFTs. The minted Skills are held in platform custody until the KOL claims them.
        </p>

        <div className="bg-card border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={handle}
                onChange={(e) => setHandle(e.target.value.replace("@", ""))}
                placeholder="twitter_handle (without @)"
                className="pl-10 bg-background border-white/10"
                data-testid="input-twitter-handle"
              />
            </div>
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              onClick={handleAnalyze}
              disabled={state === "loading" || !handle.trim()}
              data-testid="button-analyze"
            >
              <Bot className="w-4 h-4" />
              Analyze
            </Button>
          </div>
        </div>

        {state === "loading" && (
          <div className="bg-card border border-white/10 rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 relative">
                <Bot className="w-8 h-8 text-accent" />
                <div className="absolute inset-0 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">Distilling @{handle}...</p>
            </div>
            <div className="space-y-3 max-w-sm mx-auto">
              {loadingSteps.map((step, i) => (
                <div key={step} className={`flex items-center gap-3 text-sm transition-all ${i < loadStep ? "text-emerald-400" : i === loadStep - 1 ? "text-accent" : "text-muted-foreground/40"}`} data-testid={`load-step-${i}`}>
                  {i < loadStep ? (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  ) : i === loadStep - 1 ? (
                    <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-white/10 shrink-0" />
                  )}
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {state === "results" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 px-3 py-1">
                <CheckCircle className="w-3 h-3 mr-1" />
                Analysis Complete
              </Badge>
              <span className="text-muted-foreground text-sm">3 Skills distilled from @{handle}</span>
            </div>

            {mockGenerated.map((skill, i) => (
              <div key={i} className="bg-card border border-white/10 rounded-2xl p-6" data-testid={`generated-skill-${i}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{skill.name}</h3>
                      <Badge variant="outline" className="border-primary/30 text-primary text-xs">{skill.category}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-xs text-muted-foreground">Confidence:</div>
                      <div className="flex-1 max-w-[120px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${skill.confidence}%` }} />
                      </div>
                      <span className="text-xs font-mono text-accent">{skill.confidence}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{skill.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {skill.tags.map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <p className="text-xs text-muted-foreground">
                    Will be held in platform custody until <span className="text-primary">@{handle}</span> claims it
                  </p>
                  {minted.includes(i) ? (
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                      <CheckCircle className="w-3 h-3 mr-1" /> Minted
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                      onClick={() => handleMint(i)}
                      disabled={minting === i}
                      data-testid={`button-mint-for-kol-${i}`}
                    >
                      <Zap className="w-3 h-3" />
                      {minting === i ? "Minting..." : "Mint for KOL"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
