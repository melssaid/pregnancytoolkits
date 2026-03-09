import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { SmartScrollRestoration } from "@/components/SmartScrollRestoration";
import { AnimatedRoutes } from "@/components/AnimatedRoutes";
import { OnboardingDisclaimer } from "@/components/OnboardingDisclaimer";
import { AIUsageProvider } from "@/contexts/AIUsageContext";
import { useEffect } from "react";
import { initializeAuth } from "@/lib/auth";
import { toast } from "sonner";
import { prefetchCriticalRoutes } from "@/lib/routePrefetch";

const queryClient = new QueryClient();

const App = () => {
  // Initialize anonymous authentication on app load
  useEffect(() => {
    initializeAuth();
    // Prefetch critical routes after initial render
    prefetchCriticalRoutes();
  }, []);

  // Handle dynamic import failures (e.g., after app updates)
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || String(event.reason);
      
      // Check if it's a dynamic import error
      if (message.includes('Failed to fetch dynamically imported module') || 
          message.includes('Loading chunk') ||
          message.includes('Loading CSS chunk')) {
        event.preventDefault();
        
        // Show user-friendly message and reload
        toast.error("App updated, reloading...", {
          description: "Please wait...",
          duration: 2000,
        });
        
        // Reload after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    };

    window.addEventListener("unhandledrejection", handleRejection);
    
    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return (
    <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AIUsageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SmartScrollRestoration />
          <AnimatedRoutes />
          <OnboardingDisclaimer />
        </BrowserRouter>
      </TooltipProvider>
      </AIUsageProvider>
    </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
