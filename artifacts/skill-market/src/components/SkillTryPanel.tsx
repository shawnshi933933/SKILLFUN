import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, Zap, ChevronRight, RotateCcw, Lock } from "lucide-react";

const STORAGE_KEY = "skillfun_trial_counts";

function getTrialCount(skillId: string): number {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return data[skillId] ?? 0;
  } catch {
    return 0;
  }
}

function incrementTrial(skillId: string): number {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    data[skillId] = (data[skillId] ?? 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data[skillId];
  } catch {
    return 1;
  }
}

const EXAMPLE_PROMPTS: Record<string, string[]> = {
  Trading: [
    "Analyze ETH/USDC — should I long or short right now?",
    "What's the MEV opportunity on Uniswap V3 in the last 15 minutes?",
    "Give me a trading signal for BTC with RSI and MACD context",
  ],
  Code: [
    "Audit this Solidity snippet:\nfunction withdraw(uint amount) public { balances[msg.sender] -= amount; payable(msg.sender).transfer(amount); }",
    "Find reentrancy vulnerabilities in a standard ERC-20 contract",
    "Scan this contract address for common exploit patterns: 0xabc123...",
  ],
  Research: [
    "Summarize the latest DeFi protocol risks for Q2 2025",
    "What are the top 3 yield farming opportunities on Arbitrum this week?",
    "Compare liquidity depth of Uniswap V4 vs Curve Finance",
  ],
  Analysis: [
    "Model the tokenomics for a new DeFi protocol with 100M total supply",
    "Analyze wallet 0x8f3a...b4c5 — classify as whale, bot, or retail",
    "Predict bonding curve price for 500 new holders joining",
  ],
  Writing: [
    "Write a Twitter thread about why AI Agents need on-chain identity",
    "Draft a whitepaper abstract for a cross-chain MEV protection protocol",
    "Write a Discord announcement for a new yield vault launch",
  ],
  Social: [
    "Generate 5 viral tweet ideas about the AI Agent economy",
    "Write a LinkedIn post about tokenized AI skills for a VC audience",
    "Create an engagement hook for a Farcaster cast about ERC-7857 iNFT",
  ],
};

const THINKING_STEPS: Record<string, string[]> = {
  Trading: [
    "Verifying content hash on IPFS...",
    "Loading market data feeds...",
    "Computing RSI, MACD, Bollinger Bands...",
    "Scanning on-chain order flow...",
    "Running signal model...",
  ],
  Code: [
    "Verifying content hash on IPFS...",
    "Parsing contract bytecode...",
    "Running static analysis pass...",
    "Checking against vulnerability database...",
    "Generating security report...",
  ],
  Research: [
    "Verifying content hash on IPFS...",
    "Querying protocol data sources...",
    "Aggregating liquidity metrics...",
    "Cross-referencing risk vectors...",
    "Composing research summary...",
  ],
  Analysis: [
    "Verifying content hash on IPFS...",
    "Loading on-chain data...",
    "Running quantitative model...",
    "Backtesting assumptions...",
    "Generating analysis output...",
  ],
  Writing: [
    "Verifying content hash on IPFS...",
    "Analyzing target audience...",
    "Structuring narrative arc...",
    "Drafting content...",
    "Polishing tone and style...",
  ],
  Social: [
    "Verifying content hash on IPFS...",
    "Researching trending topics...",
    "Analyzing engagement patterns...",
    "Generating content variants...",
    "Optimizing for virality...",
  ],
};

function generateMockResponse(skillName: string, category: string, input: string): string {
  const q = input.toLowerCase();

  if (category === "Trading") {
    if (q.includes("eth") || q.includes("ethereum")) {
      return `## SkillFun AI · ${skillName}

**Market Signal: ETH/USDC**
Timeframe: 4H · Generated: ${new Date().toLocaleTimeString()}

---

**Technical Summary**
- RSI (14): 58.4 → Neutral-Bullish territory
- MACD: Bullish crossover confirmed 2 candles ago
- Bollinger Bands: Price sitting at mid-band, room to upper band at $3,284
- Volume: 18% above 20-period average (accumulation signal)

**On-Chain Signals**
- Exchange net outflow last 4h: −42,180 ETH (bullish — withdrawal from exchanges)
- Whale wallets (>10k ETH): 3 large buys in last 6h totaling 28,400 ETH
- Funding rate (perpetuals): +0.018% — slightly overheated but not extreme

**Recommendation**
\`\`\`
Direction:  LONG
Entry zone: $3,101 – $3,118
Stop loss:  $3,058 (below structure)
Target 1:   $3,220 (+3.3%)
Target 2:   $3,284 (+5.4%)
Risk/Reward: 1:3.1
\`\`\`

**Confidence:** 73% · Invalidation: 4H close below $3,058
*This is a simulated trial output. Purchase access for live real-time signals.*`;
    }

    if (q.includes("mev") || q.includes("uniswap")) {
      return `## SkillFun AI · ${skillName}

**MEV Opportunity Scan · Uniswap V3**
Window: Last 15 minutes · Block range: 21,847,201 – 21,847,290

---

**Sandwich Opportunities Detected**
| Pool | Slippage | Est. Profit | Gas Cost | Net |
|------|----------|-------------|----------|-----|
| WETH/USDC 0.05% | 0.42% | $184 | $31 | **$153** |
| ARB/ETH 0.3% | 1.1% | $67 | $28 | **$39** |
| PEPE/WETH 1% | 3.8% | $312 | $44 | **$268** |

**Arbitrage Loops**
- Uniswap V3 → Curve WETH/stETH: +$89 per loop (6 executions possible)
- V3 USDC/DAI → Balancer: +$12 per loop (stale price window: ~3 blocks)

**Backrun Candidates**
- Large WETH buy ($2.1M) incoming in mempool — backrun opportunity ~$340 estimated

**Summary**
Total MEV extractable (last 15m): **~$1,840**
Competition index: High (12 bots active on top pools)

*Simulated trial. Real execution requires full skill access + ERC-8004 agent identity.*`;
    }

    return `## SkillFun AI · ${skillName}

**Trading Signal · BTC/USDT**
Generated: ${new Date().toLocaleTimeString()}

---

**Indicator Stack**
- RSI (14): 62.1 → Bullish momentum building
- MACD histogram: Positive, expanding
- EMA 20/50 cross: Bullish (2 days old)
- Volume delta: +23% vs previous session

**Signal**
\`\`\`
Direction:  LONG
Confidence: 68%
Entry:      $67,200 – $67,800
SL:         $65,900
TP1:        $70,400
TP2:        $73,100
\`\`\`

*This is a trial output. Purchase full access for live signals, auto-execution, and portfolio integration.*`;
  }

  if (category === "Code") {
    return `## SkillFun AI · ${skillName}

**Security Audit Report**
Severity levels: 🔴 Critical · 🟠 High · 🟡 Medium · 🟢 Low

---

🔴 **CRITICAL — Reentrancy Vulnerability**
\`\`\`solidity
// VULNERABLE: State updated AFTER external call
function withdraw(uint amount) public {
    balances[msg.sender] -= amount;
    payable(msg.sender).transfer(amount); // ← external call before state finalize
}
\`\`\`
**Attack vector:** Malicious contract re-enters \`withdraw()\` before balance deduction completes.
**Estimated loss exposure:** Up to full contract balance.
**Fix:**
\`\`\`solidity
function withdraw(uint amount) public {
    require(balances[msg.sender] >= amount, "Insufficient");
    balances[msg.sender] -= amount; // ← update state FIRST
    (bool ok,) = payable(msg.sender).call{value: amount}("");
    require(ok, "Transfer failed");
}
\`\`\`

🟠 **HIGH — Integer Underflow Risk** (pre-Solidity 0.8)
If compiled with <0.8.0, \`balances[msg.sender] -= amount\` can underflow when \`amount > balance\`. Add explicit \`require\` check.

🟡 **MEDIUM — Missing Access Control**
No \`onlyOwner\` or role-based restriction on \`withdraw\`. Any address can drain funds if \`balances\` mapping is manipulable.

🟢 **LOW — Gas Optimization**
Use \`call{value}\` instead of \`.transfer()\` — \`.transfer()\` forwards only 2300 gas, may fail with smart contract recipients.

---

**Overall Risk Score: 9.1 / 10** ⛔
Recommend: Do NOT deploy without fixes.

*Trial output. Purchase access for continuous monitoring, automated patching suggestions, and CI/CD integration.*`;
  }

  if (category === "Research") {
    return `## SkillFun AI · ${skillName}

**DeFi Research Brief**
Query: "${input.slice(0, 60)}${input.length > 60 ? "..." : ""}"
Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

---

**Executive Summary**
The DeFi landscape in Q2 2025 is characterized by three dominant trends: restaking yield compression, real-world asset (RWA) protocol growth, and agent-driven liquidity fragmentation.

**Key Findings**

1. **Restaking Yields Compressed**
   EigenLayer AVS rewards have normalized to 4–7% APY (down from 18% at launch). LRT protocols (Renzo, Kelp, Puffer) are competing on points multipliers. Risk: slashing events remain underpriced.

2. **RWA Protocols Surging**
   - Ondo Finance TVL: $2.8B (+340% YoY)
   - Maple Finance institutional loans: $890M active
   - Tokenized T-bills now account for 12% of stablecoin-adjacent liquidity

3. **Agent Liquidity Fragmentation**
   AI agents now represent ~23% of DEX volume on Arbitrum. This creates MEV patterns not seen in human-driven markets — specifically "agent herding" around similar signal outputs.

**Top Opportunities (Risk-Adjusted)**
| Protocol | Strategy | APY | Risk |
|----------|----------|-----|------|
| Pendle (PT-sUSDe) | Fixed yield | 11.2% | Low |
| Morpho Blue | USDC lending | 8.7% | Low |
| Kamino (SOL) | Leveraged LP | 34% | High |

*Trial output. Purchase for live data feeds, custom research queries, and weekly briefings.*`;
  }

  if (category === "Analysis") {
    return `## SkillFun AI · ${skillName}

**Quantitative Analysis Output**
Input: "${input.slice(0, 80)}${input.length > 80 ? "..." : ""}"

---

**Tokenomics Model Results**

*Assumptions: 100M total supply, 4-year vesting, ERC-7857 iNFT skill registry integration*

**Supply Schedule**
\`\`\`
Year 0: 15M circulating (seed + public + ecosystem bootstrap)
Year 1: 35M circulating (+20M team/advisor unlock begins)
Year 2: 58M circulating (full community unlock)
Year 3: 82M circulating
Year 4: 100M fully diluted
\`\`\`

**Bonding Curve Projection** (if skill-backed)
- At 100 holders: 0.15 ETH floor
- At 500 holders: 0.41 ETH
- At 2,000 holders: 1.24 ETH
- Estimated protocol revenue at 2k holders: $18,400/month

**Concentration Risk**
- Top 10 wallets holding >5% each = high centralization risk
- Recommend: vesting cliff of 12 months minimum for team allocation

**Verdict:** Tokenomics are viable if team allocation stays ≤15%. Emission schedule is aggressive — consider extending to 5 years to reduce sell pressure.

*Trial output. Full access includes Monte Carlo simulations, comparable protocol benchmarking, and live on-chain tracking.*`;
  }

  if (category === "Writing") {
    return `## SkillFun AI · ${skillName}

**Content Output**
Format: Twitter Thread · Topic: "${input.slice(0, 50)}${input.length > 50 ? "..." : ""}"

---

**🧵 Thread (1/7)**
AI Agents are about to own more on-chain assets than humans.

Not because they're smarter. Because they never sleep, never panic, and never pay for gas twice.

Here's what the agent economy actually looks like 👇

---

**(2/7)**
Right now, an AI agent buying a "Skill" is like hiring a freelancer — but the payment settles in 200ms, there's no invoice, and the freelancer is an NFT.

This is x402 protocol. The agent sends USDC. The skill unlocks. No human involved.

---

**(3/7)**
The insane part? The *skills themselves* earn royalties.

Every time Agent-B buys Skill-A, the creator gets 50%. Early holders get 30%. Platform: 20%.

It's a perpetual revenue stream for publishing your expertise on-chain.

---

**(4/7)**
On-chain identity (ERC-8004) means agents have reputation scores.

A known, trusted agent gets better rates. A new agent pays more. Just like credit scores — but fully transparent and on-chain.

---

**(5/7)**
The flywheel:
- Creators mint skills ⚡
- Agents buy + use them 🤖
- Usage → fees → shared with holders 💰
- Holders reinvest → price rises → more creators join
- Repeat.

---

**(6/7)**
This isn't DeFi. This isn't NFTs.

It's the Machine Economy — where AI agents are economic participants with budgets, identities, and asset portfolios.

We're building the infrastructure layer. ERC-7857 iNFT + ERC-8004 on 0G Chain.

---

**(7/7)**
If you're a developer, researcher, or trader:

Your expertise can be tokenized, traded, and earning 24/7 — even while you sleep.

That's SkillFun. That's the AI Era.

→ [link]

---
*Trial output. Purchase for unlimited generation, custom voice/style settings, and scheduled posting integration.*`;
  }

  // Social / default
  return `## SkillFun AI · ${skillName}

**Social Content Pack**
Platform: Multi-channel · Query: "${input.slice(0, 60)}${input.length > 60 ? "..." : ""}"

---

**Twitter/X — Hook Variants**
1. "AI Agents just crossed $1B in autonomous on-chain spending. Most people have no idea what's coming. 🧵"
2. "Your expertise as an NFT. Traded by AI agents while you sleep. This is the Skill Economy — and it's live."
3. "The next trillion-dollar market isn't crypto. It's AI agents that *own* crypto. Here's why that matters ↓"

**LinkedIn Post**
The conversation about AI in the workplace is missing something critical: AI Agents don't just *assist* — they're becoming autonomous economic actors.

In the emerging Machine Economy, AI agents discover, purchase, and execute specialized skills via on-chain micropayments. No approvals. No invoices. Just instant, verifiable value exchange at internet speed.

For investors and operators paying attention: the infrastructure layer (identity, payments, skill registries) is where the real moat is being built.

ERC-7857 iNFT and x402 are early standards. The companies that own the rails will define the next decade of AI commerce.

**Farcaster Cast**
The AI skill market is live on 0G Chain (16661). 847 skills. 12k agent purchases. Real fees flowing to creators.

This is what autonomous agent commerce looks like before it hits mainnet. Cast & recast if you're paying attention /defi /agents

---
*Trial output. Purchase for scheduled posts, analytics tracking, and A/B content testing.*`;
}

interface Props {
  skillId: string;
  skillName: string;
  category: string;
}

export default function SkillTryPanel({ skillId, skillName, category }: Props) {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<"idle" | "thinking" | "streaming" | "done">("idle");
  const [thinkingStep, setThinkingStep] = useState(0);
  const [output, setOutput] = useState("");
  const [trialCount, setTrialCount] = useState(() => getTrialCount(skillId));
  const outputRef = useRef<HTMLDivElement>(null);
  const MAX_TRIALS = 3;
  const remaining = MAX_TRIALS - trialCount;

  const examples = EXAMPLE_PROMPTS[category] ?? EXAMPLE_PROMPTS["Research"];
  const thinkingSteps = THINKING_STEPS[category] ?? THINKING_STEPS["Research"];

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleTry = async () => {
    if (!input.trim() || remaining <= 0 || phase !== "idle") return;

    const newCount = incrementTrial(skillId);
    setTrialCount(newCount);
    setOutput("");
    setPhase("thinking");
    setThinkingStep(0);

    // Cycle through thinking steps
    for (let i = 0; i < thinkingSteps.length; i++) {
      setThinkingStep(i);
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    }

    setPhase("streaming");
    const fullText = generateMockResponse(skillName, category, input);

    // Stream character by character (batched for speed)
    let idx = 0;
    const BATCH = 4;
    while (idx < fullText.length) {
      const chunk = fullText.slice(idx, idx + BATCH);
      setOutput((prev) => prev + chunk);
      idx += BATCH;
      await new Promise((r) => setTimeout(r, 12 + Math.random() * 8));
    }

    setPhase("done");
  };

  const handleReset = () => {
    setOutput("");
    setInput("");
    setPhase("idle");
  };

  return (
    <div className="bg-card border border-primary/20 rounded-2xl overflow-hidden" data-testid="skill-try-panel">
      {/* Header — always visible */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
        onClick={() => setOpen((v) => !v)}
        data-testid="button-toggle-try-panel"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-sm flex items-center gap-2">
              Try this Skill
              <Badge variant="outline" className="border-primary/30 text-primary text-xs px-2 py-0">
                Free Preview
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {remaining > 0
                ? `${remaining} free trial${remaining !== 1 ? "s" : ""} remaining · Platform covers x402 fee for previews`
                : "Trial limit reached — purchase access via x402 for unlimited calls"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* trial dots */}
          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: MAX_TRIALS }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < trialCount ? "bg-muted-foreground/30" : "bg-primary"
                }`}
              />
            ))}
          </div>
          <ChevronRight
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          />
        </div>
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="px-5 pb-5 border-t border-white/10">
          {remaining <= 0 ? (
            /* No trials left */
            <div className="pt-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-muted/20 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="font-semibold mb-2">Trial limit reached</div>
              <p className="text-sm text-muted-foreground mb-4">
                You've used all 3 free trials for this Skill. Purchase access to run unlimited queries.
              </p>
              <div className="text-xs text-muted-foreground bg-white/5 rounded-lg px-4 py-3">
                Full access includes live data, real execution, API integration, and priority inference.
              </div>
            </div>
          ) : (
            <div className="pt-4 space-y-4">
              {/* Example prompts */}
              {phase === "idle" && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Example queries</div>
                  <div className="flex flex-wrap gap-2">
                    {examples.map((ex) => (
                      <button
                        key={ex}
                        className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground text-left"
                        onClick={() => setInput(ex)}
                        data-testid="button-example-prompt"
                      >
                        {ex.length > 48 ? ex.slice(0, 48) + "…" : ex}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              {phase === "idle" && (
                <div className="space-y-3">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask ${skillName} anything...`}
                    className="bg-background border-white/10 min-h-[80px] resize-none text-sm"
                    data-testid="input-try-skill"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleTry();
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">⌘ + Enter to run · {remaining} trial{remaining !== 1 ? "s" : ""} left</span>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                      onClick={handleTry}
                      disabled={!input.trim()}
                      data-testid="button-run-trial"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Run Trial
                    </Button>
                  </div>
                </div>
              )}

              {/* Thinking state */}
              {phase === "thinking" && (
                <div className="bg-background rounded-xl border border-white/10 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-primary animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">Loading skill context...</span>
                  </div>
                  <div className="space-y-1.5">
                    {thinkingSteps.map((step, i) => (
                      <div
                        key={step}
                        className={`flex items-center gap-2 text-xs transition-opacity duration-300 ${
                          i <= thinkingStep ? "opacity-100" : "opacity-20"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            i < thinkingStep
                              ? "bg-emerald-400"
                              : i === thinkingStep
                              ? "bg-primary animate-pulse"
                              : "bg-muted-foreground/30"
                          }`}
                        />
                        <span className={i < thinkingStep ? "text-muted-foreground line-through" : "text-muted-foreground"}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Streaming / done output */}
              {(phase === "streaming" || phase === "done") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                      <span className="text-primary font-medium">{skillName}</span>
                      <span>·</span>
                      <span>Trial output</span>
                      {phase === "streaming" && (
                        <span className="inline-block w-1.5 h-3.5 bg-primary animate-pulse rounded-sm ml-0.5" />
                      )}
                    </div>
                    {phase === "done" && (
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
                        Complete
                      </Badge>
                    )}
                  </div>

                  <div
                    ref={outputRef}
                    className="bg-background rounded-xl border border-white/10 p-4 text-sm font-mono leading-relaxed max-h-[420px] overflow-y-auto whitespace-pre-wrap text-foreground/90"
                    data-testid="output-trial-result"
                  >
                    {output}
                  </div>

                  {phase === "done" && (
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {remaining - 1 > 0
                          ? `${remaining - 1} trial${remaining - 1 !== 1 ? "s" : ""} remaining after this`
                          : "No trials remaining after this — consider purchasing access"}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-muted-foreground hover:text-foreground gap-1.5"
                        onClick={handleReset}
                        data-testid="button-try-again"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Try again
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
