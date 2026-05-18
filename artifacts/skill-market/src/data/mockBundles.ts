export type Bundle = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  curatorMarkup: number;
  stakerPool: number;
  apy: number;
  constituentSkillIds: string[];
  curatorAddress: string;
  invocations: number;
  totalVolume: number;
  myStaked?: number;
};

export const mockBundles: Bundle[] = [
  {
    id: "bundle-1",
    name: "DeFi Alpha Suite",
    description: "The complete toolkit for autonomous DeFi alpha generation. Combines whale tracking, yield optimization, and MEV strategy in a single MCP endpoint. Trusted by 120+ AI agents.",
    tags: ["DeFi", "Alpha", "Trading"],
    curatorMarkup: 15,
    stakerPool: 28400,
    apy: 18.4,
    constituentSkillIds: ["skill-1", "skill-2", "skill-6", "skill-8"],
    curatorAddress: "@bundler_alpha",
    invocations: 89400,
    totalVolume: 2240.5,
    myStaked: 500,
  },
  {
    id: "bundle-2",
    name: "Web3 Research Terminal",
    description: "All-in-one research bundle for due diligence on new protocols. Covers DeFi research, DAO governance, tokenomics modeling, and sentiment analysis in one MCP call.",
    tags: ["Research", "Due Diligence", "Analysis"],
    curatorMarkup: 12,
    stakerPool: 14200,
    apy: 14.2,
    constituentSkillIds: ["skill-4", "skill-9", "skill-10", "skill-13"],
    curatorAddress: "@research_hub",
    invocations: 42100,
    totalVolume: 890.3,
    myStaked: 0,
  },
  {
    id: "bundle-3",
    name: "Builder's Dev Pack",
    description: "Developer-focused bundle for Web3 engineers. Smart contract auditing, Rust code generation, and whitepaper drafting — everything to ship faster and safer.",
    tags: ["Dev", "Code", "Security"],
    curatorMarkup: 18,
    stakerPool: 9800,
    apy: 21.7,
    constituentSkillIds: ["skill-3", "skill-11", "skill-12"],
    curatorAddress: "@dev_curated",
    invocations: 18700,
    totalVolume: 620.8,
    myStaked: 200,
  },
  {
    id: "bundle-4",
    name: "News & Narrative Engine",
    description: "Content intelligence for agents that need to understand and create crypto narratives. Bundles news summarization, sentiment, and grant writing for maximum coverage.",
    tags: ["Content", "Media", "AI"],
    curatorMarkup: 10,
    stakerPool: 7600,
    apy: 11.9,
    constituentSkillIds: ["skill-7", "skill-4", "skill-15"],
    curatorAddress: "@content_layer",
    invocations: 71200,
    totalVolume: 380.1,
    myStaked: 0,
  },
  {
    id: "bundle-5",
    name: "Portfolio Intelligence Pro",
    description: "The definitive portfolio management stack. Tracks on-chain performance, layers in DeFi research, and combines MEV and algo strategies for institutional-grade reporting.",
    tags: ["Portfolio", "Institutional", "Multi-chain"],
    curatorMarkup: 20,
    stakerPool: 19100,
    apy: 24.3,
    constituentSkillIds: ["skill-14", "skill-13", "skill-8", "skill-6"],
    curatorAddress: "@inst_grade",
    invocations: 31800,
    totalVolume: 1120.7,
    myStaked: 1000,
  },
  {
    id: "bundle-6",
    name: "NFT Alpha Kit",
    description: "Everything an agent needs to dominate the NFT market. Rarity analysis, sentiment signals, and news coverage combined into one callable endpoint.",
    tags: ["NFT", "Alpha", "Collectibles"],
    curatorMarkup: 13,
    stakerPool: 5200,
    apy: 15.6,
    constituentSkillIds: ["skill-5", "skill-4", "skill-7"],
    curatorAddress: "@nft_curator",
    invocations: 24500,
    totalVolume: 290.4,
    myStaked: 0,
  },
];
