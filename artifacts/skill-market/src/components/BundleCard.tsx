import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Bot, Layers, Coins } from "lucide-react";

export interface BundleCardData {
  id:                  string;
  name:                string;
  description:         string;
  curatorAddress:      string;
  constituentSkillIds: string[];
  apy:                 number;
  stakerPool:          number;
  invocations:         number;
  curatorMarkup:       number;
  tags:                string[];
  isLive:              boolean;
  skillNames?:         string[];
}

export default function BundleCard({ bundle }: { bundle: BundleCardData }) {
  const tags       = bundle.tags ?? [];
  const skillCount = bundle.constituentSkillIds?.length ?? 0;

  return (
    <Link href={`/app/bundle/${bundle.id}`} data-testid={`card-bundle-${bundle.id}`}>
      <div className="group relative bg-card border border-white/10 rounded-xl p-5 hover:border-accent/30 hover:bg-white/5 transition-all duration-200 cursor-pointer h-full flex flex-col">

        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5 text-accent" />
            </div>
            <Badge variant="outline" className="text-xs border-accent/30 text-accent bg-accent/10">Bundle</Badge>
          </div>
          {bundle.apy > 0 ? (
            <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
              {bundle.apy.toFixed(1)}% APY
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs border-primary/30 text-primary gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Live
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-foreground mb-1.5 group-hover:text-accent transition-colors line-clamp-1">
          {bundle.name}
        </h3>
        <p className="text-xs text-muted-foreground/60 mb-1.5">
          by <span className="text-accent/70 font-mono">
            {bundle.curatorAddress.slice(0, 8)}…{bundle.curatorAddress.slice(-6)}
          </span>
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-4">
          {bundle.description || "A curated skill bundle for AI agents."}
        </p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/10">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="border-t border-white/10 pt-3 mt-auto space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Curator Markup</div>
              <div className="font-mono font-semibold text-primary text-sm">+{bundle.curatorMarkup}%</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-0.5">Invocations</div>
              <div className="flex items-center gap-1 text-accent font-mono text-sm">
                <Bot className="w-3 h-3" />
                {bundle.invocations.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {skillCount} Skill{skillCount !== 1 ? "s" : ""}
            </span>
            {bundle.stakerPool > 0 && (
              <span className="flex items-center gap-1 text-emerald-400/80">
                <Coins className="w-3 h-3" />
                {(bundle.stakerPool / 1000).toFixed(1)}K SKILL staked
              </span>
            )}
          </div>
          {bundle.skillNames && bundle.skillNames.length > 0 && (
            <div className="flex items-center gap-1 overflow-hidden">
              {bundle.skillNames.slice(0, 3).map((name) => (
                <span key={name} className="text-xs px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground/70 truncate max-w-[80px]">
                  {name}
                </span>
              ))}
              {bundle.skillNames.length > 3 && (
                <span className="text-xs text-muted-foreground/50">+{bundle.skillNames.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
