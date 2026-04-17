import { Download, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useSmartInstallPrompt } from "@/hooks/useSmartInstallPrompt";

/**
 * Smart Install Banner — appears after user engages with 2+ tools.
 * Uses the native `beforeinstallprompt` for higher install conversion.
 */
export function SmartInstallBanner() {
  const { t } = useTranslation();
  const { canPrompt, showPrompt, dismiss } = useSmartInstallPrompt();

  return (
    <AnimatePresence>
      {canPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-3 right-3 z-[200] rounded-2xl bg-card border border-border shadow-2xl shadow-primary/10 p-4"
        >
          <button
            onClick={dismiss}
            className="absolute top-2.5 right-2.5 p-1 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/10 flex items-center justify-center shrink-0">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">
                {t("installBanner.title", "Install the app")}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t("installBanner.desc", "Quick access to all tools — works offline too!")}
              </p>
            </div>
          </div>
          <button
            onClick={showPrompt}
            className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-pink-500 text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            {t("installBanner.cta", "Install Now")}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SmartInstallBanner;
