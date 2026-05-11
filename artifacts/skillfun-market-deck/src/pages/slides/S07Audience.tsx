export default function S07Audience() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative flex flex-col justify-center px-[8vw]"
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
        className="font-body font-semibold tracking-[0.45em] uppercase mb-[2vh]"
        style={{ fontSize: '1.3vw', color: '#22D3EE' }}
      >
        BUILT FOR EVERY INTELLIGENCE
      </div>
      <div
        className="font-display font-bold mb-[5vh]"
        style={{ fontSize: '3.5vw', color: '#F0EEFF', textWrap: 'balance' }}
      >
        Humans and Agents, Together
      </div>

      <div className="grid gap-[3vw]" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div
          className="flex flex-col gap-[3vh] p-[3.5vw] rounded-2xl"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}
        >
          <div className="flex items-center gap-[1.5vw]">
            <div
              className="rounded-full flex items-center justify-center"
              style={{ width: '5vw', height: '5vw', background: 'rgba(139,92,246,0.2)', border: '2px solid rgba(139,92,246,0.4)' }}
            >
              <svg viewBox="0 0 40 40" fill="none" style={{ width: '2.5vw', height: '2.5vw' }}>
                <circle cx="20" cy="13" r="7" fill="#8B5CF6"/>
                <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="font-display font-bold" style={{ fontSize: '2.5vw', color: '#F0EEFF' }}>Humans</div>
          </div>

          <div className="flex flex-col gap-[2vh]">
            <div className="flex items-start gap-[1vw]">
              <div
                className="rounded-full shrink-0 mt-[0.8vh]"
                style={{ width: '0.6vw', height: '0.6vw', background: '#8B5CF6' }}
              />
              <div>
                <div className="font-body font-medium" style={{ fontSize: '1.65vw', color: '#F0EEFF' }}>KOL Skill Creators</div>
                <div className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(240,238,255,0.5)' }}>Distill expertise into monetizable NFTs</div>
              </div>
            </div>
            <div className="flex items-start gap-[1vw]">
              <div
                className="rounded-full shrink-0 mt-[0.8vh]"
                style={{ width: '0.6vw', height: '0.6vw', background: '#8B5CF6' }}
              />
              <div>
                <div className="font-body font-medium" style={{ fontSize: '1.65vw', color: '#F0EEFF' }}>Developers</div>
                <div className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(240,238,255,0.5)' }}>Build and deploy skill modules</div>
              </div>
            </div>
            <div className="flex items-start gap-[1vw]">
              <div
                className="rounded-full shrink-0 mt-[0.8vh]"
                style={{ width: '0.6vw', height: '0.6vw', background: '#8B5CF6' }}
              />
              <div>
                <div className="font-body font-medium" style={{ fontSize: '1.65vw', color: '#F0EEFF' }}>Curators</div>
                <div className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(240,238,255,0.5)' }}>Bundle skills, earn distribution fees</div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col gap-[3vh] p-[3.5vw] rounded-2xl"
          style={{ background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.22)' }}
        >
          <div className="flex items-center gap-[1.5vw]">
            <div
              className="rounded-full flex items-center justify-center"
              style={{ width: '5vw', height: '5vw', background: 'rgba(34,211,238,0.15)', border: '2px solid rgba(34,211,238,0.35)' }}
            >
              <svg viewBox="0 0 40 40" fill="none" style={{ width: '2.5vw', height: '2.5vw' }}>
                <rect x="6" y="6" width="28" height="28" rx="6" stroke="#22D3EE" strokeWidth="2.5"/>
                <circle cx="14" cy="20" r="2.5" fill="#22D3EE"/>
                <circle cx="26" cy="20" r="2.5" fill="#22D3EE"/>
                <path d="M14 26c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="font-display font-bold" style={{ fontSize: '2.5vw', color: '#F0EEFF' }}>AI Agents</div>
          </div>

          <div className="flex flex-col gap-[2vh]">
            <div className="flex items-start gap-[1vw]">
              <div
                className="rounded-full shrink-0 mt-[0.8vh]"
                style={{ width: '0.6vw', height: '0.6vw', background: '#22D3EE' }}
              />
              <div>
                <div className="font-body font-medium" style={{ fontSize: '1.65vw', color: '#F0EEFF' }}>Autonomous Buyers</div>
                <div className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(240,238,255,0.5)' }}>Discover and pay for skills on-chain</div>
              </div>
            </div>
            <div className="flex items-start gap-[1vw]">
              <div
                className="rounded-full shrink-0 mt-[0.8vh]"
                style={{ width: '0.6vw', height: '0.6vw', background: '#22D3EE' }}
              />
              <div>
                <div className="font-body font-medium" style={{ fontSize: '1.65vw', color: '#F0EEFF' }}>Skill Invokers</div>
                <div className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(240,238,255,0.5)' }}>Execute specialist capabilities seamlessly</div>
              </div>
            </div>
            <div className="flex items-start gap-[1vw]">
              <div
                className="rounded-full shrink-0 mt-[0.8vh]"
                style={{ width: '0.6vw', height: '0.6vw', background: '#22D3EE' }}
              />
              <div>
                <div className="font-body font-medium" style={{ fontSize: '1.65vw', color: '#F0EEFF' }}>Orchestrators</div>
                <div className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(240,238,255,0.5)' }}>Coordinate multi-agent workflows</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
