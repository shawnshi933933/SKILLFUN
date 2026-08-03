import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { wagmiConfig } from "@/lib/wagmi";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Market from "@/pages/Market";
import SkillDetail from "@/pages/SkillDetail";
import BundleDetail from "@/pages/BundleDetail";
import CreateSkill from "@/pages/CreateSkill";
import CreateBundle from "@/pages/CreateBundle";
import Stake from "@/pages/Stake";
import Distill from "@/pages/Distill";
import Claim from "@/pages/Claim";
import Flywheel from "@/pages/Flywheel";
import Profile from "@/pages/Profile";
import CuratorSkills from "@/pages/CuratorSkills";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/app/market" component={Market} />
      <Route path="/app/skill/:id" component={SkillDetail} />
      <Route path="/app/bundle/:id" component={BundleDetail} />
      <Route path="/app/create" component={CreateSkill} />
      <Route path="/app/create-bundle" component={CreateBundle} />
      <Route path="/app/stake" component={Stake} />
      <Route path="/app/kol" component={Distill} />
      <Route path="/app/claim" component={Claim} />
      <Route path="/app/flywheel" component={Flywheel} />
      <Route path="/app/profile" component={Profile} />
      <Route path="/app/curator/skills" component={CuratorSkills} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "hsl(265 85% 65%)",
            accentColorForeground: "white",
            borderRadius: "medium",
          })}
        >
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
