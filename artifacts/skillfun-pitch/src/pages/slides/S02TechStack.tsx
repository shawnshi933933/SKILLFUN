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
        className="absolute inset-0 flex"
        style={{ paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "5.5vh", paddingBottom: "5.5vh" }}
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
              marginBottom: "1.2vh"
            }}
          >
            Background
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display-family)",
              fontSize: "4vw",
              fontWeight: 800,
              color: "#F0F0F8",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              marginBottom: "1.5vh"
            }}
          >
            Protocol Landscape
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body-family)",
              fontSize: "1.85vw",
              color: "#7B7F9E",
              fontWeight: 300,
              lineHeight: 1.55,
              maxWidth: "36vw",
              marginBottom: "3vh"
            }}
          >
            A new protocol stack is crystallizing for the AI agent economy — seven layers, each solving a distinct primitive. SkillFun occupies the capability layer.
          </p>

          <div
            style={{
              background: "rgba(139,92,246,0.12)",
              borderRadius: "0.8vw",
              padding: "2vh 2.5vw",
              border: "1px solid rgba(139,92,246,0.30)",
              marginTop: "auto"
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "1.35vw",
                fontWeight: 700,
                color: "#8B5CF6",
                letterSpacing: "0.08em",
                marginBottom: "1.2vh"
              }}
            >
              WHERE WE PLAY
            </div>
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "2.2vw",
                fontWeight: 800,
                color: "#F0F0F8",
                lineHeight: 1.2
              }}
            >
              ERC-8239 — Capability Layer
            </div>
            <div
              style={{
                fontFamily: "var(--font-body-family)",
                fontSize: "1.7vw",
                color: "#9DA3C8",
                marginTop: "0.6vh",
                lineHeight: 1.4
              }}
            >
              Tokenized AI skills: owned, licensed, and monetized as programmable NFTs
            </div>
          </div>
        </div>

        <div
          className="flex flex-col justify-center gap-[1.4vh]"
          style={{ flex: 1, paddingLeft: "4vw" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.8vw",
              background: "rgba(22,25,41,0.85)",
              borderRadius: "0.6vw",
              padding: "1.5vh 2vw",
              border: "1px solid rgba(240,240,248,0.08)"
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                color: "#7B7F9E",
                fontSize: "1.3vw",
                fontWeight: 700,
                minWidth: "10vw",
                letterSpacing: "0.04em"
              }}
            >
              通信层
            </div>
            <div style={{ width: 1, height: "3vh", background: "rgba(240,240,248,0.12)", flexShrink: 0 }} />
            <div>
              <span style={{ fontFamily: "var(--font-display-family)", color: "#B4A0FF", fontSize: "1.6vw", fontWeight: 700 }}>MCP</span>
              <span style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.5vw" }}> (工具) &nbsp;+&nbsp; </span>
              <span style={{ fontFamily: "var(--font-display-family)", color: "#B4A0FF", fontSize: "1.6vw", fontWeight: 700 }}>A2A</span>
              <span style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.5vw" }}> (Agent 间)</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.8vw",
              background: "rgba(22,25,41,0.85)",
              borderRadius: "0.6vw",
              padding: "1.5vh 2vw",
              border: "1px solid rgba(240,240,248,0.08)"
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                color: "#7B7F9E",
                fontSize: "1.3vw",
                fontWeight: 700,
                minWidth: "10vw",
                letterSpacing: "0.04em"
              }}
            >
              身份/信任层
            </div>
            <div style={{ width: 1, height: "3vh", background: "rgba(240,240,248,0.12)", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-display-family)", color: "#B4A0FF", fontSize: "1.6vw", fontWeight: 700 }}>ERC-8004</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.8vw",
              background: "rgba(22,25,41,0.85)",
              borderRadius: "0.6vw",
              padding: "1.5vh 2vw",
              border: "1px solid rgba(240,240,248,0.08)"
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                color: "#7B7F9E",
                fontSize: "1.3vw",
                fontWeight: 700,
                minWidth: "10vw",
                letterSpacing: "0.04em"
              }}
            >
              支付层
            </div>
            <div style={{ width: 1, height: "3vh", background: "rgba(240,240,248,0.12)", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-display-family)", color: "#22D3EE", fontSize: "1.6vw", fontWeight: 700 }}>x402</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.8vw",
              background: "rgba(22,25,41,0.85)",
              borderRadius: "0.6vw",
              padding: "1.5vh 2vw",
              border: "1px solid rgba(240,240,248,0.08)"
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                color: "#7B7F9E",
                fontSize: "1.3vw",
                fontWeight: 700,
                minWidth: "10vw",
                letterSpacing: "0.04em"
              }}
            >
              商业/结算层
            </div>
            <div style={{ width: 1, height: "3vh", background: "rgba(240,240,248,0.12)", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-display-family)", color: "#22D3EE", fontSize: "1.6vw", fontWeight: 700 }}>ERC-8183</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.8vw",
              background: "rgba(139,92,246,0.14)",
              borderRadius: "0.6vw",
              padding: "1.5vh 2vw",
              border: "1px solid rgba(139,92,246,0.40)"
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                color: "#B4A0FF",
                fontSize: "1.3vw",
                fontWeight: 700,
                minWidth: "10vw",
                letterSpacing: "0.04em"
              }}
            >
              能力层
            </div>
            <div style={{ width: 1, height: "3vh", background: "rgba(139,92,246,0.45)", flexShrink: 0 }} />
            <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
              <span style={{ fontFamily: "var(--font-display-family)", color: "#8B5CF6", fontSize: "1.6vw", fontWeight: 700 }}>ERC-8239</span>
              <span
                style={{
                  fontFamily: "var(--font-body-family)",
                  color: "#8B5CF6",
                  fontSize: "1.3vw",
                  background: "rgba(139,92,246,0.25)",
                  borderRadius: "0.3vw",
                  padding: "0.2vh 0.7vw",
                  fontWeight: 500
                }}
              >
                Skill
              </span>
              <span style={{ fontFamily: "var(--font-body-family)", color: "#9370DB", fontSize: "1.4vw", fontWeight: 600 }}>← SkillFun</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.8vw",
              background: "rgba(22,25,41,0.85)",
              borderRadius: "0.6vw",
              padding: "1.5vh 2vw",
              border: "1px solid rgba(240,240,248,0.08)"
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                color: "#7B7F9E",
                fontSize: "1.3vw",
                fontWeight: 700,
                minWidth: "10vw",
                letterSpacing: "0.04em"
              }}
            >
              治理/安全层
            </div>
            <div style={{ width: 1, height: "3vh", background: "rgba(240,240,248,0.12)", flexShrink: 0 }} />
            <div>
              <span style={{ fontFamily: "var(--font-display-family)", color: "#B4A0FF", fontSize: "1.6vw", fontWeight: 700 }}>ERC-8220</span>
              <span style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.4vw" }}> &nbsp;+ ZK/TEE</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.8vw",
              background: "rgba(22,25,41,0.85)",
              borderRadius: "0.6vw",
              padding: "1.5vh 2vw",
              border: "1px solid rgba(240,240,248,0.08)"
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                color: "#7B7F9E",
                fontSize: "1.3vw",
                fontWeight: 700,
                minWidth: "10vw",
                letterSpacing: "0.04em"
              }}
            >
              记忆/存储层
            </div>
            <div style={{ width: 1, height: "3vh", background: "rgba(240,240,248,0.12)", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-body-family)", color: "#7B7F9E", fontSize: "1.5vw", fontStyle: "italic" }}>Emerging</span>
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
