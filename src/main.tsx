import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { updateDocumentDirection } from "./i18n";
import i18n from "./i18n";
import { SettingsProvider } from "@/providers/SettingsProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { registerServiceWorker } from "@/lib/pushNotifications";
import { sendDailyScheduleToSW } from "@/lib/scheduleNotifications";

// Ensure direction is set on initial load
updateDocumentDirection(i18n.language);

// Register Service Worker and schedule background notifications
registerServiceWorker().then(() => {
  // Wait a moment for i18n to load, then send today's schedule to SW
  setTimeout(() => {
    sendDailyScheduleToSW();
  }, 3000);
});

createRoot(document.getElementById("root")!).render(
  <SettingsProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </SettingsProvider>
);