export default function S11TeamAsk() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 70% 48% at 50% 105%, rgba(139,92,246,0.10) 0%, transparent 60%)"
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div
        className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }}
      />

      <div
        className="absolute inset-0 flex flex-col"
        style={{ paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "5.5vh", paddingBottom: "5.5vh" }}
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
          Team &amp; Ask
        </span>
        <h2
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "4vw",
            fontWeight: 800,
            color: "#F0F0F8",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            marginBottom: "3vh"
          }}
        >
          Who We Are
        </h2>

        <div className="flex gap-[4vw]" style={{ flex: 1 }}>
          <div className="flex flex-col gap-[2vh]" style={{ width: "50vw" }}>
            <div className="flex gap-[2vw]">
              <div
                style={{
                  flex: 1,
                  background: "rgba(22,25,41,0.8)",
                  borderRadius: "0.8vw",
                  padding: "2.5vh 2vw",
                  border: "1px solid rgba(240,240,248,0.08)"
                }}
              >
                <div
                  style={{
                    width: "4vw",
                    height: "4vw",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
                    marginBottom: "1.5vh"
                  }}
                />
                <div
                  style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "2vw",
                    fontWeight: 700,
                    color: "#F0F0F8"
                  }}
                >
                  Founder / CEO
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.6vw",
                    color: "#7B7F9E",
                    marginTop: "0.5vh",
                    lineHeight: 1.45
                  }}
                >
                  Full-stack + blockchain. Previously built DeFi protocol at top-10 L1. 8 yrs Web3.
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  background: "rgba(22,25,41,0.8)",
                  borderRadius: "0.8vw",
                  padding: "2.5vh 2vw",
                  border: "1px solid rgba(240,240,248,0.08)"
                }}
              >
                <div
                  style={{
                    width: "4vw",
                    height: "4vw",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #22D3EE, #0891B2)",
                    marginBottom: "1.5vh"
                  }}
                />
                <div
                  style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "2vw",
                    fontWeight: 700,
                    color: "#F0F0F8"
                  }}
                >
                  CTO
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.6vw",
                    color: "#7B7F9E",
                    marginTop: "0.5vh",
                    lineHeight: 1.45
                  }}
                >
                  AI infra. Ex-Google Brain. Led LLM fine-tuning at Series B AI startup. 12 yrs ML.
                </div>
              </div>
            </div>
            <div className="flex gap-[2vw]">
              <div
                style={{
                  flex: 1,
                  background: "rgba(22,25,41,0.8)",
                  borderRadius: "0.8vw",
                  padding: "2.5vh 2vw",
                  border: "1px solid rgba(240,240,248,0.08)"
                }}
              >
                <div
                  style={{
                    width: "4vw",
                    height: "4vw",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #B4A0FF, #7C3AED)",
                    marginBottom: "1.5vh"
                  }}
                />
                <div
                  style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "2vw",
                    fontWeight: 700,
                    color: "#F0F0F8"
                  }}
                >
                  Head of Growth
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.6vw",
                    color: "#7B7F9E",
                    marginTop: "0.5vh",
                    lineHeight: 1.45
                  }}
                >
                  KOL network of 200+ AI creators. Grew prior crypto project to 500K users.
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  background: "rgba(22,25,41,0.8)",
                  borderRadius: "0.8vw",
                  padding: "2.5vh 2vw",
                  border: "1px solid rgba(240,240,248,0.08)"
                }}
              >
                <div
                  style={{
                    width: "4vw",
                    height: "4vw",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #34D399, #059669)",
                    marginBottom: "1.5vh"
                  }}
                />
                <div
                  style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "2vw",
                    fontWeight: 700,
                    color: "#F0F0F8"
                  }}
                >
                  Protocol Lead
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.6vw",
                    color: "#7B7F9E",
                    marginTop: "0.5vh",
                    lineHeight: 1.45
                  }}
                >
                  ERC standards contributor. Co-authored ERC-8004 spec. 6 yrs Solidity.
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center" style={{ flex: 1 }}>
            <div
              style={{
                background: "rgba(139,92,246,0.11)",
                borderRadius: "1vw",
                padding: "3.5vh 3vw",
                border: "1px solid rgba(139,92,246,0.32)"
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "1.4vw",
                  fontWeight: 700,
                  color: "#8B5CF6",
                  letterSpacing: "0.08em",
                  marginBottom: "1.8vh"
                }}
              >
                SEED ROUND
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "5.5vw",
                  fontWeight: 800,
                  color: "#F0F0F8",
                  lineHeight: 1
                }}
              >
                $3M
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.9vw",
                  color: "#9DA3C8",
                  marginTop: "0.8vh"
                }}
              >
                Pre-seed · $18M cap
              </div>
              <div
                style={{
                  height: 1,
                  background: "rgba(139,92,246,0.24)",
                  margin: "2.5vh 0"
                }}
              />
              <div className="flex flex-col gap-[1.5vh]">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-body-family)",
                      fontSize: "1.7vw",
                      color: "#7B7F9E"
                    }}
                  >
                    Protocol development
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display-family)",
                      fontSize: "1.7vw",
                      fontWeight: 700,
                      color: "#F0F0F8"
                    }}
                  >
                    40%
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-body-family)",
                      fontSize: "1.7vw",
                      color: "#7B7F9E"
                    }}
                  >
                    KOL partnerships
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display-family)",
                      fontSize: "1.7vw",
                      fontWeight: 700,
                      color: "#F0F0F8"
                    }}
                  >
                    30%
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-body-family)",
                      fontSize: "1.7vw",
                      color: "#7B7F9E"
                    }}
                  >
                    Team
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display-family)",
                      fontSize: "1.7vw",
                      fontWeight: 700,
                      color: "#F0F0F8"
                    }}
                  >
                    20%
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-body-family)",
                      fontSize: "1.7vw",
                      color: "#7B7F9E"
                    }}
                  >
                    Operations
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display-family)",
                      fontSize: "1.7vw",
                      fontWeight: 700,
                      color: "#F0F0F8"
                    }}
                  >
                    10%
                  </span>
                </div>
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
        11 / 11
      </div>
    </div>
  );
}
