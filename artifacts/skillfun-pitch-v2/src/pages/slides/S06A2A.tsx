export default function S06A2A() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0D0F14" }}
    >
      {/* AI background image — low opacity */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/skillfun-pitch-v2/bg-a2a.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.12
        }}
      />
      {/* Dark overlay gradient */}
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
          Agent B buys a skill from Agent A — no human involved at any step.
        </p>

        {/* Participant boxes */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: "3vh" }}>
          {/* Agent B */}
          <div style={{ flex: 1, background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.30)", borderRadius: "0.8vw", padding: "1.8vh 2vw", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.2vw", fontWeight: 800, color: "#22D3EE" }}>Agent B</div>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.15vw", color: "#7B7F9E", marginTop: "0.3vh" }}>Skill Buyer</div>
          </div>

          {/* Arrow B→S */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "8vw", flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "0.9vw", color: "#22D3EE", fontWeight: 600, marginBottom: "0.3vh", letterSpacing: "0.06em" }}>x402</div>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(34,211,238,0.4)" }} />
              <div style={{ color: "#22D3EE", fontSize: "1.2vw", lineHeight: 1 }}>›</div>
            </div>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "0.85vw", color: "#3D4160", marginTop: "0.3vh" }}>pays</div>
          </div>

          {/* SkillFun center */}
          <div style={{ flex: 1.4, background: "rgba(139,92,246,0.14)", border: "1.5px solid rgba(139,92,246,0.50)", borderRadius: "0.8vw", padding: "2vh 2vw", textAlign: "center", boxShadow: "0 0 2.5vw rgba(139,92,246,0.18)" }}>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.5vw", fontWeight: 800, color: "#8B5CF6" }}>SkillFun</div>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.15vw", color: "#B4A0FF", marginTop: "0.3vh" }}>MCP Server · Bundle Layer</div>
          </div>

          {/* Arrow S→A */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "8vw", flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "0.9vw", color: "#B4A0FF", fontWeight: 600, marginBottom: "0.3vh", letterSpacing: "0.06em" }}>ERC-8183</div>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(180,160,255,0.4)" }} />
              <div style={{ color: "#B4A0FF", fontSize: "1.2vw", lineHeight: 1 }}>›</div>
            </div>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "0.85vw", color: "#3D4160", marginTop: "0.3vh" }}>royalties</div>
          </div>

          {/* Agent A */}
          <div style={{ flex: 1, background: "rgba(180,160,255,0.07)", border: "1px solid rgba(180,160,255,0.26)", borderRadius: "0.8vw", padding: "1.8vh 2vw", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.2vw", fontWeight: 800, color: "#B4A0FF" }}>Agent A</div>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.15vw", color: "#7B7F9E", marginTop: "0.3vh" }}>Skill Creator</div>
          </div>
        </div>

        {/* Protocol flow — 4 steps */}
        <div className="flex flex-col" style={{ flex: 1, justifyContent: "space-between" }}>
          {/* Step 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "7vw 1fr", alignItems: "center", gap: "0 2vw", background: "rgba(22,25,41,0.75)", border: "1px solid rgba(34,211,238,0.18)", borderRadius: "0.5vw", padding: "1vh 2vw" }}>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.6vw", fontWeight: 800, color: "#22D3EE" }}>MCP</div>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.35vw", color: "#C8CADB" }}>Agent B adds one SkillFun endpoint — all Bundles &amp; Skills appear as native tools</div>
          </div>
          {/* Step 2 */}
          <div style={{ display: "grid", gridTemplateColumns: "7vw 1fr", alignItems: "center", gap: "0 2vw", background: "rgba(22,25,41,0.75)", border: "1px solid rgba(139,92,246,0.18)", borderRadius: "0.5vw", padding: "1vh 2vw" }}>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.4vw", fontWeight: 800, color: "#8B5CF6" }}>ERC-8239</div>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.35vw", color: "#C8CADB" }}>Skill NFT encodes price, license terms, and Creator:Owner royalty split on-chain</div>
          </div>
          {/* Step 3 */}
          <div style={{ display: "grid", gridTemplateColumns: "7vw 1fr", alignItems: "center", gap: "0 2vw", background: "rgba(22,25,41,0.75)", border: "1px solid rgba(34,211,238,0.18)", borderRadius: "0.5vw", padding: "1vh 2vw" }}>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.6vw", fontWeight: 800, color: "#22D3EE" }}>x402</div>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.35vw", color: "#C8CADB" }}>HTTP payment per invocation — call rights acquired instantly, no subscriptions</div>
          </div>
          {/* Step 4 */}
          <div style={{ display: "grid", gridTemplateColumns: "7vw 1fr", alignItems: "center", gap: "0 2vw", background: "rgba(22,25,41,0.75)", border: "1px solid rgba(180,160,255,0.18)", borderRadius: "0.5vw", padding: "1vh 2vw" }}>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.4vw", fontWeight: 800, color: "#B4A0FF" }}>ERC-8183</div>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.35vw", color: "#C8CADB" }}>Auto-splits revenue: Creator · Owner · Curator · Staker · Platform — zero manual settlement</div>
          </div>
        </div>

        {/* Bottom summary */}
        <div style={{ marginTop: "2.5vh", padding: "1.2vh 2.5vw", background: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.25)", borderRadius: "0.6vw", textAlign: "center" }}>
          <span style={{ fontFamily: "var(--font-display-family)", color: "#22D3EE", fontSize: "1.6vw", fontWeight: 700 }}>
            Fully autonomous — one endpoint, one payment, auto-split, zero human involvement.
          </span>
        </div>
      </div>

      <div className="absolute bottom-[3.5vh] right-[3.5vw]" style={{ fontFamily: "var(--font-display-family)", color: "#3D4160", fontSize: "1.5vw", fontWeight: 600 }}>
        09 / 15
      </div>
    </div>
  );
}
