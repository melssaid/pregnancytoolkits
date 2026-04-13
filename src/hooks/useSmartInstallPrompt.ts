import { useState, useEffect, useCallback, useRef } from "react";

const INSTALL_DISMISSED_KEY = "pt_install_dismissed";
const TOOLS_USED_KEY = "pt_tools_used_count";

/**
 * Smart Install Prompt — intercepts `beforeinstallprompt` and defers it
 * until the user has engaged with at least 2 tools.
 * Increases install conversion by showing at the optimal moment.
 */
export function useSmartInstallPrompt() {
  const [canPrompt, setCanPrompt] = useState(false);
  const deferredPrompt = useRef<any>(null);

  useEffect(() => {
    // Don't show if standalone or dismissed within 14 days
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) return;

    const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY);
    if (dismissed && Date.now() - parseInt(dismissed) < 14 * 86400000) return;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;

      // Check engagement threshold
      const toolsUsed = parseInt(localStorage.getItem(TOOLS_USED_KEY) || "0");
      if (toolsUsed >= 2) {
        setCanPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const trackToolUsage = useCallback(() => {
    const count = parseInt(localStorage.getItem(TOOLS_USED_KEY) || "0") + 1;
    localStorage.setItem(TOOLS_USED_KEY, count.toString());
    if (count >= 2 && deferredPrompt.current) {
      setCanPrompt(true);
    }
  }, []);

  const showPrompt = useCallback(async () => {
    if (!deferredPrompt.current) return false;
    deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    setCanPrompt(false);
    return outcome === "accepted";
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(INSTALL_DISMISSED_KEY, Date.now().toString());
    setCanPrompt(false);
  }, []);

  return { canPrompt, showPrompt, dismiss, trackToolUsage };
}
