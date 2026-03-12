import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { updateDocumentDirection } from "./i18n";
import i18n from "./i18n";
import { SettingsProvider } from "@/providers/SettingsProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { registerServiceWorker } from "@/lib/pushNotifications";
import { sendDailyScheduleToSW } from "@/lib/scheduleNotifications";
import { maybeRunCleanup } from "@/lib/storageCleanup";

// Run periodic storage cleanup (non-blocking)
maybeRunCleanup();


// Wait for translations before rendering to avoid showing raw keys
updateDocumentDirection(i18n.language);

import { i18nReady } from "./i18n";

i18nReady.then(() => {
  createRoot(document.getElementById("root")!).render(
    <SettingsProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </SettingsProvider>
  );

  // Fade out splash overlay after React has mounted
  requestAnimationFrame(() => {
    const splash = document.getElementById("splash-overlay");
    if (splash) {
      splash.style.opacity = "0";
      splash.style.visibility = "hidden";
      setTimeout(() => splash.remove(), 400);
    }
  });
});

// Register Service Worker after render (deferred)

// Register Service Worker after render
registerServiceWorker().then(() => {
  setTimeout(() => {
    sendDailyScheduleToSW();
  }, 3000);
});
