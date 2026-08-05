import { Link, useLocation } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X, Plus } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [location] = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const navLinks = [
    { href: "/app/market", label: "Skills", external: false },
    { href: "/app/market?tab=bundles", label: "Bundles", external: false },
    { href: "/app/creator/skills", label: "Creator", external: false },
    { href: "/app/curator/skills", label: "Curator", external: false },
    { href: "/app/claim", label: "Claim", external: false },
    { href: "/app/stake", label: "Stake", external: false },
    { href: "/docs/user-guide.md", label: "Guide", external: true },
    { href: "/mcp/agent-guide.md", label: "Agent Guide", external: true },
  ];

  const isActive = (href: string) => location === href || location.startsWith(href.split("?")[0] + "/");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" data-testid="link-logo">
            <div className="flex items-center gap-2 cursor-pointer">
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="SkillFun"
                className="w-8 h-8 rounded-lg object-contain"
              />
              <span className="font-bold text-lg tracking-tight text-foreground">
                Skill<span className="text-primary">Fun</span>
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded border border-primary/30 text-primary bg-primary/8 tracking-wider">
                BETA
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              link.external ? (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <span className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer text-muted-foreground hover:text-foreground hover:bg-black/5">
                    {link.label}
                  </span>
                </a>
              ) : (
                <Link key={link.href} href={link.href} data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <span
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      isActive(link.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-black/5"
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              )
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
                <div className="absolute right-0 mt-1 w-44 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
                  <Link href="/app/create">
                    <div className="px-4 py-2.5 text-sm hover:bg-black/5 cursor-pointer" onClick={() => setShowCreateMenu(false)} data-testid="link-create-skill">
                      <div className="font-medium">Skill NFT</div>
                      <div className="text-xs text-muted-foreground">Mint your AI capability</div>
                    </div>
                  </Link>
                  <Link href="/app/create-bundle">
                    <div className="px-4 py-2.5 text-sm hover:bg-black/5 cursor-pointer" onClick={() => setShowCreateMenu(false)} data-testid="link-create-bundle">
                      <div className="font-medium">Bundle</div>
                      <div className="text-xs text-muted-foreground">Curate a skill set</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Wallet — RainbowKit ConnectButton */}
            <ConnectButton
              accountStatus="avatar"
              chainStatus="none"
              showBalance={{ smallScreen: false, largeScreen: true }}
            />

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-1.5 rounded-md hover:bg-black/5 transition-colors"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
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
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md" data-testid="mobile-menu">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              link.external ? (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" data-testid={`link-mobile-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer text-muted-foreground hover:text-foreground hover:bg-black/5" onClick={() => setShowMobileMenu(false)}>
                    {link.label}
                  </div>
                </a>
              ) : (
                <Link key={link.href} href={link.href} data-testid={`link-mobile-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      isActive(link.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-black/5"
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {link.label}
                  </div>
                </Link>
              )
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
