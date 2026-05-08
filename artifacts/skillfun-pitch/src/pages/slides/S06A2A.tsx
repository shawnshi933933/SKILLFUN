function Tag({ label, color }: { label: string; color: "purple" | "teal" | "amber" | "muted" }) {
  const styles: Record<string, React.CSSProperties> = {
    purple: { color: "#C4B5FD", background: "rgba(139,92,246,0.18)", border: "1px solid rgba(139,92,246,0.45)" },
    teal:   { color: "#22D3EE", background: "rgba(34,211,238,0.12)",  border: "1px solid rgba(34,211,238,0.4)" },
    amber:  { color: "#FCD34D", background: "rgba(252,211,77,0.1)",   border: "1px solid rgba(252,211,77,0.35)" },
    muted:  { color: "#7B7F9E", background: "rgba(123,127,158,0.1)",  border: "1px solid rgba(123,127,158,0.3)" },
  };
  return (
    <span style={{
      fontFamily: "var(--font-body-family)",
      fontSize: "1.05vw",
      fontWeight: 600,
      borderRadius: "0.3vw",
      padding: "0.15vh 0.55vw",
      letterSpacing: "0.04em",
      whiteSpace: "nowrap",
      ...styles[color],
    }}>
      {label}
    </span>
  );
}

const steps = [
  {
    n: 1,
    from: "A",
    to: "S",
    label: "Authenticate with on-chain agent identity",
    tags: [{ label: "ERC-8004", color: "purple" as const }],
  },
  {
    n: 2,
    from: "A",
    to: "S",
    label: "Mint SKILL NFT — price, license terms & royalty split embedded on-chain",
    tags: [{ label: "ERC-8239", color: "purple" as const }],
  },
  {
    n: 3,
    from: "B",
    to: "S",
    label: "Discover skill via MCP tool query — metadata fetched autonomously",
    tags: [{ label: "MCP", color: "muted" as const }],
  },
  {
    n: 4,
    from: "B",
    to: "S",
    label: "Submit x402 HTTP payment to acquire invocation rights — no subscription, no off-chain settlement",
    tags: [{ label: "x402", color: "teal" as const }],
  },
  {
    n: 5,
    from: "S",
    to: "chain",
    label: "Settlement contract executes — royalty split distributed to creator instantly",
    tags: [{ label: "ERC-8183", color: "teal" as const }],
  },
  {
    n: 6,
    from: "S",
    to: "B",
    label: "License transferred on-chain — Agent B gains call rights, no approval needed",
    tags: [{ label: "ERC-8239", color: "purple" as const }],
  },
];

export default function S06A2A() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(139,92,246,0.07) 0%, transparent 70%)",
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div
        className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }}
      />

      <div
        className="absolute inset-0 flex flex-col"
        style={{ paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "3vh", paddingBottom: "3.5vh" }}
      >
        <span
          style={{
            fontFamily: "var(--font-body-family)",
            color: "#22D3EE",
            fontSize: "1.4vw",
            fontWeight: 400,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            marginBottom: "0.5vh",
          }}
        >
          Live Scenario
        </span>
        <h2
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "3.5vw",
            fontWeight: 800,
            color: "#F0F0F8",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            marginBottom: "0.4vh",
          }}
        >
          Zero-Human Transaction
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body-family)",
            fontSize: "1.55vw",
            color: "#7B7F9E",
            fontWeight: 300,
            marginBottom: "2vh",
          }}
        >
          Agent A has already minted and listed a SKILL NFT — the flow below shows a complete A2A discovery-to-purchase transaction
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "1.8vh" }}>
          {[
            { label: "Human → Skill", active: false },
            { label: "Developer API", active: false },
            { label: "Agent → Agent", active: true },
          ].map(({ label, active }) => (
            <div
              key={label}
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.2vw",
                fontWeight: active ? 600 : 400,
                color: active ? "#22D3EE" : "#3D4160",
                background: active ? "rgba(34,211,238,0.10)" : "rgba(255,255,255,0.03)",
                border: active ? "1px solid rgba(34,211,238,0.4)" : "1px solid rgba(255,255,255,0.07)",
                borderRadius: "0.4vw",
                padding: "0.4vh 1.2vw",
                whiteSpace: "nowrap",
              }}
            >
              {active && <span style={{ marginRight: "0.4vw", color: "#22D3EE" }}>▶</span>}
              {label}
            </div>
          ))}
          <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.1vw", color: "#3D4160", marginLeft: "0.5vw" }}>
            — scenario shown below
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 1.5vw", marginBottom: "1.8vh" }}>
          {[
            { label: "Agent A", sub: "Skill Creator", accent: "#B4A0FF", border: "rgba(139,92,246,0.3)", bg: "rgba(139,92,246,0.08)" },
            { label: "SkillFun", sub: "Protocol Layer", accent: "#8B5CF6", border: "rgba(139,92,246,0.6)", bg: "rgba(139,92,246,0.18)" },
            { label: "Agent B", sub: "Skill Buyer", accent: "#22D3EE", border: "rgba(34,211,238,0.3)", bg: "rgba(34,211,238,0.07)" },
          ].map((p) => (
            <div
              key={p.label}
              style={{
                background: p.bg,
                border: `1px solid ${p.border}`,
                borderRadius: "0.6vw",
                padding: "1vh 1.5vw",
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: "var(--font-display-family)", color: p.accent, fontSize: "1.6vw", fontWeight: 700 }}>
                {p.label}
              </div>
              <div style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.1vw" }}>{p.sub}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col" style={{ flex: 1, justifyContent: "space-between" }}>
          {steps.map((step) => {
            const arrowLeft = step.from === "A" || (step.from === "S" && step.to === "B");
            const toRight = step.from === "A" || (step.from === "B" && step.to === "S");
            const colSpan = step.to === "chain" ? "1 / -1" : undefined;

            const fromCol = step.from === "A" ? 0 : step.from === "S" ? 1 : 2;
            const toCol   = step.to === "S"   ? 1 : step.to === "B" ? 2 : step.to === "chain" ? 2 : 0;
            const spanStart = Math.min(fromCol, toCol) + 1;
            const spanEnd   = Math.max(fromCol, toCol) + 2;

            const isRight = step.from !== "A" && !(step.from === "S" && step.to === "B");

            return (
              <div
                key={step.n}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2vw 1fr",
                  alignItems: "center",
                  gap: "0 1.5vw",
                  background: "rgba(22,25,41,0.8)",
                  border: "1px solid rgba(240,240,248,0.07)",
                  borderRadius: "0.5vw",
                  padding: "0.8vh 2vw",
                }}
              >
                <div
                  style={{
                    width: "2vw",
                    height: "2vw",
                    borderRadius: "50%",
                    background: "rgba(139,92,246,0.2)",
                    border: "1px solid rgba(139,92,246,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-display-family)",
                    color: "#B4A0FF",
                    fontSize: "1.1vw",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {step.n}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1.5vw", justifyContent: "space-between" }}>
                  <div style={{ fontFamily: "var(--font-body-family)", color: "#C8CADB", fontSize: "1.35vw", lineHeight: 1.35 }}>
                    {step.label}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6vw", flexShrink: 0 }}>
                    <span style={{
                      fontFamily: "var(--font-body-family)",
                      color: "#3D4160",
                      fontSize: "1.05vw",
                      whiteSpace: "nowrap",
                    }}>
                      {step.from === "A" ? "Agent A" : step.from === "B" ? "Agent B" : "SkillFun"}
                      {" → "}
                      {step.to === "S" ? "SkillFun" : step.to === "B" ? "Agent B" : step.to === "chain" ? "on-chain" : "Agent A"}
                    </span>
                    {step.tags.map((t) => <Tag key={t.label} {...t} />)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: "1.8vh",
            padding: "1.2vh 2.5vw",
            background: "rgba(34,211,238,0.06)",
            border: "1px solid rgba(34,211,238,0.25)",
            borderRadius: "0.6vw",
            textAlign: "center",
          }}
        >
          <span style={{
            fontFamily: "var(--font-display-family)",
            color: "#22D3EE",
            fontSize: "1.6vw",
            fontWeight: 700,
            letterSpacing: "0.01em",
          }}>
            In Agent-to-Agent mode — fully autonomous, zero human involvement required.
          </span>
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
        08 / 13
      </div>
    </div>
  );
}
