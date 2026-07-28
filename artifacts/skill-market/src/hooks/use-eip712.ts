import { useCallback } from "react";
import { useSignTypedData, useAccount } from "wagmi";
import { authApi } from "@/lib/api";

const EIP712_DOMAIN = {
  name: "SkillFun",
  version: "1",
  chainId: 16661,
} as const;

const EIP712_TYPES = {
  Action: [
    { name: "action",    type: "string" },
    { name: "nonce",     type: "string" },
    { name: "timestamp", type: "uint256" },
  ],
} as const;

/**
 * Returns a helper that:
 * 1. Fetches a one-time challenge nonce from the server
 * 2. Asks the user to sign it with their wallet
 * 3. Returns the JSON header value expected by X-Wallet-Signature
 *
 * Usage:
 *   const sign = useEip712Sign();
 *   const sigHeader = await sign("register-skill");
 *   // Then POST /api/skills with header X-Wallet-Signature: sigHeader
 */
export function useEip712Sign() {
  const { signTypedDataAsync } = useSignTypedData();
  const { address } = useAccount();

  return useCallback(
    async (action: string): Promise<string> => {
      if (!address) throw new Error("Wallet not connected");

      const { nonce } = await authApi.challenge();
      const timestamp = BigInt(Math.floor(Date.now() / 1000));

      const signature = await signTypedDataAsync({
        domain: EIP712_DOMAIN,
        types: EIP712_TYPES,
        primaryType: "Action",
        message: { action, nonce, timestamp },
      });

      return JSON.stringify({
        action,
        nonce,
        timestamp: Number(timestamp),
        signature,
      });
    },
    [address, signTypedDataAsync]
  );
}
