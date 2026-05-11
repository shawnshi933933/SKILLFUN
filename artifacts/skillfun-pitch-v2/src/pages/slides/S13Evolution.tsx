export default function S13Evolution() {
  const base = import.meta.env.BASE_URL;
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 55% 50% at 50% 55%, rgba(139,92,246,0.09) 0%, transparent 65%)",
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div
        className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${base}bg-evolution.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.10
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          display: "grid",
          gridTemplateRows: "auto 1fr",
          paddingLeft: "7vw", paddingRight: "7vw",
          paddingTop: "4.5vh", paddingBottom: "5vh",
          gap: 0,
        }}
      >
        {/* Header */}
        <div>
          <span style={{ display: "block", fontFamily: "var(--font-body-family)", color: "#22D3EE", fontSize: "1.4vw", fontWeight: 400, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: "1vh" }}>
            Market Evolution
          </span>
          <h2 style={{ fontFamily: "var(--font-display-family)", fontSize: "4vw", fontWeight: 800, color: "#F0F0F8", letterSpacing: "-0.025em", lineHeight: 1.05, marginBottom: "3.5vh" }}>
            The market took<br />
            <span style={{ color: "#8B5CF6" }}>three generations to get here.</span>
          </h2>
        </div>

        {/* Cards row */}
        <div style={{ display: "flex", alignItems: "stretch", gap: "1.2vw", minHeight: 0 }}>

          {/* v1.0 — Skill Hub */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
            {/* Arrow connector */}
            <div style={{ position: "absolute", right: "-1.2vw", top: "50%", transform: "translateY(-50%)", zIndex: 10, display: "flex", alignItems: "center" }}>
              <div style={{ width: "0.8vw", height: "0.15vh", background: "rgba(240,240,248,0.15)" }} />
              <div style={{ width: 0, height: 0, borderTop: "0.6vh solid transparent", borderBottom: "0.6vh solid transparent", borderLeft: "0.7vw solid rgba(240,240,248,0.20)" }} />
            </div>
            <div style={{ height: "100%", boxSizing: "border-box", background: "rgba(75,82,128,0.08)", borderRadius: "1vw", padding: "2.2vh 2vw", border: "1px solid rgba(75,82,128,0.35)", display: "grid", gridTemplateRows: "1fr auto" }}>
              <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "1.6vh" }}>
                  <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.1vw", fontWeight: 800, color: "#4B5280", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(75,82,128,0.35)", borderRadius: "0.4vw", padding: "0.15vh 0.55vw", letterSpacing: "0.04em" }}>v1.0</div>
                  <div style={{ fontFamily: "var(--font-body-family)", fontSize: "0.9vw", color: "#7B8FCC", background: "rgba(75,82,128,0.18)", borderRadius: "0.3vw", padding: "0.1vh 0.5vw", border: "1px solid rgba(75,82,128,0.35)" }}>Static Directory</div>
                </div>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.9vw", fontWeight: 800, color: "#F0F0F8", lineHeight: 1.1, marginBottom: "1.8vh" }}>Skill Hub</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.9vh" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6vw" }}>
                    <div style={{ width: "0.35vw", height: "0.35vw", borderRadius: "50%", background: "#4B5280", marginTop: "0.8vh", flexShrink: 0 }} />
                    <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#9DA3C8", lineHeight: 1.45 }}>Hand-curated list</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6vw" }}>
                    <div style={{ width: "0.35vw", height: "0.35vw", borderRadius: "50%", background: "#4B5280", marginTop: "0.8vh", flexShrink: 0 }} />
                    <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#9DA3C8", lineHeight: 1.45 }}>No payment layer</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6vw" }}>
                    <div style={{ width: "0.35vw", height: "0.35vw", borderRadius: "50%", background: "#4B5280", marginTop: "0.8vh", flexShrink: 0 }} />
                    <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#9DA3C8", lineHeight: 1.45 }}>No usage tracking</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6vw" }}>
                    <div style={{ width: "0.35vw", height: "0.35vw", borderRadius: "50%", background: "#4B5280", marginTop: "0.8vh", flexShrink: 0 }} />
                    <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#9DA3C8", lineHeight: 1.45 }}>No business model</div>
                  </div>
                </div>
              </div>
              <div style={{ paddingTop: "1.4vh", marginTop: "1.8vh", borderTop: "1px solid rgba(75,82,128,0.35)" }}>
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.1vw", color: "#6B7280", fontWeight: 600, lineHeight: 1.4 }}>Discovery only — value trapped</div>
              </div>
            </div>
          </div>

          {/* v2.0 — MCP Market */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
            <div style={{ position: "absolute", right: "-1.2vw", top: "50%", transform: "translateY(-50%)", zIndex: 10, display: "flex", alignItems: "center" }}>
              <div style={{ width: "0.8vw", height: "0.15vh", background: "rgba(240,240,248,0.15)" }} />
              <div style={{ width: 0, height: 0, borderTop: "0.6vh solid transparent", borderBottom: "0.6vh solid transparent", borderLeft: "0.7vw solid rgba(240,240,248,0.20)" }} />
            </div>
            <div style={{ height: "100%", boxSizing: "border-box", background: "rgba(14,165,233,0.07)", borderRadius: "1vw", padding: "2.2vh 2vw", border: "1px solid rgba(14,165,233,0.30)", display: "grid", gridTemplateRows: "1fr auto" }}>
              <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "1.6vh" }}>
                  <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.1vw", fontWeight: 800, color: "#0EA5E9", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(14,165,233,0.30)", borderRadius: "0.4vw", padding: "0.15vh 0.55vw", letterSpacing: "0.04em" }}>v2.0</div>
                  <div style={{ fontFamily: "var(--font-body-family)", fontSize: "0.9vw", color: "#38BDF8", background: "rgba(14,165,233,0.12)", borderRadius: "0.3vw", padding: "0.1vh 0.5vw", border: "1px solid rgba(14,165,233,0.30)" }}>Web2 Platform</div>
                </div>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.9vw", fontWeight: 800, color: "#F0F0F8", lineHeight: 1.1, marginBottom: "1.8vh" }}>MCP Market</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.9vh" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6vw" }}>
                    <div style={{ width: "0.35vw", height: "0.35vw", borderRadius: "50%", background: "#0EA5E9", marginTop: "0.8vh", flexShrink: 0 }} />
                    <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#9DA3C8", lineHeight: 1.45 }}>Centralized registry</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6vw" }}>
                    <div style={{ width: "0.35vw", height: "0.35vw", borderRadius: "50%", background: "#0EA5E9", marginTop: "0.8vh", flexShrink: 0 }} />
                    <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#9DA3C8", lineHeight: 1.45 }}>Subscription billing</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6vw" }}>
                    <div style={{ width: "0.35vw", height: "0.35vw", borderRadius: "50%", background: "#0EA5E9", marginTop: "0.8vh", flexShrink: 0 }} />
                    <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#9DA3C8", lineHeight: 1.45 }}>Platform controls revenue</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6vw" }}>
                    <div style={{ width: "0.35vw", height: "0.35vw", borderRadius: "50%", background: "#0EA5E9", marginTop: "0.8vh", flexShrink: 0 }} />
                    <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#9DA3C8", lineHeight: 1.45 }}>Creators need middleman</div>
                  </div>
                </div>
              </div>
              <div style={{ paddingTop: "1.4vh", marginTop: "1.8vh", borderTop: "1px solid rgba(14,165,233,0.30)" }}>
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.1vw", color: "#38BDF8", fontWeight: 600, lineHeight: 1.4 }}>Monetized — but Web2 extraction</div>
              </div>
            </div>
          </div>

          {/* v3.0 — SkillFun */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
            <div style={{ height: "100%", boxSizing: "border-box", background: "rgba(139,92,246,0.10)", borderRadius: "1vw", padding: "2.2vh 2vw", border: "1px solid rgba(139,92,246,0.45)", display: "grid", gridTemplateRows: "1fr auto", boxShadow: "0 0 2.5vw rgba(139,92,246,0.18)" }}>
              <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "1.6vh" }}>
                  <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.1vw", fontWeight: 800, color: "#8B5CF6", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(139,92,246,0.45)", borderRadius: "0.4vw", padding: "0.15vh 0.55vw", letterSpacing: "0.04em" }}>v3.0</div>
                  <div style={{ fontFamily: "var(--font-body-family)", fontSize: "0.9vw", color: "#C4B5FD", background: "rgba(139,92,246,0.18)", borderRadius: "0.3vw", padding: "0.1vh 0.5vw", border: "1px solid rgba(139,92,246,0.45)" }}>Agent Native · Web3</div>
                </div>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.9vw", fontWeight: 800, color: "#F0F0F8", lineHeight: 1.1, marginBottom: "1.8vh" }}>SkillFun</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.9vh" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6vw" }}>
                    <div style={{ width: "0.35vw", height: "0.35vw", borderRadius: "50%", background: "#8B5CF6", marginTop: "0.8vh", flexShrink: 0 }} />
                    <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#9DA3C8", lineHeight: 1.45 }}>Skills as NFTs (ERC-8239)</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6vw" }}>
                    <div style={{ width: "0.35vw", height: "0.35vw", borderRadius: "50%", background: "#8B5CF6", marginTop: "0.8vh", flexShrink: 0 }} />
                    <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#9DA3C8", lineHeight: 1.45 }}>Pay-per-call via x402</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6vw" }}>
                    <div style={{ width: "0.35vw", height: "0.35vw", borderRadius: "50%", background: "#8B5CF6", marginTop: "0.8vh", flexShrink: 0 }} />
                    <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#9DA3C8", lineHeight: 1.45 }}>On-chain royalties enforced</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6vw" }}>
                    <div style={{ width: "0.35vw", height: "0.35vw", borderRadius: "50%", background: "#8B5CF6", marginTop: "0.8vh", flexShrink: 0 }} />
                    <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#9DA3C8", lineHeight: 1.45 }}>Agent-to-agent autonomous trade</div>
                  </div>
                </div>
              </div>
              <div style={{ paddingTop: "1.4vh", marginTop: "1.8vh", borderTop: "1px solid rgba(139,92,246,0.45)" }}>
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.1vw", color: "#A78BFA", fontWeight: 600, lineHeight: 1.4 }}>NFT assets — value flows to creators</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div
        className="absolute bottom-[3.5vh] right-[3.5vw]"
        style={{ fontFamily: "var(--font-display-family)", color: "#3D4160", fontSize: "1.5vw", fontWeight: 600 }}
      >
        04 / 14
      </div>
    </div>
  );
}
