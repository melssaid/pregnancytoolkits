import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
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
          toast.error("Still seeing cache mismatch", {
            description: "Please do one hard refresh (Ctrl/Cmd + Shift + R).",
            duration: 3500,
          });
          return;
        }

        sessionStorage.setItem(CHUNK_RECOVERY_KEY, "1");
        
        toast.error("Refreshing app cache...", {
          description: "Reloading with a clean module cache.",
          duration: 2500,
        });

        void recoverFromChunkError().finally(() => {
          const nextUrl = new URL(window.location.href);
          nextUrl.searchParams.set("__cache_bust", Date.now().toString());
          window.location.replace(nextUrl.toString());
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
