export default function S08HowItWorks() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative flex flex-col justify-center px-[8vw]"
      style={{ background: '#0D0F14' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 40% at 50% 100%, rgba(139,92,246,0.07) 0%, transparent 60%)',
        }}
      />

      <div
        className="font-body font-semibold tracking-[0.45em] uppercase mb-[2vh]"
        style={{ fontSize: '1.3vw', color: '#22D3EE' }}
      >
        HOW IT WORKS
      </div>
      <div
        className="font-display font-bold mb-[5vh]"
        style={{ fontSize: '3.5vw', color: '#F0EEFF' }}
      >
        Five Steps to the Skill Economy
      </div>

      <div className="grid gap-[1.5vw]" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div
          className="flex flex-col gap-[2vh] p-[2vw] rounded-xl"
          style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)' }}
        >
          <div className="font-display font-black" style={{ fontSize: '3.5vw', color: 'rgba(139,92,246,0.5)' }}>01</div>
          <div className="font-display font-bold" style={{ fontSize: '1.7vw', color: '#8B5CF6' }}>Mint</div>
          <div className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(240,238,255,0.6)', lineHeight: '1.5' }}>
            Upload and mint any AI skill as an on-chain NFT
          </div>
        </div>

        <div
          className="flex flex-col gap-[2vh] p-[2vw] rounded-xl"
          style={{ background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.22)' }}
        >
          <div className="font-display font-black" style={{ fontSize: '3.5vw', color: 'rgba(34,211,238,0.4)' }}>02</div>
          <div className="font-display font-bold" style={{ fontSize: '1.7vw', color: '#22D3EE' }}>Bundle</div>
          <div className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(240,238,255,0.6)', lineHeight: '1.5' }}>
            Curators combine skills into thematic packs
          </div>
        </div>

        <div
          className="flex flex-col gap-[2vh] p-[2vw] rounded-xl"
          style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.22)' }}
        >
          <div className="font-display font-black" style={{ fontSize: '3.5vw', color: 'rgba(52,211,153,0.4)' }}>03</div>
          <div className="font-display font-bold" style={{ fontSize: '1.7vw', color: '#34D399' }}>Discover</div>
          <div className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(240,238,255,0.6)', lineHeight: '1.5' }}>
            Agents search the marketplace by capability
          </div>
        </div>

        <div
          className="flex flex-col gap-[2vh] p-[2vw] rounded-xl"
          style={{ background: 'rgba(180,160,255,0.07)', border: '1px solid rgba(180,160,255,0.22)' }}
        >
          <div className="font-display font-black" style={{ fontSize: '3.5vw', color: 'rgba(180,160,255,0.4)' }}>04</div>
          <div className="font-display font-bold" style={{ fontSize: '1.7vw', color: '#B4A0FF' }}>Pay</div>
          <div className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(240,238,255,0.6)', lineHeight: '1.5' }}>
            Micro-payments settled automatically on-chain
          </div>
        </div>

        <div
          className="flex flex-col gap-[2vh] p-[2vw] rounded-xl"
          style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.22)' }}
        >
          <div className="font-display font-black" style={{ fontSize: '3.5vw', color: 'rgba(251,191,36,0.4)' }}>05</div>
          <div className="font-display font-bold" style={{ fontSize: '1.7vw', color: '#FBBF24' }}>Earn</div>
          <div className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(240,238,255,0.6)', lineHeight: '1.5' }}>
            Creators and curators receive on-chain royalties
          </div>
        </div>
      </div>

      <div
        className="mt-[4vh] flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '2.5vh' }}
      >
        <div className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(240,238,255,0.4)' }}>
          Zero human intermediaries in the execution pipeline
        </div>
        <div className="font-body font-medium" style={{ fontSize: '1.4vw', color: '#8B5CF6' }}>
          Fully on-chain settlement
        </div>
      </div>
    </div>
  );
}
