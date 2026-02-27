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
 * Called once from App to warm the cache
 */
export function prefetchCriticalRoutes(): void {
  const critical = ["/dashboard", "/tools/pregnancy-assistant", "/settings"];
  const schedule = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 1000));
  schedule(() => {
    critical.forEach(prefetchRoute);
  });
}
