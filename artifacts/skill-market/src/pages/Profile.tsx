import Navbar from "@/components/Navbar";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockSkills } from "@/data/mockSkills";
import { Wallet, Bot, TrendingUp, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import SkillCard from "@/components/SkillCard";

export default function Profile() {
  const { address, connect } = useWallet();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const purchasedSkills = mockSkills.slice(0, 3);
  const createdSkills = mockSkills.slice(3, 5);
  const pendingClaim = mockSkills.filter((s) => !s.claimedBy).slice(0, 2);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({ title: "Address copied!" });
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Wallet className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Connect Your Wallet</h1>
            <p className="text-muted-foreground">Connect MetaMask on Sepolia to view your Skills, earnings, and portfolio.</p>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8"
            onClick={connect}
            data-testid="button-connect-profile"
          >
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  const short = `${address.slice(0, 8)}...${address.slice(-6)}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        {/* Wallet Header */}
        <div className="bg-card border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 border border-white/10 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold font-mono">{short}</h1>
                <button onClick={copyAddress} className="text-muted-foreground hover:text-foreground transition-colors" data-testid="button-copy-address">
                  <Copy className="w-4 h-4" />
                </button>
                <Badge variant="outline" className="border-accent/30 text-accent text-xs">Sepolia</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Connected
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold font-mono text-foreground">2.84</div>
                <div className="text-xs text-muted-foreground">ETH Balance</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold font-mono text-emerald-400">$523</div>
                <div className="text-xs text-muted-foreground">Total Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold font-mono text-accent flex items-center justify-center gap-1">
                  <Bot className="w-4 h-4" />
                  841
                </div>
                <div className="text-xs text-muted-foreground">Agent Sales</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="purchased">
          <TabsList className="bg-card border border-white/10 mb-6">
            <TabsTrigger value="purchased" data-testid="tab-purchased">
              Purchased ({purchasedSkills.length})
            </TabsTrigger>
            <TabsTrigger value="created" data-testid="tab-created">
              Created ({createdSkills.length})
            </TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending">
              Pending Claim ({pendingClaim.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="purchased">
            <div className="grid md:grid-cols-3 gap-5">
              {purchasedSkills.map((skill) => (
                <div key={skill.id} className="relative">
                  <SkillCard skill={skill} />
                  <div className="absolute top-3 left-3">
                    <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                      Access Active
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            {purchasedSkills.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No Skills purchased yet.</p>
                <Button variant="outline" className="border-white/20" onClick={() => setLocation("/app/market")} data-testid="button-browse-market">
                  Browse Market
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="created">
            <div className="grid md:grid-cols-2 gap-5">
              {createdSkills.map((skill) => (
                <div key={skill.id} className="bg-card border border-white/10 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-bold mb-1">{skill.name}</h3>
                      <p className="text-sm text-muted-foreground">{skill.description}</p>
                    </div>
                    <Badge variant="outline" className="border-primary/30 text-primary shrink-0">{skill.category}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-background rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Earnings</div>
                      <div className="font-mono font-bold text-emerald-400 text-sm">$248</div>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Volume</div>
                      <div className="font-mono font-bold text-sm flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-primary" />{skill.volume}
                      </div>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Agent Buys</div>
                      <div className="font-mono font-bold text-accent text-sm flex items-center gap-1">
                        <Bot className="w-3 h-3" />{skill.agentPurchaseCount}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-white/20 flex-1 gap-1" onClick={() => setLocation(`/app/skill/${skill.id}`)} data-testid={`button-view-skill-${skill.id}`}>
                      <ExternalLink className="w-3 h-3" /> View
                    </Button>
                    <Button size="sm" variant="outline" className="border-white/20 flex-1 gap-1" data-testid={`button-withdraw-${skill.id}`}>
                      Withdraw $248
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setLocation("/app/create")} data-testid="button-create-new-skill">
              + Create New Skill
            </Button>
          </TabsContent>

          <TabsContent value="pending">
            <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">
              These Skills were distilled from your Twitter/X content and are awaiting your claim. Go to the Claim page to withdraw earnings.
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {pendingClaim.map((skill) => (
                <div key={skill.id} className="bg-card border border-amber-500/20 rounded-2xl p-5">
                  <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs mb-3">Unclaimed</Badge>
                  <h3 className="font-bold mb-1">{skill.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{skill.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="font-mono font-bold text-emerald-400">$142 waiting</div>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setLocation("/app/claim")} data-testid={`button-go-claim-${skill.id}`}>
                      Claim Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
