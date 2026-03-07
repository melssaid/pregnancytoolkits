import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles, X, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { requestPurchase, isNativeApp, type PlanType } from "@/lib/googlePlayBilling";
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
      className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex flex-col"
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

      <div className="flex-1 px-5 pb-8 max-w-md mx-auto w-full flex flex-col">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 mb-8"
        >
          <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Crown className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {t("pricing.title")}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px] mx-auto">
            {t("pricing.subtitle")}
          </p>
        </motion.div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-3 mb-8"
        >
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <f.icon className="w-4 h-4 text-primary" strokeWidth={2} />
              </div>
              <span className="text-sm text-foreground leading-snug">{f.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Plan Selector */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-3 mb-6"
        >
          {/* Yearly — Highlighted */}
          <button
            onClick={() => setSelected("yearly")}
            className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-start relative overflow-hidden ${
              selected === "yearly"
                ? "border-primary bg-primary/[0.06] shadow-[0_0_20px_-4px_hsl(var(--primary)/0.2)]"
                : "border-border/40 bg-card/60 hover:border-border/60"
            }`}
          >
            {/* Best Value badge */}
            <div className="absolute top-0 end-0">
              <div className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-es-xl rounded-se-xl">
                {t("pricing.bestValue")}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-bold text-foreground">
                  {t("pricing.yearly")}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    $1.67/{t("pricing.mo")}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                    {t("pricing.save")}
                  </span>
                </div>
              </div>
              <div className="text-end">
                <span className="text-xl font-bold text-foreground">$19.99</span>
                <span className="text-xs text-muted-foreground">/{t("pricing.yr")}</span>
              </div>
            </div>

            {/* Radio indicator */}
            <div className={`absolute top-4 start-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              selected === "yearly" ? "border-primary bg-primary" : "border-muted-foreground/30"
            }`}>
              {selected === "yearly" && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
            </div>
          </button>

          {/* Monthly */}
          <button
            onClick={() => setSelected("monthly")}
            className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-start relative ${
              selected === "monthly"
                ? "border-primary bg-primary/[0.06] shadow-[0_0_20px_-4px_hsl(var(--primary)/0.2)]"
                : "border-border/40 bg-card/60 hover:border-border/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-foreground">
                  {t("pricing.monthly")}
                </span>
              </div>
              <div className="text-end">
                <span className="text-xl font-bold text-foreground">$2.99</span>
                <span className="text-xs text-muted-foreground">/{t("pricing.mo")}</span>
              </div>
            </div>

            <div className={`absolute top-4 start-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              selected === "monthly" ? "border-primary bg-primary" : "border-muted-foreground/30"
            }`}>
              {selected === "monthly" && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
            </div>
          </button>
        </motion.div>

        {/* Spacer to push CTA to bottom */}
        <div className="flex-1" />

        {/* CTA Section — pinned to bottom */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="space-y-3"
        >
          <Button
            onClick={handleSubscribe}
            className="w-full h-14 text-base font-bold rounded-2xl shadow-lg shadow-primary/20 whitespace-normal leading-normal"
          >
            {t("pricing.cta")}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
            {t("pricing.ctaSub", { price, period })}
          </p>

          <p className="text-center text-[10px] text-muted-foreground/70 leading-relaxed">
            {t("pricing.autoRenew")}
          </p>

          {/* Restore + Terms */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={() => toast.info(t("pricing.restore"))}
              className="text-[11px] text-primary/70 hover:text-primary transition-colors"
            >
              {t("pricing.restore")}
            </button>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-[11px] text-muted-foreground/60">
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
