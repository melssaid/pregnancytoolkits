/**
 * Route Prefetching — preloads likely next pages on idle
 * Drastically improves perceived navigation speed under load
 */

const prefetchedRoutes = new Set<string>();

// Map of route → dynamic import
const routeImports: Record<string, () => Promise<unknown>> = {
  "/dashboard": () => import("@/pages/SmartDashboard"),
  "/settings": () => import("@/pages/Settings"),
  "/tools/pregnancy-assistant": () => import("@/pages/tools/PregnancyAssistant"),
  "/tools/cycle-tracker": () => import("@/pages/tools/CycleTracker"),
  "/tools/due-date-calculator": () => import("@/pages/tools/DueDateCalculator"),
  "/tools/fetal-growth": () => import("@/pages/tools/FetalDevelopment3D"),
  "/tools/kick-counter": () => import("@/pages/tools/SmartKickCounter"),
  "/tools/weekly-summary": () => import("@/pages/tools/WeeklySummary"),
  "/tools/ai-meal-suggestion": () => import("@/pages/tools/AIMealSuggestion"),
};

/**
 * Prefetch a specific route's JS chunk
 */
export function prefetchRoute(path: string): void {
  if (prefetchedRoutes.has(path)) return;
  const loader = routeImports[path];
  if (!loader) return;
  prefetchedRoutes.add(path);
  // Use requestIdleCallback for non-blocking prefetch
  const schedule = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 200));
  schedule(() => {
    loader().catch(() => {
      // Silent fail — chunk will load on navigation
      prefetchedRoutes.delete(path);
    });
  });
}

/**
 * Prefetch top routes after initial page load
 * Reads user journey to prefetch the most relevant tools
 */
export function prefetchCriticalRoutes(): void {
  const schedule = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 1000));
  schedule(() => {
    // Always prefetch core pages
    prefetchRoute("/dashboard");
    prefetchRoute("/settings");

    // Journey-aware prefetching
    let journey = 'pregnant';
    try {
      const profile = localStorage.getItem('userProfile');
      if (profile) {
        const parsed = JSON.parse(profile);
        journey = parsed.journey || parsed.selectedJourney || 'pregnant';
      }
    } catch {}

    const journeyRoutes: Record<string, string[]> = {
      pregnant: ["/tools/pregnancy-assistant", "/tools/kick-counter", "/tools/weekly-summary", "/tools/weight-gain"],
      planning: ["/tools/cycle-tracker", "/tools/due-date-calculator", "/tools/fertility-academy"],
      postpartum: ["/tools/baby-sleep-tracker", "/tools/diaper-tracker", "/tools/baby-growth", "/tools/postpartum-recovery"],
      trying: ["/tools/cycle-tracker", "/tools/due-date-calculator", "/tools/preconception-checkup"],
    };

    const routes = journeyRoutes[journey] || journeyRoutes.pregnant;
    routes.forEach(prefetchRoute);
  });
}
