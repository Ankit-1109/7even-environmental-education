import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Learning from "@/pages/Learning";
import Missions from "@/pages/Missions";
import Guilds from "@/pages/Guilds";
import Profile from "@/pages/Profile";
import Simulation from "@/pages/Simulation";
import { Blockchain } from "@/pages/Blockchain";
import ARScanner from "@/pages/ARScanner";
import Layout from "@/components/Layout";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/learning" component={Learning} />
          <Route path="/missions" component={Missions} />
          <Route path="/guilds" component={Guilds} />
          <Route path="/profile" component={Profile} />
          <Route path="/simulation" component={Simulation} />
          <Route path="/blockchain" component={Blockchain} />
          <Route path="/ar-scanner" component={ARScanner} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Layout>
            <Router />
          </Layout>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
