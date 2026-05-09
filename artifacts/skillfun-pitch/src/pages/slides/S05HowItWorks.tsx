import React from "react";

export default function S05HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Mint",
      color: "#8B5CF6",
      dimColor: "rgba(139,92,246,0.22)",
      bg: "rgba(139,92,246,0.13)",
      border: "1px solid rgba(139,92,246,0.32)",
      borderLeft: undefined as string | undefined,
      borderRight: "none",
      radius: "0.8vw 0 0 0.8vw",
      body: "Creator packages any AI capability as an ERC-8239 NFT. Sets Base Price and the Creator:Owner royalty split on-chain.",
    },
    {
      n: "02",
      title: "Bundle",
      color: "#B4A0FF",
      dimColor: "rgba(180,160,255,0.20)",
      bg: "rgba(22,25,41,0.8)",
      border: "1px solid rgba(240,240,248,0.08)",
      borderLeft: "none",
      borderRight: "none",
      radius: "0",
      body: "Curator selects Skills and creates a composite tool with orchestration rules. Sets Markup percentage and the Staker share.",
    },
    {
      n: "03",
      title: "Discover",
      color: "#9DA3C8",
      dimColor: "rgba(157,163,200,0.18)",
      bg: "rgba(22,25,41,0.8)",
      border: "1px solid rgba(240,240,248,0.08)",
      borderLeft: "none",
      borderRight: "none",
      radius: "0",
      body: "Agent adds a single SkillFun MCP endpoint. Every Bundle and Skill appears instantly as a native callable tool — no extra integrations.",
    },
    {
      n: "04",
      title: "Pay",
      color: "#22D3EE",
      dimColor: "rgba(34,211,238,0.20)",
      bg: "rgba(22,25,41,0.8)",
      border: "1px solid rgba(240,240,248,0.08)",
      borderLeft: "none",
      borderRight: "none",
      radius: "0",
      body: "x402 HTTP payment — Base Price plus Curator Markup, calculated on-chain. Acquires call rights instantly. No subscriptions.",
    },
    {
      n: "05",
      title: "Earn",
      color: "#22D3EE",
      dimColor: "rgba(34,211,238,0.22)",
      bg: "rgba(34,211,238,0.08)",
      border: "1px solid rgba(34,211,238,0.24)",
      borderLeft: "none",
      borderRight: undefined as string | undefined,
      radius: "0 0.8vw 0.8vw 0",
      body: "ERC-8183 auto-splits: Creator + Owner share the base; Curator + Stakers share the markup; Platform takes 10%. Zero manual settlement.",
    },
  ];

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

        <div className="flex items-stretch" style={{ flex: 1 }}>
          {steps.map((step, i) => (
            <React.Fragment key={step.n}>
              <div
                className="flex flex-col justify-between"
                style={{
                  flex: 1,
                  padding: "3vh 2vw",
                  background: step.bg,
                  borderRadius: step.radius,
                  border: step.border,
                  borderLeft: step.borderLeft,
                  borderRight: step.borderRight,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display-family)",
                      fontSize: "3.8vw",
                      fontWeight: 800,
                      color: step.dimColor,
                      lineHeight: 1
                    }}
                  >
                    {step.n}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display-family)",
                      fontSize: "2.1vw",
                      fontWeight: 700,
                      color: step.color,
                      marginTop: "1.2vh"
                    }}
                  >
                    {step.title}
                  </div>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-body-family)",
                    fontSize: "1.55vw",
                    color: "#B0B4D0",
                    lineHeight: 1.5,
                    marginTop: "2vh"
                  }}
                >
                  {step.body}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div
                  style={{
                    width: "2.8vw",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#8B5CF6",
                    fontSize: "2vw",
                    fontFamily: "var(--font-display-family)",
                    flexShrink: 0,
                  }}
                >
                  ›
                </div>
              )}
            </React.Fragment>
          ))}
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
        07 / 14
      </div>
    </div>
  );
}
