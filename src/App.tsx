import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { SmartScrollRestoration } from "@/components/SmartScrollRestoration";
import { AnimatedRoutes } from "@/components/AnimatedRoutes";
import { FirstVisitLanguageSelector } from "@/components/FirstVisitLanguageSelector";
import { OnboardingDisclaimer } from "@/components/OnboardingDisclaimer";
import { useEffect } from "react";
import { initializeAuth } from "@/lib/auth";
import { toast } from "sonner";

const queryClient = new QueryClient();

const App = () => {
  // Initialize anonymous authentication on app load
  useEffect(() => {
    initializeAuth();
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SmartScrollRestoration />
          <AnimatedRoutes />
          <FirstVisitLanguageSelector />
          <OnboardingDisclaimer />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
