const base = import.meta.env.BASE_URL;

export default function S02Problem() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#0D0F14' }}>
      <img
        src={`${base}problem-bg.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt=""
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(13,15,20,0.82) 0%, rgba(13,15,20,0.7) 50%, rgba(13,15,20,0.92) 100%)',
        }}
      />

      <div className="absolute inset-0 flex flex-col justify-center px-[8vw]">
        <div
          className="font-body font-semibold tracking-[0.45em] uppercase mb-[5vh]"
          style={{ fontSize: '1.3vw', color: '#22D3EE' }}
        >
          THE PROBLEM
        </div>

        <div className="grid gap-[3vw]" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          <div
            className="flex flex-col gap-[1.5vh]"
            style={{ borderLeft: '3px solid #8B5CF6', paddingLeft: '2vw' }}
          >
            <div
              className="font-display font-black leading-none"
              style={{ fontSize: '8vw', color: '#8B5CF6' }}
            >
              $0
            </div>
            <div
              className="font-display font-semibold"
              style={{ fontSize: '1.8vw', color: '#F0EEFF' }}
            >
              Earned by creators
            </div>
            <div
              className="font-body"
              style={{ fontSize: '1.5vw', color: 'rgba(240,238,255,0.55)' }}
            >
              No monetization layer for AI skill creators today
            </div>
          </div>

          <div
            className="flex flex-col gap-[1.5vh]"
            style={{ borderLeft: '3px solid #22D3EE', paddingLeft: '2vw' }}
          >
            <div
              className="font-display font-black leading-none"
              style={{ fontSize: '8vw', color: '#22D3EE' }}
            >
              0%
            </div>
            <div
              className="font-display font-semibold"
              style={{ fontSize: '1.8vw', color: '#F0EEFF' }}
            >
              Cross-platform discovery
            </div>
            <div
              className="font-body"
              style={{ fontSize: '1.5vw', color: 'rgba(240,238,255,0.55)' }}
            >
              Skills are siloed inside closed AI ecosystems
            </div>
          </div>

          <div
            className="flex flex-col gap-[1.5vh]"
            style={{ borderLeft: '3px solid #34D399', paddingLeft: '2vw' }}
          >
            <div
              className="font-display font-black leading-none"
              style={{ fontSize: '8vw', color: '#34D399' }}
            >
              None
            </div>
            <div
              className="font-display font-semibold"
              style={{ fontSize: '1.8vw', color: '#F0EEFF' }}
            >
              Composable standard
            </div>
            <div
              className="font-body"
              style={{ fontSize: '1.5vw', color: 'rgba(240,238,255,0.55)' }}
            >
              No universal protocol for agent-to-agent transactions
            </div>
          </div>
        </div>

        <div
          className="mt-[6vh] font-body font-medium"
          style={{
            fontSize: '1.7vw',
            color: 'rgba(240,238,255,0.7)',
            borderTop: '1px solid rgba(139,92,246,0.25)',
            paddingTop: '3vh',
            textWrap: 'balance',
          }}
        >
          AI capabilities are trapped in walled gardens — uncollectable, unmonetizable, non-composable.
        </div>
      </div>
    </div>
  );
}
