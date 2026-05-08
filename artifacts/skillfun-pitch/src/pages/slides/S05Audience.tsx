function UserCard({
  side,
  title,
  subtitle,
  items,
  accent,
  borderColor,
  bgColor,
}: {
  side: "left" | "right";
  title: string;
  subtitle: string;
  items: { label: string; desc: string }[];
  accent: string;
  borderColor: string;
  bgColor: string;
}) {
  return (
    <div
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: "1vw",
        padding: "2.8vh 2.5vw",
        display: "flex",
        flexDirection: "column",
        gap: "1.8vh",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "2vw",
            fontWeight: 800,
            color: accent,
            marginBottom: "0.4vh",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: "var(--font-body-family)",
            fontSize: "1.3vw",
            color: "#7B7F9E",
            fontWeight: 300,
          }}
        >
          {subtitle}
        </div>
      </div>
      <div
        style={{
          height: "1px",
          background: borderColor,
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "1.4vh" }}>
        {items.map((item) => (
          <div key={item.label} style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
            <div
              style={{
                width: "0.5vw",
                height: "0.5vw",
                borderRadius: "50%",
                background: accent,
                flexShrink: 0,
                marginTop: "0.7vh",
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.4vw",
                  fontWeight: 600,
                  color: "#E0E2F0",
                  marginBottom: "0.15vh",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "1.2vw",
                  color: "#7B7F9E",
                  fontWeight: 300,
                  lineHeight: 1.4,
                }}
              >
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function S05Audience() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(139,92,246,0.07) 0%, transparent 70%)",
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div
        className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }}
      />

      <div
        className="absolute inset-0 flex flex-col"
        style={{ paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "3vh", paddingBottom: "3.5vh" }}
      >
        <span
          style={{
            fontFamily: "var(--font-body-family)",
            color: "#22D3EE",
            fontSize: "1.4vw",
            fontWeight: 400,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            marginBottom: "0.5vh",
          }}
        >
          Who It's For
        </span>
        <h2
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "3.5vw",
            fontWeight: 800,
            color: "#F0F0F8",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            marginBottom: "0.4vh",
          }}
        >
          Built for Every Intelligence
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body-family)",
            fontSize: "1.55vw",
            color: "#7B7F9E",
            fontWeight: 300,
            marginBottom: "2.5vh",
          }}
        >
          SkillFun's users are not just humans — autonomous AI agents are first-class participants
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: "0 2.5vw",
            flex: 1,
            alignItems: "stretch",
          }}
        >
          <UserCard
            side="left"
            title="Human Users"
            subtitle="Developers, creators, and users"
            accent="#B4A0FF"
            borderColor="rgba(139,92,246,0.28)"
            bgColor="rgba(139,92,246,0.07)"
            items={[
              {
                label: "Skill Creators",
                desc: "Developers package their expertise into callable skill NFTs and earn royalties on every invocation",
              },
              {
                label: "Skill Users",
                desc: "Anyone can discover and license skills to enhance their own products and workflows",
              },
              {
                label: "Curators & Stakers",
                desc: "Token holders curate quality skills and earn staking rewards as platform usage grows",
              },
            ]}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.2vh",
            }}
          >
            <div
              style={{
                width: "1px",
                height: "8vh",
                background: "linear-gradient(to bottom, transparent, rgba(139,92,246,0.5))",
              }}
            />
            <div
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "1.4vw",
                fontWeight: 800,
                color: "#8B5CF6",
                background: "rgba(139,92,246,0.12)",
                border: "1px solid rgba(139,92,246,0.4)",
                borderRadius: "0.5vw",
                padding: "0.8vh 1.2vw",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              SKILL<br />
              <span style={{ fontSize: "1vw", color: "#7B7F9E", fontWeight: 400 }}>Marketplace</span>
            </div>
            <div
              style={{
                width: "1px",
                height: "8vh",
                background: "linear-gradient(to bottom, rgba(34,211,238,0.5), transparent)",
              }}
            />
          </div>

          <UserCard
            side="right"
            title="AI Agents"
            subtitle="Autonomous agents and multi-agent pipelines"
            accent="#22D3EE"
            borderColor="rgba(34,211,238,0.28)"
            bgColor="rgba(34,211,238,0.06)"
            items={[
              {
                label: "Skill Consumers",
                desc: "Agents discover, purchase, and invoke skills programmatically via MCP — no human approval required",
              },
              {
                label: "Skill Producers",
                desc: "Agents register their own capabilities as skill NFTs, earning revenue autonomously from peer agent usage",
              },
              {
                label: "Composable Pipelines",
                desc: "Multi-agent systems mix and match skills from the marketplace to assemble complex automated workflows",
              },
            ]}
          />
        </div>

        <div
          style={{
            marginTop: "2vh",
            padding: "1.2vh 2.5vw",
            background: "rgba(139,92,246,0.07)",
            border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: "0.6vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1vw",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body-family)",
              color: "#7B7F9E",
              fontSize: "1.3vw",
              fontWeight: 300,
            }}
          >
            In the agentic economy, AI agents will outnumber human buyers.
          </span>
          <span
            style={{
              fontFamily: "var(--font-display-family)",
              color: "#B4A0FF",
              fontSize: "1.3vw",
              fontWeight: 700,
            }}
          >
            SkillFun is designed for both — from day one.
          </span>
        </div>
      </div>

      <div
        className="absolute bottom-[3.5vh] right-[3.5vw]"
        style={{
          fontFamily: "var(--font-display-family)",
          color: "#3D4160",
          fontSize: "1.5vw",
          fontWeight: 600,
        }}
      >
        05 / 13
      </div>
    </div>
  );
}
