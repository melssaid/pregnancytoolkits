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

maybeRunCleanup();
updateDocumentDirection(i18n.language);

// Mount React immediately — don't wait for i18n (useSuspense:false handles it)
createRoot(document.getElementById("root")!).render(
  <SettingsProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </SettingsProvider>
);

// Dismiss splash after mount
requestAnimationFrame(() => {
  const splash = document.getElementById("splash-overlay");
  if (splash) {
    splash.style.opacity = "0";
    splash.style.visibility = "hidden";
    setTimeout(() => splash.remove(), 300);
  }
});

// Register SW deferred
registerServiceWorker().then(() => {
  setTimeout(() => sendDailyScheduleToSW(), 3000);
});
