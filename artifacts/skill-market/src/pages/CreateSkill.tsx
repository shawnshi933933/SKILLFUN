import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Upload, Zap, ArrowRight, ArrowLeft, Database, HardDrive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STEPS = ["Basic Info", "File & Storage", "Economics", "Review & Mint"];

interface FormData {
  name: string;
  description: string;
  category: string;
  tags: string;
  storage: "ipfs" | "walrus";
  totalShares: number;
  creatorPercent: number;
  basePrice: string;
}

export default function CreateSkill() {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [mintState, setMintState] = useState<"idle" | "uploading" | "minting" | "registering" | "done">("idle");
  const [mockCid, setMockCid] = useState("");
  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    category: "",
    tags: "",
    storage: "ipfs",
    totalShares: 1000,
    creatorPercent: 50,
    basePrice: "0.05",
  });

  const update = (key: keyof FormData, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleNext = () => {
    if (step === 1 && !mockCid) {
      setMockCid("Qm" + Math.random().toString(36).slice(2, 12).toUpperCase());
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleMint = async () => {
    setMintState("uploading");
    await new Promise((r) => setTimeout(r, 1200));
    setMintState("minting");
    await new Promise((r) => setTimeout(r, 1400));
    setMintState("registering");
    await new Promise((r) => setTimeout(r, 1200));
    setMintState("done");
    toast({ title: "Skill Minted!", description: `${form.name} is now live on Sepolia (mock)` });
  };

  const mintSteps = [
    { key: "uploading", label: `Uploading to ${form.storage === "ipfs" ? "IPFS" : "Walrus"}` },
    { key: "minting", label: "Minting NFT on Sepolia" },
    { key: "registering", label: "Registering in Skill Registry" },
  ];

  const mintOrder = ["uploading", "minting", "registering", "done"];
  const mintIdx = mintOrder.indexOf(mintState);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold mb-2">Create a Skill</h1>
        <p className="text-muted-foreground mb-8">Mint your AI Agent Skill as an ERC-8239 NFT.</p>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5 mb-4" />
          <div className="grid grid-cols-4 gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className={`text-xs text-center ${i === step ? "text-primary font-semibold" : i < step ? "text-emerald-400" : "text-muted-foreground"}`}>
                {i < step ? <CheckCircle className="w-4 h-4 mx-auto mb-1" /> : <div className="w-4 h-4 rounded-full border mx-auto mb-1 flex items-center justify-center text-[10px]">{i + 1}</div>}
                {s}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-white/10 rounded-2xl p-8">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold mb-5">Basic Information</h2>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Skill Name</label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. DeFi Yield Optimizer" className="bg-background border-white/10" data-testid="input-skill-name" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Description</label>
                <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What does this Skill do? What problems does it solve?" className="bg-background border-white/10 min-h-[100px]" data-testid="input-skill-description" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Category</label>
                <Select value={form.category} onValueChange={(v) => update("category", v)}>
                  <SelectTrigger className="bg-background border-white/10" data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Trading", "Writing", "Analysis", "Code", "Research", "Social"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Tags (comma-separated)</label>
                <Input value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="DeFi, AI, Automation" className="bg-background border-white/10" data-testid="input-tags" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold mb-5">File & Storage</h2>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Upload Skill File</label>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer" data-testid="upload-skill-file">
                  <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drag & drop your Skill file or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">.json, .py, .ts, .yaml supported</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-3 block">Decentralized Storage</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["ipfs", "walrus"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => update("storage", s)}
                      data-testid={`storage-option-${s}`}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${form.storage === s ? "border-primary/50 bg-primary/10" : "border-white/10 hover:border-white/20"}`}
                    >
                      {s === "ipfs" ? <Database className="w-5 h-5 text-primary" /> : <HardDrive className="w-5 h-5 text-accent" />}
                      <div>
                        <div className="font-semibold text-sm">{s === "ipfs" ? "IPFS" : "Walrus"}</div>
                        <div className="text-xs text-muted-foreground">{s === "ipfs" ? "Proven & widely supported" : "Newer, programmable storage"}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {mockCid && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3">
                  <div className="text-xs text-emerald-400 mb-1">Mock CID Generated</div>
                  <div className="font-mono text-sm text-foreground">{mockCid}...</div>
                  <div className="text-xs text-muted-foreground mt-1">Content hash will be locked on-chain at mint time</div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold mb-5">Economics</h2>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Total Shares</label>
                <Input type="number" value={form.totalShares} onChange={(e) => update("totalShares", Number(e.target.value))} className="bg-background border-white/10 font-mono" data-testid="input-total-shares" />
                <p className="text-xs text-muted-foreground mt-1">These shares represent ownership in your Skill's future earnings</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Creator Keeps ({form.creatorPercent}%)</label>
                <input type="range" min={10} max={90} value={form.creatorPercent} onChange={(e) => update("creatorPercent", Number(e.target.value))} className="w-full accent-primary" data-testid="slider-creator-percent" />
                <div className="grid grid-cols-3 text-xs text-muted-foreground mt-2">
                  <span>Creator: {form.creatorPercent}%</span>
                  <span className="text-center">Early Sale: {Math.round((100 - form.creatorPercent) * 0.6)}%</span>
                  <span className="text-right">Platform: {Math.round((100 - form.creatorPercent) * 0.4)}%</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Base Price (ETH)</label>
                <Input value={form.basePrice} onChange={(e) => update("basePrice", e.target.value)} placeholder="0.05" className="bg-background border-white/10 font-mono" data-testid="input-base-price" />
                <p className="text-xs text-muted-foreground mt-1">Price increases automatically via bonding curve as more holders buy in</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-5">Review & Mint</h2>
              {mintState === "idle" && (
                <>
                  <div className="bg-background border border-white/10 rounded-xl p-5 space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Name</span><span className="font-medium">{form.name || "—"}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Category</span><span>{form.category || "—"}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Storage</span><span className="uppercase">{form.storage}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Base Price</span><span className="font-mono">{form.basePrice} ETH</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Creator Share</span><span>{form.creatorPercent}%</span></div>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2" onClick={handleMint} data-testid="button-mint-skill">
                    <Zap className="w-4 h-4" /> Mint to Sepolia
                  </Button>
                </>
              )}
              {mintState !== "idle" && (
                <div className="space-y-4">
                  {mintSteps.map((ms, i) => {
                    const idx = mintOrder.indexOf(ms.key);
                    const isDone = mintIdx > idx;
                    const isActive = mintIdx === idx;
                    return (
                      <div key={ms.key} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isDone ? "border-emerald-500/30 bg-emerald-500/5" : isActive ? "border-primary/40 bg-primary/5" : "border-white/10"}`} data-testid={`mint-step-${ms.key}`}>
                        {isDone ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : isActive ? (
                          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-white/20" />
                        )}
                        <span className={`text-sm ${isDone ? "text-emerald-400" : isActive ? "text-primary" : "text-muted-foreground"}`}>{ms.label}</span>
                      </div>
                    );
                  })}
                  {mintState === "done" && (
                    <div className="text-center pt-4">
                      <div className="text-2xl font-bold text-emerald-400 mb-2">Skill Minted!</div>
                      <p className="text-muted-foreground text-sm mb-4">Your Skill NFT is now live on Sepolia testnet (mock)</p>
                      <div className="flex gap-3 justify-center">
                        <Button variant="outline" className="border-white/20" onClick={() => window.location.href = "/app/market"} data-testid="button-view-in-market">View in Market</Button>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => { setStep(0); setMintState("idle"); setMockCid(""); }} data-testid="button-create-another">Create Another</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {mintState === "idle" && (
            <div className="flex justify-between mt-8">
              <Button variant="outline" className="border-white/20 gap-2" onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0} data-testid="button-prev-step">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              {step < 3 && (
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" onClick={handleNext} data-testid="button-next-step">
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
