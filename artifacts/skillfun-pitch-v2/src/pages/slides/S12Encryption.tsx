export default function S12Encryption() {
  const base = import.meta.env.BASE_URL;
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
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${base}bg-encryption.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.10
        }}
      />

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
            <span style={{ fontFamily: "var(--font-body-family)", fontSize: "1.05vw", fontWeight: 600, color: "#34D399", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.40)", borderRadius: "0.3vw", padding: "0.15vh 0.7vw", whiteSpace: "nowrap" }}>Default for All Skills</span>
            <span style={{ fontFamily: "var(--font-body-family)", fontSize: "1.05vw", fontWeight: 600, color: "#B4A0FF", background: "rgba(180,160,255,0.10)", border: "1px solid rgba(180,160,255,0.32)", borderRadius: "0.3vw", padding: "0.15vh 0.7vw", whiteSpace: "nowrap" }}>Powered by 0G</span>
          </div>
          <h2 style={{ fontFamily: "var(--font-display-family)", fontSize: "4vw", fontWeight: 800, color: "#F0F0F8", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            Privacy by Default
          </h2>
          <p style={{ fontFamily: "var(--font-body-family)", fontSize: "1.6vw", color: "#7B7F9E", fontWeight: 300, marginTop: "1vh", maxWidth: "65vw", lineHeight: 1.5 }}>
            Every Skill is encrypted end-to-end on 0G Storage — <span style={{ color: "#F0F0F8" }}>the implementation is never exposed, not even during execution.</span>
          </p>
        </div>

        {/* Three-step invocation flow */}
        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "2.5vh" }}>
          {/* Step 1 */}
          <div style={{ display: "flex", alignItems: "flex-start", flex: 1 }}>
            <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.28)", borderRadius: "0.7vw", padding: "1.8vh 1.6vw", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.7vw", marginBottom: "1.2vh" }}>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "0.95vw", fontWeight: 800, color: "#8B5CF6", background: "rgba(139,92,246,0.18)", borderRadius: "50%", width: "2vw", height: "2vw", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>1</div>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.3vw", fontWeight: 700, color: "#8B5CF6" }}>Mint &amp; Encrypt</div>
              </div>
              <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.05vw", color: "#9DA3C8", lineHeight: 1.5 }}>Creator mints ERC-7857 iNFT — Skill payload encrypted to 0G Storage</div>
              <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.05vw", color: "#9DA3C8", lineHeight: 1.5, marginTop: "0.4vh" }}>Only the NFT holder's key can unlock the content</div>
            </div>
            <div style={{ alignSelf: "center", padding: "0 0.6vw", color: "#3D4160", fontSize: "1.6vw", flexShrink: 0 }}>›</div>
          </div>
          {/* Step 2 */}
          <div style={{ display: "flex", alignItems: "flex-start", flex: 1 }}>
            <div style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: "0.7vw", padding: "1.8vh 1.6vw", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.7vw", marginBottom: "1.2vh" }}>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "0.95vw", fontWeight: 800, color: "#34D399", background: "rgba(52,211,153,0.18)", borderRadius: "50%", width: "2vw", height: "2vw", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>2</div>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.3vw", fontWeight: 700, color: "#34D399" }}>Pay &amp; Authorize</div>
              </div>
              <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.05vw", color: "#9DA3C8", lineHeight: 1.5 }}>Agent pays via x402 — 0G Compute TEE verifies payment proof on-chain</div>
              <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.05vw", color: "#9DA3C8", lineHeight: 1.5, marginTop: "0.4vh" }}>TEE grants one-time execution authorization</div>
            </div>
            <div style={{ alignSelf: "center", padding: "0 0.6vw", color: "#3D4160", fontSize: "1.6vw", flexShrink: 0 }}>›</div>
          </div>
          {/* Step 3 */}
          <div style={{ display: "flex", alignItems: "flex-start", flex: 1 }}>
            <div style={{ background: "rgba(34,211,238,0.07)", border: "1px solid rgba(34,211,238,0.22)", borderRadius: "0.7vw", padding: "1.8vh 1.6vw", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.7vw", marginBottom: "1.2vh" }}>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "0.95vw", fontWeight: 800, color: "#22D3EE", background: "rgba(34,211,238,0.18)", borderRadius: "50%", width: "2vw", height: "2vw", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>3</div>
                <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.3vw", fontWeight: 700, color: "#22D3EE" }}>Execute &amp; Return</div>
              </div>
              <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.05vw", color: "#9DA3C8", lineHeight: 1.5 }}>TEE decrypts inside enclave, executes, returns result to Agent</div>
              <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.05vw", color: "#9DA3C8", lineHeight: 1.5, marginTop: "0.4vh" }}>Implementation never leaves the TEE — Agent sees only the output</div>
            </div>
          </div>
        </div>

        {/* Key guarantees */}
        <div style={{ display: "flex", gap: "4vw" }}>
          {/* Guarantee 1 */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.1vw" }}>
            <div style={{ width: "3.2vw", height: "3.2vw", borderRadius: "50%", flexShrink: 0, background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.5vw", fontWeight: 700, color: "#F0F0F8" }}>Encrypted at rest on 0G Storage</div>
              <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#7B7F9E", lineHeight: 1.45, marginTop: "0.3vh" }}>Skill payload lives on 0G Storage, encrypted. No one — not even SkillFun — can read it without the NFT key.</div>
            </div>
          </div>
          {/* Guarantee 2 */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.1vw" }}>
            <div style={{ width: "3.2vw", height: "3.2vw", borderRadius: "50%", flexShrink: 0, background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.5vw", fontWeight: 700, color: "#F0F0F8" }}>TEE execution — zero plaintext exposure</div>
              <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#7B7F9E", lineHeight: 1.45, marginTop: "0.3vh" }}>Decryption happens only inside the 0G Compute enclave. Plaintext is never written to disk or sent over the wire.</div>
            </div>
          </div>
          {/* Guarantee 3 */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.1vw" }}>
            <div style={{ width: "3.2vw", height: "3.2vw", borderRadius: "50%", flexShrink: 0, background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display-family)", fontSize: "1.5vw", fontWeight: 700, color: "#F0F0F8" }}>0G Proxy Re-encryption on transfer</div>
              <div style={{ fontFamily: "var(--font-body-family)", fontSize: "1.25vw", color: "#7B7F9E", lineHeight: 1.45, marginTop: "0.3vh" }}>When the NFT is sold, the re-encryption oracle rotates the key to the new owner. Previous owner loses access immediately.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3.5vh] right-[3.5vw]"
        style={{ fontFamily: "var(--font-display-family)", color: "#3D4160", fontSize: "1.5vw", fontWeight: 600 }}>
        12 / 15
      </div>
    </div>
  );
}
