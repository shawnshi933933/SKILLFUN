export default function S07Participate() {
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
        style={{ paddingLeft: "5vw", paddingRight: "5vw", paddingTop: "3.5vh", paddingBottom: "4.5vh", overflow: "hidden" }}
      >
        <div style={{ flexShrink: 0 }}>
          <span style={{ fontFamily: "var(--font-body-family)", color: "#22D3EE", fontSize: "1.3vw", fontWeight: 400, letterSpacing: "0.24em", textTransform: "uppercase", display: "block", marginBottom: "0.5vh" }}>
            Participants
          </span>
          <h2 style={{ fontFamily: "var(--font-display-family)", fontSize: "3.4vw", fontWeight: 800, color: "#F0F0F8", letterSpacing: "-0.02em", lineHeight: 1.05, marginBottom: "2vh" }}>
            Five Ways to Participate
          </h2>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: "flex", gap: "1vw", overflow: "hidden" }}>

          {/* CREATOR */}
          <div style={{ flex: "1 1 0", minWidth: 0, maxWidth: "20%", background: "rgba(139,92,246,0.10)", borderRadius: "0.8vw", padding: "2vh 1.5vw", border: "1px solid rgba(139,92,246,0.28)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1.5vh" }}>
            <span style={{ display: "inline-block", background: "rgba(139,92,246,0.22)", borderRadius: "0.3vw", padding: "0.2vh 0.6vw", fontFamily: "var(--font-display-family)", fontSize: "0.9vw", fontWeight: 700, color: "#8B5CF6", letterSpacing: "0.06em" }}>CREATOR</span>
            <div style={{ width: "3.5vw", height: "3.5vw", borderRadius: "50%", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
              </svg>
            </div>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.6vw", fontWeight: 800, color: "#F0F0F8", lineHeight: 1.1, flex: 1 }}>Skill Builders</div>
            <div style={{ width: "100%" }}>
              <div style={{ height: 1, background: "rgba(139,92,246,0.30)", marginBottom: "0.9vh" }} />
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.15vw", fontWeight: 700, color: "#8B5CF6", lineHeight: 1.2 }}>Royalties on every call</div>
            </div>
          </div>

          {/* OWNER */}
          <div style={{ flex: "1 1 0", minWidth: 0, maxWidth: "20%", background: "rgba(180,160,255,0.07)", borderRadius: "0.8vw", padding: "2vh 1.5vw", border: "1px solid rgba(180,160,255,0.24)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1.5vh" }}>
            <span style={{ display: "inline-block", background: "rgba(180,160,255,0.18)", borderRadius: "0.3vw", padding: "0.2vh 0.6vw", fontFamily: "var(--font-display-family)", fontSize: "0.9vw", fontWeight: 700, color: "#B4A0FF", letterSpacing: "0.06em" }}>OWNER</span>
            <div style={{ width: "3.5vw", height: "3.5vw", borderRadius: "50%", background: "rgba(180,160,255,0.12)", border: "1px solid rgba(180,160,255,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none" stroke="#B4A0FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.6vw", fontWeight: 800, color: "#F0F0F8", lineHeight: 1.1, flex: 1 }}>NFT Holders</div>
            <div style={{ width: "100%" }}>
              <div style={{ height: 1, background: "rgba(180,160,255,0.25)", marginBottom: "0.9vh" }} />
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.15vw", fontWeight: 700, color: "#B4A0FF", lineHeight: 1.2 }}>Passive income + upside</div>
            </div>
          </div>

          {/* CURATOR */}
          <div style={{ flex: "1 1 0", minWidth: 0, maxWidth: "20%", background: "rgba(157,163,200,0.06)", borderRadius: "0.8vw", padding: "2vh 1.5vw", border: "1px solid rgba(157,163,200,0.20)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1.5vh" }}>
            <span style={{ display: "inline-block", background: "rgba(157,163,200,0.16)", borderRadius: "0.3vw", padding: "0.2vh 0.6vw", fontFamily: "var(--font-display-family)", fontSize: "0.9vw", fontWeight: 700, color: "#9DA3C8", letterSpacing: "0.06em" }}>CURATOR</span>
            <div style={{ width: "3.5vw", height: "3.5vw", borderRadius: "50%", background: "rgba(157,163,200,0.12)", border: "1px solid rgba(157,163,200,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none" stroke="#9DA3C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                <polyline points="2 17 12 22 22 17"/>
                <polyline points="2 12 12 17 22 12"/>
              </svg>
            </div>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.6vw", fontWeight: 800, color: "#F0F0F8", lineHeight: 1.1, flex: 1 }}>Bundle Makers</div>
            <div style={{ width: "100%" }}>
              <div style={{ height: 1, background: "rgba(157,163,200,0.22)", marginBottom: "0.9vh" }} />
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.15vw", fontWeight: 700, color: "#9DA3C8", lineHeight: 1.2 }}>Markup share per call</div>
            </div>
          </div>

          {/* STAKER */}
          <div style={{ flex: "1 1 0", minWidth: 0, maxWidth: "20%", background: "rgba(34,211,238,0.07)", borderRadius: "0.8vw", padding: "2vh 1.5vw", border: "1px solid rgba(34,211,238,0.22)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1.5vh" }}>
            <span style={{ display: "inline-block", background: "rgba(34,211,238,0.14)", borderRadius: "0.3vw", padding: "0.2vh 0.6vw", fontFamily: "var(--font-display-family)", fontSize: "0.9vw", fontWeight: 700, color: "#22D3EE", letterSpacing: "0.06em" }}>STAKER</span>
            <div style={{ width: "3.5vw", height: "3.5vw", borderRadius: "50%", background: "rgba(34,211,238,0.10)", border: "1px solid rgba(34,211,238,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.6vw", fontWeight: 800, color: "#F0F0F8", lineHeight: 1.1, flex: 1 }}>Quality Guarantors</div>
            <div style={{ width: "100%" }}>
              <div style={{ height: 1, background: "rgba(34,211,238,0.24)", marginBottom: "0.9vh" }} />
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.15vw", fontWeight: 700, color: "#22D3EE", lineHeight: 1.2 }}>Yield from Markup pool</div>
            </div>
          </div>

          {/* AGENT */}
          <div style={{ flex: "1 1 0", minWidth: 0, maxWidth: "20%", background: "rgba(240,240,248,0.03)", borderRadius: "0.8vw", padding: "2vh 1.5vw", border: "1px solid rgba(240,240,248,0.12)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1.5vh" }}>
            <span style={{ display: "inline-block", background: "rgba(240,240,248,0.10)", borderRadius: "0.3vw", padding: "0.2vh 0.6vw", fontFamily: "var(--font-display-family)", fontSize: "0.9vw", fontWeight: 700, color: "#F0F0F8", letterSpacing: "0.06em" }}>AGENT</span>
            <div style={{ width: "3.5vw", height: "3.5vw", borderRadius: "50%", background: "rgba(240,240,248,0.08)", border: "1px solid rgba(240,240,248,0.20)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none" stroke="#F0F0F8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2"/>
                <rect x="8" y="8" width="8" height="8" rx="1"/>
                <line x1="2" y1="12" x2="5" y2="12"/>
                <line x1="19" y1="12" x2="22" y2="12"/>
                <line x1="12" y1="2" x2="12" y2="5"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
              </svg>
            </div>
            <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.6vw", fontWeight: 800, color: "#F0F0F8", lineHeight: 1.1, flex: 1 }}>AI Consumers</div>
            <div style={{ width: "100%" }}>
              <div style={{ height: 1, background: "rgba(240,240,248,0.15)", marginBottom: "0.9vh" }} />
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.15vw", fontWeight: 700, color: "#F0F0F8", lineHeight: 1.2 }}>Access entire marketplace</div>
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-[3.5vh] right-[3.5vw]" style={{ fontFamily: "var(--font-display-family)", color: "#3D4160", fontSize: "1.5vw", fontWeight: 600 }}>
        10 / 15
      </div>
    </div>
  );
}
