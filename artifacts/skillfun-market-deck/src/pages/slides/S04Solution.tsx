export default function S04Solution() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative flex flex-col justify-center px-[8vw]"
      style={{ background: '#0D0F14' }}
    >
      <div
        className="absolute bottom-0 left-0 w-[35vw] h-[35vh] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)',
          transform: 'translate(-30%, 30%)',
        }}
      />

      <div
        className="font-body font-semibold tracking-[0.45em] uppercase mb-[2vh]"
        style={{ fontSize: '1.3vw', color: '#22D3EE' }}
      >
        THE SOLUTION
      </div>
      <div
        className="font-display font-bold mb-[5vh]"
        style={{ fontSize: '3.5vw', color: '#F0EEFF', textWrap: 'balance' }}
      >
        Skills as Ownable, Tradeable, Invocable Assets
      </div>

      <div className="grid gap-[2.5vw]" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div
          className="flex flex-col gap-[2.5vh] p-[3vw] rounded-2xl"
          style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)' }}
        >
          <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '3.8vw', height: '3.8vw' }}>
            <rect x="4" y="4" width="48" height="48" rx="12" fill="rgba(139,92,246,0.2)" stroke="#8B5CF6" strokeWidth="2"/>
            <path d="M28 14L34 22H22L28 14Z" fill="#8B5CF6"/>
            <rect x="22" y="24" width="12" height="18" rx="2" fill="#8B5CF6" fillOpacity="0.7"/>
            <circle cx="28" cy="33" r="3" fill="#B4A0FF"/>
          </svg>
          <div>
            <div
              className="font-display font-bold mb-[1.5vh]"
              style={{ fontSize: '2.2vw', color: '#F0EEFF' }}
            >
              Skill NFTs
            </div>
            <div
              className="font-body"
              style={{ fontSize: '1.55vw', color: 'rgba(240,238,255,0.6)', lineHeight: '1.6' }}
            >
              Mint any AI capability as an executable, ownable NFT with on-chain provenance
            </div>
          </div>
          <div
            className="font-body font-medium"
            style={{ fontSize: '1.35vw', color: '#8B5CF6' }}
          >
            Own · License · Transfer
          </div>
        </div>

        <div
          className="flex flex-col gap-[2.5vh] p-[3vw] rounded-2xl"
          style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.25)' }}
        >
          <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '3.8vw', height: '3.8vw' }}>
            <rect x="4" y="4" width="48" height="48" rx="12" fill="rgba(34,211,238,0.15)" stroke="#22D3EE" strokeWidth="2"/>
            <rect x="14" y="22" width="10" height="12" rx="2" fill="#22D3EE" fillOpacity="0.5"/>
            <rect x="27" y="22" width="10" height="12" rx="2" fill="#22D3EE" fillOpacity="0.7"/>
            <path d="M14 18L28 12L42 18" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round"/>
            <rect x="20" y="36" width="16" height="6" rx="2" fill="#22D3EE"/>
          </svg>
          <div>
            <div
              className="font-display font-bold mb-[1.5vh]"
              style={{ fontSize: '2.2vw', color: '#F0EEFF' }}
            >
              Bundle Packs
            </div>
            <div
              className="font-body"
              style={{ fontSize: '1.55vw', color: 'rgba(240,238,255,0.6)', lineHeight: '1.6' }}
            >
              Curate skill collections into thematic bundles sold as a single composable unit
            </div>
          </div>
          <div
            className="font-body font-medium"
            style={{ fontSize: '1.35vw', color: '#22D3EE' }}
          >
            Curate · Package · Sell
          </div>
        </div>

        <div
          className="flex flex-col gap-[2.5vh] p-[3vw] rounded-2xl"
          style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}
        >
          <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '3.8vw', height: '3.8vw' }}>
            <rect x="4" y="4" width="48" height="48" rx="12" fill="rgba(52,211,153,0.15)" stroke="#34D399" strokeWidth="2"/>
            <circle cx="18" cy="28" r="6" fill="#34D399" fillOpacity="0.4" stroke="#34D399" strokeWidth="2"/>
            <circle cx="38" cy="28" r="6" fill="#34D399" fillOpacity="0.4" stroke="#34D399" strokeWidth="2"/>
            <path d="M24 28H32" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M28 18V22M28 34V38" stroke="#34D399" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div>
            <div
              className="font-display font-bold mb-[1.5vh]"
              style={{ fontSize: '2.2vw', color: '#F0EEFF' }}
            >
              One Protocol
            </div>
            <div
              className="font-body"
              style={{ fontSize: '1.55vw', color: 'rgba(240,238,255,0.6)', lineHeight: '1.6' }}
            >
              A single universal endpoint any agent calls to discover, pay, and invoke skills
            </div>
          </div>
          <div
            className="font-body font-medium"
            style={{ fontSize: '1.35vw', color: '#34D399' }}
          >
            Discover · Pay · Invoke
          </div>
        </div>
      </div>
    </div>
  );
}
