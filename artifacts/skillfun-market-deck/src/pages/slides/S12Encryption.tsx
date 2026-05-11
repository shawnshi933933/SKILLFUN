export default function S12Encryption() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative flex flex-col justify-center px-[8vw]"
      style={{ background: '#0D0F14' }}
    >
      <div
        className="absolute top-0 right-0 w-[25vw] h-[40vh]"
        style={{
          background: 'radial-gradient(ellipse, rgba(52,211,153,0.06) 0%, transparent 70%)',
          transform: 'translate(10%, -10%)',
        }}
      />

      <div
        className="font-body font-semibold tracking-[0.45em] uppercase mb-[2vh]"
        style={{ fontSize: '1.3vw', color: '#22D3EE' }}
      >
        ENCRYPTED SKILL PROTECTION
      </div>
      <div
        className="font-display font-bold mb-[5vh]"
        style={{ fontSize: '3.5vw', color: '#F0EEFF', textWrap: 'balance' }}
      >
        IP Stays Yours. Always.
      </div>

      <div className="grid gap-[2.5vw] mb-[5vh]" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div
          className="flex flex-col gap-[2.5vh] p-[2.5vw] rounded-2xl"
          style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.22)' }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: '4vw', height: '4vw', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.35)' }}
          >
            <svg viewBox="0 0 32 32" fill="none" style={{ width: '2vw', height: '2vw' }}>
              <path d="M16 4L28 10V16C28 22 22 27 16 28C10 27 4 22 4 16V10L16 4Z" stroke="#34D399" strokeWidth="2" fill="rgba(52,211,153,0.1)"/>
              <path d="M12 16L15 19L20 13" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="font-display font-bold mb-[1vh]" style={{ fontSize: '1.9vw', color: '#F0EEFF' }}>Upload</div>
            <div className="font-body" style={{ fontSize: '1.45vw', color: 'rgba(240,238,255,0.6)', lineHeight: '1.55' }}>
              Skill logic encrypted with Lit Protocol before storage on Arweave
            </div>
          </div>
        </div>

        <div
          className="flex flex-col gap-[2.5vh] p-[2.5vw] rounded-2xl"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: '4vw', height: '4vw', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.35)' }}
          >
            <svg viewBox="0 0 32 32" fill="none" style={{ width: '2vw', height: '2vw' }}>
              <circle cx="16" cy="16" r="10" stroke="#8B5CF6" strokeWidth="2"/>
              <path d="M10 16H22M16 10V22" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="font-display font-bold mb-[1vh]" style={{ fontSize: '1.9vw', color: '#F0EEFF' }}>Invoke</div>
            <div className="font-body" style={{ fontSize: '1.45vw', color: 'rgba(240,238,255,0.6)', lineHeight: '1.55' }}>
              Access unlocked only after on-chain payment is verified by smart contract
            </div>
          </div>
        </div>

        <div
          className="flex flex-col gap-[2.5vh] p-[2.5vw] rounded-2xl"
          style={{ background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.22)' }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: '4vw', height: '4vw', background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.35)' }}
          >
            <svg viewBox="0 0 32 32" fill="none" style={{ width: '2vw', height: '2vw' }}>
              <path d="M8 16H24M18 10L24 16L18 22" stroke="#22D3EE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="font-display font-bold mb-[1vh]" style={{ fontSize: '1.9vw', color: '#F0EEFF' }}>Transfer</div>
            <div className="font-body" style={{ fontSize: '1.45vw', color: 'rgba(240,238,255,0.6)', lineHeight: '1.55' }}>
              NFT ownership transfers but encryption keys remain with the creator
            </div>
          </div>
        </div>
      </div>

      <div
        className="grid gap-[2.5vw]"
        style={{ gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '3vh' }}
      >
        <div className="flex items-center gap-[1vw]">
          <div className="w-[0.6vw] h-[0.6vw] rounded-full" style={{ background: '#34D399' }} />
          <span className="font-body font-medium" style={{ fontSize: '1.45vw', color: 'rgba(240,238,255,0.6)' }}>Logic never exposed</span>
        </div>
        <div className="flex items-center gap-[1vw]">
          <div className="w-[0.6vw] h-[0.6vw] rounded-full" style={{ background: '#34D399' }} />
          <span className="font-body font-medium" style={{ fontSize: '1.45vw', color: 'rgba(240,238,255,0.6)' }}>Piracy-proof at protocol level</span>
        </div>
        <div className="flex items-center gap-[1vw]">
          <div className="w-[0.6vw] h-[0.6vw] rounded-full" style={{ background: '#34D399' }} />
          <span className="font-body font-medium" style={{ fontSize: '1.45vw', color: 'rgba(240,238,255,0.6)' }}>Creator controls monetization</span>
        </div>
      </div>
    </div>
  );
}
