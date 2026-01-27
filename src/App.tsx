import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { SmartScrollRestoration } from "@/components/SmartScrollRestoration";
import { AnimatedRoutes } from "@/components/AnimatedRoutes";
import { GlobalMedicalDisclaimer } from "@/components/compliance";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GlobalMedicalDisclaimer>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SmartScrollRestoration />
          <AnimatedRoutes />
        </BrowserRouter>
      </GlobalMedicalDisclaimer>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
