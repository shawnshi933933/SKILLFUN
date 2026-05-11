export default function S03Problem() {
  const base = import.meta.env.BASE_URL;
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 45% 55% at 18% 82%, rgba(139,92,246,0.08) 0%, transparent 65%)"
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div
        className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${base}bg-problem.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.10
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0"
        style={{
          width: "36vw",
          background: "linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(34,211,238,0.03) 100%)",
          borderLeft: "1px solid rgba(139,92,246,0.10)"
        }}
      />

      <div
        className="absolute inset-0 flex"
        style={{ paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "6vh", paddingBottom: "6vh" }}
      >
        <div className="flex flex-col justify-center" style={{ width: "54vw" }}>
          <span
            style={{
              fontFamily: "var(--font-body-family)",
              color: "#22D3EE",
              fontSize: "1.4vw",
              fontWeight: 400,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              marginBottom: "2vh"
            }}
          >
            The Problem
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display-family)",
              fontSize: "4.6vw",
              fontWeight: 800,
              color: "#F0F0F8",
              letterSpacing: "-0.025em",
              lineHeight: 1.08,
              textWrap: "balance"
            }}
          >
            AI skills are<br />commoditized and<br />unmonetizable
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body-family)",
              fontSize: "2vw",
              color: "#7B7F9E",
              fontWeight: 300,
              lineHeight: 1.55,
              maxWidth: "43vw",
              marginTop: "3vh"
            }}
          >
            Developers build valuable capabilities, then give them away. There is no market, no ownership, and no reward mechanism.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-[3.5vh]" style={{ width: "36vw", paddingLeft: "4vw" }}>
          <div>
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "6vw",
                fontWeight: 800,
                color: "#8B5CF6",
                lineHeight: 1
              }}
            >
              $0
            </div>
            <div
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.8vw",
                color: "#B0B4D0",
                marginTop: "0.5vh",
                lineHeight: 1.4
              }}
            >
              in royalties when your Skill is<br />wrapped, re-used, or resold by others
            </div>
          </div>
          <div style={{ height: 1, background: "rgba(139,92,246,0.22)", width: "20vw" }} />
          <div>
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "6vw",
                fontWeight: 800,
                color: "#22D3EE",
                lineHeight: 1
              }}
            >
              0%
            </div>
            <div
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.8vw",
                color: "#B0B4D0",
                marginTop: "0.5vh",
                lineHeight: 1.4
              }}
            >
              of AI Skill invocations carry transferable<br />ownership or on-chain resale rights
            </div>
          </div>
          <div style={{ height: 1, background: "rgba(34,211,238,0.18)", width: "20vw" }} />
          <div>
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "6vw",
                fontWeight: 800,
                color: "#B4A0FF",
                lineHeight: 1
              }}
            >
              None
            </div>
            <div
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.8vw",
                color: "#B0B4D0",
                marginTop: "0.5vh",
                lineHeight: 1.4
              }}
            >
              transferable ownership<br />for any AI skill today
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
        02 / 14
      </div>
    </div>
  );
}
