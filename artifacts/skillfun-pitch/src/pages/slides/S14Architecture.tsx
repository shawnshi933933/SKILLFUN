export default function S14Architecture() {
  const proto = (
    color: string,
    bg: string,
    border: string,
    text: string,
  ) => (
    <span
      style={{
        fontFamily: "var(--font-body-family)",
        fontSize: "0.72vw",
        fontWeight: 700,
        color,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "0.25vw",
        padding: "0.1vh 0.4vw",
        letterSpacing: "0.06em",
        whiteSpace: "nowrap" as const,
      }}
    >
      {text}
    </span>
  );

  const roleBadge = (label: string, color: string) => (
    <span
      style={{
        fontFamily: "var(--font-body-family)",
        fontSize: "0.68vw",
        fontWeight: 600,
        color,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        borderRadius: "0.25vw",
        padding: "0.05vh 0.35vw",
        letterSpacing: "0.06em",
      }}
    >
      {label}
    </span>
  );

  const nfts = [
    { name: "NLP",       cx: 120 },
    { name: "Vision",    cx: 240 },
    { name: "Code",      cx: 355 },
    { name: "Search",    cx: 520 },
    { name: "Reason",    cx: 725 },
    { name: "Plan",      cx: 900 },
    { name: "Translate", cx: 1020 },
    { name: "Draw",      cx: 1140 },
  ];

  // pixel y positions (viewBox 1280×720)
  const agentCY   = 155;
  const mcpTop    = 240;
  const mcpBot    = 280;
  const bndTop    = 330;
  const bndBot    = 438;
  const nftY      = 495;
  const rolesY    = 545;
  // bundle center-x
  const bndCX     = [240, 640, 1040];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 80% 55% at 50% 30%, rgba(139,92,246,0.07) 0%, transparent 65%)",
      }}
    >
      {/* Decorative */}
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div
        className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }}
      />

      {/* Header */}
      <div style={{ position: "absolute", top: "3vh", left: "6vw" }}>
        <span
          style={{
            fontFamily: "var(--font-body-family)",
            color: "#22D3EE",
            fontSize: "1.2vw",
            fontWeight: 400,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
          }}
        >
          System Architecture
        </span>
      </div>
      <div style={{ position: "absolute", top: "7.2vh", left: "6vw" }}>
        <span
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "2.5vw",
            fontWeight: 800,
            color: "#F0F0F8",
            letterSpacing: "-0.02em",
          }}
        >
          Five roles. Three protocols.{" "}
          <span style={{ color: "#8B5CF6" }}>One market.</span>
        </span>
      </div>

      {/* ─── SVG LINES ─── */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
        viewBox="0 0 1280 720"
        preserveAspectRatio="none"
      >
        <defs>
          <marker id="a-teal" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polygon points="0,0 6,3 0,6" fill="#22D3EE" />
          </marker>
          <marker id="a-purple" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polygon points="0,0 6,3 0,6" fill="#A78BFA" />
          </marker>
          <marker id="a-amber" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polygon points="0,0 6,3 0,6" fill="#FCD34D" />
          </marker>
          <marker id="a-lav" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polygon points="0,0 6,3 0,6" fill="#B4A0FF" />
          </marker>
        </defs>

        {/* Agent → MCP  (MCP invoke, going down) */}
        <line x1="645" y1={agentCY + 36} x2="645" y2={mcpTop}
          stroke="#22D3EE" strokeWidth="1.5" strokeDasharray="4 2"
          markerEnd="url(#a-teal)" />

        {/* MCP → Agent  (ERC-8183 distribute, going up) */}
        <line x1="633" y1={mcpTop} x2="633" y2={agentCY + 36}
          stroke="rgba(167,139,250,0.65)" strokeWidth="1.2" strokeDasharray="3 3"
          markerEnd="url(#a-purple)" />

        {/* MCP → each Bundle */}
        {bndCX.map((cx) => (
          <line key={cx}
            x1={cx} y1={mcpBot} x2={cx} y2={bndTop}
            stroke="rgba(180,160,255,0.55)" strokeWidth="1.5"
            markerEnd="url(#a-lav)" />
        ))}

        {/* Bundle 1 → NFTs 1-3 */}
        {[120, 240, 355].map((nx) => (
          <line key={nx}
            x1={bndCX[0]} y1={bndBot} x2={nx} y2={nftY - 13}
            stroke="rgba(139,92,246,0.35)" strokeWidth="1" />
        ))}

        {/* Bundle 2 → NFTs 4-5 */}
        {[520, 725].map((nx) => (
          <line key={nx}
            x1={bndCX[1]} y1={bndBot} x2={nx} y2={nftY - 13}
            stroke="rgba(139,92,246,0.35)" strokeWidth="1" />
        ))}

        {/* Bundle 3 → NFTs 6-8 */}
        {[900, 1020, 1140].map((nx) => (
          <line key={nx}
            x1={bndCX[2]} y1={bndBot} x2={nx} y2={nftY - 13}
            stroke="rgba(139,92,246,0.35)" strokeWidth="1" />
        ))}

        {/* Staker stakes into Bundle 3 from right */}
        <line
          x1="1235" y1="384" x2="1172" y2="384"
          stroke="rgba(34,211,238,0.45)" strokeWidth="1.3"
          strokeDasharray="4 2"
          markerEnd="url(#a-teal)"
        />

        {/* Staker stakes into Bundle 1 from left */}
        <line
          x1="45" y1="384" x2="108" y2="384"
          stroke="rgba(34,211,238,0.45)" strokeWidth="1.3"
          strokeDasharray="4 2"
          markerEnd="url(#a-teal)"
        />

        {/* Closed loop: Agent memory → right curve → Mint new NFT */}
        <path
          d="M 686 148 C 1260 148, 1260 504, 1185 504"
          fill="none"
          stroke="rgba(167,139,250,0.55)"
          strokeWidth="1.5"
          strokeDasharray="6 3"
          markerEnd="url(#a-purple)"
        />

        {/* x402 label line (short tick on right of Agent-MCP arrow) */}
        <line x1="660" y1="196" x2="710" y2="196"
          stroke="rgba(252,211,77,0.5)" strokeWidth="1"
          markerEnd="url(#a-amber)" />

        {/* ERC-8183 label line (short tick left of distribute arrow) */}
        <line x1="618" y1="263" x2="568" y2="263"
          stroke="rgba(167,139,250,0.5)" strokeWidth="1" />
      </svg>

      {/* ─── AGENT ─── */}
      <div
        style={{
          position: "absolute",
          top: "13.8vh",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.35vh",
        }}
      >
        <div
          style={{
            width: "5vw",
            height: "5vw",
            borderRadius: "50%",
            background: "rgba(34,211,238,0.10)",
            border: "1.5px solid rgba(34,211,238,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.1vw",
            boxShadow: "0 0 2vw rgba(34,211,238,0.22)",
          }}
        >
          🤖
        </div>
        <div
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "0.9vw",
            fontWeight: 700,
            color: "#22D3EE",
            letterSpacing: "0.1em",
          }}
        >
          AI AGENT
        </div>
        <div style={{ display: "flex", gap: "0.35vw" }}>
          {proto("#22D3EE", "rgba(34,211,238,0.10)", "rgba(34,211,238,0.35)", "MCP")}
          {proto("#FCD34D", "rgba(252,211,77,0.10)", "rgba(252,211,77,0.35)", "x402")}
        </div>
      </div>

      {/* x402 pay label beside Agent-MCP line */}
      <div
        style={{
          position: "absolute",
          top: "26vh",
          left: "56vw",
          fontFamily: "var(--font-body-family)",
          fontSize: "0.72vw",
          color: "#FCD34D",
          fontWeight: 600,
        }}
      >
        pay
      </div>

      {/* ERC-8183 distribute label — sits just above the MCP bar on the left of center */}
      <div
        style={{
          position: "absolute",
          top: "30.5vh",
          left: "42vw",
          fontFamily: "var(--font-body-family)",
          fontSize: "0.7vw",
          color: "rgba(167,139,250,0.75)",
          fontWeight: 600,
        }}
      >
        ↑ distribute
      </div>

      {/* ─── MCP SERVER BAR ─── */}
      <div
        style={{
          position: "absolute",
          top: "33.3vh",
          left: "6.25vw",
          right: "6.25vw",
          height: "5.5vh",
          background: "rgba(34,211,238,0.07)",
          border: "1px solid rgba(34,211,238,0.28)",
          borderRadius: "0.7vw",
          display: "flex",
          alignItems: "center",
          paddingLeft: "1.8vw",
          paddingRight: "1.8vw",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          {proto("#22D3EE", "rgba(34,211,238,0.15)", "rgba(34,211,238,0.4)", "MCP")}
          <span
            style={{
              fontFamily: "var(--font-display-family)",
              fontSize: "1.1vw",
              fontWeight: 700,
              color: "#22D3EE",
            }}
          >
            SkillFun MCP Server
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5vw" }}>
          {proto("#A78BFA", "rgba(167,139,250,0.10)", "rgba(167,139,250,0.30)", "ERC-8183")}
          <span
            style={{
              fontFamily: "var(--font-body-family)",
              fontSize: "0.8vw",
              color: "rgba(167,139,250,0.65)",
            }}
          >
            revenue split
          </span>
        </div>
      </div>

      {/* ─── BUNDLES ─── */}
      {[
        { name: "Bundle A", left: "6.25vw",  nftRange: "NLP · Vision · Code" },
        { name: "Bundle B", left: "37.5vw",  nftRange: "Search · Reason"     },
        { name: "Bundle C", left: "68.75vw", nftRange: "Plan · Translate · Draw" },
      ].map((b) => (
        <div
          key={b.name}
          style={{
            position: "absolute",
            top: "45.8vh",
            left: b.left,
            width: "24.2vw",
            height: "15.3vh",
            background: "rgba(180,160,255,0.07)",
            border: "1px solid rgba(180,160,255,0.22)",
            borderRadius: "0.7vw",
            padding: "1.1vh 1.2vw",
            display: "grid",
            gridTemplateRows: "auto 1fr auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5vw", marginBottom: "0.4vh" }}>
            {proto("#B4A0FF", "rgba(180,160,255,0.12)", "rgba(180,160,255,0.35)", "BUNDLE")}
            <span
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "1vw",
                fontWeight: 700,
                color: "#E2D9FF",
              }}
            >
              {b.name}
            </span>
          </div>
          <div
            style={{
              fontFamily: "var(--font-body-family)",
              fontSize: "0.75vw",
              color: "rgba(180,160,255,0.5)",
              alignSelf: "center",
            }}
          >
            {b.nftRange}
          </div>
          <div style={{ display: "flex", gap: "0.4vw" }}>
            {roleBadge("Curator", "#B4A0FF")}
            {roleBadge("Staker", "#22D3EE")}
          </div>
        </div>
      ))}

      {/* Staker arrows labels (left + right) */}
      <div
        style={{
          position: "absolute",
          top: "52vh",
          left: "1.2vw",
          fontFamily: "var(--font-body-family)",
          fontSize: "0.7vw",
          color: "rgba(34,211,238,0.7)",
          fontWeight: 600,
          writingMode: "vertical-rl" as const,
          transform: "rotate(180deg)",
        }}
      >
        STAKER
      </div>
      <div
        style={{
          position: "absolute",
          top: "52vh",
          right: "1.2vw",
          fontFamily: "var(--font-body-family)",
          fontSize: "0.7vw",
          color: "rgba(34,211,238,0.7)",
          fontWeight: 600,
          writingMode: "vertical-rl" as const,
        }}
      >
        STAKER
      </div>

      {/* ─── NFT CHIPS ─── */}
      {nfts.map((nft) => {
        const leftPct = ((nft.cx - 40) / 1280) * 100;
        return (
          <div
            key={nft.name}
            style={{
              position: "absolute",
              top: "68.3vh",
              left: `${leftPct}%`,
              width: "6.25vw",
              background: "rgba(139,92,246,0.14)",
              border: "1px solid rgba(139,92,246,0.38)",
              borderRadius: "0.35vw",
              padding: "0.3vh 0.45vw",
              fontFamily: "var(--font-display-family)",
              fontSize: "0.8vw",
              fontWeight: 700,
              color: "#C4B5FD",
              textAlign: "center" as const,
              whiteSpace: "nowrap" as const,
            }}
          >
            {nft.name}
          </div>
        );
      })}

      {/* ─── ROLE ROW BELOW NFTs ─── */}
      <div
        style={{
          position: "absolute",
          top: "75.5vh",
          left: "6.25vw",
          display: "flex",
          alignItems: "center",
          gap: "0.5vw",
        }}
      >
        {roleBadge("Creator", "#9CA3AF")}
        {roleBadge("Owner", "#9CA3AF")}
        <span
          style={{
            marginLeft: "0.2vw",
            fontFamily: "var(--font-body-family)",
            fontSize: "0.68vw",
            fontWeight: 700,
            color: "#8B5CF6",
            background: "rgba(139,92,246,0.10)",
            border: "1px solid rgba(139,92,246,0.28)",
            borderRadius: "0.25vw",
            padding: "0.05vh 0.4vw",
            letterSpacing: "0.06em",
          }}
        >
          ERC-8239
        </span>
      </div>

      {/* ─── CLOSED LOOP label top-right ─── */}
      <div
        style={{
          position: "absolute",
          top: "17.5vh",
          right: "3.5vw",
          textAlign: "right",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-body-family)",
            fontSize: "0.75vw",
            color: "rgba(167,139,250,0.55)",
            lineHeight: 1.7,
          }}
        >
          Memory → extract Skill
        </div>
        <div
          style={{
            fontFamily: "var(--font-body-family)",
            fontSize: "0.78vw",
            fontWeight: 700,
            color: "#A78BFA",
          }}
        >
          ↺ Mint new Skill NFT
        </div>
      </div>

      {/* ─── CLOSED LOOP end-tag ─── */}
      <div
        style={{
          position: "absolute",
          top: "74.5vh",
          right: "3.2vw",
          background: "rgba(139,92,246,0.12)",
          border: "1px solid rgba(139,92,246,0.32)",
          borderRadius: "0.35vw",
          padding: "0.25vh 0.55vw",
          fontFamily: "var(--font-body-family)",
          fontSize: "0.75vw",
          color: "#A78BFA",
          fontWeight: 600,
        }}
      >
        Agent becomes Creator
      </div>

      {/* Page number */}
      <div
        className="absolute bottom-[3.5vh] right-[3.5vw]"
        style={{
          fontFamily: "var(--font-display-family)",
          color: "#3D4160",
          fontSize: "1.5vw",
          fontWeight: 600,
        }}
      >
        16 / 16
      </div>
    </div>
  );
}
