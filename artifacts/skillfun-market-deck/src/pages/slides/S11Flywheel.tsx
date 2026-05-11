export default function S11Flywheel() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative flex items-center px-[8vw]"
      style={{ background: '#0D0F14' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 60% 50%, rgba(139,92,246,0.07) 0%, transparent 65%)',
        }}
      />

      <div className="flex flex-col justify-center w-[38%] gap-[2.5vh] z-10">
        <div
          className="font-body font-semibold tracking-[0.45em] uppercase"
          style={{ fontSize: '1.3vw', color: '#22D3EE' }}
        >
          ECONOMIC FLYWHEEL
        </div>
        <div
          className="font-display font-bold"
          style={{ fontSize: '3.5vw', color: '#F0EEFF', textWrap: 'balance', lineHeight: '1.15' }}
        >
          Growth Compounds with Every Transaction
        </div>
        <div
          className="font-body"
          style={{ fontSize: '1.55vw', color: 'rgba(240,238,255,0.55)', lineHeight: '1.6' }}
        >
          Each new creator, agent, and curator strengthens the network — driving quality up and cost down.
        </div>
        <div className="flex flex-col gap-[1.5vh] mt-[1vh]">
          <div className="flex items-center gap-[1vw]">
            <div className="w-[0.6vw] h-[0.6vw] rounded-full" style={{ background: '#8B5CF6' }} />
            <span className="font-body font-medium" style={{ fontSize: '1.5vw', color: '#B4A0FF' }}>More creators → more skills</span>
          </div>
          <div className="flex items-center gap-[1vw]">
            <div className="w-[0.6vw] h-[0.6vw] rounded-full" style={{ background: '#22D3EE' }} />
            <span className="font-body font-medium" style={{ fontSize: '1.5vw', color: 'rgba(240,238,255,0.7)' }}>More skills → more agents</span>
          </div>
          <div className="flex items-center gap-[1vw]">
            <div className="w-[0.6vw] h-[0.6vw] rounded-full" style={{ background: '#34D399' }} />
            <span className="font-body font-medium" style={{ fontSize: '1.5vw', color: 'rgba(240,238,255,0.7)' }}>More agents → more revenue</span>
          </div>
          <div className="flex items-center gap-[1vw]">
            <div className="w-[0.6vw] h-[0.6vw] rounded-full" style={{ background: '#FBBF24' }} />
            <span className="font-body font-medium" style={{ fontSize: '1.5vw', color: 'rgba(240,238,255,0.7)' }}>More revenue → more creators</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center z-10">
        <svg viewBox="0 0 400 400" style={{ width: '42vw', height: '42vw', maxWidth: '500px', maxHeight: '500px' }}>
          <defs>
            <linearGradient id="arc1fw" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#B4A0FF" stopOpacity="0.6"/>
            </linearGradient>
            <linearGradient id="arc2fw" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.5"/>
            </linearGradient>
            <linearGradient id="arc3fw" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#34D399" stopOpacity="0.5"/>
            </linearGradient>
            <linearGradient id="arc4fw" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.5"/>
            </linearGradient>
          </defs>

          <circle cx="200" cy="200" r="195" fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="1"/>
          <circle cx="200" cy="200" r="155" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>

          <path d="M 200 20 A 180 180 0 0 1 360 290" fill="none" stroke="url(#arc1fw)" strokeWidth="16" strokeLinecap="round"/>
          <path d="M 360 290 A 180 180 0 0 1 110 350" fill="none" stroke="url(#arc2fw)" strokeWidth="16" strokeLinecap="round"/>
          <path d="M 110 350 A 180 180 0 0 1 40 110" fill="none" stroke="url(#arc3fw)" strokeWidth="16" strokeLinecap="round"/>
          <path d="M 40 110 A 180 180 0 0 1 200 20" fill="none" stroke="url(#arc4fw)" strokeWidth="16" strokeLinecap="round"/>

          <polygon points="200,5 215,30 185,30" fill="#8B5CF6"/>
          <polygon points="372,298 353,284 368,272" fill="#22D3EE"/>
          <polygon points="98,365 115,343 104,327" fill="#34D399"/>
          <polygon points="25,100 50,108 42,84" fill="#FBBF24"/>

          <circle cx="200" cy="200" r="70" fill="rgba(13,15,20,0.9)" stroke="rgba(139,92,246,0.35)" strokeWidth="1.5"/>
          <text x="200" y="190" textAnchor="middle" fill="#8B5CF6" fontSize="28" fontFamily="Syne, sans-serif" fontWeight="800">SKILL</text>
          <text x="200" y="218" textAnchor="middle" fill="rgba(240,238,255,0.5)" fontSize="13" fontFamily="DM Sans, sans-serif">economy</text>

          <text x="200" y="14" textAnchor="middle" fill="#B4A0FF" fontSize="12" fontFamily="DM Sans, sans-serif">Creators</text>
          <text x="376" y="286" textAnchor="start" fill="#22D3EE" fontSize="12" fontFamily="DM Sans, sans-serif">Agents</text>
          <text x="80" y="374" textAnchor="middle" fill="#34D399" fontSize="12" fontFamily="DM Sans, sans-serif">Revenue</text>
          <text x="20" y="96" textAnchor="end" fill="#FBBF24" fontSize="12" fontFamily="DM Sans, sans-serif">Quality</text>
        </svg>
      </div>
    </div>
  );
}
