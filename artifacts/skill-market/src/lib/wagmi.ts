import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

// ---------------------------------------------------------------------------
// 0G Mainnet (chainId 16661)
// ---------------------------------------------------------------------------
export const zerogMainnet = defineChain({
  id: 16661,
  name: "0G Mainnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://evmrpc.0g.ai", "https://rpc.0g.ai", "https://0g.rpc.thirdweb.com"] },
  },
  blockExplorers: {
    default: { name: "0G Scan", url: "https://chainscan.0g.ai" },
  },
});

// WalletConnect projectId — set VITE_WALLETCONNECT_PROJECT_ID in env.
// Without a real projectId WalletConnect modals won't open, but injected
// wallets (MetaMask, Rabby, etc.) work fine for the demo.
const projectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "skillfun-demo-project";

export const wagmiConfig = getDefaultConfig({
  appName: "SkillFun",
  projectId,
  chains: [zerogMainnet],
  ssr: false,
});
