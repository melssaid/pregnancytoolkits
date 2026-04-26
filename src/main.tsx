import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";
import { updateDocumentDirection, i18nReady } from "./i18n";
import i18n from "./i18n";
import { SettingsProvider } from "@/providers/SettingsProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { migrateKickSessions } from "@/lib/kickSessionsStore";

// One-shot data migration: collapse legacy kick-session buckets into the canonical key.
// Idempotent (guarded by a flag in localStorage) and safe to run before render.
migrateKickSessions();

// Sync: set document direction (instant, no I/O)
updateDocumentDirection(i18n.language);

// Always open the app from the top — disable browser scroll restoration
// so reloads / cold starts never land mid-page.
if ("scrollRestoration" in history) {
  try { history.scrollRestoration = "manual"; } catch {}
}
window.scrollTo(0, 0);

// ── Splash dismiss logic ──────────────────────────────────
declare global {
  interface Window {
    __htmlSplashVideoActive?: boolean;
    __htmlSplashVideoEnded?: boolean;
  }
}

let splashDismissed = false;

const dismissSplash = () => {
  if (splashDismissed) return;
  splashDismissed = true;
  const splash = document.getElementById("splash-overlay");
  if (!splash) return;
  splash.style.opacity = "0";
  splash.style.visibility = "hidden";
  setTimeout(() => splash.remove(), 500);
};

// Dismiss splash when EITHER React renders OR html-splash video ends
// (whichever comes LAST — but with a hard 5s safety net)
let appFirstRenderReady = false;
let htmlSplashEnded = false;

const tryDismiss = () => {
  if (appFirstRenderReady && htmlSplashEnded) dismissSplash();
};

window.addEventListener("app:first-render", () => {
  appFirstRenderReady = true;
  tryDismiss();
}, { once: true });

window.addEventListener("html-splash-ended", () => {
  htmlSplashEnded = true;
  tryDismiss();
}, { once: true });

// If splash overlay is already gone (returning user), mark it
if (!document.getElementById("splash-overlay")) {
  htmlSplashEnded = true;
}

// Hard safety: dismiss after 7s no matter what (video ~3-4s + app load buffer)
setTimeout(() => {
  appFirstRenderReady = true;
  htmlSplashEnded = true;
  dismissSplash();
}, 7000);

const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();
const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com") ||
  window.location.hostname.includes("lovable.app");

const SW_CLEANUP_KEY = "pt_sw_cleaned_v1";

const clearStaleCaches = async () => {
  // In preview/iframe: unregister any SW ONCE per session to avoid stale-cache + eval errors.
  // Repeating this on every load was killing chunk caching and slowing internal navigation.
  if ("serviceWorker" in navigator) {
    if (isPreviewHost || isInIframe) {
      if (sessionStorage.getItem(SW_CLEANUP_KEY)) return;
      sessionStorage.setItem(SW_CLEANUP_KEY, "1");
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) await r.unregister();
      } catch {}
    } else {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.update();
        }
      } catch {}
    }
  }

  if ("caches" in window) {
    const keys = await caches.keys();
    const currentVersion = 'pt-cache-v3.1.0';
    for (const key of keys) {
      if (key.startsWith("pt-cache-v") && key !== currentVersion) {
        await caches.delete(key);
      }
      if (key.includes("vite") || key.includes("workbox")) {
        await caches.delete(key);
      }
    }
  }
};

// Run ASAP in development to prevent stale SW/HMR module cache from breaking dynamic imports
clearStaleCaches();

// ── Mount React immediately, i18n loads in background ──
const root = createRoot(document.getElementById("root")!);

const signalFirstRender = () => {
  // Wait two RAFs to ensure React's first paint is committed to the screen
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent("app:first-render"));
    });
  });
};

i18nReady
  .then(() => {
    updateDocumentDirection(i18n.language);
    root.render(
      <SettingsProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </SettingsProvider>
    );
    signalFirstRender();
  })
  .catch((err) => {
    // Fallback: even if i18n fails, render the app so the splash can dismiss
    console.error("[i18n] init failed, rendering app anyway", err);
    root.render(
      <SettingsProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </SettingsProvider>
    );
    signalFirstRender();
  });

// ── Deferred work (after first paint) ──────────────────────
const deferAfterPaint = (fn: () => void) => {
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(fn, { timeout: 8000 });
  } else {
    setTimeout(fn, 3000);
  }
};

deferAfterPaint(() => {
  // Helper: swallow stale-bundle import failures (common after redeploys)
  const safeImport = <T,>(loader: () => Promise<T>, label: string): Promise<T | null> =>
    loader().catch((err) => {
      console.warn(`[deferred-import] ${label} failed:`, err?.message || err);
      return null;
    });

  // Prefetch likely next routes — drastically improves perceived navigation speed.
  // Loads in idle so it never competes with user interactions.
  safeImport(() => import("@/lib/routePrefetch"), "routePrefetch")
    .then((m) => m?.prefetchCriticalRoutes());

  // Light-weight modules — fire in parallel, no need to chain
  Promise.all([
    safeImport(() => import("@/lib/storageCleanup"), "storageCleanup")
      .then((m) => m?.maybeRunCleanup()),
    safeImport(() => import("@/lib/webVitals"), "webVitals")
      .then((m) => m?.initWebVitals()),
    safeImport(() => import("@/lib/googlePlayBilling"), "googlePlayBilling")
      .then((m) => m?.retryPendingAcknowledges()),
  ]);

  // IndexedDB migration is heavy — push it well past first navigation
  // so it never competes with the user clicking into a tool.
  setTimeout(() => {
    safeImport(() => import("@/lib/indexedDBStore"), "indexedDBStore").then((m) => {
      if (!m) return;
      ['kick_counter_sessions', 'contraction_entries', 'weight_gain_entries'].forEach(key => {
        m.migrateFromLocalStorage(key);
      });
    });
  }, 5000);

  if (import.meta.env.DEV || isPreviewHost || isInIframe) return;

  // Service Worker + push notifications (production only)
  safeImport(() => import("@/lib/pushNotifications"), "pushNotifications")
    .then((m) => m?.registerServiceWorker())
    .then(() => {
      setTimeout(() => {
        safeImport(() => import("@/lib/scheduleNotifications"), "scheduleNotifications")
          .then((m) => m?.sendDailyScheduleToSW());
      }, 2000);
    });
});
