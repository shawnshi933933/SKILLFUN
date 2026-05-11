export default function S10Participate() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative flex flex-col justify-center px-[8vw]"
      style={{ background: '#0D0F14' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 80% 50%, rgba(34,211,238,0.05) 0%, transparent 60%)',
        }}
      />

      <div
        className="font-body font-semibold tracking-[0.45em] uppercase mb-[2vh]"
        style={{ fontSize: '1.3vw', color: '#22D3EE' }}
      >
        FIVE WAYS TO PARTICIPATE
      </div>
      <div
        className="font-display font-bold mb-[4.5vh]"
        style={{ fontSize: '3.5vw', color: '#F0EEFF' }}
      >
        Every Role Earns
      </div>

      <div className="grid gap-[1.5vw]" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div
          className="flex flex-col gap-[2vh] p-[2vw] rounded-xl"
          style={{ background: 'rgba(139,92,246,0.09)', border: '1px solid rgba(139,92,246,0.25)', borderTop: '3px solid #8B5CF6' }}
        >
          <div className="font-display font-bold" style={{ fontSize: '1.7vw', color: '#8B5CF6' }}>Creator</div>
          <div className="font-body font-medium" style={{ fontSize: '1.35vw', color: '#34D399' }}>Earn royalties</div>
          <div className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(240,238,255,0.55)', lineHeight: '1.5' }}>
            Mint skills from your expertise and earn every invocation
          </div>
        </div>

        <div
          className="flex flex-col gap-[2vh] p-[2vw] rounded-xl"
          style={{ background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.22)', borderTop: '3px solid #22D3EE' }}
        >
          <div className="font-display font-bold" style={{ fontSize: '1.7vw', color: '#22D3EE' }}>Curator</div>
          <div className="font-body font-medium" style={{ fontSize: '1.35vw', color: '#34D399' }}>Earn bundle fees</div>
          <div className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(240,238,255,0.55)', lineHeight: '1.5' }}>
            Package skills into bundles and earn distribution revenue
          </div>
        </div>

        <div
          className="flex flex-col gap-[2vh] p-[2vw] rounded-xl"
          style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.22)', borderTop: '3px solid #34D399' }}
        >
          <div className="font-display font-bold" style={{ fontSize: '1.7vw', color: '#34D399' }}>Developer</div>
          <div className="font-body font-medium" style={{ fontSize: '1.35vw', color: '#34D399' }}>Earn usage fees</div>
          <div className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(240,238,255,0.55)', lineHeight: '1.5' }}>
            Build agents and integrations on the SkillFun protocol
          </div>
        </div>

        <div
          className="flex flex-col gap-[2vh] p-[2vw] rounded-xl"
          style={{ background: 'rgba(180,160,255,0.07)', border: '1px solid rgba(180,160,255,0.22)', borderTop: '3px solid #B4A0FF' }}
        >
          <div className="font-display font-bold" style={{ fontSize: '1.7vw', color: '#B4A0FF' }}>Investor</div>
          <div className="font-body font-medium" style={{ fontSize: '1.35vw', color: '#34D399' }}>Earn appreciation</div>
          <div className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(240,238,255,0.55)', lineHeight: '1.5' }}>
            Hold Skill NFTs as appreciating digital assets
          </div>
        </div>

        <div
          className="flex flex-col gap-[2vh] p-[2vw] rounded-xl"
          style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.22)', borderTop: '3px solid #FBBF24' }}
        >
          <div className="font-display font-bold" style={{ fontSize: '1.7vw', color: '#FBBF24' }}>Staker</div>
          <div className="font-body font-medium" style={{ fontSize: '1.35vw', color: '#34D399' }}>Earn staking yield</div>
          <div className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(240,238,255,0.55)', lineHeight: '1.5' }}>
            Stake $SKILL tokens to validate quality and earn rewards
          </div>
        </div>
      </div>

      <div
        className="mt-[3.5vh] flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '2.5vh' }}
      >
        <div className="font-body" style={{ fontSize: '1.45vw', color: 'rgba(240,238,255,0.4)' }}>
          All roles are permissionless and composable
        </div>
        <div className="font-body font-semibold" style={{ fontSize: '1.4vw', color: '#8B5CF6' }}>
          One protocol · Multiple revenue streams
        </div>
      </div>
    </div>
  );
}
