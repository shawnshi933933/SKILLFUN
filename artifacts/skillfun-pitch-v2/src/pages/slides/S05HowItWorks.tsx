export default function S05HowItWorks() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 70% 35% at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 55%)"
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div
        className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }}
      />

      <div
        className="absolute inset-0 flex flex-col"
        style={{ paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "5.5vh", paddingBottom: "6vh" }}
      >
        <span
          style={{
            fontFamily: "var(--font-body-family)",
            color: "#22D3EE",
            fontSize: "1.4vw",
            fontWeight: 400,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            marginBottom: "1.2vh"
          }}
        >
          Workflow
        </span>
        <h2
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "4vw",
            fontWeight: 800,
            color: "#F0F0F8",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            marginBottom: "3.5vh"
          }}
        >
          How It Works
        </h2>

        <div className="flex items-stretch" style={{ flex: 1 }}>
          {/* Step 01 — Mint */}
          <div
            className="flex flex-col justify-between"
            style={{
              flex: 1,
              padding: "3vh 2vw",
              background: "rgba(139,92,246,0.13)",
              borderRadius: "0.8vw 0 0 0.8vw",
              border: "1px solid rgba(139,92,246,0.32)",
              borderRight: "none",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "3.8vw", fontWeight: 800, color: "rgba(139,92,246,0.22)", lineHeight: 1 }}>01</div>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.1vw", fontWeight: 700, color: "#8B5CF6", marginTop: "1.2vh" }}>Mint</div>
            </div>
            <p style={{ fontFamily: "var(--font-body-family)", fontSize: "1.55vw", color: "#B0B4D0", lineHeight: 1.5, marginTop: "2vh" }}>
              Mint any AI capability as an ERC-8239 NFT with price &amp; royalties set.
            </p>
          </div>

          <div style={{ width: "2.8vw", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6", fontSize: "2vw", fontFamily: "var(--font-display-family)", flexShrink: 0 }}>›</div>

          {/* Step 02 — Bundle */}
          <div
            className="flex flex-col justify-between"
            style={{
              flex: 1,
              padding: "3vh 2vw",
              background: "rgba(22,25,41,0.8)",
              border: "1px solid rgba(240,240,248,0.08)",
              borderLeft: "none",
              borderRight: "none",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "3.8vw", fontWeight: 800, color: "rgba(180,160,255,0.20)", lineHeight: 1 }}>02</div>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.1vw", fontWeight: 700, color: "#B4A0FF", marginTop: "1.2vh" }}>Bundle</div>
            </div>
            <p style={{ fontFamily: "var(--font-body-family)", fontSize: "1.55vw", color: "#B0B4D0", lineHeight: 1.5, marginTop: "2vh" }}>
              Curators compose Skills into a Bundle, add Markup, set Staker share.
            </p>
          </div>

          <div style={{ width: "2.8vw", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6", fontSize: "2vw", fontFamily: "var(--font-display-family)", flexShrink: 0 }}>›</div>

          {/* Step 03 — Discover */}
          <div
            className="flex flex-col justify-between"
            style={{
              flex: 1,
              padding: "3vh 2vw",
              background: "rgba(22,25,41,0.8)",
              border: "1px solid rgba(240,240,248,0.08)",
              borderLeft: "none",
              borderRight: "none",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "3.8vw", fontWeight: 800, color: "rgba(157,163,200,0.18)", lineHeight: 1 }}>03</div>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.1vw", fontWeight: 700, color: "#9DA3C8", marginTop: "1.2vh" }}>Discover</div>
            </div>
            <p style={{ fontFamily: "var(--font-body-family)", fontSize: "1.55vw", color: "#B0B4D0", lineHeight: 1.5, marginTop: "2vh" }}>
              One MCP URL — every Skill and Bundle appears as a native callable tool.
            </p>
          </div>

          <div style={{ width: "2.8vw", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6", fontSize: "2vw", fontFamily: "var(--font-display-family)", flexShrink: 0 }}>›</div>

          {/* Step 04 — Pay */}
          <div
            className="flex flex-col justify-between"
            style={{
              flex: 1,
              padding: "3vh 2vw",
              background: "rgba(22,25,41,0.8)",
              border: "1px solid rgba(240,240,248,0.08)",
              borderLeft: "none",
              borderRight: "none",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "3.8vw", fontWeight: 800, color: "rgba(34,211,238,0.20)", lineHeight: 1 }}>04</div>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.1vw", fontWeight: 700, color: "#22D3EE", marginTop: "1.2vh" }}>Pay</div>
            </div>
            <p style={{ fontFamily: "var(--font-body-family)", fontSize: "1.55vw", color: "#B0B4D0", lineHeight: 1.5, marginTop: "2vh" }}>
              x402 per-call HTTP payment acquires call rights instantly.
            </p>
          </div>

          <div style={{ width: "2.8vw", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6", fontSize: "2vw", fontFamily: "var(--font-display-family)", flexShrink: 0 }}>›</div>

          {/* Step 05 — Earn */}
          <div
            className="flex flex-col justify-between"
            style={{
              flex: 1,
              padding: "3vh 2vw",
              background: "rgba(34,211,238,0.08)",
              borderRadius: "0 0.8vw 0.8vw 0",
              border: "1px solid rgba(34,211,238,0.24)",
              borderLeft: "none",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "3.8vw", fontWeight: 800, color: "rgba(34,211,238,0.22)", lineHeight: 1 }}>05</div>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.1vw", fontWeight: 700, color: "#22D3EE", marginTop: "1.2vh" }}>Earn</div>
            </div>
            <p style={{ fontFamily: "var(--font-body-family)", fontSize: "1.55vw", color: "#B0B4D0", lineHeight: 1.5, marginTop: "2vh" }}>
              ERC-8183 splits revenue to Creator, Owner, Curator, Stakers &amp; Platform.
            </p>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-[3.5vh] right-[3.5vw]"
        style={{ fontFamily: "var(--font-display-family)", color: "#3D4160", fontSize: "1.5vw", fontWeight: 600 }}
      >
        08 / 15
      </div>
    </div>
  );
}
