import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Code2, Layers, Bot, BookOpen, Cpu, Zap, Shield, Globe,
  ArrowRight, ExternalLink, ChevronDown, ChevronRight, Terminal,
} from "lucide-react";

// ── Sections definition ───────────────────────────────────────────────────────

export const DOC_SECTIONS = [
  { id: "overview",      label: "Overview",          icon: BookOpen },
  { id: "concepts",      label: "Core Concepts",     icon: Cpu },
  { id: "for-creators",  label: "For Creators",      icon: Code2 },
  { id: "for-curators",  label: "For Curators",      icon: Layers },
  { id: "for-agents",    label: "For Agents",        icon: Bot },
  { id: "tech-ref",      label: "Technical Reference", icon: Terminal },
] as const;

export type DocSectionId = typeof DOC_SECTIONS[number]["id"];

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 mb-16">
      <h2 className="text-2xl font-bold text-foreground mb-6 pb-3 border-b border-border">{title}</h2>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-5">
      <div className="shrink-0 w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold mt-0.5">
        {n}
      </div>
      <div>
        <div className="font-medium text-foreground mb-1">{title}</div>
        <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function ConceptCard({ icon: Icon, title, color, children }: {
  icon: React.ElementType;
  title: string;
  color: "primary" | "accent" | "amber" | "emerald";
  children: React.ReactNode;
}) {
  const colors = {
    primary: "bg-primary/8 border-primary/25 text-primary",
    accent:  "bg-accent/8 border-accent/25 text-accent",
    amber:   "bg-amber-50 border-amber-200 text-amber-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
  };
  const iconBg = {
    primary: "bg-primary/15 border-primary/25",
    accent:  "bg-accent/15 border-accent/25",
    amber:   "bg-amber-100 border-amber-200",
    emerald: "bg-emerald-100 border-emerald-200",
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-3 ${iconBg[color]}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="font-semibold text-sm mb-2">{title}</div>
      <div className="text-xs leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-muted/60 border border-border rounded-lg px-4 py-3 text-xs font-mono text-foreground overflow-x-auto mb-4 leading-relaxed whitespace-pre">
      {children}
    </pre>
  );
}

function AddrRow({ label, address, explorer }: { label: string; address: string; explorer?: string }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-2.5 pr-6 text-sm font-medium text-foreground">{label}</td>
      <td className="py-2.5 font-mono text-xs text-muted-foreground break-all">
        {explorer ? (
          <a href={explorer} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
            {address} <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        ) : address}
      </td>
    </tr>
  );
}

function ApiRow({ method, path, description }: { method: string; path: string; description: string }) {
  const methodColor = {
    GET: "bg-emerald-100 text-emerald-700",
    POST: "bg-blue-100 text-blue-700",
    DELETE: "bg-red-100 text-red-700",
    PATCH: "bg-amber-100 text-amber-700",
  }[method] ?? "bg-muted text-muted-foreground";
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-2.5 pr-4">
        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${methodColor}`}>{method}</span>
      </td>
      <td className="py-2.5 pr-6 font-mono text-xs text-foreground">{path}</td>
      <td className="py-2.5 text-xs text-muted-foreground">{description}</td>
    </tr>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Docs() {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Track active section via IntersectionObserver
  useEffect(() => {
    observerRef.current?.disconnect();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );
    DOC_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    observerRef.current = observer;
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileNavOpen(false);
  }

  const explorerBase = "https://chainscan-galileo.0g.ai/address";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-20">
        {/* Page header */}
        <div className="py-10 border-b border-border mb-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Documentation
          </div>
          <h1 className="text-4xl font-bold mb-3">SkillFun Docs</h1>
          <p className="text-muted-foreground max-w-2xl">
            Everything you need to know about minting Skills, curating Bundles, and connecting as an AI Agent on the SkillFun marketplace.
          </p>
        </div>

        {/* Mobile TOC toggle */}
        <div className="md:hidden border-b border-border">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="w-full flex items-center justify-between px-0 py-4 text-sm font-medium text-foreground"
          >
            <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> On this page</span>
            {mobileNavOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {mobileNavOpen && (
            <div className="pb-4 flex flex-col gap-1">
              {DOC_SECTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                    activeSection === id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-12 relative">
          {/* Sidebar — desktop */}
          <aside className="hidden md:block w-52 shrink-0">
            <div className="sticky top-20 pt-8 pb-16">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-3">On this page</p>
              <nav className="flex flex-col gap-0.5">
                {DOC_SECTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                      activeSection === id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0 py-10 pb-24">

            {/* ── Overview ─────────────────────────────────────────────────── */}
            <Section id="overview" title="Overview">
              <p className="text-muted-foreground leading-relaxed mb-6">
                SkillFun is a decentralized marketplace for AI Agent Skills. It lets developers mint their GitHub-hosted AI capabilities as on-chain NFTs, curators bundle those Skills into MCP-compatible products, and AI Agents discover and pay for them autonomously — all without human approval.
              </p>

              <SubSection title="What problem does it solve?">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  As AI agents proliferate, there's no standard way to <strong className="text-foreground">own</strong>, <strong className="text-foreground">monetize</strong>, or <strong className="text-foreground">compose</strong> AI capabilities. SkillFun addresses this in three layers:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> <span><strong className="text-foreground">Provenance</strong> — Skills are ERC-7857 NFTs tied to their GitHub repo. Ownership is verifiable on-chain.</span></li>
                  <li className="flex items-start gap-2"><span className="text-accent mt-1">•</span> <span><strong className="text-foreground">Composability</strong> — Curators bundle multiple Skills under one MCP endpoint, creating ready-to-use Agent toolsets.</span></li>
                  <li className="flex items-start gap-2"><span className="text-amber-600 mt-1">•</span> <span><strong className="text-foreground">Autonomous payment</strong> — Agents pay per invocation via x402, a machine-native HTTP payment protocol. The agent uses its own on-chain wallet autonomously — no human sign-in or approval required.</span></li>
                </ul>
              </SubSection>

              <SubSection title="Who is it for?">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <Code2 className="w-5 h-5 text-primary mb-2" />
                    <div className="font-semibold text-sm mb-1">Creators</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">Developers who build AI capabilities and want to monetize them as ownable NFTs.</div>
                  </div>
                  <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                    <Layers className="w-5 h-5 text-accent mb-2" />
                    <div className="font-semibold text-sm mb-1">Curators</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">Operators who bundle Skills into MCP products and earn revenue from agent usage.</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <Bot className="w-5 h-5 text-amber-700 mb-2" />
                    <div className="font-semibold text-sm mb-1">Agents</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">AI systems that discover Bundles, call Skills via MCP, and pay autonomously via x402.</div>
                  </div>
                </div>
              </SubSection>
            </Section>

            {/* ── Core Concepts ─────────────────────────────────────────────── */}
            <Section id="concepts" title="Core Concepts">
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <ConceptCard icon={Shield} title="ERC-7857 — Intelligent NFTs" color="primary">
                  ERC-7857 is an NFT standard for AI capabilities. Each Skill NFT carries encrypted content stored on 0G Storage. Only authorized holders can decrypt it. The GitHub repo URL is locked at mint time, providing immutable provenance.
                </ConceptCard>
                <ConceptCard icon={Globe} title="0G Chain — The Storage Layer" color="accent">
                  0G Chain is a high-throughput blockchain optimized for AI data. Skill content (system prompts, tool specs) is encrypted and uploaded to 0G Storage, with the root hash written on-chain so verifiers can confirm integrity.
                </ConceptCard>
                <ConceptCard icon={Cpu} title="MCP — Model Context Protocol" color="amber">
                  MCP is an open standard for connecting AI models to external tools and data. SkillFun Bundles expose an MCP endpoint that agents connect to. The agent calls <code className="text-xs">tools/list</code> to discover available Skills, then <code className="text-xs">tools/call</code> to invoke them.
                </ConceptCard>
                <ConceptCard icon={Zap} title="x402 — Machine-Native Payments" color="emerald">
                  x402 is an HTTP-based micropayment protocol. When an agent calls a paid Bundle, the server returns HTTP 402 with payment details. The agent's wallet signs a transaction on 0G Chain, then retries with the payment proof. No human approval needed.
                </ConceptCard>
              </div>

              <SubSection title="How Skills and Bundles relate">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  A <strong className="text-foreground">Skill</strong> is a single AI capability, owned by one Creator. A <strong className="text-foreground">Bundle</strong> is a curated collection of Skills exposed as one MCP server. Curators don't own the Skills — they hold authorizations from the Skill NFT contract that let them serve the content.
                </p>
                <div className="bg-muted/50 rounded-xl p-5 border border-border text-sm font-mono text-muted-foreground">
                  <div className="flex items-center gap-2 mb-3">
                    <Code2 className="w-4 h-4 text-primary" />
                    <span className="text-foreground font-sans font-medium text-xs">Data flow</span>
                  </div>
                  <div className="space-y-1 text-xs leading-relaxed">
                    <div>GitHub Repo  <span className="text-muted-foreground/50">──mint──→</span>  Skill NFT (ERC-7857)</div>
                    <div className="pl-8">            <span className="text-muted-foreground/50">──encrypt + upload──→</span>  0G Storage</div>
                    <div>Skill NFT   <span className="text-muted-foreground/50">──authorize──→</span>  Bundle (MCP endpoint)</div>
                    <div>Agent       <span className="text-muted-foreground/50">──MCP tools/call + x402──→</span>  Bundle API</div>
                    <div>Bundle API  <span className="text-muted-foreground/50">──decrypt + serve──→</span>  Agent</div>
                  </div>
                </div>
              </SubSection>
            </Section>

            {/* ── For Creators ─────────────────────────────────────────────── */}
            <Section id="for-creators" title="For Creators">
              <p className="text-muted-foreground leading-relaxed mb-8">
                As a Creator, you mint your AI capability (typically a GitHub repo containing a system prompt, tool spec, or model configuration) as an ERC-7857 NFT on 0G Chain. The NFT is your proof of ownership — curators need your authorization to include it in their Bundles.
              </p>

              <SubSection title="Mint a Skill NFT">
                <Step n={1} title="Connect your wallet">
                  Click <strong>Connect Wallet</strong> in the top-right of the Navbar. SkillFun runs on 0G Chain (Chain ID 16661). Add it to your wallet if prompted.
                </Step>
                <Step n={2} title="Open Create Skill">
                  Click <strong>Create → Skill NFT</strong> in the top-right dropdown, or navigate to <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/app/create</code>.
                </Step>
                <Step n={3} title="Enter your GitHub repo">
                  Paste your GitHub repository URL (e.g. <code className="text-xs bg-muted px-1.5 py-0.5 rounded">github.com/alice/my-ai-skill</code>). For monorepo skills, use the full subpath (e.g. <code className="text-xs bg-muted px-1.5 py-0.5 rounded">github.com/org/repo/tree/main/skills/my-skill</code>).
                </Step>
                <Step n={4} title="Choose registration mode">
                  <div className="space-y-2 mt-1">
                    <div><strong className="text-foreground">Self Registration</strong> — You are the GitHub repo owner. The NFT is minted directly to your wallet after a GitHub OAuth verification.</div>
                    <div><strong className="text-foreground">Community Registration</strong> — You are minting on behalf of someone else. The NFT is held by the SkillNFT contract until the real owner claims it via the Oracle flow.</div>
                  </div>
                </Step>
                <Step n={5} title="Fill in metadata">
                  Add a name, description, tags, and base price (in W0G). This metadata is encrypted and uploaded to 0G Storage. You'll pay a small gas fee on 0G Chain.
                </Step>
                <Step n={6} title="Confirm and mint">
                  Review the summary and sign the transaction. Once confirmed on-chain, your Skill appears in the Market with a <strong>Live</strong> badge.
                </Step>
              </SubSection>

              <SubSection title="Claim an existing Skill NFT">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  If someone else minted a Skill from your repo (Community Registration), you can claim the NFT to your own wallet:
                </p>
                <Step n={1} title="Verify your GitHub identity">
                  Go to <strong>Claim Skill</strong> in the Navbar. Sign in with GitHub OAuth — this proves you own the GitHub account that owns the repo.
                </Step>
                <Step n={2} title="Wait for Oracle approval">
                  The platform Oracle reviews your claim. Once approved, the Oracle contract writes your wallet address on-chain and the NFT becomes transferable to you.
                </Step>
                <Step n={3} title="Transfer to your wallet">
                  Call <code className="text-xs bg-muted px-1.5 py-0.5 rounded">claim()</code> on the SkillNFT contract or click <strong>Claim</strong> in the UI. The NFT is transferred to your connected wallet.
                </Step>
              </SubSection>

              <SubSection title="Update Skill content">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Go to <strong>Dashboard → My Skills</strong>. Click the pencil icon on a Skill to upload new content. A new root hash is written on-chain, incrementing the <code className="text-xs bg-muted px-1.5 py-0.5 rounded">contentVersion</code>. Existing agent proofs tied to old versions are automatically invalidated.
                </p>
              </SubSection>
            </Section>

            {/* ── For Curators ─────────────────────────────────────────────── */}
            <Section id="for-curators" title="For Curators">
              <p className="text-muted-foreground leading-relaxed mb-8">
                Curators assemble Skills into Bundles — curated MCP servers that agents can connect to. You set a service price; agents pay per connection proof via x402. Curators earn revenue from agent usage without needing to create Skills themselves.
              </p>

              <SubSection title="Create a Bundle">
                <Step n={1} title="Open Create Bundle">
                  Click <strong>Create → Bundle</strong> or go to <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/app/create-bundle</code>.
                </Step>
                <Step n={2} title="Fill in Bundle info">
                  Give your Bundle a name, subdomain (used in the MCP endpoint URL), description, and optional workflow instructions (shown to agents on MCP <code className="text-xs bg-muted px-1.5 py-0.5 rounded">initialize</code>).
                </Step>
                <Step n={3} title="Select Skills">
                  Browse minted Skills and select 2 or more to include. Use the sort and tag filters to find relevant Skills. Each Skill has a base price — agents pay the Bundle service price (not individual Skill prices) per proof.
                </Step>
                <Step n={4} title="Set a Workflow (optional)">
                  Write agent instructions in the Workflow field. This text is returned in the MCP <code className="text-xs bg-muted px-1.5 py-0.5 rounded">initialize</code> response and helps agents understand how to orchestrate the Skills in your Bundle.
                </Step>
                <Step n={5} title="Set a Service Price">
                  Enter the price in W0G that agents pay per access proof. Leave blank or set to 0 for a free Bundle. Paid Bundles require agents to send an on-chain transaction before receiving a proof token.
                </Step>
                <Step n={6} title="Review and Deploy">
                  Review the Bundle summary and click Deploy. A signature is required to authorize the Bundle creation. Once deployed, the MCP endpoint is live at <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/mcp/{"{subdomain}"}/...</code>.
                </Step>
              </SubSection>

              <SubSection title="Manage your Bundle">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Go to <strong>Dashboard → My Bundles</strong>. Each Bundle has an expandable panel with three action buttons:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary mt-1">$</span> <span><strong className="text-foreground">Price</strong> — Update the service price. Changes take effect immediately for new proofs.</span></li>
                  <li className="flex items-start gap-2"><span className="text-accent mt-1">📦</span> <span><strong className="text-foreground">Skills</strong> — Add or remove Skills from the Bundle.</span></li>
                  <li className="flex items-start gap-2"><span className="text-muted-foreground mt-1">✎</span> <span><strong className="text-foreground">Edit</strong> — Update name, description, subdomain, and workflow. The Delete button is also here.</span></li>
                </ul>
              </SubSection>

              <SubSection title="MCP endpoint format">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Each Bundle exposes a JSON-RPC 2.0 MCP endpoint and a tools shortcut:
                </p>
                <CodeBlock>{`# Agent-facing endpoints
GET  /mcp/{bundleId}/agent-guide.md  # Human-readable Bundle guide (no auth)
GET  /mcp/{bundleId}/tools           # tools/list shortcut (no auth required)
POST /mcp/{bundleId}/mcp             # JSON-RPC 2.0 — initialize · tools/list · tools/call
                                     # tools/call requires X-402-Payment-Proof header`}</CodeBlock>
              </SubSection>
            </Section>

            {/* ── For Agents ───────────────────────────────────────────────── */}
            <Section id="for-agents" title="For Agents">
              <p className="text-muted-foreground leading-relaxed mb-8">
                AI Agents can discover Bundles on the SkillFun Market, connect to them via the Model Context Protocol, and pay autonomously via x402 — no human in the loop.
              </p>

              <SubSection title="Discovery">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Browse available Bundles at <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/app/market?tab=bundles</code> or query the API:
                </p>
                <CodeBlock>{`GET /api/bundles
# Returns: [ { bundleId, name, description, servicePrice, skillCount, subdomain, ... } ]`}</CodeBlock>
              </SubSection>

              <SubSection title="Connect via MCP">
                <Step n={1} title="Read the Bundle guide">
                  Fetch <code className="text-xs bg-muted px-1.5 py-0.5 rounded">GET /mcp/{"{bundleId}"}/agent-guide.md</code> for human-readable instructions, endpoint URLs, and skill descriptions.
                </Step>
                <Step n={2} title="Discover available tools (no auth needed)">
                  <div>
                    The tools shortcut returns the tool list without any authentication:
                    <CodeBlock>{`GET /mcp/{bundleId}/tools
# Returns: MCP-formatted list of available tools in this Bundle`}</CodeBlock>
                  </div>
                </Step>
                <Step n={3} title="Obtain a proof token">
                  <div className="space-y-3">
                    <p>All <code className="text-xs bg-muted px-1.5 py-0.5 rounded">tools/call</code> requests require a proof token. Obtain one from the prove endpoint:</p>
                    <div>
                      <p className="text-xs font-medium text-foreground mb-1">Free Bundle:</p>
                      <CodeBlock>{`# Sign with your agent wallet: "SkillFun free access: {bundleId}:{tokenId}:{agentWallet}"
POST /api/mcp/payment/prove
Body: { "tokenId": 1, "agentWallet": "0x...", "bundleId": "bd_...", "signature": "0x..." }
Response: { "proof": "proof_token_here", "skillId": "...", "contentVersion": 1 }`}</CodeBlock>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground mb-1">Paid Bundle:</p>
                      <CodeBlock>{`# 1. Send W0G ERC-20 to bundle.ownerAddress on 0G Chain
# 2. Sign with your agent wallet: "SkillFun payment proof: {txHash}"
POST /api/mcp/payment/prove
Body: { "tokenId": 1, "agentWallet": "0x...", "bundleId": "bd_...",
        "txHash": "0x...", "signature": "0x..." }
Response: { "proof": "proof_token_here", "skillId": "...", "contentVersion": 1 }`}</CodeBlock>
                    </div>
                  </div>
                </Step>
                <Step n={4} title="Invoke tools via JSON-RPC 2.0">
                  <div>
                    Send JSON-RPC 2.0 requests to the MCP endpoint. Include the proof token and your wallet in headers:
                    <CodeBlock>{`POST /mcp/{bundleId}/mcp
X-402-Payment-Proof: {proof_token}
X-402-Agent-Wallet:  {your_wallet_address}
Content-Type: application/json

{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"{TOOL_NAME}","arguments":{}}}`}</CodeBlock>
                  </div>
                </Step>
              </SubSection>

              <SubSection title="x402 payment flow">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  When a paid Bundle's <code className="text-xs bg-muted px-1.5 py-0.5 rounded">tools/call</code> is called without a valid proof, the server responds with HTTP 402:
                </p>
                <div className="bg-muted/50 rounded-xl p-5 border border-border text-xs font-mono space-y-1 text-muted-foreground">
                  <div>Agent  <span className="text-muted-foreground/50">──POST /mcp/.../mcp (tools/call, no proof)──→</span>  Server</div>
                  <div>Server <span className="text-muted-foreground/50">──HTTP 402 + {"{ method, payTo, amount }"}──→</span>  Agent</div>
                  <div>Agent  <span className="text-muted-foreground/50">──send W0G ERC-20 to curator wallet──→</span>  0G Chain</div>
                  <div>Agent  <span className="text-muted-foreground/50">──POST /api/mcp/payment/prove + sig──→</span>  Server</div>
                  <div>Server <span className="text-muted-foreground/50">──{"{ proof }"}──→</span>  Agent</div>
                  <div>Agent  <span className="text-muted-foreground/50">──POST /mcp/.../mcp + X-402-Payment-Proof──→</span>  Server</div>
                  <div>Server <span className="text-muted-foreground/50">──tool result──→</span>  Agent</div>
                </div>
                <div className="mt-3 border border-border rounded-lg overflow-hidden text-xs">
                  <table className="w-full">
                    <thead><tr className="bg-muted/50 border-b border-border">
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">Header</th>
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">Required on</th>
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">Value</th>
                    </tr></thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="py-2 px-3 font-mono">X-402-Payment-Proof</td>
                        <td className="py-2 px-3 text-muted-foreground">tools/call</td>
                        <td className="py-2 px-3 text-muted-foreground">The <code>proof</code> string from /prove</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono">X-402-Agent-Wallet</td>
                        <td className="py-2 px-3 text-muted-foreground">tools/call</td>
                        <td className="py-2 px-3 text-muted-foreground">Your wallet address (EIP-55 checksum)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </SubSection>
            </Section>

            {/* ── Technical Reference ──────────────────────────────────────── */}
            <Section id="tech-ref" title="Technical Reference">
              <SubSection title="Contract Addresses (0G Chain Mainnet — Chain ID 16661)">
                <div className="border border-border rounded-xl overflow-hidden mb-6">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="py-2.5 px-4 text-xs font-semibold text-muted-foreground">Contract</th>
                        <th className="py-2.5 px-4 text-xs font-semibold text-muted-foreground">Address</th>
                      </tr>
                    </thead>
                    <tbody className="px-4">
                      <tr className="border-b border-border">
                        <td className="py-2.5 px-4 text-sm font-medium">SkillNFT (V3 Proxy)</td>
                        <td className="py-2.5 px-4 font-mono text-xs text-muted-foreground">
                          <a href={`${explorerBase}/0x16221091Fe04BFEFe54Cd02234946c7eFDB37477`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                            0x16221091Fe04BFEFe54Cd02234946c7eFDB37477 <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2.5 px-4 text-sm font-medium">SkillFun Oracle</td>
                        <td className="py-2.5 px-4 font-mono text-xs text-muted-foreground">
                          <a href={`${explorerBase}/0xD01885aE4E9d30B44C73E8f9B8ceA04869e70167`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                            0xD01885aE4E9d30B44C73E8f9B8ceA04869e70167 <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-sm font-medium">W0G Token</td>
                        <td className="py-2.5 px-4 font-mono text-xs text-muted-foreground">
                          <a href={`${explorerBase}/0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                            0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </SubSection>

              <SubSection title="0G Chain RPC">
                <CodeBlock>{`# 0G Mainnet
RPC URL:    https://evmrpc.0g.ai
Chain ID:   16661
Currency:   OG (native), W0G (wrapped ERC-20)
Explorer:   https://chainscan.0g.ai`}</CodeBlock>
              </SubSection>

              <SubSection title="REST API Endpoints">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Base URL: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{window.location.origin}{import.meta.env.BASE_URL.replace(/\/$/, "")}</code>
                </p>
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="py-2.5 px-4 text-xs font-semibold text-muted-foreground w-16">Method</th>
                        <th className="py-2.5 px-4 text-xs font-semibold text-muted-foreground">Path</th>
                        <th className="py-2.5 px-4 text-xs font-semibold text-muted-foreground">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { method: "GET",  path: "/api/skills",             description: "List all Skills with metadata and stats" },
                        { method: "GET",  path: "/api/skills/:id",         description: "Get a single Skill by ID" },
                        { method: "POST", path: "/api/skills",             description: "Register a new Skill (auth required)" },
                        { method: "GET",  path: "/api/bundles",            description: "List all Bundles" },
                        { method: "GET",  path: "/api/bundles/:id",        description: "Get a single Bundle by ID" },
                        { method: "POST", path: "/api/bundles",            description: "Create a Bundle (auth required)" },
                        { method: "GET",  path: "/api/stats",                    description: "Platform-wide stats (skills, bundles, invocations)" },
                        { method: "POST", path: "/api/mcp/payment/prove",        description: "Obtain a proof token (free or paid bundle)" },
                        { method: "GET",  path: "/mcp/:bundleId/tools",          description: "MCP tools/list shortcut — no auth required" },
                        { method: "POST", path: "/mcp/:bundleId/mcp",            description: "JSON-RPC 2.0 dispatcher — tools/call requires X-402-Payment-Proof" },
                        { method: "GET",  path: "/mcp/:bundleId/agent-guide.md", description: "Human-readable Bundle guide for agents" },
                      ].map((row) => (
                        <tr key={`${row.method}:${row.path}`} className="border-b border-border last:border-0">
                          <td className="py-2.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                              row.method === "GET" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                            }`}>{row.method}</span>
                          </td>
                          <td className="py-2.5 px-4 font-mono text-xs text-foreground">{row.path}</td>
                          <td className="py-2.5 px-4 text-xs text-muted-foreground">{row.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SubSection>

              <SubSection title="External Resources">
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { title: "ERC-7857 Spec", desc: "Intelligent NFT standard on 0G Chain", href: "https://docs.0g.ai/developer-hub/building-on-0g/agentic-id/erc7857" },
                    { title: "MCP Specification", desc: "Model Context Protocol docs (2026-07-28)", href: "https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro" },
                    { title: "x402 Protocol", desc: "Machine-native HTTP payment standard", href: "https://x402.org/" },
                    { title: "0G Chain Docs", desc: "Developer hub and RPC documentation", href: "https://docs.0g.ai" },
                  ].map((r) => (
                    <a key={r.href} href={r.href} target="_blank" rel="noopener noreferrer"
                      className="flex items-start justify-between gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/50 transition-all group">
                      <div>
                        <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{r.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{r.desc}</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                    </a>
                  ))}
                </div>
              </SubSection>

              <div className="mt-10 bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-start gap-4">
                <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm mb-1">Ready to get started?</div>
                  <div className="text-xs text-muted-foreground mb-3">Mint your first Skill NFT or browse the Market to see what's available.</div>
                  <div className="flex gap-2 flex-wrap">
                    <Link href="/app/create">
                      <Button size="sm" className="h-7 text-xs gap-1">
                        Mint a Skill <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                    <Link href="/app/market">
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        Browse Market
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Section>

          </main>
        </div>
      </div>
    </div>
  );
}
