import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockSkills } from "@/data/mockSkills";
import { Twitter, CheckCircle, Wallet, TrendingUp, Bot, Shield, X, Lock, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type OAuthState = "idle" | "popup" | "authorizing" | "verified";
type ClaimFlowState = "start" | "oauth" | "results";

export default function Claim() {
  const { toast } = useToast();
  const [handle, setHandle] = useState("");
  const [oauthState, setOauthState] = useState<OAuthState>("idle");
  const [flowState, setFlowState] = useState<ClaimFlowState>("start");
  const [verifiedHandle, setVerifiedHandle] = useState("");
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimed, setClaimed] = useState<string[]>([]);

  const unclaimed = mockSkills.filter((s) => s.claimedBy === null);

  const handleConnectTwitter = () => {
    if (!handle.trim()) return;
    setOauthState("popup");
  };

  const handleOAuthApprove = async () => {
    setOauthState("authorizing");
    await new Promise((r) => setTimeout(r, 2200));
    setOauthState("verified");
    await new Promise((r) => setTimeout(r, 800));
    setVerifiedHandle(handle.trim());
    setFlowState("results");
    setOauthState("idle");
    toast({ title: "Twitter verified", description: `@${handle} identity confirmed` });
  };

  const handleClaim = async (id: string) => {
    setClaiming(id);
    await new Promise((r) => setTimeout(r, 1800));
    setClaiming(null);
    setClaimed((prev) => [...prev, id]);
    toast({
      title: "Skill Claimed!",
      description: "NFT transferred to your connected wallet. Earnings ready to withdraw.",
    });
  };

  const getEarnings = (id: string) => {
    const base: Record<string, string> = {
      "skill-5": "142.80",
      "skill-8": "380.50",
      "skill-10": "95.20",
      "skill-12": "61.40",
      "skill-14": "210.90",
    };
    return base[id] || "88.00";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Twitter OAuth Modal */}
      {oauthState === "popup" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-card border border-white/10 rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl" data-testid="modal-twitter-oauth">
            {/* Modal header — mimics Twitter/X branding */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Twitter className="w-5 h-5 text-sky-400" />
                <span className="font-semibold text-sm">X (Twitter)</span>
              </div>
              <button onClick={() => setOauthState("idle")} className="text-muted-foreground hover:text-foreground transition-colors" data-testid="button-close-oauth">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-bold text-lg mb-1">Authorize SkillFun</h2>
                <p className="text-sm text-muted-foreground">
                  SkillFun wants to verify you own{" "}
                  <span className="text-sky-400 font-medium">@{handle}</span>
                </p>
              </div>

              <div className="bg-background rounded-xl border border-white/10 p-4 mb-6 space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">This app will be able to:</div>
                {[
                  "Read your public profile and username",
                  "Verify you are the owner of @" + handle,
                ].map((perm) => (
                  <div key={perm} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{perm}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-white/10 mt-3">
                  <div className="text-xs text-muted-foreground">
                    <Lock className="w-3 h-3 inline mr-1" />
                    This will NOT post, follow, or access DMs. Read-only identity verification.
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full bg-sky-500 hover:bg-sky-400 text-white gap-2"
                  onClick={handleOAuthApprove}
                  data-testid="button-oauth-approve"
                >
                  <Twitter className="w-4 h-4" />
                  Authorize with X
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-muted-foreground hover:text-foreground"
                  onClick={() => setOauthState("idle")}
                  data-testid="button-oauth-cancel"
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-4">
                By authorizing, you agree to X's{" "}
                <span className="text-sky-400 cursor-pointer">Terms of Service</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Authorizing overlay */}
      {oauthState === "authorizing" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-card border border-white/10 rounded-2xl p-8 text-center max-w-xs mx-4" data-testid="modal-authorizing">
            <div className="w-14 h-14 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-5 relative">
              <Twitter className="w-7 h-7 text-sky-400" />
              <div className="absolute inset-0 rounded-full border-2 border-sky-400/30 border-t-sky-400 animate-spin" />
            </div>
            <div className="font-semibold mb-2">Verifying identity...</div>
            <p className="text-sm text-muted-foreground">Confirming ownership of <span className="text-sky-400">@{handle}</span> via X OAuth</p>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Your Skills Are Earning</h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            The platform distilled your expertise into Skill NFTs. They've been live, earning revenue. Verify your X identity to claim what's yours.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-card border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold font-mono text-primary">38</div>
            <div className="text-xs text-muted-foreground mt-1">Skills Awaiting Claim</div>
          </div>
          <div className="bg-card border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold font-mono text-accent">$24,180</div>
            <div className="text-xs text-muted-foreground mt-1">Total Unclaimed Earnings</div>
          </div>
          <div className="bg-card border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold font-mono text-emerald-400">12,441</div>
            <div className="text-xs text-muted-foreground mt-1">Agent Purchases</div>
          </div>
        </div>

        {/* Step 1 — not yet verified */}
        {flowState === "start" && (
          <div className="bg-card border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-mono text-primary">1</div>
              <h2 className="font-semibold text-lg">Verify your X (Twitter) identity</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Enter your Twitter handle and authorize via X OAuth. This confirms you own the account the Skill was attributed to — only then can you claim the NFT.
            </p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.replace("@", ""))}
                  placeholder="your_twitter_handle"
                  className="pl-10 bg-background border-white/10"
                  data-testid="input-claim-handle"
                />
              </div>
              <Button
                className="bg-sky-500 hover:bg-sky-400 text-white gap-2 shrink-0"
                onClick={handleConnectTwitter}
                disabled={!handle.trim()}
                data-testid="button-connect-twitter"
              >
                <Twitter className="w-4 h-4" />
                Connect X
              </Button>
            </div>
            <div className="mt-5 flex items-start gap-2 text-xs text-muted-foreground bg-white/5 rounded-lg px-4 py-3">
              <Lock className="w-3 h-3 shrink-0 mt-0.5 text-primary" />
              Read-only OAuth — we only verify your username. No posting, no following, no DM access.
            </div>
          </div>
        )}

        {/* Step 2 — verified, show results */}
        {flowState === "results" && (
          <div className="space-y-6">
            {/* Verified badge */}
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-3" data-testid="banner-verified">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="flex-1">
                <span className="text-emerald-400 font-semibold">X identity verified — </span>
                <span className="text-sm text-muted-foreground">
                  You are confirmed as <span className="text-sky-400 font-medium">@{verifiedHandle}</span>
                </span>
              </div>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs shrink-0">
                <Twitter className="w-3 h-3 mr-1" /> OAuth Verified
              </Badge>
            </div>

            {/* Step 2 header */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-mono text-primary">2</div>
              <h2 className="font-semibold text-lg">
                Skills attributed to <span className="text-sky-400">@{verifiedHandle}</span>
              </h2>
            </div>

            <p className="text-sm text-muted-foreground -mt-2">
              These Skills were distilled from your public posts and held in platform custody. Claiming transfers the NFT directly to your connected wallet.
            </p>

            {/* Skill claim cards */}
            {unclaimed.map((skill) => (
              <div key={skill.id} className="bg-card border border-white/10 rounded-2xl p-6" data-testid={`claim-card-${skill.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold">{skill.name}</h3>
                      <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">Unclaimed</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{skill.description}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-background rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">Accumulated</div>
                        <div className="font-mono font-bold text-emerald-400">${getEarnings(skill.id)} USDC</div>
                      </div>
                      <div className="bg-background rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">Volume</div>
                        <div className="font-mono font-bold flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-primary" />
                          {skill.volume} ETH
                        </div>
                      </div>
                      <div className="bg-background rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">Agent Buys</div>
                        <div className="font-mono font-bold text-accent flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          {skill.agentPurchaseCount}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {claimed.includes(skill.id) ? (
                      <div className="text-center">
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 px-4 py-2 mb-2 block">
                          <CheckCircle className="w-4 h-4 mr-1 inline" /> Claimed
                        </Badge>
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mx-auto" data-testid={`button-view-tx-${skill.id}`}>
                          <ExternalLink className="w-3 h-3" /> View on Etherscan
                        </button>
                      </div>
                    ) : (
                      <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => handleClaim(skill.id)}
                        disabled={claiming === skill.id}
                        data-testid={`button-claim-${skill.id}`}
                      >
                        {claiming === skill.id ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Claiming...
                          </span>
                        ) : (
                          "Claim + Withdraw"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              onClick={() => { setFlowState("start"); setVerifiedHandle(""); setHandle(""); setClaimed([]); }}
              data-testid="button-switch-account"
            >
              <Twitter className="w-3 h-3" /> Switch X account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
