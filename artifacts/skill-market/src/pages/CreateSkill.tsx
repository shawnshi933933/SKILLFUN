import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle, Zap, ArrowRight, ArrowLeft,
  ExternalLink, Loader2, Shield, User, Users,
  Wallet, Github, AlertCircle, FileText, Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSelfMint, type MintPhase } from "@/hooks/use-self-mint";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { githubApi, skillsApi, type GitHubManifestResult, type DbSkill } from "@/lib/api";
import { useAuthMe } from "@/hooks/use-skills";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ["Basic Info", "Ownership", "Economics", "Review & Mint"] as const;
const DRAFT_KEY = "create-skill-draft";
const ZEROG_SCAN     = "https://chainscan.0g.ai";
import { getAddresses } from "@workspace/abi";
const SKILL_NFT_ADDR = getAddresses(16661).SkillNFT;

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormData {
  repoUrl:      string;
  name:         string;
  description:  string;
  instructions: string;
  basePrice:    string;
  capabilities: string;
  tags:         string;
  ownerMode:    "mine" | "community";
}

const INITIAL_FORM: FormData = {
  repoUrl:      "",
  name:         "",
  description:  "",
  instructions: "",
  basePrice:    "0.01",
  capabilities: "",
  tags:         "",
  ownerMode:    "mine",
};

// GitHub fetch state
type FetchStatus = "idle" | "loading" | "found" | "not_found" | "error";
interface GitHubState {
  status:          FetchStatus;
  fileType:        string | null;
  rawContent:      string | null;
  githubUrl:       string | null;
  warning:         string | null;
  fetchedForRepo:  string | null;
  possiblyPrivate: boolean;
}
const INITIAL_GH: GitHubState = {
  status: "idle", fileType: null, rawContent: null, githubUrl: null, warning: null, fetchedForRepo: null, possiblyPrivate: false,
};

// ─── Phase labels ──────────────────────────────────────────────────────────────

const PHASE_LABEL: Record<MintPhase, string> = {
  idle:        "",
  preparing:   "Uploading to 0G Storage…",
  signing_tx:  "Confirm in wallet…",
  confirming:  "Waiting for block…",
  finalizing:  "Registering…",
  done:        "",
  error:       "",
};

// ─── Component ────────────────────────────────────────────────────────────────

// ─── Combined form + AI-fields state (atomic updates prevent race conditions) ──

interface FormState {
  data:     FormData;
  /** Fields whose current value was written by AI (cleared on manual edit). */
  aiFields: Set<string>;
}

const INITIAL_FS: FormState = { data: INITIAL_FORM, aiFields: new Set() };

export default function CreateSkill() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { address } = useAccount();
  const { state: mintState, mint, reset } = useSelfMint();
  const { data: authMe } = useAuthMe();

  const [step, setStep]   = useState(0);
  const [fs, setFs]       = useState<FormState>(INITIAL_FS);
  const [gh, setGh]       = useState<GitHubState>(INITIAL_GH);
  const [duplicate, setDuplicate] = useState<DbSkill | null>(null);

  // ── Restore draft after GitHub OAuth redirect ──────────────────────────────
  useEffect(() => {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      if (saved.fs)   setFs({ data: saved.fs.data, aiFields: new Set(saved.fs.aiFields ?? []) });
      if (saved.step != null) setStep(saved.step);
    } catch { /* corrupt, ignore */ }
    sessionStorage.removeItem(DRAFT_KEY);
  }, []);

  // Save current draft to sessionStorage then navigate (survives OAuth redirect)
  const saveAndGo = (href: string) => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
      fs:   { data: fs.data, aiFields: [...fs.aiFields] },
      step,
    }));
    window.location.href = href;
  };

  // Convenience aliases
  const form     = fs.data;
  const aiFields = fs.aiFields;

  // Ownership mismatch: GitHub is linked AND the repo owner != logged-in GitHub user
  const repoOwner = form.repoUrl.split("/")[0].toLowerCase();
  const ghUser    = authMe?.githubUsername?.toLowerCase() ?? "";
  const ownershipMismatch =
    form.ownerMode === "mine" && !!ghUser && !!repoOwner && ghUser !== repoOwner;

  type AiStatus = "idle" | "loading" | "done" | "error";
  const [aiStatus, setAiStatus] = useState<AiStatus>("idle");

  // Update a form field; if it was previously AI-filled, mark it as manual now.
  // Uses functional update so the check against aiFields is always current.
  const update = (key: keyof FormData, val: string) => {
    setFs((s) => {
      const newAiFields = s.aiFields.has(key)
        ? (new Set(s.aiFields) as Set<string>)
        : s.aiFields;
      if (s.aiFields.has(key)) (newAiFields as Set<string>).delete(key);
      return { data: { ...s.data, [key]: val }, aiFields: newAiFields };
    });
  };

  // ── GitHub auto-fetch on repo blur ─────────────────────────────────────────

  const handleRepoUrlBlur = async () => {
    const raw  = fs.data.repoUrl.trim();
    const repo = raw
      .replace(/^https?:\/\/(www\.)?github\.com\//, "")
      .replace(/\/$/, "");

    if (!repo.includes("/")) {
      if (!fs.data.name && repo) update("name", repo.replace(/[-_]/g, " ").trim());
      return;
    }

    if (gh.status === "loading") return;
    if (gh.status === "found" && gh.fetchedForRepo === repo) return;

    setGh({ ...INITIAL_GH, status: "loading", fetchedForRepo: null });
    setDuplicate(null);

    try {
      // Check for an existing registration AND fetch GitHub manifest in parallel
      const [result, dupCheck] = await Promise.all([
        githubApi.fetchSkillManifest(repo),
        skillsApi.list({ repo }).catch(() => ({ skills: [] as DbSkill[] })),
      ]);

      // If this repo is already registered, surface the existing skill immediately
      const existing = dupCheck.skills[0] ?? null;
      setDuplicate(existing);

      setGh({
        status:          result.found ? "found" : "not_found",
        fileType:        result.fileType,
        rawContent:      result.rawContent,
        githubUrl:       result.githubUrl,
        warning:         result.warning ?? null,
        fetchedForRepo:  repo,
        possiblyPrivate: result.possiblyPrivate ?? false,
      });

      // Auto-fill from parsed data — never overwrite manually-edited fields
      // NOTE: capabilities and tags are AI-only — not prefilled from manifest
      const p = result.parsed;
      const slugName = repo.split("/").pop()!.replace(/[-_]/g, " ").trim();
      setFs((s) => ({
        ...s,
        data: {
          ...s.data,
          name:         s.data.name        || p.name         || slugName,
          description:  s.data.description || p.description  || "",
          basePrice:    s.data.basePrice !== "0.01" ? s.data.basePrice
                          : (p.basePrice != null ? String(p.basePrice) : "0.01"),
          // capabilities and tags intentionally omitted — filled by AI only
        },
      }));

    } catch (err) {
      console.error("[GitHubFetch] error:", err);
      setGh({ ...INITIAL_GH, status: "error", fetchedForRepo: null, warning: "Could not reach GitHub. Fill in the form manually." });
      if (!fs.data.name && raw) {
        update("name", raw.split("/").pop()!.replace(/[-_]/g, " ").trim());
      }
    }
  };

  // ── AI auto-fill ───────────────────────────────────────────────────────────
  // RACE-SAFE: overwrite conditions evaluated inside functional setFs updater,
  // which always receives the LATEST state — even if the user edited fields
  // while the async AI call was in-flight.
  //
  // Accepts optional rawContent/fileType so it can be called from handleRepoUrlBlur
  // (where we already have the content in local variables, before React updates gh state).

  const analyzeWithAi = async (rawContent?: string, fileType?: string) => {
    const content = rawContent ?? gh.rawContent;
    const type    = fileType    ?? gh.fileType;
    if (!content || !type) return;
    setAiStatus("loading");

    try {
      const result = await githubApi.aiAnalyze({
        rawContent: content,
        fileType:   type,
        repoUrl:    fs.data.repoUrl,
      });

      setFs((s) => {
        // Evaluate against LATEST s.data and s.aiFields at response time
        const updates: Partial<FormData> = {};
        const newAiFields = new Set(s.aiFields);

        if (result.description && (!s.data.description || s.aiFields.has("description"))) {
          updates.description = result.description;
          newAiFields.add("description");
        }
        if (result.instructions && (!s.data.instructions || s.aiFields.has("instructions"))) {
          updates.instructions = result.instructions;
          newAiFields.add("instructions");
        }
        // Tags and capabilities are always AI-managed — always overwrite
        if (result.capabilities.length) {
          updates.capabilities = result.capabilities.join(", ");
          newAiFields.add("capabilities");
        }
        if (result.tags.length) {
          updates.tags = result.tags.join(", ");
          newAiFields.add("tags");
        }

        return { data: { ...s.data, ...updates }, aiFields: newAiFields };
      });

      setAiStatus("done");
    } catch (err) {
      console.error("[AI Analyze]", err);
      setAiStatus("error");
      // Show generic message to user; full error already logged by backend
      toast({
        variant:     "destructive",
        title:       "AI analysis failed",
        description: "Could not analyze the skill file. Please try again or fill in the form manually.",
      });
    }
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  // "My Repo" requires a GitHub session to verify ownership
  const needsGithubAuth = form.ownerMode === "mine" && !authMe?.githubUsername;

  const canNext = () => {
    if (step === 0) return gh.status !== "loading" && !duplicate && form.repoUrl.trim().includes("/") && form.name.trim().length > 0;
    if (step === 1) return !!address && !ownershipMismatch && !needsGithubAuth;    // Ownership — wallet connected + GitHub verified (for "mine") + no mismatch
    if (step === 2) return parseFloat(form.basePrice) >= 0;   // Economics — only shown for "mine"
    return true;
  };

  // Skip Economics (step 2) for community mints
  const goNext = () => {
    if (step === 1 && form.ownerMode === "community") { setStep(3); return; }
    setStep((s) => s + 1);
  };
  const goBack = () => {
    if (step === 3 && form.ownerMode === "community") { setStep(1); return; }
    if (step === 0) { setLocation("/app/market"); return; }
    setStep((s) => s - 1);
  };

  // ── Mint ───────────────────────────────────────────────────────────────────

  const handleMint = async () => {
    const capabilities = form.capabilities.split(",").map((s) => s.trim()).filter(Boolean);
    const tags         = form.tags.split(",").map((s) => s.trim()).filter(Boolean);

    try {
      // Community mints are always free (selfAuthorize) — zero out basePrice
      const effectiveBasePrice = form.ownerMode === "community" ? "0" : form.basePrice;

      const basePriceWei = (() => {
        const v = parseFloat(effectiveBasePrice);
        if (!v || v <= 0) return "0";
        return (BigInt(Math.round(v * 1e18))).toString();
      })();

      await mint({
        repoUrl:           form.repoUrl.trim(),
        ownerMode:         form.ownerMode,
        skillFileContent:  gh.rawContent ?? undefined,
        fileType:          gh.fileType   ?? undefined,
        basePriceWei,
        meta: {
          name:         form.name.trim(),
          description:  form.description.trim(),
          instructions: form.instructions.trim() || undefined,
          basePrice:    parseFloat(effectiveBasePrice),
          capabilities,
          tags,
        },
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Mint failed",
        description: (err as Error).message,
      });
    }
  };

  const isMinting = !["idle", "done", "error"].includes(mintState.phase);

  // ── Success screen ──────────────────────────────────────────────────────────
  if (mintState.phase === "done") {
    const isMine = form.ownerMode === "mine";
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 pt-24 pb-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold">Skill Minted!</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {isMine ? (
              <><span className="font-medium text-foreground">{form.name}</span> is now an ERC-7857 iNFT on 0G Chain — owned by your wallet.</>
            ) : (
              <><span className="font-medium text-foreground">{form.name}</span> is now an ERC-7857 iNFT on 0G Chain, held in platform custody. The GitHub owner can claim it later.</>
            )}
          </p>

          <div className="bg-card border border-white/10 rounded-xl p-4 text-left space-y-2.5">
            <StatusRow label="Skill ID"  value={mintState.skillId!} mono />
            <StatusRow label="Token ID"  value={String(mintState.tokenId)} />
            <StatusRow label="Owner"     value={isMine ? "Your wallet" : "Platform custody"} />
            <StatusRow label="TX Hash"   value={mintState.txHash!.slice(0, 20) + "…"} mono />
            {gh.fileType && <StatusRow label="Source File" value={gh.fileType} />}
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <Button
              variant="outline"
              className="border-white/10 gap-2"
              onClick={() => window.open(`${ZEROG_SCAN}/nft/${SKILL_NFT_ADDR}/${mintState.tokenId}`, "_blank")}
            >
              <ExternalLink className="w-4 h-4" /> View on 0G Scan
            </Button>
            <Button
              variant="outline"
              className="border-white/10"
              onClick={() => { reset(); setFs(INITIAL_FS); setGh(INITIAL_GH); setStep(0); setAiStatus("idle"); }}
            >
              Mint another
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={() => setLocation("/app/market")}
            >
              <Zap className="w-4 h-4" /> Go to Market
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Mint a Skill iNFT</h1>
          <p className="text-muted-foreground text-sm">
            Mint your AI Agent Skill as an ERC-7857 iNFT on 0G Chain — directly from your wallet.
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5 mb-4" />
          <div className="flex gap-2">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`flex-1 text-xs text-center py-1 rounded-md transition-colors ${
                  i === step
                    ? "bg-primary/20 text-primary font-semibold"
                    : i < step
                    ? "text-emerald-400"
                    : "text-muted-foreground"
                }`}
              >
                {i < step ? <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> : null}
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-white/10 rounded-2xl p-8 space-y-6">

          {/* ── Step 0: Basic Info ──────────────────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Basic Information</h2>

              <Field label="GitHub Repo" hint="e.g. alice/weather-skill — we'll fetch skill.md automatically">
                <div className="space-y-2">
                  <Input
                    placeholder="owner/repo-name"
                    value={form.repoUrl}
                    onChange={(e) => {
                      const v = e.target.value.replace(/^https?:\/\/(github\.com\/)?/, "");
                      update("repoUrl", v);
                      setGh(INITIAL_GH);
                      setDuplicate(null);
                      setAiStatus("idle");
                      setFs((s) => ({ ...s, aiFields: new Set() }));
                    }}
                    onBlur={handleRepoUrlBlur}
                  />
                  {/* GitHub fetch status badge */}
                  <GitHubBadge gh={gh} onAuthRedirect={saveAndGo} />

                  {/* ── Already registered banner ───────────────────────── */}
                  {duplicate && (
                    <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg border border-amber-500/30 bg-amber-500/8 text-xs">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="text-amber-300 font-medium">This repo is already registered.</span>
                        <span className="text-muted-foreground ml-1">
                          {(duplicate.meta as Record<string,unknown>)?.name as string
                            ? `"${(duplicate.meta as Record<string,unknown>).name as string}" `
                            : ""}
                          was minted
                          {duplicate.tokenId != null ? ` as token #${duplicate.tokenId}` : ""}.
                        </span>
                        <a
                          href={`/app/skill/${duplicate.skillId}`}
                          className="inline-flex items-center gap-1 ml-2 text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
                        >
                          View skill <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                </div>
              </Field>

              <Field label="Skill Name">
                <Input
                  placeholder="e.g. Weather Forecast Skill"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </Field>

              <Field label="Description" aiActive={aiFields.has("description")}>
                <Textarea
                  placeholder="What does this skill do?"
                  rows={3}
                  className="resize-none"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </Field>

              {/* ─── AI Analysis section ─────────────────────────────── */}
              <div className="space-y-4 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">AI Analysis</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Fetch your GitHub repo first, then let AI fill these fields
                    </p>
                  </div>
                  {gh.status === "found" && gh.rawContent && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className={`gap-1.5 text-xs h-7 px-3 border transition-colors ${
                        aiStatus === "done"
                          ? "border-violet-500/40 text-violet-400 bg-violet-500/10"
                          : "border-white/10 text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => analyzeWithAi()}
                      disabled={aiStatus === "loading"}
                    >
                      {aiStatus === "loading" ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Analyzing…</>
                      ) : aiStatus === "done" ? (
                        <><Sparkles className="w-3 h-3" /> Re-analyze with AI</>
                      ) : (
                        <><Sparkles className="w-3 h-3" /> Analyze with AI</>
                      )}
                    </Button>
                  )}
                </div>
                {aiStatus === "done" && (
                  <p className="text-xs text-violet-400/80 -mt-2">
                    AI filled {aiFields.size} field{aiFields.size !== 1 ? "s" : ""}
                  </p>
                )}
                {aiStatus === "error" && (
                  <p className="text-xs text-destructive/80 -mt-2">Analysis failed — try again</p>
                )}

                {/* Instructions for Agents — AI-filled, user-editable */}
                <Field label="Instructions for Agents" hint="How should AI agents invoke this skill? (optional)" aiActive={aiFields.has("instructions")}>
                  <Textarea
                    placeholder="Call this skill when you need to… Pass the following parameters…"
                    rows={3}
                    className="resize-none"
                    value={form.instructions}
                    onChange={(e) => update("instructions", e.target.value)}
                  />
                </Field>

                {/* Capabilities — AI-only, read-only display */}
                <Field label="Capabilities" hint="MCP tool names — filled by AI · not editable" aiActive={aiFields.has("capabilities")}>
                  {form.capabilities ? (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-white/5 border border-white/10 rounded-lg min-h-[38px] items-center">
                      {form.capabilities.split(",").map(c => c.trim()).filter(Boolean).map(cap => (
                        <code key={cap} className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary">
                          {cap}
                        </code>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 bg-white/5 border border-dashed border-white/10 rounded-lg min-h-[38px] text-xs text-muted-foreground/40">
                      {aiStatus === "loading"
                        ? <><Loader2 className="w-3 h-3 animate-spin" /> AI analyzing…</>
                        : <><Sparkles className="w-3 h-3" /> AI will extract tool names from your skill file</>}
                    </div>
                  )}
                </Field>

                {/* Tags — AI-only, read-only display */}
                <Field label="Tags" hint="AI-generated from skill content · not editable" aiActive={aiFields.has("tags")}>
                  {form.tags ? (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-white/5 border border-white/10 rounded-lg min-h-[38px] items-center">
                      {form.tags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                        <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 bg-white/5 border border-dashed border-white/10 rounded-lg min-h-[38px] text-xs text-muted-foreground/40">
                      {aiStatus === "loading"
                        ? <><Loader2 className="w-3 h-3 animate-spin" /> AI analyzing…</>
                        : <><Sparkles className="w-3 h-3" /> AI will generate tags from your skill content</>}
                    </div>
                  )}
                </Field>
              </div>
            </div>
          )}

          {/* ── Step 1: Ownership ───────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Ownership Mode</h2>
              <p className="text-sm text-muted-foreground">
                Who owns the GitHub repo <span className="font-mono text-foreground">{form.repoUrl}</span>?
              </p>

              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => update("ownerMode", "mine")}
                  className={`text-left p-5 rounded-xl border-2 transition-all ${
                    form.ownerMode === "mine"
                      ? "border-primary bg-primary/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${form.ownerMode === "mine" ? "bg-primary/20" : "bg-white/10"}`}>
                      <User className={`w-5 h-5 ${form.ownerMode === "mine" ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm mb-1">My Repo — I own this skill</div>
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        The iNFT is minted directly to <span className="text-foreground">your wallet</span>. You own it immediately and earn 80% of invocation revenue.
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
                        <CheckCircle className="w-3 h-3" /> NFT → your wallet
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => update("ownerMode", "community")}
                  className={`text-left p-5 rounded-xl border-2 transition-all ${
                    form.ownerMode === "community"
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${form.ownerMode === "community" ? "bg-violet-500/20" : "bg-white/10"}`}>
                      <Users className={`w-5 h-5 ${form.ownerMode === "community" ? "text-violet-400" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm mb-1">Community Registration — not my repo</div>
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        The iNFT is minted to the <span className="text-foreground">SkillNFT contract</span> (platform custody). The real GitHub owner can claim it later via the Oracle flow.
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full px-2.5 py-0.5">
                        <Shield className="w-3 h-3" /> NFT → platform custody
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* ── GitHub sign-in required for "My Repo" ──────────── */}
              {needsGithubAuth && (
                <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg border border-sky-500/40 bg-sky-500/10 text-xs">
                  <Github className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <p className="text-sky-300 font-medium">GitHub sign-in required to verify ownership</p>
                    <p className="text-muted-foreground">
                      We need to confirm you own <code className="font-mono text-foreground">{form.repoUrl.split("/")[0]}</code> before minting the iNFT to your wallet.
                    </p>
                    <button
                      type="button"
                      onClick={() => saveAndGo(`/api/auth/github?return_to=${encodeURIComponent(window.location.pathname)}`)}
                      className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium underline underline-offset-2 transition-colors"
                    >
                      <Github className="w-3 h-3" /> Sign in with GitHub
                    </button>
                  </div>
                </div>
              )}

              {/* ── Ownership mismatch warning ─────────────────────── */}
              {ownershipMismatch && (
                <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-amber-300 font-medium">
                      This repo belongs to <code className="font-mono">{repoOwner}</code>, not your GitHub account (<code className="font-mono">{authMe?.githubUsername}</code>).
                    </p>
                    <p className="text-muted-foreground">
                      Select <strong className="text-foreground">Community Registration</strong> instead — the real owner can claim the NFT later via the Oracle flow.
                    </p>
                  </div>
                </div>
              )}

              {!address ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 text-xs text-amber-400">
                    <Wallet className="w-4 h-4 shrink-0" />
                    Connect your wallet to mint — you pay the gas fee on 0G Chain.
                  </div>
                  <div className="flex justify-center">
                    <ConnectButton />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3 text-xs text-emerald-400">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span className="font-mono">{address.slice(0, 8)}…{address.slice(-6)}</span>
                  <span className="text-muted-foreground ml-1">connected · ready to mint</span>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Economics (only for "mine") ─────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Economics</h2>
              <p className="text-sm text-muted-foreground">
                You own this skill — set the price agents pay per invocation. Curators who include
                your Skill in a Bundle will pay this amount to <code className="text-primary/80">purchaseAuthorization</code>.
              </p>

              <Field label="Authorization Fee (W0G)" hint="Fee a Curator pays when authorizing this Skill into their Bundle. Leave 0 to make it free to curate.">
                <div className="flex items-center gap-2">
                  <Input
                    type="number" min="0" step="0.001" placeholder="0.01"
                    value={form.basePrice}
                    onChange={(e) => update("basePrice", e.target.value)}
                    className="w-40"
                  />
                  <span className="text-sm text-muted-foreground">W0G</span>
                </div>
              </Field>
            </div>
          )}

          {/* ── Step 3: Review & Mint ────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Review & Mint</h2>

              <div className="space-y-2 text-sm">
                <ReviewRow label="Repo"         value={form.repoUrl} />
                <ReviewRow label="Name"         value={form.name} />
                {form.ownerMode === "mine" && (
                  <ReviewRow label="Base Price" value={`${form.basePrice} W0G`} />
                )}
                <ReviewRow label="Capabilities" value={form.capabilities || "—"} />
                {form.tags && <ReviewRow label="Tags" value={form.tags} />}
                {form.instructions && <ReviewRow label="Instructions" value={form.instructions.slice(0, 80) + (form.instructions.length > 80 ? "…" : "")} />}
                <ReviewRow
                  label="Ownership"
                  value={form.ownerMode === "mine" ? "My Repo — NFT to my wallet" : "Community — platform custody"}
                />
                <ReviewRow
                  label="0G Storage"
                  value={gh.fileType
                    ? `Real file: ${gh.fileType}`
                    : "Form data (no skill.md found)"}
                />
              </div>

              {/* Source file info */}
              {gh.fileType && gh.githubUrl && (
                <a
                  href={gh.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-primary/80 hover:text-primary bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  Uploading <span className="font-mono">{gh.fileType}</span> from GitHub →
                  <ExternalLink className="w-3 h-3 ml-auto shrink-0" />
                </a>
              )}

              {/* Mint process steps */}
              <div className="bg-card border border-primary/20 rounded-xl p-4 space-y-2 text-xs">
                <div className="text-primary font-medium mb-2">What happens when you click Mint</div>
                <MintStep n={1} label={`Sign EIP-712 message → server uploads ${gh.fileType ?? "manifest"} to 0G Storage`} done={["confirming","finalizing","done"].includes(mintState.phase)} />
                <MintStep n={2} label="Sign transaction in wallet → registerSkill() on 0G Chain" done={["confirming","finalizing","done"].includes(mintState.phase)} />
                <MintStep n={3}
                  label={form.ownerMode === "mine"
                    ? "Block confirms → iNFT arrives in your wallet"
                    : "Block confirms → iNFT held in contract custody"}
                  done={mintState.phase === "done"}
                />
              </div>

              {isMinting && (
                <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  {PHASE_LABEL[mintState.phase]}
                </div>
              )}

              {mintState.phase === "error" && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 text-xs text-destructive">
                  {mintState.error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nav buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            className="border-white/10 gap-1"
            onClick={goBack}
            disabled={isMinting}
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              className="bg-primary hover:bg-primary/90 gap-1"
              onClick={goNext}
              disabled={!canNext() || gh.status === "loading"}
            >
              {gh.status === "loading" && step === 0
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Fetching…</>
                : <>Next <ArrowRight className="w-4 h-4" /></>}
            </Button>
          ) : (
            <Button
              className="bg-primary hover:bg-primary/90 gap-2 min-w-[140px]"
              onClick={handleMint}
              disabled={isMinting || !address}
            >
              {isMinting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {PHASE_LABEL[mintState.phase] || "Minting…"}</>
              ) : (
                <><Zap className="w-4 h-4" /> Mint Skill iNFT</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── GitHub fetch badge ───────────────────────────────────────────────────────

function GitHubBadge({ gh, onAuthRedirect }: { gh: GitHubState; onAuthRedirect?: (href: string) => void }) {
  if (gh.status === "idle") return null;

  if (gh.status === "loading") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Fetching skill manifest from GitHub…
      </div>
    );
  }

  if (gh.status === "found" && gh.fileType) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
          <CheckCircle className="w-3 h-3" />
          Fetched <span className="font-mono">{gh.fileType}</span> from GitHub ✓
        </span>
        {gh.githubUrl && (
          <a
            href={gh.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-3 h-3" /> View file <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
        {gh.warning && (
          <span className="text-xs text-amber-400/80">{gh.warning}</span>
        )}
      </div>
    );
  }

  if (gh.status === "not_found") {
    if (gh.possiblyPrivate) {
      // Repo may be private — suggest re-auth with repo scope
      const repoAuthHref = `/api/auth/github?scope=repo&return_to=${encodeURIComponent(window.location.pathname)}`;
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-amber-400/80">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            No <span className="font-mono mx-0.5">skillfun.json</span> or <span className="font-mono mx-0.5">skill.md</span> found — fill in the form manually.
          </div>
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            <Github className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-xs text-amber-400/90 flex-1">
              Private repo? Grant repository access so we can auto-fill the form.
            </span>
            <button
              type="button"
              onClick={() => onAuthRedirect ? onAuthRedirect(repoAuthHref) : (window.location.href = repoAuthHref)}
              className="text-xs font-medium text-amber-300 hover:text-amber-200 underline underline-offset-2 shrink-0"
            >
              Grant access →
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-400/80">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        No <span className="font-mono mx-0.5">skillfun.json</span> or <span className="font-mono mx-0.5">skill.md</span> found — fill in the form manually.
      </div>
    );
  }

  if (gh.status === "error") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-destructive/80">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        {gh.warning ?? "Could not fetch from GitHub — fill in the form manually."}
      </div>
    );
  }

  return null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label, hint, aiActive = false, children,
}: {
  label: string;
  hint?: string;
  aiActive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium flex items-center gap-2">
        {label}
        {aiActive && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/25 rounded-full px-1.5 py-0.5">
            <Sparkles className="w-2.5 h-2.5" /> AI
          </span>
        )}
      </label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-white/5 last:border-0">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right text-sm truncate max-w-[60%]">{value}</span>
    </div>
  );
}

function StatusRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className={`text-xs text-right truncate max-w-[60%] ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function MintStep({ n, label, done }: { n: number; label: string; done: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${done ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "border-white/20 text-muted-foreground"}`}>
        {done ? "✓" : n}
      </div>
      <span className={done ? "text-emerald-400" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}
