// Helper — donut segment path (fractions 0-1, clockwise from 12 o'clock)
function donutPath(
  cx: number, cy: number, R: number, r: number,
  s: number, e: number,
): string {
  const a1 = s * 2 * Math.PI, a2 = e * 2 * Math.PI;
  const pt = (a: number, rad: number) =>
    `${(cx + rad * Math.sin(a)).toFixed(1)} ${(cy - rad * Math.cos(a)).toFixed(1)}`;
  const lg = e - s >= 0.5 ? 1 : 0;
  return [
    `M ${pt(a1, R)}`,
    `A ${R} ${R} 0 ${lg} 1 ${pt(a2, R)}`,
    `L ${pt(a2, r)}`,
    `A ${r} ${r} 0 ${lg} 0 ${pt(a1, r)}`,
    "Z",
  ].join(" ");
}

export default function S14Architecture() {
  const AGT = { cx: 640, cy: 129, r: 32 };
  const MEM = { cx: 390, cy: 129 };
  const MCP = { top: 237, bot: 277 };
  const BND = [
    { cx: 227,  top: 325, bot: 431 },
    { cx: 640,  top: 325, bot: 431 },
    { cx: 1053, top: 325, bot: 431 },
  ];
  const NFT = [
    { name: "NLP",    cx: 129  },
    { name: "Vision", cx: 334  },
    { name: "Search", cx: 539  },
    { name: "Reason", cx: 744  },
    { name: "Plan",   cx: 949  },
    { name: "Draw",   cx: 1153 },
  ];
  const NFTY = 482;
  const DONUT = { cx: 870, cy: 170, R: 40, r: 24 };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 80% 55% at 50% 35%, rgba(139,92,246,0.07) 0%, transparent 65%)",
      }}
    >
      {/* Decorative bars */}
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg,#8B5CF6,#22D3EE,transparent)" }} />
      {/* Header */}
      <div style={{ position: "absolute", top: "3vh", left: "6vw" }}>
        <span style={{
          fontFamily: "var(--font-body-family)", color: "#22D3EE",
          fontSize: "1.1vw", fontWeight: 400, letterSpacing: "0.24em", textTransform: "uppercase",
        }}>System Architecture</span>
      </div>
      <div style={{ position: "absolute", top: "7vh", left: "6vw" }}>
        <span style={{
          fontFamily: "var(--font-display-family)", fontSize: "2.4vw",
          fontWeight: 800, color: "#F0F0F8", letterSpacing: "-0.02em",
        }}>
          Five roles.{" "}
          <span style={{ color: "#22D3EE" }}>Four layers.</span>{" "}
          <span style={{ color: "#8B5CF6" }}>One market.</span>
        </span>
      </div>
      {/* SVG layer */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        viewBox="0 0 1280 720"
        preserveAspectRatio="none"
      >
        <defs>
          <marker id="ap" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polygon points="0,0 6,3 0,6" fill="#A78BFA" />
          </marker>
          <marker id="at" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polygon points="0,0 6,3 0,6" fill="#22D3EE" />
          </marker>
          <marker id="aa" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polygon points="0,0 6,3 0,6" fill="#FCD34D" />
          </marker>
          <marker id="al" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polygon points="0,0 6,3 0,6" fill="#B4A0FF" />
          </marker>
          <marker id="amem" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polygon points="0,0 6,3 0,6" fill="#34D399" />
          </marker>
        </defs>

        {/* Memory ← Agent */}
        <line
          x1={AGT.cx - AGT.r} y1={AGT.cy}
          x2={MEM.cx + 22} y2={MEM.cy}
          stroke="rgba(52,211,153,0.7)" strokeWidth="1.3" strokeDasharray="4 2"
          markerEnd="url(#amem)"
        />

        {/* Memory → NFT layer (left outer edge) */}
        <path
          d={`M ${MEM.cx} ${MEM.cy + 22} C 10 ${MEM.cy + 22}, 10 509, 80 509`}
          fill="none" stroke="rgba(52,211,153,0.55)" strokeWidth="1.3"
          strokeDasharray="5 3" markerEnd="url(#amem)"
        />
        {/* ERC-8004 tag on Memory → NFT line */}
        <rect x={2} y={312} width={58} height={14} rx={2.5}
          fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.42)" strokeWidth={0.8} />
        <text x={31} y={322} fill="#34D399" fontSize="8.5"
          fontFamily="DM Sans, sans-serif" fontWeight="700"
          textAnchor="middle" opacity="0.88">ERC-8004</text>

        {/* Agent ↓ MCP */}
        <line
          x1={AGT.cx} y1={AGT.cy + AGT.r + 2} x2={AGT.cx} y2={MCP.top}
          stroke="#22D3EE" strokeWidth="1.6" strokeDasharray="4 2"
          markerEnd="url(#at)"
        />

        {/* MCP ↑ Agent (ERC-8183) */}
        <line
          x1={AGT.cx - 10} y1={MCP.top} x2={AGT.cx - 10} y2={AGT.cy + AGT.r + 2}
          stroke="rgba(167,139,250,0.55)" strokeWidth="1.1" strokeDasharray="3 3"
          markerEnd="url(#ap)"
        />

        {/* x402 pay: Agent → Donut */}
        <line
          x1={AGT.cx + AGT.r + 2} y1={AGT.cy}
          x2={DONUT.cx - DONUT.R - 4} y2={DONUT.cy}
          stroke="#FCD34D" strokeWidth="1.3" strokeDasharray="4 2"
          markerEnd="url(#aa)"
        />
        <text x={AGT.cx + AGT.r + 14} y={AGT.cy - 5}
          fill="#FCD34D" fontSize="9.5" fontFamily="DM Sans, sans-serif"
          fontWeight="700" opacity="0.85">
          x402 pay
        </text>

        {/* MCP ↓ each Bundle — inlined */}
        <line
          x1={BND[0].cx} y1={MCP.bot} x2={BND[0].cx} y2={BND[0].top}
          stroke="rgba(180,160,255,0.55)" strokeWidth="1.5" markerEnd="url(#al)"
        />
        <line
          x1={BND[1].cx} y1={MCP.bot} x2={BND[1].cx} y2={BND[1].top}
          stroke="rgba(180,160,255,0.55)" strokeWidth="1.5" markerEnd="url(#al)"
        />
        <line
          x1={BND[2].cx} y1={MCP.bot} x2={BND[2].cx} y2={BND[2].top}
          stroke="rgba(180,160,255,0.55)" strokeWidth="1.5" markerEnd="url(#al)"
        />

        {/* Bundle A → NLP, Vision */}
        <line x1={BND[0].cx} y1={BND[0].bot} x2={NFT[0].cx} y2={NFTY}
          stroke="rgba(139,92,246,0.45)" strokeWidth="1.2" markerEnd="url(#ap)" />
        <line x1={BND[0].cx} y1={BND[0].bot} x2={NFT[1].cx} y2={NFTY}
          stroke="rgba(139,92,246,0.45)" strokeWidth="1.2" markerEnd="url(#ap)" />

        {/* Bundle B → Search, Reason */}
        <line x1={BND[1].cx} y1={BND[1].bot} x2={NFT[2].cx} y2={NFTY}
          stroke="rgba(139,92,246,0.45)" strokeWidth="1.2" markerEnd="url(#ap)" />
        <line x1={BND[1].cx} y1={BND[1].bot} x2={NFT[3].cx} y2={NFTY}
          stroke="rgba(139,92,246,0.45)" strokeWidth="1.2" markerEnd="url(#ap)" />

        {/* Bundle C → Plan, Draw */}
        <line x1={BND[2].cx} y1={BND[2].bot} x2={NFT[4].cx} y2={NFTY}
          stroke="rgba(139,92,246,0.45)" strokeWidth="1.2" markerEnd="url(#ap)" />
        <line x1={BND[2].cx} y1={BND[2].bot} x2={NFT[5].cx} y2={NFTY}
          stroke="rgba(139,92,246,0.45)" strokeWidth="1.2" markerEnd="url(#ap)" />

        {/* Cross-bundle connections */}
        <line x1={BND[0].cx} y1={BND[0].bot} x2={NFT[2].cx} y2={NFTY}
          stroke="rgba(139,92,246,0.45)" strokeWidth="1.2" markerEnd="url(#ap)" />
        <line x1={BND[2].cx} y1={BND[2].bot} x2={NFT[3].cx} y2={NFTY}
          stroke="rgba(139,92,246,0.45)" strokeWidth="1.2" markerEnd="url(#ap)" />
        <line x1={BND[1].cx} y1={BND[1].bot} x2={NFT[4].cx} y2={NFTY}
          stroke="rgba(139,92,246,0.45)" strokeWidth="1.2" markerEnd="url(#ap)" />

        {/* Donut chart — Creator 10% */}
        <path
          d={donutPath(DONUT.cx, DONUT.cy, DONUT.R, DONUT.r, 0, 0.10)}
          fill="#8B5CF6" opacity="0.75"
        />
        {/* Donut chart — Owner 50% */}
        <path
          d={donutPath(DONUT.cx, DONUT.cy, DONUT.R, DONUT.r, 0.10, 0.60)}
          fill="#A78BFA" opacity="0.75"
        />
        {/* Donut chart — Curator 20% */}
        <path
          d={donutPath(DONUT.cx, DONUT.cy, DONUT.R, DONUT.r, 0.60, 0.80)}
          fill="#22D3EE" opacity="0.75"
        />
        {/* Donut chart — Staker 20% */}
        <path
          d={donutPath(DONUT.cx, DONUT.cy, DONUT.R, DONUT.r, 0.80, 1.00)}
          fill="#34D399" opacity="0.75"
        />

        {/* Donut center labels */}
        <text x={DONUT.cx} y={DONUT.cy - 4}
          fill="#F0F0F8" fontSize="8.5" fontFamily="DM Sans, sans-serif"
          fontWeight="700" textAnchor="middle">ERC</text>
        <text x={DONUT.cx} y={DONUT.cy + 7}
          fill="#F0F0F8" fontSize="8.5" fontFamily="DM Sans, sans-serif"
          fontWeight="700" textAnchor="middle">8183</text>

        {/* Donut legend — inlined */}
        <g>
          <rect x={DONUT.cx + DONUT.R + 10} y={DONUT.cy - DONUT.R + 0}
            width="8" height="8" rx="2" fill="#8B5CF6" opacity="0.8" />
          <text x={DONUT.cx + DONUT.R + 22} y={DONUT.cy - DONUT.R + 7}
            fill="#8B5CF6" fontSize="10" fontFamily="DM Sans, sans-serif" fontWeight="600">Creator 10%</text>
        </g>
        <g>
          <rect x={DONUT.cx + DONUT.R + 10} y={DONUT.cy - DONUT.R + 22}
            width="8" height="8" rx="2" fill="#A78BFA" opacity="0.8" />
          <text x={DONUT.cx + DONUT.R + 22} y={DONUT.cy - DONUT.R + 29}
            fill="#A78BFA" fontSize="10" fontFamily="DM Sans, sans-serif" fontWeight="600">Owner 50%</text>
        </g>
        <g>
          <rect x={DONUT.cx + DONUT.R + 10} y={DONUT.cy - DONUT.R + 44}
            width="8" height="8" rx="2" fill="#22D3EE" opacity="0.8" />
          <text x={DONUT.cx + DONUT.R + 22} y={DONUT.cy - DONUT.R + 51}
            fill="#22D3EE" fontSize="10" fontFamily="DM Sans, sans-serif" fontWeight="600">Curator 20%</text>
        </g>
        <g>
          <rect x={DONUT.cx + DONUT.R + 10} y={DONUT.cy - DONUT.R + 66}
            width="8" height="8" rx="2" fill="#34D399" opacity="0.8" />
          <text x={DONUT.cx + DONUT.R + 22} y={DONUT.cy - DONUT.R + 73}
            fill="#34D399" fontSize="10" fontFamily="DM Sans, sans-serif" fontWeight="600">Staker 20%</text>
        </g>

        {/* Storage connector lines — inlined */}
        <line x1={129}  y1={536} x2={129}  y2={554}
          stroke="rgba(52,211,153,0.3)" strokeWidth="1" strokeDasharray="3 2" />
        <line x1={334}  y1={536} x2={334}  y2={554}
          stroke="rgba(52,211,153,0.3)" strokeWidth="1" strokeDasharray="3 2" />
        <line x1={539}  y1={536} x2={539}  y2={554}
          stroke="rgba(52,211,153,0.3)" strokeWidth="1" strokeDasharray="3 2" />
        <line x1={744}  y1={536} x2={744}  y2={554}
          stroke="rgba(52,211,153,0.3)" strokeWidth="1" strokeDasharray="3 2" />
        <line x1={949}  y1={536} x2={949}  y2={554}
          stroke="rgba(52,211,153,0.3)" strokeWidth="1" strokeDasharray="3 2" />
        <line x1={1153} y1={536} x2={1153} y2={554}
          stroke="rgba(52,211,153,0.3)" strokeWidth="1" strokeDasharray="3 2" />
      </svg>
      {/* MEMORY NODE */}
      <div style={{
        position: "absolute",
        top: "14.8vh",
        left: "28.6vw",
        width: "3.4vw",
        height: "3.4vw",
        borderRadius: "50%",
        background: "rgba(52,211,153,0.10)",
        border: "1.5px solid rgba(52,211,153,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.4vw",
        boxShadow: "0 0 1.2vw rgba(52,211,153,0.18)",
      }}>🧠</div>
      <div style={{
        position: "absolute", top: "21.8vh", left: "27vw", width: "6vw",
        textAlign: "center",
        fontFamily: "var(--font-display-family)", fontSize: "0.72vw",
        fontWeight: 700, color: "#34D399", letterSpacing: "0.08em",
      }}>MEMORY</div>
      {/* AGENT NODE */}
      <div style={{
        position: "absolute", top: "13.5vh", left: "47.5vw",
        width: "5vw", height: "5vw",
        borderRadius: "50%",
        background: "rgba(34,211,238,0.10)",
        border: "1.5px solid rgba(34,211,238,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "2vw",
        boxShadow: "0 0 2vw rgba(34,211,238,0.24)",
      }}>🤖</div>
      <div style={{
        position: "absolute", top: "22.6vh", left: "44vw", width: "12vw",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3vh",
      }}>
        <span style={{
          fontFamily: "var(--font-display-family)", fontSize: "0.88vw",
          fontWeight: 700, color: "#22D3EE", letterSpacing: "0.1em",
        }}>AI AGENT</span>
        <div style={{ display: "flex", gap: "0.3vw" }}>
          <span style={{
            fontFamily: "var(--font-body-family)", fontSize: "0.68vw", fontWeight: 700,
            color: "#22D3EE", background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.55)",
            borderRadius: "0.22vw", padding: "0.05vh 0.35vw", letterSpacing: "0.06em",
          }}>MCP</span>
          <span style={{
            fontFamily: "var(--font-body-family)", fontSize: "0.68vw", fontWeight: 700,
            color: "#FCD34D", background: "rgba(252,211,77,0.15)", border: "1px solid rgba(252,211,77,0.55)",
            borderRadius: "0.22vw", padding: "0.05vh 0.35vw", letterSpacing: "0.06em",
          }}>x402</span>
        </div>
      </div>
      {/* MCP SERVER BAR */}
      <div style={{
        position: "absolute", top: "32.9vh", left: "3.1vw", right: "3.1vw", height: "5.5vh",
        background: "rgba(34,211,238,0.07)",
        border: "1px solid rgba(34,211,238,0.28)",
        borderRadius: "0.7vw",
        display: "flex", alignItems: "center",
        paddingLeft: "1.5vw", paddingRight: "1.5vw",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7vw" }}>
          <span style={{
            fontFamily: "var(--font-body-family)", fontSize: "0.7vw", fontWeight: 700,
            color: "#22D3EE", background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.4)",
            borderRadius: "0.22vw", padding: "0.1vh 0.4vw", letterSpacing: "0.06em",
          }}>MCP</span>
          <span style={{
            fontFamily: "var(--font-display-family)", fontSize: "1.05vw",
            fontWeight: 700, color: "#22D3EE",
          }}>SkillFun MCP Server</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5vw" }}>
          <span style={{
            fontFamily: "var(--font-body-family)", fontSize: "0.7vw", fontWeight: 700,
            color: "#A78BFA", background: "rgba(167,139,250,0.10)",
            border: "1px solid rgba(167,139,250,0.3)",
            borderRadius: "0.22vw", padding: "0.1vh 0.4vw", letterSpacing: "0.06em",
          }}>ERC-8183</span>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.78vw", color: "rgba(167,139,250,0.7)" }}>
            auto-settle →
          </span>
        </div>
      </div>
      {/* BUNDLES — inlined, no .map() */}
      <div style={{
        position: "absolute", top: "45.1vh", left: "3.1vw", width: "29.2vw", height: "14.7vh",
        background: "rgba(180,160,255,0.07)",
        border: "1px solid rgba(180,160,255,0.22)",
        borderRadius: "0.65vw",
        padding: "1vh 1.1vw",
        display: "grid", gridTemplateRows: "auto 1fr auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5vw" }}>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.65vw", fontWeight: 700, color: "#B4A0FF", background: "rgba(180,160,255,0.12)", border: "1px solid rgba(180,160,255,0.3)", borderRadius: "0.22vw", padding: "0.05vh 0.35vw", letterSpacing: "0.07em" }}>BUNDLE</span>
          <span style={{ fontFamily: "var(--font-display-family)", fontSize: "0.95vw", fontWeight: 700, color: "#E2D9FF" }}>Bundle A</span>
        </div>
        <div style={{ fontFamily: "var(--font-body-family)", fontSize: "0.7vw", color: "rgba(180,160,255,0.45)", alignSelf: "center" }}>NLP · Vision · Search</div>
        <div style={{ display: "flex", gap: "0.4vw" }}>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.65vw", fontWeight: 600, color: "#B4A0FF", background: "#B4A0FF18", border: "1px solid #B4A0FF40", borderRadius: "0.22vw", padding: "0.05vh 0.35vw", letterSpacing: "0.05em" }}>Curator</span>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.65vw", fontWeight: 600, color: "#34D399", background: "#34D39918", border: "1px solid #34D39940", borderRadius: "0.22vw", padding: "0.05vh 0.35vw", letterSpacing: "0.05em" }}>Staker</span>
        </div>
      </div>
      <div style={{
        position: "absolute", top: "45.1vh", left: "35.4vw", width: "29.2vw", height: "14.7vh",
        background: "rgba(180,160,255,0.07)",
        border: "1px solid rgba(180,160,255,0.22)",
        borderRadius: "0.65vw",
        padding: "1vh 1.1vw",
        display: "grid", gridTemplateRows: "auto 1fr auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5vw" }}>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.65vw", fontWeight: 700, color: "#B4A0FF", background: "rgba(180,160,255,0.12)", border: "1px solid rgba(180,160,255,0.3)", borderRadius: "0.22vw", padding: "0.05vh 0.35vw", letterSpacing: "0.07em" }}>BUNDLE</span>
          <span style={{ fontFamily: "var(--font-display-family)", fontSize: "0.95vw", fontWeight: 700, color: "#E2D9FF" }}>Bundle B</span>
        </div>
        <div style={{ fontFamily: "var(--font-body-family)", fontSize: "0.7vw", color: "rgba(180,160,255,0.45)", alignSelf: "center" }}>Search · Reason · Plan</div>
        <div style={{ display: "flex", gap: "0.4vw" }}>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.65vw", fontWeight: 600, color: "#B4A0FF", background: "#B4A0FF18", border: "1px solid #B4A0FF40", borderRadius: "0.22vw", padding: "0.05vh 0.35vw", letterSpacing: "0.05em" }}>Curator</span>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.65vw", fontWeight: 600, color: "#34D399", background: "#34D39918", border: "1px solid #34D39940", borderRadius: "0.22vw", padding: "0.05vh 0.35vw", letterSpacing: "0.05em" }}>Staker</span>
        </div>
      </div>
      <div style={{
        position: "absolute", top: "45.1vh", left: "67.7vw", width: "29.2vw", height: "14.7vh",
        background: "rgba(180,160,255,0.07)",
        border: "1px solid rgba(180,160,255,0.22)",
        borderRadius: "0.65vw",
        padding: "1vh 1.1vw",
        display: "grid", gridTemplateRows: "auto 1fr auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5vw" }}>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.65vw", fontWeight: 700, color: "#B4A0FF", background: "rgba(180,160,255,0.12)", border: "1px solid rgba(180,160,255,0.3)", borderRadius: "0.22vw", padding: "0.05vh 0.35vw", letterSpacing: "0.07em" }}>BUNDLE</span>
          <span style={{ fontFamily: "var(--font-display-family)", fontSize: "0.95vw", fontWeight: 700, color: "#E2D9FF" }}>Bundle C</span>
        </div>
        <div style={{ fontFamily: "var(--font-body-family)", fontSize: "0.7vw", color: "rgba(180,160,255,0.45)", alignSelf: "center" }}>Reason · Plan · Draw</div>
        <div style={{ display: "flex", gap: "0.4vw" }}>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.65vw", fontWeight: 600, color: "#B4A0FF", background: "#B4A0FF18", border: "1px solid #B4A0FF40", borderRadius: "0.22vw", padding: "0.05vh 0.35vw", letterSpacing: "0.05em" }}>Curator</span>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.65vw", fontWeight: 600, color: "#34D399", background: "#34D39918", border: "1px solid #34D39940", borderRadius: "0.22vw", padding: "0.05vh 0.35vw", letterSpacing: "0.05em" }}>Staker</span>
        </div>
      </div>
      {/* NFT SECTION HEADER */}
      <div style={{
        position: "absolute", top: "61.5vh", left: "3.1vw",
        display: "flex", alignItems: "center", gap: "0.6vw",
      }}>
        <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.72vw", fontWeight: 700, color: "#8B5CF6", letterSpacing: "0.1em" }}>
          ◆ SKILL NFTs
        </span>
        <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.68vw", fontWeight: 700, color: "#8B5CF6", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "0.22vw", padding: "0.05vh 0.38vw", letterSpacing: "0.06em" }}>ERC-8239</span>
      </div>
      {/* NFT CARDS — inlined, no .map() */}
      <div style={{ position: "absolute", top: "66.9vh", left: "3.1vw", width: "14vw", height: "7.5vh", background: "rgba(139,92,246,0.12)", border: "1.5px solid rgba(139,92,246,0.38)", borderRadius: "0.5vw", padding: "0.6vh 0.8vw", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 0 0.8vw rgba(139,92,246,0.15)" }}>
        <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.6vw", fontWeight: 700, color: "#8B5CF6", opacity: 0.85, letterSpacing: "0.06em" }}>NFT</span>
        <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1vw", fontWeight: 800, color: "#C4B5FD" }}>NLP</div>
        <div style={{ display: "flex", gap: "0.3vw" }}>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.55vw", fontWeight: 600, color: "#9CA3AF", background: "#9CA3AF15", border: "1px solid #9CA3AF30", borderRadius: "0.18vw", padding: "0.02vh 0.28vw", letterSpacing: "0.04em" }}>Creator</span>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.55vw", fontWeight: 600, color: "#6B7280", background: "#6B728015", border: "1px solid #6B728030", borderRadius: "0.18vw", padding: "0.02vh 0.28vw", letterSpacing: "0.04em" }}>Owner</span>
        </div>
      </div>
      <div style={{ position: "absolute", top: "66.9vh", left: "19.1vw", width: "14vw", height: "7.5vh", background: "rgba(139,92,246,0.12)", border: "1.5px solid rgba(139,92,246,0.38)", borderRadius: "0.5vw", padding: "0.6vh 0.8vw", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 0 0.8vw rgba(139,92,246,0.15)" }}>
        <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.6vw", fontWeight: 700, color: "#8B5CF6", opacity: 0.85, letterSpacing: "0.06em" }}>NFT</span>
        <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1vw", fontWeight: 800, color: "#C4B5FD" }}>Vision</div>
        <div style={{ display: "flex", gap: "0.3vw" }}>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.55vw", fontWeight: 600, color: "#9CA3AF", background: "#9CA3AF15", border: "1px solid #9CA3AF30", borderRadius: "0.18vw", padding: "0.02vh 0.28vw", letterSpacing: "0.04em" }}>Creator</span>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.55vw", fontWeight: 600, color: "#6B7280", background: "#6B728015", border: "1px solid #6B728030", borderRadius: "0.18vw", padding: "0.02vh 0.28vw", letterSpacing: "0.04em" }}>Owner</span>
        </div>
      </div>
      <div style={{ position: "absolute", top: "66.9vh", left: "35.1vw", width: "14vw", height: "7.5vh", background: "rgba(139,92,246,0.12)", border: "1.5px solid rgba(139,92,246,0.38)", borderRadius: "0.5vw", padding: "0.6vh 0.8vw", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 0 0.8vw rgba(139,92,246,0.15)" }}>
        <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.6vw", fontWeight: 700, color: "#8B5CF6", opacity: 0.85, letterSpacing: "0.06em" }}>NFT</span>
        <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1vw", fontWeight: 800, color: "#C4B5FD" }}>Search</div>
        <div style={{ display: "flex", gap: "0.3vw" }}>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.55vw", fontWeight: 600, color: "#9CA3AF", background: "#9CA3AF15", border: "1px solid #9CA3AF30", borderRadius: "0.18vw", padding: "0.02vh 0.28vw", letterSpacing: "0.04em" }}>Creator</span>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.55vw", fontWeight: 600, color: "#6B7280", background: "#6B728015", border: "1px solid #6B728030", borderRadius: "0.18vw", padding: "0.02vh 0.28vw", letterSpacing: "0.04em" }}>Owner</span>
        </div>
      </div>
      <div style={{ position: "absolute", top: "66.9vh", left: "51.1vw", width: "14vw", height: "7.5vh", background: "rgba(139,92,246,0.12)", border: "1.5px solid rgba(139,92,246,0.38)", borderRadius: "0.5vw", padding: "0.6vh 0.8vw", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 0 0.8vw rgba(139,92,246,0.15)" }}>
        <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.6vw", fontWeight: 700, color: "#8B5CF6", opacity: 0.85, letterSpacing: "0.06em" }}>NFT</span>
        <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1vw", fontWeight: 800, color: "#C4B5FD" }}>Reason</div>
        <div style={{ display: "flex", gap: "0.3vw" }}>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.55vw", fontWeight: 600, color: "#9CA3AF", background: "#9CA3AF15", border: "1px solid #9CA3AF30", borderRadius: "0.18vw", padding: "0.02vh 0.28vw", letterSpacing: "0.04em" }}>Creator</span>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.55vw", fontWeight: 600, color: "#6B7280", background: "#6B728015", border: "1px solid #6B728030", borderRadius: "0.18vw", padding: "0.02vh 0.28vw", letterSpacing: "0.04em" }}>Owner</span>
        </div>
      </div>
      <div style={{ position: "absolute", top: "66.9vh", left: "67.1vw", width: "14vw", height: "7.5vh", background: "rgba(139,92,246,0.12)", border: "1.5px solid rgba(139,92,246,0.38)", borderRadius: "0.5vw", padding: "0.6vh 0.8vw", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 0 0.8vw rgba(139,92,246,0.15)" }}>
        <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.6vw", fontWeight: 700, color: "#8B5CF6", opacity: 0.85, letterSpacing: "0.06em" }}>NFT</span>
        <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1vw", fontWeight: 800, color: "#C4B5FD" }}>Plan</div>
        <div style={{ display: "flex", gap: "0.3vw" }}>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.55vw", fontWeight: 600, color: "#9CA3AF", background: "#9CA3AF15", border: "1px solid #9CA3AF30", borderRadius: "0.18vw", padding: "0.02vh 0.28vw", letterSpacing: "0.04em" }}>Creator</span>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.55vw", fontWeight: 600, color: "#6B7280", background: "#6B728015", border: "1px solid #6B728030", borderRadius: "0.18vw", padding: "0.02vh 0.28vw", letterSpacing: "0.04em" }}>Owner</span>
        </div>
      </div>
      <div style={{ position: "absolute", top: "66.9vh", left: "83.1vw", width: "14vw", height: "7.5vh", background: "rgba(139,92,246,0.12)", border: "1.5px solid rgba(139,92,246,0.38)", borderRadius: "0.5vw", padding: "0.6vh 0.8vw", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 0 0.8vw rgba(139,92,246,0.15)" }}>
        <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.6vw", fontWeight: 700, color: "#8B5CF6", opacity: 0.85, letterSpacing: "0.06em" }}>NFT</span>
        <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1vw", fontWeight: 800, color: "#C4B5FD" }}>Draw</div>
        <div style={{ display: "flex", gap: "0.3vw" }}>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.55vw", fontWeight: 600, color: "#9CA3AF", background: "#9CA3AF15", border: "1px solid #9CA3AF30", borderRadius: "0.18vw", padding: "0.02vh 0.28vw", letterSpacing: "0.04em" }}>Creator</span>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.55vw", fontWeight: 600, color: "#6B7280", background: "#6B728015", border: "1px solid #6B728030", borderRadius: "0.18vw", padding: "0.02vh 0.28vw", letterSpacing: "0.04em" }}>Owner</span>
        </div>
      </div>
      {/* STORAGE LAYER */}
      <div style={{
        position: "absolute", top: "77vh", left: "3.1vw", right: "3.1vw", height: "4.5vh",
        background: "rgba(52,211,153,0.06)",
        border: "1px solid rgba(52,211,153,0.25)",
        borderRadius: "0.7vw",
        display: "flex", alignItems: "center",
        paddingLeft: "1.4vw", paddingRight: "1.4vw",
        justifyContent: "space-between",
        gap: "1vw",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7vw" }}>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.68vw", fontWeight: 700, color: "#34D399", background: "rgba(52,211,153,0.14)", border: "1px solid rgba(52,211,153,0.38)", borderRadius: "0.22vw", padding: "0.08vh 0.4vw", letterSpacing: "0.07em" }}>
            ⛓ STORAGE
          </span>
          <span style={{ fontFamily: "var(--font-display-family)", fontSize: "0.88vw", fontWeight: 700, color: "#34D399" }}>
            Ethereum Mainnet · EIP-4844 Blob
          </span>
        </div>
        <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.75vw", color: "rgba(52,211,153,0.55)", lineHeight: 1.4 }}>
          Metadata stored on-chain via blob transactions — content hash anchored to each NFT token.
        </span>
        <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.68vw", fontWeight: 700, color: "#34D399", background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: "0.22vw", padding: "0.08vh 0.45vw", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
          ERC-8239 hash → blob tx
        </span>
      </div>
      {/* Page number */}
      <div style={{
        position: "absolute", bottom: "3.5vh", right: "3.5vw",
        fontFamily: "var(--font-display-family)",
        color: "#3D4160", fontSize: "1.5vw", fontWeight: 600,
      }}>
        14 / 14
      </div>
    </div>
  );
}
