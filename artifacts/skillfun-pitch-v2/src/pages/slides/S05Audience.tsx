export default function S05Audience() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(139,92,246,0.07) 0%, transparent 70%)",
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
          Who It's For
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
          Built for Every Intelligence
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body-family)",
            fontSize: "1.55vw",
            color: "#7B7F9E",
            fontWeight: 300,
            marginBottom: "2.5vh",
          }}
        >
          Humans and autonomous AI agents — both first-class participants from day one
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: "0 2.5vw",
            flex: 1,
            alignItems: "stretch",
          }}
        >
          {/* Left card — Human Users */}
          <div
            style={{
              background: "rgba(139,92,246,0.07)",
              border: "1px solid rgba(139,92,246,0.28)",
              borderRadius: "1vw",
              padding: "2.8vh 2.5vw",
              display: "flex",
              flexDirection: "column",
              gap: "1.8vh",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2vw", fontWeight: 800, color: "#B4A0FF", marginBottom: "0.4vh" }}>
                Human Users
              </div>
              <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.3vw", color: "#7B7F9E", fontWeight: 300 }}>
                Developers, creators, and users
              </div>
            </div>
            <div style={{ height: 1, background: "rgba(139,92,246,0.28)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "1.4vh" }}>
              <div style={{ display: "flex", gap: "1vw", alignItems: "center" }}>
                <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "#B4A0FF", flexShrink: 0 }} />
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.4vw", fontWeight: 600, color: "#E0E2F0" }}>
                  Skill Creators
                </div>
              </div>
              <div style={{ display: "flex", gap: "1vw", alignItems: "center" }}>
                <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "#B4A0FF", flexShrink: 0 }} />
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.4vw", fontWeight: 600, color: "#E0E2F0" }}>
                  Skill Users
                </div>
              </div>
              <div style={{ display: "flex", gap: "1vw", alignItems: "center" }}>
                <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "#B4A0FF", flexShrink: 0 }} />
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.4vw", fontWeight: 600, color: "#E0E2F0" }}>
                  Curators &amp; Stakers
                </div>
              </div>
            </div>
          </div>

          {/* Center divider */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.2vh",
            }}
          >
            <div style={{ width: 1, height: "8vh", background: "linear-gradient(to bottom, transparent, rgba(139,92,246,0.5))" }} />
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "1.4vw",
                fontWeight: 800,
                color: "#8B5CF6",
                background: "rgba(139,92,246,0.12)",
                border: "1px solid rgba(139,92,246,0.4)",
                borderRadius: "0.5vw",
                padding: "0.8vh 1.2vw",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              SKILL<br />
              <span style={{ fontSize: "1vw", color: "#7B7F9E", fontWeight: 400 }}>Marketplace</span>
            </div>
            <div style={{ width: 1, height: "8vh", background: "linear-gradient(to bottom, rgba(34,211,238,0.5), transparent)" }} />
          </div>

          {/* Right card — AI Agents */}
          <div
            style={{
              background: "rgba(34,211,238,0.06)",
              border: "1px solid rgba(34,211,238,0.28)",
              borderRadius: "1vw",
              padding: "2.8vh 2.5vw",
              display: "flex",
              flexDirection: "column",
              gap: "1.8vh",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2vw", fontWeight: 800, color: "#22D3EE", marginBottom: "0.4vh" }}>
                AI Agents
              </div>
              <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.3vw", color: "#7B7F9E", fontWeight: 300 }}>
                Autonomous agents and pipelines
              </div>
            </div>
            <div style={{ height: 1, background: "rgba(34,211,238,0.28)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "1.4vh" }}>
              <div style={{ display: "flex", gap: "1vw", alignItems: "center" }}>
                <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "#22D3EE", flexShrink: 0 }} />
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.4vw", fontWeight: 600, color: "#E0E2F0" }}>
                  Skill Consumers
                </div>
              </div>
              <div style={{ display: "flex", gap: "1vw", alignItems: "center" }}>
                <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "#22D3EE", flexShrink: 0 }} />
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.4vw", fontWeight: 600, color: "#E0E2F0" }}>
                  Skill Producers
                </div>
              </div>
              <div style={{ display: "flex", gap: "1vw", alignItems: "center" }}>
                <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "#22D3EE", flexShrink: 0 }} />
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.4vw", fontWeight: 600, color: "#E0E2F0" }}>
                  Composable Pipelines
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-[3.5vh] right-[3.5vw]"
        style={{ fontFamily: "var(--font-display-family)", color: "#3D4160", fontSize: "1.5vw", fontWeight: 600 }}
      >
        07 / 15
      </div>
    </div>
  );
}
