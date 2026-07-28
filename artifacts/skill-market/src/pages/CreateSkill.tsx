import { useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle, Zap, ArrowRight, ArrowLeft,
  ExternalLink, Loader2, Lock, Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateSkill } from "@/hooks/use-create-skill";
import { useAccount } from "wagmi";
import type { DbSkill } from "@/lib/api";

const STEPS = ["Basic Info", "Economics", "Review & Submit"] as const;
const CATEGORIES = ["Code", "Analysis", "Writing", "Trading", "Research", "Social"] as const;
const DEFAULT_CAPABILITIES = ["answer_question", "process_data", "generate_report"];

interface FormData {
  repoUrl:       string;
  name:          string;
  description:   string;
  category:      string;
  version:       string;
  basePrice:     string;
  capabilities:  string;  // comma-separated
  tags:          string;  // comma-separated
}

const INITIAL_FORM: FormData = {
  repoUrl:       "",
  name:          "",
  description:   "",
  category:      "Code",
  version:       "1.0.0",
  basePrice:     "0.01",
  capabilities:  DEFAULT_CAPABILITIES.join(", "),
  tags:          "",
};

export default function CreateSkill() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { address } = useAccount();
  const createSkill = useCreateSkill();

  const [step, setStep]   = useState(0);
  const [form, setForm]   = useState<FormData>(INITIAL_FORM);
  const [result, setResult] = useState<DbSkill | null>(null);

  const update = (key: keyof FormData, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  // Auto-fill name from repoUrl if blank
  const handleRepoUrlBlur = () => {
    if (!form.name && form.repoUrl) {
      const part = form.repoUrl.split("/").pop() ?? "";
      update("name", part.replace(/[-_]/g, " ").trim());
    }
  };

  const canNext = () => {
    if (step === 0) return form.repoUrl.trim().includes("/") && form.name.trim().length > 0;
    if (step === 1) return parseFloat(form.basePrice) >= 0;
    return true;
  };

  const handleSubmit = async () => {
    const capabilities = form.capabilities
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const tags = form.tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const data = await createSkill.mutateAsync({
        repoUrl:       form.repoUrl.trim(),
        manifestOwner: form.repoUrl.trim(),  // community mint: owner = repo path
        ownerAddress:  address,
        meta: {
          name:         form.name.trim(),
          description:  form.description.trim(),
          category:     form.category,
          version:      form.version.trim(),
          basePrice:    parseFloat(form.basePrice),
          capabilities,
          tags,
        },
      });
      setResult(data.skill);
      toast({
        title: "Skill registered!",
        description: `${form.name} is pending review. Once approved, admin will mint it on 0G Chain.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: (err as Error).message,
      });
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 pt-24 pb-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold">Skill Submitted!</h1>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{form.name}</span> has been registered
            and is pending admin review. Once approved it will be minted as an ERC-7857 iNFT on 0G
            Chain and appear in the market.
          </p>

          <div className="bg-card border border-white/10 rounded-xl p-4 text-left space-y-2">
            <StatusRow label="Skill ID" value={result.skillId} mono />
            <StatusRow label="Repo" value={result.repoUrl} />
            <StatusRow label="Review status" value={result.reviewStatus} />
            <StatusRow label="Mint status" value={result.mintStatus} />
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              className="border-white/10"
              onClick={() => { setResult(null); setForm(INITIAL_FORM); setStep(0); }}
            >
              Register another
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
          <h1 className="text-3xl font-bold mb-1">Register a Skill</h1>
          <p className="text-muted-foreground text-sm">
            Submit your AI Agent Skill for review. After approval, admin will mint it as an
            ERC-7857 iNFT on 0G Chain — manifest stored on 0G Storage.
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

          {/* ── Step 0: Basic Info ─────────────────────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Basic Information</h2>

              <Field label="GitHub Repo URL" hint="e.g. alice/weather-skill or github.com/alice/weather-skill">
                <Input
                  placeholder="owner/repo-name"
                  value={form.repoUrl}
                  onChange={(e) => update("repoUrl", e.target.value.replace(/^https?:\/\/(github\.com\/)?/, ""))}
                  onBlur={handleRepoUrlBlur}
                  data-testid="input-repo-url"
                />
              </Field>

              <Field label="Skill Name">
                <Input
                  placeholder="e.g. Weather Forecast Skill"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  data-testid="input-skill-name"
                />
              </Field>

              <Field label="Description">
                <Textarea
                  placeholder="What does this skill do? What problems does it solve?"
                  rows={3}
                  className="resize-none"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  data-testid="input-description"
                />
              </Field>

              <Field label="Category">
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => update("category", cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        form.category === cat
                          ? "bg-primary/20 border-primary/40 text-primary"
                          : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground"
                      }`}
                      data-testid={`button-category-${cat.toLowerCase()}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Version">
                <Input
                  placeholder="1.0.0"
                  value={form.version}
                  onChange={(e) => update("version", e.target.value)}
                  className="w-32"
                />
              </Field>
            </div>
          )}

          {/* ── Step 1: Economics ──────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Economics</h2>

              <Field label="Base Price (A0GI per invocation)" hint="Amount agents pay to invoke your skill via x402">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.001"
                    placeholder="0.01"
                    value={form.basePrice}
                    onChange={(e) => update("basePrice", e.target.value)}
                    className="w-40"
                    data-testid="input-base-price"
                  />
                  <span className="text-sm text-muted-foreground">A0GI</span>
                </div>
              </Field>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 text-xs">
                <div className="font-medium text-muted-foreground mb-2">Revenue Split</div>
                {[
                  { label: "Platform fee",     pct: "10%", color: "bg-white/20" },
                  { label: "Creator royalty",  pct: "80%", color: "bg-primary/50" },
                  { label: "Owner income",     pct: "10%", color: "bg-accent/50" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-sm ${r.color}`} />
                    <span className="text-muted-foreground flex-1">{r.label}</span>
                    <span className="font-mono">{r.pct}</span>
                  </div>
                ))}
              </div>

              <Field label="Capabilities (comma-separated)" hint="MCP tool names this skill exposes">
                <Input
                  placeholder="answer_question, process_data, generate_report"
                  value={form.capabilities}
                  onChange={(e) => update("capabilities", e.target.value)}
                  data-testid="input-capabilities"
                />
              </Field>

              <Field label="Tags (optional, comma-separated)">
                <Input
                  placeholder="llm, python, finance"
                  value={form.tags}
                  onChange={(e) => update("tags", e.target.value)}
                />
              </Field>
            </div>
          )}

          {/* ── Step 2: Review ────────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Review & Submit</h2>

              <div className="space-y-2 text-sm">
                <ReviewRow label="Repo"          value={form.repoUrl} />
                <ReviewRow label="Name"          value={form.name} />
                <ReviewRow label="Category"      value={form.category} />
                <ReviewRow label="Version"       value={form.version} />
                <ReviewRow label="Base Price"    value={`${form.basePrice} A0GI`} />
                <ReviewRow label="Capabilities"  value={form.capabilities || "—"} />
                {form.tags && <ReviewRow label="Tags" value={form.tags} />}
              </div>

              <div className="bg-card border border-primary/20 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-primary font-medium mb-2">
                  <Lock className="w-3.5 h-3.5" /> What happens next
                </div>
                <div className="text-muted-foreground space-y-1.5">
                  <div className="flex items-start gap-2"><span className="text-primary mt-0.5">1.</span> Admin reviews your submission</div>
                  <div className="flex items-start gap-2"><span className="text-primary mt-0.5">2.</span> Manifest uploaded to 0G Storage → rootHash computed</div>
                  <div className="flex items-start gap-2"><span className="text-primary mt-0.5">3.</span> <code className="font-mono">SkillNFT.registerSkill()</code> called on 0G Chain mainnet</div>
                  <div className="flex items-start gap-2"><span className="text-primary mt-0.5">4.</span> Skill appears in market with "On-Chain" badge</div>
                </div>
              </div>

              {!address && (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 text-xs text-amber-400">
                  <Shield className="w-4 h-4 shrink-0" />
                  Connect your wallet to link this skill to your address
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
            onClick={() => step === 0 ? setLocation("/app/market") : setStep((s) => s - 1)}
            disabled={createSkill.isPending}
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              className="bg-primary hover:bg-primary/90 gap-1"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              data-testid="button-next"
            >
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={handleSubmit}
              disabled={createSkill.isPending}
              data-testid="button-submit-skill"
            >
              {createSkill.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
              ) : (
                <><Zap className="w-4 h-4" /> Submit Skill</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── helpers ────────────────────────────────────────────────────────────────

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-1.5">
      <span className="text-muted-foreground shrink-0 w-28">{label}</span>
      <span className="text-right break-all">{value}</span>
    </div>
  );
}

function StatusRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs break-all text-right max-w-[60%]" : ""}>{value}</span>
    </div>
  );
}
