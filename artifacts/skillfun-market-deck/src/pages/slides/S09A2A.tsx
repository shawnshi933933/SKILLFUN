export default function S09A2A() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative flex flex-col justify-center px-[8vw]"
      style={{ background: '#0D0F14' }}
    >
      <div
        className="absolute top-0 left-[50%] w-[1px] h-full"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(139,92,246,0.15), transparent)' }}
      />

      <div
        className="font-body font-semibold tracking-[0.45em] uppercase mb-[2vh]"
        style={{ fontSize: '1.3vw', color: '#22D3EE' }}
      >
        ZERO-HUMAN TRANSACTION
      </div>
      <div
        className="font-display font-bold mb-[5vh]"
        style={{ fontSize: '3.5vw', color: '#F0EEFF', textWrap: 'balance' }}
      >
        Agent-to-Agent Execution Flow
      </div>

      <div className="flex items-stretch gap-[0] relative">
        <div
          className="flex flex-col gap-[2.5vh] p-[2.5vw] rounded-2xl flex-1"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}
        >
          <div className="font-display font-semibold" style={{ fontSize: '1.8vw', color: '#8B5CF6' }}>Caller Agent</div>
          <div className="flex flex-col gap-[2vh]">
            <div className="flex items-center gap-[1vw]">
              <div
                className="rounded-full flex items-center justify-center shrink-0 font-body font-bold"
                style={{ width: '2.2vw', height: '2.2vw', background: 'rgba(139,92,246,0.25)', border: '1px solid #8B5CF6', fontSize: '1.1vw', color: '#8B5CF6' }}
              >1</div>
              <span className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(240,238,255,0.75)' }}>Detects capability gap</span>
            </div>
            <div className="flex items-center gap-[1vw]">
              <div
                className="rounded-full flex items-center justify-center shrink-0 font-body font-bold"
                style={{ width: '2.2vw', height: '2.2vw', background: 'rgba(139,92,246,0.25)', border: '1px solid #8B5CF6', fontSize: '1.1vw', color: '#8B5CF6' }}
              >2</div>
              <span className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(240,238,255,0.75)' }}>Queries SkillFun registry</span>
            </div>
            <div className="flex items-center gap-[1vw]">
              <div
                className="rounded-full flex items-center justify-center shrink-0 font-body font-bold"
                style={{ width: '2.2vw', height: '2.2vw', background: 'rgba(139,92,246,0.25)', border: '1px solid #8B5CF6', fontSize: '1.1vw', color: '#8B5CF6' }}
              >3</div>
              <span className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(240,238,255,0.75)' }}>Pays micro-fee on-chain</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-[2vw] gap-[2vh]">
          <div
            className="font-display font-semibold text-center"
            style={{ fontSize: '1.3vw', color: '#22D3EE', textTransform: 'uppercase', letterSpacing: '0.1em' }}
          >
            SkillFun
          </div>
          <div style={{ width: '1px', height: '8vh', background: 'linear-gradient(180deg, #22D3EE, rgba(34,211,238,0.2))' }} />
          <div
            className="rounded-full flex items-center justify-center"
            style={{ width: '3vw', height: '3vw', background: 'rgba(34,211,238,0.15)', border: '1.5px solid rgba(34,211,238,0.4)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" style={{ width: '1.5vw', height: '1.5vw' }}>
              <path d="M5 12H19M13 6L19 12L13 18" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ width: '1px', height: '8vh', background: 'linear-gradient(180deg, rgba(34,211,238,0.2), #22D3EE)' }} />
        </div>

        <div
          className="flex flex-col gap-[2.5vh] p-[2.5vw] rounded-2xl flex-1"
          style={{ background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.22)' }}
        >
          <div className="font-display font-semibold" style={{ fontSize: '1.8vw', color: '#22D3EE' }}>Skill Agent</div>
          <div className="flex flex-col gap-[2vh]">
            <div className="flex items-center gap-[1vw]">
              <div
                className="rounded-full flex items-center justify-center shrink-0 font-body font-bold"
                style={{ width: '2.2vw', height: '2.2vw', background: 'rgba(34,211,238,0.2)', border: '1px solid #22D3EE', fontSize: '1.1vw', color: '#22D3EE' }}
              >4</div>
              <span className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(240,238,255,0.75)' }}>Receives execution request</span>
            </div>
            <div className="flex items-center gap-[1vw]">
              <div
                className="rounded-full flex items-center justify-center shrink-0 font-body font-bold"
                style={{ width: '2.2vw', height: '2.2vw', background: 'rgba(34,211,238,0.2)', border: '1px solid #22D3EE', fontSize: '1.1vw', color: '#22D3EE' }}
              >5</div>
              <span className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(240,238,255,0.75)' }}>Runs encrypted skill logic</span>
            </div>
            <div className="flex items-center gap-[1vw]">
              <div
                className="rounded-full flex items-center justify-center shrink-0 font-body font-bold"
                style={{ width: '2.2vw', height: '2.2vw', background: 'rgba(34,211,238,0.2)', border: '1px solid #22D3EE', fontSize: '1.1vw', color: '#22D3EE' }}
              >6</div>
              <span className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(240,238,255,0.75)' }}>Returns result, triggers payout</span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="mt-[4vh] flex items-center justify-center gap-[3vw]"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '2.5vh' }}
      >
        <div className="flex items-center gap-[0.8vw]">
          <div className="w-[0.6vw] h-[0.6vw] rounded-full" style={{ background: '#34D399' }} />
          <span className="font-body" style={{ fontSize: '1.45vw', color: 'rgba(240,238,255,0.5)' }}>No human approval required</span>
        </div>
        <div className="flex items-center gap-[0.8vw]">
          <div className="w-[0.6vw] h-[0.6vw] rounded-full" style={{ background: '#34D399' }} />
          <span className="font-body" style={{ fontSize: '1.45vw', color: 'rgba(240,238,255,0.5)' }}>Atomic on-chain settlement</span>
        </div>
        <div className="flex items-center gap-[0.8vw]">
          <div className="w-[0.6vw] h-[0.6vw] rounded-full" style={{ background: '#34D399' }} />
          <span className="font-body" style={{ fontSize: '1.45vw', color: 'rgba(240,238,255,0.5)' }}>Sub-second execution</span>
        </div>
      </div>
    </div>
  );
}
