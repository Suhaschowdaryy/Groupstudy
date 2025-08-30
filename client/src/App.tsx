import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Discover from "@/pages/Discover";
import MyPods from "@/pages/MyPods";
import CreatePod from "@/pages/CreatePod";
import PodDetail from "@/pages/PodDetail";
import AIChat from "@/pages/AIChat";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import AIMatchingLanding from "@/pages/AIMatchingLanding";
import MicroGroupsLanding from "@/pages/MicroGroupsLanding";
import SmartRecommendationsLanding from "@/pages/SmartRecommendationsLanding";
import GoalTrackingLanding from "@/pages/GoalTrackingLanding";
import CollaborationLanding from "@/pages/CollaborationLanding";
import GamificationLanding from "@/pages/GamificationLanding";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/ai-matching" component={AIMatchingLanding} />
          <Route path="/micro-groups" component={MicroGroupsLanding} />
          <Route path="/smart-recommendations" component={SmartRecommendationsLanding} />
          <Route path="/goal-tracking" component={GoalTrackingLanding} />
          <Route path="/collaboration" component={CollaborationLanding} />
          <Route path="/gamification" component={GamificationLanding} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/profile" component={Profile} />
          <Route path="/discover" component={Discover} />
          <Route path="/my-pods" component={MyPods} />
          <Route path="/create-pod" component={CreatePod} />
          <Route path="/pod/:id" component={PodDetail} />
          <Route path="/ai-chat" component={AIChat} />
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
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
