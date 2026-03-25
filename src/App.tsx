import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { listenForPurchaseSuccess } from "@/lib/googlePlayBilling";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { SmartScrollRestoration } from "@/components/SmartScrollRestoration";
import { AnimatedRoutes } from "@/components/AnimatedRoutes";
import { AIUsageProvider } from "@/contexts/AIUsageContext";
import { useEffect, lazy, Suspense } from "react";
import { initializeAuth } from "@/lib/auth";
import { toast } from "sonner";
import { prefetchCriticalRoutes } from "@/lib/routePrefetch";

// Lazy-load OnboardingDisclaimer — heavy imports (Calendar, date-fns) only needed on first visit
const OnboardingDisclaimer = lazy(() => import("@/components/OnboardingDisclaimer").then(m => ({ default: m.OnboardingDisclaimer })));

const queryClient = new QueryClient();
const CHUNK_RECOVERY_KEY = "pt_chunk_recovery_done";

const recoverFromChunkError = async () => {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }

  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith("pt-cache-v") || key.includes("vite") || key.includes("workbox"))
        .map((key) => caches.delete(key))
    );
  }
};

const App = () => {
  // Initialize anonymous auth & prefetch critical routes
  useEffect(() => {
    initializeAuth();
    prefetchCriticalRoutes();
  }, []);

  // Listen for Google Play purchase success from native wrapper
  useEffect(() => {
    const cleanup = listenForPurchaseSuccess(
      () => {
        toast.success("🎉 Premium activated!");
        // Refresh subscription status across the app
        queryClient.invalidateQueries({ queryKey: ['subscription'] });
      },
      (msg) => {
        console.error('[Billing]', msg);
        toast.error("Subscription activation failed. Please try again.");
      },
    );
    return cleanup;
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

        const alreadyRecovered = sessionStorage.getItem(CHUNK_RECOVERY_KEY) === "1";
        if (alreadyRecovered) {
          // Don't show error on second attempt — just let it pass
          console.warn("[ChunkRecovery] Already recovered once this session, skipping reload.");
          return;
        }

        sessionStorage.setItem(CHUNK_RECOVERY_KEY, "1");
        
        // Only clear stale caches, don't force reload immediately
        void recoverFromChunkError().then(() => {
          toast.info("Updating app...", {
            description: "Please wait a moment.",
            duration: 2000,
          });
          // Use a gentle retry: re-navigate to the same route instead of hard reload
          setTimeout(() => {
            window.location.reload();
          }, 500);
        });
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
          <Suspense fallback={null}><OnboardingDisclaimer /></Suspense>
        </BrowserRouter>
      </TooltipProvider>
      </AIUsageProvider>
    </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
