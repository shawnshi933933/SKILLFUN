import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Market from "@/pages/Market";
import SkillDetail from "@/pages/SkillDetail";
import BundleDetail from "@/pages/BundleDetail";
import CreateSkill from "@/pages/CreateSkill";
import CreateBundle from "@/pages/CreateBundle";
import Stake from "@/pages/Stake";
import Distill from "@/pages/Distill";
import Flywheel from "@/pages/Flywheel";
import AgentApi from "@/pages/AgentApi";
import Profile from "@/pages/Profile";

const queryClient = new QueryClient();

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
      <Route path="/app/flywheel" component={Flywheel} />
      <Route path="/app/agent-api" component={AgentApi} />
      <Route path="/app/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
