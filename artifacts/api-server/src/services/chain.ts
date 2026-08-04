import { createPublicClient, http, formatEther } from "viem";
import { ZEROG_MAINNET, SkillNFT_ABI, SkillFunOracle_ABI, getAddresses } from "@workspace/abi";
import { logger } from "../lib/logger.js";
import { cached, cacheKey, TTL } from "./cache.js";
import { getWalletClient, getPublicClient } from "./wallet.js";

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
      return { address, balanceWei: wei.toString(), balance0G: formatEther(wei) };
    })
  );
}

/**
 * Return the current ERC-721 owner of a token (null if not minted / burned).
 * Used to confirm an on-chain claim before marking the DB record completed.
 */
export async function getOnChainBasePrice(tokenId: number): Promise<bigint> {
  return rpcCall("getOnChainBasePrice", () =>
    client.readContract({
      address: addresses.SkillNFT as `0x${string}`,
      abi: SkillNFT_ABI,
      functionName: "basePrice",
      args: [BigInt(tokenId)],
    }) as Promise<bigint>
  );
}

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

/**
 * Mint a new Skill NFT on-chain using the deployer wallet.
 * Calls SkillNFT.registerSkill(repoUrl, skillURI, rootHash, to).
 *
 * @param to  Recipient address.
 *            • User's wallet  → "My Repo" mode (user owns immediately).
 *            • SkillNFT contract address → "Not My Repo" (platform custody until claim).
 *            Defaults to the SkillNFT contract address (platform custody).
 */
export async function mintSkillOnChain(
  repoUrl: string,
  skillUri: string,
  rootHash: `0x${string}`,
  to?: `0x${string}`,
  basePriceWei: bigint = 0n
): Promise<{ tokenId: number; txHash: string }> {
  return rpcCall("mintSkillOnChain", async () => {
    const walletClient = getWalletClient();
    const publicCl     = getPublicClient();

    const rootHashBytes32: `0x${string}` = rootHash.startsWith("0x")
      ? (rootHash.padEnd(66, "0") as `0x${string}`)
      : (`0x${rootHash.padEnd(64, "0")}` as `0x${string}`);

    // Default: platform custody (NFT held by SkillNFT contract until claim)
    const recipient: `0x${string}` = to ?? (addresses.SkillNFT as `0x${string}`);

    const txHash = await walletClient.writeContract({
      address: addresses.SkillNFT as `0x${string}`,
      abi: SkillNFT_ABI,
      functionName: "registerSkill",
      args: [repoUrl, skillUri, rootHashBytes32 as `0x${string}`, recipient, basePriceWei],
    });

    logger.info({ txHash, repoUrl }, "registerSkill tx submitted, waiting for receipt…");
    const receipt = await publicCl.waitForTransactionReceipt({ hash: txHash, timeout: 60_000 });

    if (receipt.status !== "success") {
      throw new Error(`registerSkill reverted — tx: ${txHash}`);
    }

    // Parse SkillRegistered event to get tokenId
    const { decodeEventLog } = await import("viem");
    const skillRegisteredTopic = "0x" + Buffer.from(
      "SkillRegistered(uint256,string,string,bytes32)"
    ).toString("hex"); // placeholder — we parse by known topic

    let tokenId: number | null = null;
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: SkillNFT_ABI,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === "SkillRegistered") {
          tokenId = Number((decoded.args as { tokenId: bigint }).tokenId);
          break;
        }
      } catch { /* not a matching log */ }
    }

    if (tokenId === null) {
      // Fallback: read nextTokenId by checking Transfer events
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({ abi: SkillNFT_ABI, data: log.data, topics: log.topics });
          if (decoded.eventName === "Transfer") {
            const args = decoded.args as { tokenId: bigint };
            tokenId = Number(args.tokenId);
            break;
          }
        } catch { /* skip */ }
      }
    }

    if (tokenId === null) {
      throw new Error(`Could not determine tokenId from receipt ${txHash}`);
    }

    logger.info({ txHash, tokenId }, "registerSkill confirmed");
    return { tokenId, txHash };
  });
}

/**
 * Write Oracle verification on-chain using the deployer private key (server-side).
 * Calls SkillFunOracle.setVerifiedClaims([tokenId], [walletAddress]).
 */
export async function writeOracleVerification(
  tokenId: number,
  walletAddress: string
): Promise<{ txHash: string }> {
  return rpcCall("writeOracleVerification", async () => {
    const walletClient = getWalletClient();
    const publicCl     = getPublicClient();

    const txHash = await walletClient.writeContract({
      address: addresses.SkillFunOracle as `0x${string}`,
      abi: SkillFunOracle_ABI,
      functionName: "setVerifiedClaims",
      args: [[BigInt(tokenId)], [walletAddress as `0x${string}`]],
    });

    logger.info({ txHash, tokenId, walletAddress }, "setVerifiedClaims tx submitted");
    const receipt = await publicCl.waitForTransactionReceipt({ hash: txHash, timeout: 60_000 });

    if (receipt.status !== "success") {
      throw new Error(`setVerifiedClaims reverted — tx: ${txHash}`);
    }

    logger.info({ txHash, tokenId }, "Oracle verification written on-chain");
    return { txHash };
  });
}

/**
 * Check whether `userAddress` has on-chain authorization for `tokenId`.
 * Reads SkillNFT.isAuthorized(tokenId, user).
 */
export async function isAuthorizedOnChain(tokenId: number, userAddress: string): Promise<boolean> {
  return rpcCall("isAuthorizedOnChain", async () => {
    const result = await client.readContract({
      address: addresses.SkillNFT as `0x${string}`,
      abi: SkillNFT_ABI,
      functionName: "isAuthorized",
      args: [BigInt(tokenId), userAddress as `0x${string}`],
    });
    return result as boolean;
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
