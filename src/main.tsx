import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { i18nReady, updateDocumentDirection } from "./i18n";
import i18n from "./i18n";
import { SettingsProvider } from "@/providers/SettingsProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { registerServiceWorker } from "@/lib/pushNotifications";
import { sendDailyScheduleToSW } from "@/lib/scheduleNotifications";
import { maybeRunCleanup } from "@/lib/storageCleanup";

// Run periodic storage cleanup (non-blocking)
maybeRunCleanup();

// Register WebView with AdSense for Google Play compliance
// Prevents account suspension when ads are shown inside a WebView app
try {
  const adsbygoogle = (window as any).adsbygoogle || [];
  if (typeof adsbygoogle.registerWebView === "function") {
    adsbygoogle.registerWebView();
  } else {
    // Wait for AdSense script to load, then register
    const onAdsLoaded = () => {
      try {
        const ads = (window as any).adsbygoogle;
        if (ads && typeof ads.registerWebView === "function") {
          ads.registerWebView();
        }
      } catch {
        // Silent fail — not in WebView or AdSense not ready
      }
    };
    window.addEventListener("load", onAdsLoaded, { once: true });
  }
} catch {
  // Silent fail — safe for non-WebView environments
}

// Wait for initial language to load, then render
i18nReady.then(() => {
  // Ensure direction is set
  updateDocumentDirection(i18n.language);

  createRoot(document.getElementById("root")!).render(
    <SettingsProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </SettingsProvider>
  );

  // Register Service Worker after render
  registerServiceWorker().then(() => {
    setTimeout(() => {
      sendDailyScheduleToSW();
    }, 3000);
  });
});
