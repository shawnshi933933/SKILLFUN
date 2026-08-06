import { useRoute, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { useBundle, useBundleAnalytics } from "@/hooks/use-skills";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Bot, Layers, Shield, Lock,
  ExternalLink, Zap, Loader2, AlertCircle, Package,
  Copy, CheckCircle2, ChevronDown, ChevronUp, TrendingUp, RefreshCw,
  Pencil, Check, X,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useEip712Sign } from "@/hooks/use-eip712";
import { type DbSkill, type DbBundle, bundlesApi } from "@/lib/api";

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
  const [snippetOpen, setSnippetOpen]  = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput,   setPriceInput]   = useState("");
  const [savingPrice,  setSavingPrice]  = useState(false);

  const { address } = useAccount();
  const sign         = useEip712Sign();
  const queryClient  = useQueryClient();

  const { data, isLoading, error } = useBundle(params?.id);
  const {
    data: analyticsData,
    refetch: refetchAnalytics,
    isFetching: analyticsRefetching,
    dataUpdatedAt: analyticsUpdatedAt,
  } = useBundleAnalytics(params?.id);

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

  const apy         = getMeta<number>(bundle, "apy", 0);
  const stakerPool  = getMeta<number>(bundle, "stakerPool", 0);
  const invocations = analyticsData?.invocations ?? 0;
  const revenueW0G  = analyticsData?.revenueW0G ?? 0;
  const tags        = getMeta<string[]>(bundle, "tags", []);

  // Owner check — show edit controls only to the bundle owner
  const isOwner = !!address && address.toLowerCase() === bundle.ownerAddress.toLowerCase();

  // servicePrice display helpers (W0G wei → decimal W0G)
  const servicePrice    = bundle.servicePrice ?? null;
  const servicePriceW0G = servicePrice
    ? (Number(BigInt(servicePrice)) / 1e18).toFixed(4).replace(/\.?0+$/, "")
    : null;

  const handleSavePrice = async () => {
    try {
      setSavingPrice(true);
      const wei = priceInput.trim() === ""
        ? null
        : String(BigInt(Math.round(parseFloat(priceInput) * 1e18)));
      const sigHeader = await sign("update-bundle");
      await bundlesApi.update(params!.id!, { servicePrice: wei }, sigHeader);
      await queryClient.invalidateQueries({ queryKey: ["bundle", params?.id] });
      setEditingPrice(false);
      toast({ title: "Price updated" });
    } catch (err) {
      toast({ title: "Failed to update price", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSavingPrice(false);
    }
  };

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

        {/* ── Full-width: Header + MCP + Stats ─────────────────────────── */}
        <div className="space-y-6 mb-8">
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
                    <Badge key={tag} variant="outline" className="border-border text-muted-foreground text-xs">
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
                {/* Primary: POST MCP endpoint (JSON-RPC 2.0) */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 text-xs bg-background border border-border rounded-lg px-3 py-2 text-muted-foreground truncate">
                    {mcpUrl}
                  </div>
                  <CopyButton text={mcpUrl} />
                  <Badge variant="outline" className="border-primary/30 text-primary text-[10px] shrink-0">JSON-RPC 2.0</Badge>
                </div>
                {/* Secondary: GET tools shortcut — shown as a small text link, not a duplicate URL box */}
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
                  <span>Tools list (GET):</span>
                  <a
                    href={toolsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-primary/60 hover:text-primary transition-colors truncate max-w-[260px]"
                  >
                    {toolsUrl}
                  </a>
                  <CopyButton text={toolsUrl} />
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
                  <pre className="bg-background border border-border rounded-xl p-4 text-[11px] text-muted-foreground overflow-x-auto font-mono leading-relaxed max-h-80">
                    {snippet}
                  </pre>
                  <CopyButton text={snippet} />
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {analyticsUpdatedAt > 0
                    ? <>Updated <span className="tabular-nums">{new Date(analyticsUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span></>
                    : "Live stats"}
                </span>
                <button
                  onClick={() => refetchAnalytics()}
                  disabled={analyticsRefetching}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  title="Refresh stats"
                >
                  <RefreshCw className={`w-3 h-3 ${analyticsRefetching ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Skills",        value: String(skills.length) },
                  { label: "Invocations",   value: invocations.toLocaleString() },
                  { label: "Service Price", value: servicePriceW0G ? `${servicePriceW0G} W0G` : "Free" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card border border-border rounded-xl p-3">
                    <div className="text-xs text-muted-foreground mb-0.5">{stat.label}</div>
                    <div className="font-semibold tabular-nums text-sm">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>{/* end Stats */}
        </div>{/* end full-width section */}

        {/* ── Grid: Tabs (left) + Sidebar (right) ──────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Tabs */}
            <Tabs defaultValue="skills">
              <TabsList className="bg-card border border-border">
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
                          <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 hover:bg-muted/60 transition-colors cursor-pointer">
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
                  <div className="bg-card border border-border rounded-xl p-5">
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
                  {analyticsData && analyticsData.recentActivity.length > 0 ? (
                    <>
                      {analyticsData.recentActivity.map((event, idx) => {
                        const issuedAt = new Date(event.issuedAt);
                        const secondsAgo = Math.floor((Date.now() - issuedAt.getTime()) / 1000);
                        const relTime = secondsAgo < 60
                          ? `${secondsAgo}s ago`
                          : secondsAgo < 3600
                          ? `${Math.floor(secondsAgo / 60)}m ago`
                          : secondsAgo < 86400
                          ? `${Math.floor(secondsAgo / 3600)}h ago`
                          : issuedAt.toLocaleDateString();
                        return (
                          <div key={`${event.skillId}-${event.issuedAt}-${idx}`} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 text-sm">
                            <Bot className="w-4 h-4 text-primary shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-foreground truncate">
                                  {event.agentWalletMasked}
                                </span>
                                <Badge variant="outline" className="border-primary/20 text-primary text-[10px] shrink-0">v{event.contentVersion}</Badge>
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate mt-0.5">{event.skillName}</div>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">{relTime}</span>
                          </div>
                        );
                      })}
                      <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                        <span>{analyticsData.invocations.toLocaleString()} total invocations</span>
                        {analyticsData.revenueW0G > 0 && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <TrendingUp className="w-3 h-3" />
                            {analyticsData.revenueW0G.toFixed(4)} W0G earned
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 space-y-2">
                      <Bot className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                      <p className="text-sm text-muted-foreground">No agent invocations yet</p>
                      <p className="text-xs text-muted-foreground/60">
                        Live x402 proof issuances will appear here once agents start using this bundle
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Security */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <div className="text-xs text-muted-foreground">Bundle Security</div>
              <div className="flex items-center gap-2 text-sm"><Lock className="w-4 h-4 text-primary" /> Skill content hashes locked on-chain (ERC-7857)</div>
              <div className="flex items-center gap-2 text-sm"><Shield className="w-4 h-4 text-emerald-400" /> Content version-gated proofs — creator update invalidates agent cache</div>
              <div className="flex items-center gap-2 text-sm"><Bot className="w-4 h-4 text-accent" /> x402 W0G payment — autonomous agent-to-agent commerce</div>
            </div>
          </div>

          {/* Right — Access panel */}
          <div className="space-y-4">
            {/* Price card */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-muted-foreground">Service Price (x402)</div>
                  {isOwner && !editingPrice && (
                    <button
                      onClick={() => { setPriceInput(servicePriceW0G ?? ""); setEditingPrice(true); }}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title="Edit price"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {editingPrice ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.0001"
                        placeholder="0 = Free"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        className="h-8 font-mono text-sm bg-background border-border w-32"
                        disabled={savingPrice}
                        autoFocus
                      />
                      <span className="text-xs text-muted-foreground">W0G</span>
                      <button
                        onClick={handleSavePrice}
                        disabled={savingPrice}
                        className="text-emerald-400 hover:text-emerald-300 disabled:opacity-50 transition-colors"
                        title="Save"
                      >
                        {savingPrice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setEditingPrice(false)}
                        disabled={savingPrice}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground/60">Leave blank to make free</div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold tabular-nums">
                      {servicePriceW0G
                        ? `${servicePriceW0G} W0G`
                        : <span className="text-emerald-400">Free</span>
                      }
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {servicePriceW0G ? "per proof via x402 · paid to Curator wallet" : "Agents get free access proofs"}
                    </div>
                  </>
                )}
              </div>

              {/* Agent Guide — copy prompt */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-emerald-400 text-xs flex items-center gap-1">
                    <Bot className="w-3 h-3" /> Agent Quick Start
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const guideUrl = `https://${devDomain}/mcp/${bundle.bundleId}/agent-guide.md`;
                        await navigator.clipboard.writeText(guideUrl);
                        toast({ title: "Link copied!", description: "Paste this URL into your agent — it will read the guide automatically." });
                      } catch {
                        toast({ title: "Copy failed", variant: "destructive" });
                      }
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 border border-emerald-500/30 rounded-md px-2 py-1 hover:bg-emerald-500/10 transition-colors"
                  >
                    <Copy className="w-3 h-3" /> Copy Link
                  </button>
                </div>
                <div className="text-xs text-muted-foreground/70 leading-relaxed">
                  Give your agent the full step-by-step guide: payment flow, headers, TypeScript example, and troubleshooting — all pre-filled with this Bundle's exact URLs and prices.
                </div>
                <div className="font-mono text-xs text-muted-foreground/50 truncate">
                  GET /mcp/{bundle.bundleId}/agent-guide.md
                </div>
              </div>

              {/* x402 payment info */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-xs text-muted-foreground leading-relaxed">
                <div className="font-medium text-primary mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> x402 ERC-20 Transfer
                </div>
                Agents send W0G directly to the Curator's wallet on 0G Chain (chainId 16661).
                No approve step. Proof token is valid until the Skill creator updates content.
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
