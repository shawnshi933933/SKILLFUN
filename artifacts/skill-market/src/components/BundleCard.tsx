import { Link } from "wouter";
import { Bundle } from "@/data/mockBundles";
import { Badge } from "@/components/ui/badge";
import { Bot, Layers, TrendingUp, Coins } from "lucide-react";
import { mockSkills } from "@/data/mockSkills";

interface BundleCardProps {
  bundle: Bundle;
}

export default function BundleCard({ bundle }: BundleCardProps) {
  const skills = bundle.constituentSkillIds
    .map((id) => mockSkills.find((s) => s.id === id))
    .filter(Boolean);

  return (
    <Link href={`/app/bundle/${bundle.id}`} data-testid={`card-bundle-${bundle.id}`}>
      <div className="group relative bg-card border border-white/10 rounded-xl p-5 hover:border-accent/30 hover:bg-white/5 transition-all duration-200 cursor-pointer h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5 text-accent" />
            </div>
            <Badge variant="outline" className="text-xs border-accent/30 text-accent bg-accent/10">
              Bundle
            </Badge>
          </div>
          <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
            {bundle.apy.toFixed(1)}% APY
          </Badge>
        </div>

        <h3 className="font-semibold text-foreground mb-1.5 group-hover:text-accent transition-colors line-clamp-1">
          {bundle.name}
        </h3>
        <p className="text-xs text-muted-foreground/60 mb-1.5">by <span className="text-accent/70">{bundle.curatorAddress}</span></p>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-4">
          {bundle.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {bundle.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/10">
              {tag}
            </span>
          ))}
        </div>

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
              {skills.length} Skills
            </span>
            <span className="flex items-center gap-1 text-emerald-400/80">
              <Coins className="w-3 h-3" />
              {(bundle.stakerPool / 1000).toFixed(1)}K SKILL staked
            </span>
          </div>
          <div className="flex items-center gap-1 overflow-hidden">
            {skills.slice(0, 3).map((s) => s && (
              <span key={s.id} className="text-xs px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground/70 truncate max-w-[80px]">
                {s.name}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="text-xs text-muted-foreground/50">+{skills.length - 3}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
