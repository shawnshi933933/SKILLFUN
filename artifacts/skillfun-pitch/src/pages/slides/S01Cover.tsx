const base = import.meta.env.BASE_URL;

export default function S01Cover() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0D0F14" }}>
      <img
        src={`${base}cover-hero.png`}
        crossOrigin="anonymous"
        alt="Abstract AI network"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.42 }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(13,15,20,0.88) 0%, rgba(13,15,20,0.55) 50%, rgba(139,92,246,0.12) 100%)"
        }}
      />
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div
        className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }}
      />

      <div
        className="absolute inset-0 flex flex-col justify-center"
        style={{ paddingLeft: "8vw", paddingRight: "8vw" }}
      >
        <div className="mb-[2.5vh]">
          <span
            style={{
              fontFamily: "var(--font-body-family)",
              color: "#22D3EE",
              fontSize: "1.5vw",
              fontWeight: 400,
              letterSpacing: "0.28em",
              textTransform: "uppercase"
            }}
          >
            AI Skill Economy
          </span>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "10vw",
            fontWeight: 800,
            lineHeight: 0.9,
            color: "#F0F0F8",
            letterSpacing: "-0.03em",
            textWrap: "balance",
            maxWidth: "60vw"
          }}
        >
          Skill<span style={{ color: "#8B5CF6" }}>Fun</span>
        </h1>

        <p
          style={{
            fontFamily: "var(--font-body-family)",
            fontSize: "2.3vw",
            color: "#9DA3C8",
            fontWeight: 300,
            maxWidth: "50vw",
            lineHeight: 1.45,
            marginTop: "3.5vh"
          }}
        >
          The On-Chain App Store for AI Agents<br /><span style={{ fontSize: "1.6vw", color: "#7B7F9E", fontWeight: 300 }}>Skills as NFTs · Bundle Distribution · On-Chain Revenue</span>
        </p>

        <div
          className="flex items-center gap-[2.5vw]"
          style={{ marginTop: "6.5vh" }}
        >
          <div style={{ height: "0.12vh", width: "3.5vw", background: "#8B5CF6" }} />
          <span
            style={{
              fontFamily: "var(--font-body-family)",
              color: "#7B7F9E",
              fontSize: "1.6vw",
              fontWeight: 300
            }}
          >
            Seed Round · 2026
          </span>
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
        01 / 14
      </div>
    </div>
  );
}
