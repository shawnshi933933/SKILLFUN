import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Bot, Layers, Coins } from "lucide-react";

export interface BundleCardData {
  id:             string;
  name:           string;
  description:    string;
  curatorAddress: string;
  /** Real skill count from DB join — replaces stale meta.skillIds */
  skillCount:     number;
  apy:            number;
  stakerPool:     number;
  invocations:    number;
  curatorMarkup:  number;
  tags:           string[];
  isLive:         boolean;
  skillNames?:    string[];
  /** W0G wei (integer string) agents pay per proof. null/undefined = free. */
  servicePrice?:  string | null;
}

/** Format a wei string as a human-readable W0G amount, e.g. "0.1 W0G" or "Free". */
function formatServicePrice(wei: string | null | undefined): string {
  if (!wei || wei === "0") return "Free";
  try {
    const w0g = Number(BigInt(wei)) / 1e18;
    // Show up to 6 significant digits, strip trailing zeros
    const formatted = w0g.toPrecision(6).replace(/\.?0+$/, "");
    return `${formatted} W0G`;
  } catch {
    return "Free";
  }
}

export default function BundleCard({ bundle }: { bundle: BundleCardData }) {
  const tags       = bundle.tags ?? [];
  const skillCount = bundle.skillCount ?? 0;

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
          <Badge variant="outline" className="text-xs border-primary/30 text-primary gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Live
          </Badge>
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
              <div className="text-xs text-muted-foreground mb-0.5">Service Price</div>
              <div className="flex items-center gap-1 font-mono font-semibold text-sm">
                <Coins className="w-3 h-3 text-yellow-400/80" />
                {formatServicePrice(bundle.servicePrice) === "Free"
                  ? <span className="text-emerald-400">Free</span>
                  : <span className="text-yellow-300/90">{formatServicePrice(bundle.servicePrice)}</span>
                }
              </div>
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
            <span className="flex items-center gap-1 text-emerald-400/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              MCP endpoint
            </span>
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
