export default function S13Evolution() {
  const versions = [
    {
      ver: "1.0",
      name: "Skill Hub",
      example: "skills.sh",
      color: "#4B5280",
      border: "rgba(75,82,128,0.35)",
      bg: "rgba(75,82,128,0.08)",
      tag: "Static Directory",
      tagBg: "rgba(75,82,128,0.18)",
      tagColor: "#7B8FCC",
      features: [
        "Hand-curated list of skills",
        "No payment layer",
        "No usage tracking",
        "No business model",
      ],
      verdict: "Discovery only — value trapped",
      verdictColor: "#6B7280",
      icon: "📁",
    },
    {
      ver: "2.0",
      name: "MCP Market",
      example: "mcpmarket.com",
      color: "#0EA5E9",
      border: "rgba(14,165,233,0.30)",
      bg: "rgba(14,165,233,0.07)",
      tag: "Web2 Platform",
      tagBg: "rgba(14,165,233,0.12)",
      tagColor: "#38BDF8",
      features: [
        "Centralized registry",
        "Subscription billing",
        "Platform controls revenue",
        "Creators depend on middleman",
      ],
      verdict: "Monetized — but Web2 extraction",
      verdictColor: "#38BDF8",
      icon: "🏪",
    },
    {
      ver: "3.0",
      name: "SkillFun",
      example: "skillfun.xyz",
      color: "#8B5CF6",
      border: "rgba(139,92,246,0.45)",
      bg: "rgba(139,92,246,0.10)",
      tag: "Agent Native · Web3",
      tagBg: "rgba(139,92,246,0.18)",
      tagColor: "#C4B5FD",
      features: [
        "Skills as NFTs (ERC-8239)",
        "Pay-per-call via x402",
        "On-chain royalties enforced",
        "Agent ↔ Agent autonomous trade",
      ],
      verdict: "Programmable assets — value flows to creators",
      verdictColor: "#A78BFA",
      icon: "⚡",
      highlight: true,
    },
  ];

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
          display: "grid",
          gridTemplateRows: "auto 1fr",
          paddingLeft: "7vw", paddingRight: "7vw",
          paddingTop: "4.5vh", paddingBottom: "5vh",
          gap: 0,
        }}
      >
        {/* Header block — auto height */}
        <div>
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-body-family)",
              color: "#22D3EE",
              fontSize: "1.4vw",
              fontWeight: 400,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              marginBottom: "1vh",
            }}
          >
            Market Evolution
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display-family)",
              fontSize: "4vw",
              fontWeight: 800,
              color: "#F0F0F8",
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
              marginBottom: "3.5vh",
            }}
          >
            The market took<br />
            <span style={{ color: "#8B5CF6" }}>three generations to get here.</span>
          </h2>
        </div>

        {/* Cards row — fills exactly the remaining grid row (1fr = measured height) */}
        <div style={{ display: "flex", alignItems: "stretch", gap: "1.2vw", minHeight: 0 }}>
          {versions.map((v, i) => (
            <div key={v.ver} style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
              {/* Arrow connector */}
              {i < versions.length - 1 && (
                <div style={{
                  position: "absolute", right: "-1.2vw", top: "50%", transform: "translateY(-50%)",
                  zIndex: 10, display: "flex", alignItems: "center",
                }}>
                  <div style={{ width: "0.8vw", height: "0.15vh", background: "rgba(240,240,248,0.15)" }} />
                  <div style={{
                    width: 0, height: 0,
                    borderTop: "0.6vh solid transparent",
                    borderBottom: "0.6vh solid transparent",
                    borderLeft: "0.7vw solid rgba(240,240,248,0.20)",
                  }} />
                </div>
              )}

              <div
                style={{
                  height: "100%",
                  boxSizing: "border-box",
                  background: v.bg,
                  borderRadius: "1vw",
                  padding: "2.2vh 2vw",
                  border: `1px solid ${v.border}`,
                  display: "grid",
                  gridTemplateRows: "1fr auto",
                  boxShadow: v.highlight ? `0 0 2.5vw rgba(139,92,246,0.18)` : "none",
                }}
              >
                {/* Top content — stretches to fill remaining card height */}
                <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
                  {/* Ver badge + tag */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "1.6vh" }}>
                    <div style={{
                      fontFamily: "var(--font-display-family)",
                      fontSize: "1.1vw", fontWeight: 800,
                      color: v.color,
                      background: `rgba(0,0,0,0.3)`,
                      border: `1px solid ${v.border}`,
                      borderRadius: "0.4vw",
                      padding: "0.15vh 0.55vw",
                      letterSpacing: "0.04em",
                    }}>
                      v{v.ver}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-body-family)",
                      fontSize: "0.9vw", color: v.tagColor,
                      background: v.tagBg,
                      borderRadius: "0.3vw",
                      padding: "0.1vh 0.5vw",
                      border: `1px solid ${v.border}`,
                    }}>
                      {v.tag}
                    </div>
                  </div>

                  {/* Name */}
                  <div style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "1.9vw", fontWeight: 800,
                    color: "#F0F0F8", lineHeight: 1.1,
                    marginBottom: "0.4vh",
                    whiteSpace: "nowrap",
                  }}>
                    {v.icon} {v.name}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "0.95vw", color: "#5A6080",
                    marginBottom: "1.8vh",
                  }}>
                    e.g. {v.example}
                  </div>

                  {/* Features */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.9vh" }}>
                    {v.features.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.6vw" }}>
                        <div style={{
                          width: "0.35vw", height: "0.35vw", borderRadius: "50%",
                          background: v.color, marginTop: "0.8vh", flexShrink: 0,
                        }} />
                        <div style={{
                          fontFamily: "var(--font-body-family)",
                          fontSize: "1.25vw", color: "#9DA3C8", lineHeight: 1.45,
                        }}>
                          {f}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verdict — always anchored to bottom of card */}
                <div style={{ paddingTop: "1.4vh", marginTop: "1.8vh", borderTop: `1px solid ${v.border}` }}>
                  <div style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.1vw", color: v.verdictColor,
                    fontWeight: 600, lineHeight: 1.4,
                  }}>
                    {v.verdict}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-[3.5vh] right-[3.5vw]"
        style={{ fontFamily: "var(--font-display-family)", color: "#3D4160", fontSize: "1.5vw", fontWeight: 600 }}
      >
        03 / 15
      </div>
    </div>
  );
}
