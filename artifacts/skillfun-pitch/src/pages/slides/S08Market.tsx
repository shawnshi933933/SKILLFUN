export default function S08Market() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 80% 38% at 50% -8%, rgba(139,92,246,0.09) 0%, transparent 60%)"
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div
        className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }}
      />

      <div
        className="absolute inset-0 flex flex-col"
        style={{ paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "5.5vh", paddingBottom: "6vh" }}
      >
        <span
          style={{
            fontFamily: "var(--font-body-family)",
            color: "#22D3EE",
            fontSize: "1.4vw",
            fontWeight: 400,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            marginBottom: "1.2vh"
          }}
        >
          Opportunity
        </span>
        <h2
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "4.2vw",
            fontWeight: 800,
            color: "#F0F0F8",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            marginBottom: "3vh"
          }}
        >
          Market Opportunity
        </h2>

        <div className="flex gap-[4.5vw]" style={{ flex: 1, alignItems: "center" }}>
          <div className="flex flex-col gap-[3vh]" style={{ width: "46vw" }}>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "7vw",
                  fontWeight: 800,
                  color: "#8B5CF6",
                  lineHeight: 1,
                  letterSpacing: "-0.03em"
                }}
              >
                $1.8T
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.9vw",
                  color: "#B0B4D0",
                  marginTop: "0.5vh"
                }}
              >
                AI software market by 2030
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.5vw",
                  color: "#7B7F9E",
                  marginTop: "0.3vh"
                }}
              >
                Grand View Research, 2024
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(139,92,246,0.20)" }} />

            <div className="flex gap-[5vw]">
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "4.2vw",
                    fontWeight: 800,
                    color: "#B4A0FF",
                    lineHeight: 1
                  }}
                >
                  $210B
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.8vw",
                    color: "#B0B4D0",
                    marginTop: "0.5vh"
                  }}
                >
                  AI agent services SAM
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.5vw",
                    color: "#7B7F9E",
                    marginTop: "0.3vh"
                  }}
                >
                  2028 est.
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "4.2vw",
                    fontWeight: 800,
                    color: "#22D3EE",
                    lineHeight: 1
                  }}
                >
                  $12B
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.8vw",
                    color: "#B0B4D0",
                    marginTop: "0.5vh"
                  }}
                >
                  Skill marketplace SOM
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.5vw",
                    color: "#7B7F9E",
                    marginTop: "0.3vh"
                  }}
                >
                  Year 3 target
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[2vh]" style={{ flex: 1 }}>
            <div
              style={{
                padding: "2.2vh 2.5vw",
                background: "rgba(139,92,246,0.10)",
                borderRadius: "0.8vw",
                border: "1px solid rgba(139,92,246,0.26)"
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "2vw",
                  fontWeight: 700,
                  color: "#F0F0F8"
                }}
              >
                1B+ AI agent tasks / day
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.6vw",
                  color: "#7B7F9E",
                  marginTop: "0.5vh"
                }}
              >
                projected by 2027 across major platforms
              </div>
            </div>
            <div
              style={{
                padding: "2.2vh 2.5vw",
                background: "rgba(22,25,41,0.8)",
                borderRadius: "0.8vw",
                border: "1px solid rgba(240,240,248,0.08)"
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "2vw",
                  fontWeight: 700,
                  color: "#F0F0F8"
                }}
              >
                Every task needs skills
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.6vw",
                  color: "#7B7F9E",
                  marginTop: "0.5vh"
                }}
              >
                Planning, coding, research, writing — all skill-driven
              </div>
            </div>
            <div
              style={{
                padding: "2.2vh 2.5vw",
                background: "rgba(34,211,238,0.07)",
                borderRadius: "0.8vw",
                border: "1px solid rgba(34,211,238,0.20)"
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "2vw",
                  fontWeight: 700,
                  color: "#F0F0F8"
                }}
              >
                No incumbent owns this layer
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.6vw",
                  color: "#7B7F9E",
                  marginTop: "0.5vh"
                }}
              >
                The skill commerce layer is still unclaimed
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
        09 / 12
      </div>
    </div>
  );
}
