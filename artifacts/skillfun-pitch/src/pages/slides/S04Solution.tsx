export default function S04Solution() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(139,92,246,0.11) 0%, transparent 68%)"
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div
        className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }}
      />

      <div
        className="absolute inset-0 flex flex-col"
        style={{ paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "4.5vh", paddingBottom: "4.5vh" }}
      >
        <span
          style={{
            fontFamily: "var(--font-body-family)",
            color: "#22D3EE",
            fontSize: "1.4vw",
            fontWeight: 400,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            marginBottom: "1vh"
          }}
        >
          The Solution
        </span>
        <h2
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "4.2vw",
            fontWeight: 800,
            color: "#F0F0F8",
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            marginBottom: "3vh"
          }}
        >
          A skill is a <span style={{ color: "#8B5CF6" }}>programmable asset.</span><br />
          Treat it like one.
        </h2>

        <div className="flex gap-[2.5vw]" style={{ flex: 1, minHeight: 0 }}>
          <div
            className="flex flex-col"
            style={{
              flex: 1,
              background: "rgba(139,92,246,0.10)",
              borderRadius: "1vw",
              padding: "2.2vh 2.4vw",
              border: "1px solid rgba(139,92,246,0.30)",
              minHeight: 0
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.2vw",
                fontWeight: 600,
                color: "#8B5CF6",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: "1.4vh"
              }}
            >
              Skill NFT
            </div>
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "2.4vw",
                fontWeight: 800,
                color: "#F0F0F8",
                lineHeight: 1.1,
                marginBottom: "1.6vh"
              }}
            >
              Own &amp; Trade<br />AI Capabilities
            </div>
            <p
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.5vw",
                color: "#7B7F9E",
                lineHeight: 1.5
              }}
            >
              Any AI capability minted as an ERC-8239 NFT. Transferable on OpenSea, licensed on-chain with enforced royalties on every invocation.
            </p>
            <div style={{ marginTop: "auto", paddingTop: "1.8vh" }}>
              <div style={{ height: 1, background: "rgba(139,92,246,0.24)", marginBottom: "1.2vh" }} />
              <span
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.3vw",
                  color: "#8B5CF6",
                  fontWeight: 600
                }}
              >
                ERC-8239
              </span>
            </div>
          </div>

          <div
            className="flex flex-col"
            style={{
              flex: 1,
              background: "rgba(180,160,255,0.08)",
              borderRadius: "1vw",
              padding: "2.2vh 2.4vw",
              border: "1px solid rgba(180,160,255,0.24)",
              minHeight: 0
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.2vw",
                fontWeight: 600,
                color: "#B4A0FF",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: "1.4vh"
              }}
            >
              Bundle
            </div>
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "2.4vw",
                fontWeight: 800,
                color: "#F0F0F8",
                lineHeight: 1.1,
                marginBottom: "1.6vh"
              }}
            >
              Curate &amp; Package<br />Composite Tools
            </div>
            <p
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.5vw",
                color: "#7B7F9E",
                lineHeight: 1.5
              }}
            >
              Curators act as distributors — no ownership required. They curate a collection of Skills and earn a Markup on every invocation routed through their Bundle.
            </p>
            <div style={{ marginTop: "auto", paddingTop: "1.8vh" }}>
              <div style={{ height: 1, background: "rgba(180,160,255,0.20)", marginBottom: "1.2vh" }} />
              <span
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.3vw",
                  color: "#B4A0FF",
                  fontWeight: 600
                }}
              >
                Curator Markup + Staker Share
              </span>
            </div>
          </div>

          <div
            className="flex flex-col"
            style={{
              flex: 1,
              background: "rgba(34,211,238,0.07)",
              borderRadius: "1vw",
              padding: "2.2vh 2.4vw",
              border: "1px solid rgba(34,211,238,0.22)",
              minHeight: 0
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.2vw",
                fontWeight: 600,
                color: "#22D3EE",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: "1.4vh"
              }}
            >
              One Endpoint
            </div>
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "2.4vw",
                fontWeight: 800,
                color: "#F0F0F8",
                lineHeight: 1.1,
                marginBottom: "1.6vh"
              }}
            >
              One MCP URL.<br />Entire Marketplace.
            </div>
            <p
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.5vw",
                color: "#7B7F9E",
                lineHeight: 1.5
              }}
            >
              Agents add a single SkillFun MCP address. Every Skill and Bundle appears instantly as a native callable tool — no integrations to manage.
            </p>
            <div style={{ marginTop: "auto", paddingTop: "1.8vh" }}>
              <div style={{ height: 1, background: "rgba(34,211,238,0.20)", marginBottom: "1.2vh" }} />
              <span
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.3vw",
                  color: "#22D3EE",
                  fontWeight: 600
                }}
              >
                MCP · x402 · ERC-8183
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-[3.5vh] right-[3.5vw]"
        style={{
          fontFamily: "var(--font-display-family)",
          color: "#3D4160",
          fontSize: "1.5vw",
          fontWeight: 600
        }}
      >
        04 / 14
      </div>
    </div>
  );
}
