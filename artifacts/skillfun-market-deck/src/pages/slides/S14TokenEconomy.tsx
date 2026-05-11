export default function S14TokenEconomy() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative flex flex-col justify-center px-[8vw]"
      style={{ background: '#0D0F14' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 40% 50% at 75% 50%, rgba(139,92,246,0.07) 0%, transparent 65%)',
        }}
      />

      <div
        className="font-body font-semibold tracking-[0.45em] uppercase mb-[2vh]"
        style={{ fontSize: '1.3vw', color: '#22D3EE' }}
      >
        TOKEN ECONOMY
      </div>
      <div
        className="font-display font-bold mb-[4.5vh]"
        style={{ fontSize: '3.5vw', color: '#F0EEFF' }}
      >
        $SKILL Token Distribution
      </div>

      <div className="flex gap-[4vw] items-center">
        <div className="flex items-center justify-center">
          <svg viewBox="0 0 280 280" style={{ width: '28vw', height: '28vw' }}>
            <circle cx="140" cy="140" r="120" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2"/>
            <circle cx="140" cy="140" r="120" fill="none" stroke="#8B5CF6" strokeWidth="32"
              strokeDasharray="226 528" strokeDashoffset="132" strokeLinecap="butt"/>
            <circle cx="140" cy="140" r="120" fill="none" stroke="#22D3EE" strokeWidth="32"
              strokeDasharray="132 528" strokeDashoffset="-94" strokeLinecap="butt"/>
            <circle cx="140" cy="140" r="120" fill="none" stroke="#34D399" strokeWidth="32"
              strokeDasharray="106 528" strokeDashoffset="-226" strokeLinecap="butt"/>
            <circle cx="140" cy="140" r="120" fill="none" stroke="#FBBF24" strokeWidth="32"
              strokeDasharray="63 528" strokeDashoffset="-332" strokeLinecap="butt"/>
            <circle cx="140" cy="140" r="72" fill="rgba(13,15,20,0.95)" stroke="rgba(139,92,246,0.2)" strokeWidth="1"/>
            <text x="140" y="133" textAnchor="middle" fill="#F0EEFF" fontSize="24" fontFamily="Syne, sans-serif" fontWeight="800">1B</text>
            <text x="140" y="155" textAnchor="middle" fill="rgba(240,238,255,0.45)" fontSize="11" fontFamily="DM Sans, sans-serif">total supply</text>
          </svg>
        </div>

        <div className="flex flex-col gap-[2.5vh] flex-1">
          <div className="flex items-center gap-[2vw]">
            <div className="w-[3px] h-[5.5vh] rounded-full" style={{ background: '#8B5CF6' }} />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-[0.8vh]">
                <span className="font-display font-semibold" style={{ fontSize: '1.65vw', color: '#F0EEFF' }}>Ecosystem Rewards</span>
                <span className="font-display font-bold" style={{ fontSize: '1.8vw', color: '#8B5CF6' }}>43%</span>
              </div>
              <div className="h-[0.6vh] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full" style={{ width: '43%', background: '#8B5CF6' }} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-[2vw]">
            <div className="w-[3px] h-[5.5vh] rounded-full" style={{ background: '#22D3EE' }} />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-[0.8vh]">
                <span className="font-display font-semibold" style={{ fontSize: '1.65vw', color: '#F0EEFF' }}>Protocol Treasury</span>
                <span className="font-display font-bold" style={{ fontSize: '1.8vw', color: '#22D3EE' }}>25%</span>
              </div>
              <div className="h-[0.6vh] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full" style={{ width: '25%', background: '#22D3EE' }} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-[2vw]">
            <div className="w-[3px] h-[5.5vh] rounded-full" style={{ background: '#34D399' }} />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-[0.8vh]">
                <span className="font-display font-semibold" style={{ fontSize: '1.65vw', color: '#F0EEFF' }}>Team &amp; Advisors</span>
                <span className="font-display font-bold" style={{ fontSize: '1.8vw', color: '#34D399' }}>20%</span>
              </div>
              <div className="h-[0.6vh] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full" style={{ width: '20%', background: '#34D399' }} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-[2vw]">
            <div className="w-[3px] h-[5.5vh] rounded-full" style={{ background: '#FBBF24' }} />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-[0.8vh]">
                <span className="font-display font-semibold" style={{ fontSize: '1.65vw', color: '#F0EEFF' }}>Investors</span>
                <span className="font-display font-bold" style={{ fontSize: '1.8vw', color: '#FBBF24' }}>12%</span>
              </div>
              <div className="h-[0.6vh] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full" style={{ width: '12%', background: '#FBBF24' }} />
              </div>
            </div>
          </div>

          <div
            className="flex gap-[2vw] mt-[1vh] p-[1.5vw] rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex flex-col gap-[0.5vh]">
              <div className="font-display font-bold" style={{ fontSize: '2vw', color: '#8B5CF6' }}>Staking</div>
              <div className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(240,238,255,0.5)' }}>Governance + quality validation</div>
            </div>
            <div className="w-[1px]" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="flex flex-col gap-[0.5vh]">
              <div className="font-display font-bold" style={{ fontSize: '2vw', color: '#22D3EE' }}>Burn</div>
              <div className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(240,238,255,0.5)' }}>2% of fees burned quarterly</div>
            </div>
            <div className="w-[1px]" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="flex flex-col gap-[0.5vh]">
              <div className="font-display font-bold" style={{ fontSize: '2vw', color: '#34D399' }}>Vest</div>
              <div className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(240,238,255,0.5)' }}>4-year schedule, 1-year cliff</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
