export default function S13KOL() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative flex flex-col justify-center px-[8vw]"
      style={{ background: '#0D0F14' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 70% at 20% 50%, rgba(139,92,246,0.07) 0%, transparent 60%)',
        }}
      />

      <div
        className="font-body font-semibold tracking-[0.45em] uppercase mb-[2vh]"
        style={{ fontSize: '1.3vw', color: '#22D3EE' }}
      >
        KOL GROWTH ENGINE
      </div>
      <div
        className="font-display font-bold mb-[5vh]"
        style={{ fontSize: '3.5vw', color: '#F0EEFF', textWrap: 'balance' }}
      >
        Turn Influence Into On-Chain Income
      </div>

      <div className="flex gap-[3vw]">
        <div className="flex flex-col gap-[2vh] w-[55%]">
          <div className="flex items-stretch">
            <div
              className="flex flex-col gap-[1.5vh] p-[2.2vw] rounded-l-xl flex-1"
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRight: 'none' }}
            >
              <div className="font-display font-bold" style={{ fontSize: '1.6vw', color: '#8B5CF6' }}>01 Distill</div>
              <div className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(240,238,255,0.65)', lineHeight: '1.5' }}>
                KOL encodes expertise into discrete, testable skill modules
              </div>
            </div>
            <div className="w-[2px]" style={{ background: 'linear-gradient(180deg, rgba(139,92,246,0.5), rgba(34,211,238,0.5))' }} />
            <div
              className="flex flex-col gap-[1.5vh] p-[2.2vw] flex-1"
              style={{ background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.22)', borderLeft: 'none', borderRight: 'none' }}
            >
              <div className="font-display font-bold" style={{ fontSize: '1.6vw', color: '#22D3EE' }}>02 Claim</div>
              <div className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(240,238,255,0.65)', lineHeight: '1.5' }}>
                Mint verified Skill NFT with on-chain attribution and royalty rules
              </div>
            </div>
            <div className="w-[2px]" style={{ background: 'linear-gradient(180deg, rgba(34,211,238,0.5), rgba(52,211,153,0.5))' }} />
            <div
              className="flex flex-col gap-[1.5vh] p-[2.2vw] rounded-r-xl flex-1"
              style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.22)', borderLeft: 'none' }}
            >
              <div className="font-display font-bold" style={{ fontSize: '1.6vw', color: '#34D399' }}>03 Activate</div>
              <div className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(240,238,255,0.65)', lineHeight: '1.5' }}>
                Community and agents invoke the skill — royalties flow automatically
              </div>
            </div>
          </div>

          <div
            className="flex items-center gap-[2vw] p-[2vw] rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex flex-col gap-[0.5vh]">
              <div className="font-display font-black" style={{ fontSize: '3.5vw', color: '#8B5CF6' }}>100K+</div>
              <div className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(240,238,255,0.5)' }}>followers = seed income stream</div>
            </div>
            <div className="w-[1px] h-[6vh]" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="flex flex-col gap-[0.5vh]">
              <div className="font-display font-black" style={{ fontSize: '3.5vw', color: '#22D3EE' }}>10x</div>
              <div className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(240,238,255,0.5)' }}>avg. ROI on minted skills</div>
            </div>
            <div className="w-[1px] h-[6vh]" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="flex flex-col gap-[0.5vh]">
              <div className="font-display font-black" style={{ fontSize: '3.5vw', color: '#34D399' }}>Passive</div>
              <div className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(240,238,255,0.5)' }}>recurring revenue</div>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col gap-[2vh] p-[2.5vw] rounded-2xl"
          style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="font-display font-semibold" style={{ fontSize: '1.7vw', color: '#B4A0FF' }}>Why KOLs Choose SkillFun</div>
          <div className="flex flex-col gap-[1.8vh] mt-[1vh]">
            <div className="flex items-start gap-[1vw]">
              <div className="font-body font-bold shrink-0" style={{ fontSize: '1.4vw', color: '#8B5CF6', minWidth: '1.5vw' }}>01</div>
              <div className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(240,238,255,0.65)' }}>Intellectual property protected by encryption, not trust</div>
            </div>
            <div className="flex items-start gap-[1vw]">
              <div className="font-body font-bold shrink-0" style={{ fontSize: '1.4vw', color: '#22D3EE', minWidth: '1.5vw' }}>02</div>
              <div className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(240,238,255,0.65)' }}>Royalties paid automatically per invocation, no invoicing</div>
            </div>
            <div className="flex items-start gap-[1vw]">
              <div className="font-body font-bold shrink-0" style={{ fontSize: '1.4vw', color: '#34D399', minWidth: '1.5vw' }}>03</div>
              <div className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(240,238,255,0.65)' }}>Community co-ownership via NFT secondary market</div>
            </div>
            <div className="flex items-start gap-[1vw]">
              <div className="font-body font-bold shrink-0" style={{ fontSize: '1.4vw', color: '#FBBF24', minWidth: '1.5vw' }}>04</div>
              <div className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(240,238,255,0.65)' }}>Skill reputation score tied to on-chain performance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
