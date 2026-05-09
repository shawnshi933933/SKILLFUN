export default function S10TokenEconomy() {
  const pct = (val: string, color: string, sub?: string) => (
    <div style={{ flex: 1, textAlign: "center" }}>
      {sub && <div style={{ fontFamily: "var(--font-body-family)", fontSize: "0.95vw", color: "#7B7F9E", marginBottom: "0.25vh", letterSpacing: "0.05em" }}>{sub}</div>}
      <div style={{ fontFamily: "var(--font-display-family)", fontSize: "3.2vw", fontWeight: 800, color, lineHeight: 1 }}>
        {val}
      </div>
    </div>
  );

  const divider = () => (
    <div style={{ height: "4vh", width: 1, background: "rgba(240,240,248,0.10)", flexShrink: 0 }} />
  );

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage: "radial-gradient(ellipse 50% 55% at 14% 52%, rgba(139,92,246,0.08) 0%, transparent 60%)"
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }} />

      <div
        className="absolute inset-0 flex flex-col"
        style={{ paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "5vh", paddingBottom: "5vh" }}
      >
        <span style={{ fontFamily: "var(--font-body-family)", color: "#22D3EE", fontSize: "1.4vw", fontWeight: 400, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: "1vh" }}>
          Business Model
        </span>
        <h2 style={{ fontFamily: "var(--font-display-family)", fontSize: "4.2vw", fontWeight: 800, color: "#F0F0F8", letterSpacing: "-0.02em", lineHeight: 1.05, marginBottom: "2vh" }}>
          Token Economy
        </h2>

        <div className="flex gap-[3vw]" style={{ flex: 1 }}>

          {/* ── Left: fee structure ── */}
          <div className="flex flex-col gap-[1.6vh]" style={{ width: "47vw", flexShrink: 0 }}>

            {/* Formula row */}
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.2vw", color: "#7B7F9E", letterSpacing: "0.04em" }}>
              Total Payment&nbsp;
              <span style={{ color: "#F0F0F8", fontWeight: 600 }}>=</span>
              &nbsp;<span style={{ color: "#8B5CF6", fontWeight: 600 }}>Base Price</span>
              &nbsp;<span style={{ color: "#F0F0F8" }}>+</span>
              &nbsp;<span style={{ color: "#22D3EE", fontWeight: 600 }}>Curator Markup</span>
            </div>

            {/* Platform global deduction — full-width banner */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.4vw", background: "rgba(34,211,238,0.07)", border: "1px solid rgba(34,211,238,0.22)", borderRadius: "0.7vw", padding: "1.1vh 1.8vw" }}>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.8vw", fontWeight: 900, color: "#22D3EE", lineHeight: 1, flexShrink: 0 }}>
                10<span style={{ fontSize: "1.9vw" }}>%</span>
              </div>
              <div style={{ borderLeft: "1px solid rgba(34,211,238,0.2)", paddingLeft: "1.2vw" }}>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.3vw", fontWeight: 700, color: "#22D3EE" }}>Platform — global deduction</div>
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.05vw", color: "#7B7F9E", marginTop: "0.2vh" }}>
                  (Base Price + Markup) × 10% — taken off total before any split
                </div>
              </div>
            </div>

            {/* Remaining 90% label */}
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.05vw", color: "#7B7F9E", letterSpacing: "0.06em", paddingLeft: "0.2vw" }}>
              REMAINING 90% — distributed by source:
            </div>

            {/* Two split boxes — stacked */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.4vh", flex: 1 }}>

              {/* Base Price × 90% */}
              <div style={{ flex: 1, background: "rgba(22,25,41,0.8)", borderRadius: "0.8vw", padding: "1.8vh 2vw", border: "1px solid rgba(139,92,246,0.22)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "1.4vh" }}>
                  <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.1vw", fontWeight: 700, color: "#7B7F9E", letterSpacing: "0.07em" }}>
                    BASE PRICE × 90%
                  </div>
                  <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.0vw", color: "#8B5CF6", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "0.3vw", padding: "0.1vh 0.5vw" }}>
                    Owner-configured
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "1.6vw" }}>
                  {pct("10%", "#8B5CF6")}
                  {divider()}
                  {pct("90%", "#B4A0FF")}
                </div>
                <div style={{ display: "flex", gap: "1.6vw", marginTop: "0.5vh" }}>
                  <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.35vw", color: "#B0B4D0", textAlign: "center", flex: 1 }}>Creator</div>
                  <div style={{ width: 1, flexShrink: 0 }} />
                  <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.35vw", color: "#B0B4D0", textAlign: "center", flex: 1 }}>Owner</div>
                </div>
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.0vw", color: "#7B7F9E", marginTop: "1vh", lineHeight: 1.4 }}>
                  Owner sets Creator royalty at mint. Any ratio — CreatorRatio + OwnerRatio = 100%.
                </div>
              </div>

              {/* Markup × 90% */}
              <div style={{ flex: 1, background: "rgba(22,25,41,0.8)", borderRadius: "0.8vw", padding: "1.8vh 2vw", border: "1px solid rgba(34,211,238,0.18)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "1.4vh" }}>
                  <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.1vw", fontWeight: 700, color: "#7B7F9E", letterSpacing: "0.07em" }}>
                    MARKUP × 90%
                  </div>
                  <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.0vw", color: "#22D3EE", background: "rgba(34,211,238,0.10)", border: "1px solid rgba(34,211,238,0.28)", borderRadius: "0.3vw", padding: "0.1vh 0.5vw" }}>
                    Curator-configured
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "1.6vw" }}>
                  {pct("50%", "#9DA3C8")}
                  {divider()}
                  {pct("50%", "#22D3EE")}
                </div>
                <div style={{ display: "flex", gap: "1.6vw", marginTop: "0.5vh" }}>
                  <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.35vw", color: "#B0B4D0", textAlign: "center", flex: 1 }}>Curator</div>
                  <div style={{ width: 1, flexShrink: 0 }} />
                  <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.35vw", color: "#B0B4D0", textAlign: "center", flex: 1 }}>Staker Pool</div>
                </div>
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.0vw", color: "#7B7F9E", marginTop: "1vh", lineHeight: 1.4 }}>
                  Stakers earn yield proportional to stake weight. Stake slashed on confirmed misconduct.
                </div>
              </div>

            </div>
          </div>

          {/* ── Right: Token Utility ── */}
          <div style={{ flex: 1 }}>
            <div style={{ background: "rgba(22,25,41,0.8)", borderRadius: "0.8vw", padding: "2.8vh 2.5vw", border: "1px solid rgba(240,240,248,0.08)", height: "100%" }}>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.2vw", fontWeight: 700, color: "#7B7F9E", letterSpacing: "0.08em", marginBottom: "2vh" }}>
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
                    <div style={{ width: "0.45vw", height: "0.45vw", background: item.dot, borderRadius: "50%", marginTop: "0.9vh", flexShrink: 0 }} />
                    <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.7vw", color: "#B0B4D0", lineHeight: 1.4 }}>{item.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-[3.5vh] right-[3.5vw]"
        style={{ fontFamily: "var(--font-display-family)", color: "#3D4160", fontSize: "1.5vw", fontWeight: 600 }}>
        13 / 14
      </div>
    </div>
  );
}
