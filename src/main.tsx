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

// Mount React behind the splash — splash stays visible until content paints
createRoot(document.getElementById("root")!).render(
  <SettingsProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </SettingsProvider>
);

// Register SW deferred
registerServiceWorker().then(() => {
  setTimeout(() => sendDailyScheduleToSW(), 3000);
});
