import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Bot, Lock, Package, Star } from "lucide-react";

export interface SkillCardData {
  id:                string;
  name:              string;
  description:       string;
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
  githubStars?:      number;
  creatorAddress?:   string;
}

export default function SkillCard({ skill }: { skill: SkillCardData }) {
  const [, navigate]  = useLocation();
  const tags          = skill.tags         ?? [];
  const bundleCount   = skill.bundleCount  ?? 0;
  const mcpToolName   = skill.mcpToolName  ?? skill.name.toLowerCase().replace(/\s+/g, "_");
  const visibleTags   = tags.slice(0, 3);
  const extraTagCount = tags.length - visibleTags.length;

  function handleTagClick(e: React.MouseEvent, tag: string) {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/app/market?tag=${encodeURIComponent(tag)}`);
  }

  return (
    <Link href={`/app/skill/${skill.id}`} data-testid={`card-skill-${skill.id}`}>
      <div className="group relative bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer h-full flex flex-col">

        {skill.isTimelockPending && (
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="text-xs border-orange-500/40 text-orange-600 bg-orange-500/10 gap-1">
              <Lock className="w-3 h-3" /> Timelock
            </Badge>
          </div>
        )}

        {/* Encryption + live badges */}
        <div className="flex items-start gap-1.5 mb-3">
          {skill.encryptionEnabled && (
            <Badge variant="outline" className="text-xs border-cyan-500/40 text-cyan-700 bg-cyan-500/10 gap-1">
              <Lock className="w-3 h-3" /> Encrypted
            </Badge>
          )}
          {skill.isLive && (
            <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600 gap-1 ml-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
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
            {visibleTags.map((tag) => (
              <button
                key={tag}
                onClick={(e) => handleTagClick(e, tag)}
                className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                {tag}
              </button>
            ))}
            {extraTagCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground/60">
                +{extraTagCount} more
              </span>
            )}
          </div>
        )}

        <div className="border-t border-border pt-3 mt-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Base Price</div>
              <div className="font-semibold tabular-nums text-foreground text-sm">
                {skill.basePrice > 0 ? `${skill.basePrice} W0G` : <span className="text-emerald-600 text-xs">Free</span>}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-0.5">Bundles</div>
              <div className="flex items-center gap-1 tabular-nums text-sm font-semibold">
                <Package className="w-3 h-3 text-muted-foreground" />
                {bundleCount > 0 ? bundleCount : <span className="text-muted-foreground font-normal text-xs">—</span>}
              </div>
            </div>
            {skill.githubStars !== undefined && (
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-0.5">Stars</div>
                <div className="flex items-center gap-1 tabular-nums text-sm font-semibold text-yellow-500 justify-center">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {skill.githubStars >= 1000
                    ? `${(skill.githubStars / 1000).toFixed(1)}k`
                    : skill.githubStars}
                </div>
              </div>
            )}
            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-0.5">Invocations</div>
              <div className="flex items-center gap-1 text-accent tabular-nums text-sm justify-end">
                <Bot className="w-3 h-3" />
                {skill.invocations.toLocaleString()}
              </div>
            </div>
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
