import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Sparkles, TrendingUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIUsage } from "@/contexts/AIUsageContext";

interface TrialExpiredOverlayProps {
  onClose?: () => void;
}

export function TrialExpiredOverlay({ onClose }: TrialExpiredOverlayProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { used } = useAIUsage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-sm bg-card rounded-3xl border border-border shadow-2xl overflow-hidden"
      >
        {/* Header gradient */}
        <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 pb-4 text-center">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-3"
          >
            <Lock className="w-8 h-8 text-primary" />
          </motion.div>
          <h2 className="text-lg font-extrabold text-foreground">
            {t("trialExpired.title", "Your trial has ended")}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {t("trialExpired.subtitle", "You've experienced the power of AI")}
          </p>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 space-y-3">
          {used > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/[0.04] border border-primary/10">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {t("trialExpired.usedAnalyses", { count: used })}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {t("trialExpired.duringTrial", "during your trial period")}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/50">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {t("trialExpired.premiumBenefit", "60 analyses/month")}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {t("trialExpired.premiumDesc", "Unlock all 42+ AI tools")}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 space-y-2">
          <Button
            onClick={() => navigate("/pricing-demo")}
            size="lg"
            className="w-full h-11 text-[13px] font-bold rounded-2xl shadow-lg shadow-primary/20 gap-1.5"
          >
            <Crown className="w-4 h-4" />
            {t("trialExpired.cta", "View Premium Plans")}
          </Button>
          <button
            onClick={onClose}
            className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground py-2 transition-colors"
          >
            {t("trialExpired.dismiss", "Maybe later")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
