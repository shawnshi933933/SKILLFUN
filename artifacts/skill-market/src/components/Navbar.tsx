import { Link, useLocation } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X, Plus, BookOpen } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { DOC_SECTIONS, type DocSectionId } from "@/pages/Docs";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showDocsMenu, setShowDocsMenu] = useState(false);
  const docsRef = useRef<HTMLDivElement>(null);

  // Close docs dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (docsRef.current && !docsRef.current.contains(e.target as Node)) {
        setShowDocsMenu(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { href: "/app/market", label: "Market", external: false },
    { href: "/app/dashboard", label: "Dashboard", external: false },
    { href: "/app/claim", label: "Claim Skill", external: false },
    { href: "/mcp/agent-guide.md", label: "Agent Guide", external: true },
  ];

  const isActive = (href: string) => {
    const base = href.split("?")[0];
    if (base === "/app/market") return location === "/app/market" || location.startsWith("/app/skill/") || location.startsWith("/app/bundle/");
    if (base === "/app/dashboard") return location === "/app/dashboard" || location.startsWith("/app/creator") || location.startsWith("/app/curator");
    return location === base || location.startsWith(base + "/");
  };

  const isDocsActive = location.startsWith("/app/docs");

  function navigateToDocSection(id: DocSectionId) {
    setShowDocsMenu(false);
    setShowMobileMenu(false);
    if (location === "/app/docs") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      setLocation("/app/docs");
      // Give the page time to render before scrolling
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 200);
    }
  }

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

            {/* Docs dropdown */}
            <div className="relative" ref={docsRef}>
              <button
                onClick={() => setShowDocsMenu(!showDocsMenu)}
                data-testid="link-nav-docs"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  isDocsActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5"
                }`}
              >
                Docs <ChevronDown className={`w-3 h-3 transition-transform ${showDocsMenu ? "rotate-180" : ""}`} />
              </button>

              {showDocsMenu && (
                <div className="absolute left-0 mt-1 w-52 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
                  {DOC_SECTIONS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => navigateToDocSection(id)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-black/5 cursor-pointer text-left transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
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

            {/* Docs — mobile: flat list of sections */}
            <div className="px-4 pt-2 pb-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                <BookOpen className="w-3.5 h-3.5" /> Docs
              </div>
              <div className="flex flex-col gap-0.5 pl-1">
                {DOC_SECTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => navigateToDocSection(id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors text-muted-foreground hover:text-foreground hover:bg-black/5"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

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
