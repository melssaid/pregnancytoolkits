import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Crown, X } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

export function TrialExpiryBanner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tier, trialDaysLeft } = useSubscriptionStatus();
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  // Only show for trial users with ≤1 day left
  const shouldShow = tier === "trial" && trialDaysLeft <= 1 && !dismissed;

  useEffect(() => {
    if (!shouldShow) return;
    const update = () => {
      const hours = Math.max(0, Math.floor(trialDaysLeft * 24));
      const mins = Math.max(0, Math.floor((trialDaysLeft * 24 * 60) % 60));
      setTimeLeft(`${hours}h ${mins}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [shouldShow, trialDaysLeft]);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden bg-gradient-to-r from-amber-500/90 via-orange-500/90 to-amber-500/90 text-white"
        >
          <div className="flex items-center justify-between gap-2 px-4 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="w-4 h-4 shrink-0 animate-pulse" />
              <p className="text-[11px] font-bold truncate">
                {t("trialBanner.expiringSoon", "Trial ending soon!")} 
                <span className="mx-1 font-mono tabular-nums">{timeLeft}</span>
                {t("trialBanner.remaining", "remaining")}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => navigate("/pricing-demo")}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-[10px] font-bold transition-colors"
              >
                <Crown className="w-3 h-3" />
                {t("trialBanner.subscribe", "Subscribe Now")}
              </button>
              <button
                onClick={() => setDismissed(true)}
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
