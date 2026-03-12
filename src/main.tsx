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
let splashDismissed = false;
const dismissSplash = () => {
  if (splashDismissed) return;
  splashDismissed = true;
  const splash = document.getElementById("splash-overlay");
  if (!splash) return;
  splash.style.opacity = "0";
  splash.style.visibility = "hidden";
  setTimeout(() => splash.remove(), 400);
};
window.addEventListener("app:first-render", dismissSplash, { once: true });
setTimeout(dismissSplash, 5000); // safety fallback

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
  import("@/lib/storageCleanup").then(m => m.maybeRunCleanup());
  // Service Worker + push notifications
  import("@/lib/pushNotifications").then(m => m.registerServiceWorker()).then(() => {
    setTimeout(() => {
      import("@/lib/scheduleNotifications").then(m => m.sendDailyScheduleToSW());
    }, 2000);
  });
});
