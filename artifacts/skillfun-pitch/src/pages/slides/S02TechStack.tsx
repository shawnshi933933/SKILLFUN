export default function S02TechStack() {
  const rowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "16vw 1px 1fr",
    alignItems: "center",
    gap: "0 2vw",
    background: "rgba(22,25,41,0.85)",
    borderRadius: "0.6vw",
    padding: "1.2vh 2.8vw 1.2vh 2.8vw",
    border: "1px solid rgba(240,240,248,0.08)"
  };

  const dividerStyle: React.CSSProperties = {
    width: 1,
    alignSelf: "stretch",
    background: "rgba(240,240,248,0.12)"
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 65% 55% at 75% 50%, rgba(139,92,246,0.09) 0%, transparent 70%)"
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
          Background
        </span>
        <h2
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "3.8vw",
            fontWeight: 800,
            color: "#F0F0F8",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            marginBottom: "0.6vh"
          }}
        >
          Protocol Landscape
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body-family)",
            fontSize: "1.75vw",
            color: "#7B7F9E",
            fontWeight: 300,
            marginBottom: "2vh"
          }}
        >
          Seven protocol layers are crystallizing for the AI agent economy — SkillFun builds on the capability layer
        </p>

        <div className="flex flex-col" style={{ flex: 1, justifyContent: "space-between" }}>

          <div style={rowStyle}>
            <div>
              <span style={{ fontFamily: "var(--font-display-family)", color: "#B4A0FF", fontSize: "1.5vw", fontWeight: 700 }}>MCP + A2A</span>
              <span style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.25vw", marginLeft: "0.6vw" }}>Communication</span>
            </div>
            <div style={dividerStyle} />
            <div style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.5vw", lineHeight: 1.4 }}>
              Tool invocation (MCP) and agent-to-agent messaging (A2A) — Anthropic &amp; Google open specs
            </div>
          </div>

          <div style={rowStyle}>
            <div>
              <span style={{ fontFamily: "var(--font-display-family)", color: "#B4A0FF", fontSize: "1.5vw", fontWeight: 700 }}>ERC-8004</span>
              <span style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.25vw", marginLeft: "0.6vw" }}>Identity</span>
            </div>
            <div style={dividerStyle} />
            <div style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.5vw", lineHeight: 1.4 }}>
              On-chain agent identity, trust scores, and verifiable credentials for autonomous agents
            </div>
          </div>

          <div style={rowStyle}>
            <div>
              <span style={{ fontFamily: "var(--font-display-family)", color: "#22D3EE", fontSize: "1.5vw", fontWeight: 700 }}>x402</span>
              <span style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.25vw", marginLeft: "0.6vw" }}>Payment</span>
            </div>
            <div style={dividerStyle} />
            <div style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.5vw", lineHeight: 1.4 }}>
              HTTP-native micropayment gating — pay per API call with no subscriptions or off-chain rails
            </div>
          </div>

          <div style={rowStyle}>
            <div>
              <span style={{ fontFamily: "var(--font-display-family)", color: "#22D3EE", fontSize: "1.5vw", fontWeight: 700 }}>ERC-8183</span>
              <span style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.25vw", marginLeft: "0.6vw" }}>Commerce</span>
            </div>
            <div style={dividerStyle} />
            <div style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.5vw", lineHeight: 1.4 }}>
              Standardized settlement and revenue-sharing contracts for agent service transactions
            </div>
          </div>

          <div
            style={{
              ...rowStyle,
              background: "rgba(139,92,246,0.13)",
              border: "1px solid rgba(139,92,246,0.42)"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6vw" }}>
                <span style={{ fontFamily: "var(--font-display-family)", color: "#8B5CF6", fontSize: "1.5vw", fontWeight: 700 }}>ERC-8239</span>
                <span
                  style={{
                    fontFamily: "var(--font-body-family)",
                    color: "#F0A500",
                    fontSize: "1.1vw",
                    fontWeight: 600,
                    background: "rgba(240,165,0,0.14)",
                    border: "1px solid rgba(240,165,0,0.32)",
                    borderRadius: "0.3vw",
                    padding: "0.1vh 0.5vw"
                  }}
                >
                  Draft
                </span>
              </div>
              <div style={{ fontFamily: "var(--font-body-family)", color: "#9370DB", fontSize: "1.2vw", marginTop: "0.2vh" }}>
                Capability — SkillFun builds here
              </div>
            </div>
            <div style={{ ...dividerStyle, background: "rgba(139,92,246,0.5)" }} />
            <div style={{ fontFamily: "var(--font-body-family)", color: "#B0B4D0", fontSize: "1.5vw", lineHeight: 1.4 }}>
              NFT standard for tokenized AI skills — ownership, licensing, and royalty enforcement. SkillFun adopts this draft standard to build the SKILL token ecosystem on top of it.
            </div>
          </div>

          <div style={rowStyle}>
            <div>
              <span style={{ fontFamily: "var(--font-display-family)", color: "#B4A0FF", fontSize: "1.5vw", fontWeight: 700 }}>ERC-8220</span>
              <span style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.25vw", marginLeft: "0.6vw" }}>Governance</span>
            </div>
            <div style={dividerStyle} />
            <div style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.5vw", lineHeight: 1.4 }}>
              Security and governance rails for the agent stack — ZK and TEE execution proofs
            </div>
          </div>

          <div style={rowStyle}>
            <div>
              <span style={{ fontFamily: "var(--font-display-family)", color: "#7B7F9E", fontSize: "1.5vw", fontWeight: 700, fontStyle: "italic" }}>Memory</span>
              <span style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.25vw", marginLeft: "0.6vw" }}>Storage</span>
            </div>
            <div style={dividerStyle} />
            <div style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.5vw", lineHeight: 1.4, fontStyle: "italic" }}>
              Persistent agent memory and decentralized storage — standard not yet defined
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
        02 / 11
      </div>
    </div>
  );
}
