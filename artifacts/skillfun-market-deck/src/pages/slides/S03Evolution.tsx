export default function S03Evolution() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative flex flex-col justify-center px-[8vw]"
      style={{ background: '#0D0F14' }}
    >
      <div
        className="absolute top-0 right-0 w-[40vw] h-[40vh] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          transform: 'translate(20%, -20%)',
        }}
      />

      <div
        className="font-body font-semibold tracking-[0.45em] uppercase mb-[2vh]"
        style={{ fontSize: '1.3vw', color: '#22D3EE' }}
      >
        MARKET EVOLUTION
      </div>
      <div
        className="font-display font-bold mb-[5vh]"
        style={{ fontSize: '3.5vw', color: '#F0EEFF', textWrap: 'balance' }}
      >
        Three Eras of AI Capability
      </div>

      <div className="grid gap-[2.5vw]" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div
          className="flex flex-col gap-[2vh] p-[2.5vw] rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="font-display font-black"
            style={{ fontSize: '4.5vw', color: 'rgba(240,238,255,0.15)' }}
          >
            v1
          </div>
          <div
            className="font-display font-bold"
            style={{ fontSize: '2vw', color: 'rgba(240,238,255,0.7)' }}
          >
            Web2 AI Tools
          </div>
          <div
            className="h-[0.3vh] w-[3vw]"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          />
          <div className="flex flex-col gap-[1.2vh]">
            <div className="flex items-start gap-[0.8vw]">
              <div
                className="rounded-full shrink-0 mt-[0.5vh]"
                style={{ width: '0.5vw', height: '0.5vw', background: 'rgba(240,238,255,0.3)' }}
              />
              <span className="font-body" style={{ fontSize: '1.55vw', color: 'rgba(240,238,255,0.5)' }}>
                Closed APIs, no ownership
              </span>
            </div>
            <div className="flex items-start gap-[0.8vw]">
              <div
                className="rounded-full shrink-0 mt-[0.5vh]"
                style={{ width: '0.5vw', height: '0.5vw', background: 'rgba(240,238,255,0.3)' }}
              />
              <span className="font-body" style={{ fontSize: '1.55vw', color: 'rgba(240,238,255,0.5)' }}>
                Siloed ecosystems
              </span>
            </div>
            <div className="flex items-start gap-[0.8vw]">
              <div
                className="rounded-full shrink-0 mt-[0.5vh]"
                style={{ width: '0.5vw', height: '0.5vw', background: 'rgba(240,238,255,0.3)' }}
              />
              <span className="font-body" style={{ fontSize: '1.55vw', color: 'rgba(240,238,255,0.5)' }}>
                Zero creator monetization
              </span>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col gap-[2vh] p-[2.5vw] rounded-xl"
          style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)' }}
        >
          <div
            className="font-display font-black"
            style={{ fontSize: '4.5vw', color: 'rgba(139,92,246,0.35)' }}
          >
            v2
          </div>
          <div
            className="font-display font-bold"
            style={{ fontSize: '2vw', color: '#B4A0FF' }}
          >
            Early Web3 AI
          </div>
          <div
            className="h-[0.3vh] w-[3vw]"
            style={{ background: 'rgba(139,92,246,0.4)' }}
          />
          <div className="flex flex-col gap-[1.2vh]">
            <div className="flex items-start gap-[0.8vw]">
              <div
                className="rounded-full shrink-0 mt-[0.5vh]"
                style={{ width: '0.5vw', height: '0.5vw', background: '#8B5CF6' }}
              />
              <span className="font-body" style={{ fontSize: '1.55vw', color: 'rgba(240,238,255,0.6)' }}>
                NFT art, static metadata
              </span>
            </div>
            <div className="flex items-start gap-[0.8vw]">
              <div
                className="rounded-full shrink-0 mt-[0.5vh]"
                style={{ width: '0.5vw', height: '0.5vw', background: '#8B5CF6' }}
              />
              <span className="font-body" style={{ fontSize: '1.55vw', color: 'rgba(240,238,255,0.6)' }}>
                No executable logic
              </span>
            </div>
            <div className="flex items-start gap-[0.8vw]">
              <div
                className="rounded-full shrink-0 mt-[0.5vh]"
                style={{ width: '0.5vw', height: '0.5vw', background: '#8B5CF6' }}
              />
              <span className="font-body" style={{ fontSize: '1.55vw', color: 'rgba(240,238,255,0.6)' }}>
                Fragmented tooling
              </span>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col gap-[2vh] p-[2.5vw] rounded-xl"
          style={{ background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.3)' }}
        >
          <div
            className="font-display font-black"
            style={{ fontSize: '4.5vw', color: 'rgba(34,211,238,0.4)' }}
          >
            v3
          </div>
          <div
            className="font-display font-bold"
            style={{ fontSize: '2vw', color: '#22D3EE' }}
          >
            SkillFun Era
          </div>
          <div
            className="h-[0.3vh] w-[3vw]"
            style={{ background: '#22D3EE' }}
          />
          <div className="flex flex-col gap-[1.2vh]">
            <div className="flex items-start gap-[0.8vw]">
              <div
                className="rounded-full shrink-0 mt-[0.5vh]"
                style={{ width: '0.5vw', height: '0.5vw', background: '#22D3EE' }}
              />
              <span className="font-body" style={{ fontSize: '1.55vw', color: 'rgba(240,238,255,0.85)' }}>
                Executable Skill NFTs
              </span>
            </div>
            <div className="flex items-start gap-[0.8vw]">
              <div
                className="rounded-full shrink-0 mt-[0.5vh]"
                style={{ width: '0.5vw', height: '0.5vw', background: '#22D3EE' }}
              />
              <span className="font-body" style={{ fontSize: '1.55vw', color: 'rgba(240,238,255,0.85)' }}>
                Agent-native marketplace
              </span>
            </div>
            <div className="flex items-start gap-[0.8vw]">
              <div
                className="rounded-full shrink-0 mt-[0.5vh]"
                style={{ width: '0.5vw', height: '0.5vw', background: '#22D3EE' }}
              />
              <span className="font-body" style={{ fontSize: '1.55vw', color: 'rgba(240,238,255,0.85)' }}>
                On-chain revenue sharing
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="mt-[4vh] flex items-center gap-[1.5vw] font-body"
        style={{ fontSize: '1.5vw', color: 'rgba(240,238,255,0.45)' }}
      >
        <span>Web2 AI</span>
        <div className="flex-1 h-[1px]" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(34,211,238,0.5))' }} />
        <span style={{ color: '#22D3EE' }}>SkillFun is the bridge</span>
      </div>
    </div>
  );
}
