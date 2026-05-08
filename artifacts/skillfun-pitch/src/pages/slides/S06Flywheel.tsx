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
            Token Economy
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
            Each successful invocation generates value that compounds across all participants.
          </p>

          <div className="flex flex-col gap-[2.2vh]" style={{ marginTop: "4.5vh" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.8vw" }}>
              <div
                style={{
                  width: "0.55vw",
                  height: "0.55vw",
                  background: "#8B5CF6",
                  borderRadius: "50%",
                  marginTop: "0.9vh",
                  flexShrink: 0
                }}
              />
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "2vw",
                    fontWeight: 700,
                    color: "#F0F0F8"
                  }}
                >
                  More skills listed
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.7vw",
                    color: "#7B7F9E"
                  }}
                >
                  attracts more agent developers and use cases
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.8vw" }}>
              <div
                style={{
                  width: "0.55vw",
                  height: "0.55vw",
                  background: "#B4A0FF",
                  borderRadius: "50%",
                  marginTop: "0.9vh",
                  flexShrink: 0
                }}
              />
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "2vw",
                    fontWeight: 700,
                    color: "#F0F0F8"
                  }}
                >
                  More usage generates fees
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.7vw",
                    color: "#7B7F9E"
                  }}
                >
                  which rewards stakers and creators on-chain
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.8vw" }}>
              <div
                style={{
                  width: "0.55vw",
                  height: "0.55vw",
                  background: "#22D3EE",
                  borderRadius: "50%",
                  marginTop: "0.9vh",
                  flexShrink: 0
                }}
              />
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "2vw",
                    fontWeight: 700,
                    color: "#F0F0F8"
                  }}
                >
                  Higher rewards attract KOLs
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.7vw",
                    color: "#7B7F9E"
                  }}
                >
                  who distill more high-quality skills into the market
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-center"
          style={{ width: "44vw" }}
        >
          <div className="relative" style={{ width: "33vw", height: "33vw" }}>
            <div
              className="absolute inset-0 rounded-full"
              style={{ border: "1px solid rgba(139,92,246,0.18)" }}
            />
            <div
              className="absolute rounded-full"
              style={{ inset: "11%", border: "1px solid rgba(139,92,246,0.10)" }}
            />
            <div
              className="absolute rounded-full"
              style={{
                inset: "23%",
                background: "rgba(139,92,246,0.07)",
                border: "1px solid rgba(139,92,246,0.22)"
              }}
            />

            <div
              className="absolute text-center"
              style={{ top: "1%", left: "50%", transform: "translateX(-50%)" }}
            >
              <div
                style={{
                  background: "rgba(139,92,246,0.17)",
                  border: "1px solid rgba(139,92,246,0.42)",
                  borderRadius: "0.5vw",
                  padding: "0.8vh 1.6vw"
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "1.6vw",
                    fontWeight: 700,
                    color: "#8B5CF6"
                  }}
                >
                  Creators
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.3vw",
                    color: "#7B7F9E"
                  }}
                >
                  Distill Skills
                </div>
              </div>
            </div>

            <div
              className="absolute"
              style={{ bottom: "13%", left: "-3%", transform: "translateX(0)" }}
            >
              <div
                style={{
                  background: "rgba(34,211,238,0.09)",
                  border: "1px solid rgba(34,211,238,0.30)",
                  borderRadius: "0.5vw",
                  padding: "0.8vh 1.6vw"
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "1.6vw",
                    fontWeight: 700,
                    color: "#22D3EE"
                  }}
                >
                  Agents
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.3vw",
                    color: "#7B7F9E"
                  }}
                >
                  Invoke &amp; Pay
                </div>
              </div>
            </div>

            <div
              className="absolute"
              style={{ bottom: "13%", right: "-3%", transform: "translateX(0)" }}
            >
              <div
                style={{
                  background: "rgba(180,160,255,0.10)",
                  border: "1px solid rgba(180,160,255,0.30)",
                  borderRadius: "0.5vw",
                  padding: "0.8vh 1.6vw"
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "1.6vw",
                    fontWeight: 700,
                    color: "#B4A0FF"
                  }}
                >
                  Stakers
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.3vw",
                    color: "#7B7F9E"
                  }}
                >
                  Curate &amp; Earn
                </div>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div
                  style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "2.2vw",
                    fontWeight: 800,
                    color: "#8B5CF6"
                  }}
                >
                  SKILL
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.4vw",
                    color: "#7B7F9E"
                  }}
                >
                  Token
                </div>
              </div>
            </div>

            <svg
              className="absolute inset-0"
              width="100%"
              height="100%"
              viewBox="0 0 200 200"
              fill="none"
            >
              <path
                d="M 100 16 A 84 84 0 0 1 172 145"
                stroke="#8B5CF6"
                strokeWidth="1.5"
                strokeDasharray="5 4"
                fill="none"
                opacity="0.45"
              />
              <path
                d="M 172 145 A 84 84 0 0 1 28 145"
                stroke="#22D3EE"
                strokeWidth="1.5"
                strokeDasharray="5 4"
                fill="none"
                opacity="0.38"
              />
              <path
                d="M 28 145 A 84 84 0 0 1 100 16"
                stroke="#B4A0FF"
                strokeWidth="1.5"
                strokeDasharray="5 4"
                fill="none"
                opacity="0.38"
              />
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
        06 / 11
      </div>
    </div>
  );
}
