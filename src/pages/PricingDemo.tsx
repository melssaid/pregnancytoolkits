import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles, X, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { requestPurchase, type PlanType } from "@/lib/googlePlayBilling";
import { useNavigate, Link } from "react-router-dom";

export default function PricingDemo() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<PlanType>("yearly");

  const handleSubscribe = () => {
    const sent = requestPurchase(selected);
    if (!sent) {
      toast.info(t("pricing.trialNote"));
    }
  };

  const price = selected === "yearly" ? "$19.99" : "$2.99";
  const period = selected === "yearly" ? t("pricing.yr") : t("pricing.mo");

  const features = [
    { icon: Sparkles, text: t("pricing.feature1") },
    { icon: Zap, text: t("pricing.feature2") },
    { icon: Shield, text: t("pricing.feature3") },
    { icon: Crown, text: t("pricing.feature4") },
    { icon: Check, text: t("pricing.feature5") },
  ];

  return (
    <div
      className="min-h-[100dvh] bg-gradient-to-b from-background via-background to-primary/5 flex flex-col"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Close button */}
      <div className="sticky top-0 z-30 px-4 py-3 flex justify-end">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-muted/80 backdrop-blur-sm flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 px-5 pb-6 max-w-md mx-auto w-full flex flex-col">
        {/* Hero — compact */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-2 mb-5"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Crown className="w-7 h-7 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">
            {t("pricing.title")}
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[240px] mx-auto">
            {t("pricing.subtitle")}
          </p>
        </motion.div>

        {/* Features — compact grid */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="space-y-2 mb-5"
        >
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <f.icon className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
              </div>
              <span className="text-xs text-foreground leading-snug break-words">{f.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Plan Selector — fixed height cards */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="space-y-2.5 mb-5"
        >
          {/* Yearly */}
          <button
            onClick={() => setSelected("yearly")}
            className={`w-full h-[72px] px-4 rounded-2xl border-2 transition-all duration-300 text-start relative overflow-hidden flex items-center ${
              selected === "yearly"
                ? "border-primary bg-primary/[0.06] shadow-[0_0_16px_-4px_hsl(var(--primary)/0.2)]"
                : "border-border/40 bg-card/60 hover:border-border/60"
            }`}
          >
            {/* Radio */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors me-3 ${
              selected === "yearly" ? "border-primary bg-primary" : "border-muted-foreground/30"
            }`}>
              {selected === "yearly" && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{t("pricing.yearly")}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground leading-none">
                  {t("pricing.save")}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">$1.67/{t("pricing.mo")}</span>
            </div>

            <div className="text-end shrink-0">
              <span className="text-lg font-bold text-foreground">$19.99</span>
              <span className="text-[10px] text-muted-foreground">/{t("pricing.yr")}</span>
            </div>
          </button>

          {/* Monthly */}
          <button
            onClick={() => setSelected("monthly")}
            className={`w-full h-[72px] px-4 rounded-2xl border-2 transition-all duration-300 text-start relative flex items-center ${
              selected === "monthly"
                ? "border-primary bg-primary/[0.06] shadow-[0_0_16px_-4px_hsl(var(--primary)/0.2)]"
                : "border-border/40 bg-card/60 hover:border-border/60"
            }`}
          >
            {/* Radio */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors me-3 ${
              selected === "monthly" ? "border-primary bg-primary" : "border-muted-foreground/30"
            }`}>
              {selected === "monthly" && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-foreground">{t("pricing.monthly")}</span>
            </div>

            <div className="text-end shrink-0">
              <span className="text-lg font-bold text-foreground">$2.99</span>
              <span className="text-[10px] text-muted-foreground">/{t("pricing.mo")}</span>
            </div>
          </button>
        </motion.div>

        {/* Spacer */}
        <div className="flex-1 min-h-4" />

        {/* CTA — fixed at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-2"
        >
          <Button
            onClick={handleSubscribe}
            className="w-full h-13 text-sm font-bold rounded-2xl shadow-lg shadow-primary/20 whitespace-normal leading-snug"
          >
            {t("pricing.cta")}
          </Button>

          <p className="text-center text-[10px] text-muted-foreground leading-snug">
            {t("pricing.ctaSub", { price, period })}
          </p>

          <p className="text-center text-[9px] text-muted-foreground/60 leading-snug">
            {t("pricing.autoRenew")}
          </p>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => toast.info(t("pricing.restore"))}
              className="text-[10px] text-primary/70 hover:text-primary transition-colors"
            >
              {t("pricing.restore")}
            </button>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-[10px] text-muted-foreground/60 break-words text-center">
              {t("pricing.termsPrefix")}{" "}
              <Link to="/terms" className="underline hover:text-foreground transition-colors">
                {t("layout.footer.terms")}
              </Link>{" "}
              {t("pricing.and")}{" "}
              <Link to="/privacy" className="underline hover:text-foreground transition-colors">
                {t("layout.footer.privacy")}
              </Link>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
