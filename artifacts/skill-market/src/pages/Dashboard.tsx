import { useState } from "react";
import { useSearch, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import CreatorSkills from "@/pages/CreatorSkills";
import CuratorSkills from "@/pages/CuratorSkills";
import { Wand2, Shield } from "lucide-react";

type DashTab = "creator" | "curator";

export default function Dashboard() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(search);
  const initialTab = (params.get("tab") as DashTab) ?? "creator";
  const [tab, setTab] = useState<DashTab>(initialTab);

  function switchTab(t: DashTab) {
    setTab(t);
    setLocation(`/app/dashboard?tab=${t}`);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">

        {/* Tab bar */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-xl mb-8 w-fit">
          <button
            onClick={() => switchTab("creator")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "creator"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-creator"
          >
            <Wand2 className="w-4 h-4" />
            Creator
          </button>
          <button
            onClick={() => switchTab("curator")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "curator"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-curator"
          >
            <Shield className="w-4 h-4" />
            Curator
          </button>
        </div>

        {/* Panel content */}
        {tab === "creator" && <CreatorSkills asPanel />}
        {tab === "curator" && <CuratorSkills asPanel />}
      </div>
    </div>
  );
}
