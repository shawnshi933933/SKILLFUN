import { createPublicClient, http, formatEther } from "viem";
import { ZEROG_MAINNET, SkillNFT_ABI, SkillFunOracle_ABI, getAddresses } from "@workspace/abi";
import { logger } from "../lib/logger.js";
import { cached, cacheKey, TTL } from "./cache.js";

const CHAIN_ID = 16661;

const client = createPublicClient({
  chain: ZEROG_MAINNET,
  transport: http(process.env.ZEROG_RPC_URL ?? "https://evmrpc.0g.ai"),
});

const addresses = getAddresses(CHAIN_ID);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function rpcCall<T>(method: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    logger.debug({ chainId: CHAIN_ID, method, latencyMs: Date.now() - start }, "rpc ok");
    return result;
  } catch (err) {
    logger.error({ chainId: CHAIN_ID, method, latencyMs: Date.now() - start, err }, "rpc error");
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getSkillOnChain(tokenId: number) {
  const key = cacheKey(CHAIN_ID, "getSkillOnChain", tokenId);
  return cached(key, TTL.SKILL_METADATA, () =>
    rpcCall("getSkillOnChain", async () => {
      const [manifestOwner, intelligentData, owner] = await Promise.all([
        client.readContract({
          address: addresses.SkillNFT as `0x${string}`,
          abi: SkillNFT_ABI,
          functionName: "manifestOwner",
          args: [BigInt(tokenId)],
        }),
        client.readContract({
          address: addresses.SkillNFT as `0x${string}`,
          abi: SkillNFT_ABI,
          functionName: "intelligentDataOf",
          args: [BigInt(tokenId)],
        }),
        client.readContract({
          address: addresses.SkillNFT as `0x${string}`,
          abi: SkillNFT_ABI,
          functionName: "ownerOf",
          args: [BigInt(tokenId)],
        }).catch(() => null), // not minted yet
      ]);
      return { tokenId, manifestOwner, intelligentData, owner };
    })
  );
}

export async function getBalance(address: string) {
  const key = cacheKey(CHAIN_ID, "getBalance", address.toLowerCase());
  return cached(key, TTL.BALANCE, () =>
    rpcCall("getBalance", async () => {
      const wei = await client.getBalance({ address: address as `0x${string}` });
      return { address, balanceWei: wei.toString(), balanceA0GI: formatEther(wei) };
    })
  );
}

/**
 * Return the current ERC-721 owner of a token (null if not minted / burned).
 * Used to confirm an on-chain claim before marking the DB record completed.
 */
export async function getOnChainOwner(tokenId: number): Promise<string | null> {
  return rpcCall("getOnChainOwner", async () => {
    try {
      const owner = await client.readContract({
        address: addresses.SkillNFT as `0x${string}`,
        abi: SkillNFT_ABI,
        functionName: "ownerOf",
        args: [BigInt(tokenId)],
      });
      return (owner as string).toLowerCase();
    } catch {
      return null; // token not yet minted or reverted
    }
  });
}

export async function getOracleVerifiedOwner(tokenId: number) {
  const key = cacheKey(CHAIN_ID, "getOracleVerifiedOwner", tokenId);
  return cached(key, TTL.ORACLE, () =>
    rpcCall("getOracleVerifiedOwner", async () => {
      const verifiedOwner = await client.readContract({
        address: addresses.SkillFunOracle as `0x${string}`,
        abi: SkillFunOracle_ABI,
        functionName: "verifiedOwner",
        args: [BigInt(tokenId)],
      });
      return { tokenId, verifiedOwner };
    })
  );
}
