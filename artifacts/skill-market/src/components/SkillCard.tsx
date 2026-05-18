import { Link } from "wouter";
import { Skill } from "@/data/mockSkills";
import { Badge } from "@/components/ui/badge";
import { Bot, Lock, Package, Zap } from "lucide-react";

const categoryColors: Record<string, string> = {
  Trading: "border-yellow-500/40 text-yellow-400 bg-yellow-500/10",
  Writing: "border-blue-500/40 text-blue-400 bg-blue-500/10",
  Analysis: "border-purple-500/40 text-purple-400 bg-purple-500/10",
  Code: "border-green-500/40 text-green-400 bg-green-500/10",
  Research: "border-orange-500/40 text-orange-400 bg-orange-500/10",
  Social: "border-pink-500/40 text-pink-400 bg-pink-500/10",
};

interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps) {
  return (
    <Link href={`/app/skill/${skill.id}`} data-testid={`card-skill-${skill.id}`}>
      <div className="group relative bg-card border border-white/10 rounded-xl p-5 hover:border-primary/30 hover:bg-white/5 transition-all duration-200 cursor-pointer h-full flex flex-col">
        {skill.isTimelockPending && (
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="text-xs border-orange-500/40 text-orange-400 bg-orange-500/10 gap-1">
              <Lock className="w-3 h-3" />
              Timelock
            </Badge>
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
          <Badge variant="outline" className={`text-xs ${categoryColors[skill.category]}`}>
            {skill.category}
          </Badge>
          {skill.encryptionEnabled && (
            <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-400 bg-emerald-500/10 gap-1 ml-1">
              <Lock className="w-3 h-3" /> AES-256
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
          {skill.name}
        </h3>
        <p className="text-xs font-mono text-muted-foreground/60 mb-2">{skill.mcpToolName}()</p>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-4">
          {skill.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {skill.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/10">
              {tag}
            </span>
          ))}
        </div>

        <div className="border-t border-white/10 pt-3 mt-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Base Price</div>
              <div className="font-mono font-semibold text-foreground text-sm">{skill.basePrice} ETH / call</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-0.5">Invocations</div>
              <div className="flex items-center gap-1 text-accent font-mono text-sm">
                <Bot className="w-3 h-3" />
                {skill.invocations.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              In {skill.bundleCount} bundles
            </span>
            <span className="flex items-center gap-1 text-primary/70">
              <Zap className="w-3 h-3" />
              Creator {skill.creatorShare}% · Owner {skill.ownerShare}%
            </span>
          </div>
          {skill.creatorAddress && (
            <div className="mt-1.5 text-xs text-muted-foreground">
              by <span className="text-primary">{skill.creatorAddress}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
