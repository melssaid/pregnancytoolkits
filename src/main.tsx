import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";
import { updateDocumentDirection, i18nReady } from "./i18n";
import i18n from "./i18n";
import { SettingsProvider } from "@/providers/SettingsProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Sync: set document direction (instant, no I/O)
updateDocumentDirection(i18n.language);

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

const clearStaleCaches = async () => {
  // In preview/iframe: unregister any SW to avoid stale-cache + eval errors
  if ("serviceWorker" in navigator) {
    if (isPreviewHost || isInIframe) {
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
  // Storage cleanup
  import("@/lib/storageCleanup").then((m) => m.maybeRunCleanup());

  // Core Web Vitals measurement
  import("@/lib/webVitals").then((m) => m.initWebVitals());

  // Retry any pending purchase acknowledges
  import("@/lib/googlePlayBilling").then((m) => m.retryPendingAcknowledges());

  // Migrate large data to IndexedDB
  import("@/lib/indexedDBStore").then((m) => {
    ['kick_counter_sessions', 'contraction_entries', 'weight_gain_entries'].forEach(key => {
      m.migrateFromLocalStorage(key);
    });
  });

  if (import.meta.env.DEV || isPreviewHost || isInIframe) return;

  // Service Worker + push notifications (production only)
  import("@/lib/pushNotifications")
    .then((m) => m.registerServiceWorker())
    .then(() => {
      setTimeout(() => {
        import("@/lib/scheduleNotifications").then((m) => m.sendDailyScheduleToSW());
      }, 2000);
    });
});
