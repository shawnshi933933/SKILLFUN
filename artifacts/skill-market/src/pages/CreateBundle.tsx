import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle, Layers, ArrowRight, ArrowLeft, Bot, X,
  Loader2, Package, Shield, AlertTriangle, Search,
  Tag, Star, PackageOpen,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSkills } from "@/hooks/use-skills";
import { useEip712Sign } from "@/hooks/use-eip712";
import { bundlesApi } from "@/lib/api";
import type { DbSkill } from "@/lib/api";

// ── Step order ────────────────────────────────────────────────────────────────
const STEPS = ["Bundle Info", "Select Skills", "Workflow", "Pricing", "Review & Deploy"];

interface FormData {
  name: string;
  description: string;
  workflow: string;
  tags: string;
  markup: number;
  selectedSkillIds: string[];
  /** Per-call price in W0G (decimal, e.g. "0.01"). Empty string = free. */
  servicePriceW0G: string;
}

function getMeta<T>(skill: DbSkill, key: string, fallback: T): T {
  return (skill.meta[key] as T) ?? fallback;
}

function skillDisplayName(skill: DbSkill): string {
  return getMeta<string>(skill, "name", skill.repoUrl.split("/").pop() ?? skill.skillId);
}

function toSubdomain(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "bundle";
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

// ── Sort options ──────────────────────────────────────────────────────────────
type SortKey = "newest" | "stars" | "bundles" | "price_asc" | "price_desc" | "most_used";

const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
  { key: "newest",     label: "Newest",       icon: "🕐" },
  { key: "stars",      label: "⭐ Stars",      icon: "⭐" },
  { key: "bundles",    label: "📦 Bundles",    icon: "📦" },
  { key: "price_asc",  label: "💰 Price ↑",   icon: "💰" },
  { key: "price_desc", label: "💰 Price ↓",   icon: "💰" },
  { key: "most_used",  label: "🔥 Most Used",  icon: "🔥" },
];

function sortSkills(skills: DbSkill[], sort: SortKey): DbSkill[] {
  return [...skills].sort((a, b) => {
    switch (sort) {
      case "stars":
        return (b.githubStars ?? 0) - (a.githubStars ?? 0);
      case "bundles":
        return (b.bundleCount ?? 0) - (a.bundleCount ?? 0);
      case "price_asc":
        return getMeta<number>(a, "basePrice", 0) - getMeta<number>(b, "basePrice", 0);
      case "price_desc":
        return getMeta<number>(b, "basePrice", 0) - getMeta<number>(a, "basePrice", 0);
      case "most_used":
        return getMeta<number>(b, "invocations", 0) - getMeta<number>(a, "invocations", 0);
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CreateBundle() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const sign = useEip712Sign();

  const [step, setStep] = useState(0);
  const [deployState, setDeployState] = useState<"idle" | "creating" | "linking" | "done">("idle");
  const [deployError, setDeployError] = useState<string | null>(null);
  const [createdBundleId, setCreatedBundleId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    workflow: "",
    tags: "",
    markup: 15,
    selectedSkillIds: [],
    servicePriceW0G: "",
  });

  // Skill-picker filter / sort state
  const [search, setSearch]         = useState("");
  const [activeTag, setActiveTag]   = useState<string | null>(null);
  const [sortKey, setSortKey]       = useState<SortKey>("newest");

  const { data: skillsData, isLoading: skillsLoading } = useSkills({ status: "minted" });
  const availableSkills = skillsData?.skills ?? [];

  // ── Derived filter state ───────────────────────────────────────────────────
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    availableSkills.forEach((s) => {
      const skillTags = getMeta<string[]>(s, "tags", []);
      skillTags.forEach((t) => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [availableSkills]);

  const filteredSkills = useMemo(() => {
    let list = availableSkills;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          skillDisplayName(s).toLowerCase().includes(q) ||
          s.repoUrl.toLowerCase().includes(q),
      );
    }
    if (activeTag) {
      list = list.filter((s) => {
        const tags = getMeta<string[]>(s, "tags", []);
        return tags.includes(activeTag);
      });
    }
    return sortSkills(list, sortKey);
  }, [availableSkills, search, activeTag, sortKey]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const update = (key: keyof FormData, value: string | number | string[]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleSkill = (id: string) => {
    setForm((f) => ({
      ...f,
      selectedSkillIds: f.selectedSkillIds.includes(id)
        ? f.selectedSkillIds.filter((s) => s !== id)
        : [...f.selectedSkillIds, id],
    }));
  };

  const selectedSkills   = availableSkills.filter((s) => form.selectedSkillIds.includes(s.skillId));
  const totalBasePrice   = selectedSkills.reduce((sum, s) => sum + getMeta<number>(s, "basePrice", 0), 0);
  const markupAmount     = totalBasePrice * form.markup / 100;
  const curatorEarning   = markupAmount * 0.5 * 0.9;

  // ── Deploy ─────────────────────────────────────────────────────────────────
  // Convert W0G decimal → wei string for the API (e.g. "0.01" → "10000000000000000")
  const servicePriceWei: string | null = (() => {
    const v = form.servicePriceW0G.trim();
    if (!v || v === "0") return null;
    try {
      const wei = BigInt(Math.round(parseFloat(v) * 1e18));
      return wei > 0n ? wei.toString() : null;
    } catch { return null; }
  })();

  const handleDeploy = async () => {
    setDeployError(null);
    try {
      setDeployState("creating");
      const createSig = await sign("create-bundle");
      const subdomain = toSubdomain(form.name);
      const { bundle } = await bundlesApi.create(
        {
          subdomain,
          name: form.name,
          description: form.description || undefined,
          servicePrice: servicePriceWei,
          meta: {
            workflow: form.workflow || undefined,
            tags: form.tags
              ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
              : undefined,
            markup: form.markup,
          },
        },
        createSig,
      );

      setDeployState("linking");
      if (form.selectedSkillIds.length > 0) {
        const skillsSig = await sign("update-bundle-skills");
        await bundlesApi.updateSkills(bundle.bundleId, form.selectedSkillIds, skillsSig);
      }

      setCreatedBundleId(bundle.bundleId);
      setDeployState("done");
      toast({
        title: "Bundle Deployed!",
        description: `${form.name} is now live with an MCP endpoint and x402 W0G payment`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setDeployError(msg);
      setDeployState("idle");
      toast({ title: "Deploy failed", description: msg, variant: "destructive" });
    }
  };

  const deploySteps = [
    { key: "creating", label: "Creating Bundle" },
    { key: "linking",  label: "Linking Skills to MCP endpoint" },
  ];
  const deployOrder = ["creating", "linking", "done"];
  const deployIdx   = deployOrder.indexOf(deployState);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Layers className="w-4 h-4 text-accent" />
          </div>
          <h1 className="text-3xl font-bold">Create a Bundle</h1>
        </div>
        <p className="text-muted-foreground mb-8 mt-1">
          Curate Skills into a themed product with a single MCP endpoint. Add a workflow playbook so agents know how to use your Bundle.
        </p>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5 mb-4" />
          <div className="grid grid-cols-4 gap-2">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`text-xs text-center ${i === step ? "text-accent font-semibold" : i < step ? "text-emerald-400" : "text-muted-foreground"}`}
              >
                {i < step
                  ? <CheckCircle className="w-4 h-4 mx-auto mb-1" />
                  : <div className="w-4 h-4 rounded-full border mx-auto mb-1 flex items-center justify-center text-[10px]">{i + 1}</div>}
                {s}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">

          {/* ── Step 0: Bundle Info ───────────────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold mb-5">Bundle Information</h2>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Bundle Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. DeFi Alpha Suite"
                  className="bg-background border-border"
                  data-testid="input-bundle-name"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="What does this Bundle do? What type of agents will use it?"
                  className="bg-background border-border min-h-[80px]"
                  data-testid="input-bundle-description"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Tags (comma-separated)</label>
                <Input
                  value={form.tags}
                  onChange={(e) => update("tags", e.target.value)}
                  placeholder="DeFi, Trading, Alpha"
                  className="bg-background border-border"
                  data-testid="input-bundle-tags"
                />
              </div>
            </div>
          )}

          {/* ── Step 1: Select Skills ─────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-1">Select Skills</h2>
                <p className="text-sm text-muted-foreground">
                  Choose 2 or more Skills to include. Agents will pay W0G per Skill via invokeSkill + x402.
                </p>
              </div>

              {/* Selected chips */}
              {form.selectedSkillIds.length > 0 && (
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 flex flex-wrap gap-2">
                  {selectedSkills.map((s) => (
                    <div
                      key={s.skillId}
                      className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 rounded-lg px-2 py-1 text-xs text-accent"
                    >
                      {skillDisplayName(s)}
                      <button onClick={() => toggleSkill(s.skillId)} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground self-center ml-auto">
                    {form.selectedSkillIds.length} selected
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or repo…"
                  className="bg-background border-border pl-8 h-9 text-sm"
                  data-testid="skill-search"
                />
              </div>

              {/* Sort chips — always visible */}
              <div>
                <p className="text-[11px] text-muted-foreground mb-1.5 uppercase tracking-wide">Sort by</p>
                <div className="flex flex-wrap gap-1.5">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.key}
                      onClick={() => setSortKey(o.key)}
                      data-testid={`sort-${o.key}`}
                      className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                        sortKey === o.key
                          ? "bg-accent/20 border-accent/40 text-accent font-medium"
                          : "border-border text-muted-foreground hover:border-border hover:text-foreground"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag filter chips */}
              {allTags.length > 0 && (
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1.5 uppercase tracking-wide">Filter by tag</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setActiveTag(null)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-colors ${
                        activeTag === null
                          ? "bg-accent/20 border-accent/40 text-accent"
                          : "border-border text-muted-foreground hover:border-border"
                      }`}
                    >
                      <Tag className="w-3 h-3" /> All
                    </button>
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                        className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                          activeTag === tag
                            ? "bg-accent/20 border-accent/40 text-accent"
                            : "border-border text-muted-foreground hover:border-border"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Skill list */}
              {skillsLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading skills…
                </div>
              ) : availableSkills.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
                  <Package className="w-8 h-8" />
                  <span className="text-sm">No minted Skills found. Mint a Skill first before creating a Bundle.</span>
                </div>
              ) : filteredSkills.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
                  <Search className="w-6 h-6" />
                  <span className="text-sm">No skills match your search.</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {filteredSkills.map((skill) => {
                    const name        = skillDisplayName(skill);
                    const description = getMeta<string>(skill, "description", "");
                    const basePrice   = getMeta<number>(skill, "basePrice", 0);
                    const invocations = getMeta<number>(skill, "invocations", 0);
                    const stars       = skill.githubStars ?? 0;
                    const bundles     = skill.bundleCount ?? 0;
                    const isSelected  = form.selectedSkillIds.includes(skill.skillId);
                    const starsLabel  = stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : String(stars);
                    return (
                      <div
                        key={skill.skillId}
                        onClick={() => toggleSkill(skill.skillId)}
                        data-testid={`select-skill-${skill.skillId}`}
                        className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer transition-all gap-3 ${
                          isSelected
                            ? "border-accent/40 bg-accent/10"
                            : "border-border hover:border-border hover:bg-muted"
                        }`}
                      >
                        {/* Left: checkbox + info */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className={`w-5 h-5 mt-0.5 shrink-0 rounded border flex items-center justify-center ${isSelected ? "bg-accent border-accent" : "border-border"}`}>
                            {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            {/* Name + repo */}
                            <div className="font-medium text-sm">{name}</div>
                            <div className="text-xs text-muted-foreground/60 font-mono truncate">{skill.repoUrl}</div>

                            {/* Description */}
                            {description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{description}</p>
                            )}

                            {/* Stats row — always shown */}
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                                <Star className={`w-3 h-3 ${stars > 0 ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/40"}`} />
                                {stars > 0 ? starsLabel : "—"}
                              </span>
                              <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                                <PackageOpen className={`w-3 h-3 ${bundles > 0 ? "text-accent" : "text-muted-foreground/40"}`} />
                                {bundles > 0 ? `${bundles} bundle${bundles !== 1 ? "s" : ""}` : "—"}
                              </span>
                              {invocations > 0 && (
                                <span className="text-[11px] text-muted-foreground/70">🔥 {invocations.toLocaleString()} uses</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: price or status */}
                        <div className="text-right shrink-0">
                          {basePrice > 0 ? (
                            <>
                              <div className="font-mono text-sm text-foreground">{basePrice} W0G</div>
                              <div className="text-xs text-muted-foreground">per auth</div>
                            </>
                          ) : (
                            <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                              Free
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Workflow ──────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold mb-2">Agent Workflow Playbook</h2>
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 text-xs text-muted-foreground">
                <Bot className="w-3 h-3 inline mr-1 text-accent" />
                This workflow is shown to AI agents when they call{" "}
                <span className="font-mono">initialize</span> on your MCP endpoint. Describe how to
                sequence your Skills to accomplish the Bundle's goal.
              </div>
              {/* Show selected skills as reference */}
              {selectedSkills.length > 0 && (
                <div className="bg-background border border-border rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">
                    Skills in this Bundle ({selectedSkills.length}):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSkills.map((s, i) => (
                      <span key={s.skillId} className="text-xs bg-muted border border-border rounded px-2 py-0.5">
                        <span className="text-muted-foreground mr-1">{i + 1}.</span>
                        {skillDisplayName(s)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  Workflow Description{" "}
                  <span className="text-muted-foreground/50">(optional)</span>
                </label>
                <Textarea
                  value={form.workflow}
                  onChange={(e) => update("workflow", e.target.value)}
                  placeholder={`Example:\n1. Call market-scanner with { query: "ETH whale movements" } → get whale wallet list\n2. Call risk-analyzer with { wallets: <result from step 1> } → get risk scores\n3. Call portfolio-optimizer with { risk_scores: <result from step 2> } → get recommendations\n\nEach skill returns decrypted content you execute locally.`}
                  className="bg-background border-border min-h-[200px] font-mono text-sm"
                  data-testid="input-bundle-workflow"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Leave blank to skip. You can always add or update the workflow later from bundle settings.
              </p>
            </div>
          )}

          {/* ── Step 3: Pricing ──────────────────────────────────────────── */}
          {step === 3 && deployState === "idle" && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold mb-2">Pricing</h2>
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 text-xs text-muted-foreground">
                <Coins className="w-3 h-3 inline mr-1 text-accent" />
                Agents pay this fee once to obtain a proof for the current content version.
                The proof stays valid until the content is updated — then agents pay again for the new version.
                Leave blank (or set to 0) to make the Bundle free.
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground block">
                  Access fee{" "}
                  <span className="text-muted-foreground/50">(W0G per content version, optional)</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="0.001"
                    placeholder="0.00 — free"
                    value={form.servicePriceW0G}
                    onChange={(e) => update("servicePriceW0G", e.target.value)}
                    className="bg-background border-border pr-14"
                    data-testid="input-service-price"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/60 pointer-events-none">
                    W0G
                  </span>
                </div>
                {form.servicePriceW0G && parseFloat(form.servicePriceW0G) > 0 ? (
                  <p className="text-xs text-emerald-400/80">
                    Agents pay <span className="font-mono font-semibold">{parseFloat(form.servicePriceW0G).toFixed(6)} W0G</span> to access each new content version.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground/50">
                    Free — agents access this Bundle at no cost.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Step 4: Review & Deploy ───────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-5">Review & Deploy</h2>
              {deployState === "idle" && (
                <>
                  <div className="bg-background border border-border rounded-xl p-5 space-y-3">
                    {[
                      { label: "Bundle Name",          value: form.name || "—" },
                      { label: "Skills",               value: `${selectedSkills.length} selected` },
                      { label: "Workflow",             value: form.workflow ? `${form.workflow.slice(0, 60)}…` : "None" },
                      { label: "Access Fee",           value: (form.servicePriceW0G && parseFloat(form.servicePriceW0G) > 0) ? `${parseFloat(form.servicePriceW0G).toFixed(6)} W0G / version` : "Free" },
                      { label: "Total Base Price",     value: `${totalBasePrice.toFixed(4)} W0G/invoke` },
                      { label: "Curator Earning (est.)", value: curatorEarning > 0 ? `~${curatorEarning.toFixed(4)} W0G/invoke` : "—" },
                    ].map((r) => (
                      <div key={r.label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{r.label}</span>
                        <span className="font-medium font-mono text-right max-w-[200px] truncate">{r.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 text-xs text-muted-foreground">
                    <Bot className="w-3 h-3 inline mr-1 text-accent" />
                    Deploying creates a Bundle with a single MCP endpoint. Agents discover Skills via{" "}
                    <span className="font-mono">tools/list</span>, pay W0G via{" "}
                    <span className="font-mono">invokeSkill</span>, and receive decrypted Skill content
                    to run locally.
                  </div>
                  {deployError && (
                    <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      {deployError}
                    </div>
                  )}
                  <Button
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                    onClick={handleDeploy}
                    disabled={!form.name.trim()}
                    data-testid="button-deploy-bundle"
                  >
                    <Layers className="w-4 h-4" /> Deploy Bundle
                  </Button>
                </>
              )}
              {deployState !== "idle" && (
                <div className="space-y-4">
                  {deploySteps.map((ds) => {
                    const idx      = deployOrder.indexOf(ds.key);
                    const isDone   = deployIdx > idx;
                    const isActive = deployIdx === idx;
                    return (
                      <div
                        key={ds.key}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                          isDone ? "border-emerald-500/30 bg-emerald-500/5" :
                          isActive ? "border-accent/40 bg-accent/5" : "border-border"
                        }`}
                        data-testid={`deploy-step-${ds.key}`}
                      >
                        {isDone
                          ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                          : isActive
                            ? <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                            : <div className="w-5 h-5 rounded-full border border-border" />}
                        <span className={`text-sm ${isDone ? "text-emerald-400" : isActive ? "text-accent" : "text-muted-foreground"}`}>
                          {ds.label}
                        </span>
                      </div>
                    );
                  })}
                  {deployState === "done" && (
                    <div className="text-center pt-4 space-y-4">
                      <div className="text-2xl font-bold text-emerald-400">Bundle Deployed!</div>
                      <p className="text-muted-foreground text-sm">
                        Your Bundle is live. Agents can now discover and invoke Skills via x402 W0G payment.
                      </p>
                      {selectedSkills.length > 0 && (
                        <div className="text-left bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-amber-400 font-medium mb-1">Authorize your Skills</p>
                            <p className="text-xs text-muted-foreground mb-2">
                              You have {selectedSkills.length} Skill{selectedSkills.length > 1 ? "s" : ""} in this Bundle.
                              Agents can't access them until you authorize each one on-chain.
                            </p>
                            <Button
                              size="sm"
                              className="bg-amber-500 hover:bg-amber-600 text-black gap-1"
                              onClick={() => setLocation("/app/curator/skills")}
                              data-testid="button-go-authorize-skills"
                            >
                              <Shield className="w-3.5 h-3.5" />
                              Manage Authorizations
                            </Button>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-3 justify-center">
                        {createdBundleId && (
                          <Button
                            className="bg-accent hover:bg-accent/90 text-accent-foreground"
                            onClick={() => setLocation(`/app/bundle/${createdBundleId}`)}
                            data-testid="button-view-bundle"
                          >
                            View Bundle
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="border-border"
                          onClick={() => {
                            setStep(0);
                            setDeployState("idle");
                            setDeployError(null);
                            setCreatedBundleId(null);
                            setForm({ name: "", description: "", workflow: "", tags: "", markup: 15, selectedSkillIds: [], servicePriceW0G: "" });
                          }}
                          data-testid="button-create-another"
                        >
                          Create Another
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          {deployState === "idle" && (
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                className="border-border gap-2"
                onClick={() => setStep((s) => Math.max(s - 1, 0))}
                disabled={step === 0}
                data-testid="button-prev-step"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              {step < 4 && (
                <Button
                  className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                  onClick={() => setStep((s) => Math.min(s + 1, 4))}
                  disabled={step === 0 && !form.name.trim()}
                  data-testid="button-next-step"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
