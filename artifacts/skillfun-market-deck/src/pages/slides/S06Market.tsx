const base = import.meta.env.BASE_URL;

export default function S06Market() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#0D0F14' }}>
      <img
        src={`${base}market-bg.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt=""
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(13,15,20,0.78) 0%, rgba(13,15,20,0.65) 50%, rgba(13,15,20,0.88) 100%)',
        }}
      />

      <div className="absolute inset-0 flex flex-col justify-center px-[8vw]">
        <div
          className="font-body font-semibold tracking-[0.45em] uppercase mb-[3vh]"
          style={{ fontSize: '1.3vw', color: '#22D3EE' }}
        >
          MARKET OPPORTUNITY
        </div>
        <div
          className="font-display font-bold mb-[6vh]"
          style={{ fontSize: '3.5vw', color: '#F0EEFF', textWrap: 'balance' }}
        >
          Three Converging Markets
        </div>

        <div className="grid gap-[3vw]" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          <div className="flex flex-col gap-[1.5vh]">
            <div
              className="font-display font-black leading-none"
              style={{ fontSize: '7.5vw', color: '#8B5CF6', textShadow: '0 0 40px rgba(139,92,246,0.4)' }}
            >
              $1.8T
            </div>
            <div className="h-[0.3vh] w-[4vw]" style={{ background: '#8B5CF6' }} />
            <div className="font-display font-semibold" style={{ fontSize: '1.8vw', color: '#F0EEFF' }}>
              AI Services Market
            </div>
            <div className="font-body" style={{ fontSize: '1.45vw', color: 'rgba(240,238,255,0.55)' }}>
              Global TAM by 2030
            </div>
          </div>

          <div className="flex flex-col gap-[1.5vh]">
            <div
              className="font-display font-black leading-none"
              style={{ fontSize: '7.5vw', color: '#22D3EE', textShadow: '0 0 40px rgba(34,211,238,0.35)' }}
            >
              $210B
            </div>
            <div className="h-[0.3vh] w-[4vw]" style={{ background: '#22D3EE' }} />
            <div className="font-display font-semibold" style={{ fontSize: '1.8vw', color: '#F0EEFF' }}>
              NFT + Digital Assets
            </div>
            <div className="font-body" style={{ fontSize: '1.45vw', color: 'rgba(240,238,255,0.55)' }}>
              Annual trading volume
            </div>
          </div>

          <div className="flex flex-col gap-[1.5vh]">
            <div
              className="font-display font-black leading-none"
              style={{ fontSize: '7.5vw', color: '#34D399', textShadow: '0 0 40px rgba(52,211,153,0.35)' }}
            >
              $12B
            </div>
            <div className="h-[0.3vh] w-[4vw]" style={{ background: '#34D399' }} />
            <div className="font-display font-semibold" style={{ fontSize: '1.8vw', color: '#F0EEFF' }}>
              Agentic AI Economy
            </div>
            <div className="font-body" style={{ fontSize: '1.45vw', color: 'rgba(240,238,255,0.55)' }}>
              2025 addressable SOM
            </div>
          </div>
        </div>

        <div
          className="mt-[5vh] font-body"
          style={{
            fontSize: '1.55vw',
            color: 'rgba(240,238,255,0.45)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '2.5vh',
          }}
        >
          SkillFun sits at the intersection — capturing value from all three
        </div>
      </div>
    </div>
  );
}
