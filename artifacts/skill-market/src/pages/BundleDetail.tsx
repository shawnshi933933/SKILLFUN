import { useRoute, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { useBundle } from "@/hooks/use-skills";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Bot, Layers, Coins, Shield, Lock,
  ExternalLink, Zap, Loader2, AlertCircle, Package,
  Copy, CheckCircle2, ChevronDown, ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { type DbSkill, type DbBundle } from "@/lib/api";

const mockAgentActivity = [
  { agent: "GPT-Agent-7f2a", skill: "—", time: "45s ago" },
  { agent: "Claude-opus-3x9", skill: "—", time: "2m ago" },
];

function getMeta<T>(obj: DbBundle | DbSkill, key: string, fallback: T): T {
  return ((obj.meta as Record<string, unknown>)[key] as T) ?? fallback;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="ml-2 text-muted-foreground hover:text-foreground transition-colors">
      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function BundleDetail() {
  const [, params] = useRoute("/app/bundle/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [staking, setStaking]         = useState(false);
  const [stakeAmount, setStakeAmount]  = useState("500");
  const [snippetOpen, setSnippetOpen]  = useState(false);

  const { data, isLoading, error } = useBundle(params?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data?.bundle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <div className="text-muted-foreground">{error ? "Failed to load bundle" : "Bundle not found"}</div>
          <Button onClick={() => setLocation("/app/market")}>Back to Market</Button>
        </div>
      </div>
    );
  }

  const { bundle, skills } = data;

  const apy           = getMeta<number>(bundle, "apy", 0);
  const stakerPool    = getMeta<number>(bundle, "stakerPool", 0);
  const invocations   = getMeta<number>(bundle, "invocations", 0);
  const curatorMarkup = getMeta<number>(bundle, "curatorMarkup", 10);
  const tags          = getMeta<string[]>(bundle, "tags", []);

  const totalBasePrice = skills.reduce((s, k) => s + getMeta<number>(k, "basePrice", 0), 0);
  const bundleTotal    = totalBasePrice * (1 + curatorMarkup / 100);

  // MCP endpoint — derived from the bundle subdomain
  const devDomain  = (import.meta.env.DEV_DOMAIN as string | undefined) ?? window.location.host;
  const mcpBaseUrl = `https://${devDomain}/mcp/${bundle.bundleId}`;
  const mcpUrl     = `${mcpBaseUrl}/mcp`;
  const toolsUrl   = `${mcpBaseUrl}/tools`;

  // x402 flow code snippet
  const snippet = `// 1. Initialize — get bundle info + payment details
const init = await fetch("${mcpUrl}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} })
}).then(r => r.json());
// init.result._skillfun.paymentInfo has the settlement details

// 2. List tools (no payment required)
const tools = await fetch("${toolsUrl}").then(r => r.json());

// 3. Call a tool — expect 402 first
const attempt = await fetch("${mcpUrl}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: tools.tools[0]?.name } })
});

if (attempt.status === 402) {
  const { accepts, proveEndpoint } = await attempt.json();
  const { tokenId, amount } = accepts[0];

  // 4. Pay on-chain: w0g.approve() + skillNFT.invokeSkill(tokenId)
  const txHash = await wallet.sendInvokeSkillTx(tokenId, amount);

  // 5. Get proof token
  const { proof } = await fetch("/api/mcp/payment/prove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ txHash, tokenId, agentWallet: wallet.address })
  }).then(r => r.json());

  // 6. Retry with proof — receive decrypted skill content
  const result = await fetch("${mcpUrl}", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-402-Payment-Proof": proof,
      "X-402-Agent-Wallet": wallet.address,   // required: binds proof to paying wallet
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: tools.tools[0]?.name } })
  }).then(r => r.json());

  console.log(result.result.content[0].text); // decrypted skill content
}`;

  const handleStake = () => {
    setStaking(true);
    setTimeout(() => {
      setStaking(false);
      toast({
        title: "Staked successfully",
        description: `${stakeAmount} SKILL staked to ${bundle.name} (demo — 0G Chain)`,
      });
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <button
          onClick={() => setLocation("/app/market")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors"
          data-testid="button-back-market"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Market
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left — Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline" className="border-accent/30 text-accent gap-1">
                  <Layers className="w-3 h-3" /> Bundle
                </Badge>
                {apy > 0 && (
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                    {apy.toFixed(1)}% APY
                  </Badge>
                )}
                <Badge variant="outline" className="border-primary/30 text-primary">
                  MCP + x402
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live on 0G
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-2">{bundle.name}</h1>
              {bundle.description && (
                <p className="text-muted-foreground text-sm mb-2">{bundle.description}</p>
              )}
              <p className="text-muted-foreground text-sm mb-3">
                Curated by{" "}
                <span className="font-mono text-accent text-xs">
                  {bundle.ownerAddress.slice(0, 8)}…{bundle.ownerAddress.slice(-6)}
                </span>
              </p>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-white/10 text-muted-foreground text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* MCP Endpoint */}
            <div className="bg-card border border-accent/20 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Bot className="w-4 h-4 text-accent" />
                MCP Endpoint
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 font-mono text-xs bg-background border border-white/10 rounded-lg px-3 py-2 text-muted-foreground truncate">
                    {mcpUrl}
                  </div>
                  <CopyButton text={mcpUrl} />
                  <Badge variant="outline" className="border-primary/30 text-primary text-[10px] shrink-0">JSON-RPC 2.0</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 font-mono text-xs bg-background border border-white/10 rounded-lg px-3 py-2 text-muted-foreground truncate">
                    {toolsUrl}
                  </div>
                  <CopyButton text={toolsUrl} />
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] shrink-0">GET · free</Badge>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Payment: <span className="text-accent font-mono">W0G</span> via{" "}
                <span className="font-mono">invokeSkill(tokenId)</span> → prove at{" "}
                <span className="font-mono">/api/mcp/payment/prove</span>
              </div>
              <button
                onClick={() => setSnippetOpen(o => !o)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {snippetOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {snippetOpen ? "Hide" : "Show"} agent code snippet
              </button>
              {snippetOpen && (
                <div className="relative">
                  <pre className="bg-background border border-white/10 rounded-xl p-4 text-[11px] text-muted-foreground overflow-x-auto font-mono leading-relaxed max-h-80">
                    {snippet}
                  </pre>
                  <CopyButton text={snippet} />
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Skills", value: String(skills.length) },
                { label: "Invocations", value: invocations.toLocaleString() },
                { label: "Staker Pool", value: stakerPool > 0 ? `${stakerPool.toLocaleString()} SKILL` : "—" },
                { label: "Curator Markup", value: `${curatorMarkup}%` },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-white/10 rounded-xl p-3">
                  <div className="text-xs text-muted-foreground mb-0.5">{stat.label}</div>
                  <div className="font-mono font-semibold text-sm">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="skills">
              <TabsList className="bg-card border border-white/10">
                <TabsTrigger value="skills">Skills ({skills.length})</TabsTrigger>
                {(bundle as any).workflow && <TabsTrigger value="workflow">Workflow</TabsTrigger>}
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="skills" className="mt-4">
                {skills.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
                    <Package className="w-8 h-8" />
                    <span className="text-sm">No skills in this bundle yet</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {skills.map((skill) => {
                      const skillName = getMeta<string>(skill, "name", skill.repoUrl.split("/").pop() ?? skill.skillId);
                      const basePrice = getMeta<number>(skill, "basePrice", 0);
                      return (
                        <Link key={skill.skillId} href={`/app/skill/${skill.skillId}`}>
                          <div className="flex items-center gap-3 bg-card border border-white/10 rounded-xl px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                              <Zap className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{skillName}</div>
                              <div className="text-xs text-muted-foreground font-mono truncate">{skill.repoUrl}</div>
                            </div>
                            <div className="text-right shrink-0">
                              {basePrice > 0 && (
                                <div className="text-xs font-mono text-primary">{basePrice} W0G</div>
                              )}
                              <Badge className="text-[10px] border mt-0.5" variant="outline">
                                {skill.mintStatus}
                              </Badge>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {(bundle as any).workflow && (
                <TabsContent value="workflow" className="mt-4">
                  <div className="bg-card border border-white/10 rounded-xl p-5">
                    <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5" />
                      Orchestration playbook — shown to agents on MCP initialize
                    </div>
                    <pre className="text-sm text-foreground whitespace-pre-wrap leading-relaxed font-mono">
                      {(bundle as any).workflow}
                    </pre>
                  </div>
                </TabsContent>
              )}

              <TabsContent value="activity" className="mt-4">
                <div className="space-y-2">
                  {mockAgentActivity.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 bg-card border border-white/10 rounded-xl px-4 py-3 text-sm">
                      <Bot className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-mono text-xs text-muted-foreground">{a.agent}</span>
                      <span className="text-muted-foreground text-xs flex-1">invoked via x402 MCP</span>
                      <span className="text-xs text-muted-foreground shrink-0">{a.time}</span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Live x402 agent activity will appear here
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Security */}
            <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="text-xs text-muted-foreground">Bundle Security</div>
              <div className="flex items-center gap-2 text-sm"><Lock className="w-4 h-4 text-primary" /> Skill content hashes locked on-chain (ERC-7857)</div>
              <div className="flex items-center gap-2 text-sm"><Shield className="w-4 h-4 text-emerald-400" /> Content version-gated proofs — creator update invalidates agent cache</div>
              <div className="flex items-center gap-2 text-sm"><Bot className="w-4 h-4 text-accent" /> x402 W0G payment — autonomous agent-to-agent commerce</div>
            </div>
          </div>

          {/* Right — Stake panel */}
          <div className="space-y-4">
            <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Bundle Price</div>
                  <div className="text-2xl font-bold font-mono">
                    {bundleTotal > 0 ? `${bundleTotal.toFixed(4)} W0G` : "—"}
                  </div>
                </div>
                {apy > 0 && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border">
                    {apy.toFixed(1)}% APY
                  </Badge>
                )}
              </div>

              <div className="text-xs text-muted-foreground">Quick Stake</div>
              <div className="flex gap-1.5">
                {["100", "500", "1000", "5000"].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setStakeAmount(amt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                      stakeAmount === amt
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/5 text-muted-foreground hover:bg-white/10"
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stake</span>
                  <span className="font-mono">{parseInt(stakeAmount).toLocaleString()} SKILL</span>
                </div>
                {apy > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. daily yield</span>
                    <span className="font-mono text-emerald-400">
                      +{(parseInt(stakeAmount) * apy / 100 / 365).toFixed(2)} SKILL
                    </span>
                  </div>
                )}
              </div>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                onClick={handleStake}
                disabled={staking}
                data-testid="button-confirm-stake"
              >
                <Coins className="w-4 h-4" />
                {staking ? "Staking…" : `Stake ${parseInt(stakeAmount).toLocaleString()} SKILL`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
