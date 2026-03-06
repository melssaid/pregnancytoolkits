import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Sparkles, Check, Crown } from "lucide-react";

export function PricingBanner() {
  const { t } = useTranslation();

  const features = [
    t("pricing.feature1"),
    t("pricing.feature2"),
    t("pricing.feature3"),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-card via-card to-primary/[0.04] dark:to-primary/[0.06]"
      style={{
        boxShadow: '0 4px 24px -6px hsl(340 65% 52% / 0.1), 0 1px 4px -1px hsl(25 20% 18% / 0.05)',
      }}
    >
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />

      <div className="p-4 sm:p-5">
        {/* Header row */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/8 border border-primary/15 flex items-center justify-center">
            <Crown className="w-4.5 h-4.5 text-primary" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">{t("pricing.title")}</h3>
              <span className="text-[10px] font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded-full">
                {t("pricing.badge")}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{t("pricing.subtitle")}</p>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Monthly */}
          <div className="relative rounded-xl border border-border/60 bg-muted/20 p-3 text-center">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {t("pricing.monthly")}
            </p>
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-xl font-extrabold text-foreground">$2.99</span>
              <span className="text-[10px] text-muted-foreground">/{t("pricing.mo")}</span>
            </div>
          </div>

          {/* Yearly — highlighted */}
          <div className="relative rounded-xl border border-primary/30 bg-primary/[0.06] p-3 text-center">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <span className="text-[9px] font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {t("pricing.save")}
              </span>
            </div>
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1 mt-1">
              {t("pricing.yearly")}
            </p>
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-xl font-extrabold text-foreground">$19.99</span>
              <span className="text-[10px] text-muted-foreground">/{t("pricing.yr")}</span>
            </div>
            <p className="text-[10px] text-primary font-medium mt-0.5">
              $1.67/{t("pricing.mo")}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-1.5 mb-3">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 text-primary" strokeWidth={3} />
              </div>
              <span className="text-xs text-foreground leading-snug">{feature}</span>
            </div>
          ))}
        </div>

        {/* Trial CTA */}
        <div className="text-center">
          <p className="text-[11px] text-muted-foreground">
            {t("pricing.trialNote")}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
