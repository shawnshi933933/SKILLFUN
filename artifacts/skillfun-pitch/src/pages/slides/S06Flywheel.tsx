export default function S06Flywheel() {
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
      <div
        className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }}
      />

      <div
        className="absolute inset-0 flex"
        style={{ paddingLeft: "7vw", paddingRight: "5vw", paddingTop: "5.5vh", paddingBottom: "5.5vh" }}
      >
        {/* ── Left: text ── */}
        <div className="flex flex-col" style={{ width: "38vw", flexShrink: 0 }}>
          <span
            style={{
              fontFamily: "var(--font-body-family)",
              color: "#22D3EE",
              fontSize: "1.35vw",
              fontWeight: 400,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              marginBottom: "1.2vh"
            }}
          >
            Growth Model
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display-family)",
              fontSize: "4vw",
              fontWeight: 800,
              color: "#F0F0F8",
              letterSpacing: "-0.02em",
              lineHeight: 1.08
            }}
          >
            Economic Flywheel
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body-family)",
              fontSize: "1.8vw",
              color: "#7B7F9E",
              fontWeight: 300,
              lineHeight: 1.55,
              marginTop: "2vh",
              marginBottom: "3.5vh",
              maxWidth: "33vw"
            }}
          >
            The Bundle layer is the engine — SKILLs are its fuel.
          </p>

          <div className="flex flex-col gap-[2vh]">
            {[
              { dot: "#8B5CF6", title: "Creators mint Skills", sub: "Curators bundle them — no ownership required" },
              { dot: "#B4A0FF", title: "Quality Bundles emerge", sub: "Stakers back them, amplifying the discovery signal" },
              { dot: "#22D3EE", title: "Agents invoke via one endpoint", sub: "Bundle fees split across Curator, Staker, Creator, Owner" },
              { dot: "#9DA3C8", title: "Higher yields attract more Curators", sub: "Richer Bundles draw more Agents — flywheel accelerates" },
            ].map((item) => (
              <div key={item.title} style={{ display: "flex", alignItems: "flex-start", gap: "1.4vw" }}>
                <div
                  style={{
                    width: "0.5vw",
                    height: "0.5vw",
                    background: item.dot,
                    borderRadius: "50%",
                    marginTop: "0.9vh",
                    flexShrink: 0
                  }}
                />
                <div>
                  <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.7vw", fontWeight: 700, color: "#F0F0F8" }}>
                    {item.title}
                  </div>
                  <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.45vw", color: "#7B7F9E" }}>
                    {item.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: diagram ── */}
        <div className="flex items-center justify-center" style={{ flex: 1 }}>
          <div className="relative" style={{ width: "36vw", height: "36vw" }}>

            {/* ── SVG rings & arrows ── */}
            <svg
              className="absolute inset-0"
              width="100%" height="100%"
              viewBox="0 0 360 360"
              fill="none"
            >
              {/* Outer glow ring */}
              <circle cx="180" cy="180" r="155" stroke="rgba(139,92,246,0.10)" strokeWidth="1" />
              {/* Main flywheel ring */}
              <circle cx="180" cy="180" r="130" stroke="rgba(139,92,246,0.22)" strokeWidth="1.5" strokeDasharray="6 5" />
              {/* Inner Bundle ring */}
              <circle cx="180" cy="180" r="50" stroke="rgba(139,92,246,0.35)" strokeWidth="1" fill="rgba(139,92,246,0.07)" />

              {/* Clockwise arc arrows on outer ring */}
              {/* Top (Curators) → Right (Agents) */}
              <path d="M 180 50 A 130 130 0 0 1 310 180" stroke="#8B5CF6" strokeWidth="1.8" strokeDasharray="5 4" opacity="0.55" markerEnd="url(#arrowPurple)" />
              {/* Right (Agents) → Bottom (Revenue) */}
              <path d="M 310 180 A 130 130 0 0 1 180 310" stroke="#22D3EE" strokeWidth="1.8" strokeDasharray="5 4" opacity="0.50" markerEnd="url(#arrowTeal)" />
              {/* Bottom (Revenue) → Left (Stakers) */}
              <path d="M 180 310 A 130 130 0 0 1 50 180" stroke="#B4A0FF" strokeWidth="1.8" strokeDasharray="5 4" opacity="0.48" markerEnd="url(#arrowLavender)" />
              {/* Left (Stakers) → Top (Curators) */}
              <path d="M 50 180 A 130 130 0 0 1 180 50" stroke="#9DA3C8" strokeWidth="1.8" strokeDasharray="5 4" opacity="0.45" markerEnd="url(#arrowMuted)" />

              {/* SKILL supply feed-in arrow: from top-left box → Bundle center */}
              <path d="M 68 72 L 140 148" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.55" markerEnd="url(#arrowPurpleSm)" />

              {/* Arrow markers */}
              <defs>
                <marker id="arrowPurple" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                  <polygon points="0 0, 7 3.5, 0 7" fill="#8B5CF6" opacity="0.7" />
                </marker>
                <marker id="arrowTeal" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                  <polygon points="0 0, 7 3.5, 0 7" fill="#22D3EE" opacity="0.7" />
                </marker>
                <marker id="arrowLavender" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                  <polygon points="0 0, 7 3.5, 0 7" fill="#B4A0FF" opacity="0.7" />
                </marker>
                <marker id="arrowMuted" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                  <polygon points="0 0, 7 3.5, 0 7" fill="#9DA3C8" opacity="0.7" />
                </marker>
                <marker id="arrowPurpleSm" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill="#8B5CF6" opacity="0.6" />
                </marker>
              </defs>
            </svg>

            {/* ── Bundle center ── */}
            <div
              className="absolute"
              style={{
                left: "50%", top: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center"
              }}
            >
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.2vw", fontWeight: 900, color: "#8B5CF6", letterSpacing: "-0.02em" }}>
                Bundle
              </div>
              <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.1vw", color: "#7B7F9E", marginTop: "0.2vh" }}>
                distribution hub
              </div>
            </div>

            {/* ── SKILL supply box (top-left, outside ring) ── */}
            <div
              className="absolute"
              style={{ top: "4%", left: "4%", textAlign: "center" }}
            >
              <div
                style={{
                  background: "rgba(139,92,246,0.12)",
                  border: "1px solid rgba(139,92,246,0.35)",
                  borderRadius: "0.5vw",
                  padding: "0.6vh 1vw",
                  display: "inline-block"
                }}
              >
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "0.9vw", color: "#8B5CF6", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  SKILL NFT
                </div>
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "0.85vw", color: "#7B7F9E", marginTop: "0.2vh" }}>
                  Creator → Owner
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-body-family)", fontSize: "0.9vw", color: "#8B5CF6", marginTop: "0.4vh", opacity: 0.7 }}>
                feeds in ↘
              </div>
            </div>

            {/* ── Curators — top ── */}
            <div
              className="absolute"
              style={{ top: "0%", left: "50%", transform: "translateX(-50%)" }}
            >
              <div
                style={{
                  background: "rgba(157,163,200,0.10)",
                  border: "1px solid rgba(157,163,200,0.32)",
                  borderRadius: "0.5vw",
                  padding: "0.7vh 1.3vw",
                  textAlign: "center"
                }}
              >
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.4vw", fontWeight: 700, color: "#9DA3C8" }}>Curators</div>
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.05vw", color: "#7B7F9E" }}>Bundle &amp; Earn</div>
              </div>
            </div>

            {/* ── Agents — right ── */}
            <div
              className="absolute"
              style={{ top: "50%", right: "0%", transform: "translateY(-50%)" }}
            >
              <div
                style={{
                  background: "rgba(34,211,238,0.09)",
                  border: "1px solid rgba(34,211,238,0.30)",
                  borderRadius: "0.5vw",
                  padding: "0.7vh 1.3vw",
                  textAlign: "center"
                }}
              >
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.4vw", fontWeight: 700, color: "#22D3EE" }}>Agents</div>
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.05vw", color: "#7B7F9E" }}>Invoke &amp; Pay</div>
              </div>
            </div>

            {/* ── Revenue — bottom ── */}
            <div
              className="absolute"
              style={{ bottom: "0%", left: "50%", transform: "translateX(-50%)" }}
            >
              <div
                style={{
                  background: "rgba(34,211,238,0.07)",
                  border: "1px solid rgba(34,211,238,0.22)",
                  borderRadius: "0.5vw",
                  padding: "0.7vh 1.3vw",
                  textAlign: "center"
                }}
              >
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.4vw", fontWeight: 700, color: "#22D3EE" }}>Revenue Split</div>
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.05vw", color: "#7B7F9E" }}>ERC-8183 auto-settle</div>
              </div>
            </div>

            {/* ── Stakers — left ── */}
            <div
              className="absolute"
              style={{ top: "50%", left: "0%", transform: "translateY(-50%)" }}
            >
              <div
                style={{
                  background: "rgba(180,160,255,0.10)",
                  border: "1px solid rgba(180,160,255,0.30)",
                  borderRadius: "0.5vw",
                  padding: "0.7vh 1.3vw",
                  textAlign: "center"
                }}
              >
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.4vw", fontWeight: 700, color: "#B4A0FF" }}>Stakers</div>
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.05vw", color: "#7B7F9E" }}>Back &amp; Signal</div>
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
        10 / 13
      </div>
    </div>
  );
}
