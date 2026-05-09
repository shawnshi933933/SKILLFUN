export default function S07Participate() {
  const roles = [
    {
      tag: "CREATOR",
      tagColor: "#8B5CF6",
      tagBg: "rgba(139,92,246,0.22)",
      cardBg: "rgba(139,92,246,0.10)",
      cardBorder: "rgba(139,92,246,0.28)",
      dividerColor: "rgba(139,92,246,0.24)",
      earnColor: "#8B5CF6",
      title: "Skill Builders",
      body: "Developers who package their expertise into callable Skills and mint them as ERC-8239 NFTs.",
      earn: "Royalties on every invocation",
      earnSub: "Configurable Creator:Owner split enforced on-chain via ERC-8239",
    },
    {
      tag: "OWNER",
      tagColor: "#B4A0FF",
      tagBg: "rgba(180,160,255,0.18)",
      cardBg: "rgba(180,160,255,0.07)",
      cardBorder: "rgba(180,160,255,0.24)",
      dividerColor: "rgba(180,160,255,0.20)",
      earnColor: "#B4A0FF",
      title: "NFT Holders",
      body: "Anyone holding a Skill NFT. Sets the Base Price and negotiates the Creator:Owner revenue split.",
      earn: "Passive income + NFT appreciation",
      earnSub: "Income on every invocation plus secondary-market upside as skill usage grows",
    },
    {
      tag: "CURATOR",
      tagColor: "#9DA3C8",
      tagBg: "rgba(157,163,200,0.16)",
      cardBg: "rgba(157,163,200,0.06)",
      cardBorder: "rgba(157,163,200,0.20)",
      dividerColor: "rgba(157,163,200,0.18)",
      earnColor: "#9DA3C8",
      title: "Bundle Makers",
      body: "Package multiple Skills into composite tools, write orchestration rules, and register them in the unified MCP endpoint.",
      earn: "Share of Markup on every Bundle call",
      earnSub: "Curator sets Markup rate and what share flows to Stakers — full control over the bundle economy",
    },
    {
      tag: "STAKER",
      tagColor: "#22D3EE",
      tagBg: "rgba(34,211,238,0.14)",
      cardBg: "rgba(34,211,238,0.07)",
      cardBorder: "rgba(34,211,238,0.22)",
      dividerColor: "rgba(34,211,238,0.20)",
      earnColor: "#22D3EE",
      title: "Quality Guarantors",
      body: "Stake platform tokens to Bundles they believe in. Their stake signals quality — and backs it with skin in the game.",
      earn: "Yield from Curator Markup pool",
      earnSub: "Proportional to stake weight — slashed if Bundle is reported and confirmed as misbehaving",
    },
    {
      tag: "AGENT",
      tagColor: "#F0F0F8",
      tagBg: "rgba(240,240,248,0.10)",
      cardBg: "rgba(240,240,248,0.03)",
      cardBorder: "rgba(240,240,248,0.12)",
      dividerColor: "rgba(240,240,248,0.12)",
      earnColor: "#F0F0F8",
      title: "AI Consumers",
      body: "Autonomous agents that discover, license, and invoke Skills and Bundles via the single SkillFun MCP endpoint.",
      earn: "Access the entire marketplace",
      earnSub: "One MCP URL — x402 payment grants call rights instantly, no subscriptions or off-chain rails",
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
        style={{ paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "4vh", paddingBottom: "4.5vh" }}
      >
        <span
          style={{
            fontFamily: "var(--font-body-family)",
            color: "#22D3EE",
            fontSize: "1.4vw",
            fontWeight: 400,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            marginBottom: "0.8vh"
          }}
        >
          Participants
        </span>
        <h2
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "3.8vw",
            fontWeight: 800,
            color: "#F0F0F8",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            marginBottom: "3vh"
          }}
        >
          Five Ways to Participate
        </h2>

        <div className="flex gap-[1.8vw]" style={{ flex: 1 }}>
          {roles.map((role) => (
            <div
              key={role.tag}
              className="flex flex-col"
              style={{
                flex: 1,
                background: role.cardBg,
                borderRadius: "1vw",
                padding: "2.2vh 2vw",
                border: `1px solid ${role.cardBorder}`
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  background: role.tagBg,
                  borderRadius: "0.4vw",
                  padding: "0.4vh 1vw",
                  marginBottom: "1.5vh",
                  width: "fit-content"
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "1.1vw",
                    fontWeight: 700,
                    color: role.tagColor,
                    letterSpacing: "0.06em"
                  }}
                >
                  {role.tag}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "2vw",
                  fontWeight: 800,
                  color: "#F0F0F8",
                  lineHeight: 1.1,
                  marginBottom: "1.2vh"
                }}
              >
                {role.title}
              </div>
              <p
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.45vw",
                  color: "#7B7F9E",
                  lineHeight: 1.45
                }}
              >
                {role.body}
              </p>
              <div style={{ marginTop: "auto", paddingTop: "2vh" }}>
                <div style={{ height: 1, background: role.dividerColor, marginBottom: "1.4vh" }} />
                <div
                  style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "1.5vw",
                    fontWeight: 700,
                    color: role.earnColor
                  }}
                >
                  {role.earn}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.25vw",
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
