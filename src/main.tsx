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

// Hard safety: dismiss after 5s no matter what
setTimeout(() => {
  appFirstRenderReady = true;
  htmlSplashEnded = true;
  dismissSplash();
}, 5000);

const clearStaleCaches = async () => {
  // Force SW update + clear old caches in ALL environments (not just dev)
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.update(); // Force check for new SW version
    }
  }

  if ("caches" in window) {
    const keys = await caches.keys();
    const currentVersion = 'pt-cache-v3.0.1';
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

i18nReady.then(() => {
  updateDocumentDirection(i18n.language);
  root.render(
    <SettingsProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </SettingsProvider>
  );
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

  // Migrate large data to IndexedDB
  import("@/lib/indexedDBStore").then((m) => {
    ['kick_counter_sessions', 'contraction_entries', 'weight_gain_entries'].forEach(key => {
      m.migrateFromLocalStorage(key);
    });
  });

  if (import.meta.env.DEV) return;

  // Service Worker + push notifications (production only)
  import("@/lib/pushNotifications")
    .then((m) => m.registerServiceWorker())
    .then(() => {
      setTimeout(() => {
        import("@/lib/scheduleNotifications").then((m) => m.sendDailyScheduleToSW());
      }, 2000);
    });
});
