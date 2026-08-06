/**
 * Admin Claims Review Panel
 * Route: /app/admin/claims
 *
 * Wallet-gated to the platform deployer address.
 * Shows all pending Skill claims; admin can approve or reject each one.
 * After approval, a "Write Oracle" button lets the connected deployer wallet
 * write verification on-chain directly via wagmi — no CLI step needed.
 */

import { useState, useCallback, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SkillFunOracle_ABI } from "@workspace/abi";
import {
  Shield, Loader2, CheckCircle2, XCircle, Clock, RefreshCw,
  ChevronDown, ChevronUp, AlertTriangle, Zap, Terminal, ArrowRight,
} from "lucide-react";
import { useEip712Sign } from "@/hooks/use-eip712";
import { adminApi } from "@/lib/api";
import type { DbClaim } from "@/lib/api";

// SkillFunOracle V3 (Ownable + operators, updatable skillNFT)
const ORACLE_ADDRESS = "0xD01885aE4E9d30B44C73E8f9B8ceA04869e70167" as const;
// Default target = current canonical SkillNFT address from addresses.json
const DEFAULT_TARGET = "0x16221091Fe04BFEFe54Cd02234946c7eFDB37477";

// ---------------------------------------------------------------------------
// SetSkillNFT panel — Oracle owner can point to any new SkillNFT proxy
// ---------------------------------------------------------------------------

function SetSkillNFTPanel({ isOwner }: { isOwner: boolean }) {
  const { toast } = useToast();
  const [targetAddr, setTargetAddr] = useState(DEFAULT_TARGET);

  // Read current skillNFT pointer from Oracle
  const { data: currentSkillNFT, refetch } = useReadContract({
    address: ORACLE_ADDRESS,
    abi: SkillFunOracle_ABI as readonly object[],
    functionName: "skillNFT",
  });

  const {
    writeContract,
    data: txHash,
    isPending: isSigning,
    error: writeError,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (writeError) {
      toast({ title: "setSkillNFT failed", description: (writeError as Error).message.slice(0, 160), variant: "destructive" });
      reset();
    }
  }, [writeError]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isConfirmed) {
      toast({ title: "Oracle updated", description: `skillNFT → ${targetAddr.slice(0, 10)}…` });
      refetch();
    }
  }, [isConfirmed]); // eslint-disable-line react-hooks/exhaustive-deps

  const isValidAddr = /^0x[0-9a-fA-F]{40}$/.test(targetAddr);
  const alreadyWired =
    typeof currentSkillNFT === "string" && isValidAddr &&
    currentSkillNFT.toLowerCase() === targetAddr.toLowerCase();

  const busy = isSigning || isConfirming;

  return (
    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-5 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-semibold text-indigo-300">Oracle — set SkillNFT pointer</span>
        {alreadyWired && (
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-xs ml-auto">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Already wired
          </Badge>
        )}
      </div>

      {/* Current → target */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2 mb-4">
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
          <p className="text-xs text-muted-foreground mb-0.5">Current skillNFT</p>
          <p className="text-xs font-mono text-foreground/70 truncate">
            {currentSkillNFT ? String(currentSkillNFT) : "Loading…"}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground mx-auto hidden sm:block" />
        <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 px-3 py-2">
          <p className="text-xs text-muted-foreground mb-1">Target address</p>
          <input
            type="text"
            value={targetAddr}
            onChange={e => setTargetAddr(e.target.value.trim())}
            placeholder="0x…"
            className="w-full bg-transparent text-xs font-mono text-indigo-300 outline-none border-0 p-0 placeholder:text-indigo-500/50"
          />
        </div>
      </div>

      {!isValidAddr && targetAddr !== "" && (
        <p className="text-xs text-red-400 mb-3">Invalid address format</p>
      )}

      <div className="flex items-center gap-3">
        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-500 text-white"
          disabled={!isOwner || busy || alreadyWired || !isValidAddr}
          title={!isOwner ? "Only the Oracle owner can call setSkillNFT" : undefined}
          onClick={() =>
            writeContract({
              address: ORACLE_ADDRESS,
              abi: SkillFunOracle_ABI as readonly object[],
              functionName: "setSkillNFT",
              args: [targetAddr as `0x${string}`],
            })
          }
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Zap className="w-3.5 h-3.5 mr-1.5" />}
          {isSigning ? "Confirm in wallet…" : isConfirming ? "Confirming…" : alreadyWired ? "Done" : "Call setSkillNFT"}
        </Button>
        {!isOwner && (
          <p className="text-xs text-amber-400">Connect the Oracle owner wallet to enable</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Write Oracle button — MetaMask signs setVerifiedClaims directly
// (owner or operator of the new Ownable Oracle)
// ---------------------------------------------------------------------------

interface WriteOracleButtonProps {
  tokenId: number;
  walletAddress: string;
  isAuthorized: boolean;
  onSuccess: () => void;
}

function WriteOracleButton({ tokenId, walletAddress, isAuthorized, onSuccess }: WriteOracleButtonProps) {
  const { toast } = useToast();

  const {
    writeContract,
    data: txHash,
    isPending: isSigning,
    error: writeError,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Show error toast and reset wagmi state — must not run during render
  useEffect(() => {
    if (writeError) {
      const msg = (writeError as Error).message ?? "Transaction failed";
      toast({ title: "Oracle write failed", description: msg.slice(0, 120), variant: "destructive" });
      reset();
    }
  }, [writeError]); // eslint-disable-line react-hooks/exhaustive-deps

  // Notify parent after on-chain confirmation — must not run during render
  useEffect(() => {
    if (isConfirmed) {
      onSuccess();
    }
  }, [isConfirmed]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isConfirmed) {
    return (
      <Badge
        variant="outline"
        className="border-purple-500/40 text-purple-300 bg-purple-500/10 flex items-center gap-1 text-xs"
      >
        <CheckCircle2 className="w-3 h-3" /> Oracle written
      </Badge>
    );
  }

  const busy = isSigning || isConfirming;

  return (
    <Button
      size="sm"
      variant="outline"
      className="border-purple-500/40 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/60 h-8 px-3 text-xs"
      disabled={!isAuthorized || busy}
      title={!isAuthorized ? "Only the Oracle owner or an operator can write on-chain" : undefined}
      onClick={() =>
        writeContract({
          address: ORACLE_ADDRESS,
          abi: SkillFunOracle_ABI as readonly object[],
          functionName: "setVerifiedClaims",
          args: [[BigInt(tokenId)], [walletAddress as `0x${string}`]],
        })
      }
    >
      {busy ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
      ) : (
        <Zap className="w-3.5 h-3.5 mr-1" />
      )}
      {isSigning ? "Confirm in wallet…" : isConfirming ? "Writing…" : "Write Oracle"}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Claim row
// ---------------------------------------------------------------------------

interface ClaimRowProps {
  claim: DbClaim;
  isAuthorized: boolean;
  onAction: (claimId: string, status: "approved" | "rejected") => Promise<void>;
  actionLoading: string | null; // claimId currently in flight
}

function ClaimRow({ claim, isAuthorized, onAction, actionLoading }: ClaimRowProps) {
  // Approved claims auto-expand on mount so the Oracle write prompt is immediately visible
  const [expanded, setExpanded] = useState(claim.status === "approved");
  // Optimistic local state — set immediately after a successful Write Oracle call
  const [oracleWrittenLocal, setOracleWrittenLocal] = useState(false);
  const isLoading = actionLoading === claim.id;

  // Read on-chain verifiedOwner for this token (only for approved claims)
  const { data: onChainOwner } = useReadContract({
    address: ORACLE_ADDRESS,
    abi: SkillFunOracle_ABI as readonly object[],
    functionName: "verifiedOwner",
    args: [BigInt(claim.tokenId)],
    query: { enabled: claim.status === "approved" },
  });

  // Oracle is written if local optimistic state OR on-chain address matches claim wallet
  const oracleWritten =
    oracleWrittenLocal ||
    (typeof onChainOwner === "string" &&
      onChainOwner.toLowerCase() === claim.walletAddress.toLowerCase());

  const statusBadge = () => {
    if (claim.status === "approved" && oracleWritten) {
      return (
        <Badge variant="outline" className="border-purple-500/40 text-purple-300 bg-purple-500/10 flex items-center gap-1 text-xs">
          <CheckCircle2 className="w-3 h-3" /> Oracle written
        </Badge>
      );
    }
    switch (claim.status) {
      case "pending":
        return (
          <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 flex items-center gap-1 text-xs">
            <Clock className="w-3 h-3" /> Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 flex items-center gap-1 text-xs">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="border-red-500/40 text-red-400 bg-red-500/10 flex items-center gap-1 text-xs">
            <XCircle className="w-3 h-3" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-xs">{claim.status}</Badge>;
    }
  };

  const submittedDate = new Date(claim.createdAt).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="border border-border rounded-xl bg-muted/20 overflow-hidden">
      {/* Main row */}
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Token ID */}
        <div className="shrink-0 w-16 text-center">
          <span className="text-lg font-mono font-semibold text-purple-300">#{claim.tokenId}</span>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">GitHub</p>
            <p className="text-sm font-medium text-foreground truncate">@{claim.githubUsername}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Wallet</p>
            <p className="text-sm font-mono text-foreground truncate">
              {claim.walletAddress.slice(0, 6)}…{claim.walletAddress.slice(-4)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Submitted</p>
            <p className="text-sm text-foreground">{submittedDate}</p>
          </div>
        </div>

        {/* Status */}
        <div className="shrink-0 hidden sm:block">
          {statusBadge()}
        </div>

        {/* Actions */}
        <div className="shrink-0 flex items-center gap-2">
          {claim.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/60 h-8 px-3 text-xs"
                onClick={() => onAction(claim.id, "approved")}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 h-8 px-3 text-xs"
                onClick={() => onAction(claim.id, "rejected")}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5 mr-1" />}
                Reject
              </Button>
            </>
          )}

          {/* Write Oracle button for approved claims */}
          {claim.status === "approved" && !oracleWritten && (
            <WriteOracleButton
              tokenId={claim.tokenId}
              walletAddress={claim.walletAddress}
              isAuthorized={isAuthorized}
              onSuccess={() => setOracleWrittenLocal(true)}
            />
          )}

          {/* Oracle written badge (inline, mirrors the status badge for mobile) */}
          {claim.status === "approved" && oracleWritten && (
            <Badge
              variant="outline"
              className="border-purple-500/40 text-purple-300 bg-purple-500/10 flex items-center gap-1 text-xs sm:hidden"
            >
              <CheckCircle2 className="w-3 h-3" /> Oracle written
            </Badge>
          )}

          {(claim.status === "approved" || claim.status === "rejected") && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded: detail for approved claims */}
      {expanded && claim.status === "approved" && (
        <div className="px-5 pb-4 border-t border-border/50 pt-3">
          <p className="text-xs text-muted-foreground">
            Token <span className="font-mono text-foreground/70">#{claim.tokenId}</span> approved.
            {oracleWritten
              ? " Oracle verification has been written on-chain."
              : " Use the Write Oracle button above to write verification on-chain."}
          </p>
        </div>
      )}

      {/* Expanded: nothing special for rejected */}
      {expanded && claim.status === "rejected" && (
        <div className="px-5 pb-4 border-t border-border/50 pt-3">
          <p className="text-xs text-muted-foreground">This claim was rejected. The creator may re-submit.</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AdminClaims() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const sign = useEip712Sign();

  const [claims, setClaims] = useState<DbClaim[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  // Read on-chain owner() and operators(address) to gate write access.
  // Both owner and approved operators may call setVerifiedClaims.
  const { data: oracleOwnerRaw } = useReadContract({
    address: ORACLE_ADDRESS,
    abi: SkillFunOracle_ABI as readonly object[],
    functionName: "owner",
    query: { enabled: isConnected },
  });
  const oracleOwner = oracleOwnerRaw as string | undefined;

  const { data: isOperatorRaw } = useReadContract({
    address: ORACLE_ADDRESS,
    abi: SkillFunOracle_ABI as readonly object[],
    functionName: "operators",
    args: [address as `0x${string}`],
    query: { enabled: isConnected && !!address },
  });
  const isOperator = !!isOperatorRaw;

  const isOwner = !!address && !!oracleOwner && address.toLowerCase() === oracleOwner.toLowerCase();
  /** True when the connected wallet can call setVerifiedClaims (owner or operator). */
  const isAuthorized = isOwner || isOperator;

  const fetchClaims = useCallback(async () => {
    if (!isConnected) return;
    setLoading(true);
    setError(null);
    try {
      const sigHeader = await sign("admin:list-claims");
      const { claims: fetched } = await adminApi.listClaims(sigHeader);
      setClaims(fetched);
      setLastFetched(new Date());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load claims";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isConnected, sign]);

  const handleAction = useCallback(async (claimId: string, status: "approved" | "rejected") => {
    setActionLoading(claimId);
    try {
      const sigHeader = await sign("admin:update-claim");
      const { claim: updated } = await adminApi.updateClaim(claimId, status, sigHeader);
      // Update local state so the row re-renders immediately
      setClaims(prev =>
        prev ? prev.map(c => (c.id === claimId ? updated : c)) : prev
      );
      toast({
        title: status === "approved" ? "Claim approved" : "Claim rejected",
        description:
          status === "approved"
            ? `Token #${updated.tokenId} approved. Click "Write Oracle" to verify on-chain.`
            : `Claim for token #${updated.tokenId} rejected.`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Action failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  }, [sign, toast]);

  // ---- Render: wallet not connected ----------------------------------------
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 pt-32 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground mb-8">
            Connect the platform deployer wallet to review Skill claims.
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  // ---- Render: not yet loaded -----------------------------------------------
  const isEmpty = claims !== null && claims.length === 0;
  const hasClaims = claims !== null && claims.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-20">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-purple-400" />
              <h1 className="text-2xl font-semibold">Claim Review</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Connected as{" "}
              <span className="font-mono text-foreground">
                {address?.slice(0, 6)}…{address?.slice(-4)}
              </span>
              {oracleOwner && (
                <span className={`ml-2 text-xs font-medium ${isAuthorized ? "text-purple-400" : "text-amber-400"}`}>
                  · {isAuthorized ? (isOwner ? "Oracle owner — can write" : "Oracle operator — can write") : "Not authorized — read-only"}
                </span>
              )}
              {lastFetched && (
                <span className="ml-2 text-muted-foreground/60">
                  · Last refreshed {lastFetched.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <Button
            onClick={fetchClaims}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-500 text-white shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {claims === null ? "Load claims" : "Refresh"}
          </Button>
        </div>

        {/* Contract migration panel — always shown when connected */}
        <SetSkillNFTPanel isOwner={isOwner} />

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4 mb-6">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-400">Error loading claims</p>
              <p className="text-sm text-muted-foreground mt-0.5">{error}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Make sure your wallet is the platform deployer address.
              </p>
            </div>
          </div>
        )}

        {/* Not loaded yet */}
        {claims === null && !loading && !error && (
          <div className="text-center py-24 text-muted-foreground">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Click "Load claims" to fetch pending Skill claims.</p>
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="text-center py-24 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 opacity-40" />
            <p className="text-sm">Loading…</p>
          </div>
        )}

        {/* Empty */}
        {isEmpty && !loading && (
          <div className="text-center py-24 text-muted-foreground">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No pending claims right now.</p>
          </div>
        )}

        {/* Claims list */}
        {hasClaims && !loading && (
          <>
            {/* Persistent banner: approved claims awaiting Oracle write */}
            {claims!.filter(c => c.status === "approved").length > 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 mb-6">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-400">
                    {claims!.filter(c => c.status === "approved").length === 1
                      ? "1 approved claim is awaiting Oracle verification"
                      : `${claims!.filter(c => c.status === "approved").length} approved claims are awaiting Oracle verification`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    These claims have been approved but the on-chain Oracle write has not yet been confirmed.
                    Connect the deployer wallet and click <span className="text-foreground/70 font-medium">Write Oracle</span> on each highlighted row below.
                  </p>
                </div>
              </div>
            )}

            {/* Stats bar */}
            <div className="flex gap-4 mb-6">
              {(["pending", "approved", "rejected"] as const).map(s => {
                const count = claims!.filter(c => c.status === s).length;
                if (count === 0) return null;
                const colors: Record<string, string> = {
                  pending:  "text-amber-400",
                  approved: "text-emerald-400",
                  rejected: "text-red-400",
                };
                return (
                  <div key={s} className="text-sm">
                    <span className={`font-semibold ${colors[s]}`}>{count}</span>
                    <span className="text-muted-foreground ml-1 capitalize">{s}</span>
                  </div>
                );
              })}
              <div className="text-sm">
                <span className="font-semibold text-foreground">{claims!.length}</span>
                <span className="text-muted-foreground ml-1">total</span>
              </div>
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-3">
              {claims!.map(claim => (
                <ClaimRow
                  key={claim.id}
                  claim={claim}
                  isAuthorized={isAuthorized}
                  onAction={handleAction}
                  actionLoading={actionLoading}
                />
              ))}
            </div>

            {/* Oracle info */}
            <div className="mt-8 rounded-xl border border-border bg-muted/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Oracle contract</span>
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-mono text-foreground/70">{ORACLE_ADDRESS}</span>
                {" "}·{" "}
                <span className="font-mono">setVerifiedClaims(uint256[],address[])</span>
                {" "}— connect the Oracle owner (or operator) wallet and click "Write Oracle" on any approved claim.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
