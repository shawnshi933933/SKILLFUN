/**
 * @workspace/abi
 * Centralised ABI + address exports for SkillFun contracts.
 *
 * Usage:
 *   import { SkillNFT_ABI, SkillFunOracle_ABI, getAddresses, ZEROG_MAINNET } from '@workspace/abi'
 */

import SkillFunOracleAbi from "./SkillFunOracle.abi.json";
import SkillNFTAbi from "./SkillNFT.abi.json";
import addressesJson from "./addresses.json";

// ---------------------------------------------------------------------------
// ABI exports
// ---------------------------------------------------------------------------
export const SkillFunOracle_ABI = SkillFunOracleAbi as readonly object[];
export const SkillNFT_ABI = SkillNFTAbi as readonly object[];

// ---------------------------------------------------------------------------
// Address registry
// ---------------------------------------------------------------------------
type ContractName = "SkillFunOracle" | "SkillFunVerifierStub" | "SkillNFT";
type AddressMap = Record<string, Record<string, string>>;

const _addresses = addressesJson as AddressMap;

export function getAddresses(chainId: number): Record<ContractName, string> {
  const entry = _addresses[String(chainId)];
  if (!entry) {
    throw new Error(
      `No contract addresses found for chainId ${chainId}. Run the deploy script first.`
    );
  }
  return entry as Record<ContractName, string>;
}

export const allAddresses: AddressMap = _addresses;

// ---------------------------------------------------------------------------
// Chain config — 0G Mainnet (chainId 16661)
// ---------------------------------------------------------------------------
export const ZEROG_MAINNET = {
  id: 16661,
  name: "0G Mainnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://evmrpc.0g.ai"] },
  },
  blockExplorers: {
    default: {
      name: "0G Scan",
      url: "https://chainscan.0g.ai",
    },
  },
} as const;

// Keep legacy export name for backwards compatibility
export const ZEROG_TESTNET = ZEROG_MAINNET;

// ---------------------------------------------------------------------------
// W0G — Wrapped 0G ERC-20 token address (0G Mainnet)
// ---------------------------------------------------------------------------
export const W0G_ADDRESS = "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c" as const;
