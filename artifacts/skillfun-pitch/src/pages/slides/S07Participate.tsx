export default function S07Participate() {
  const roles = [
    {
      tag: "CREATOR",
      tagColor: "#8B5CF6",
      tagBg: "rgba(139,92,246,0.22)",
      cardBg: "rgba(139,92,246,0.10)",
      cardBorder: "rgba(139,92,246,0.28)",
      dividerColor: "rgba(139,92,246,0.30)",
      earnColor: "#8B5CF6",
      title: "Skill Builders",
      body: "Developers who package expertise into callable Skills and mint them as ERC-8239 NFTs.",
      earn: "Royalties on every invocation",
      earnSub: "Creator:Owner split enforced on-chain",
    },
    {
      tag: "OWNER",
      tagColor: "#B4A0FF",
      tagBg: "rgba(180,160,255,0.18)",
      cardBg: "rgba(180,160,255,0.07)",
      cardBorder: "rgba(180,160,255,0.24)",
      dividerColor: "rgba(180,160,255,0.25)",
      earnColor: "#B4A0FF",
      title: "NFT Holders",
      body: "Anyone holding a Skill NFT. Sets the Base Price and the Creator:Owner revenue split.",
      earn: "Passive income + appreciation",
      earnSub: "Income per invocation + secondary-market upside",
    },
    {
      tag: "CURATOR",
      tagColor: "#9DA3C8",
      tagBg: "rgba(157,163,200,0.16)",
      cardBg: "rgba(157,163,200,0.06)",
      cardBorder: "rgba(157,163,200,0.20)",
      dividerColor: "rgba(157,163,200,0.22)",
      earnColor: "#9DA3C8",
      title: "Bundle Makers",
      body: "Curate Skills into Bundles — no ownership needed. Act as distributors, earn Markup on each call routed through their Bundle.",
      earn: "Markup share on every call",
      earnSub: "Sets Markup rate and Staker share",
    },
    {
      tag: "STAKER",
      tagColor: "#22D3EE",
      tagBg: "rgba(34,211,238,0.14)",
      cardBg: "rgba(34,211,238,0.07)",
      cardBorder: "rgba(34,211,238,0.22)",
      dividerColor: "rgba(34,211,238,0.24)",
      earnColor: "#22D3EE",
      title: "Quality Guarantors",
      body: "Stake platform tokens to Bundles they believe in. Stake signals quality and backs it with skin in the game.",
      earn: "Yield from Markup pool",
      earnSub: "Proportional to stake weight, slashed on misconduct",
    },
    {
      tag: "AGENT",
      tagColor: "#F0F0F8",
      tagBg: "rgba(240,240,248,0.10)",
      cardBg: "rgba(240,240,248,0.03)",
      cardBorder: "rgba(240,240,248,0.12)",
      dividerColor: "rgba(240,240,248,0.15)",
      earnColor: "#F0F0F8",
      title: "AI Consumers",
      body: "Autonomous agents that discover, license, and invoke Skills and Bundles via one SkillFun MCP endpoint.",
      earn: "Access entire marketplace",
      earnSub: "x402 payment grants call rights instantly",
    },
  ];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 65% 38% at 50% 105%, rgba(34,211,238,0.07) 0%, transparent 60%)"
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div
        className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }}
      />

      <div
        className="absolute inset-0 flex flex-col"
        style={{
          paddingLeft: "5vw",
          paddingRight: "5vw",
          paddingTop: "3.5vh",
          paddingBottom: "4.5vh",
          overflow: "hidden"
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <span
            style={{
              fontFamily: "var(--font-body-family)",
              color: "#22D3EE",
              fontSize: "1.3vw",
              fontWeight: 400,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              display: "block",
              marginBottom: "0.5vh"
            }}
          >
            Participants
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display-family)",
              fontSize: "3.4vw",
              fontWeight: 800,
              color: "#F0F0F8",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              marginBottom: "2vh"
            }}
          >
            Five Ways to Participate
          </h2>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            gap: "1vw",
            overflow: "hidden"
          }}
        >
          {roles.map((role) => (
            <div
              key={role.tag}
              style={{
                flex: "1 1 0",
                minWidth: 0,
                maxWidth: "20%",
                background: role.cardBg,
                borderRadius: "0.8vw",
                padding: "1.5vh 1.3vw",
                border: `1px solid ${role.cardBorder}`,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}
            >
              {/* Tag */}
              <div style={{ flexShrink: 0, marginBottom: "0.8vh" }}>
                <span
                  style={{
                    display: "inline-block",
                    background: role.tagBg,
                    borderRadius: "0.3vw",
                    padding: "0.2vh 0.6vw",
                    fontFamily: "var(--font-display-family)",
                    fontSize: "0.9vw",
                    fontWeight: 700,
                    color: role.tagColor,
                    letterSpacing: "0.06em"
                  }}
                >
                  {role.tag}
                </span>
              </div>

              {/* Title */}
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "1.6vw",
                  fontWeight: 800,
                  color: "#F0F0F8",
                  lineHeight: 1.1,
                  marginBottom: "0.9vh",
                  flexShrink: 0,
                  overflowWrap: "normal",
                  hyphens: "none"
                }}
              >
                {role.title}
              </div>

              {/* Body — fills space, clips overflow */}
              <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                <p
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.2vw",
                    color: "#7B7F9E",
                    lineHeight: 1.45,
                    margin: 0
                  }}
                >
                  {role.body}
                </p>
              </div>

              {/* Earn — fixed height so dividers line up */}
              <div
                style={{
                  flexShrink: 0,
                  height: "11vh",
                  paddingTop: "1.1vh",
                  overflow: "hidden"
                }}
              >
                <div style={{ height: 1, background: role.dividerColor, marginBottom: "0.9vh" }} />
                <div
                  style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "1.2vw",
                    fontWeight: 700,
                    color: role.earnColor,
                    lineHeight: 1.2,
                    wordBreak: "break-word"
                  }}
                >
                  {role.earn}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.0vw",
                    color: "#7B7F9E",
                    marginTop: "0.4vh",
                    lineHeight: 1.35
                  }}
                >
                  {role.earnSub}
                </div>
              </div>
            </div>
          ))}
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
        09 / 13
      </div>
    </div>
  );
}
