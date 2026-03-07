import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Check, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { requestPurchase, isNativeApp, type PlanType } from "@/lib/googlePlayBilling";

export default function PricingDemo() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [selected, setSelected] = useState<PlanType>("yearly");

  const handleSubscribe = () => {
    const sent = requestPurchase(selected);
    if (!sent) {
      toast.info(t("pricing.trialNote"));
    }
  };

  const features = [
    t("pricing.feature1"),
    t("pricing.feature2"),
    t("pricing.feature3"),
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-sm font-bold text-foreground">{t("pricing.title")}</h1>
        </div>
      </div>

      <div className="px-5 py-8 max-w-md mx-auto space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{t("pricing.title")}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t("pricing.subtitle")}</p>
        </motion.div>

        {/* Plan Selector */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-3"
        >
          {/* Yearly */}
          <button
            onClick={() => setSelected("yearly")}
            className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-start ${
              selected === "yearly"
                ? "border-primary bg-primary/[0.04] shadow-[0_0_0_1px_hsl(var(--primary)/0.1)]"
                : "border-border/40 bg-card/50 hover:border-border/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{t("pricing.yearly")}</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-accent/15 text-accent-foreground">
                    {t("pricing.save")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  $1.67/{t("pricing.mo")}
                </p>
              </div>
              <div className="text-end">
                <span className="text-lg font-bold text-foreground">$19.99</span>
                <span className="text-xs text-muted-foreground">/{t("pricing.yr")}</span>
              </div>
            </div>
            {/* Selection indicator */}
            <div className={`mt-2 flex items-center justify-center w-5 h-5 rounded-full border-2 ms-auto transition-colors ${
              selected === "yearly" ? "border-primary bg-primary" : "border-muted-foreground/30"
            }`}>
              {selected === "yearly" && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
            </div>
          </button>

          {/* Monthly */}
          <button
            onClick={() => setSelected("monthly")}
            className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-start ${
              selected === "monthly"
                ? "border-primary bg-primary/[0.04] shadow-[0_0_0_1px_hsl(var(--primary)/0.1)]"
                : "border-border/40 bg-card/50 hover:border-border/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-foreground">{t("pricing.monthly")}</span>
              </div>
              <div className="text-end">
                <span className="text-lg font-bold text-foreground">$2.99</span>
                <span className="text-xs text-muted-foreground">/{t("pricing.mo")}</span>
              </div>
            </div>
            <div className={`mt-2 flex items-center justify-center w-5 h-5 rounded-full border-2 ms-auto transition-colors ${
              selected === "monthly" ? "border-primary bg-primary" : "border-muted-foreground/30"
            }`}>
              {selected === "monthly" && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
            </div>
          </button>
        </motion.div>

        {/* Features */}
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3 px-1"
        >
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm text-foreground">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-primary" strokeWidth={2.5} />
              </div>
              {f}
            </li>
          ))}
        </motion.ul>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-3"
        >
          <Button
            onClick={handleSubscribe}
            className="w-full h-12 text-sm font-semibold rounded-2xl whitespace-normal leading-normal"
          >
            {t("pricing.badge")}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
            {t("pricing.trialNote")}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
