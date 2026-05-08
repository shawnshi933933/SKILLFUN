import { useState } from "react";
import Navbar from "@/components/Navbar";
import SkillCard from "@/components/SkillCard";
import { mockSkills, Skill } from "@/data/mockSkills";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Bot } from "lucide-react";

const CATEGORIES = ["All", "Trading", "Writing", "Analysis", "Code", "Research", "Social"] as const;
const STATUS_OPTIONS = ["All", "Claimed", "Unclaimed"] as const;
const SORT_OPTIONS = [
  { label: "Price: High", value: "price-desc" },
  { label: "Price: Low", value: "price-asc" },
  { label: "Volume", value: "volume-desc" },
  { label: "Agent Buys", value: "agent-desc" },
];

export default function Market() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [status, setStatus] = useState<string>("All");
  const [sort, setSort] = useState("volume-desc");

  const filtered = mockSkills
    .filter((s: Skill) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "All" || s.category === category;
      const matchStatus =
        status === "All" ||
        (status === "Claimed" && s.claimedBy !== null) ||
        (status === "Unclaimed" && s.claimedBy === null);
      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a: Skill, b: Skill) => {
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "volume-desc") return b.volume - a.volume;
      if (sort === "agent-desc") return b.agentPurchaseCount - a.agentPurchaseCount;
      return 0;
    });

  const totalAgentBuys = mockSkills.reduce((sum, s) => sum + s.agentPurchaseCount, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">SkillFun</h1>
            <p className="text-muted-foreground mt-1">{mockSkills.length} Skills · {totalAgentBuys.toLocaleString()} Agent purchases</p>
          </div>
          <div className="flex items-center gap-2 bg-card border border-white/10 rounded-xl px-4 py-2 text-sm text-accent">
            <Bot className="w-4 h-4 animate-pulse" />
            <span className="font-mono">3 Agent purchases in the last minute</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-56 shrink-0 space-y-6">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <SlidersHorizontal className="w-3 h-3" /> Category
              </div>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    data-testid={`filter-category-${cat.toLowerCase()}`}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      category === cat
                        ? "bg-primary/20 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Status</div>
              <div className="space-y-1">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    data-testid={`filter-status-${s.toLowerCase()}`}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      status === s
                        ? "bg-primary/20 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sort by</div>
              <div className="space-y-1">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setSort(o.value)}
                    data-testid={`sort-${o.value}`}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      sort === o.value
                        ? "bg-primary/20 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search skills by name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card border-white/10"
                data-testid="input-search-skills"
              />
            </div>

            {/* Active filters */}
            {(category !== "All" || status !== "All") && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-xs text-muted-foreground">Active:</span>
                {category !== "All" && (
                  <Badge variant="outline" className="border-primary/30 text-primary text-xs cursor-pointer" onClick={() => setCategory("All")}>
                    {category} ×
                  </Badge>
                )}
                {status !== "All" && (
                  <Badge variant="outline" className="border-primary/30 text-primary text-xs cursor-pointer" onClick={() => setStatus("All")}>
                    {status} ×
                  </Badge>
                )}
                <Button variant="ghost" size="sm" className="text-xs h-6 text-muted-foreground" onClick={() => { setCategory("All"); setStatus("All"); }}>
                  Clear all
                </Button>
              </div>
            )}

            <div className="mb-4 text-sm text-muted-foreground">{filtered.length} Skills found</div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                No Skills match your filters.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
