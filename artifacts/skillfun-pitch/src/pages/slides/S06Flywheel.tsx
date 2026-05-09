export default function S06Flywheel() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 55% 65% at 60% 55%, rgba(139,92,246,0.10) 0%, transparent 68%)"
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div
        className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }}
      />

      <div
        className="absolute inset-0 flex"
        style={{ paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "6vh", paddingBottom: "6vh" }}
      >
        <div className="flex flex-col" style={{ width: "42vw" }}>
          <span
            style={{
              fontFamily: "var(--font-body-family)",
              color: "#22D3EE",
              fontSize: "1.4vw",
              fontWeight: 400,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              marginBottom: "1.5vh"
            }}
          >
            Growth Model
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display-family)",
              fontSize: "4.2vw",
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
              fontSize: "2vw",
              color: "#7B7F9E",
              fontWeight: 300,
              lineHeight: 1.55,
              marginTop: "2.5vh",
              maxWidth: "36vw"
            }}
          >
            Each successful invocation compounds value across all five participants.
          </p>

          <div className="flex flex-col gap-[2vh]" style={{ marginTop: "4vh" }}>
            {[
              { dot: "#8B5CF6", title: "More Creators mint Skills", sub: "giving Curators richer content to bundle" },
              { dot: "#B4A0FF", title: "Quality Bundles emerge", sub: "Stakers back them — quality signal strengthens" },
              { dot: "#22D3EE", title: "Agents invoke via one endpoint", sub: "usage generates fees across all five roles" },
              { dot: "#9DA3C8", title: "Higher yields attract more Creators", sub: "who list new Skills — and the flywheel accelerates" },
            ].map((item) => (
              <div key={item.title} style={{ display: "flex", alignItems: "flex-start", gap: "1.8vw" }}>
                <div
                  style={{
                    width: "0.55vw",
                    height: "0.55vw",
                    background: item.dot,
                    borderRadius: "50%",
                    marginTop: "0.9vh",
                    flexShrink: 0
                  }}
                />
                <div>
                  <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.9vw", fontWeight: 700, color: "#F0F0F8" }}>
                    {item.title}
                  </div>
                  <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.6vw", color: "#7B7F9E" }}>
                    {item.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center" style={{ width: "44vw" }}>
          <div className="relative" style={{ width: "33vw", height: "33vw" }}>
            <div className="absolute inset-0 rounded-full" style={{ border: "1px solid rgba(139,92,246,0.18)" }} />
            <div className="absolute rounded-full" style={{ inset: "11%", border: "1px solid rgba(139,92,246,0.10)" }} />
            <div
              className="absolute rounded-full"
              style={{ inset: "23%", background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.22)" }}
            />

            {/* Creators — top */}
            <div className="absolute text-center" style={{ top: "1%", left: "50%", transform: "translateX(-50%)" }}>
              <div style={{ background: "rgba(139,92,246,0.17)", border: "1px solid rgba(139,92,246,0.42)", borderRadius: "0.5vw", padding: "0.8vh 1.4vw" }}>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.5vw", fontWeight: 700, color: "#8B5CF6" }}>Creators</div>
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.15vw", color: "#7B7F9E" }}>Mint Skills</div>
              </div>
            </div>

            {/* Curators — right */}
            <div className="absolute" style={{ top: "50%", right: "-2%", transform: "translateY(-50%)" }}>
              <div style={{ background: "rgba(157,163,200,0.10)", border: "1px solid rgba(157,163,200,0.30)", borderRadius: "0.5vw", padding: "0.8vh 1.4vw" }}>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.5vw", fontWeight: 700, color: "#9DA3C8" }}>Curators</div>
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.15vw", color: "#7B7F9E" }}>Bundle &amp; Earn</div>
              </div>
            </div>

            {/* Agents — bottom-left */}
            <div className="absolute" style={{ bottom: "8%", left: "-2%" }}>
              <div style={{ background: "rgba(34,211,238,0.09)", border: "1px solid rgba(34,211,238,0.30)", borderRadius: "0.5vw", padding: "0.8vh 1.4vw" }}>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.5vw", fontWeight: 700, color: "#22D3EE" }}>Agents</div>
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.15vw", color: "#7B7F9E" }}>Invoke &amp; Pay</div>
              </div>
            </div>

            {/* Stakers — bottom-right */}
            <div className="absolute" style={{ bottom: "8%", right: "-2%" }}>
              <div style={{ background: "rgba(180,160,255,0.10)", border: "1px solid rgba(180,160,255,0.30)", borderRadius: "0.5vw", padding: "0.8vh 1.4vw" }}>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.5vw", fontWeight: 700, color: "#B4A0FF" }}>Stakers</div>
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.15vw", color: "#7B7F9E" }}>Back &amp; Earn</div>
              </div>
            </div>

            {/* Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.2vw", fontWeight: 800, color: "#8B5CF6" }}>SKILL</div>
                <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.4vw", color: "#7B7F9E" }}>Token</div>
              </div>
            </div>

            {/* Arcs */}
            <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 200 200" fill="none">
              {/* Top to Right */}
              <path d="M 100 16 A 84 84 0 0 1 184 100" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="5 4" fill="none" opacity="0.45" />
              {/* Right to Bottom-right */}
              <path d="M 184 100 A 84 84 0 0 1 155 170" stroke="#9DA3C8" strokeWidth="1.5" strokeDasharray="5 4" fill="none" opacity="0.38" />
              {/* Bottom-right to Bottom-left */}
              <path d="M 155 170 A 84 84 0 0 1 45 170" stroke="#22D3EE" strokeWidth="1.5" strokeDasharray="5 4" fill="none" opacity="0.38" />
              {/* Bottom-left to Top */}
              <path d="M 45 170 A 84 84 0 0 1 100 16" stroke="#B4A0FF" strokeWidth="1.5" strokeDasharray="5 4" fill="none" opacity="0.38" />
            </svg>
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
