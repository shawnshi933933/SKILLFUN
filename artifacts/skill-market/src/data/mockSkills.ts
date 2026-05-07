export type SkillVersion = {
  id: string;
  cid: string;
  timestamp: string;
  changeSummary: string;
};

export type Skill = {
  id: string;
  name: string;
  description: string;
  category: "Trading" | "Writing" | "Analysis" | "Code" | "Research" | "Social";
  tags: string[];
  price: number;
  volume: number;
  shares: {
    creator: number;
    earlyHolders: number;
    platform: number;
  };
  claimedBy: string | null;
  contentHash: string;
  versions: SkillVersion[];
  agentPurchaseCount: number;
  totalHolders: number;
  isTimelockPending: boolean;
};

export const mockSkills: Skill[] = [
  {
    id: "skill-1",
    name: "Whale Wallet Tracker",
    description: "Tracks deep liquidity movements and large wallet transactions on Ethereum and Solana.",
    category: "Trading",
    tags: ["DeFi", "On-chain", "Whales"],
    price: 0.05,
    volume: 120.5,
    shares: { creator: 50, earlyHolders: 30, platform: 20 },
    claimedBy: "@cryptowhale99",
    contentHash: "0x8f3a9b1c2d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
    versions: [
      { id: "v1.2", cid: "QmX8Y9...", timestamp: "2023-10-15T14:30:00Z", changeSummary: "Added Solana support" },
      { id: "v1.1", cid: "QmZ1A2...", timestamp: "2023-09-01T09:00:00Z", changeSummary: "Optimized parsing" },
      { id: "v1.0", cid: "QmB3C4...", timestamp: "2023-08-10T11:20:00Z", changeSummary: "Initial release" }
    ],
    agentPurchaseCount: 450,
    totalHolders: 120,
    isTimelockPending: false
  },
  {
    id: "skill-2",
    name: "Yield Farming Optimizer",
    description: "Autonomously finds and executes the highest yield farming strategies across EVM chains.",
    category: "Trading",
    tags: ["DeFi", "Yield", "Automation"],
    price: 0.12,
    volume: 540.2,
    shares: { creator: 50, earlyHolders: 30, platform: 20 },
    claimedBy: "@defi_analyst",
    contentHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    versions: [
      { id: "v2.0", cid: "QmY4X5...", timestamp: "2023-11-02T08:15:00Z", changeSummary: "Arbitrum integration" }
    ],
    agentPurchaseCount: 890,
    totalHolders: 340,
    isTimelockPending: true
  },
  {
    id: "skill-3",
    name: "Smart Contract Auditor",
    description: "Static analysis tool for detecting vulnerabilities in Solidity smart contracts.",
    category: "Code",
    tags: ["Security", "Solidity", "Audit"],
    price: 0.25,
    volume: 890.0,
    shares: { creator: 50, earlyHolders: 30, platform: 20 },
    claimedBy: "@sec_expert",
    contentHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
    versions: [
      { id: "v3.1", cid: "QmW6V7...", timestamp: "2023-11-10T16:45:00Z", changeSummary: "Updated vulnerability database" }
    ],
    agentPurchaseCount: 1200,
    totalHolders: 50,
    isTimelockPending: false
  },
  {
    id: "skill-4",
    name: "Sentiment Analysis Engine",
    description: "Analyzes Twitter and Reddit sentiment for specific crypto tokens.",
    category: "Analysis",
    tags: ["Social", "NLP", "AI"],
    price: 0.08,
    volume: 210.5,
    shares: { creator: 50, earlyHolders: 30, platform: 20 },
    claimedBy: "@data_nerd",
    contentHash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
    versions: [
      { id: "v1.5", cid: "QmU8T9...", timestamp: "2023-10-20T10:30:00Z", changeSummary: "Added Reddit support" }
    ],
    agentPurchaseCount: 300,
    totalHolders: 80,
    isTimelockPending: false
  },
  {
    id: "skill-5",
    name: "NFT Rarity Scraper",
    description: "Calculates rarity scores for new NFT collections immediately upon mint.",
    category: "Analysis",
    tags: ["NFT", "Rarity", "Scraping"],
    price: 0.03,
    volume: 85.2,
    shares: { creator: 50, earlyHolders: 30, platform: 20 },
    claimedBy: null,
    contentHash: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
    versions: [
      { id: "v1.0", cid: "QmS1R2...", timestamp: "2023-09-05T12:00:00Z", changeSummary: "Initial release" }
    ],
    agentPurchaseCount: 150,
    totalHolders: 40,
    isTimelockPending: false
  },
  {
    id: "skill-6",
    name: "MEV Bot Strategy",
    description: "Advanced MEV extraction strategies for Ethereum mainnet.",
    category: "Trading",
    tags: ["MEV", "Ethereum", "Bot"],
    price: 0.5,
    volume: 1500.0,
    shares: { creator: 50, earlyHolders: 30, platform: 20 },
    claimedBy: "@mev_king",
    contentHash: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
    versions: [
      { id: "v4.0", cid: "QmP3Q4...", timestamp: "2023-11-15T09:20:00Z", changeSummary: "Optimized gas usage" }
    ],
    agentPurchaseCount: 2000,
    totalHolders: 20,
    isTimelockPending: false
  },
  {
    id: "skill-7",
    name: "Crypto News Summarizer",
    description: "Aggregates and summarizes top crypto news from various sources.",
    category: "Writing",
    tags: ["News", "AI", "Summary"],
    price: 0.02,
    volume: 45.8,
    shares: { creator: 50, earlyHolders: 30, platform: 20 },
    claimedBy: "@crypto_daily",
    contentHash: "0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a",
    versions: [
      { id: "v1.1", cid: "QmN5M6...", timestamp: "2023-10-01T14:10:00Z", changeSummary: "Added Coindesk source" }
    ],
    agentPurchaseCount: 80,
    totalHolders: 30,
    isTimelockPending: false
  },
  {
    id: "skill-8",
    name: "Algorithmic Trading Bot",
    description: "Executes trades based on predefined technical indicators.",
    category: "Trading",
    tags: ["Algo", "Trading", "Bot"],
    price: 0.15,
    volume: 620.4,
    shares: { creator: 50, earlyHolders: 30, platform: 20 },
    claimedBy: null,
    contentHash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    versions: [
      { id: "v2.5", cid: "QmL7K8...", timestamp: "2023-11-05T11:45:00Z", changeSummary: "Added MACD indicator" }
    ],
    agentPurchaseCount: 950,
    totalHolders: 210,
    isTimelockPending: false
  },
  {
    id: "skill-9",
    name: "Tokenomics Modeler",
    description: "Simulates and models token economies for new projects.",
    category: "Research",
    tags: ["Tokenomics", "Simulation", "Math"],
    price: 0.1,
    volume: 310.2,
    shares: { creator: 50, earlyHolders: 30, platform: 20 },
    claimedBy: "@token_architect",
    contentHash: "0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c",
    versions: [
      { id: "v1.3", cid: "QmJ9H0...", timestamp: "2023-10-25T15:30:00Z", changeSummary: "Improved inflation models" }
    ],
    agentPurchaseCount: 420,
    totalHolders: 90,
    isTimelockPending: false
  },
  {
    id: "skill-10",
    name: "DAO Governance Analyzer",
    description: "Analyzes voting patterns and proposal outcomes in major DAOs.",
    category: "Analysis",
    tags: ["DAO", "Governance", "Data"],
    price: 0.06,
    volume: 180.9,
    shares: { creator: 50, earlyHolders: 30, platform: 20 },
    claimedBy: null,
    contentHash: "0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d",
    versions: [
      { id: "v1.0", cid: "QmG1F2...", timestamp: "2023-09-15T09:00:00Z", changeSummary: "Initial release" }
    ],
    agentPurchaseCount: 250,
    totalHolders: 60,
    isTimelockPending: false
  },
  {
    id: "skill-11",
    name: "Rust Smart Contract Gen",
    description: "Generates boilerplate Rust code for Solana smart contracts.",
    category: "Code",
    tags: ["Rust", "Solana", "Generator"],
    price: 0.09,
    volume: 270.5,
    shares: { creator: 50, earlyHolders: 30, platform: 20 },
    claimedBy: "@rust_dev",
    contentHash: "0x0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e",
    versions: [
      { id: "v1.2", cid: "QmD3E4...", timestamp: "2023-10-10T13:20:00Z", changeSummary: "Anchor framework support" }
    ],
    agentPurchaseCount: 380,
    totalHolders: 75,
    isTimelockPending: false
  },
  {
    id: "skill-12",
    name: "Crypto Twitter Bot",
    description: "Automated Twitter account that posts market updates and memes.",
    category: "Social",
    tags: ["Twitter", "Bot", "Memes"],
    price: 0.04,
    volume: 120.1,
    shares: { creator: 50, earlyHolders: 30, platform: 20 },
    claimedBy: null,
    contentHash: "0x1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f",
    versions: [
      { id: "v1.1", cid: "QmC5B6...", timestamp: "2023-09-28T16:15:00Z", changeSummary: "Added meme generation" }
    ],
    agentPurchaseCount: 190,
    totalHolders: 45,
    isTimelockPending: false
  },
  {
    id: "skill-13",
    name: "Whitepaper Drafter",
    description: "Assists in drafting technical whitepapers for new protocols.",
    category: "Writing",
    tags: ["Whitepaper", "Writing", "AI"],
    price: 0.07,
    volume: 190.8,
    shares: { creator: 50, earlyHolders: 30, platform: 20 },
    claimedBy: "@tech_writer",
    contentHash: "0x2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a",
    versions: [
      { id: "v1.0", cid: "QmA7Z8...", timestamp: "2023-09-08T10:45:00Z", changeSummary: "Initial release" }
    ],
    agentPurchaseCount: 260,
    totalHolders: 55,
    isTimelockPending: false
  },
  {
    id: "skill-14",
    name: "DeFi Protocol Researcher",
    description: "Deep dives into new DeFi protocols and provides risk assessments.",
    category: "Research",
    tags: ["DeFi", "Research", "Risk"],
    price: 0.11,
    volume: 340.6,
    shares: { creator: 50, earlyHolders: 30, platform: 20 },
    claimedBy: null,
    contentHash: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
    versions: [
      { id: "v1.4", cid: "QmY9X0...", timestamp: "2023-11-12T14:30:00Z", changeSummary: "Added layer 2 analysis" }
    ],
    agentPurchaseCount: 480,
    totalHolders: 110,
    isTimelockPending: true
  },
  {
    id: "skill-15",
    name: "Grant Proposal Writer",
    description: "Optimizes grant proposals for ecosystem funds and DAOs.",
    category: "Writing",
    tags: ["Grants", "Writing", "Funding"],
    price: 0.05,
    volume: 160.3,
    shares: { creator: 50, earlyHolders: 30, platform: 20 },
    claimedBy: "@grant_master",
    contentHash: "0x4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c",
    versions: [
      { id: "v1.1", cid: "QmW1V2...", timestamp: "2023-10-05T09:15:00Z", changeSummary: "Updated DAO templates" }
    ],
    agentPurchaseCount: 220,
    totalHolders: 65,
    isTimelockPending: false
  }
];