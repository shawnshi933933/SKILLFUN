/**
 * Hooks for the Curator authorization management panel.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useWriteContract, useAccount } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi";
import { curatorApi, type CuratorAuthorization } from "@/lib/api";
import { getAddresses } from "@workspace/abi";

// ---------------------------------------------------------------------------
// Query hook — list all authorizations for the connected wallet
// ---------------------------------------------------------------------------
export function useCuratorAuthorizations(wallet: string | undefined) {
  return useQuery({
    queryKey: ["curator-authorizations", wallet?.toLowerCase()],
    queryFn: () => curatorApi.listAuthorizations(wallet!),
    enabled: !!wallet,
    staleTime: 20_000,
  });
}

// ---------------------------------------------------------------------------
// On-chain addresses (0G Mainnet)
// ---------------------------------------------------------------------------
const SKILL_NFT_ADDRESS = getAddresses(16661).SkillNFT as `0x${string}`;
const W0G_ADDRESS       = "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c" as const;

// Minimal ABI fragments
const SKILL_NFT_ABI_FRAGMENT = [
  {
    name: "selfAuthorize",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "purchaseAuthorization",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
] as const;

const ERC20_ABI_FRAGMENT = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount",  type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner",   type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// ---------------------------------------------------------------------------
// Authorize phase type
// ---------------------------------------------------------------------------
export type AuthorizePhase =
  | "idle"
  | "approving_w0g"    // ERC-20 approve tx
  | "waiting_approve"  // waiting for approve tx
  | "authorizing"      // selfAuthorize / purchaseAuthorization tx
  | "waiting_auth"     // waiting for auth tx
  | "done"
  | "error";

export interface AuthorizeState {
  phase:  AuthorizePhase;
  txHash: `0x${string}` | null;
  error:  string | null;
}

const IDLE_STATE: AuthorizeState = { phase: "idle", txHash: null, error: null };

// ---------------------------------------------------------------------------
// 0G-RPC-resilient receipt waiter
// ---------------------------------------------------------------------------
// 0G's RPC endpoint sometimes returns "no matching receipts found" for valid
// submitted transactions, causing viem's waitForTransactionReceipt to throw
// even though the tx will eventually be mined. We retry up to ~90 s total,
// treating that specific error as a transient condition.
async function waitForTx(hash: `0x${string}`): Promise<void> {
  const MAX_ATTEMPTS   = 18;   // 18 × 5 s = 90 s
  const POLL_MS        = 5_000;
  const TRANSIENT_MSGS = ["no matching receipts", "missing or invalid", "could not be found"];

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await waitForTransactionReceipt(wagmiConfig as any, {
        hash,
        timeout:         30_000,
        pollingInterval: POLL_MS,
      });
      return; // success
    } catch (err) {
      const msg = ((err as Error).message ?? "").toLowerCase();
      const isTransient = TRANSIENT_MSGS.some((s) => msg.includes(s));
      if (!isTransient || attempt === MAX_ATTEMPTS - 1) throw err;
      // wait before retrying
      await new Promise((r) => setTimeout(r, POLL_MS));
    }
  }
}

// ---------------------------------------------------------------------------
// Authorize hook
// ---------------------------------------------------------------------------
export function useAuthorizeSkill() {
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const [state, setState] = useState<AuthorizeState>(IDLE_STATE);

  const authorize = useCallback(async (skill: Pick<CuratorAuthorization, "tokenId" | "isClaimed" | "basePrice">) => {
    if (!address) throw new Error("Wallet not connected");
    setState({ phase: "approving_w0g", txHash: null, error: null });

    try {
      const basePriceBigInt = BigInt(skill.basePrice);

      // Step 1: ERC-20 approve (only for claimed skills with non-zero price)
      if (skill.isClaimed && basePriceBigInt > 0n) {
        setState((s) => ({ ...s, phase: "approving_w0g" }));
        const approveTx = await writeContractAsync({
          address:      W0G_ADDRESS,
          abi:          ERC20_ABI_FRAGMENT,
          functionName: "approve",
          args:         [SKILL_NFT_ADDRESS, basePriceBigInt],
        });
        setState((s) => ({ ...s, phase: "waiting_approve", txHash: approveTx }));
        await waitForTx(approveTx);
      }

      // Step 2: selfAuthorize (unclaimed) or purchaseAuthorization (claimed)
      setState((s) => ({ ...s, phase: "authorizing", txHash: null }));
      const fnName = skill.isClaimed ? "purchaseAuthorization" : "selfAuthorize";
      const authTx = await writeContractAsync({
        address:      SKILL_NFT_ADDRESS,
        abi:          SKILL_NFT_ABI_FRAGMENT,
        functionName: fnName,
        args:         [BigInt(skill.tokenId)],
      });
      setState((s) => ({ ...s, phase: "waiting_auth", txHash: authTx }));
      await waitForTx(authTx);

      setState({ phase: "done", txHash: authTx, error: null });

      // Invalidate curator authorizations query so the dashboard refreshes
      void queryClient.invalidateQueries({ queryKey: ["curator-authorizations"] });

      // Small delay to let the event-listener pick it up before the next poll
      setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: ["curator-authorizations"] });
      }, 5_000);

      return authTx;
    } catch (err) {
      const msg = (err as Error).message ?? "Unknown error";
      setState({ phase: "error", txHash: null, error: msg });
      throw err;
    }
  }, [address, writeContractAsync, queryClient]);

  const reset = useCallback(() => setState(IDLE_STATE), []);

  return { state, authorize, reset };
}
