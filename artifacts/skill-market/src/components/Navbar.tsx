import { Link, useLocation } from "wouter";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Wallet, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { address, connect, disconnect } = useWallet();
  const [location] = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const navLinks = [
    { href: "/app/market", label: "Market" },
    { href: "/app/flywheel", label: "Flywheel" },
    { href: "/app/agent-api", label: "Agent API" },
  ];

  const isActive = (href: string) => location === href;

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" data-testid="link-logo">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <span className="font-bold text-lg tracking-tight text-foreground">
                  Skill<span className="text-primary">Market</span>
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} data-testid={`link-nav-${link.label.toLowerCase().replace(" ", "-")}`}>
                  <span
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      isActive(link.href)
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/app/create" data-testid="link-create-skill">
              <Button variant="outline" size="sm" className="hidden md:flex border-primary/30 text-primary hover:bg-primary/10">
                + Create Skill
              </Button>
            </Link>

            {address ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  data-testid="button-wallet-menu"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-foreground font-mono">{shortAddress}</span>
                  <Badge variant="outline" className="text-xs border-accent/30 text-accent">Sepolia</Badge>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-card border border-white/10 rounded-lg shadow-xl overflow-hidden">
                    <Link href="/app/profile">
                      <div className="px-4 py-2 text-sm hover:bg-white/5 cursor-pointer" data-testid="link-profile">
                        My Profile
                      </div>
                    </Link>
                    <button
                      onClick={() => { disconnect(); setShowMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-white/5"
                      data-testid="button-disconnect"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={connect}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                data-testid="button-connect-wallet"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
