import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Sparkles, Brain, Shield, Heart, Crown, X, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { requestPurchase, isDigitalGoodsAvailable, type PlanType } from "@/lib/googlePlayBilling";
import { useAIUsage } from "@/contexts/AIUsageContext";
import { setTier as qmSetTier } from "@/services/smartEngine/quotaManager";

interface PaywallSheetProps {
  open: boolean;
  onClose: () => void;
  toolName?: string;
}

const benefits = [
  { icon: Brain, key: "allAITools" },
  { icon: Sparkles, key: "dailyAnalyses" },
  { icon: Heart, key: "personalizedInsights" },
  { icon: Shield, key: "fullAccess" },
];

export function PaywallSheet({ open, onClose, toolName }: PaywallSheetProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { tier } = useSubscriptionStatus();
  const { refresh: refreshAIUsage } = useAIUsage();
  const showTrialOffer = tier === "free";
  const isAr = i18n.language === "ar";
  const canPurchase = isDigitalGoodsAvailable();
  const [purchasing, setPurchasing] = useState(false);

  const handleDirectPurchase = async (plan: PlanType = "yearly") => {
    if (purchasing) return;

    if (!canPurchase) {
      window.open("https://play.google.com/store/apps/details?id=app.pregnancytoolkits.android", "_blank");
      toast.info(isAr ? "الدفع متاح فقط داخل التطبيق" : "Payment is only available in the app");
      onClose();
      return;
    }

    setPurchasing(true);

    const sent = await requestPurchase(
      plan,
      async () => {
        qmSetTier("premium");
        refreshAIUsage();
        window.dispatchEvent(new CustomEvent("subscription-activated", { detail: { plan } }));
        setPurchasing(false);
        onClose();
      },
      (msg) => {
        setPurchasing(false);
        if (msg) {
          toast.error(
            msg.includes("clientAppUnavailable")
              ? (isAr ? "أعد تشغيل التطبيق وحاول مرة أخرى" : "Restart the app and try again")
              : msg,
            { duration: 5000 }
          );
        }
      },
    );

    if (!sent) {
      setPurchasing(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed bottom-0 inset-x-0 z-[101] max-h-[85vh] overflow-hidden"
          >
            <div className="bg-card rounded-t-3xl shadow-2xl border-t border-border/50 overflow-hidden">
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
              </div>

              <button
                onClick={onClose}
                className="absolute top-3 end-4 w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors z-10"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="px-6 pb-8 pt-2 space-y-5">
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                    className="relative"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
                      <Crown className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <motion.div
                      className="absolute -inset-2 rounded-3xl border-2 border-primary/20"
                      animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>

                  <div className="text-center space-y-1.5">
                    <h2 className="text-lg font-bold text-foreground">{t('paywall.title')}</h2>
                    <p className="text-sm text-muted-foreground">
                      {toolName ? t('paywall.toolLocked', { tool: toolName }) : t('paywall.subtitle')}
                    </p>
                  </div>
                </div>

                {showTrialOffer && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.18 }}
                    className="relative rounded-2xl overflow-hidden border border-primary/25"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.08] via-primary/[0.04] to-primary/[0.08]" />
                    <div className="relative px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20">
                        <Gift className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">{t('paywall.trialTitle')}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{t('paywall.trialDesc')}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2.5">
                  {benefits.map((benefit, i) => (
                    <motion.div
                      key={benefit.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {t(`paywall.benefits.${benefit.key}`)}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <Button
                    onClick={() => handleDirectPurchase("yearly")}
                    disabled={purchasing}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold text-base shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-shadow"
                  >
                    {purchasing ? (
                      <Loader2 className="w-4 h-4 animate-spin me-2" />
                    ) : (
                      <Sparkles className="w-4 h-4 me-2" />
                    )}
                    {showTrialOffer ? t('paywall.startTrial') : t('paywall.subscribeButton')}
                  </Button>
                  <button
                    onClick={onClose}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    {t('paywall.maybeLater')}
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
