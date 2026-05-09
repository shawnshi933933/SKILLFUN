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
        style={{ paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "5vh", paddingBottom: "5vh" }}
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
            marginBottom: "4.5vh"
          }}
        >
          A skill is a <span style={{ color: "#8B5CF6" }}>programmable asset.</span><br />
          Treat it like one.
        </h2>

        <div className="flex gap-[2.5vw]" style={{ flex: 1 }}>
          <div
            className="flex flex-col"
            style={{
              flex: 1,
              background: "rgba(139,92,246,0.10)",
              borderRadius: "1vw",
              padding: "3vh 2.8vw",
              border: "1px solid rgba(139,92,246,0.30)"
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
                marginBottom: "1.8vh"
              }}
            >
              Skill NFT
            </div>
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "2.6vw",
                fontWeight: 800,
                color: "#F0F0F8",
                lineHeight: 1.1,
                marginBottom: "2vh"
              }}
            >
              Own &amp; Trade<br />AI Capabilities
            </div>
            <p
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.7vw",
                color: "#7B7F9E",
                lineHeight: 1.55
              }}
            >
              Any AI capability minted as an ERC-8239 NFT. Transferable on OpenSea, licensed on-chain with enforced royalties on every invocation.
            </p>
            <div style={{ marginTop: "auto", paddingTop: "2.5vh" }}>
              <div style={{ height: 1, background: "rgba(139,92,246,0.24)", marginBottom: "1.5vh" }} />
              <span
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.35vw",
                  color: "#8B5CF6",
                  fontWeight: 600
                }}
              >
                ERC-8239 · Sepolia Testnet
              </span>
            </div>
          </div>

          <div
            className="flex flex-col"
            style={{
              flex: 1,
              background: "rgba(180,160,255,0.08)",
              borderRadius: "1vw",
              padding: "3vh 2.8vw",
              border: "1px solid rgba(180,160,255,0.24)"
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
                marginBottom: "1.8vh"
              }}
            >
              Bundle
            </div>
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "2.6vw",
                fontWeight: 800,
                color: "#F0F0F8",
                lineHeight: 1.1,
                marginBottom: "2vh"
              }}
            >
              Curate &amp; Package<br />Composite Tools
            </div>
            <p
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.7vw",
                color: "#7B7F9E",
                lineHeight: 1.55
              }}
            >
              Curators package multiple Skills into a single composite tool with orchestration rules — registered as one MCP tool in the unified endpoint.
            </p>
            <div style={{ marginTop: "auto", paddingTop: "2.5vh" }}>
              <div style={{ height: 1, background: "rgba(180,160,255,0.20)", marginBottom: "1.5vh" }} />
              <span
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.35vw",
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
              padding: "3vh 2.8vw",
              border: "1px solid rgba(34,211,238,0.22)"
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
                marginBottom: "1.8vh"
              }}
            >
              One Endpoint
            </div>
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "2.6vw",
                fontWeight: 800,
                color: "#F0F0F8",
                lineHeight: 1.1,
                marginBottom: "2vh"
              }}
            >
              One MCP URL.<br />Entire Marketplace.
            </div>
            <p
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.7vw",
                color: "#7B7F9E",
                lineHeight: 1.55
              }}
            >
              Agents add a single SkillFun MCP address. Every Skill and Bundle appears instantly as a native callable tool — no integrations to manage.
            </p>
            <div style={{ marginTop: "auto", paddingTop: "2.5vh" }}>
              <div style={{ height: 1, background: "rgba(34,211,238,0.20)", marginBottom: "1.5vh" }} />
              <span
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.35vw",
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
        04 / 13
      </div>
    </div>
  );
}
