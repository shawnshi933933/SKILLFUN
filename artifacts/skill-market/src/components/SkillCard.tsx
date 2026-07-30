import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Bot, Lock, Package, Zap } from "lucide-react";

const categoryColors: Record<string, string> = {
  Trading:  "border-yellow-500/40 text-yellow-400 bg-yellow-500/10",
  Writing:  "border-blue-500/40 text-blue-400 bg-blue-500/10",
  Analysis: "border-purple-500/40 text-purple-400 bg-purple-500/10",
  Code:     "border-green-500/40 text-green-400 bg-green-500/10",
  Research: "border-orange-500/40 text-orange-400 bg-orange-500/10",
  Social:   "border-pink-500/40 text-pink-400 bg-pink-500/10",
};

export interface SkillCardData {
  id:                string;
  name:              string;
  description:       string;
  category:          string;
  version:           string;
  basePrice:         number;
  invocations:       number;
  creatorShare:      number;
  ownerShare:        number;
  royaltyRate:       number;
  encryptionEnabled: boolean;
  isTimelockPending: boolean;
  contentHash:       string;
  tokenId:           number | null;
  mintStatus:        string;
  ownerAddress:      string | null;
  isLive:            boolean;
  tags?:             string[];
  mcpToolName?:      string;
  bundleCount?:      number;
  creatorAddress?:   string;
}

export default function SkillCard({ skill }: { skill: SkillCardData }) {
  const tags         = skill.tags         ?? [];
  const bundleCount  = skill.bundleCount  ?? 0;
  const mcpToolName  = skill.mcpToolName  ?? skill.name.toLowerCase().replace(/\s+/g, "_");

  return (
    <Link href={`/app/skill/${skill.id}`} data-testid={`card-skill-${skill.id}`}>
      <div className="group relative bg-card border border-white/10 rounded-xl p-5 hover:border-primary/30 hover:bg-white/5 transition-all duration-200 cursor-pointer h-full flex flex-col">

        {skill.isTimelockPending && (
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="text-xs border-orange-500/40 text-orange-400 bg-orange-500/10 gap-1">
              <Lock className="w-3 h-3" /> Timelock
            </Badge>
          </div>
        )}

        {/* Category + encryption */}
        <div className="flex items-start gap-1.5 mb-3">
          <Badge variant="outline" className={`text-xs ${categoryColors[skill.category] ?? "border-white/20 text-muted-foreground"}`}>
            {skill.category}
          </Badge>
          {skill.encryptionEnabled && (
            <Badge variant="outline" className="text-xs border-cyan-500/40 text-cyan-400 bg-cyan-500/10 gap-1">
              <Lock className="w-3 h-3" /> Encrypted
            </Badge>
          )}
          {skill.isLive && (
            <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 gap-1 ml-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
          {skill.name}
        </h3>
        <p className="text-xs font-mono text-muted-foreground/60 mb-2">{mcpToolName}()</p>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-4">
          {skill.description}
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

        <div className="border-t border-white/10 pt-3 mt-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Base Price</div>
              <div className="font-mono font-semibold text-foreground text-sm">
                {skill.basePrice > 0 ? `${skill.basePrice} W0G` : <span className="text-emerald-400 text-xs">Free</span>}
              </div>
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
              {bundleCount > 0 ? `In ${bundleCount} bundle${bundleCount !== 1 ? "s" : ""}` : "No bundles yet"}
            </span>
            <span className="flex items-center gap-1 text-primary/70">
              <Zap className="w-3 h-3" />
              Auth fee → 100% Owner
            </span>
          </div>
          {skill.creatorAddress && (
            <div className="mt-1.5 text-xs text-muted-foreground">
              by <span className="text-primary font-mono">{skill.creatorAddress.slice(0, 8)}…</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
