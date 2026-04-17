import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Sparkles, Brain, Shield, Heart, Crown, X, Gift, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { requestPurchase, isDigitalGoodsAvailable, type PlanType } from "@/lib/googlePlayBilling";
import { useAIUsage } from "@/contexts/AIUsageContext";
import { setTier as qmSetTier } from "@/services/smartEngine/quotaManager";
import { usePlayPrices } from "@/hooks/usePlayPrices";
import { PriceSkeleton } from "@/components/billing/PriceSkeleton";

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
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("yearly");
  const prices = usePlayPrices();

  const handleDirectPurchase = async () => {
    if (purchasing) return;

    if (!canPurchase) {
      window.open("https://play.google.com/store/apps/details?id=app.pregnancytoolkits.android", "_blank");
      toast.info(isAr ? "الدفع متاح فقط داخل التطبيق" : "Payment is only available in the app");
      onClose();
      return;
    }

    setPurchasing(true);

    const sent = await requestPurchase(
      selectedPlan,
      async () => {
        // Instant celebratory toast
        toast.success(
          isAr ? '🎉 تم تفعيل اشتراككِ بنجاح!' : '🎉 Subscription activated!',
          {
            description: isAr ? 'تم منحكِ 60 نقطة — جميع الأدوات مفتوحة' : '60 credits granted — all tools unlocked',
            duration: 4000,
          }
        );
        qmSetTier("premium");
        refreshAIUsage();
        window.dispatchEvent(new CustomEvent("subscription-activated", { detail: { plan: selectedPlan } }));
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

  const priceDisplay = selectedPlan === "yearly" ? prices.yearly.display : prices.monthly.display;
  const period = selectedPlan === "yearly" ? t("pricing.yr") : t("pricing.mo");

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
            className="fixed bottom-0 inset-x-0 z-[101] max-h-[90vh] overflow-y-auto"
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

              <div className="px-6 pb-8 pt-2 space-y-4">
                {/* Header */}
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                    className="relative"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
                      <Crown className="w-7 h-7 text-primary-foreground" />
                    </div>
                  </motion.div>

                  <div className="text-center space-y-1">
                    <h2 className="text-lg font-bold text-foreground">{t('paywall.title')}</h2>
                    <p className="text-xs text-muted-foreground">
                      {toolName ? t('paywall.toolLocked', { tool: toolName }) : t('paywall.subtitle')}
                    </p>
                  </div>
                </div>

                {/* Plan Selection Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="grid grid-cols-2 gap-2.5"
                >
                  {/* Yearly */}
                  <button
                    onClick={() => setSelectedPlan("yearly")}
                    className={`relative flex flex-col items-center text-center px-2 py-3 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                      selectedPlan === "yearly"
                        ? "border-primary bg-primary/[0.04] shadow-[0_0_16px_-4px_hsl(var(--primary)/0.2)]"
                        : "border-border/30 bg-card/60 hover:border-border/50"
                    }`}
                  >
                    <div className="absolute -top-px -end-px">
                      <div className="px-1.5 py-0.5 rounded-es-lg rounded-se-[12px] bg-gradient-to-r from-primary to-primary/80">
                        <span className="text-[7px] font-bold text-primary-foreground">{t("pricing.bestValue")}</span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mb-1.5 transition-colors ${
                      selectedPlan === "yearly" ? "border-primary bg-primary" : "border-muted-foreground/25"
                    }`}>
                      {selectedPlan === "yearly" && <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />}
                    </div>
                    <span className="text-[10px] font-bold text-foreground mb-0.5">{t("pricing.yearly")}</span>
                    {prices.loading ? (
                      <PriceSkeleton width={60} height={18} />
                    ) : (
                      <span className="text-lg font-extrabold text-foreground tabular-nums leading-none">
                        {prices.yearly.display}
                      </span>
                    )}
                    <span className="text-[9px] text-muted-foreground mt-0.5">/{t("pricing.yr")}</span>
                    <div className="mt-1.5 flex flex-col items-center gap-0.5">
                      {prices.loading ? (
                        <PriceSkeleton width={48} height={9} />
                      ) : (
                        <span className="text-[8px] text-muted-foreground">{prices.monthlyEquivalent}/{t("pricing.mo")}</span>
                      )}
                      <motion.span
                        className="text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        animate={{ scale: [1, 1.06, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        {t("pricing.save")}
                      </motion.span>
                    </div>
                  </button>

                  {/* Monthly */}
                  <button
                    onClick={() => setSelectedPlan("monthly")}
                    className={`relative flex flex-col items-center text-center px-2 py-3 rounded-2xl border-2 transition-all duration-300 ${
                      selectedPlan === "monthly"
                        ? "border-primary bg-primary/[0.04] shadow-[0_0_16px_-4px_hsl(var(--primary)/0.2)]"
                        : "border-border/30 bg-card/60 hover:border-border/50"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mb-1.5 transition-colors ${
                      selectedPlan === "monthly" ? "border-primary bg-primary" : "border-muted-foreground/25"
                    }`}>
                      {selectedPlan === "monthly" && <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />}
                    </div>
                    <span className="text-[10px] font-bold text-foreground mb-0.5">{t("pricing.monthly")}</span>
                    {prices.loading ? (
                      <PriceSkeleton width={56} height={18} />
                    ) : (
                      <span className="text-lg font-extrabold text-foreground tabular-nums leading-none">
                        {prices.monthly.display}
                      </span>
                    )}
                    <span className="text-[9px] text-muted-foreground mt-0.5">/{t("pricing.mo")}</span>
                  </button>
                </motion.div>

                {/* Benefits */}
                <div className="space-y-2">
                  {benefits.map((benefit, i) => (
                    <motion.div
                      key={benefit.key}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.18 + i * 0.06 }}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/30"
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        {t(`paywall.benefits.${benefit.key}`)}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <Button
                    onClick={handleDirectPurchase}
                    disabled={purchasing}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-shadow"
                  >
                    {purchasing ? (
                      <Loader2 className="w-4 h-4 animate-spin me-2" />
                    ) : (
                      <Sparkles className="w-4 h-4 me-2" />
                    )}
                    {showTrialOffer ? t('paywall.startTrial') : t('paywall.subscribeButton')}
                  </Button>
                  {prices.isLocal && (
                    <p className="text-center text-[10px] text-muted-foreground">
                      {t("pricing.ctaSub", { price: priceDisplay, period })}
                    </p>
                  )}
                  <button
                    onClick={onClose}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
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
