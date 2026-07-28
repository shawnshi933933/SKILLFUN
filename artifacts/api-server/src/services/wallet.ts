/**
 * Deployer wallet client — used exclusively by admin mint operations.
 * Never expose this on any public route.
 */
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ZEROG_MAINNET } from "@workspace/abi";

function getDeployerPrivateKey(): `0x${string}` {
  const raw = process.env.DEPLOYER_PRIVATE_KEY;
  if (!raw) throw new Error("DEPLOYER_PRIVATE_KEY env var is not set");
  const hex = raw.startsWith("0x") ? raw : `0x${raw}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(hex)) throw new Error("DEPLOYER_PRIVATE_KEY is not a valid 32-byte hex string");
  return hex as `0x${string}`;
}

export function getDeployerAccount() {
  return privateKeyToAccount(getDeployerPrivateKey());
}

export function getWalletClient() {
  const account = getDeployerAccount();
  return createWalletClient({
    account,
    chain: ZEROG_MAINNET,
    transport: http(process.env.ZEROG_RPC_URL ?? "https://evmrpc.0g.ai"),
  });
}

export function getPublicClient() {
  return createPublicClient({
    chain: ZEROG_MAINNET,
    transport: http(process.env.ZEROG_RPC_URL ?? "https://evmrpc.0g.ai"),
  });
}
