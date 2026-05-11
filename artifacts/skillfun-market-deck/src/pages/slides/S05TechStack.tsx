export default function S05TechStack() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative flex flex-col justify-center px-[8vw]"
      style={{ background: '#0D0F14' }}
    >
      <div
        className="absolute top-0 right-0 w-[30vw] h-[50vh]"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, transparent 60%)',
          transform: 'translate(10%, -5%)',
        }}
      />

      <div
        className="font-body font-semibold tracking-[0.45em] uppercase mb-[2vh]"
        style={{ fontSize: '1.3vw', color: '#22D3EE' }}
      >
        PROTOCOL LANDSCAPE
      </div>
      <div
        className="font-display font-bold mb-[4vh]"
        style={{ fontSize: '3.5vw', color: '#F0EEFF' }}
      >
        Multi-Chain Infrastructure
      </div>

      <div className="grid gap-[1.8vh]" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div
          className="flex items-center gap-[2vw] px-[2vw] py-[1.8vh] rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="rounded-lg flex items-center justify-center shrink-0"
            style={{ width: '3.5vw', height: '3.5vw', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}
          >
            <div className="font-display font-black" style={{ fontSize: '1.5vw', color: '#8B5CF6' }}>S</div>
          </div>
          <div>
            <div className="font-display font-semibold" style={{ fontSize: '1.7vw', color: '#F0EEFF' }}>Solana</div>
            <div className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(240,238,255,0.45)' }}>NFT Minting · Metaplex Standard</div>
          </div>
          <div className="ml-auto font-body font-medium" style={{ fontSize: '1.25vw', color: '#8B5CF6' }}>Primary</div>
        </div>

        <div
          className="flex items-center gap-[2vw] px-[2vw] py-[1.8vh] rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="rounded-lg flex items-center justify-center shrink-0"
            style={{ width: '3.5vw', height: '3.5vw', background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.25)' }}
          >
            <div className="font-display font-black" style={{ fontSize: '1.5vw', color: '#22D3EE' }}>E</div>
          </div>
          <div>
            <div className="font-display font-semibold" style={{ fontSize: '1.7vw', color: '#F0EEFF' }}>Ethereum / L2s</div>
            <div className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(240,238,255,0.45)' }}>ERC-6551 · Token Bound Accounts</div>
          </div>
          <div className="ml-auto font-body font-medium" style={{ fontSize: '1.25vw', color: '#22D3EE' }}>Bridge</div>
        </div>

        <div
          className="flex items-center gap-[2vw] px-[2vw] py-[1.8vh] rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="rounded-lg flex items-center justify-center shrink-0"
            style={{ width: '3.5vw', height: '3.5vw', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}
          >
            <div className="font-display font-black" style={{ fontSize: '1.5vw', color: '#34D399' }}>A</div>
          </div>
          <div>
            <div className="font-display font-semibold" style={{ fontSize: '1.7vw', color: '#F0EEFF' }}>Arweave</div>
            <div className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(240,238,255,0.45)' }}>Permanent Storage · Encrypted Vaults</div>
          </div>
          <div className="ml-auto font-body font-medium" style={{ fontSize: '1.25vw', color: '#34D399' }}>Storage</div>
        </div>

        <div
          className="flex items-center gap-[2vw] px-[2vw] py-[1.8vh] rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="rounded-lg flex items-center justify-center shrink-0"
            style={{ width: '3.5vw', height: '3.5vw', background: 'rgba(180,160,255,0.12)', border: '1px solid rgba(180,160,255,0.25)' }}
          >
            <div className="font-display font-black" style={{ fontSize: '1.5vw', color: '#B4A0FF' }}>L</div>
          </div>
          <div>
            <div className="font-display font-semibold" style={{ fontSize: '1.7vw', color: '#F0EEFF' }}>Lit Protocol</div>
            <div className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(240,238,255,0.45)' }}>Access Control · Key Management</div>
          </div>
          <div className="ml-auto font-body font-medium" style={{ fontSize: '1.25vw', color: '#B4A0FF' }}>Access</div>
        </div>

        <div
          className="flex items-center gap-[2vw] px-[2vw] py-[1.8vh] rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="rounded-lg flex items-center justify-center shrink-0"
            style={{ width: '3.5vw', height: '3.5vw', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)' }}
          >
            <div className="font-display font-black" style={{ fontSize: '1.5vw', color: '#FBBF24' }}>C</div>
          </div>
          <div>
            <div className="font-display font-semibold" style={{ fontSize: '1.7vw', color: '#F0EEFF' }}>Chainlink</div>
            <div className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(240,238,255,0.45)' }}>Oracles · Cross-chain CCIP</div>
          </div>
          <div className="ml-auto font-body font-medium" style={{ fontSize: '1.25vw', color: '#FBBF24' }}>Oracle</div>
        </div>

        <div
          className="flex items-center gap-[2vw] px-[2vw] py-[1.8vh] rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="rounded-lg flex items-center justify-center shrink-0"
            style={{ width: '3.5vw', height: '3.5vw', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)' }}
          >
            <div className="font-display font-black" style={{ fontSize: '1.5vw', color: '#F87171' }}>O</div>
          </div>
          <div>
            <div className="font-display font-semibold" style={{ fontSize: '1.7vw', color: '#F0EEFF' }}>OpenAI / Claude</div>
            <div className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(240,238,255,0.45)' }}>Model Execution · API Runtime</div>
          </div>
          <div className="ml-auto font-body font-medium" style={{ fontSize: '1.25vw', color: '#F87171' }}>Runtime</div>
        </div>
      </div>
    </div>
  );
}
