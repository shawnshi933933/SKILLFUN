export default function S04Solution() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(139,92,246,0.11) 0%, transparent 68%)"
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div
        className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }}
      />

      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
        style={{ paddingLeft: "8vw", paddingRight: "8vw" }}
      >
        <span
          style={{
            fontFamily: "var(--font-body-family)",
            color: "#22D3EE",
            fontSize: "1.4vw",
            fontWeight: 400,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            marginBottom: "2.5vh"
          }}
        >
          The Solution
        </span>

        <h2
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "5.5vw",
            fontWeight: 800,
            color: "#F0F0F8",
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            textWrap: "balance"
          }}
        >
          A skill is a<br />
          <span style={{ color: "#8B5CF6" }}>programmable asset.</span><br />
          Treat it like one.
        </h2>

        <p
          style={{
            fontFamily: "var(--font-body-family)",
            fontSize: "2.1vw",
            color: "#9DA3C8",
            fontWeight: 300,
            maxWidth: "58vw",
            lineHeight: 1.55,
            marginTop: "3.5vh"
          }}
        >
          SkillFun tokenizes AI agent skills as NFTs on the Sepolia testnet, creating the first open market where skills can be owned, traded, licensed, and monetized autonomously.
        </p>

        <div
          className="flex items-center gap-[5vw]"
          style={{ marginTop: "5.5vh" }}
        >
          <div className="text-center">
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "2.8vw",
                fontWeight: 700,
                color: "#8B5CF6"
              }}
            >
              Own
            </div>
            <div
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.7vw",
                color: "#7B7F9E",
                marginTop: "0.5vh"
              }}
            >
              ERC-8239 NFT
            </div>
          </div>
          <div
            style={{
              width: "5vw",
              height: 1,
              background: "linear-gradient(90deg, #8B5CF6, #22D3EE)"
            }}
          />
          <div className="text-center">
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "2.8vw",
                fontWeight: 700,
                color: "#B4A0FF"
              }}
            >
              License
            </div>
            <div
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.7vw",
                color: "#7B7F9E",
                marginTop: "0.5vh"
              }}
            >
              ERC-8239 on-chain terms
            </div>
          </div>
          <div
            style={{
              width: "5vw",
              height: 1,
              background: "linear-gradient(90deg, #8B5CF6, #22D3EE)"
            }}
          />
          <div className="text-center">
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "2.8vw",
                fontWeight: 700,
                color: "#22D3EE"
              }}
            >
              Earn
            </div>
            <div
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.7vw",
                color: "#7B7F9E",
                marginTop: "0.5vh"
              }}
            >
              x402 micropayments
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
        04 / 13
      </div>
    </div>
  );
}
