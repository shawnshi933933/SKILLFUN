export default function S07Participate() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 65% 38% at 50% 105%, rgba(34,211,238,0.07) 0%, transparent 60%)"
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div
        className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }}
      />

      <div
        className="absolute inset-0 flex flex-col"
        style={{ paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "5vh", paddingBottom: "5.5vh" }}
      >
        <span
          style={{
            fontFamily: "var(--font-body-family)",
            color: "#22D3EE",
            fontSize: "1.4vw",
            fontWeight: 400,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            marginBottom: "1vh"
          }}
        >
          Participants
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
          Three Ways to Participate
        </h2>

        <div className="flex gap-[2.5vw]" style={{ flex: 1 }}>
          <div
            className="flex flex-col"
            style={{
              flex: 1,
              background: "rgba(139,92,246,0.10)",
              borderRadius: "1vw",
              padding: "3vh 2.5vw",
              border: "1px solid rgba(139,92,246,0.28)"
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: "rgba(139,92,246,0.22)",
                borderRadius: "0.4vw",
                padding: "0.5vh 1.3vw",
                marginBottom: "2vh",
                width: "fit-content"
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "1.3vw",
                  fontWeight: 700,
                  color: "#8B5CF6",
                  letterSpacing: "0.06em"
                }}
              >
                CREATOR
              </span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "2.6vw",
                fontWeight: 800,
                color: "#F0F0F8",
                lineHeight: 1.1
              }}
            >
              Skill Builders
            </div>
            <p
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.7vw",
                color: "#7B7F9E",
                lineHeight: 1.5,
                marginTop: "1.5vh"
              }}
            >
              Developers who package their expertise into callable skills and mint them as NFTs.
            </p>
            <div style={{ marginTop: "auto", paddingTop: "2.5vh" }}>
              <div style={{ height: 1, background: "rgba(139,92,246,0.24)", marginBottom: "1.8vh" }} />
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "1.7vw",
                  fontWeight: 700,
                  color: "#8B5CF6"
                }}
              >
                Earn on every invocation
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.5vw",
                  color: "#7B7F9E",
                  marginTop: "0.5vh"
                }}
              >
                Royalties flow automatically via ERC-8239 on-chain splits
              </div>
            </div>
          </div>

          <div
            className="flex flex-col"
            style={{
              flex: 1,
              background: "rgba(34,211,238,0.07)",
              borderRadius: "1vw",
              padding: "3vh 2.5vw",
              border: "1px solid rgba(34,211,238,0.22)"
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: "rgba(34,211,238,0.14)",
                borderRadius: "0.4vw",
                padding: "0.5vh 1.3vw",
                marginBottom: "2vh",
                width: "fit-content"
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "1.3vw",
                  fontWeight: 700,
                  color: "#22D3EE",
                  letterSpacing: "0.06em"
                }}
              >
                AGENT
              </span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "2.6vw",
                fontWeight: 800,
                color: "#F0F0F8",
                lineHeight: 1.1
              }}
            >
              AI Consumers
            </div>
            <p
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.7vw",
                color: "#7B7F9E",
                lineHeight: 1.5,
                marginTop: "1.5vh"
              }}
            >
              Autonomous agents that discover, license, and invoke skills to extend their own capabilities.
            </p>
            <div style={{ marginTop: "auto", paddingTop: "2.5vh" }}>
              <div style={{ height: 1, background: "rgba(34,211,238,0.20)", marginBottom: "1.8vh" }} />
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "1.7vw",
                  fontWeight: 700,
                  color: "#22D3EE"
                }}
              >
                Pay to license
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.5vw",
                  color: "#7B7F9E",
                  marginTop: "0.5vh"
                }}
              >
                x402 HTTP payment grants call rights instantly — no subscriptions, no off-chain rails
              </div>
            </div>
          </div>

          <div
            className="flex flex-col"
            style={{
              flex: 1,
              background: "rgba(180,160,255,0.07)",
              borderRadius: "1vw",
              padding: "3vh 2.5vw",
              border: "1px solid rgba(180,160,255,0.22)"
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: "rgba(180,160,255,0.14)",
                borderRadius: "0.4vw",
                padding: "0.5vh 1.3vw",
                marginBottom: "2vh",
                width: "fit-content"
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "1.3vw",
                  fontWeight: 700,
                  color: "#B4A0FF",
                  letterSpacing: "0.06em"
                }}
              >
                STAKER
              </span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "2.6vw",
                fontWeight: 800,
                color: "#F0F0F8",
                lineHeight: 1.1
              }}
            >
              Curators
            </div>
            <p
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.7vw",
                color: "#7B7F9E",
                lineHeight: 1.5,
                marginTop: "1.5vh"
              }}
            >
              Token holders who stake on high-quality skills, surfacing the best and earning a share of their revenue.
            </p>
            <div style={{ marginTop: "auto", paddingTop: "2.5vh" }}>
              <div style={{ height: 1, background: "rgba(180,160,255,0.20)", marginBottom: "1.8vh" }} />
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "1.7vw",
                  fontWeight: 700,
                  color: "#B4A0FF"
                }}
              >
                Passive yield
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.5vw",
                  color: "#7B7F9E",
                  marginTop: "0.5vh"
                }}
              >
                Fee share proportional to staked weight on each skill NFT
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
        09 / 13
      </div>
    </div>
  );
}
