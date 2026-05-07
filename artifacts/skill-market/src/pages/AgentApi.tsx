import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle, Code2, ArrowRight, Zap } from "lucide-react";

const ENDPOINTS = [
  { method: "GET", path: "/api/skills", desc: "List all Skills with metadata and pricing", params: "?category=Trading&status=claimed&limit=20" },
  { method: "GET", path: "/api/skills/:id", desc: "Get full Skill details including content hash and versions", params: "" },
  { method: "GET", path: "/api/skills/:id/price", desc: "Get current bonding curve price for a Skill", params: "" },
  { method: "POST", path: "/api/skills/:id/purchase", desc: "Initiate a purchase — returns 402 with payment details", params: "" },
  { method: "POST", path: "/api/skills/:id/verify", desc: "Verify a signed access credential", params: "" },
];

const TS_EXAMPLE = `import { SkillFunAgent } from "@skillfun/agent-sdk";

const agent = new SkillFunAgent({
  identity: process.env.ERC8004_IDENTITY,  // ERC-8004 wallet
  budget: "10 USDC",
});

// 1. Discover Skills
const skills = await agent.discover({
  category: "Trading",
  maxPrice: "0.1 ETH",
});

// 2. Purchase via x402 — fully autonomous
const credential = await agent.purchase(skills[0].id);
// Agent automatically handles:
//   GET /api/skills/{id} -> 402 Payment Required
//   POST x402 payment header with USDC micropayment
//   Receives signed JWT access credential

// 3. Use the Skill
const result = await agent.execute(credential, {
  input: { symbol: "ETH", timeframe: "1h" },
});`;

const PY_EXAMPLE = `from skillfun import SkillFunClient

client = SkillFunClient(
    identity_key=os.environ["ERC8004_KEY"],
    network="sepolia"
)

# Discover and auto-purchase with x402
skill = client.skills.find_best(
    category="Analysis",
    budget_eth=0.05
)

# x402 payment happens automatically
result = client.skills.execute(skill.id, {
    "query": "analyze ETH whale movements"
})
print(result.output)`;

const FLOW_STEPS = [
  { step: "01", title: "Discover", desc: "Agent queries GET /api/skills to find relevant Skills by category, price, and rating" },
  { step: "02", title: "Request", desc: "Agent sends POST /api/skills/:id/purchase — server responds with 402 Payment Required + payment details" },
  { step: "03", title: "Pay via x402", desc: "Agent automatically sends USDC micropayment via x402 protocol header. No human approval needed." },
  { step: "04", title: "Credential Issued", desc: "Server verifies payment and issues a signed JWT access credential scoped to this Skill" },
  { step: "05", title: "Execute", desc: "Agent uses the credential to call the Skill API. Content hash verified before execution." },
];

export default function AgentApi() {
  const [activeTab, setActiveTab] = useState<"ts" | "py">("ts");
  const [simSkillId, setSimSkillId] = useState("skill-1");
  const [simState, setSimState] = useState<"idle" | "running" | "done">("idle");
  const [simLog, setSimLog] = useState<string[]>([]);

  const simulate = async () => {
    setSimState("running");
    setSimLog([]);
    const steps = [
      `→ GET /api/skills/${simSkillId}`,
      `← 200 OK  { price: "0.05 ETH", contentHash: "0x8f3a..." }`,
      `→ POST /api/skills/${simSkillId}/purchase`,
      `← 402 Payment Required  { amount: "0.05 ETH", payTo: "0x742d...eEe" }`,
      `→ x402-Payment: method=eth,amount=0.05,sig=0xa1b2...`,
      `← 200 OK  { credential: "eyJhbGci....", expiresIn: 3600 }`,
      `✓ Access granted. Credential verified.`,
    ];
    for (const s of steps) {
      await new Promise((r) => setTimeout(r, 600));
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
            <p className="text-muted-foreground text-sm">Autonomous Skill discovery and purchase for AI Agents</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 mb-12">
          <Badge variant="outline" className="border-accent/30 text-accent">ERC-8004 Compatible</Badge>
          <Badge variant="outline" className="border-primary/30 text-primary">x402 Payment Protocol</Badge>
          <Badge variant="outline" className="border-white/20 text-muted-foreground">REST API</Badge>
        </div>

        {/* Purchase Flow */}
        <div className="bg-card border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="font-semibold text-lg mb-6">Autonomous Purchase Flow</h2>
          <div className="space-y-3">
            {FLOW_STEPS.map((step, i) => (
              <div key={step.step} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-mono text-primary shrink-0">
                    {step.step}
                  </div>
                  {i < FLOW_STEPS.length - 1 && <div className="w-px h-6 bg-white/10 mt-1" />}
                </div>
                <div className="pb-4">
                  <div className="font-semibold text-sm mb-0.5">{step.title}</div>
                  <div className="text-sm text-muted-foreground">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Endpoints */}
        <div className="bg-card border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="font-semibold text-lg mb-5">Skill Discovery API</h2>
          <div className="space-y-3">
            {ENDPOINTS.map((ep) => (
              <div key={ep.path} className="flex items-start gap-4 p-4 bg-background rounded-xl border border-white/10" data-testid={`endpoint-${ep.path.replace(/\//g, "-")}`}>
                <Badge
                  variant="outline"
                  className={`shrink-0 font-mono text-xs ${ep.method === "GET" ? "border-emerald-500/30 text-emerald-400" : "border-primary/30 text-primary"}`}
                >
                  {ep.method}
                </Badge>
                <div className="flex-1">
                  <div className="font-mono text-sm mb-0.5">
                    {ep.path}
                    {ep.params && <span className="text-muted-foreground">{ep.params}</span>}
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

        {/* Simulate */}
        <div className="bg-card border border-white/10 rounded-2xl p-8">
          <h2 className="font-semibold text-lg mb-2">Simulate Agent Purchase</h2>
          <p className="text-muted-foreground text-sm mb-6">Watch the x402 exchange happen in real-time.</p>
          <div className="flex gap-3 mb-5">
            <Input
              value={simSkillId}
              onChange={(e) => setSimSkillId(e.target.value)}
              placeholder="Skill ID (e.g. skill-1)"
              className="bg-background border-white/10 font-mono max-w-xs"
              data-testid="input-sim-skill-id"
            />
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              onClick={simulate}
              disabled={simState === "running"}
              data-testid="button-simulate-purchase"
            >
              <Zap className="w-4 h-4" />
              {simState === "running" ? "Simulating..." : "Simulate"}
            </Button>
          </div>

          {simLog.length > 0 && (
            <div className="bg-background rounded-xl p-5 border border-white/10 font-mono text-xs space-y-1.5">
              {simLog.map((line, i) => (
                <div
                  key={i}
                  className={line.startsWith("✓") ? "text-emerald-400" : line.startsWith("←") ? "text-accent" : "text-muted-foreground"}
                  data-testid={`sim-log-${i}`}
                >
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
              Agent successfully purchased access autonomously — no human intervention required.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
