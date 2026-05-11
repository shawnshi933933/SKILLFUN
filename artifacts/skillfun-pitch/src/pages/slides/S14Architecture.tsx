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
  // ── SVG coordinate constants (viewBox 0 0 1280 720, preserveAspectRatio none) ──
  const AGT = { cx: 640, cy: 129, r: 32 };         // Agent circle (centered over MCP bar)
  const MEM = { cx: 390, cy: 129 };                 // Memory node (left of Agent)
  const MCP = { top: 237, bot: 277 };               // MCP bar y range
  const BND = [                                      // Bundle center-x, top, bot
    { cx: 227,  top: 325, bot: 431 },
    { cx: 640,  top: 325, bot: 431 },
    { cx: 1053, top: 325, bot: 431 },
  ];
  const NFT = [                                      // NFT card center-x (full-width 6 cards)
    { name: "NLP",    cx: 129  },
    { name: "Vision", cx: 334  },
    { name: "Search", cx: 539  },
    { name: "Reason", cx: 744  },
    { name: "Plan",   cx: 949  },
    { name: "Draw",   cx: 1153 },
  ];
  const NFTY = 482;   // NFT card top-y in SVG

  // ── Revenue split (donut) ──
  const DONUT = { cx: 870, cy: 170, R: 40, r: 24 };
  const roles = [
    { label: "Creator", pct: 10, color: "#8B5CF6", s: 0,    e: 0.10 },
    { label: "Owner",   pct: 50, color: "#A78BFA", s: 0.10, e: 0.60 },
    { label: "Curator", pct: 20, color: "#22D3EE", s: 0.60, e: 0.80 },
    { label: "Staker",  pct: 20, color: "#34D399", s: 0.80, e: 1.00 },
  ];

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
      {/* ── Header ── */}
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
          <span style={{ color: "#22D3EE" }}>Three protocols.</span>{" "}
          <span style={{ color: "#8B5CF6" }}>One market.</span>
        </span>
      </div>
      {/* ══════════ SVG ══════════ */}
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

        {/* ── Memory ← Agent (short horizontal line, right-to-left) ── */}
        <line
          x1={AGT.cx - AGT.r} y1={AGT.cy}
          x2={MEM.cx + 22} y2={MEM.cy}
          stroke="rgba(52,211,153,0.7)" strokeWidth="1.3" strokeDasharray="4 2"
          markerEnd="url(#amem)"
        />

        {/* ── Memory → NFT layer (left outer edge, avoids all boxes) ── */}
        <path
          d={`M ${MEM.cx} ${MEM.cy + 22} C 10 ${MEM.cy + 22}, 10 509, 80 509`}
          fill="none" stroke="rgba(52,211,153,0.55)" strokeWidth="1.3"
          strokeDasharray="5 3" markerEnd="url(#amem)"
        />

        {/* ── Agent ↓ MCP (MCP invoke, teal dashed) ── */}
        <line
          x1={AGT.cx} y1={AGT.cy + AGT.r + 2} x2={AGT.cx} y2={MCP.top}
          stroke="#22D3EE" strokeWidth="1.6" strokeDasharray="4 2"
          markerEnd="url(#at)"
        />

        {/* ── MCP ↑ Agent (ERC-8183 distribute, purple dashed) ── */}
        <line
          x1={AGT.cx - 10} y1={MCP.top} x2={AGT.cx - 10} y2={AGT.cy + AGT.r + 2}
          stroke="rgba(167,139,250,0.55)" strokeWidth="1.1" strokeDasharray="3 3"
          markerEnd="url(#ap)"
        />

        {/* ── x402 pay: Agent right → Donut ── */}
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

        {/* ── MCP ↓ each Bundle ── */}
        {BND.map((b) => (
          <line key={b.cx}
            x1={b.cx} y1={MCP.bot} x2={b.cx} y2={b.top}
            stroke="rgba(180,160,255,0.55)" strokeWidth="1.5" markerEnd="url(#al)"
          />
        ))}

        {/* ── Primary Bundle → NFT connections ── */}
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

        {/* ── Cross-bundle connections (same style as primary) ── */}
        {/* Bundle A → Search */}
        <line x1={BND[0].cx} y1={BND[0].bot} x2={NFT[2].cx} y2={NFTY}
          stroke="rgba(139,92,246,0.45)" strokeWidth="1.2" markerEnd="url(#ap)" />
        {/* Bundle C → Reason */}
        <line x1={BND[2].cx} y1={BND[2].bot} x2={NFT[3].cx} y2={NFTY}
          stroke="rgba(139,92,246,0.45)" strokeWidth="1.2" markerEnd="url(#ap)" />
        {/* Bundle B → Plan */}
        <line x1={BND[1].cx} y1={BND[1].bot} x2={NFT[4].cx} y2={NFTY}
          stroke="rgba(139,92,246,0.45)" strokeWidth="1.2" markerEnd="url(#ap)" />

        {/* ── Donut chart (Revenue Split) ── */}
        {roles.map((r) => (
          <path key={r.label}
            d={donutPath(DONUT.cx, DONUT.cy, DONUT.R, DONUT.r, r.s, r.e)}
            fill={r.color} opacity="0.75"
          />
        ))}
        {/* Donut center label */}
        <text x={DONUT.cx} y={DONUT.cy - 4}
          fill="#F0F0F8" fontSize="8.5" fontFamily="DM Sans, sans-serif"
          fontWeight="700" textAnchor="middle">ERC</text>
        <text x={DONUT.cx} y={DONUT.cy + 7}
          fill="#F0F0F8" fontSize="8.5" fontFamily="DM Sans, sans-serif"
          fontWeight="700" textAnchor="middle">8183</text>
        {/* Donut legend */}
        {roles.map((r, i) => (
          <g key={r.label}>
            <rect x={DONUT.cx + DONUT.R + 10} y={DONUT.cy - DONUT.R + i * 22}
              width="8" height="8" rx="2" fill={r.color} opacity="0.8" />
            <text
              x={DONUT.cx + DONUT.R + 22}
              y={DONUT.cy - DONUT.R + i * 22 + 7}
              fill={r.color} fontSize="10" fontFamily="DM Sans, sans-serif" fontWeight="600"
            >
              {r.label} {r.pct}%
            </text>
          </g>
        ))}
      </svg>
      {/* ════════ MEMORY NODE ════════ */}
      <div style={{
        position: "absolute",
        top: "14.8vh",        /* aligns cy with Agent cy=129 */
        left: "28.6vw",      /* cx=390 → left=(390-22)/1280*100 */
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
      {/* ════════ AGENT ════════ */}
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
          {[["MCP","#22D3EE","rgba(34,211,238,0.15)"],
            ["x402","#FCD34D","rgba(252,211,77,0.15)"]].map(([t,c,bg]) => (
            <span key={t} style={{
              fontFamily: "var(--font-body-family)", fontSize: "0.68vw", fontWeight: 700,
              color: c, background: bg, border: `1px solid ${c}55`,
              borderRadius: "0.22vw", padding: "0.05vh 0.35vw", letterSpacing: "0.06em",
            }}>{t}</span>
          ))}
        </div>
      </div>
      {/* ════════ MCP SERVER BAR (full width) ════════ */}
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
      {/* ════════ BUNDLES (full width, 3 equal) ════════ */}
      {[
        { name: "Bundle A", left: "3.1vw",  skills: "NLP · Vision · Search" },
        { name: "Bundle B", left: "35.4vw", skills: "Search · Reason · Plan" },
        { name: "Bundle C", left: "67.7vw", skills: "Reason · Plan · Draw"   },
      ].map((b) => (
        <div key={b.name} style={{
          position: "absolute", top: "45.1vh", left: b.left, width: "29.2vw", height: "14.7vh",
          background: "rgba(180,160,255,0.07)",
          border: "1px solid rgba(180,160,255,0.22)",
          borderRadius: "0.65vw",
          padding: "1vh 1.1vw",
          display: "grid", gridTemplateRows: "auto 1fr auto",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{
              fontFamily: "var(--font-body-family)", fontSize: "0.65vw", fontWeight: 700,
              color: "#B4A0FF", background: "rgba(180,160,255,0.12)",
              border: "1px solid rgba(180,160,255,0.3)",
              borderRadius: "0.22vw", padding: "0.05vh 0.35vw", letterSpacing: "0.07em",
            }}>BUNDLE</span>
            <span style={{
              fontFamily: "var(--font-display-family)", fontSize: "0.95vw",
              fontWeight: 700, color: "#E2D9FF",
            }}>{b.name}</span>
          </div>
          <div style={{
            fontFamily: "var(--font-body-family)", fontSize: "0.7vw",
            color: "rgba(180,160,255,0.45)", alignSelf: "center",
          }}>{b.skills}</div>
          <div style={{ display: "flex", gap: "0.4vw" }}>
            {[["Curator","#B4A0FF"],["Staker","#34D399"]].map(([r,c]) => (
              <span key={r} style={{
                fontFamily: "var(--font-body-family)", fontSize: "0.65vw", fontWeight: 600,
                color: c, background: `${c}18`, border: `1px solid ${c}40`,
                borderRadius: "0.22vw", padding: "0.05vh 0.35vw", letterSpacing: "0.05em",
              }}>{r}</span>
            ))}
          </div>
        </div>
      ))}
      {/* ════════ NFT SECTION HEADER ════════ */}
      <div style={{
        position: "absolute", top: "61.5vh", left: "3.1vw",
        display: "flex", alignItems: "center", gap: "0.6vw",
      }}>
        <span style={{
          fontFamily: "var(--font-body-family)", fontSize: "0.72vw", fontWeight: 700,
          color: "#8B5CF6", letterSpacing: "0.1em",
        }}>◆ SKILL NFTs</span>
        <span style={{
          fontFamily: "var(--font-body-family)", fontSize: "0.68vw", fontWeight: 700,
          color: "#8B5CF6", background: "rgba(139,92,246,0.12)",
          border: "1px solid rgba(139,92,246,0.3)",
          borderRadius: "0.22vw", padding: "0.05vh 0.38vw", letterSpacing: "0.06em",
        }}>ERC-8239</span>
      </div>
      {/* ════════ NFT CARDS (full width, 6 equal) ════════ */}
      {NFT.map((nft, i) => {
        const leftVw = 3.1 + i * (14 + 2); // 14vw card + 2vw gap
        return (
          <div key={nft.name} style={{
            position: "absolute",
            top: "66.9vh",
            left: `${leftVw}vw`,
            width: "14vw",
            height: "7.5vh",
            background: "rgba(139,92,246,0.12)",
            border: "1.5px solid rgba(139,92,246,0.38)",
            borderRadius: "0.5vw",
            padding: "0.6vh 0.8vw",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            boxShadow: "0 0 0.8vw rgba(139,92,246,0.15)",
          }}>
            <span style={{
              fontFamily: "var(--font-body-family)", fontSize: "0.6vw", fontWeight: 700,
              color: "#8B5CF6", opacity: 0.85, letterSpacing: "0.06em",
            }}>NFT</span>
            <div style={{
              fontFamily: "var(--font-display-family)", fontSize: "1vw",
              fontWeight: 800, color: "#C4B5FD",
            }}>{nft.name}</div>
            <div style={{ display: "flex", gap: "0.3vw" }}>
              {[["Creator","#9CA3AF"],["Owner","#6B7280"]].map(([r,c]) => (
                <span key={r} style={{
                  fontFamily: "var(--font-body-family)", fontSize: "0.55vw", fontWeight: 600,
                  color: c, background: `${c}15`, border: `1px solid ${c}30`,
                  borderRadius: "0.18vw", padding: "0.02vh 0.28vw", letterSpacing: "0.04em",
                }}>{r}</span>
              ))}
            </div>
          </div>
        );
      })}
      {/* ════════ STORAGE LAYER ════════ */}
      {/* SVG connector lines: NFT cards → storage bar */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        viewBox="0 0 1280 720" preserveAspectRatio="none">
        {[129, 334, 539, 744, 949, 1153].map((cx) => (
          <line key={cx} x1={cx} y1={536} x2={cx} y2={554}
            stroke="rgba(52,211,153,0.3)" strokeWidth="1" strokeDasharray="3 2" />
        ))}
      </svg>
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
          <span style={{
            fontFamily: "var(--font-body-family)", fontSize: "0.68vw", fontWeight: 700,
            color: "#34D399", background: "rgba(52,211,153,0.14)",
            border: "1px solid rgba(52,211,153,0.38)",
            borderRadius: "0.22vw", padding: "0.08vh 0.4vw", letterSpacing: "0.07em",
          }}>⛓ STORAGE</span>
          <span style={{
            fontFamily: "var(--font-display-family)", fontSize: "0.88vw",
            fontWeight: 700, color: "#34D399",
          }}>Ethereum Mainnet · EIP-4844 Blob</span>
        </div>
        <span style={{
          fontFamily: "var(--font-body-family)", fontSize: "0.75vw",
          color: "rgba(52,211,153,0.55)", lineHeight: 1.4,
        }}>Metadata stored on-chain via blob transactions — content hash anchored to each NFT token. </span>
        <span style={{
          fontFamily: "var(--font-body-family)", fontSize: "0.68vw", fontWeight: 700,
          color: "#34D399", background: "rgba(52,211,153,0.10)",
          border: "1px solid rgba(52,211,153,0.3)",
          borderRadius: "0.22vw", padding: "0.08vh 0.45vw", letterSpacing: "0.06em",
          whiteSpace: "nowrap",
        }}>ERC-8239 hash → blob tx</span>
      </div>
      {/* Page number */}
      <div style={{
        position: "absolute", bottom: "3.5vh", right: "3.5vw",
        fontFamily: "var(--font-display-family)",
        color: "#3D4160", fontSize: "1.5vw", fontWeight: 600,
      }}>
        15 / 15
      </div>
    </div>
  );
}
