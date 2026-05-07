import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockSkills } from "@/data/mockSkills";
import { Twitter, Search, CheckCircle, Wallet, TrendingUp, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Claim() {
  const { toast } = useToast();
  const [handle, setHandle] = useState("");
  const [searched, setSearched] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimed, setClaimed] = useState<string[]>([]);

  const unclaimed = mockSkills.filter((s) => s.claimedBy === null);
  const results = searched
    ? unclaimed.filter(
        (s) =>
          !handle.trim() ||
          (s.tags.some((t) => t.toLowerCase().includes("trading")) && handle.length > 3)
      )
    : [];

  // always show some results for demo
  const displayResults = searched ? (results.length > 0 ? results : unclaimed.slice(0, 3)) : [];

  const handleSearch = () => setSearched(true);

  const handleClaim = async (id: string) => {
    setClaiming(id);
    await new Promise((r) => setTimeout(r, 2000));
    setClaiming(null);
    setClaimed((prev) => [...prev, id]);
    toast({
      title: "Skill Claimed!",
      description: `NFT transferred to your wallet. Earnings ready to withdraw.`,
    });
  };

  // mock accumulated earnings
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
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Your Skills Are Earning</h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            The platform distilled your expertise into Skill NFTs. They've been live, earning revenue. Come claim what's yours.
          </p>
        </div>

        {/* Stats bar */}
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

        {/* Search */}
        <div className="bg-card border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="font-semibold mb-4">Find Your Skills</h2>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={handle}
                onChange={(e) => setHandle(e.target.value.replace("@", ""))}
                placeholder="Your Twitter/X handle (without @)"
                className="pl-10 bg-background border-white/10"
                data-testid="input-claim-handle"
              />
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              onClick={handleSearch}
              disabled={!handle.trim()}
              data-testid="button-search-skills"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            We'll match your handle to Skills distilled from your public posts. Claiming transfers the NFT to your connected wallet.
          </p>
        </div>

        {/* All unclaimed (show by default) */}
        {!searched && (
          <div>
            <h2 className="font-semibold mb-4 text-muted-foreground">All Unclaimed Skills ({unclaimed.length})</h2>
            <div className="space-y-4">
              {unclaimed.map((skill) => (
                <ClaimCard
                  key={skill.id}
                  skill={skill}
                  earnings={getEarnings(skill.id)}
                  claiming={claiming === skill.id}
                  claimed={claimed.includes(skill.id)}
                  onClaim={() => handleClaim(skill.id)}
                  handle={null}
                />
              ))}
            </div>
          </div>
        )}

        {/* Search results */}
        {searched && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <Badge variant="outline" className="border-primary/30 text-primary">
                {displayResults.length} Skills found for @{handle}
              </Badge>
            </div>
            {displayResults.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                No unclaimed Skills found for @{handle}. Try a different handle.
              </div>
            ) : (
              <div className="space-y-4">
                {displayResults.map((skill) => (
                  <ClaimCard
                    key={skill.id}
                    skill={skill}
                    earnings={getEarnings(skill.id)}
                    claiming={claiming === skill.id}
                    claimed={claimed.includes(skill.id)}
                    onClaim={() => handleClaim(skill.id)}
                    handle={handle}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ClaimCardProps {
  skill: ReturnType<typeof mockSkills[0]["valueOf"]>;
  earnings: string;
  claiming: boolean;
  claimed: boolean;
  onClaim: () => void;
  handle: string | null;
}

function ClaimCard({ skill, earnings, claiming, claimed, onClaim, handle }: ClaimCardProps) {
  return (
    <div className="bg-card border border-white/10 rounded-2xl p-6" data-testid={`claim-card-${skill.id}`}>
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
              <div className="font-mono font-bold text-emerald-400">${earnings} USDC</div>
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
          {handle && (
            <p className="text-xs text-muted-foreground mt-3">
              Attributed to <span className="text-primary">@{handle}</span> · Enter your handle above to claim
            </p>
          )}
        </div>
        <div className="shrink-0">
          {claimed ? (
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" /> Claimed
            </Badge>
          ) : (
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={onClaim}
              disabled={claiming}
              data-testid={`button-claim-${skill.id}`}
            >
              {claiming ? (
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
  );
}
