import { Link, useLocation } from "wouter";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { Zap, Wallet, ChevronDown, Menu, X, Plus } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { address, connect, disconnect } = useWallet();
  const [location] = useLocation();
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const navLinks = [
    { href: "/app/market", label: "Skills" },
    { href: "/app/market?tab=bundles", label: "Bundles" },
    { href: "/app/stake", label: "Stake" },
    { href: "/app/agent-api", label: "Agent API" },
    { href: "/app/kol", label: "KOL" },
  ];

  const isActive = (href: string) => location === href || location.startsWith(href + "/");

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" data-testid="link-logo">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">
                Skill<span className="text-primary">Fun</span>
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded border border-accent/40 text-accent bg-accent/10 tracking-wider">
                DEMO
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}>
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

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Create dropdown */}
            <div className="relative hidden md:block">
              <Button
                variant="outline"
                size="sm"
                className="border-primary/30 text-primary hover:bg-primary/10 gap-1"
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                data-testid="button-create-dropdown"
              >
                <Plus className="w-3.5 h-3.5" /> Create
                <ChevronDown className="w-3 h-3" />
              </Button>
              {showCreateMenu && (
                <div className="absolute right-0 mt-1 w-44 bg-card border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                  <Link href="/app/create">
                    <div className="px-4 py-2.5 text-sm hover:bg-white/5 cursor-pointer" onClick={() => setShowCreateMenu(false)} data-testid="link-create-skill">
                      <div className="font-medium">Skill NFT</div>
                      <div className="text-xs text-muted-foreground">Mint your AI capability</div>
                    </div>
                  </Link>
                  <Link href="/app/create-bundle">
                    <div className="px-4 py-2.5 text-sm hover:bg-white/5 cursor-pointer border-t border-white/5" onClick={() => setShowCreateMenu(false)} data-testid="link-create-bundle">
                      <div className="font-medium">Bundle</div>
                      <div className="text-xs text-muted-foreground">Curate skills, earn markup</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Wallet */}
            {address ? (
              <div className="relative">
                <button
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  data-testid="button-wallet-menu"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-foreground font-mono hidden sm:inline">{shortAddress}</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
                {showWalletMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-card border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                    <Link href="/app/profile">
                      <div className="px-4 py-2 text-sm hover:bg-white/5 cursor-pointer" data-testid="link-profile" onClick={() => setShowWalletMenu(false)}>
                        My Profile
                      </div>
                    </Link>
                    <button
                      onClick={() => { disconnect(); setShowWalletMenu(false); }}
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
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </Button>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              data-testid="button-mobile-menu"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <X className="w-4 h-4 text-foreground" />
              ) : (
                <Menu className="w-4 h-4 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-md" data-testid="mobile-menu">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-testid={`link-mobile-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isActive(link.href)
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  {link.label}
                </div>
              </Link>
            ))}
            <Link href="/app/create">
              <div className="flex items-center px-4 py-3 rounded-xl text-sm font-medium border border-primary/20 text-primary mt-2 cursor-pointer" onClick={() => setShowMobileMenu(false)}>
                + Create Skill
              </div>
            </Link>
            <Link href="/app/create-bundle">
              <div className="flex items-center px-4 py-3 rounded-xl text-sm font-medium border border-accent/20 text-accent cursor-pointer" onClick={() => setShowMobileMenu(false)}>
                + Create Bundle
              </div>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
