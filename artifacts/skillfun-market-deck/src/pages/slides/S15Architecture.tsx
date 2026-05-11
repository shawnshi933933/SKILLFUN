export default function S15Architecture() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative flex flex-col justify-center px-[7vw] py-[4vh]"
      style={{ background: '#0D0F14' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(139,92,246,0.05) 0%, transparent 70%)',
        }}
      />

      <div
        className="font-body font-semibold tracking-[0.45em] uppercase mb-[1.5vh]"
        style={{ fontSize: '1.3vw', color: '#22D3EE' }}
      >
        SYSTEM ARCHITECTURE
      </div>
      <div
        className="font-display font-bold mb-[3vh]"
        style={{ fontSize: '3vw', color: '#F0EEFF' }}
      >
        Full-Stack Protocol Design
      </div>

      <div className="flex-1" style={{ minHeight: 0 }}>
        <svg viewBox="0 0 860 380" style={{ width: '100%', height: '100%', maxHeight: '58vh' }} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="gPurpleArch" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25"/>
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.08"/>
            </linearGradient>
            <linearGradient id="gTealArch" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.06"/>
            </linearGradient>
            <linearGradient id="gGreenArch" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#34D399" stopOpacity="0.06"/>
            </linearGradient>
            <linearGradient id="gYellowArch" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.06"/>
            </linearGradient>
            <marker id="arrArch" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="rgba(139,92,246,0.6)"/>
            </marker>
            <marker id="arrTealArch" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="rgba(34,211,238,0.6)"/>
            </marker>
          </defs>

          <rect x="0" y="0" width="860" height="380" rx="12" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
          <text x="430" y="22" textAnchor="middle" fill="rgba(240,238,255,0.3)" fontSize="10" fontFamily="DM Sans, sans-serif" letterSpacing="3">LAYER ARCHITECTURE</text>

          <rect x="20" y="34" width="820" height="64" rx="8" fill="url(#gPurpleArch)" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.4"/>
          <text x="50" y="58" fill="#B4A0FF" fontSize="11" fontFamily="Syne, sans-serif" fontWeight="700" letterSpacing="1">CLIENT LAYER</text>
          <rect x="50" y="65" width="120" height="22" rx="4" fill="rgba(139,92,246,0.2)" stroke="rgba(139,92,246,0.4)" strokeWidth="1"/>
          <text x="110" y="80" textAnchor="middle" fill="#F0EEFF" fontSize="10" fontFamily="DM Sans, sans-serif">Web App</text>
          <rect x="185" y="65" width="120" height="22" rx="4" fill="rgba(139,92,246,0.2)" stroke="rgba(139,92,246,0.4)" strokeWidth="1"/>
          <text x="245" y="80" textAnchor="middle" fill="#F0EEFF" fontSize="10" fontFamily="DM Sans, sans-serif">Mobile SDK</text>
          <rect x="320" y="65" width="120" height="22" rx="4" fill="rgba(139,92,246,0.2)" stroke="rgba(139,92,246,0.4)" strokeWidth="1"/>
          <text x="380" y="80" textAnchor="middle" fill="#F0EEFF" fontSize="10" fontFamily="DM Sans, sans-serif">Agent API</text>
          <rect x="455" y="65" width="120" height="22" rx="4" fill="rgba(139,92,246,0.2)" stroke="rgba(139,92,246,0.4)" strokeWidth="1"/>
          <text x="515" y="80" textAnchor="middle" fill="#F0EEFF" fontSize="10" fontFamily="DM Sans, sans-serif">CLI Tools</text>

          <line x1="430" y1="98" x2="430" y2="114" stroke="rgba(139,92,246,0.5)" strokeWidth="1.5" markerEnd="url(#arrArch)"/>

          <rect x="20" y="114" width="820" height="64" rx="8" fill="url(#gTealArch)" stroke="#22D3EE" strokeWidth="1" strokeOpacity="0.35"/>
          <text x="50" y="138" fill="#22D3EE" fontSize="11" fontFamily="Syne, sans-serif" fontWeight="700" letterSpacing="1">PROTOCOL LAYER</text>
          <rect x="50" y="145" width="135" height="22" rx="4" fill="rgba(34,211,238,0.15)" stroke="rgba(34,211,238,0.35)" strokeWidth="1"/>
          <text x="117" y="160" textAnchor="middle" fill="#F0EEFF" fontSize="10" fontFamily="DM Sans, sans-serif">Skill Registry</text>
          <rect x="200" y="145" width="135" height="22" rx="4" fill="rgba(34,211,238,0.15)" stroke="rgba(34,211,238,0.35)" strokeWidth="1"/>
          <text x="267" y="160" textAnchor="middle" fill="#F0EEFF" fontSize="10" fontFamily="DM Sans, sans-serif">Marketplace Engine</text>
          <rect x="350" y="145" width="135" height="22" rx="4" fill="rgba(34,211,238,0.15)" stroke="rgba(34,211,238,0.35)" strokeWidth="1"/>
          <text x="417" y="160" textAnchor="middle" fill="#F0EEFF" fontSize="10" fontFamily="DM Sans, sans-serif">Payment Router</text>
          <rect x="500" y="145" width="135" height="22" rx="4" fill="rgba(34,211,238,0.15)" stroke="rgba(34,211,238,0.35)" strokeWidth="1"/>
          <text x="567" y="160" textAnchor="middle" fill="#F0EEFF" fontSize="10" fontFamily="DM Sans, sans-serif">Bundle Manager</text>
          <rect x="650" y="145" width="135" height="22" rx="4" fill="rgba(34,211,238,0.15)" stroke="rgba(34,211,238,0.35)" strokeWidth="1"/>
          <text x="717" y="160" textAnchor="middle" fill="#F0EEFF" fontSize="10" fontFamily="DM Sans, sans-serif">Royalty Engine</text>

          <line x1="430" y1="178" x2="430" y2="194" stroke="rgba(34,211,238,0.5)" strokeWidth="1.5" markerEnd="url(#arrTealArch)"/>

          <rect x="20" y="194" width="820" height="64" rx="8" fill="url(#gGreenArch)" stroke="#34D399" strokeWidth="1" strokeOpacity="0.35"/>
          <text x="50" y="218" fill="#34D399" fontSize="11" fontFamily="Syne, sans-serif" fontWeight="700" letterSpacing="1">EXECUTION LAYER</text>
          <rect x="50" y="225" width="140" height="22" rx="4" fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.35)" strokeWidth="1"/>
          <text x="120" y="240" textAnchor="middle" fill="#F0EEFF" fontSize="10" fontFamily="DM Sans, sans-serif">Lit Protocol (Access)</text>
          <rect x="205" y="225" width="140" height="22" rx="4" fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.35)" strokeWidth="1"/>
          <text x="275" y="240" textAnchor="middle" fill="#F0EEFF" fontSize="10" fontFamily="DM Sans, sans-serif">TEE Sandbox</text>
          <rect x="360" y="225" width="140" height="22" rx="4" fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.35)" strokeWidth="1"/>
          <text x="430" y="240" textAnchor="middle" fill="#F0EEFF" fontSize="10" fontFamily="DM Sans, sans-serif">Model Runtime</text>
          <rect x="515" y="225" width="140" height="22" rx="4" fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.35)" strokeWidth="1"/>
          <text x="585" y="240" textAnchor="middle" fill="#F0EEFF" fontSize="10" fontFamily="DM Sans, sans-serif">Result Verifier</text>
          <rect x="670" y="225" width="140" height="22" rx="4" fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.35)" strokeWidth="1"/>
          <text x="740" y="240" textAnchor="middle" fill="#F0EEFF" fontSize="10" fontFamily="DM Sans, sans-serif">Fee Settlement</text>

          <line x1="430" y1="258" x2="430" y2="274" stroke="rgba(52,211,153,0.5)" strokeWidth="1.5"/>

          <rect x="20" y="274" width="820" height="64" rx="8" fill="url(#gYellowArch)" stroke="#FBBF24" strokeWidth="1" strokeOpacity="0.3"/>
          <text x="50" y="298" fill="#FBBF24" fontSize="11" fontFamily="Syne, sans-serif" fontWeight="700" letterSpacing="1">STORAGE &amp; CHAIN LAYER</text>
          <rect x="50" y="305" width="130" height="22" rx="4" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.3)" strokeWidth="1"/>
          <text x="115" y="320" textAnchor="middle" fill="#F0EEFF" fontSize="10" fontFamily="DM Sans, sans-serif">Solana (NFT)</text>
          <rect x="195" y="305" width="130" height="22" rx="4" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.3)" strokeWidth="1"/>
          <text x="260" y="320" textAnchor="middle" fill="#F0EEFF" fontSize="10" fontFamily="DM Sans, sans-serif">Ethereum / L2</text>
          <rect x="340" y="305" width="130" height="22" rx="4" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.3)" strokeWidth="1"/>
          <text x="405" y="320" textAnchor="middle" fill="#F0EEFF" fontSize="10" fontFamily="DM Sans, sans-serif">Arweave</text>
          <rect x="485" y="305" width="130" height="22" rx="4" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.3)" strokeWidth="1"/>
          <text x="550" y="320" textAnchor="middle" fill="#F0EEFF" fontSize="10" fontFamily="DM Sans, sans-serif">Chainlink Oracle</text>
          <rect x="630" y="305" width="130" height="22" rx="4" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.3)" strokeWidth="1"/>
          <text x="695" y="320" textAnchor="middle" fill="#F0EEFF" fontSize="10" fontFamily="DM Sans, sans-serif">IPFS Metadata</text>

          <text x="430" y="365" textAnchor="middle" fill="rgba(240,238,255,0.2)" fontSize="9" fontFamily="DM Sans, sans-serif">All layers communicate via signed on-chain messages · Zero trusted intermediaries</text>
        </svg>
      </div>
    </div>
  );
}
