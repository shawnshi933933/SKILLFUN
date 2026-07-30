import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle, Code2, Zap, Layers, Shield, Coins } from "lucide-react";
import { useBundles } from "@/hooks/use-skills";

const FLOW_STEPS = [
  {
    step: "01", title: "Discover",
    desc: "Agent queries GET /api/bundles to find relevant Bundles. Each Bundle exposes all its Skills via a single MCP endpoint — minimizing discovery overhead.",
    color: "text-primary bg-primary/10 border-primary/30",
  },
  {
    step: "02", title: "Initialize",
    desc: "Agent sends initialize to POST /mcp/{bundleId}/mcp. Server responds with bundle info, workflow playbook, and x402 payment details (W0G contract, invokeSkill method, proveEndpoint).",
    color: "text-accent bg-accent/10 border-accent/30",
  },
  {
    step: "03", title: "tools/list (free)",
    desc: "Agent calls tools/list to enumerate all Skills in the Bundle. No payment required. Returns tool names in {bundleSlug}:{tokenId} format with input schemas.",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    step: "04", title: "tools/call → HTTP 402",
    desc: "Agent calls tools/call. Server returns HTTP 402 with settlement details: W0G token address, SkillNFT contract, invokeSkill(tokenId), and the /api/mcp/payment/prove endpoint.",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  {
    step: "05", title: "Pay on-chain",
    desc: "Agent sends W0G ERC-20 transfer directly to the Curator's wallet (payTo from 402 response). Simple transfer — no approve step, no contract call. Amount set by the Curator's servicePrice.",
    color: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  },
  {
    step: "06", title: "Get proof token",
    desc: "Agent POSTs { txHash, tokenId, bundleId, agentWallet, signature } to /api/mcp/payment/prove. Server verifies the ERC-20 Transfer log on-chain, issues a proof scoped to (skillId, bundleId, contentVersion).",
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },
  {
    step: "07", title: "Retry with proof",
    desc: "Agent retries tools/call with X-402-Payment-Proof: <token> header. Server validates proof, fetches + decrypts content from 0G Storage, returns skill content as MCP TextContent.",
    color: "text-primary bg-primary/10 border-primary/30",
  },
  {
    step: "08", title: "Run locally",
    desc: "Agent receives decrypted Skill content (instructions/config) and executes it locally. Proof is valid indefinitely — no repeat payment until creator updates the Skill content (version bump).",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
];

const TS_EXAMPLE = `import { createWalletClient, http, parseAbi } from "viem";

const W0G       = "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c";
const MCP_BASE  = "https://<your-domain>/mcp/<bundleId>";
const BUNDLE_ID = "<bundleId>";

// 1. Initialize — get bundle workflow + payment info
const init = await fetch(\`\${MCP_BASE}/mcp\`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
}).then(r => r.json());
console.log(init.result._skillfun.workflow);     // orchestration playbook
// paymentInfo: { method: "erc20-transfer", payTo: "<curatorWallet>", currency: "W0G" }

// 2. List tools (free)
const { tools } = await fetch(\`\${MCP_BASE}/tools\`).then(r => r.json());
// tools[0].name → "defi-alpha:3"  tools[0]._skillfun.tokenId → 3

// 3. Call a tool — expect 402
const toolCall = { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: tools[0].name } };
const attempt  = await fetch(\`\${MCP_BASE}/mcp\`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(toolCall),
});

if (attempt.status === 402) {
  const { accepts, proveEndpoint } = await attempt.json();
  // accepts[0]: { method: "erc20-transfer", payTo: "<curatorWallet>", amount: "<wei>", currency: "W0G" }
  const { payTo, amount, tokenId } = accepts[0];

  // 4. Pay — send W0G ERC-20 directly to Curator's wallet (no approve, no contract call)
  const txHash = await walletClient.writeContract({
    address: W0G,
    abi: parseAbi(["function transfer(address,uint256) returns (bool)"]),
    functionName: "transfer",
    args: [payTo as \`0x\${string}\`, BigInt(amount)],
  });

  // 5. Sign proof + get proof token (bundleId scopes proof to this bundle only)
  const sig = await walletClient.signMessage({ message: \`SkillFun payment proof: \${txHash}\` });
  const { proof } = await fetch("/api/mcp/payment/prove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      txHash, tokenId, bundleId: BUNDLE_ID,
      agentWallet: walletClient.account.address, signature: sig,
    }),
  }).then(r => r.json());

  // 6. Retry with proof — receive decrypted Skill content
  const result = await fetch(\`\${MCP_BASE}/mcp\`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-402-Payment-Proof": proof,
      "X-402-Agent-Wallet": walletClient.account.address,
    },
    body: JSON.stringify(toolCall),
  }).then(r => r.json());

  // result.result.content[0].text = decrypted Skill content (run locally)
  // Proof is cached — no payment needed again until creator updates the Skill
  console.log(result.result.content[0].text);
}`;

const PY_EXAMPLE = `import requests
from eth_account import Account
from web3 import Web3

W0G       = "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c"
MCP_BASE  = "https://<your-domain>/mcp/<bundleId>"
BUNDLE_ID = "<bundleId>"

w3 = Web3(Web3.HTTPProvider("https://evmrpc.0g.ai"))
w0g = w3.eth.contract(address=W0G, abi=ERC20_ABI)

# 1. Initialize — get workflow + payment info
init = requests.post(f"{MCP_BASE}/mcp",
  json={"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}}).json()
print(init["result"]["_skillfun"]["workflow"])
# paymentInfo: { method: "erc20-transfer", payTo: "<curatorWallet>", currency: "W0G" }

# 2. List tools (free)
tools    = requests.get(f"{MCP_BASE}/tools").json()["tools"]
tool_name = tools[0]["name"]    # e.g. "defi-alpha:3"
token_id  = tools[0]["_skillfun"]["tokenId"]

# 3. Call tool — expect 402
tool_call = {"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": tool_name}}
resp = requests.post(f"{MCP_BASE}/mcp", json=tool_call)

if resp.status_code == 402:
    payment  = resp.json()
    pay_to   = payment["accepts"][0]["payTo"]    # Curator's wallet address
    amount   = int(payment["accepts"][0]["amount"])

    # 4. Pay — send W0G ERC-20 directly to Curator's wallet (no approve needed)
    tx = w0g.functions.transfer(pay_to, amount).transact({"from": agent_wallet})
    tx_hash = tx.hex()

    # 5. Sign proof + get proof token (bundleId scopes proof to this bundle only)
    msg = f"SkillFun payment proof: {tx_hash}"
    sig = Account.sign_message(encode_defunct(text=msg), private_key=agent_pk)
    proof_resp = requests.post("/api/mcp/payment/prove", json={
        "txHash": tx_hash, "tokenId": token_id, "bundleId": BUNDLE_ID,
        "agentWallet": agent_wallet, "signature": sig.signature.hex()
    }).json()
    proof = proof_resp["proof"]

    # 6. Retry with proof — receive decrypted Skill content
    result = requests.post(f"{MCP_BASE}/mcp", json=tool_call,
        headers={"X-402-Payment-Proof": proof, "X-402-Agent-Wallet": agent_wallet}).json()
    print(result["result"]["content"][0]["text"])
    # Proof persists — no re-payment until creator updates Skill content`;

export default function AgentApi() {
  const [activeTab, setActiveTab] = useState<"ts" | "py">("ts");
  const [simState, setSimState]   = useState<"idle" | "running" | "done">("idle");
  const [simLog, setSimLog]       = useState<string[]>([]);
  const [simBundleId, setSimBundleId] = useState("bd_example");

  const { data: bundlesData } = useBundles();
  const bundles = bundlesData?.bundles ?? [];

  const simulate = async () => {
    setSimState("running");
    setSimLog([]);
    const mcpUrl = `/mcp/${simBundleId}/mcp`;
    const steps = [
      `→ POST ${mcpUrl}  { method: "initialize" }`,
      `← 200 OK — bundle info + workflow + payment details`,
      `   _skillfun.paymentInfo: { method: "erc20-transfer", payTo: "0xcurator…", currency: "W0G" }`,
      `→ GET /mcp/${simBundleId}/tools`,
      `← 200 OK — [{ name: "defi-alpha:3", _skillfun.tokenId: 3 }]`,
      `→ POST ${mcpUrl}  { method: "tools/call", params: { name: "defi-alpha:3" } }`,
      `← HTTP 402 Payment Required`,
      `   accepts[0]: { method: "erc20-transfer", payTo: "0xcurator…", amount: "1000000000000000", currency: "W0G" }`,
      `→ w0g.transfer("0xcurator…", amount)  [on-chain 0G Mainnet — direct ERC-20 transfer]`,
      `→ POST /api/mcp/payment/prove  { txHash, tokenId: 3, bundleId, agentWallet, signature }`,
      `← 201 { proof: "f8e7d6…", skillId: "sk_xxx", contentVersion: 1 }`,
      `→ POST ${mcpUrl}  { method: "tools/call" }  X-402-Payment-Proof: f8e7d6…`,
      `← 200 OK — content: [{ type: "text", text: "<decrypted skill content>" }]`,
      `✓ Skill content received. Agent runs locally. Proof cached (valid until content update).`,
    ];
    for (const s of steps) {
      await new Promise((r) => setTimeout(r, 400));
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
            <p className="text-muted-foreground text-sm">MCP JSON-RPC 2.0 + x402 W0G autonomous payments on 0G Chain</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 mb-12">
          <Badge variant="outline" className="border-accent/30 text-accent">MCP JSON-RPC 2.0</Badge>
          <Badge variant="outline" className="border-primary/30 text-primary">x402 W0G Payment</Badge>
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">0G Chain (chainId 16661)</Badge>
          <Badge variant="outline" className="border-purple-500/30 text-purple-400">ERC-7857 iNFT</Badge>
        </div>

        {/* Value props */}
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {[
            { icon: <Layers className="w-5 h-5 text-accent" />, title: "One endpoint per Bundle", desc: "POST /mcp/{bundleId}/mcp exposes all Skills in the Bundle via MCP tools/list + tools/call. Agents discover, initialize, and pay in one flow." },
            { icon: <Coins className="w-5 h-5 text-emerald-400" />, title: "Version-gated proofs", desc: "Pay once per Skill version. Proof token is valid until the creator updates the Skill content. Creator update = contentVersion bump = agents repay. No expiry timers." },
            { icon: <Shield className="w-5 h-5 text-primary" />, title: "Creator IP protected", desc: "Skill content (system prompt / workflow config) stays encrypted on 0G Storage. Agents receive decrypted content only after a valid W0G ERC-20 transfer proof is verified." },
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
          <h2 className="font-semibold text-lg mb-6">x402 Invocation Flow</h2>
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

        {/* API Endpoints */}
        <div className="bg-card border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="font-semibold text-lg mb-5">Endpoints</h2>
          <div className="space-y-2">
            {[
              { method: "POST", path: "/mcp/{bundleId}/mcp", desc: "MCP JSON-RPC 2.0 — initialize, tools/list, tools/call, resources/list, resources/read", badge: "JSON-RPC" },
              { method: "GET",  path: "/mcp/{bundleId}/tools", desc: "Shortcut: returns tools list for the Bundle (no auth)", badge: "free" },
              { method: "POST", path: "/api/mcp/payment/prove", desc: "Verify ERC-20 Transfer tx (W0G → curatorWallet) → issue proof token scoped to bundleId", badge: "x402" },
              { method: "GET",  path: "/api/bundles", desc: "List Bundles with MCP endpoint URLs", badge: "" },
              { method: "GET",  path: "/api/bundles/{id}", desc: "Bundle details + skill list + workflow playbook", badge: "" },
              { method: "GET",  path: "/api/skills", desc: "List Skills with contentVersion and rootHash", badge: "" },
            ].map((ep) => (
              <div key={ep.path} className="flex items-start gap-4 p-4 bg-background rounded-xl border border-white/10">
                <Badge variant="outline" className={`shrink-0 font-mono text-xs ${ep.method === "GET" ? "border-emerald-500/30 text-emerald-400" : "border-primary/30 text-primary"}`}>
                  {ep.method}
                </Badge>
                <div className="flex-1">
                  <div className="font-mono text-sm mb-0.5">{ep.path}</div>
                  <div className="text-xs text-muted-foreground">{ep.desc}</div>
                </div>
                {ep.badge && <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground shrink-0">{ep.badge}</Badge>}
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
          <p className="text-muted-foreground text-sm mb-6">Watch the full MCP + x402 W0G exchange — from initialize to proof-gated tools/call.</p>
          <div className="flex gap-3 mb-5 flex-wrap items-center">
            <select
              value={simBundleId}
              onChange={(e) => setSimBundleId(e.target.value)}
              className="bg-background border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-foreground"
            >
              <option value="bd_example">bd_example (demo)</option>
              {bundles.map(b => (
                <option key={b.bundleId} value={b.bundleId}>{b.name} ({b.bundleId.slice(0, 12)}…)</option>
              ))}
            </select>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2" onClick={simulate} disabled={simState === "running"} data-testid="button-simulate-purchase">
              <Zap className="w-4 h-4" />
              {simState === "running" ? "Simulating..." : "Simulate"}
            </Button>
          </div>

          {simLog.length > 0 && (
            <div className="bg-background rounded-xl p-5 border border-white/10 font-mono text-xs space-y-1.5">
              {simLog.map((line, i) => (
                <div key={i} className={
                  line.startsWith("✓") ? "text-emerald-400" :
                  line.startsWith("←") ? "text-accent" :
                  line.startsWith("→") ? "text-primary" :
                  "text-muted-foreground"
                } data-testid={`sim-log-${i}`}>
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
              Skill content decrypted and returned. Proof token cached — no repeat payment until creator updates Skill content.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
