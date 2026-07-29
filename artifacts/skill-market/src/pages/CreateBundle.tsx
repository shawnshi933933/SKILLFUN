import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Layers, ArrowRight, ArrowLeft, Bot, Zap, Coins, X, Loader2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSkills } from "@/hooks/use-skills";
import type { DbSkill } from "@/lib/api";

const STEPS = ["Bundle Info", "Workflow", "Select Skills", "Review & Deploy"];

interface FormData {
  name: string;
  description: string;
  workflow: string;
  tags: string;
  markup: number;
  selectedSkillIds: string[];
}

function getMeta<T>(skill: DbSkill, key: string, fallback: T): T {
  return (skill.meta[key] as T) ?? fallback;
}

function skillDisplayName(skill: DbSkill): string {
  return getMeta<string>(skill, "name", skill.repoUrl.split("/").pop() ?? skill.skillId);
}

export default function CreateBundle() {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [deployState, setDeployState] = useState<"idle" | "deploying" | "registering" | "done">("idle");
  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    workflow: "",
    tags: "",
    markup: 15,
    selectedSkillIds: [],
  });

  // Load real minted skills from the API
  const { data: skillsData, isLoading: skillsLoading } = useSkills({ status: "minted" });
  const availableSkills = skillsData?.skills ?? [];

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

  const selectedSkills = availableSkills.filter((s) => form.selectedSkillIds.includes(s.skillId));
  const totalBasePrice = selectedSkills.reduce((sum, s) => sum + getMeta<number>(s, "basePrice", 0), 0);
  const markupAmount = totalBasePrice * form.markup / 100;
  const curatorEarning = markupAmount * 0.5 * 0.9;

  const handleDeploy = async () => {
    setDeployState("deploying");
    await new Promise((r) => setTimeout(r, 1400));
    setDeployState("registering");
    await new Promise((r) => setTimeout(r, 1200));
    setDeployState("done");
    toast({ title: "Bundle Deployed!", description: `${form.name} is now live with an MCP endpoint and x402 W0G payment` });
  };

  const deploySteps = [
    { key: "deploying", label: "Deploying Bundle" },
    { key: "registering", label: "Registering MCP endpoint" },
  ];
  const deployOrder = ["deploying", "registering", "done"];
  const deployIdx = deployOrder.indexOf(deployState);

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
        <p className="text-muted-foreground mb-8 mt-1">Curate Skills into a themed product with a single MCP endpoint. Add a workflow playbook so agents know how to use your Bundle.</p>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5 mb-4" />
          <div className="grid grid-cols-4 gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className={`text-xs text-center ${i === step ? "text-accent font-semibold" : i < step ? "text-emerald-400" : "text-muted-foreground"}`}>
                {i < step ? <CheckCircle className="w-4 h-4 mx-auto mb-1" /> : <div className="w-4 h-4 rounded-full border mx-auto mb-1 flex items-center justify-center text-[10px]">{i + 1}</div>}
                {s}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-white/10 rounded-2xl p-8">

          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold mb-5">Bundle Information</h2>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Bundle Name</label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. DeFi Alpha Suite" className="bg-background border-white/10" data-testid="input-bundle-name" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Description</label>
                <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What does this Bundle do? What type of agents will use it?" className="bg-background border-white/10 min-h-[80px]" data-testid="input-bundle-description" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Tags (comma-separated)</label>
                <Input value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="DeFi, Trading, Alpha" className="bg-background border-white/10" data-testid="input-bundle-tags" />
              </div>
            </div>
          )}

          {/* Step 1: Workflow */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold mb-2">Agent Workflow Playbook</h2>
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 text-xs text-muted-foreground">
                <Bot className="w-3 h-3 inline mr-1 text-accent" />
                This workflow is shown to AI agents when they call <span className="font-mono">initialize</span> on your MCP endpoint. Describe how to sequence your Skills to accomplish the Bundle's goal.
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Workflow Description <span className="text-muted-foreground/50">(optional)</span></label>
                <Textarea
                  value={form.workflow}
                  onChange={(e) => update("workflow", e.target.value)}
                  placeholder={`Example:
1. Call market-scanner:5 with { query: "ETH whale movements" } → get whale wallet list
2. Call risk-analyzer:7 with { wallets: <result from step 1> } → get risk scores
3. Call portfolio-optimizer:12 with { risk_scores: <result from step 2> } → get recommendations

Each skill returns decrypted content you execute locally. Proof tokens are long-lived — no repeat payment needed until creator updates the skill.`}
                  className="bg-background border-white/10 min-h-[200px] font-mono text-sm"
                  data-testid="input-bundle-workflow"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Leave blank to skip. You can always add or update the workflow later from the bundle settings.
              </p>
            </div>
          )}

          {/* Step 2: Select Skills */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold mb-2">Select Skills</h2>
              <p className="text-sm text-muted-foreground mb-5">Choose 2 or more Skills to include. Agents will pay W0G per Skill via invokeSkill + x402.</p>

              {form.selectedSkillIds.length > 0 && (
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 mb-4 flex flex-wrap gap-2">
                  {selectedSkills.map((s) => (
                    <div key={s.skillId} className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 rounded-lg px-2 py-1 text-xs text-accent">
                      {skillDisplayName(s)}
                      <button onClick={() => toggleSkill(s.skillId)} className="hover:text-white"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground self-center ml-auto">{form.selectedSkillIds.length} selected</div>
                </div>
              )}

              {skillsLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading skills…
                </div>
              ) : availableSkills.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
                  <Package className="w-8 h-8" />
                  <span className="text-sm">No minted Skills found. Mint a Skill first before creating a Bundle.</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {availableSkills.map((skill) => {
                    const name      = skillDisplayName(skill);
                    const category  = getMeta<string>(skill, "category", "");
                    const basePrice = getMeta<number>(skill, "basePrice", 0);
                    const invocations = getMeta<number>(skill, "invocations", 0);
                    const isSelected = form.selectedSkillIds.includes(skill.skillId);
                    return (
                      <div key={skill.skillId}
                        onClick={() => toggleSkill(skill.skillId)}
                        data-testid={`select-skill-${skill.skillId}`}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? "border-accent/40 bg-accent/10" : "border-white/10 hover:border-white/20 hover:bg-white/5"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? "bg-accent border-accent" : "border-white/20"}`}>
                            {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{name}</div>
                            <div className="text-xs text-muted-foreground">
                              {category}{category && " · "}{invocations > 0 && `${invocations.toLocaleString()} invocations`}
                              {!category && !invocations && <span className="font-mono">{skill.repoUrl}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {basePrice > 0 ? (
                            <>
                              <div className="font-mono text-sm text-foreground">{basePrice} W0G</div>
                              <div className="text-xs text-muted-foreground">per invoke</div>
                            </>
                          ) : (
                            <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground">
                              {skill.mintStatus}
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

          {/* Step 3: Review & Deploy */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-5">Review & Deploy</h2>
              {deployState === "idle" && (
                <>
                  <div className="bg-background border border-white/10 rounded-xl p-5 space-y-3">
                    {[
                      { label: "Bundle Name", value: form.name || "—" },
                      { label: "Skills", value: `${selectedSkills.length} selected` },
                      { label: "Workflow", value: form.workflow ? `${form.workflow.slice(0, 60)}…` : "None" },
                      { label: "Total Base Price", value: `${totalBasePrice.toFixed(4)} W0G/invoke` },
                    ].map((r) => (
                      <div key={r.label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{r.label}</span>
                        <span className="font-medium font-mono text-right max-w-[200px] truncate">{r.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 text-xs text-muted-foreground">
                    <Bot className="w-3 h-3 inline mr-1 text-accent" />
                    Deploying creates a Bundle with a single MCP endpoint. Agents discover Skills via <span className="font-mono">tools/list</span>, pay W0G via <span className="font-mono">invokeSkill</span>, and receive decrypted Skill content to run locally. Proof tokens are valid until you update the Skill content.
                  </div>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2" onClick={handleDeploy} data-testid="button-deploy-bundle">
                    <Layers className="w-4 h-4" /> Deploy Bundle
                  </Button>
                </>
              )}
              {deployState !== "idle" && (
                <div className="space-y-4">
                  {deploySteps.map((ds) => {
                    const idx = deployOrder.indexOf(ds.key);
                    const isDone = deployIdx > idx;
                    const isActive = deployIdx === idx;
                    return (
                      <div key={ds.key} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isDone ? "border-emerald-500/30 bg-emerald-500/5" : isActive ? "border-accent/40 bg-accent/5" : "border-white/10"}`} data-testid={`deploy-step-${ds.key}`}>
                        {isDone ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : isActive ? <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" /> : <div className="w-5 h-5 rounded-full border border-white/20" />}
                        <span className={`text-sm ${isDone ? "text-emerald-400" : isActive ? "text-accent" : "text-muted-foreground"}`}>{ds.label}</span>
                      </div>
                    );
                  })}
                  {deployState === "done" && (
                    <div className="text-center pt-4">
                      <div className="text-2xl font-bold text-emerald-400 mb-2">Bundle Deployed!</div>
                      <p className="text-muted-foreground text-sm mb-4">Your Bundle is live. Agents can now discover and invoke Skills via x402 W0G payment.</p>
                      <div className="flex gap-3 justify-center">
                        <Button variant="outline" className="border-white/20" onClick={() => window.location.href = "/app/market"} data-testid="button-view-in-market">View in Market</Button>
                        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => { setStep(0); setDeployState("idle"); setForm({ name: "", description: "", workflow: "", tags: "", markup: 15, selectedSkillIds: [] }); }} data-testid="button-create-another">Create Another</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {deployState === "idle" && (
            <div className="flex justify-between mt-8">
              <Button variant="outline" className="border-white/20 gap-2" onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0} data-testid="button-prev-step">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              {step < 3 && (
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2" onClick={() => setStep((s) => Math.min(s + 1, 3))} data-testid="button-next-step">
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
