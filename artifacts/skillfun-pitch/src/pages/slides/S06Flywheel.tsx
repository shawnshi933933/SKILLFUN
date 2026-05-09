export default function S06Flywheel() {
  const nodeBox = (
    bg: string, border: string, titleColor: string,
    title: string, sub: string
  ) => (
    <div style={{
      background: bg, border: `1px solid ${border}`,
      borderRadius: "0.5vw", padding: "0.65vh 1.2vw", textAlign: "center"
    }}>
      <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.35vw", fontWeight: 700, color: titleColor }}>{title}</div>
      <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.0vw", color: "#7B7F9E" }}>{sub}</div>
    </div>
  );

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 55% 65% at 62% 52%, rgba(139,92,246,0.09) 0%, transparent 68%)"
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }} />

      <div
        className="absolute inset-0 flex"
        style={{ paddingLeft: "7vw", paddingRight: "4vw", paddingTop: "5vh", paddingBottom: "5vh" }}
      >
        {/* ── Left: text ── */}
        <div className="flex flex-col" style={{ width: "36vw", flexShrink: 0 }}>
          <span style={{
            fontFamily: "var(--font-body-family)", color: "#22D3EE",
            fontSize: "1.35vw", fontWeight: 400, letterSpacing: "0.24em",
            textTransform: "uppercase", marginBottom: "1vh"
          }}>Growth Model</span>
          <h2 style={{
            fontFamily: "var(--font-display-family)", fontSize: "3.8vw",
            fontWeight: 800, color: "#F0F0F8", letterSpacing: "-0.02em", lineHeight: 1.08
          }}>Economic Flywheel</h2>
          <p style={{
            fontFamily: "var(--font-body-family)", fontSize: "1.7vw", color: "#7B7F9E",
            fontWeight: 300, lineHeight: 1.5, marginTop: "1.8vh", marginBottom: "3vh", maxWidth: "31vw"
          }}>
            The Bundle layer is the engine — SKILLs are its fuel.
          </p>
          <div className="flex flex-col gap-[1.8vh]">
            {[
              { dot: "#8B5CF6", title: "Creators mint Skills", sub: "Curators bundle them — no ownership required" },
              { dot: "#B4A0FF", title: "Quality Bundles emerge", sub: "Stakers back them, amplifying the discovery signal" },
              { dot: "#22D3EE", title: "Agents invoke via one endpoint", sub: "Fees split across Curator, Staker, Creator, Owner" },
              { dot: "#9DA3C8", title: "Higher yields attract more Curators", sub: "Richer Bundles → more Agents → flywheel accelerates" },
            ].map((item) => (
              <div key={item.title} style={{ display: "flex", alignItems: "flex-start", gap: "1.2vw" }}>
                <div style={{ width: "0.5vw", height: "0.5vw", background: item.dot, borderRadius: "50%", marginTop: "0.9vh", flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.6vw", fontWeight: 700, color: "#F0F0F8" }}>{item.title}</div>
                  <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.35vw", color: "#7B7F9E" }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: diagram column ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.6vh" }}>

          {/* ── SKILL NFT row (top, standalone) ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.2vw" }}>
            {/* SKILL NFT big label */}
            <div style={{
              fontFamily: "var(--font-display-family)", fontSize: "1.65vw",
              fontWeight: 900, color: "#8B5CF6", letterSpacing: "-0.02em", whiteSpace: "nowrap"
            }}>
              SKILL NFT
            </div>
            {/* Creator box */}
            {nodeBox("rgba(139,92,246,0.13)", "rgba(139,92,246,0.38)", "#8B5CF6", "Creator", "Mint Skills")}
            {/* Owner box */}
            {nodeBox("rgba(180,160,255,0.10)", "rgba(180,160,255,0.32)", "#B4A0FF", "Owner", "Set Price")}
          </div>

          {/* ── Down arrow connector ── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2vh" }}>
            <div style={{ width: 1, height: "2.2vh", background: "rgba(139,92,246,0.45)" }} />
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "0.85vw", color: "#8B5CF6", opacity: 0.6, letterSpacing: "0.06em" }}>
              feeds into Bundle
            </div>
            <div style={{ color: "#8B5CF6", fontSize: "1.2vw", opacity: 0.55, lineHeight: 1 }}>↓</div>
          </div>

          {/* ── Bundle flywheel ring ── */}
          <div className="relative" style={{ width: "34vw", height: "34vw" }}>

            {/* SVG rings & arc arrows */}
            <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 280 280" fill="none">
              <circle cx="140" cy="140" r="120" stroke="rgba(139,92,246,0.10)" strokeWidth="1" />
              <circle cx="140" cy="140" r="100" stroke="rgba(139,92,246,0.22)" strokeWidth="1.5" strokeDasharray="6 5" />
              <circle cx="140" cy="140" r="40" stroke="rgba(139,92,246,0.38)" strokeWidth="1.2" fill="rgba(139,92,246,0.08)" />

              {/* Clockwise arcs: top→right→bottom→left→top */}
              <path d="M 140 40 A 100 100 0 0 1 240 140" stroke="#9DA3C8" strokeWidth="1.8" strokeDasharray="5 4" opacity="0.5" markerEnd="url(#fw1)" />
              <path d="M 240 140 A 100 100 0 0 1 140 240" stroke="#22D3EE" strokeWidth="1.8" strokeDasharray="5 4" opacity="0.5" markerEnd="url(#fw2)" />
              <path d="M 140 240 A 100 100 0 0 1 40 140" stroke="#B4A0FF" strokeWidth="1.8" strokeDasharray="5 4" opacity="0.48" markerEnd="url(#fw3)" />
              <path d="M 40 140 A 100 100 0 0 1 140 40" stroke="#9DA3C8" strokeWidth="1.8" strokeDasharray="5 4" opacity="0.45" markerEnd="url(#fw4)" />

              <defs>
                {[["fw1","#9DA3C8"],["fw2","#22D3EE"],["fw3","#B4A0FF"],["fw4","#9DA3C8"]].map(([id, fill]) => (
                  <marker key={id} id={id} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                    <polygon points="0 0, 7 3.5, 0 7" fill={fill} opacity="0.7" />
                  </marker>
                ))}
              </defs>
            </svg>

            {/* Bundle center */}
            <div className="absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.2vw", fontWeight: 900, color: "#8B5CF6", letterSpacing: "-0.02em" }}>Bundle</div>
              <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.0vw", color: "#7B7F9E", marginTop: "0.2vh" }}>distribution hub</div>
            </div>

            {/* Curators — top */}
            <div className="absolute" style={{ top: "0%", left: "50%", transform: "translateX(-50%)" }}>
              {nodeBox("rgba(157,163,200,0.10)", "rgba(157,163,200,0.32)", "#9DA3C8", "Curators", "Bundle & Earn")}
            </div>

            {/* Agents — right */}
            <div className="absolute" style={{ top: "50%", right: "0%", transform: "translateY(-50%)" }}>
              {nodeBox("rgba(34,211,238,0.09)", "rgba(34,211,238,0.30)", "#22D3EE", "Agents", "Invoke & Pay")}
            </div>

            {/* Revenue — bottom */}
            <div className="absolute" style={{ bottom: "0%", left: "50%", transform: "translateX(-50%)" }}>
              {nodeBox("rgba(34,211,238,0.07)", "rgba(34,211,238,0.22)", "#22D3EE", "Revenue Split", "ERC-8183 auto-settle")}
            </div>

            {/* Stakers — left */}
            <div className="absolute" style={{ top: "50%", left: "0%", transform: "translateY(-50%)" }}>
              {nodeBox("rgba(180,160,255,0.10)", "rgba(180,160,255,0.30)", "#B4A0FF", "Stakers", "Back & Signal")}
            </div>

          </div>
        </div>
      </div>

      <div className="absolute bottom-[3.5vh] right-[3.5vw]"
        style={{ fontFamily: "var(--font-display-family)", color: "#3D4160", fontSize: "1.5vw", fontWeight: 600 }}>
        10 / 13
      </div>
    </div>
  );
}
