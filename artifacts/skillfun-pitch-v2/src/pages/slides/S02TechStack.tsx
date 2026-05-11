export default function S02TechStack() {
  const base = import.meta.env.BASE_URL;
  const rowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "20vw 1px 1fr",
    alignItems: "center",
    gap: "0 2vw",
    background: "rgba(22,25,41,0.85)",
    borderRadius: "0.6vw",
    padding: "0.8vh 2.8vw",
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
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${base}bg-techstack.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.10
        }}
      />
      <div
        className="absolute inset-0 flex flex-col"
        style={{ paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "3vh", paddingBottom: "3vh" }}
      >
        <span
          style={{
            fontFamily: "var(--font-body-family)",
            color: "#22D3EE",
            fontSize: "1.4vw",
            fontWeight: 400,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            marginBottom: "0.5vh"
          }}
        >TECH Background</span>
        <h2
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "3.5vw",
            fontWeight: 800,
            color: "#F0F0F8",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            marginBottom: "0.4vh"
          }}
        >
          Protocol Landscape
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body-family)",
            fontSize: "1.55vw",
            color: "#7B7F9E",
            fontWeight: 300,
            marginBottom: "1.2vh"
          }}
        >
          Every layer of the agent stack is crystallizing now — SkillFun connects them all.
        </p>

        <div className="flex flex-col" style={{ flex: 1, justifyContent: "flex-start", gap: "1.2vh" }}>

          <div style={rowStyle}>
            <div style={{ whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: "var(--font-display-family)", color: "#B4A0FF", fontSize: "1.5vw", fontWeight: 700 }}>MCP + A2A</span>
              <span style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.25vw", marginLeft: "0.6vw" }}>Communication</span>
            </div>
            <div style={dividerStyle} />
            <div style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.35vw", lineHeight: 1.4 }}>
              Open specs for agent tool invocation &amp; messaging
            </div>
          </div>

          <div style={rowStyle}>
            <div style={{ whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: "var(--font-display-family)", color: "#B4A0FF", fontSize: "1.5vw", fontWeight: 700 }}>ERC-8004</span>
              <span style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.25vw", marginLeft: "0.6vw" }}>Identity</span>
            </div>
            <div style={dividerStyle} />
            <div style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.35vw", lineHeight: 1.4 }}>
              On-chain agent identity and verifiable credentials
            </div>
          </div>

          <div style={rowStyle}>
            <div style={{ whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: "var(--font-display-family)", color: "#22D3EE", fontSize: "1.5vw", fontWeight: 700 }}>x402</span>
              <span style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.25vw", marginLeft: "0.6vw" }}>Payment</span>
            </div>
            <div style={dividerStyle} />
            <div style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.35vw", lineHeight: 1.4 }}>
              HTTP-native pay-per-call, settled on-chain
            </div>
          </div>

          <div style={rowStyle}>
            <div style={{ whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: "var(--font-display-family)", color: "#22D3EE", fontSize: "1.5vw", fontWeight: 700 }}>ERC-8183</span>
              <span style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.25vw", marginLeft: "0.6vw" }}>Commerce</span>
            </div>
            <div style={dividerStyle} />
            <div style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.35vw", lineHeight: 1.4 }}>
              Auto-settlement and revenue-sharing for agent transactions
            </div>
          </div>

          <div style={rowStyle}>
            <div style={{ whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: "var(--font-display-family)", color: "#B4A0FF", fontSize: "1.5vw", fontWeight: 700 }}>ERC-8239</span>
              <span style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.25vw", marginLeft: "0.6vw" }}>Capability</span>
            </div>
            <div style={dividerStyle} />
            <div style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.35vw", lineHeight: 1.4 }}>
              NFT standard for tokenized AI skills and royalties
            </div>
          </div>

          <div style={rowStyle}>
            <div style={{ whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: "var(--font-display-family)", color: "#B4A0FF", fontSize: "1.5vw", fontWeight: 700 }}>ERC-8220</span>
              <span style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.25vw", marginLeft: "0.6vw" }}>Governance</span>
            </div>
            <div style={dividerStyle} />
            <div style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.35vw", lineHeight: 1.4 }}>
              Security rails — ZK and TEE execution proofs
            </div>
          </div>

          <div style={{ ...rowStyle, border: "1px solid rgba(52,211,153,0.22)", background: "rgba(52,211,153,0.05)" }}>
            <div style={{ whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: "var(--font-display-family)", color: "#34D399", fontSize: "1.5vw", fontWeight: 700 }}>EIP-4844</span>
              <span style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.25vw", marginLeft: "0.6vw" }}>Storage</span>
            </div>
            <div style={dividerStyle} />
            <div style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.35vw", lineHeight: 1.4 }}>
              Skill metadata stored via Ethereum blob transactions
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
        06 / 14
      </div>
    </div>
  );
}
