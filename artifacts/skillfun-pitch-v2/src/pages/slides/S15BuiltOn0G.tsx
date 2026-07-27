export default function S15BuiltOn0G() {
  const base = import.meta.env.BASE_URL;

  const col = (
    color: string,
    bg: string,
    border: string,
    tag: string,
    title: string,
    subtitle: string,
    items: string[],
    badge: string,
  ) => (
    <div style={{
      flex: 1,
      background: bg,
      border,
      borderRadius: "1.2vw",
      padding: "3vh 2.5vw",
      display: "flex",
      flexDirection: "column",
      gap: "1.4vh",
    }}>
      <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.0vw", fontWeight: 700, color, letterSpacing: "0.18em", textTransform: "uppercase" }}>{tag}</div>
      <div style={{ fontFamily: "var(--font-display-family)", fontSize: "2.6vw", fontWeight: 800, color: "#F0F0F8", lineHeight: 1.08 }}>{title}</div>
      <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.35vw", color: "rgba(240,240,248,0.55)", lineHeight: 1.45 }}>{subtitle}</div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.9vh", marginTop: "0.5vh" }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.7vw" }}>
            <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: color, marginTop: "0.65vh", flexShrink: 0 }} />
            <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#9DA3C8", lineHeight: 1.45 }}>{item}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "auto", paddingTop: "1.5vh", borderTop: `1px solid ${border.replace("1px solid ", "")}` }}>
        <span style={{ fontFamily: "var(--font-body-family)", fontSize: "1.1vw", fontWeight: 700, color, letterSpacing: "0.06em" }}>{badge}</span>
      </div>
    </div>
  );

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "#0D0F14",
        backgroundImage: "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(52,211,153,0.07) 0%, transparent 65%)"
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[0.35vw]" style={{ background: "#34D399" }} />
      <div
        className="absolute top-0 left-0 right-0 h-[0.15vh]"
        style={{ background: "linear-gradient(90deg, #34D399, #22D3EE, transparent)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${base}bg-techstack.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.07
        }}
      />

      <div
        className="absolute inset-0 flex flex-col"
        style={{ paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "4vh", paddingBottom: "4vh" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "3vh" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.4vw", marginBottom: "1vh" }}>
            <span style={{ fontFamily: "var(--font-body-family)", color: "#34D399", fontSize: "1.4vw", fontWeight: 400, letterSpacing: "0.24em", textTransform: "uppercase" }}>
              Infrastructure Partner
            </span>
            <span style={{ fontFamily: "var(--font-body-family)", fontSize: "1.05vw", fontWeight: 700, color: "#34D399", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.40)", borderRadius: "0.3vw", padding: "0.15vh 0.8vw", whiteSpace: "nowrap", letterSpacing: "0.06em" }}>
              Strategic Partnership
            </span>
          </div>
          <h2 style={{ fontFamily: "var(--font-display-family)", fontSize: "4vw", fontWeight: 800, color: "#F0F0F8", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            Built on <span style={{ color: "#34D399" }}>0G</span>
          </h2>
          <p style={{ fontFamily: "var(--font-body-family)", fontSize: "1.55vw", color: "#7B7F9E", fontWeight: 300, marginTop: "0.8vh", maxWidth: "62vw", lineHeight: 1.45 }}>
            0G is the only AI-native decentralized infrastructure that makes private Skill execution possible — combining storage, compute, and settlement in one stack.
          </p>
        </div>

        {/* Three columns */}
        <div style={{ display: "flex", gap: "2.2vw", flex: 1 }}>
          {col(
            "#34D399",
            "rgba(52,211,153,0.07)",
            "1px solid rgba(52,211,153,0.25)",
            "0G Storage",
            "Encrypted\nSkill Storage",
            "Decentralized storage with proxy re-encryption built in",
            [
              "Skill payloads encrypted and stored on 0G Storage at mint",
              "Proxy Re-encryption Oracle rotates keys on NFT transfer — old owner loses access instantly",
              "Decentralized DA layer ensures no single point of censorship",
              "Content hash anchored to each ERC-7857 iNFT on-chain",
            ],
            "0g.ai/storage · Turbo indexer · DA layer"
          )}
          {col(
            "#8B5CF6",
            "rgba(139,92,246,0.08)",
            "1px solid rgba(139,92,246,0.28)",
            "0G Compute",
            "TEE Private\nExecution",
            "Trusted Execution Environments for verifiable, confidential AI inference",
            [
              "Skills execute inside hardware-attested TEE enclaves on 0G Compute",
              "Payment proof (x402) verified on-chain before decryption begins",
              "Implementation never leaves the enclave — callers receive only the result",
              "Execution receipts provide on-chain proof of invocation for royalty settlement",
            ],
            "0g.ai/compute · TEE · Verifiable inference"
          )}
          {col(
            "#22D3EE",
            "rgba(34,211,238,0.07)",
            "1px solid rgba(34,211,238,0.22)",
            "0G Chain",
            "AI-Native\nSettlement",
            "EVM-compatible L1 purpose-built for AI agent economies",
            [
              "ERC-7857 iNFT contracts deployed natively on 0G Chain (chainId 16661)",
              "Sub-second finality — x402 micropayments settle without delay",
              "AI-native gas model optimized for high-frequency agent transactions",
              "Full EVM compatibility — any wallet, any agent framework, any chain bridge",
            ],
            "evmrpc.0g.ai · chainId 16661 · EVM compatible"
          )}
        </div>

        {/* Bottom endorsement */}
        <div style={{ marginTop: "2.5vh", padding: "1.4vh 2.5vw", background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.22)", borderRadius: "0.7vw", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-display-family)", color: "#34D399", fontSize: "1.45vw", fontWeight: 700 }}>
            SkillFun × 0G — the private AI skill economy, powered by the only chain built for it
          </span>
          <span style={{ fontFamily: "var(--font-body-family)", fontSize: "1.05vw", color: "rgba(52,211,153,0.55)", whiteSpace: "nowrap", marginLeft: "2vw" }}>
            0g.ai
          </span>
        </div>
      </div>

      <div
        className="absolute bottom-[3.5vh] right-[3.5vw]"
        style={{ fontFamily: "var(--font-display-family)", color: "#3D4160", fontSize: "1.5vw", fontWeight: 600 }}
      >
        06 / 15
      </div>
    </div>
  );
}
