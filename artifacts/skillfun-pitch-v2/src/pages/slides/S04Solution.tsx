export default function S04Solution() {
  const cardStyle = (bg: string, border: string) => ({
    background: bg,
    borderRadius: "1vw",
    padding: "2.2vh 2.4vw",
    border,
    display: "grid",
    gridTemplateRows: "auto auto 1fr auto",
  });

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(139,92,246,0.11) 0%, transparent 68%)",
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div
        className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }}
      />
      <div
        className="absolute inset-0"
        style={{ display: "grid", gridTemplateRows: "auto 1fr auto", paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "4.5vh", paddingBottom: "4.5vh", gap: 0 }}
      >
        {/* Header */}
        <div>
          <span style={{ display: "block", fontFamily: "var(--font-body-family)", color: "#22D3EE", fontSize: "1.4vw", fontWeight: 400, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: "1vh" }}>
            The Solution — v3.0
          </span>
          <h2 style={{ fontFamily: "var(--font-display-family)", fontSize: "4.2vw", fontWeight: 800, color: "#F0F0F8", letterSpacing: "-0.025em", lineHeight: 1.05, marginBottom: "3vh" }}>
            A skill is a <span style={{ color: "#8B5CF6" }}>programmable asset.</span><br />
            Treat it like one.
          </h2>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2.5vw", minHeight: 0 }}>

          {/* Card 1 — Skill NFT */}
          <div style={cardStyle("rgba(139,92,246,0.10)", "1px solid rgba(139,92,246,0.30)")}>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.2vw", fontWeight: 600, color: "#8B5CF6", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "1.4vh" }}>
              Skill NFT
            </div>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.4vw", fontWeight: 800, color: "#F0F0F8", lineHeight: 1.1, marginBottom: "1.6vh" }}>
              Own &amp; Trade<br />AI Capabilities
            </div>
            <p style={{ fontFamily: "var(--font-body-family)", fontSize: "1.5vw", color: "#7B7F9E", lineHeight: 1.5, alignSelf: "start" }}>
              Any AI capability minted as an ERC-8239 NFT. Transferable on OpenSea, licensed on-chain with enforced royalties on every invocation.
            </p>
            <div style={{ paddingTop: "1.8vh" }}>
              <div style={{ height: 1, background: "rgba(139,92,246,0.24)", marginBottom: "1.2vh" }} />
              <span style={{ fontFamily: "var(--font-body-family)", fontSize: "1.3vw", color: "#8B5CF6", fontWeight: 600 }}>ERC-8239</span>
            </div>
          </div>

          {/* Card 2 — Bundle */}
          <div style={cardStyle("rgba(180,160,255,0.08)", "1px solid rgba(180,160,255,0.24)")}>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.2vw", fontWeight: 600, color: "#B4A0FF", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "1.4vh" }}>
              Bundle
            </div>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.4vw", fontWeight: 800, color: "#F0F0F8", lineHeight: 1.1, marginBottom: "1.6vh" }}>
              Curate &amp; Package<br />Composite Tools
            </div>
            <p style={{ fontFamily: "var(--font-body-family)", fontSize: "1.5vw", color: "#7B7F9E", lineHeight: 1.5, alignSelf: "start" }}>
              Curators need no ownership. They assemble a set of Skills and earn a Markup on every invocation routed through their Bundle.
            </p>
            <div style={{ paddingTop: "1.8vh" }}>
              <div style={{ height: 1, background: "rgba(180,160,255,0.20)", marginBottom: "1.2vh" }} />
              <span style={{ fontFamily: "var(--font-body-family)", fontSize: "1.3vw", color: "#B4A0FF", fontWeight: 600 }}>Curator Markup + Staker Share</span>
            </div>
          </div>

          {/* Card 3 — One Endpoint */}
          <div style={cardStyle("rgba(34,211,238,0.07)", "1px solid rgba(34,211,238,0.22)")}>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.2vw", fontWeight: 600, color: "#22D3EE", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "1.4vh" }}>
              One Endpoint
            </div>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.4vw", fontWeight: 800, color: "#F0F0F8", lineHeight: 1.1, marginBottom: "1.6vh" }}>
              One MCP URL.<br />Entire Marketplace.
            </div>
            <p style={{ fontFamily: "var(--font-body-family)", fontSize: "1.5vw", color: "#7B7F9E", lineHeight: 1.5, alignSelf: "start" }}>
              Agents add a single SkillFun MCP address. Every Skill and Bundle appears instantly as a callable tool — no extra integrations.
            </p>
            <div style={{ paddingTop: "1.8vh" }}>
              <div style={{ height: 1, background: "rgba(34,211,238,0.20)", marginBottom: "1.2vh" }} />
              <span style={{ fontFamily: "var(--font-body-family)", fontSize: "1.3vw", color: "#22D3EE", fontWeight: 600 }}>MCP · x402 · ERC-8183</span>
            </div>
          </div>

        </div>

        {/* Storage banner — empty spacer */}
        <div style={{ marginTop: "1.8vh", borderTop: "1px solid rgba(52,211,153,0.18)", paddingTop: "1.2vh", display: "flex", alignItems: "center", gap: "1.2vw" }} />
      </div>
      <div className="absolute bottom-[3.5vh] right-[3.5vw]" style={{ fontFamily: "var(--font-display-family)", color: "#3D4160", fontSize: "1.5vw", fontWeight: 600 }}>
        05 / 14
      </div>
    </div>
  );
}
