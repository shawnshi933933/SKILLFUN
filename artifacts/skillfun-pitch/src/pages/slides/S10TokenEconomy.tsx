export default function S10TokenEconomy() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 50% 55% at 14% 52%, rgba(139,92,246,0.08) 0%, transparent 60%)"
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
            marginBottom: "1vh"
          }}
        >
          Business Model
        </span>
        <h2
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "4.2vw",
            fontWeight: 800,
            color: "#F0F0F8",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            marginBottom: "2.5vh"
          }}
        >
          Token Economy
        </h2>

        <div className="flex gap-[3vw]" style={{ flex: 1 }}>
          {/* Left — Two-tier fee split */}
          <div className="flex flex-col gap-[2vh]" style={{ width: "52vw" }}>

            {/* Tier 1 — Base Price */}
            <div
              style={{
                background: "rgba(22,25,41,0.8)",
                borderRadius: "0.8vw",
                padding: "2.2vh 2.5vw",
                border: "1px solid rgba(139,92,246,0.22)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "1.8vh" }}>
                <div
                  style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "1.2vw",
                    fontWeight: 700,
                    color: "#7B7F9E",
                    letterSpacing: "0.08em"
                  }}
                >
                  TIER 1 — BASE PRICE SPLIT
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.1vw",
                    color: "#8B5CF6",
                    background: "rgba(139,92,246,0.12)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    borderRadius: "0.3vw",
                    padding: "0.1vh 0.6vw"
                  }}
                >
                  Owner-configured
                </div>
              </div>
              <div className="flex items-end gap-[2.5vw]">
                <div className="text-center">
                  <div style={{ fontFamily: "var(--font-display-family)", fontSize: "3.5vw", fontWeight: 800, color: "#8B5CF6", lineHeight: 1 }}>
                    60<span style={{ fontSize: "2.4vw" }}>%</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.5vw", color: "#B0B4D0", marginTop: "0.4vh" }}>Creator</div>
                </div>
                <div style={{ height: "4vh", width: 1, background: "rgba(240,240,248,0.10)" }} />
                <div className="text-center">
                  <div style={{ fontFamily: "var(--font-display-family)", fontSize: "3.5vw", fontWeight: 800, color: "#B4A0FF", lineHeight: 1 }}>
                    30<span style={{ fontSize: "2.4vw" }}>%</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.5vw", color: "#B0B4D0", marginTop: "0.4vh" }}>Owner</div>
                </div>
                <div style={{ height: "4vh", width: 1, background: "rgba(240,240,248,0.10)" }} />
                <div className="text-center">
                  <div style={{ fontFamily: "var(--font-display-family)", fontSize: "3.5vw", fontWeight: 800, color: "#22D3EE", lineHeight: 1 }}>
                    10%
                  </div>
                  <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.5vw", color: "#B0B4D0", marginTop: "0.4vh" }}>Platform</div>
                </div>
              </div>
            </div>

            {/* Tier 2 — Markup */}
            <div
              style={{
                background: "rgba(22,25,41,0.8)",
                borderRadius: "0.8vw",
                padding: "2.2vh 2.5vw",
                border: "1px solid rgba(34,211,238,0.18)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "1.8vh" }}>
                <div
                  style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "1.2vw",
                    fontWeight: 700,
                    color: "#7B7F9E",
                    letterSpacing: "0.08em"
                  }}
                >
                  TIER 2 — MARKUP SPLIT
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.1vw",
                    color: "#22D3EE",
                    background: "rgba(34,211,238,0.10)",
                    border: "1px solid rgba(34,211,238,0.28)",
                    borderRadius: "0.3vw",
                    padding: "0.1vh 0.6vw"
                  }}
                >
                  Curator-configured
                </div>
              </div>
              <div className="flex items-end gap-[2.5vw]">
                <div className="text-center">
                  <div style={{ fontFamily: "var(--font-display-family)", fontSize: "3.5vw", fontWeight: 800, color: "#9DA3C8", lineHeight: 1 }}>
                    50<span style={{ fontSize: "2.4vw" }}>%</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.5vw", color: "#B0B4D0", marginTop: "0.4vh" }}>Curator</div>
                </div>
                <div style={{ height: "4vh", width: 1, background: "rgba(240,240,248,0.10)" }} />
                <div className="text-center">
                  <div style={{ fontFamily: "var(--font-display-family)", fontSize: "3.5vw", fontWeight: 800, color: "#22D3EE", lineHeight: 1 }}>
                    50<span style={{ fontSize: "2.4vw" }}>%</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.5vw", color: "#B0B4D0", marginTop: "0.4vh" }}>Staker Pool</div>
                </div>
                <div style={{ marginLeft: "1vw" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-body-family)",
                      fontSize: "1.35vw",
                      color: "#7B7F9E",
                      lineHeight: 1.45,
                      maxWidth: "16vw"
                    }}
                  >
                    Stakers claim yield proportional to stake weight. Stake slashed on confirmed Bundle misconduct.
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right — Token Utility */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                background: "rgba(22,25,41,0.8)",
                borderRadius: "0.8vw",
                padding: "2.8vh 2.5vw",
                border: "1px solid rgba(240,240,248,0.08)",
                height: "100%"
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "1.2vw",
                  fontWeight: 700,
                  color: "#7B7F9E",
                  letterSpacing: "0.08em",
                  marginBottom: "2vh"
                }}
              >
                SKILL TOKEN UTILITY
              </div>
              <div className="flex flex-col gap-[1.8vh]">
                {[
                  { dot: "#8B5CF6", text: "Stake to Bundles — earn yield from Curator Markup pool" },
                  { dot: "#22D3EE", text: "Slash-enforced quality: stake lost on confirmed misconduct" },
                  { dot: "#B4A0FF", text: "Governance over protocol fee parameters" },
                  { dot: "#9DA3C8", text: "Discounted minting fees for token holders" },
                  { dot: "#7B7F9E", text: "Required collateral for Curator Bundle registration" },
                ].map((item) => (
                  <div key={item.text} style={{ display: "flex", alignItems: "flex-start", gap: "1.2vw" }}>
                    <div
                      style={{
                        width: "0.45vw",
                        height: "0.45vw",
                        background: item.dot,
                        borderRadius: "50%",
                        marginTop: "0.9vh",
                        flexShrink: 0
                      }}
                    />
                    <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.7vw", color: "#B0B4D0", lineHeight: 1.4 }}>
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>
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
        12 / 13
      </div>
    </div>
  );
}
