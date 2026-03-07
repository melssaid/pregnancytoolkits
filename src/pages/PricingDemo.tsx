import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Check, Crown, X, Sparkles } from "lucide-react";
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

  return (
    <div
      className="min-h-[100dvh] bg-gradient-to-b from-background via-background to-primary/5 flex flex-col"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Close */}
      <div className="sticky top-0 z-30 px-4 py-3 flex justify-end">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-muted/80 backdrop-blur-sm flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 px-5 pb-6 max-w-md mx-auto w-full flex flex-col justify-between">
        {/* Top content */}
        <div>
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-6"
          >
            <div className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/25">
              <Crown className="w-8 h-8 text-primary-foreground" strokeWidth={1.5} />
            </div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight mb-1.5">
              {t("pricing.title")}
            </h1>
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[260px] mx-auto break-words">
              {t("pricing.subtitle")}
            </p>
          </motion.div>

          {/* Feature badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15">
              <Sparkles className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
              <span className="text-[12px] font-semibold text-foreground break-words">{t("pricing.feature1")}</span>
            </div>
          </motion.div>

          {/* Plan cards */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14 }}
            className="space-y-3"
          >
            {/* Yearly */}
            <button
              onClick={() => setSelected("yearly")}
              className={`w-full px-4 py-4 rounded-2xl border-2 transition-all duration-300 text-start flex items-center gap-3 ${
                selected === "yearly"
                  ? "border-primary bg-primary/[0.06] shadow-[0_0_20px_-4px_hsl(var(--primary)/0.2)]"
                  : "border-border/40 bg-card/60 hover:border-border/60"
              }`}
            >
              <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                selected === "yearly" ? "border-primary bg-primary" : "border-muted-foreground/30"
              }`}>
                {selected === "yearly" && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-bold text-foreground">{t("pricing.yearly")}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground leading-tight">
                    {t("pricing.save")}
                  </span>
                </div>
                <span className="text-[12px] text-muted-foreground mt-0.5 block">$1.67/{t("pricing.mo")}</span>
              </div>

              <div className="text-end shrink-0">
                <span className="text-[20px] font-extrabold text-foreground tabular-nums">$19.99</span>
                <span className="text-[11px] text-muted-foreground">/{t("pricing.yr")}</span>
              </div>
            </button>

            {/* Monthly */}
            <button
              onClick={() => setSelected("monthly")}
              className={`w-full px-4 py-4 rounded-2xl border-2 transition-all duration-300 text-start flex items-center gap-3 ${
                selected === "monthly"
                  ? "border-primary bg-primary/[0.06] shadow-[0_0_20px_-4px_hsl(var(--primary)/0.2)]"
                  : "border-border/40 bg-card/60 hover:border-border/60"
              }`}
            >
              <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                selected === "monthly" ? "border-primary bg-primary" : "border-muted-foreground/30"
              }`}>
                {selected === "monthly" && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-bold text-foreground">{t("pricing.monthly")}</span>
              </div>

              <div className="text-end shrink-0">
                <span className="text-[20px] font-extrabold text-foreground tabular-nums">$2.99</span>
                <span className="text-[11px] text-muted-foreground">/{t("pricing.mo")}</span>
              </div>
            </button>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          className="mt-8 space-y-2.5"
        >
          <Button
            onClick={handleSubscribe}
            size="lg"
            className="w-full h-[52px] text-[14px] font-bold rounded-2xl shadow-lg shadow-primary/25 whitespace-normal leading-snug"
          >
            {t("pricing.cta")}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground leading-snug">
            {t("pricing.ctaSub", { price, period })}
          </p>

          <p className="text-center text-[10px] text-muted-foreground/60 leading-relaxed break-words">
            {t("pricing.autoRenew")}
          </p>

          <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
            <button
              onClick={() => toast.info(t("pricing.restore"))}
              className="text-[11px] text-primary/70 hover:text-primary transition-colors"
            >
              {t("pricing.restore")}
            </button>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-[11px] text-muted-foreground/60 break-words text-center">
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
