import { useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle, Zap, ArrowRight, ArrowLeft,
  ExternalLink, Loader2, Shield, User, Users,
  Wallet,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSelfMint, type MintPhase } from "@/hooks/use-self-mint";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ["Basic Info", "Economics", "Ownership", "Review & Mint"] as const;
const CATEGORIES = ["Code", "Analysis", "Writing", "Trading", "Research", "Social"] as const;
const DEFAULT_CAPABILITIES = ["answer_question", "process_data", "generate_report"];
const ZEROG_SCAN = "https://chainscan.0g.ai";

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormData {
  repoUrl:      string;
  name:         string;
  description:  string;
  category:     string;
  version:      string;
  basePrice:    string;
  capabilities: string;
  tags:         string;
  ownerMode:    "mine" | "community";
}

const INITIAL_FORM: FormData = {
  repoUrl:      "",
  name:         "",
  description:  "",
  category:     "Code",
  version:      "1.0.0",
  basePrice:    "0.01",
  capabilities: DEFAULT_CAPABILITIES.join(", "),
  tags:         "",
  ownerMode:    "mine",
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

export default function CreateSkill() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { address } = useAccount();
  const { state: mintState, mint, reset } = useSelfMint();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);

  const update = (key: keyof FormData, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleRepoUrlBlur = () => {
    if (!form.name && form.repoUrl) {
      const part = form.repoUrl.split("/").pop() ?? "";
      update("name", part.replace(/[-_]/g, " ").trim());
    }
  };

  const canNext = () => {
    if (step === 0) return form.repoUrl.trim().includes("/") && form.name.trim().length > 0;
    if (step === 1) return parseFloat(form.basePrice) >= 0;
    if (step === 2) return !!address; // wallet required before mint
    return true;
  };

  const handleMint = async () => {
    const capabilities = form.capabilities.split(",").map((s) => s.trim()).filter(Boolean);
    const tags         = form.tags.split(",").map((s) => s.trim()).filter(Boolean);

    try {
      await mint({
        repoUrl:   form.repoUrl.trim(),
        ownerMode: form.ownerMode,
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
              <>
                <span className="font-medium text-foreground">{form.name}</span> is now an ERC-7857 iNFT on 0G Chain — owned by your wallet.
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">{form.name}</span> is now an ERC-7857 iNFT on 0G Chain, held in platform custody. The GitHub owner can claim it later.
              </>
            )}
          </p>

          <div className="bg-card border border-white/10 rounded-xl p-4 text-left space-y-2.5">
            <StatusRow label="Skill ID"  value={mintState.skillId!} mono />
            <StatusRow label="Token ID"  value={String(mintState.tokenId)} />
            <StatusRow label="Owner"     value={isMine ? "Your wallet" : "Platform custody"} />
            <StatusRow label="TX Hash"   value={mintState.txHash!.slice(0, 20) + "…"} mono />
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <Button
              variant="outline"
              className="border-white/10 gap-2"
              onClick={() => window.open(`${ZEROG_SCAN}/token/${mintState.tokenId}`, "_blank")}
            >
              <ExternalLink className="w-4 h-4" /> View on 0G Scan
            </Button>
            <Button
              variant="outline"
              className="border-white/10"
              onClick={() => { reset(); setForm(INITIAL_FORM); setStep(0); }}
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

              <Field label="GitHub Repo" hint="e.g. alice/weather-skill or github.com/alice/weather-skill">
                <Input
                  placeholder="owner/repo-name"
                  value={form.repoUrl}
                  onChange={(e) => update("repoUrl", e.target.value.replace(/^https?:\/\/(github\.com\/)?/, ""))}
                  onBlur={handleRepoUrlBlur}
                />
              </Field>

              <Field label="Skill Name">
                <Input
                  placeholder="e.g. Weather Forecast Skill"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </Field>

              <Field label="Description">
                <Textarea
                  placeholder="What does this skill do?"
                  rows={3}
                  className="resize-none"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
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

          {/* ── Step 1: Economics ───────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Economics</h2>

              <Field label="Base Price (A0GI per invocation)" hint="Amount agents pay to invoke your skill via x402">
                <div className="flex items-center gap-2">
                  <Input
                    type="number" min="0" step="0.001" placeholder="0.01"
                    value={form.basePrice}
                    onChange={(e) => update("basePrice", e.target.value)}
                    className="w-40"
                  />
                  <span className="text-sm text-muted-foreground">A0GI</span>
                </div>
              </Field>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 text-xs">
                <div className="font-medium text-muted-foreground mb-2">Revenue Split</div>
                {[
                  { label: "Platform fee",    pct: "10%", color: "bg-white/20" },
                  { label: "Creator royalty", pct: "80%", color: "bg-primary/50" },
                  { label: "Owner income",    pct: "10%", color: "bg-accent/50" },
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
                />
              </Field>

              <Field label="Tags (optional)">
                <Input
                  placeholder="llm, python, finance"
                  value={form.tags}
                  onChange={(e) => update("tags", e.target.value)}
                />
              </Field>
            </div>
          )}

          {/* ── Step 2: Ownership ───────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Ownership Mode</h2>
              <p className="text-sm text-muted-foreground">
                Who owns the GitHub repo <span className="font-mono text-foreground">{form.repoUrl}</span>?
              </p>

              <div className="grid grid-cols-1 gap-3">
                {/* My Repo */}
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

                {/* Community / Not My Repo */}
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

              {/* Wallet connection required */}
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

          {/* ── Step 3: Review & Mint ────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Review & Mint</h2>

              <div className="space-y-2 text-sm">
                <ReviewRow label="Repo"         value={form.repoUrl} />
                <ReviewRow label="Name"         value={form.name} />
                <ReviewRow label="Category"     value={form.category} />
                <ReviewRow label="Version"      value={form.version} />
                <ReviewRow label="Base Price"   value={`${form.basePrice} A0GI`} />
                <ReviewRow label="Capabilities" value={form.capabilities || "—"} />
                {form.tags && <ReviewRow label="Tags" value={form.tags} />}
                <ReviewRow
                  label="Ownership"
                  value={form.ownerMode === "mine" ? "My Repo — NFT to my wallet" : "Community — platform custody"}
                />
              </div>

              {/* Mint process steps */}
              <div className="bg-card border border-primary/20 rounded-xl p-4 space-y-2 text-xs">
                <div className="text-primary font-medium mb-2">What happens when you click Mint</div>
                <MintStep n={1} label="Sign EIP-712 message → server uploads manifest to 0G Storage" done={["confirming","finalizing","done"].includes(mintState.phase)} />
                <MintStep n={2} label="Sign transaction in wallet → registerSkill() on 0G Chain" done={["confirming","finalizing","done"].includes(mintState.phase)} />
                <MintStep n={3}
                  label={form.ownerMode === "mine"
                    ? "Block confirms → iNFT arrives in your wallet"
                    : "Block confirms → iNFT held in contract custody"}
                  done={mintState.phase === "done"}
                />
              </div>

              {/* Live phase indicator while minting */}
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
            onClick={() => step === 0 ? setLocation("/app/market") : setStep((s) => s - 1)}
            disabled={isMinting}
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              className="bg-primary hover:bg-primary/90 gap-1"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
            >
              Next <ArrowRight className="w-4 h-4" />
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
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

function MintStep({ n, label, done }: { n: number; label: string; done: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className={`mt-0.5 ${done ? "text-emerald-400" : "text-primary"}`}>
        {done ? <CheckCircle className="w-3.5 h-3.5" /> : <span>{n}.</span>}
      </span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
