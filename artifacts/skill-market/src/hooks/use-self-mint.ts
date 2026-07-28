/**
 * Self-mint hook — covers both ownership modes:
 *
 *  "mine"      → user calls registerSkill(…, userAddress)   → NFT to user
 *  "community" → user calls registerSkill(…, contractAddr)  → NFT in platform custody
 *
 * Flow:
 *  1. POST /api/skills/prepare-mint  (EIP-712 signed)
 *     Server uploads manifest to 0G Storage, creates DB record, returns call params.
 *  2. wagmi writeContractAsync → SkillNFT.registerSkill(repoUrl, skillUri, rootHash, to)
 *     User pays gas; `to` = userAddress (mine) or skillNFTAddress (community).
 *  3. waitForTransactionReceipt → parse SkillRegistered / Transfer event for tokenId.
 *  4. PATCH /api/skills/:id/confirm-mint  (EIP-712 signed)
 *     Server confirms on-chain, sets mintStatus=minted in DB.
 */

import { useCallback, useState } from "react";
import { useWriteContract, useAccount } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { parseEventLogs } from "viem";
import { wagmiConfig } from "@/lib/wagmi";
import { useEip712Sign } from "./use-eip712";
import { skillsApi, type PrepareMintInput } from "@/lib/api";

// Minimal ABI fragment — only what the frontend needs to call registerSkill
// and decode SkillRegistered / Transfer events.
const SKILL_NFT_ABI_FRAGMENT = [
  {
    name: "registerSkill",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "repoUrl",  type: "string"  },
      { name: "skillURI", type: "string"  },
      { name: "rootHash", type: "bytes32" },
      { name: "to",       type: "address" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    name: "SkillRegistered",
    type: "event",
    anonymous: false,
    inputs: [
      { indexed: true,  name: "tokenId",  type: "uint256" },
      { indexed: false, name: "repoUrl",  type: "string"  },
      { indexed: false, name: "skillURI", type: "string"  },
      { indexed: false, name: "rootHash", type: "bytes32" },
    ],
  },
  {
    name: "Transfer",
    type: "event",
    anonymous: false,
    inputs: [
      { indexed: true, name: "from",    type: "address" },
      { indexed: true, name: "to",      type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
    ],
  },
] as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export type MintPhase =
  | "idle"
  | "preparing"   // uploading manifest, creating DB record
  | "signing_tx"  // waiting for wallet to approve tx
  | "confirming"  // waiting for block confirmation
  | "finalizing"  // PATCH confirm-mint
  | "done"
  | "error";

export interface MintState {
  phase:   MintPhase;
  skillId: string | null;
  tokenId: number | null;
  txHash:  `0x${string}` | null;
  error:   string | null;
}

const IDLE: MintState = { phase: "idle", skillId: null, tokenId: null, txHash: null, error: null };

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSelfMint() {
  const { address } = useAccount();
  const sign = useEip712Sign();
  const { writeContractAsync } = useWriteContract();

  const [state, setState] = useState<MintState>(IDLE);

  const mint = useCallback(async (input: PrepareMintInput) => {
    if (!address) throw new Error("Wallet not connected");
    setState({ ...IDLE, phase: "preparing" });

    try {
      // ── Step 1: prepare (server uploads manifest, creates DB record) ─────
      const prepSig = await (async () => {
        // sign first so UX is: sign EIP-712 → spinner while server uploads
        setState((s) => ({ ...s, phase: "preparing" }));
        return sign("user:prepare-mint");
      })();

      const prep = await skillsApi.prepareMint(input, prepSig);
      setState((s) => ({ ...s, skillId: prep.skillId }));

      // ── Step 2: call SkillNFT.registerSkill from user's wallet ───────────
      setState((s) => ({ ...s, phase: "signing_tx" }));

      const rootHashBytes32 = (
        prep.rootHash.startsWith("0x")
          ? prep.rootHash.padEnd(66, "0")
          : `0x${prep.rootHash.padEnd(64, "0")}`
      ) as `0x${string}`;

      // "mine"      → NFT to user's own address
      // "community" → NFT to SkillNFT contract (platform custody, claimable later)
      const recipient: `0x${string}` =
        input.ownerMode === "mine"
          ? address
          : (prep.skillNFTAddress as `0x${string}`);

      const txHash = await writeContractAsync({
        address: prep.skillNFTAddress as `0x${string}`,
        abi: SKILL_NFT_ABI_FRAGMENT,
        functionName: "registerSkill",
        args: [prep.manifestOwner, prep.skillUri, rootHashBytes32, recipient],
      });
      setState((s) => ({ ...s, txHash, phase: "confirming" }));

      // ── Step 3: wait for receipt, parse tokenId ──────────────────────────
      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: txHash,
        timeout: 90_000,
      });

      if (receipt.status !== "success") {
        throw new Error(`Transaction reverted: ${txHash}`);
      }

      let tokenId: number | null = null;

      // Try SkillRegistered event first
      try {
        const logs = parseEventLogs({ abi: SKILL_NFT_ABI_FRAGMENT, eventName: "SkillRegistered", logs: receipt.logs });
        if (logs.length > 0) tokenId = Number((logs[0].args as { tokenId: bigint }).tokenId);
      } catch { /* ignore */ }

      // Fallback: Transfer event (ERC-721 mint: from=0x0)
      if (tokenId === null) {
        try {
          const logs = parseEventLogs({ abi: SKILL_NFT_ABI_FRAGMENT, eventName: "Transfer", logs: receipt.logs });
          if (logs.length > 0) tokenId = Number((logs[0].args as { tokenId: bigint }).tokenId);
        } catch { /* ignore */ }
      }

      if (tokenId === null) throw new Error("Could not parse tokenId from receipt");
      setState((s) => ({ ...s, tokenId, phase: "finalizing" }));

      // ── Step 4: confirm with backend → DB mintStatus=minted ─────────────
      const confirmSig = await sign("user:confirm-mint");
      await skillsApi.confirmMint(prep.skillId, { tokenId, txHash }, confirmSig);

      setState({ phase: "done", skillId: prep.skillId, tokenId, txHash, error: null });
    } catch (err) {
      setState((s) => ({ ...s, phase: "error", error: (err as Error).message }));
      throw err;
    }
  }, [address, sign, writeContractAsync]);

  const reset = useCallback(() => setState(IDLE), []);

  return { state, mint, reset };
}
