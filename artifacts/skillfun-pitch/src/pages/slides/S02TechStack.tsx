export default function S02TechStack() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 65% 55% at 75% 50%, rgba(139,92,246,0.09) 0%, transparent 70%)"
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
          Infrastructure
        </span>
        <h2
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "4vw",
            fontWeight: 800,
            color: "#F0F0F8",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            marginBottom: "1vh"
          }}
        >
          AI Agent Tech Stack
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body-family)",
            fontSize: "1.9vw",
            color: "#7B7F9E",
            fontWeight: 300,
            marginBottom: "2.5vh"
          }}
        >
          SkillFun sits at the convergence of five emerging protocol layers
        </p>

        <div className="flex flex-col gap-[1.6vh]" style={{ flex: 1, justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2.5vw",
              background: "rgba(139,92,246,0.16)",
              borderRadius: "0.6vw",
              padding: "1.8vh 2.8vw",
              border: "1px solid rgba(139,92,246,0.38)"
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                color: "#8B5CF6",
                fontSize: "1.4vw",
                fontWeight: 700,
                minWidth: "13vw",
                letterSpacing: "0.06em"
              }}
            >
              ERC-8239
            </div>
            <div style={{ width: 1, height: "3.5vh", background: "rgba(139,92,246,0.45)" }} />
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  color: "#F0F0F8",
                  fontSize: "2vw",
                  fontWeight: 700,
                  lineHeight: 1.2
                }}
              >
                Skill NFT Standard
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body-family)",
                  color: "#7B7F9E",
                  fontSize: "1.6vw",
                  marginTop: "0.3vh"
                }}
              >
                On-chain ownership, licensing, and royalty enforcement for AI skills
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2.5vw",
              background: "rgba(34,211,238,0.09)",
              borderRadius: "0.6vw",
              padding: "1.8vh 2.8vw",
              border: "1px solid rgba(34,211,238,0.26)"
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                color: "#22D3EE",
                fontSize: "1.4vw",
                fontWeight: 700,
                minWidth: "13vw",
                letterSpacing: "0.06em"
              }}
            >
              ERC-8004
            </div>
            <div style={{ width: 1, height: "3.5vh", background: "rgba(34,211,238,0.35)" }} />
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  color: "#F0F0F8",
                  fontSize: "2vw",
                  fontWeight: 700,
                  lineHeight: 1.2
                }}
              >
                Agent Commerce Protocol
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body-family)",
                  color: "#7B7F9E",
                  fontSize: "1.6vw",
                  marginTop: "0.3vh"
                }}
              >
                Standardized agent-to-agent skill invocation and micropayment settlement
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2.5vw",
              background: "rgba(22,25,41,0.85)",
              borderRadius: "0.6vw",
              padding: "1.8vh 2.8vw",
              border: "1px solid rgba(240,240,248,0.09)"
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                color: "#B4A0FF",
                fontSize: "1.4vw",
                fontWeight: 700,
                minWidth: "13vw",
                letterSpacing: "0.06em"
              }}
            >
              x402
            </div>
            <div style={{ width: 1, height: "3.5vh", background: "rgba(240,240,248,0.14)" }} />
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  color: "#F0F0F8",
                  fontSize: "2vw",
                  fontWeight: 700,
                  lineHeight: 1.2
                }}
              >
                HTTP Payment Layer
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body-family)",
                  color: "#7B7F9E",
                  fontSize: "1.6vw",
                  marginTop: "0.3vh"
                }}
              >
                Coinbase-spec micro-payment gating — pay per API call, no subscriptions
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2.5vw",
              background: "rgba(22,25,41,0.85)",
              borderRadius: "0.6vw",
              padding: "1.8vh 2.8vw",
              border: "1px solid rgba(240,240,248,0.09)"
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                color: "#B4A0FF",
                fontSize: "1.4vw",
                fontWeight: 700,
                minWidth: "13vw",
                letterSpacing: "0.06em"
              }}
            >
              MCP
            </div>
            <div style={{ width: 1, height: "3.5vh", background: "rgba(240,240,248,0.14)" }} />
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  color: "#F0F0F8",
                  fontSize: "2vw",
                  fontWeight: 700,
                  lineHeight: 1.2
                }}
              >
                Model Context Protocol
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body-family)",
                  color: "#7B7F9E",
                  fontSize: "1.6vw",
                  marginTop: "0.3vh"
                }}
              >
                Anthropic open standard — skill discovery and context passing for LLMs
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2.5vw",
              background: "rgba(22,25,41,0.85)",
              borderRadius: "0.6vw",
              padding: "1.8vh 2.8vw",
              border: "1px solid rgba(240,240,248,0.09)"
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                color: "#B4A0FF",
                fontSize: "1.4vw",
                fontWeight: 700,
                minWidth: "13vw",
                letterSpacing: "0.06em"
              }}
            >
              A2A
            </div>
            <div style={{ width: 1, height: "3.5vh", background: "rgba(240,240,248,0.14)" }} />
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display-family)",
                  color: "#F0F0F8",
                  fontSize: "2vw",
                  fontWeight: 700,
                  lineHeight: 1.2
                }}
              >
                Agent-to-Agent Protocol
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body-family)",
                  color: "#7B7F9E",
                  fontSize: "1.6vw",
                  marginTop: "0.3vh"
                }}
              >
                Google open spec — autonomous delegation and orchestration between AI agents
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
        02 / 11
      </div>
    </div>
  );
}
