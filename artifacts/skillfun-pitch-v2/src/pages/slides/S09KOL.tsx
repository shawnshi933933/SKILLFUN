export default function S09KOL() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0D0F14" }}
    >
      {/* AI background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/skillfun-pitch-v2/bg-kol.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.13
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 55% 55% at 82% 42%, rgba(139,92,246,0.09) 0%, transparent 65%)"
        }}
      />

      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div
        className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }}
      />

      <div
        className="absolute inset-0 flex"
        style={{ paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "6vh", paddingBottom: "6vh" }}
      >
        {/* Left column */}
        <div className="flex flex-col justify-between" style={{ width: "44vw" }}>
          <div>
            <span style={{ fontFamily: "var(--font-body-family)", color: "#22D3EE", fontSize: "1.4vw", fontWeight: 400, letterSpacing: "0.24em", textTransform: "uppercase" }}>
              Go-to-Market
            </span>
            <h2 style={{ fontFamily: "var(--font-display-family)", fontSize: "4.2vw", fontWeight: 800, color: "#F0F0F8", letterSpacing: "-0.02em", lineHeight: 1.08, marginTop: "1.5vh" }}>
              KOL Growth Engine
            </h2>
            <p style={{ fontFamily: "var(--font-body-family)", fontSize: "1.75vw", color: "#7B7F9E", fontWeight: 300, lineHeight: 1.45, marginTop: "2vh", maxWidth: "40vw" }}>
              KOLs solve the cold-start problem — supply and demand arrive together.
            </p>
          </div>

          <div className="flex flex-col gap-[2.5vh]">
            {/* Step 1 */}
            <div style={{ display: "flex", alignItems: "center", gap: "2vw" }}>
              <div style={{ minWidth: "3vw", height: "3vw", borderRadius: "50%", background: "rgba(139,92,246,0.18)", border: "1px solid rgba(139,92,246,0.42)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "var(--font-display-family)", fontSize: "1.4vw", fontWeight: 800, color: "#8B5CF6" }}>1</span>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2vw", fontWeight: 700, color: "#F0F0F8" }}>Distill</div>
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.5vw", color: "#7B7F9E", marginTop: "0.2vh" }}>
                  KOL expertise → callable Skill NFT
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: "flex", alignItems: "center", gap: "2vw" }}>
              <div style={{ minWidth: "3vw", height: "3vw", borderRadius: "50%", background: "rgba(180,160,255,0.14)", border: "1px solid rgba(180,160,255,0.36)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "var(--font-display-family)", fontSize: "1.4vw", fontWeight: 800, color: "#B4A0FF" }}>2</span>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2vw", fontWeight: 700, color: "#F0F0F8" }}>Claim</div>
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.5vw", color: "#7B7F9E", marginTop: "0.2vh" }}>
                  Fans claim trial tokens via Twitter — no wallet needed
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: "flex", alignItems: "center", gap: "2vw" }}>
              <div style={{ minWidth: "3vw", height: "3vw", borderRadius: "50%", background: "rgba(34,211,238,0.11)", border: "1px solid rgba(34,211,238,0.30)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "var(--font-display-family)", fontSize: "1.4vw", fontWeight: 800, color: "#22D3EE" }}>3</span>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2vw", fontWeight: 700, color: "#F0F0F8" }}>Activate</div>
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.5vw", color: "#7B7F9E", marginTop: "0.2vh" }}>
                  Trial converts to purchase — KOL earns royalty
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col items-center justify-center" style={{ flex: 1, paddingLeft: "5vw" }}>
          <div
            style={{
              background: "rgba(22,25,41,0.88)",
              borderRadius: "1vw",
              padding: "3.5vh 3vw",
              border: "1px solid rgba(139,92,246,0.28)",
              width: "100%"
            }}
          >
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.4vw", fontWeight: 700, color: "#8B5CF6", letterSpacing: "0.08em", marginBottom: "2.5vh" }}>
              WHY KOLs FIRST
            </div>
            <div className="flex flex-col gap-[2vh]">
              <div>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.9vw", fontWeight: 700, color: "#F0F0F8" }}>
                  Supply + demand in one move
                </div>
              </div>
              <div style={{ height: 1, background: "rgba(139,92,246,0.15)" }} />
              <div>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.9vw", fontWeight: 700, color: "#F0F0F8" }}>
                  Trust by association
                </div>
              </div>
              <div style={{ height: 1, background: "rgba(139,92,246,0.15)" }} />
              <div>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.9vw", fontWeight: 700, color: "#F0F0F8" }}>
                  Viral distribution built-in
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3.5vh] right-[3.5vw]" style={{ fontFamily: "var(--font-display-family)", color: "#3D4160", fontSize: "1.5vw", fontWeight: 600 }}>
        13 / 15
      </div>
    </div>
  );
}
