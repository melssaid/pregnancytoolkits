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

const dismissSplash = () => {
  const splash = document.getElementById("splash-overlay");
  if (!splash || splash.dataset.hidden === "true") return;
  splash.dataset.hidden = "true";
  splash.style.opacity = "0";
  splash.style.visibility = "hidden";
  setTimeout(() => splash.remove(), 350);
};

// Keep splash visible until app shell is really painted
window.addEventListener("app:first-render", dismissSplash, { once: true });
// Safety fallback (never leave splash forever)
setTimeout(dismissSplash, 6000);

createRoot(document.getElementById("root")!).render(
  <SettingsProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </SettingsProvider>
);

registerServiceWorker().then(() => {
  setTimeout(() => sendDailyScheduleToSW(), 3000);
});
