const base = import.meta.env.BASE_URL;

export default function S01Cover() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#0D0F14' }}>
      <img
        src={`${base}cover-market.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt=""
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(13,15,20,0.88) 0%, rgba(139,92,246,0.18) 45%, rgba(13,15,20,0.92) 100%)',
        }}
      />

      <div className="absolute inset-0 flex flex-col justify-center px-[8vw]">
        <div
          className="font-body font-semibold tracking-[0.5em] uppercase mb-[2.5vh]"
          style={{ fontSize: '1.3vw', color: '#22D3EE' }}
        >
          AI SKILL ECONOMY
        </div>
        <div
          className="font-display font-black tracking-tight leading-none mb-[2.5vh]"
          style={{ fontSize: '10.5vw', color: '#F0EEFF', textShadow: '0 0 80px rgba(139,92,246,0.5)' }}
        >
          SkillFun
        </div>
        <div
          className="font-display font-medium mb-[5vh]"
          style={{ fontSize: '2.3vw', color: '#B4A0FF', textWrap: 'balance' }}
        >
          The On-Chain App Store for AI Agents
        </div>
        <div className="flex items-center gap-[2vw]">
          <div className="h-[0.25vh] w-[5vw]" style={{ background: '#22D3EE' }} />
          <span
            className="font-body font-medium tracking-[0.3em]"
            style={{ fontSize: '1.35vw', color: 'rgba(240,238,255,0.5)' }}
          >
            SKILLS AS NFTs · BUNDLES · ON-CHAIN REVENUE
          </span>
        </div>
      </div>

      <div
        className="absolute bottom-[4.5vh] left-[8vw] right-[8vw] flex justify-between items-center"
        style={{ borderTop: '1px solid rgba(139,92,246,0.2)', paddingTop: '2vh' }}
      >
        <span
          className="font-body tracking-[0.25em]"
          style={{ fontSize: '1.3vw', color: 'rgba(240,238,255,0.35)' }}
        >
          SEED ROUND · 2026
        </span>
        <div className="flex items-center gap-[0.8vw]">
          <div
            className="rounded-full"
            style={{ width: '1.2vw', height: '1.2vw', background: 'rgba(139,92,246,0.7)' }}
          />
          <div
            className="rounded-full"
            style={{ width: '1.2vw', height: '1.2vw', background: 'rgba(34,211,238,0.5)' }}
          />
        </div>
      </div>
    </div>
  );
}
