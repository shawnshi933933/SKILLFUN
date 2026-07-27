import Navbar from "@/components/Navbar";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockSkills } from "@/data/mockSkills";
import { mockBundles } from "@/data/mockBundles";
import { Wallet, Bot, TrendingUp, ExternalLink, Copy, Layers, Coins, Code2, ArrowUpRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import SkillCard from "@/components/SkillCard";
import BundleCard from "@/components/BundleCard";

export default function Profile() {
  const { address, connect } = useWallet();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const purchasedSkills = mockSkills.slice(0, 3);
  const createdSkills = mockSkills.slice(3, 5);
  const pendingClaim = mockSkills.slice(5, 7);
  const myBundles = mockBundles.slice(0, 2);
  const stakedBundles = mockBundles.filter((b) => (b.myStaked ?? 0) > 0);
  const totalStaked = stakedBundles.reduce((s, b) => s + (b.myStaked ?? 0), 0);
  const totalDailyYield = stakedBundles.reduce((s, b) => s + (b.myStaked ?? 0) * b.apy / 100 / 365, 0);

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
            <p className="text-muted-foreground">Connect MetaMask on 0G Chain (16661) to view your Skills, earnings, and portfolio.</p>
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
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-xs">0G Chain</Badge>
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
              Owned Skills ({purchasedSkills.length})
            </TabsTrigger>
            <TabsTrigger value="created" data-testid="tab-created">
              Created ({createdSkills.length})
            </TabsTrigger>
            <TabsTrigger value="bundles" data-testid="tab-bundles">
              Bundles ({myBundles.length})
            </TabsTrigger>
            <TabsTrigger value="staked" data-testid="tab-staked">
              Staked ({stakedBundles.length})
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
                    <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400 bg-blue-500/10">
                      NFT Owner
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            {purchasedSkills.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No Skill NFTs owned yet.</p>
                <Button variant="outline" className="border-white/20" onClick={() => setLocation("/app/market")} data-testid="button-browse-market">
                  Browse Market
                </Button>
              </div>
            )}
            <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl text-xs text-blue-400">
              As Owner you earn <strong>90% of Base Price</strong> on every invocation. Creator earns the remaining 10% royalty perpetually.
            </div>
          </TabsContent>

          <TabsContent value="created">
            <div className="grid md:grid-cols-2 gap-5">
              {createdSkills.map((skill) => (
                <div key={skill.id} className="bg-card border border-white/10 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-bold mb-1">{skill.name}</h3>
                      <p className="text-xs font-mono text-muted-foreground/60 mb-1">{skill.mcpToolName}()</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{skill.description}</p>
                    </div>
                    <Badge variant="outline" className="border-primary/30 text-primary shrink-0">{skill.category}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-background rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Royalty Earned</div>
                      <div className="font-mono font-bold text-purple-400 text-sm">{(skill.invocations * skill.basePrice * 0.1 * 0.9).toFixed(3)} ETH</div>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Invocations</div>
                      <div className="font-mono font-bold text-sm flex items-center gap-1">
                        <Bot className="w-3 h-3 text-accent" />{skill.invocations.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">In Bundles</div>
                      <div className="font-mono font-bold text-accent text-sm flex items-center gap-1">
                        <Layers className="w-3 h-3" />{skill.bundleCount}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-white/20 flex-1 gap-1" onClick={() => setLocation(`/app/skill/${skill.id}`)} data-testid={`button-view-skill-${skill.id}`}>
                      <ExternalLink className="w-3 h-3" /> View
                    </Button>
                    <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 flex-1 gap-1" data-testid={`button-withdraw-${skill.id}`}>
                      Withdraw Royalties
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setLocation("/app/create")} data-testid="button-create-new-skill">
              + Create New Skill
            </Button>
          </TabsContent>

          <TabsContent value="bundles">
            <div className="grid md:grid-cols-2 gap-5 mb-6">
              {myBundles.map((bundle) => (
                <BundleCard key={bundle.id} bundle={bundle} />
              ))}
            </div>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2" onClick={() => setLocation("/app/create-bundle")} data-testid="button-create-new-bundle">
              <Layers className="w-4 h-4" /> Create New Bundle
            </Button>
          </TabsContent>

          <TabsContent value="staked">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-card border border-emerald-500/20 rounded-xl p-4">
                <div className="text-xs text-muted-foreground mb-1">Total Staked</div>
                <div className="text-2xl font-bold font-mono text-emerald-400">{totalStaked.toLocaleString()} SKILL</div>
              </div>
              <div className="bg-card border border-accent/20 rounded-xl p-4">
                <div className="text-xs text-muted-foreground mb-1">Est. Daily Yield</div>
                <div className="text-2xl font-bold font-mono text-accent">+{totalDailyYield.toFixed(2)} SKILL</div>
              </div>
            </div>
            {stakedBundles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                <Coins className="w-8 h-8 mx-auto mb-3 opacity-30" />
                No staking positions yet.
                <div className="mt-4">
                  <Button variant="outline" className="border-white/20" onClick={() => setLocation("/app/stake")}>Stake SKILL Tokens</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {stakedBundles.map((b) => (
                  <div key={b.id} className="bg-card border border-white/10 rounded-xl p-5" data-testid={`staked-position-${b.id}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{b.name}</h3>
                        <p className="text-xs text-muted-foreground">by {b.curatorAddress} · +{b.curatorMarkup}% markup</p>
                      </div>
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">{b.apy.toFixed(1)}% APY</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Staked</div>
                          <div className="font-mono font-semibold text-emerald-400">{(b.myStaked ?? 0).toLocaleString()} SKILL</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Daily Yield</div>
                          <div className="font-mono font-semibold text-accent">+{((b.myStaked ?? 0) * b.apy / 100 / 365).toFixed(2)} SKILL</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="border-white/20 gap-1" onClick={() => setLocation(`/app/bundle/${b.id}`)} data-testid={`button-view-staked-${b.id}`}>
                        <ExternalLink className="w-3 h-3" /> View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">
              These Skills were distilled from your Twitter/X content by a third party and are awaiting your claim. Clicking Claim Now generates an on-chain transfer to your wallet — no prior wallet connection needed to initiate.
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {pendingClaim.map((skill) => (
                <div key={skill.id} className="bg-card border border-amber-500/20 rounded-2xl p-5">
                  <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs mb-3">Unclaimed NFT</Badge>
                  <h3 className="font-bold mb-1">{skill.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{skill.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-emerald-400">{skill.basePrice} ETH / call</div>
                      <div className="text-xs text-muted-foreground">Creator earns 10% royalty</div>
                    </div>
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
