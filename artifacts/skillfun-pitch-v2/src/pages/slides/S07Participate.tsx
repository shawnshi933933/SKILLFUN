export default function S07Participate() {
  const card = (
    bg: string, border: string, badgeBg: string, badgeColor: string,
    label: string, icon: React.ReactNode,
    title: string, dividerColor: string, earnColor: string, earnText: string
  ) => (
    <div style={{
      flex: "1 1 0", minWidth: 0, maxWidth: "20%",
      background: bg, borderRadius: "0.8vw",
      padding: "2vh 1.5vw", border,
      display: "flex", flexDirection: "column",
      alignItems: "center", textAlign: "center",
      justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.2vh" }}>
        <span style={{
          display: "inline-block", background: badgeBg, borderRadius: "0.3vw",
          padding: "0.25vh 0.7vw", fontFamily: "var(--font-display-family)",
          fontSize: "0.9vw", fontWeight: 700, color: badgeColor, letterSpacing: "0.06em"
        }}>{label}</span>
        <div style={{
          width: "3vw", height: "3vw", borderRadius: "50%",
          background: badgeBg, border: `1px solid ${earnColor}33`,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>{icon}</div>
        <div style={{
          fontFamily: "var(--font-display-family)", fontSize: "1.55vw",
          fontWeight: 800, color: "#F0F0F8", lineHeight: 1.15
        }}>{title}</div>
      </div>
      <div style={{ width: "100%", marginTop: "2vh" }}>
        <div style={{ height: 1, background: dividerColor, marginBottom: "0.8vh" }} />
        <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.0vw", fontWeight: 700, color: earnColor, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{earnText}</div>
      </div>
    </div>
  );

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
        className="absolute inset-0 flex flex-col justify-center"
        style={{ paddingLeft: "5vw", paddingRight: "5vw", paddingTop: "4vh", paddingBottom: "6vh" }}
      >
        <div style={{ flexShrink: 0, marginBottom: "2.5vh" }}>
          <span style={{ fontFamily: "var(--font-body-family)", color: "#22D3EE", fontSize: "1.3vw", fontWeight: 400, letterSpacing: "0.24em", textTransform: "uppercase", display: "block", marginBottom: "0.5vh" }}>
            Participants
          </span>
          <h2 style={{ fontFamily: "var(--font-display-family)", fontSize: "3.4vw", fontWeight: 800, color: "#F0F0F8", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            Five Ways to Participate
          </h2>
        </div>

        <div style={{ height: "44vh", display: "flex", gap: "1vw" }}>

          {card(
            "rgba(139,92,246,0.10)", "1px solid rgba(139,92,246,0.28)",
            "rgba(139,92,246,0.22)", "#8B5CF6", "CREATOR",
            <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>,
            "Skill Builders", "rgba(139,92,246,0.30)", "#8B5CF6", "Royalties on every call"
          )}

          {card(
            "rgba(180,160,255,0.07)", "1px solid rgba(180,160,255,0.24)",
            "rgba(180,160,255,0.18)", "#B4A0FF", "OWNER",
            <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none" stroke="#B4A0FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>,
            "NFT Holders", "rgba(180,160,255,0.25)", "#B4A0FF", "Passive income + upside"
          )}

          {card(
            "rgba(157,163,200,0.06)", "1px solid rgba(157,163,200,0.20)",
            "rgba(157,163,200,0.16)", "#9DA3C8", "CURATOR",
            <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none" stroke="#9DA3C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>,
            "Bundle Makers", "rgba(157,163,200,0.22)", "#9DA3C8", "Markup share per call"
          )}

          {card(
            "rgba(34,211,238,0.07)", "1px solid rgba(34,211,238,0.22)",
            "rgba(34,211,238,0.14)", "#22D3EE", "STAKER",
            <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>,
            "Quality Guarantors", "rgba(34,211,238,0.24)", "#22D3EE", "Yield from Markup pool"
          )}

          {card(
            "rgba(240,240,248,0.03)", "1px solid rgba(240,240,248,0.12)",
            "rgba(240,240,248,0.10)", "#F0F0F8", "AGENT",
            <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none" stroke="#F0F0F8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2"/>
              <rect x="8" y="8" width="8" height="8" rx="1"/>
              <line x1="2" y1="12" x2="5" y2="12"/>
              <line x1="19" y1="12" x2="22" y2="12"/>
              <line x1="12" y1="2" x2="12" y2="5"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
            </svg>,
            "AI Consumers", "rgba(240,240,248,0.15)", "#F0F0F8", "Full marketplace access"
          )}

        </div>
      </div>

      <div className="absolute bottom-[3.5vh] right-[3.5vw]" style={{ fontFamily: "var(--font-display-family)", color: "#3D4160", fontSize: "1.5vw", fontWeight: 600 }}>
        09 / 14
      </div>
    </div>
  );
}
