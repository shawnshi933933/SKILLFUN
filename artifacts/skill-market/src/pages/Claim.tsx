import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authApi, claimsApi, skillsApi, DbSkill, DbClaim } from "@/lib/api";
import { useEip712Sign } from "@/hooks/use-eip712";
import { useToast } from "@/hooks/use-toast";
import {
  Github, Wallet, CheckCircle, Clock, XCircle,
  ExternalLink, Loader2, Lock, AlertCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types / helpers
// ---------------------------------------------------------------------------
type PageState = "loading" | "no-github" | "no-wallet" | "ready";

function claimStatusBadge(status: DbClaim["status"]) {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="border-amber-500/40 text-amber-400 gap-1"><Clock className="w-3 h-3" />Pending review</Badge>;
    case "approved":
      return <Badge variant="outline" className="border-blue-500/40 text-blue-400 gap-1"><CheckCircle className="w-3 h-3" />Approved — set Oracle, then call claim()</Badge>;
    case "rejected":
      return <Badge variant="outline" className="border-red-500/40 text-red-400 gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>;
    case "completed":
      return <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 gap-1"><CheckCircle className="w-3 h-3" />Completed</Badge>;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Claim() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { address, isConnected } = useAccount();
  const sign = useEip712Sign();

  const [pageState, setPageState]         = useState<PageState>("loading");
  const [githubUser, setGithubUser]       = useState<string | null>(null);
  const [linkedWallet, setLinkedWallet]   = useState<string | null>(null);
  const [skills, setSkills]               = useState<DbSkill[]>([]);
  const [myClaims, setMyClaims]           = useState<DbClaim[]>([]);
  const [linkingWallet, setLinkingWallet] = useState(false);
  const [submitting, setSubmitting]       = useState<number | null>(null); // tokenId

  // --------------------------------------------------------------------------
  // Fetch session + data
  // --------------------------------------------------------------------------
  const refreshSession = useCallback(async () => {
    try {
      const me = await authApi.me();
      if (!me.authenticated || !me.githubUsername) {
        setPageState("no-github");
        return;
      }
      setGithubUser(me.githubUsername);

      if (!me.evmAddress) {
        setPageState("no-wallet");
        return;
      }
      setLinkedWallet(me.evmAddress);
      setPageState("ready");

      // Load skills + existing claims in parallel
      const [skillsRes, claimsRes] = await Promise.all([
        skillsApi.list(),
        claimsApi.mine(),
      ]);

      const user = me.githubUsername.toLowerCase();
      const claimable = (skillsRes.skills ?? []).filter((s) => {
        if (s.tokenId == null) return false;                      // not minted yet
        if (s.mintStatus === "claimed") return false;             // already claimed
        const owner = s.manifestOwner.toLowerCase();
        // match "username/repo" or full URL ending in "/username/repo"
        const parts = owner.split("/").filter(Boolean);
        return parts.some((p, i) => p === user && i < parts.length - 1);
      });

      setSkills(claimable);
      setMyClaims(claimsRes.claims ?? []);
    } catch (err) {
      console.error("session check failed", err);
      setPageState("no-github");
    }
  }, []);

  // On mount: check for ?github_auth=success and refresh
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("github_auth") === "success") {
      // Clean the URL, then refresh
      window.history.replaceState({}, "", window.location.pathname);
    }
    refreshSession();
  }, [refreshSession]);

  // --------------------------------------------------------------------------
  // Link wallet
  // --------------------------------------------------------------------------
  const handleLinkWallet = async () => {
    if (!isConnected || !address) {
      toast({ title: "Connect your wallet first", variant: "destructive" });
      return;
    }
    setLinkingWallet(true);
    try {
      const sigHeader = await sign("link-wallet");
      const result = await authApi.linkWallet(sigHeader);
      setLinkedWallet(result.evmAddress);
      toast({ title: "Wallet linked!", description: result.evmAddress });
      await refreshSession();
    } catch (err: unknown) {
      toast({ title: "Link failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLinkingWallet(false);
    }
  };

  // --------------------------------------------------------------------------
  // Submit claim
  // --------------------------------------------------------------------------
  const handleClaim = async (tokenId: number) => {
    setSubmitting(tokenId);
    try {
      const sigHeader = await sign("submit-claim");
      const { claim } = await claimsApi.submit(tokenId, sigHeader);
      setMyClaims((prev) => [claim, ...prev.filter((c) => c.tokenId !== tokenId)]);
      toast({ title: "Claim submitted!", description: "Pending admin review." });
    } catch (err: unknown) {
      toast({ title: "Claim failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(null);
    }
  };

  // --------------------------------------------------------------------------
  // GitHub login redirect
  // --------------------------------------------------------------------------
  const handleGithubLogin = () => {
    // Preserve current page so callback can redirect back here
    const callbackOrigin = window.location.origin;
    // The API server redirects to FRONTEND_URL after OAuth; that's the root.
    // After redirect, refreshSession picks up the new session.
    window.location.href = `${callbackOrigin}/api/auth/github`;
  };

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  const claimForToken = (tokenId: number) =>
    myClaims.find((c) => c.tokenId === tokenId);

  const skillName = (s: DbSkill) => {
    const meta = s.meta as Record<string, string> | null;
    return meta?.name ?? s.repoUrl.split("/").pop() ?? s.skillId;
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Claim Your Skill NFTs</h1>
          <p className="text-muted-foreground">
            Skills distilled from your GitHub repos are held in contract custody until you claim them.
            Verify your GitHub identity and link a wallet to receive your NFTs.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-3 mb-10">
          {[
            { label: "GitHub", done: !!githubUser },
            { label: "Wallet", done: !!linkedWallet },
            { label: "Claim",  done: myClaims.some((c) => c.status === "completed") },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              {i > 0 && <div className="w-8 h-px bg-white/10" />}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                step.done
                  ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                  : "border-white/10 text-muted-foreground"
              }`}>
                {step.done && <CheckCircle className="w-3 h-3" />}
                {step.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Loading ── */}
        {pageState === "loading" && (
          <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Checking session…
          </div>
        )}

        {/* ── Step 1: GitHub OAuth ── */}
        {pageState === "no-github" && (
          <div className="bg-card border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Github className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-1">Connect GitHub</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                We verify that you own the GitHub account listed as{" "}
                <code className="text-xs bg-white/5 px-1 rounded">manifestOwner</code> on the Skill NFT.
              </p>
            </div>
            <Button className="gap-2 bg-white text-black hover:bg-white/90" onClick={handleGithubLogin}>
              <Github className="w-4 h-4" />
              Login with GitHub
            </Button>
          </div>
        )}

        {/* ── Step 2: Link Wallet ── */}
        {pageState === "no-wallet" && (
          <div className="space-y-4">
            <div className="bg-card border border-white/10 rounded-2xl p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-sm font-semibold">GitHub verified</div>
                <div className="text-sm text-muted-foreground">@{githubUser}</div>
              </div>
            </div>

            <div className="bg-card border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Wallet className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-1">Link your wallet</h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Sign a message to prove you control the wallet. The NFT will be transferred to this address.
                </p>
              </div>
              {!isConnected ? (
                <ConnectButton />
              ) : (
                <Button
                  className="gap-2"
                  onClick={handleLinkWallet}
                  disabled={linkingWallet}
                >
                  {linkingWallet
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Signing…</>
                    : <><Lock className="w-4 h-4" />Sign to link {address?.slice(0, 6)}…{address?.slice(-4)}</>
                  }
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ── Step 3: Claim ── */}
        {pageState === "ready" && (
          <div className="space-y-4">
            {/* Session info */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-card border border-white/10 rounded-xl text-sm">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span>@{githubUser}</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="text-muted-foreground font-mono text-xs">
                {linkedWallet?.slice(0, 8)}…{linkedWallet?.slice(-6)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-xs text-muted-foreground hover:text-foreground h-7"
                onClick={handleLinkWallet}
                disabled={linkingWallet}
              >
                {linkingWallet ? <Loader2 className="w-3 h-3 animate-spin" /> : "Change wallet"}
              </Button>
            </div>

            {/* Claimable skills */}
            {skills.length === 0 && myClaims.length === 0 ? (
              <div className="bg-card border border-white/10 rounded-2xl p-10 flex flex-col items-center text-center gap-3">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
                <div>
                  <div className="font-semibold mb-1">No claimable Skills found</div>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    No minted Skills have <code className="text-xs bg-white/5 px-1 rounded">@{githubUser}</code>{" "}
                    as their owner. If you just minted one, it may still be processing.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {skills.map((skill) => {
                  const existing = claimForToken(skill.tokenId!);
                  return (
                    <div key={skill.skillId} className="bg-card border border-white/10 rounded-2xl p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{skillName(skill)}</span>
                            <Badge variant="outline" className="border-white/10 text-muted-foreground text-[10px]">
                              Token #{skill.tokenId}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono truncate mb-3">
                            {skill.repoUrl}
                          </div>
                          {existing ? (
                            claimStatusBadge(existing.status)
                          ) : (
                            <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
                              Unclaimed — held in contract custody
                            </Badge>
                          )}
                        </div>
                        <div className="shrink-0">
                          {existing ? (
                            existing.status === "approved" ? (
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
                                onClick={() =>
                                  window.open(
                                    `https://chainscan.0g.ai/address/${skill.ownerAddress}`,
                                    "_blank"
                                  )
                                }
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                View on Explorer
                              </Button>
                            ) : existing.status === "completed" ? (
                              <Button size="sm" variant="outline" className="border-white/10 gap-1.5" disabled>
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                Claimed
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" className="border-white/10" disabled>
                                <Clock className="w-3.5 h-3.5 mr-1.5" />
                                {existing.status === "pending" ? "Under review" : "Rejected"}
                              </Button>
                            )
                          ) : (
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90 gap-1.5"
                              onClick={() => handleClaim(skill.tokenId!)}
                              disabled={submitting === skill.tokenId}
                            >
                              {submitting === skill.tokenId ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Signing…</>
                              ) : (
                                "Claim NFT"
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Past claims that may no longer appear in the skills list */}
                {myClaims
                  .filter((c) => !skills.find((s) => s.tokenId === c.tokenId))
                  .map((claim) => (
                    <div key={claim.id} className="bg-card border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">Token #{claim.tokenId}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            Submitted {new Date(claim.createdAt).toLocaleDateString()}
                          </div>
                          {claimStatusBadge(claim.status)}
                        </div>
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>
        )}

        {/* How it works */}
        <div className="mt-10 bg-card border border-white/10 rounded-2xl p-6">
          <h3 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wider">How claiming works</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <span className="text-primary font-mono">1.</span>
              <span>You submit a claim. The server verifies your GitHub username matches the Skill's on-chain <code className="text-xs bg-white/5 px-1 rounded">manifestOwner</code>.</span>
            </div>
            <div className="flex gap-3">
              <span className="text-primary font-mono">2.</span>
              <span>Admin reviews and writes your wallet to the <strong className="text-foreground">SkillFunOracle</strong> contract using a cold wallet.</span>
            </div>
            <div className="flex gap-3">
              <span className="text-primary font-mono">3.</span>
              <span>Once approved, call <code className="text-xs bg-white/5 px-1 rounded">SkillNFT.claim({'{'}tokenId{'}'})</code> from your linked wallet — the NFT transfers automatically, no further admin action required.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
