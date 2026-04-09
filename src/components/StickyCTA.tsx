import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";
import { motion } from "framer-motion";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=app.pregnancytoolkits.android";

/**
 * Sticky CTA bar for landing/SEO pages.
 * Only visible on mobile web — hidden in TWA/PWA.
 */
export function StickyCTA() {
  const { t } = useTranslation();

  // Hide inside TWA/PWA
  const isTWA = typeof window !== "undefined" && (
    document.referrer.includes("android-app://") ||
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );

  if (isTWA) return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 2, duration: 0.5 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none md:hidden"
    >
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg hover:opacity-90 transition-opacity"
      >
        <Download className="h-4 w-4" />
        {t("stickyCta.download", "Download Free — Google Play")}
      </a>
    </motion.div>
  );
}
