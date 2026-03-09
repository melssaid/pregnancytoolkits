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


// Render immediately — don't block on i18n
updateDocumentDirection(i18n.language);

createRoot(document.getElementById("root")!).render(
  <SettingsProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </SettingsProvider>
);

// Dismiss splash after first paint
requestAnimationFrame(dismissNativeSplash);
// Safety net fallback
setTimeout(dismissNativeSplash, 800);

// Register Service Worker after render
registerServiceWorker().then(() => {
  setTimeout(() => {
    sendDailyScheduleToSW();
  }, 3000);
});
