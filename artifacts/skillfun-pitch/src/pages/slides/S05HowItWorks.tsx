export default function S05HowItWorks() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 70% 35% at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 55%)"
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
          Workflow
        </span>
        <h2
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "4vw",
            fontWeight: 800,
            color: "#F0F0F8",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            marginBottom: "3.5vh"
          }}
        >
          How It Works
        </h2>

        <div className="flex items-stretch gap-0" style={{ flex: 1 }}>
          <div
            className="flex flex-col justify-between"
            style={{
              flex: 1,
              padding: "3vh 2.5vw",
              background: "rgba(139,92,246,0.13)",
              borderRadius: "0.8vw 0 0 0.8vw",
              border: "1px solid rgba(139,92,246,0.32)"
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "4.5vw",
                  fontWeight: 800,
                  color: "rgba(139,92,246,0.28)",
                  lineHeight: 1
                }}
              >
                01
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "2.5vw",
                  fontWeight: 700,
                  color: "#8B5CF6",
                  marginTop: "1.5vh"
                }}
              >
                Mint
              </div>
            </div>
            <p
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.8vw",
                color: "#B0B4D0",
                lineHeight: 1.5,
                marginTop: "2vh"
              }}
            >
              Package any AI capability as an ERC-8239 NFT — set licensing terms, royalty splits, and usage caps on-chain.
            </p>
          </div>

          <div
            style={{
              width: "3.5vw",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8B5CF6",
              fontSize: "2.2vw",
              fontFamily: "var(--font-display-family)"
            }}
          >
            ›
          </div>

          <div
            className="flex flex-col justify-between"
            style={{
              flex: 1,
              padding: "3vh 2.5vw",
              background: "rgba(22,25,41,0.8)",
              border: "1px solid rgba(240,240,248,0.08)",
              borderLeft: "none",
              borderRight: "none"
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "4.5vw",
                  fontWeight: 800,
                  color: "rgba(180,160,255,0.22)",
                  lineHeight: 1
                }}
              >
                02
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "2.5vw",
                  fontWeight: 700,
                  color: "#B4A0FF",
                  marginTop: "1.5vh"
                }}
              >
                List
              </div>
            </div>
            <p
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.8vw",
                color: "#B0B4D0",
                lineHeight: 1.5,
                marginTop: "2vh"
              }}
            >
              Published to the SkillFun marketplace — discoverable by humans, developers, and autonomous agents alike.
            </p>
          </div>

          <div
            style={{
              width: "3.5vw",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8B5CF6",
              fontSize: "2.2vw",
              fontFamily: "var(--font-display-family)"
            }}
          >
            ›
          </div>

          <div
            className="flex flex-col justify-between"
            style={{
              flex: 1,
              padding: "3vh 2.5vw",
              background: "rgba(22,25,41,0.8)",
              border: "1px solid rgba(240,240,248,0.08)",
              borderLeft: "none",
              borderRight: "none"
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "4.5vw",
                  fontWeight: 800,
                  color: "rgba(34,211,238,0.22)",
                  lineHeight: 1
                }}
              >
                03
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "2.5vw",
                  fontWeight: 700,
                  color: "#22D3EE",
                  marginTop: "1.5vh"
                }}
              >
                Use
              </div>
            </div>
            <p
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.8vw",
                color: "#B0B4D0",
                lineHeight: 1.5,
                marginTop: "2vh"
              }}
            >
              Humans pay once via crypto to license a skill. Agents pay via x402 to acquire call rights — settlement is instant and on-chain.
            </p>
          </div>

          <div
            style={{
              width: "3.5vw",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#22D3EE",
              fontSize: "2.2vw",
              fontFamily: "var(--font-display-family)"
            }}
          >
            ›
          </div>

          <div
            className="flex flex-col justify-between"
            style={{
              flex: 1,
              padding: "3vh 2.5vw",
              background: "rgba(34,211,238,0.08)",
              borderRadius: "0 0.8vw 0.8vw 0",
              border: "1px solid rgba(34,211,238,0.24)"
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "4.5vw",
                  fontWeight: 800,
                  color: "rgba(34,211,238,0.25)",
                  lineHeight: 1
                }}
              >
                04
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "2.5vw",
                  fontWeight: 700,
                  color: "#22D3EE",
                  marginTop: "1.5vh"
                }}
              >
                Earn
              </div>
            </div>
            <p
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.8vw",
                color: "#B0B4D0",
                lineHeight: 1.5,
                marginTop: "2vh"
              }}
            >
              Revenue splits automatically on every transaction — to creator, stakers, and platform. No manual settlement.
            </p>
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
        07 / 13
      </div>
    </div>
  );
}
