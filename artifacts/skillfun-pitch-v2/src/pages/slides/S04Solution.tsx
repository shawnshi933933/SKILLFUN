export default function S04Solution() {
  const base = import.meta.env.BASE_URL;
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
        style={{
          backgroundImage: `url(${base}bg-solution.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.10
        }}
      />
      <div
        className="absolute inset-0"
        style={{ display: "grid", gridTemplateRows: "auto 1fr auto", paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "4.5vh", paddingBottom: "4.5vh", gap: 0 }}
      >
        {/* Header */}
        <div>
          <span style={{ display: "block", fontFamily: "var(--font-body-family)", color: "#22D3EE", fontSize: "1.4vw", fontWeight: 400, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: "1vh" }}>
            The Solution — Built on 0G Chain
          </span>
          <h2 style={{ fontFamily: "var(--font-display-family)", fontSize: "4.2vw", fontWeight: 800, color: "#F0F0F8", letterSpacing: "-0.025em", lineHeight: 1.05, marginBottom: "3vh" }}>
            A skill is a <span style={{ color: "#8B5CF6" }}>programmable asset.</span><br />
            Private. Ownable. Tradeable.
          </h2>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2.5vw", minHeight: 0 }}>

          {/* Card 1 — ERC-7857 iNFT */}
          <div style={cardStyle("rgba(139,92,246,0.10)", "1px solid rgba(139,92,246,0.30)")}>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.2vw", fontWeight: 600, color: "#8B5CF6", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "1.4vh" }}>
              Skill iNFT
            </div>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.4vw", fontWeight: 800, color: "#F0F0F8", lineHeight: 1.1, marginBottom: "1.6vh" }}>
              Own Access +<br />Revenue Rights
            </div>
            <p style={{ fontFamily: "var(--font-body-family)", fontSize: "1.5vw", color: "#7B7F9E", lineHeight: 1.5, alignSelf: "start" }}>
              Any AI capability minted as an ERC-7857 iNFT. The NFT is both the access key and the royalty claim. Transferable — new owner gets decryption rights, old owner loses them instantly.
            </p>
            <div style={{ paddingTop: "1.8vh" }}>
              <div style={{ height: 1, background: "rgba(139,92,246,0.24)", marginBottom: "1.2vh" }} />
              <span style={{ fontFamily: "var(--font-body-family)", fontSize: "1.3vw", color: "#8B5CF6", fontWeight: 600 }}>ERC-7857 · 0G Chain</span>
            </div>
          </div>

          {/* Card 2 — 0G Compute TEE */}
          <div style={cardStyle("rgba(52,211,153,0.07)", "1px solid rgba(52,211,153,0.24)")}>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.2vw", fontWeight: 600, color: "#34D399", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "1.4vh" }}>
              Private Execution
            </div>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.4vw", fontWeight: 800, color: "#F0F0F8", lineHeight: 1.1, marginBottom: "1.6vh" }}>
              Verifiable.<br />Implementation Hidden.
            </div>
            <p style={{ fontFamily: "var(--font-body-family)", fontSize: "1.5vw", color: "#7B7F9E", lineHeight: 1.5, alignSelf: "start" }}>
              Skills run inside 0G Compute TEE. The caller pays, gets results — but never sees the implementation. Skill content is encrypted end-to-end on 0G Storage.
            </p>
            <div style={{ paddingTop: "1.8vh" }}>
              <div style={{ height: 1, background: "rgba(52,211,153,0.20)", marginBottom: "1.2vh" }} />
              <span style={{ fontFamily: "var(--font-body-family)", fontSize: "1.3vw", color: "#34D399", fontWeight: 600 }}>0G Compute TEE · 0G Storage</span>
            </div>
          </div>

          {/* Card 3 — x402 Agent Payments */}
          <div style={cardStyle("rgba(34,211,238,0.07)", "1px solid rgba(34,211,238,0.22)")}>
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.2vw", fontWeight: 600, color: "#22D3EE", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "1.4vh" }}>
              Agent Payments
            </div>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.4vw", fontWeight: 800, color: "#F0F0F8", lineHeight: 1.1, marginBottom: "1.6vh" }}>
              Any Agent,<br />Any Chain.
            </div>
            <p style={{ fontFamily: "var(--font-body-family)", fontSize: "1.5vw", color: "#7B7F9E", lineHeight: 1.5, alignSelf: "start" }}>
              Agents pay per call via x402 HTTP-native payment. No SDK, no registration — one MCP endpoint, auto-split revenue to Creator, Owner, Curator &amp; Stakers.
            </p>
            <div style={{ paddingTop: "1.8vh" }}>
              <div style={{ height: 1, background: "rgba(34,211,238,0.20)", marginBottom: "1.2vh" }} />
              <span style={{ fontFamily: "var(--font-body-family)", fontSize: "1.3vw", color: "#22D3EE", fontWeight: 600 }}>x402 · MCP · ERC-8183</span>
            </div>
          </div>

        </div>

        {/* 0G banner */}
        <div style={{ marginTop: "1.8vh", borderTop: "1px solid rgba(52,211,153,0.18)", paddingTop: "1.2vh", display: "flex", alignItems: "center", gap: "1.2vw" }}>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "0.95vw", fontWeight: 700, color: "#34D399", background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.30)", borderRadius: "0.3vw", padding: "0.2vh 0.7vw", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
            POWERED BY 0G
          </span>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "1.1vw", color: "rgba(52,211,153,0.55)" }}>
            0G Storage · 0G Compute · 0G Chain — the only AI-native decentralized infrastructure for private Skill execution
          </span>
        </div>
      </div>
      <div className="absolute bottom-[3.5vh] right-[3.5vw]" style={{ fontFamily: "var(--font-display-family)", color: "#3D4160", fontSize: "1.5vw", fontWeight: 600 }}>
        05 / 15
      </div>
    </div>
  );
}
