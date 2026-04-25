import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, X } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

const INSTALL_KEY = "pt_first_open";
const DISMISS_KEY = "pt_upgrade_banner_dismissed";
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function TrialExpiryBanner() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { tier } = useSubscriptionStatus();
  const [dismissed, setDismissed] = useState(false);
  const lang = i18n.language?.split("-")[0] || "en";

  // Record first open timestamp
  useEffect(() => {
    if (!localStorage.getItem(INSTALL_KEY)) {
      localStorage.setItem(INSTALL_KEY, Date.now().toString());
    }
  }, []);

  // Check if dismissed today
  useEffect(() => {
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      // Re-show after 24h
      if (elapsed < 24 * 60 * 60 * 1000) {
        setDismissed(true);
      } else {
        localStorage.removeItem(DISMISS_KEY);
      }
    }
  }, []);

  const daysSinceInstall = useMemo(() => {
    const firstOpen = localStorage.getItem(INSTALL_KEY);
    if (!firstOpen) return 0;
    return (Date.now() - parseInt(firstOpen, 10)) / (24 * 60 * 60 * 1000);
  }, []);

  const couponUsed = typeof window !== "undefined" && !!localStorage.getItem("pt_coupon_used");
  const isPremium = tier === "premium";
  const shouldShow = !isPremium && !couponUsed && daysSinceInstall >= 3 && !dismissed;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  const labels: Record<string, { text: string; cta: string }> = {
    ar: { text: "🌟 اكتشفي قوة التحليلات الذكية — اشتركي الآن!", cta: "اشتركي" },
    en: { text: "🌟 Unlock smart analyses — Subscribe now!", cta: "Subscribe" },
    de: { text: "🌟 Smarte Analysen freischalten — Jetzt abonnieren!", cta: "Abonnieren" },
    fr: { text: "🌟 Débloquez les analyses intelligentes — Abonnez-vous!", cta: "S'abonner" },
    es: { text: "🌟 Desbloquea análisis inteligentes — ¡Suscríbete!", cta: "Suscríbete" },
    pt: { text: "🌟 Desbloqueie análises inteligentes — Assine agora!", cta: "Assinar" },
    tr: { text: "🌟 Akıllı analizlerin kilidini açın — Şimdi abone olun!", cta: "Abone Ol" },
  };
  const l = labels[lang] || labels.en;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden bg-gradient-to-r from-[hsl(45,85%,52%)] via-[hsl(40,80%,50%)] to-[hsl(35,75%,48%)] text-white"
        >
          <div className="flex items-center justify-between gap-2 px-4 py-2">
            <p className="text-[11px] font-bold truncate flex-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              {l.text}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => navigate("/pricing-demo")}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/25 hover:bg-white/35 backdrop-blur-sm text-[10px] font-bold transition-colors"
              >
                <Crown className="w-3 h-3" fill="currentColor" />
                {l.cta}
              </button>
              <button
                onClick={handleDismiss}
                className="p-0.5 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
