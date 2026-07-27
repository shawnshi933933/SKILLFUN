const base = import.meta.env.BASE_URL;

export default function S06A2A() {
  const pill = (label: string, color: string, bg: string, border: string) => (
    <span style={{
      fontFamily: "var(--font-display-family)",
      fontSize: "1.25vw",
      fontWeight: 800,
      color,
      background: bg,
      border: `1.5px solid ${border}`,
      borderRadius: "0.35vw",
      padding: "0.3vh 1vw",
      letterSpacing: "0.06em",
      whiteSpace: "nowrap",
    }}>{label}</span>
  );

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0D0F14" }}
    >
      {/* AI background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${base}bg-a2a.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.12
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(139,92,246,0.10) 0%, transparent 70%)"
        }}
      />

      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div
        className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }}
      />

      <div
        className="absolute inset-0 flex flex-col"
        style={{ paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "3.5vh", paddingBottom: "3.5vh" }}
      >
        {/* Header */}
        <span style={{ fontFamily: "var(--font-body-family)", color: "#22D3EE", fontSize: "1.4vw", fontWeight: 400, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: "0.5vh" }}>
          Live Scenario
        </span>
        <h2 style={{ fontFamily: "var(--font-display-family)", fontSize: "3.5vw", fontWeight: 800, color: "#F0F0F8", letterSpacing: "-0.02em", lineHeight: 1.05, marginBottom: "0.4vh" }}>
          Zero-Human Transaction
        </h2>
        <p style={{ fontFamily: "var(--font-body-family)", fontSize: "1.5vw", color: "#7B7F9E", fontWeight: 300, marginBottom: "3vh" }}>
          Agent B invokes a private Skill from Agent A — no human involved, implementation never exposed.
        </p>

        {/* Three participant boxes */}
        <div style={{ display: "flex", alignItems: "stretch", gap: "1.5vw", marginBottom: "3vh" }}>
          <div style={{ flex: 1, background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.30)", borderRadius: "0.8vw", padding: "2vh 2vw", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.4vw", fontWeight: 800, color: "#22D3EE" }}>Agent B</div>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.2vw", color: "#7B7F9E", marginTop: "0.4vh" }}>Skill Invoker</div>
          </div>
          <div style={{ flex: 1.4, background: "rgba(139,92,246,0.14)", border: "1.5px solid rgba(139,92,246,0.50)", borderRadius: "0.8vw", padding: "2vh 2vw", textAlign: "center", boxShadow: "0 0 2.5vw rgba(139,92,246,0.18)" }}>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.6vw", fontWeight: 800, color: "#8B5CF6" }}>SkillFun</div>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.2vw", color: "#B4A0FF", marginTop: "0.4vh" }}>MCP Server · 0G Compute TEE</div>
          </div>
          <div style={{ flex: 1, background: "rgba(180,160,255,0.07)", border: "1px solid rgba(180,160,255,0.26)", borderRadius: "0.8vw", padding: "2vh 2vw", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.4vw", fontWeight: 800, color: "#B4A0FF" }}>Agent A</div>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.2vw", color: "#7B7F9E", marginTop: "0.4vh" }}>Skill Creator</div>
          </div>
        </div>

        {/* Protocol pill flows */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: "0 1.5vw", flex: 1, alignItems: "center" }}>

          {/* Left column — B ↔ SkillFun flows */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", background: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.18)", borderRadius: "0.6vw", padding: "1.2vh 1.5vw" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5vw", flexShrink: 0 }}>
                {pill("MCP", "#22D3EE", "rgba(34,211,238,0.12)", "rgba(34,211,238,0.40)")}
                <span style={{ color: "#22D3EE", fontSize: "1.1vw" }}>→</span>
              </div>
              <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#7B7F9E" }}>Discovers all Bundles &amp; Skills</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", background: "rgba(252,211,77,0.05)", border: "1px solid rgba(252,211,77,0.18)", borderRadius: "0.6vw", padding: "1.2vh 1.5vw" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5vw", flexShrink: 0 }}>
                {pill("x402", "#FCD34D", "rgba(252,211,77,0.10)", "rgba(252,211,77,0.36)")}
                <span style={{ color: "#FCD34D", fontSize: "1.1vw" }}>→</span>
              </div>
              <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#7B7F9E" }}>Per-call HTTP payment → TEE verifies &amp; executes</div>
            </div>
          </div>

          {/* Center divider */}
          <div style={{ width: 1, height: "100%", background: "rgba(139,92,246,0.25)" }} />

          {/* Right column — SkillFun ↔ A flows */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", background: "rgba(180,160,255,0.06)", border: "1px solid rgba(180,160,255,0.18)", borderRadius: "0.6vw", padding: "1.2vh 1.5vw" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5vw", flexShrink: 0 }}>
                {pill("ERC-7857", "#B4A0FF", "rgba(180,160,255,0.12)", "rgba(180,160,255,0.40)")}
                <span style={{ color: "#B4A0FF", fontSize: "1.1vw" }}>←</span>
              </div>
              <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#7B7F9E" }}>iNFT — encrypted Skill + royalty terms on 0G</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.18)", borderRadius: "0.6vw", padding: "1.2vh 1.5vw" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5vw", flexShrink: 0 }}>
                {pill("ERC-8183", "#8B5CF6", "rgba(139,92,246,0.12)", "rgba(139,92,246,0.40)")}
                <span style={{ color: "#8B5CF6", fontSize: "1.1vw" }}>→</span>
              </div>
              <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#7B7F9E" }}>Auto revenue split on-chain</div>
            </div>
          </div>

          {/* Right divider */}
          <div style={{ width: 1, height: "100%", background: "rgba(180,160,255,0.20)" }} />

          {/* Result column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2vh", justifyContent: "center" }}>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.3vw", color: "#7B7F9E", lineHeight: 1.5 }}>
              <span style={{ display: "block", fontFamily: "var(--font-display-family)", fontSize: "1.4vw", fontWeight: 700, color: "#34D399", marginBottom: "0.5vh" }}>Creator</span>
              Royalty split — enforced on-chain, forever
            </div>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.3vw", color: "#7B7F9E", lineHeight: 1.5 }}>
              <span style={{ display: "block", fontFamily: "var(--font-display-family)", fontSize: "1.4vw", fontWeight: 700, color: "#22D3EE", marginBottom: "0.5vh" }}>Curator + Staker</span>
              Markup share distributed instantly
            </div>
          </div>
        </div>

        {/* Bottom summary */}
        <div style={{ marginTop: "2.5vh", padding: "1.2vh 2.5vw", background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: "0.6vw", textAlign: "center" }}>
          <span style={{ fontFamily: "var(--font-display-family)", color: "#34D399", fontSize: "1.55vw", fontWeight: 700 }}>
            Fully autonomous — one endpoint, one payment, TEE-executed, auto-split, implementation never exposed.
          </span>
        </div>
      </div>

      <div className="absolute bottom-[3.5vh] right-[3.5vw]" style={{ fontFamily: "var(--font-display-family)", color: "#3D4160", fontSize: "1.5vw", fontWeight: 600 }}>
        09 / 15
      </div>
    </div>
  );
}
