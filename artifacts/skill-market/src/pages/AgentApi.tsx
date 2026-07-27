import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle, Code2, Zap, Layers, Shield, Lock, Coins } from "lucide-react";

const SKILL_ENDPOINTS = [
  { method: "GET", path: "/api/skills", desc: "List all Skills with metadata and MCP tool names", params: "?category=Trading&encrypted=true&limit=20" },
  { method: "GET", path: "/api/skills/:id", desc: "Get full Skill details including content hash, versions, base price, and royalty splits", params: "" },
  { method: "GET", path: "/mcp/:tool_name", desc: "ERC-8183 MCP endpoint — returns 402 Payment Required with x402 payment details", params: "" },
  { method: "GET", path: "/api/bundles", desc: "List all curated Bundles with single-endpoint MCP URLs and APY data", params: "?minApy=5&limit=20" },
  { method: "GET", path: "/api/bundles/:id", desc: "Get Bundle details including all constituent Skills, curator markup, and staker pool", params: "" },
  { method: "GET", path: "/mcp/bundle/:id", desc: "ERC-8183 MCP Bundle endpoint — single call executes all skills, one x402 payment", params: "" },
];

const TS_EXAMPLE = `import { SkillFunAgent } from "@skillfun/agent-sdk";

// Agent identity via ERC-8004
const agent = new SkillFunAgent({
  identity: process.env.ERC8004_IDENTITY,
  network: "0g-chain",
});

// 1. Discover Skills or Bundles
const bundles = await agent.bundles.list({
  minApy: 5,
  limit: 10,
});

// 2. Call a Bundle's single MCP endpoint
//    Agent receives HTTP 402, pays autonomously via x402
const result = await agent.mcp.invoke(bundles[0].mcpUrl, {
  // x402 payment happens automatically — no human approval
  // Fee splits on-chain: 10% platform, Creator 10%, Owner 90% of base,
  // Curator 50% of markup, Staker Pool 50% of markup
});

// result.output contains the aggregated response from all skills
console.log(result.output);

// Or invoke a single Skill directly:
const skills = await agent.skills.discover({
  category: "Trading",
  maxBasePrice: "0.1 ETH",
});
const skillResult = await agent.mcp.invoke(skills[0].mcpUrl);`;

const PY_EXAMPLE = `from skillfun import SkillFunAgent
import os

# ERC-8004 agent identity
agent = SkillFunAgent(
    identity_key=os.environ["ERC8004_KEY"],
    network="0g-chain",
)

# Discover and invoke a Bundle (single MCP endpoint)
bundles = agent.bundles.list(min_apy=5, limit=5)
best_bundle = bundles[0]

# Single call, one x402 payment, all skills execute
# Platform auto-splits: Creator 10%, Owner 90% of base,
# Curator 50% of markup, Staker Pool 50% of markup
result = agent.mcp.invoke(
    url=best_bundle.mcp_url,
    params={"query": "analyze ETH whale movements"},
)
print(result.output)

# Or discover and invoke individual Skills
skill = agent.skills.find(
    category="Analysis",
    max_base_price=0.05
)
result = agent.mcp.invoke(skill.mcp_url)`;

const FLOW_STEPS = [
  { step: "01", title: "Discover", desc: "Agent queries GET /api/bundles or /api/skills to find relevant capabilities. Bundles expose all constituent skills via a single MCP URL — minimizing invocation overhead.", color: "text-primary bg-primary/10 border-primary/30" },
  { step: "02", title: "GET MCP Endpoint", desc: "Agent sends GET to the ERC-8183 MCP endpoint (e.g. /mcp/bundle/:id). Server responds with HTTP 402 Payment Required plus the x402 payment descriptor — amount, recipient, and method.", color: "text-accent bg-accent/10 border-accent/30" },
  { step: "03", title: "Pay via x402", desc: "Agent sends USDC payment via the x402 protocol — fully autonomous, no human sign-off. Agent identity authenticated via ERC-8004. Payment is on-chain and atomic.", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  { step: "04", title: "Fee Split On-Chain", desc: "Platform takes 10% off the top. Base Price: Creator 10%, Owner 90%. Curator Markup: Curator 50%, Staker Pool 50%. All splits execute atomically in one transaction.", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  { step: "05", title: "Execute + ZK Proof", desc: "Skill executes — optionally inside a TEE (ERC-8220) for verifiable computation. Execution proof stored as a blob (EIP-4844). Agent receives the result and a signed receipt.", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
];

export default function AgentApi() {
  const [activeTab, setActiveTab] = useState<"ts" | "py">("ts");
  const [simTarget, setSimTarget] = useState("bundle-1");
  const [simType, setSimType] = useState<"skill" | "bundle">("bundle");
  const [simState, setSimState] = useState<"idle" | "running" | "done">("idle");
  const [simLog, setSimLog] = useState<string[]>([]);

  const simulate = async () => {
    setSimState("running");
    setSimLog([]);
    const path = simType === "bundle" ? `/mcp/bundle/${simTarget}` : `/mcp/${simTarget}`;
    const price = simType === "bundle" ? "0.115" : "0.05";
    const steps = [
      `→ GET ${path}`,
      `← HTTP 402 Payment Required`,
      `   { amount: "${price} ETH", token: "USDC", payTo: "0x742d...eEe", method: "x402" }`,
      `→ x402-Payment: token=USDC,amount=${price},sig=0xa1b2...c3d4`,
      `← HTTP 200 OK — Payment verified`,
      `   Platform fee: ${(parseFloat(price) * 0.1).toFixed(4)} ETH (10%)`,
      simType === "bundle"
        ? `   Creator 10% + Owner 90% per skill; Curator 50% + Staker Pool 50% of markup`
        : `   Creator: ${(parseFloat(price) * 0.1).toFixed(4)} ETH · Owner: ${(parseFloat(price) * 0.9 * 0.9).toFixed(4)} ETH`,
      `→ Executing Skill(s) — ZK proof via ERC-8220`,
      `✓ Done. Result returned. Signed receipt issued.`,
    ];
    for (const s of steps) {
      await new Promise((r) => setTimeout(r, 500));
      setSimLog((l) => [...l, s]);
    }
    setSimState("done");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Agent API</h1>
            <p className="text-muted-foreground text-sm">Autonomous Skill and Bundle discovery for AI Agents via ERC-8183 MCP + x402</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 mb-12">
          <Badge variant="outline" className="border-accent/30 text-accent">ERC-8004 Agent Identity</Badge>
          <Badge variant="outline" className="border-primary/30 text-primary">ERC-8183 MCP Endpoints</Badge>
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">x402 Autonomous Payments</Badge>
          <Badge variant="outline" className="border-purple-500/30 text-purple-400">ERC-8220 ZK Execution</Badge>
        </div>

        {/* Why MCP + x402 */}
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {[
            { icon: <Layers className="w-5 h-5 text-accent" />, title: "Single MCP URL per Bundle", desc: "An agent calls one ERC-8183 endpoint and gets access to all constituent Skills. One HTTP call, one x402 payment, all capabilities." },
            { icon: <Coins className="w-5 h-5 text-emerald-400" />, title: "Autonomous x402 Payments", desc: "No human approval, no pre-authorization. Agent gets 402, sends USDC, fee splits atomically on-chain. Creator 10%, Owner 90%, Curator 50% markup, Staker Pool 50% markup." },
            { icon: <Shield className="w-5 h-5 text-primary" />, title: "Verifiable Execution", desc: "Skill content hash locked. ZK proof of execution via ERC-8220. Agent can verify what code ran before trusting the result." },
          ].map((c) => (
            <div key={c.title} className="bg-card border border-white/10 rounded-xl p-5">
              <div className="mb-3">{c.icon}</div>
              <h3 className="font-semibold mb-1.5 text-sm">{c.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Flow */}
        <div className="bg-card border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="font-semibold text-lg mb-6">Autonomous Invocation Flow</h2>
          <div className="space-y-3">
            {FLOW_STEPS.map((step, i) => (
              <div key={step.step} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-mono shrink-0 ${step.color}`}>
                    {step.step}
                  </div>
                  {i < FLOW_STEPS.length - 1 && <div className="w-px h-5 bg-white/10 mt-1" />}
                </div>
                <div className="pb-3">
                  <div className="font-semibold text-sm mb-0.5">{step.title}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Endpoints */}
        <div className="bg-card border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="font-semibold text-lg mb-5">API Endpoints</h2>
          <div className="space-y-2">
            {SKILL_ENDPOINTS.map((ep) => (
              <div key={ep.path} className="flex items-start gap-4 p-4 bg-background rounded-xl border border-white/10" data-testid={`endpoint-${ep.path.replace(/\//g, "-")}`}>
                <Badge variant="outline" className={`shrink-0 font-mono text-xs ${ep.method === "GET" ? "border-emerald-500/30 text-emerald-400" : "border-primary/30 text-primary"}`}>
                  {ep.method}
                </Badge>
                <div className="flex-1">
                  <div className="font-mono text-sm mb-0.5">
                    {ep.path}
                    {ep.params && <span className="text-muted-foreground text-xs">{ep.params}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">{ep.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-card border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-lg">Code Examples</h2>
            <div className="flex border border-white/10 rounded-lg overflow-hidden">
              <button onClick={() => setActiveTab("ts")} data-testid="tab-typescript" className={`px-4 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${activeTab === "ts" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <Code2 className="w-3.5 h-3.5" /> TypeScript
              </button>
              <button onClick={() => setActiveTab("py")} data-testid="tab-python" className={`px-4 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${activeTab === "py" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <Code2 className="w-3.5 h-3.5" /> Python
              </button>
            </div>
          </div>
          <pre className="bg-background rounded-xl p-5 text-xs text-muted-foreground overflow-x-auto font-mono leading-relaxed border border-white/10" data-testid="code-example">
            {activeTab === "ts" ? TS_EXAMPLE : PY_EXAMPLE}
          </pre>
        </div>

        {/* Simulator */}
        <div className="bg-card border border-white/10 rounded-2xl p-8">
          <h2 className="font-semibold text-lg mb-2">Simulate Agent Invocation</h2>
          <p className="text-muted-foreground text-sm mb-6">Watch the MCP + x402 exchange happen in real-time — Skill or Bundle.</p>
          <div className="flex gap-3 mb-5 flex-wrap">
            <div className="flex border border-white/10 rounded-lg overflow-hidden">
              <button onClick={() => setSimType("skill")} className={`px-4 py-2 text-sm transition-colors ${simType === "skill" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`} data-testid="sim-type-skill">
                Single Skill
              </button>
              <button onClick={() => setSimType("bundle")} className={`px-4 py-2 text-sm transition-colors ${simType === "bundle" ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-foreground"}`} data-testid="sim-type-bundle">
                Bundle
              </button>
            </div>
            <Input value={simTarget} onChange={(e) => setSimTarget(e.target.value)} placeholder={simType === "bundle" ? "bundle-id" : "tool-name"} className="bg-background border-white/10 font-mono max-w-xs" data-testid="input-sim-skill-id" />
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2" onClick={simulate} disabled={simState === "running"} data-testid="button-simulate-purchase">
              <Zap className="w-4 h-4" />
              {simState === "running" ? "Simulating..." : "Simulate"}
            </Button>
          </div>

          {simLog.length > 0 && (
            <div className="bg-background rounded-xl p-5 border border-white/10 font-mono text-xs space-y-1.5">
              {simLog.map((line, i) => (
                <div key={i} className={line.startsWith("✓") ? "text-emerald-400" : line.startsWith("←") ? "text-accent" : line.startsWith("→") ? "text-primary" : "text-muted-foreground"} data-testid={`sim-log-${i}`}>
                  {line}
                </div>
              ))}
              {simState === "running" && (
                <div className="flex items-center gap-2 text-primary">
                  <div className="w-3 h-3 rounded-full border border-primary border-t-transparent animate-spin" />
                  processing...
                </div>
              )}
            </div>
          )}

          {simState === "done" && (
            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              {simType === "bundle" ? "Bundle invoked — all skills executed. Fee split on-chain atomically. No human approval required." : "Skill invoked autonomously via x402 — no human approval required."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
