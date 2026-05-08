export default function S10TokenEconomy() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 50% 55% at 14% 52%, rgba(139,92,246,0.08) 0%, transparent 60%)"
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
          Business Model
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
          Token Economy
        </h2>

        <div className="flex gap-[3.5vw]" style={{ flex: 1 }}>
          <div className="flex flex-col gap-[2.5vh]" style={{ width: "50vw" }}>
            <div
              style={{
                background: "rgba(22,25,41,0.8)",
                borderRadius: "0.8vw",
                padding: "2.5vh 2.8vw",
                border: "1px solid rgba(240,240,248,0.08)"
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "1.3vw",
                  fontWeight: 700,
                  color: "#7B7F9E",
                  letterSpacing: "0.08em",
                  marginBottom: "1.8vh"
                }}
              >
                INVOCATION FEE SPLIT
              </div>
              <div className="flex items-end gap-[2.5vw]">
                <div className="text-center">
                  <div
                    style={{
                      fontFamily: "var(--font-display-family)",
                      fontSize: "4.2vw",
                      fontWeight: 800,
                      color: "#8B5CF6",
                      lineHeight: 1
                    }}
                  >
                    ~70%
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body-family)",
                      fontSize: "1.7vw",
                      color: "#B0B4D0",
                      marginTop: "0.5vh"
                    }}
                  >
                    Skill Creator
                  </div>
                </div>
                <div style={{ height: "4.5vh", width: 1, background: "rgba(240,240,248,0.10)" }} />
                <div className="text-center">
                  <div
                    style={{
                      fontFamily: "var(--font-display-family)",
                      fontSize: "4.2vw",
                      fontWeight: 800,
                      color: "#B4A0FF",
                      lineHeight: 1
                    }}
                  >
                    ~20%
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body-family)",
                      fontSize: "1.7vw",
                      color: "#B0B4D0",
                      marginTop: "0.5vh"
                    }}
                  >
                    Stakers
                  </div>
                </div>
                <div style={{ height: "4.5vh", width: 1, background: "rgba(240,240,248,0.10)" }} />
                <div className="text-center">
                  <div
                    style={{
                      fontFamily: "var(--font-display-family)",
                      fontSize: "4.2vw",
                      fontWeight: 800,
                      color: "#22D3EE",
                      lineHeight: 1
                    }}
                  >
                    ~10%
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body-family)",
                      fontSize: "1.7vw",
                      color: "#B0B4D0",
                      marginTop: "0.5vh"
                    }}
                  >
                    Protocol
                  </div>
                </div>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.5vw",
                  color: "#7B7F9E",
                  marginTop: "1.5vh"
                }}
              >
                Splits are configurable per skill — ratios shown are illustrative defaults.
              </p>
            </div>

            <div className="flex gap-[2vw]">
              <div
                style={{
                  flex: 1,
                  background: "rgba(139,92,246,0.10)",
                  borderRadius: "0.8vw",
                  padding: "2.2vh 2.2vw",
                  border: "1px solid rgba(139,92,246,0.25)"
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "1.9vw",
                    fontWeight: 700,
                    color: "#8B5CF6"
                  }}
                >
                  Minting Fee
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.6vw",
                    color: "#7B7F9E",
                    marginTop: "0.8vh"
                  }}
                >
                  One-time fee to tokenize a skill as an ERC-8239 NFT
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  background: "rgba(34,211,238,0.07)",
                  borderRadius: "0.8vw",
                  padding: "2.2vh 2.2vw",
                  border: "1px solid rgba(34,211,238,0.20)"
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display-family)",
                    fontSize: "1.9vw",
                    fontWeight: 700,
                    color: "#22D3EE"
                  }}
                >
                  Secondary Sales
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.6vw",
                    color: "#7B7F9E",
                    marginTop: "0.8vh"
                  }}
                >
                  Protocol fee on all NFT resales; creator royalty enforced on-chain
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                background: "rgba(22,25,41,0.8)",
                borderRadius: "0.8vw",
                padding: "3vh 2.8vw",
                border: "1px solid rgba(240,240,248,0.08)",
                height: "100%"
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "1.3vw",
                  fontWeight: 700,
                  color: "#7B7F9E",
                  letterSpacing: "0.08em",
                  marginBottom: "2vh"
                }}
              >
                SKILL TOKEN UTILITY
              </div>
              <div className="flex flex-col gap-[1.8vh]">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1.2vw" }}>
                  <div
                    style={{
                      width: "0.45vw",
                      height: "0.45vw",
                      background: "#8B5CF6",
                      borderRadius: "50%",
                      marginTop: "0.9vh",
                      flexShrink: 0
                    }}
                  />
                  <div
                    style={{
                      fontFamily: "var(--font-body-family)",
                      fontSize: "1.8vw",
                      color: "#B0B4D0",
                      lineHeight: 1.4
                    }}
                  >
                    Stake to curate skills and earn yield
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1.2vw" }}>
                  <div
                    style={{
                      width: "0.45vw",
                      height: "0.45vw",
                      background: "#B4A0FF",
                      borderRadius: "50%",
                      marginTop: "0.9vh",
                      flexShrink: 0
                    }}
                  />
                  <div
                    style={{
                      fontFamily: "var(--font-body-family)",
                      fontSize: "1.8vw",
                      color: "#B0B4D0",
                      lineHeight: 1.4
                    }}
                  >
                    Governance over protocol parameters
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1.2vw" }}>
                  <div
                    style={{
                      width: "0.45vw",
                      height: "0.45vw",
                      background: "#22D3EE",
                      borderRadius: "50%",
                      marginTop: "0.9vh",
                      flexShrink: 0
                    }}
                  />
                  <div
                    style={{
                      fontFamily: "var(--font-body-family)",
                      fontSize: "1.8vw",
                      color: "#B0B4D0",
                      lineHeight: 1.4
                    }}
                  >
                    Discounted minting for token holders
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1.2vw" }}>
                  <div
                    style={{
                      width: "0.45vw",
                      height: "0.45vw",
                      background: "#7B7F9E",
                      borderRadius: "50%",
                      marginTop: "0.9vh",
                      flexShrink: 0
                    }}
                  />
                  <div
                    style={{
                      fontFamily: "var(--font-body-family)",
                      fontSize: "1.8vw",
                      color: "#B0B4D0",
                      lineHeight: 1.4
                    }}
                  >
                    Required collateral for premium listings
                  </div>
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
        11 / 12
      </div>
    </div>
  );
}
