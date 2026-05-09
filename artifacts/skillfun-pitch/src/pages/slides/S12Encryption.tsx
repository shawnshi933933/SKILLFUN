export default function S12Encryption() {
  const badge = (text: string, color: string, bg: string, border: string) => (
    <span style={{
      fontFamily: "var(--font-body-family)", fontSize: "1.05vw", fontWeight: 600,
      color, background: bg, border: `1px solid ${border}`,
      borderRadius: "0.3vw", padding: "0.15vh 0.7vw", whiteSpace: "nowrap"
    }}>{text}</span>
  );

  const guarantee = (icon: string, title: string, desc: string, color: string) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "1.1vw" }}>
      <div style={{
        width: "3.2vw", height: "3.2vw", borderRadius: "50%", flexShrink: 0,
        background: `rgba(${color},0.12)`, border: `1px solid rgba(${color},0.35)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.4vw"
      }}>{icon}</div>
      <div>
        <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.5vw", fontWeight: 700, color: "#F0F0F8" }}>{title}</div>
        <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#7B7F9E", lineHeight: 1.45, marginTop: "0.3vh" }}>{desc}</div>
      </div>
    </div>
  );

  const step = (num: string, title: string, lines: string[], color: string, borderColor: string, bg: string, last?: boolean) => (
    <div style={{ display: "flex", alignItems: "flex-start", flex: 1 }}>
      <div style={{
        background: bg, border: `1px solid ${borderColor}`,
        borderRadius: "0.7vw", padding: "1.8vh 1.6vw", flex: 1
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7vw", marginBottom: "1.2vh" }}>
          <div style={{
            fontFamily: "var(--font-display-family)", fontSize: "0.95vw", fontWeight: 800,
            color, background: `rgba(${color === "#8B5CF6" ? "139,92,246" : color === "#B4A0FF" ? "180,160,255" : "34,211,238"},0.18)`,
            borderRadius: "50%", width: "2vw", height: "2vw",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>{num}</div>
          <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.3vw", fontWeight: 700, color }}>{title}</div>
        </div>
        {lines.map((l, i) => (
          <div key={i} style={{ fontFamily: "var(--font-body-family)", fontSize: "1.05vw", color: "#9DA3C8", lineHeight: 1.5 }}>{l}</div>
        ))}
      </div>
      {!last && (
        <div style={{ alignSelf: "center", padding: "0 0.6vw", color: "#3D4160", fontSize: "1.6vw", flexShrink: 0 }}>›</div>
      )}
    </div>
  );

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage: "radial-gradient(ellipse 55% 60% at 70% 50%, rgba(139,92,246,0.08) 0%, transparent 65%)"
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#8B5CF6" }} />
      <div className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #8B5CF6, #22D3EE, transparent)" }} />

      <div
        className="absolute inset-0 flex flex-col"
        style={{ paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "5vh", paddingBottom: "5vh" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "2.5vh" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.2vw", marginBottom: "1vh" }}>
            <span style={{ fontFamily: "var(--font-body-family)", color: "#22D3EE", fontSize: "1.35vw", fontWeight: 400, letterSpacing: "0.24em", textTransform: "uppercase" }}>
              IP Protection
            </span>
            {badge("Optional", "#8B5CF6", "rgba(139,92,246,0.12)", "rgba(139,92,246,0.35)")}
            {badge("High-Value Skills", "#B4A0FF", "rgba(180,160,255,0.10)", "rgba(180,160,255,0.32)")}
          </div>
          <h2 style={{ fontFamily: "var(--font-display-family)", fontSize: "4vw", fontWeight: 800, color: "#F0F0F8", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            Encrypted Skill Protection
          </h2>
          <p style={{ fontFamily: "var(--font-body-family)", fontSize: "1.6vw", color: "#7B7F9E", fontWeight: 300, marginTop: "1vh", maxWidth: "60vw", lineHeight: 1.5 }}>
            Anyone who pays can invoke a Skill and get results — <span style={{ color: "#F0F0F8" }}>but the original payload is never exposed.</span>
          </p>
        </div>

        {/* Three-step invocation flow */}
        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "2.5vh" }}>
          {step("1", "Upload & Encrypt",
            ["Creator opts in at mint", "Platform encrypts payload with AES-256", "Each Skill gets its own KMS key", "(AWS KMS / Alibaba Cloud KMS)"],
            "#8B5CF6", "rgba(139,92,246,0.28)", "rgba(139,92,246,0.08)"
          )}
          {step("2", "Invoke & Decrypt",
            ["Agent pays via x402 — no owner check", "MCP Server calls KMS for temp decryption", "Skill executes in isolated context", "Plaintext cleared immediately after"],
            "#B4A0FF", "rgba(180,160,255,0.25)", "rgba(180,160,255,0.07)"
          )}
          {step("3", "NFT Transfer",
            ["Owner transfers NFT freely on-chain", "KMS key is bound to the Skill, not the Owner", "Zero impact on encryption state", "New owner inherits royalty rights only"],
            "#22D3EE", "rgba(34,211,238,0.22)", "rgba(34,211,238,0.07)", true
          )}
        </div>

        {/* Key guarantees */}
        <div style={{ display: "flex", gap: "4vw" }}>
          {guarantee("🔒", "Payload never leaves KMS boundary", "Original Skill content is encrypted at rest. Even the platform cannot read it without a valid x402 payment trigger.", "139,92,246")}
          {guarantee("⚡", "Stateless per-invocation decryption", "MCP Server requests a one-time decryption token. Plaintext exists only in memory during execution — never written to disk.", "180,160,255")}
          {guarantee("🔗", "NFT ownership fully decoupled from IP", "Transferring or trading the NFT has zero effect on the encryption key or Skill availability. Royalties route automatically.", "34,211,238")}
        </div>
      </div>

      <div className="absolute bottom-[3.5vh] right-[3.5vw]"
        style={{ fontFamily: "var(--font-display-family)", color: "#3D4160", fontSize: "1.5vw", fontWeight: 600 }}>
        13 / 14
      </div>
    </div>
  );
}
