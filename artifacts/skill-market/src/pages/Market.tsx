import { useState } from "react";
import Navbar from "@/components/Navbar";
import SkillCard from "@/components/SkillCard";
import BundleCard from "@/components/BundleCard";
import { mockSkills, Skill } from "@/data/mockSkills";
import { mockBundles, Bundle } from "@/data/mockBundles";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Bot, Layers, Zap } from "lucide-react";

const CATEGORIES = ["All", "Trading", "Writing", "Analysis", "Code", "Research", "Social"] as const;
const SKILL_SORT = [
  { label: "Most Invoked", value: "invoke-desc" },
  { label: "Price: High", value: "price-desc" },
  { label: "Price: Low", value: "price-asc" },
  { label: "Volume", value: "volume-desc" },
];
const BUNDLE_SORT = [
  { label: "Most Invoked", value: "invoke-desc" },
  { label: "Highest APY", value: "apy-desc" },
  { label: "Biggest Pool", value: "pool-desc" },
];

export default function Market() {
  const [tab, setTab] = useState<"skills" | "bundles">("skills");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [skillSort, setSkillSort] = useState("invoke-desc");
  const [bundleSort, setBundleSort] = useState("invoke-desc");
  const [encryptedOnly, setEncryptedOnly] = useState(false);

  const filteredSkills = mockSkills
    .filter((s: Skill) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "All" || s.category === category;
      const matchEncrypted = !encryptedOnly || s.encryptionEnabled;
      return matchSearch && matchCategory && matchEncrypted;
    })
    .sort((a: Skill, b: Skill) => {
      if (skillSort === "invoke-desc") return b.invocations - a.invocations;
      if (skillSort === "price-desc") return b.basePrice - a.basePrice;
      if (skillSort === "price-asc") return a.basePrice - b.basePrice;
      if (skillSort === "volume-desc") return b.volume - a.volume;
      return 0;
    });

  const filteredBundles = mockBundles
    .filter((b: Bundle) => {
      const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.description.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    })
    .sort((a: Bundle, b: Bundle) => {
      if (bundleSort === "invoke-desc") return b.invocations - a.invocations;
      if (bundleSort === "apy-desc") return b.apy - a.apy;
      if (bundleSort === "pool-desc") return b.stakerPool - a.stakerPool;
      return 0;
    });

  const totalInvocations = mockSkills.reduce((s, k) => s + k.invocations, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">SkillFun Market</h1>
            <p className="text-muted-foreground mt-1">{mockSkills.length} Skills · {mockBundles.length} Bundles · {totalInvocations.toLocaleString()} total invocations</p>
          </div>
          <div className="flex items-center gap-2 bg-card border border-white/10 rounded-xl px-4 py-2 text-sm text-accent">
            <Bot className="w-4 h-4 animate-pulse" />
            <span className="font-mono">7 agent invocations in the last minute</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 bg-card border border-white/10 rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab("skills")}
            data-testid="tab-skills"
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "skills" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Zap className="w-4 h-4" /> Skills
            <Badge variant="outline" className="text-xs border-primary/30 text-primary ml-1">{mockSkills.length}</Badge>
          </button>
          <button
            onClick={() => setTab("bundles")}
            data-testid="tab-bundles"
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "bundles" ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Layers className="w-4 h-4" /> Bundles
            <Badge variant="outline" className="text-xs border-accent/30 text-accent ml-1">{mockBundles.length}</Badge>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-56 shrink-0 space-y-6">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <SlidersHorizontal className="w-3 h-3" /> Category
              </div>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => setCategory(cat)} data-testid={`filter-category-${cat.toLowerCase()}`}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === cat ? "bg-primary/20 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {tab === "skills" && (
              <>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sort Skills</div>
                  <div className="space-y-1">
                    {SKILL_SORT.map((o) => (
                      <button key={o.value} onClick={() => setSkillSort(o.value)} data-testid={`sort-${o.value}`}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${skillSort === o.value ? "bg-primary/20 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Filter</div>
                  <button
                    onClick={() => setEncryptedOnly(!encryptedOnly)}
                    data-testid="filter-encrypted"
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${encryptedOnly ? "bg-emerald-500/20 text-emerald-400 font-medium" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                  >
                    AES-256 Encrypted Only
                  </button>
                </div>
              </>
            )}

            {tab === "bundles" && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sort Bundles</div>
                <div className="space-y-1">
                  {BUNDLE_SORT.map((o) => (
                    <button key={o.value} onClick={() => setBundleSort(o.value)} data-testid={`bundle-sort-${o.value}`}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${bundleSort === o.value ? "bg-accent/20 text-accent font-medium" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={tab === "skills" ? "Search skills by name or description..." : "Search bundles..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card border-white/10"
                data-testid="input-search-skills"
              />
            </div>

            {tab === "skills" && (
              <>
                {encryptedOnly && (
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs cursor-pointer" onClick={() => setEncryptedOnly(false)}>
                      AES-256 Encrypted ×
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-xs h-6 text-muted-foreground" onClick={() => setEncryptedOnly(false)}>Clear</Button>
                  </div>
                )}
                <div className="mb-4 text-sm text-muted-foreground">{filteredSkills.length} Skills found</div>
                {filteredSkills.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">No Skills match your filters.</div>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredSkills.map((skill) => <SkillCard key={skill.id} skill={skill} />)}
                  </div>
                )}
              </>
            )}

            {tab === "bundles" && (
              <>
                <div className="mb-4 text-sm text-muted-foreground">{filteredBundles.length} Bundles found</div>
                {filteredBundles.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">No Bundles match your search.</div>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredBundles.map((bundle) => <BundleCard key={bundle.id} bundle={bundle} />)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
