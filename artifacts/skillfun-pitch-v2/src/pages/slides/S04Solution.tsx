export default function S04Solution() {
  const cards = [
    {
      label: "Skill NFT",
      labelColor: "#8B5CF6",
      bg: "rgba(139,92,246,0.10)",
      border: "1px solid rgba(139,92,246,0.30)",
      divider: "rgba(139,92,246,0.24)",
      title: <>Own &amp; Trade<br />AI Capabilities</>,
      body: "Any AI capability minted as an ERC-8239 NFT. Transferable on OpenSea, licensed on-chain with enforced royalties on every invocation.",
      footer: "ERC-8239",
      footerColor: "#8B5CF6",
    },
    {
      label: "Bundle",
      labelColor: "#B4A0FF",
      bg: "rgba(180,160,255,0.08)",
      border: "1px solid rgba(180,160,255,0.24)",
      divider: "rgba(180,160,255,0.20)",
      title: <>Curate &amp; Package<br />Composite Tools</>,
      body: "Curators need no ownership. They assemble a set of Skills and earn a Markup on every invocation routed through their Bundle.",
      footer: "Curator Markup + Staker Share",
      footerColor: "#B4A0FF",
    },
    {
      label: "One Endpoint",
      labelColor: "#22D3EE",
      bg: "rgba(34,211,238,0.07)",
      border: "1px solid rgba(34,211,238,0.22)",
      divider: "rgba(34,211,238,0.20)",
      title: <>One MCP URL.<br />Entire Marketplace.</>,
      body: "Agents add a single SkillFun MCP address. Every Skill and Bundle appears instantly as a callable tool — no extra integrations.",
      footer: "MCP · x402 · ERC-8183",
      footerColor: "#22D3EE",
    },
  ];

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
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          paddingLeft: "7vw",
          paddingRight: "7vw",
          paddingTop: "4.5vh",
          paddingBottom: "4.5vh",
          gap: 0,
        }}
      >
        {/* Header */}
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
            The Solution — v3.0
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display-family)",
              fontSize: "4.2vw",
              fontWeight: 800,
              color: "#F0F0F8",
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
              marginBottom: "3vh",
            }}
          >
            A skill is a <span style={{ color: "#8B5CF6" }}>programmable asset.</span><br />
            Treat it like one.
          </h2>
        </div>

        {/* Cards — CSS Grid ensures perfectly equal column widths */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "2.5vw",
            minHeight: 0,
          }}
        >

          {cards.map((c) => (
            <div
              key={c.label}
              style={{
                background: c.bg,
                borderRadius: "1vw",
                padding: "2.2vh 2.4vw",
                border: c.border,
                display: "grid",
                gridTemplateRows: "auto auto 1fr auto",
              }}
            >
              {/* Label */}
              <div
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.2vw",
                  fontWeight: 600,
                  color: c.labelColor,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginBottom: "1.4vh",
                }}
              >
                {c.label}
              </div>

              {/* Title */}
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "2.4vw",
                  fontWeight: 800,
                  color: "#F0F0F8",
                  lineHeight: 1.1,
                  marginBottom: "1.6vh",
                }}
              >
                {c.title}
              </div>

              {/* Body — fills remaining height */}
              <p
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.5vw",
                  color: "#7B7F9E",
                  lineHeight: 1.5,
                  alignSelf: "start",
                }}
              >
                {c.body}
              </p>

              {/* Footer — always pinned to bottom row */}
              <div style={{ paddingTop: "1.8vh" }}>
                <div style={{ height: 1, background: c.divider, marginBottom: "1.2vh" }} />
                <span
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.3vw",
                    color: c.footerColor,
                    fontWeight: 600,
                  }}
                >
                  {c.footer}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Storage banner */}
        <div style={{
          marginTop: "1.8vh",
          borderTop: "1px solid rgba(52,211,153,0.18)",
          paddingTop: "1.2vh",
          display: "flex",
          alignItems: "center",
          gap: "1.2vw",
        }}>
          <span style={{
            fontFamily: "var(--font-body-family)", fontSize: "1.15vw",
            color: "rgba(52,211,153,0.65)", lineHeight: 1.4,
          }}> </span>
        </div>
      </div>
      <div
        className="absolute bottom-[3.5vh] right-[3.5vw]"
        style={{
          fontFamily: "var(--font-display-family)",
          color: "#3D4160",
          fontSize: "1.5vw",
          fontWeight: 600,
        }}
      >
        04 / 15
      </div>
    </div>
  );
}
