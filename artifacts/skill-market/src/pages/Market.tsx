import { useState, useEffect } from "react";
import { useSearch, Link } from "wouter";
import Navbar from "@/components/Navbar";
import SkillCard, { type SkillCardData } from "@/components/SkillCard";
import BundleCard, { type BundleCardData } from "@/components/BundleCard";
import { useSkills, useBundles } from "@/hooks/use-skills";
import { type DbSkill, type DbBundle } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Bot, Layers, Zap, Loader2, AlertCircle } from "lucide-react";

const CATEGORIES = ["All", "Trading", "Writing", "Analysis", "Code", "Research", "Social"] as const;

/** Adapt a DbSkill to the shape SkillCard expects */
function adaptSkill(s: DbSkill) {
  const meta = s.meta as Record<string, unknown>;
  return {
    id:                s.skillId,
    name:              (meta.name as string | undefined) ?? s.repoUrl.split("/").pop() ?? s.skillId,
    description:       (meta.description as string | undefined) ?? s.repoUrl,
    category:          (meta.category as string | undefined) ?? "Code",
    version:           (meta.version as string | undefined) ?? "1.0.0",
    basePrice:         (meta.basePrice as number | undefined) ?? 0,
    invocations:       (meta.invocations as number | undefined) ?? 0,
    volume:            (meta.volume as number | undefined) ?? 0,
    creatorShare:      (meta.creatorShare as number | undefined) ?? 80,
    ownerShare:        (meta.ownerShare as number | undefined) ?? 10,
    royaltyRate:       (meta.royaltyRate as number | undefined) ?? 5,
    encryptionEnabled: !!s.rootHash,
    isTimelockPending: false,
    contentHash:       s.rootHash ?? "0x0000000000000000000000000000000000000000000000000000000000000000",
    tokenId:           s.tokenId,
    mintStatus:        s.mintStatus,
    ownerAddress:      s.ownerAddress,
    // Live badge = minted on-chain
    isLive:            s.mintStatus === "minted" || s.mintStatus === "claimed",
  };
}

/** Adapt a DbBundle to the shape BundleCard expects */
function adaptBundle(b: DbBundle & { skillCount?: number }) {
  const meta = b.meta as Record<string, unknown>;
  return {
    id:                  b.bundleId,
    name:                b.name,
    description:         b.description ?? "",
    curatorAddress:      b.ownerAddress,
    skillCount:          b.skillCount ?? 0,
    apy:                 (meta.apy as number | undefined) ?? 0,
    stakerPool:          (meta.stakerPool as number | undefined) ?? 0,
    invocations:         0, // real analytics live on bundle detail page
    curatorMarkup:       (meta.curatorMarkup as number | undefined) ?? 10,
    tags:                (meta.tags as string[] | undefined) ?? [],
    isLive:              true,
    servicePrice:        b.servicePrice,
  };
}

export default function Market() {
  const urlSearch = useSearch();
  const [tab, setTab] = useState<"skills" | "bundles">("skills");

  useEffect(() => {
    const params = new URLSearchParams(urlSearch);
    setTab(params.get("tab") === "bundles" ? "bundles" : "skills");
  }, [urlSearch]);

  const [search, setSearch]             = useState("");
  const [category, setCategory]         = useState<string>("All");
  const [encryptedOnly, setEncryptedOnly] = useState(false);

  const { data: skillsData, isLoading: skillsLoading, error: skillsError } = useSkills();
  const { data: bundlesData, isLoading: bundlesLoading, error: bundlesError } = useBundles();

  const skills  = (skillsData?.skills  ?? []).map(adaptSkill);
  const bundles = (bundlesData?.bundles ?? []).map(adaptBundle);

  const filteredSkills = skills.filter((s) => {
    const matchSearch    = s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory  = category === "All" || s.category === category;
    const matchEncrypted = !encryptedOnly || s.encryptionEnabled;
    return matchSearch && matchCategory && matchEncrypted;
  });

  const filteredBundles = bundles.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalInvocations = skills.reduce((s, k) => s + k.invocations, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">SkillFun Market</h1>
            <p className="text-muted-foreground mt-1">
              {skills.length} Skills · {bundles.length} Bundles
              {totalInvocations > 0 && ` · ${totalInvocations.toLocaleString()} total invocations`}
              {" "}
              <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live on 0G Mainnet
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-card border border-white/10 rounded-lg p-1">
              <button
                onClick={() => setTab("skills")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "skills" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                data-testid="tab-skills"
              >
                <Zap className="w-3.5 h-3.5" /> Skills
              </button>
              <button
                onClick={() => setTab("bundles")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "bundles" ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-foreground"}`}
                data-testid="tab-bundles"
              >
                <Layers className="w-3.5 h-3.5" /> Bundles
              </button>
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search skills, bundles..."
              className="pl-9 bg-card border-white/10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search"
            />
          </div>

          {tab === "skills" && (
            <>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      category === cat
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-card border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                    data-testid={`filter-category-${cat.toLowerCase()}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setEncryptedOnly(!encryptedOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  encryptedOnly
                    ? "bg-primary/20 border-primary/30 text-primary"
                    : "bg-card border-white/10 text-muted-foreground hover:text-foreground"
                }`}
                data-testid="filter-encrypted"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Encrypted
              </button>
            </>
          )}
        </div>

        {/* Loading states */}
        {(skillsLoading || bundlesLoading) && (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading from 0G Mainnet…</span>
          </div>
        )}

        {/* Error states */}
        {(skillsError || bundlesError) && !skillsLoading && !bundlesLoading && (
          <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-xl px-5 py-4 text-sm text-destructive mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            Failed to load data from API. Is the server running?
          </div>
        )}

        {/* Skills grid */}
        {tab === "skills" && !skillsLoading && (
          <>
            {filteredSkills.length === 0 ? (
              <EmptyState
                icon={<Zap className="w-8 h-8 text-muted-foreground" />}
                title="No skills yet"
                description="Be the first to register an AI skill on 0G Chain."
                cta={{ href: "/app/create", label: "Register a Skill" }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="skills-grid">
                {filteredSkills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Bundles grid */}
        {tab === "bundles" && !bundlesLoading && (
          <>
            {filteredBundles.length === 0 ? (
              <EmptyState
                icon={<Layers className="w-8 h-8 text-muted-foreground" />}
                title="No bundles yet"
                description="Bundle skills together into a curated MCP-ready package."
                cta={{ href: "/app/create-bundle", label: "Create a Bundle" }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="bundles-grid">
                {filteredBundles.map((bundle) => (
                  <BundleCard key={bundle.id} bundle={bundle} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      {icon}
      <div>
        <div className="font-semibold text-foreground mb-1">{title}</div>
        <div className="text-sm text-muted-foreground max-w-xs">{description}</div>
      </div>
      <Link href={cta.href}>
        <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">
          {cta.label}
        </Button>
      </Link>
    </div>
  );
}
