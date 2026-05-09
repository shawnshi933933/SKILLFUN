export default function S14Architecture() {
  // ── coordinate constants (SVG viewBox 0 0 1280 720 / preserveAspectRatio none) ──
  const AGT  = { cx: 500, cy: 129, r: 32 };                   // Agent circle
  const MCP  = { x1: 40, x2: 960, top: 237, bot: 277 };      // MCP bar
  const BND  = [                                                // Bundles
    { cx: 180, top: 325, bot: 431 },
    { cx: 500, top: 325, bot: 431 },
    { cx: 820, top: 325, bot: 431 },
  ];
  const NFT  = [                                                // NFT cards (center-x)
    { name: "NLP",    cx: 100,  shared: true  },
    { name: "Vision", cx: 260,  shared: false },
    { name: "Search", cx: 420,  shared: false },
    { name: "Reason", cx: 580,  shared: false },
    { name: "Plan",   cx: 740,  shared: false },
    { name: "Draw",   cx: 900,  shared: false },
  ];
  const NFTY = 482;                    // NFT card top y
  const NFTH = 54;                     // NFT card height
  const REV  = { x: 986, top: 218 };  // Revenue panel left-x and top-y

  const roles = [
    { label: "Creator", pct: 40, color: "#8B5CF6" },
    { label: "Owner",   pct: 25, color: "#A78BFA" },
    { label: "Curator", pct: 20, color: "#22D3EE" },
    { label: "Staker",  pct: 15, color: "#34D399" },
  ];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 70% 55% at 40% 35%, rgba(139,92,246,0.07) 0%, transparent 65%)",
      }}
    >
      {/* Decorative */}
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div
        className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg,#8B5CF6,#22D3EE,transparent)" }}
      />

      {/* ── Header ── */}
      <div style={{ position: "absolute", top: "3vh", left: "6vw" }}>
        <span style={{
          fontFamily: "var(--font-body-family)", color: "#22D3EE",
          fontSize: "1.1vw", fontWeight: 400, letterSpacing: "0.24em", textTransform: "uppercase",
        }}>
          System Architecture
        </span>
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

      {/* ══════════ SVG CONNECTION LINES ══════════ */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        viewBox="0 0 1280 720"
        preserveAspectRatio="none"
      >
        <defs>
          <marker id="at" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polygon points="0,0 6,3 0,6" fill="#22D3EE" />
          </marker>
          <marker id="ap" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polygon points="0,0 6,3 0,6" fill="#A78BFA" />
          </marker>
          <marker id="aa" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polygon points="0,0 6,3 0,6" fill="#FCD34D" />
          </marker>
          <marker id="al" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polygon points="0,0 6,3 0,6" fill="#B4A0FF" />
          </marker>
          <filter id="glow-teal">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Agent ↓ MCP  (MCP invoke) */}
        <line x1={AGT.cx} y1={AGT.cy + AGT.r + 2} x2={AGT.cx} y2={MCP.top}
          stroke="#22D3EE" strokeWidth="1.6" strokeDasharray="4 2"
          markerEnd="url(#at)" />

        {/* MCP ↑ Agent  (ERC-8183 distribute back) */}
        <line x1={AGT.cx - 10} y1={MCP.top} x2={AGT.cx - 10} y2={AGT.cy + AGT.r + 2}
          stroke="rgba(167,139,250,0.6)" strokeWidth="1.1" strokeDasharray="3 3"
          markerEnd="url(#ap)" />

        {/* MCP ↓ each Bundle */}
        {BND.map((b) => (
          <line key={b.cx}
            x1={b.cx} y1={MCP.bot} x2={b.cx} y2={b.top}
            stroke="rgba(180,160,255,0.55)" strokeWidth="1.5" markerEnd="url(#al)" />
        ))}

        {/* Bundle A ↓ NLP & Vision */}
        <line x1={BND[0].cx} y1={BND[0].bot} x2={NFT[0].cx} y2={NFTY}
          stroke="rgba(139,92,246,0.45)" strokeWidth="1.2" markerEnd="url(#ap)" />
        <line x1={BND[0].cx} y1={BND[0].bot} x2={NFT[1].cx} y2={NFTY}
          stroke="rgba(139,92,246,0.45)" strokeWidth="1.2" markerEnd="url(#ap)" />

        {/* Bundle B ↓ Search & Reason */}
        <line x1={BND[1].cx} y1={BND[1].bot} x2={NFT[2].cx} y2={NFTY}
          stroke="rgba(139,92,246,0.45)" strokeWidth="1.2" markerEnd="url(#ap)" />
        <line x1={BND[1].cx} y1={BND[1].bot} x2={NFT[3].cx} y2={NFTY}
          stroke="rgba(139,92,246,0.45)" strokeWidth="1.2" markerEnd="url(#ap)" />

        {/* Bundle C ↓ Plan & Draw */}
        <line x1={BND[2].cx} y1={BND[2].bot} x2={NFT[4].cx} y2={NFTY}
          stroke="rgba(139,92,246,0.45)" strokeWidth="1.2" markerEnd="url(#ap)" />
        <line x1={BND[2].cx} y1={BND[2].bot} x2={NFT[5].cx} y2={NFTY}
          stroke="rgba(139,92,246,0.45)" strokeWidth="1.2" markerEnd="url(#ap)" />

        {/* ── SHARED: Bundle B also references NLP (teal bezier curve) ── */}
        <path
          d={`M ${BND[1].cx} ${BND[1].bot} Q 280 470 ${NFT[0].cx + 10} ${NFTY + 10}`}
          fill="none" stroke="#22D3EE" strokeWidth="1.6" strokeDasharray="5 3"
          markerEnd="url(#at)"
          filter="url(#glow-teal)"
        />
        {/* "shared" label near mid-curve */}
        <text x="285" y="452" fill="#22D3EE" fontSize="10.5" fontFamily="DM Sans, sans-serif"
          fontWeight="700" textAnchor="middle" opacity="0.85">
          1 NFT · 2 Bundles
        </text>
        <rect x="215" y="438" width="140" height="16" rx="3"
          fill="rgba(34,211,238,0.08)" stroke="rgba(34,211,238,0.3)" strokeWidth="0.7" />

        {/* ── x402 pay: Agent → Revenue Panel (amber curve) ── */}
        <path
          d={`M ${AGT.cx + AGT.r} ${AGT.cy} C ${REV.x} ${AGT.cy}, ${REV.x} 260, ${REV.x} 265`}
          fill="none" stroke="#FCD34D" strokeWidth="1.4" strokeDasharray="5 2"
          markerEnd="url(#aa)" />

        {/* ── ERC-8183: MCP → Revenue Panel (purple arrow) ── */}
        <line x1={MCP.x2} y1={MCP.top + (MCP.bot - MCP.top) / 2}
              x2={REV.x - 2} y2={MCP.top + (MCP.bot - MCP.top) / 2}
          stroke="#A78BFA" strokeWidth="1.5" markerEnd="url(#ap)" />

        {/* Revenue panel separator lines inside */}
        {roles.map((r, i) => {
          const rowTop = REV.top + 72 + i * 60;
          const barW   = (r.pct / 100) * 170;
          return (
            <g key={r.label}>
              <rect x={REV.x + 16} y={rowTop + 22} width={barW} height="6" rx="3" fill={r.color} opacity="0.55" />
            </g>
          );
        })}

        {/* ── Closed loop: Agent left → arc left → NLP ── */}
        <path
          d={`M ${AGT.cx - AGT.r} ${AGT.cy} C 10 ${AGT.cy}, 10 ${NFTY + NFTH / 2}, ${NFT[0].cx - 60} ${NFTY + NFTH / 2}`}
          fill="none" stroke="rgba(167,139,250,0.38)" strokeWidth="1.3"
          strokeDasharray="6 3" markerEnd="url(#ap)" />
      </svg>

      {/* ════════════ AGENT ════════════ */}
      <div style={{
        position: "absolute", top: "13.5vh", left: "36.5vw",
        width: "5vw", height: "5vw",
        borderRadius: "50%",
        background: "rgba(34,211,238,0.10)",
        border: "1.5px solid rgba(34,211,238,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "2vw",
        boxShadow: "0 0 2vw rgba(34,211,238,0.24)",
      }}>🤖</div>
      <div style={{
        position: "absolute", top: "22.6vh", left: "33vw", width: "12vw",
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

      {/* Closed-loop label (left side) */}
      <div style={{
        position: "absolute", top: "40vh", left: "0.5vw",
        writingMode: "vertical-rl", transform: "rotate(180deg)",
        fontFamily: "var(--font-body-family)", fontSize: "0.65vw",
        color: "rgba(167,139,250,0.55)", letterSpacing: "0.08em", fontWeight: 600,
      }}>
        ↺ Agent learns → Mints new Skill NFT
      </div>

      {/* ════════════ MCP SERVER BAR ════════════ */}
      <div style={{
        position: "absolute", top: "32.9vh", left: "3.1vw", right: "25vw", height: "5.5vh",
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

      {/* ════════════ BUNDLES ════════════ */}
      {[
        { name: "Bundle A", left: "3.1vw",  skills: "NLP · Vision" },
        { name: "Bundle B", left: "28.1vw", skills: "NLP · Search · Reason" },
        { name: "Bundle C", left: "53.1vw", skills: "Plan · Draw" },
      ].map((b) => (
        <div key={b.name} style={{
          position: "absolute", top: "45.1vh", left: b.left, width: "21.9vw", height: "14.7vh",
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
            fontFamily: "var(--font-body-family)", fontSize: "0.72vw",
            color: "rgba(180,160,255,0.5)", alignSelf: "center",
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

      {/* ════════════ NFT SECTION HEADER ════════════ */}
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

      {/* ════════════ NFT CARDS ════════════ */}
      {NFT.map((nft, i) => {
        const leftVw = 3.1 + i * (9.4 + 3.125);   // each card 9.4vw wide, gap ~3.1vw
        const isShared = nft.shared;
        return (
          <div key={nft.name} style={{
            position: "absolute",
            top: "66.9vh",
            left: `${leftVw}vw`,
            width: "9.4vw",
            height: "7.5vh",
            background: isShared
              ? "linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(139,92,246,0.14) 100%)"
              : "rgba(139,92,246,0.12)",
            border: `1.5px solid ${isShared ? "rgba(34,211,238,0.5)" : "rgba(139,92,246,0.38)"}`,
            borderRadius: "0.5vw",
            padding: "0.6vh 0.7vw",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            boxShadow: isShared
              ? "0 0 1.2vw rgba(34,211,238,0.18)"
              : "0 0 0.8vw rgba(139,92,246,0.15)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{
                fontFamily: "var(--font-body-family)", fontSize: "0.6vw", fontWeight: 700,
                color: isShared ? "#22D3EE" : "#8B5CF6",
                opacity: 0.85, letterSpacing: "0.06em",
              }}>NFT</span>
              {isShared && (
                <span style={{
                  fontFamily: "var(--font-body-family)", fontSize: "0.55vw", fontWeight: 700,
                  color: "#22D3EE", background: "rgba(34,211,238,0.12)",
                  border: "1px solid rgba(34,211,238,0.35)",
                  borderRadius: "0.2vw", padding: "0.02vh 0.25vw",
                }}>SHARED</span>
              )}
            </div>
            <div style={{
              fontFamily: "var(--font-display-family)", fontSize: "0.95vw",
              fontWeight: 800,
              color: isShared ? "#7EECEA" : "#C4B5FD",
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

      {/* ════════════ REVENUE PANEL (right) ════════════ */}
      <div style={{
        position: "absolute", top: "30.3vh", left: "77vw", right: "2vw",
        bottom: "10.5vh",
        background: "rgba(15,12,28,0.9)",
        border: "1px solid rgba(139,92,246,0.28)",
        borderRadius: "0.8vw",
        padding: "1.2vh 1.2vw",
        display: "flex", flexDirection: "column", gap: "0.6vh",
      }}>
        {/* Panel title */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5vw", marginBottom: "0.3vh" }}>
          <span style={{
            fontFamily: "var(--font-display-family)", fontSize: "0.9vw",
            fontWeight: 800, color: "#F0F0F8",
          }}>Revenue Split</span>
        </div>

        {/* x402 input indicator */}
        <div style={{
          background: "rgba(252,211,77,0.07)",
          border: "1px solid rgba(252,211,77,0.25)",
          borderRadius: "0.45vw",
          padding: "0.5vh 0.7vw",
          marginBottom: "0.4vh",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4vw" }}>
            <span style={{
              fontFamily: "var(--font-body-family)", fontSize: "0.65vw", fontWeight: 700,
              color: "#FCD34D", background: "rgba(252,211,77,0.15)",
              border: "1px solid rgba(252,211,77,0.35)",
              borderRadius: "0.2vw", padding: "0.02vh 0.3vw",
            }}>x402</span>
            <span style={{
              fontFamily: "var(--font-body-family)", fontSize: "0.68vw",
              color: "rgba(252,211,77,0.8)",
            }}>Agent pays per call</span>
          </div>
        </div>

        {/* ERC-8183 auto-settle badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.4vw",
          paddingBottom: "0.6vh",
          borderBottom: "1px solid rgba(139,92,246,0.15)",
          marginBottom: "0.3vh",
        }}>
          <span style={{
            fontFamily: "var(--font-body-family)", fontSize: "0.62vw", fontWeight: 700,
            color: "#A78BFA", background: "rgba(167,139,250,0.10)",
            border: "1px solid rgba(167,139,250,0.3)",
            borderRadius: "0.2vw", padding: "0.02vh 0.3vw",
          }}>ERC-8183</span>
          <span style={{
            fontFamily: "var(--font-body-family)", fontSize: "0.65vw",
            color: "rgba(167,139,250,0.7)",
          }}>auto-settle on-chain</span>
        </div>

        {/* Role rows */}
        {roles.map((r) => (
          <div key={r.label} style={{ display: "flex", flexDirection: "column", gap: "0.2vh" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{
                fontFamily: "var(--font-display-family)", fontSize: "0.78vw",
                fontWeight: 700, color: r.color,
              }}>{r.label}</span>
              <span style={{
                fontFamily: "var(--font-body-family)", fontSize: "0.75vw",
                fontWeight: 700, color: r.color,
              }}>{r.pct}%</span>
            </div>
            <div style={{
              height: "0.55vh", background: "rgba(255,255,255,0.05)",
              borderRadius: "0.3vw", overflow: "hidden",
            }}>
              <div style={{
                height: "100%", width: `${r.pct / 40 * 100}%`,
                background: r.color, opacity: 0.65, borderRadius: "0.3vw",
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Page number */}
      <div
        style={{
          position: "absolute", bottom: "3.5vh", right: "3.5vw",
          fontFamily: "var(--font-display-family)",
          color: "#3D4160", fontSize: "1.5vw", fontWeight: 600,
        }}
      >
        16 / 16
      </div>
    </div>
  );
}
