import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Sparkles, Check, Crown, Star, Shield, Zap, ArrowRight, Gift } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEOHead } from "@/components/SEOHead";

// ═══════════════════════════════════════════════════════════════
// VARIANT A — Compact Elegant (Current improved)
// ═══════════════════════════════════════════════════════════════
function VariantA() {
  const { t } = useTranslation();
  const features = [t("pricing.feature1"), t("pricing.feature2"), t("pricing.feature3")];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-primary/15 bg-card"
      style={{ boxShadow: '0 4px 24px -6px hsl(340 65% 52% / 0.1)' }}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />
      <div className="p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/8 border border-primary/15 flex items-center justify-center">
            <Crown className="w-4.5 h-4.5 text-primary" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">{t("pricing.title")}</h3>
              <span className="text-[10px] font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded-full">{t("pricing.badge")}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{t("pricing.subtitle")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-center">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t("pricing.monthly")}</p>
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-xl font-extrabold text-foreground">$2.99</span>
              <span className="text-[10px] text-muted-foreground">/{t("pricing.mo")}</span>
            </div>
          </div>
          <div className="relative rounded-xl border border-primary/30 bg-primary/[0.06] p-3 text-center">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <span className="text-[9px] font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />{t("pricing.save")}
              </span>
            </div>
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1 mt-1">{t("pricing.yearly")}</p>
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-xl font-extrabold text-foreground">$19.99</span>
              <span className="text-[10px] text-muted-foreground">/{t("pricing.yr")}</span>
            </div>
            <p className="text-[10px] text-primary font-medium mt-0.5">$1.67/{t("pricing.mo")}</p>
          </div>
        </div>

        <div className="space-y-1.5 mb-3">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 text-primary" strokeWidth={3} />
              </div>
              <span className="text-xs text-foreground leading-snug">{f}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground text-center">{t("pricing.trialNote")}</p>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// VARIANT B — Glassmorphism Card with CTA Button
// ═══════════════════════════════════════════════════════════════
function VariantB() {
  const { t } = useTranslation();
  const features = [t("pricing.feature1"), t("pricing.feature2"), t("pricing.feature3")];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/[0.03]"
      style={{ boxShadow: '0 8px 32px -8px hsl(340 65% 52% / 0.15), 0 2px 8px -2px hsl(25 20% 18% / 0.06)' }}
    >
      {/* Decorative background circles */}
      <div className="absolute -top-12 -end-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
      <div className="absolute -bottom-8 -start-8 w-24 h-24 bg-accent/5 rounded-full blur-2xl" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
              <Star className="w-5 h-5 text-primary-foreground" strokeWidth={2} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{t("pricing.title")}</h3>
              <p className="text-[11px] text-muted-foreground">{t("pricing.subtitle")}</p>
            </div>
          </div>
        </div>

        {/* Trial highlight */}
        <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-primary/[0.06] border border-primary/10">
          <Gift className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={2} />
          <span className="text-xs font-semibold text-foreground">{t("pricing.trialNote")}</span>
        </div>

        {/* Pricing options */}
        <div className="space-y-2 mb-4">
          {/* Monthly */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-border/60" />
              <span className="text-sm font-semibold text-foreground">{t("pricing.monthly")}</span>
            </div>
            <div className="text-end">
              <span className="text-lg font-extrabold text-foreground">$2.99</span>
              <span className="text-[10px] text-muted-foreground ms-0.5">/{t("pricing.mo")}</span>
            </div>
          </div>
          {/* Yearly */}
          <div className="flex items-center justify-between p-3 rounded-xl border-2 border-primary/30 bg-primary/[0.04] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-foreground">{t("pricing.yearly")}</span>
                  <span className="text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">{t("pricing.save")}</span>
                </div>
                <span className="text-[10px] text-primary font-medium">$1.67/{t("pricing.mo")}</span>
              </div>
            </div>
            <div className="text-end">
              <span className="text-lg font-extrabold text-foreground">$19.99</span>
              <span className="text-[10px] text-muted-foreground ms-0.5">/{t("pricing.yr")}</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-foreground/80 bg-muted/30 px-2.5 py-1 rounded-full">
              <Check className="w-3 h-3 text-primary" strokeWidth={2.5} />
              {f}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary/85 text-primary-foreground font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 whitespace-normal leading-normal">
          <Zap className="w-4 h-4" strokeWidth={2.5} />
          {t("pricing.badge")} — {t("pricing.trialNote")}
        </button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// VARIANT C — Minimal Horizontal with Swipeable Plans
// ═══════════════════════════════════════════════════════════════
function VariantC() {
  const { t } = useTranslation();
  const features = [t("pricing.feature1"), t("pricing.feature2"), t("pricing.feature3")];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-card border border-border/40"
      style={{ boxShadow: '0 2px 12px -4px hsl(25 20% 18% / 0.08)' }}
    >
      {/* Premium gradient header */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 px-4 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
            <h3 className="text-sm font-bold text-primary-foreground">{t("pricing.title")}</h3>
          </div>
          <span className="text-[10px] font-bold bg-white/20 backdrop-blur-sm text-primary-foreground px-2.5 py-1 rounded-full">
            {t("pricing.badge")}
          </span>
        </div>
        <p className="text-[11px] text-primary-foreground/80 mt-1">{t("pricing.subtitle")}</p>
      </div>

      <div className="p-4">
        {/* Pricing side by side */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 rounded-xl bg-muted/20 border border-border/40">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t("pricing.monthly")}</p>
            <p className="text-2xl font-black text-foreground mt-1">$2.99</p>
            <p className="text-[10px] text-muted-foreground">/{t("pricing.mo")}</p>
            <button className="mt-2 w-full py-1.5 rounded-lg border border-primary/30 text-primary text-[11px] font-semibold hover:bg-primary/5 transition-colors whitespace-normal leading-normal">
              {t("pricing.monthly")}
            </button>
          </div>
          <div className="text-center p-3 rounded-xl bg-primary/[0.05] border-2 border-primary/25 relative">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <span className="text-[8px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Star className="w-2 h-2" fill="currentColor" />{t("pricing.save")}
              </span>
            </div>
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mt-1">{t("pricing.yearly")}</p>
            <p className="text-2xl font-black text-foreground mt-1">$19.99</p>
            <p className="text-[10px] text-muted-foreground">/{t("pricing.yr")}</p>
            <button className="mt-2 w-full py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold hover:bg-primary/90 transition-colors whitespace-normal leading-normal">
              {t("pricing.yearly")}
            </button>
          </div>
        </div>

        {/* Features list */}
        <div className="space-y-2">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-primary" strokeWidth={3} />
              </div>
              <span className="text-xs text-foreground">{f}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-border/30 text-center">
          <p className="text-[10px] text-muted-foreground">{t("pricing.trialNote")}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DEMO PAGE
// ═══════════════════════════════════════════════════════════════
const PricingDemo = () => {
  return (
    <Layout>
      <SEOHead />
      <section className="pt-6 pb-12">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-md mx-auto space-y-8">
          <h1 className="text-xl font-bold text-foreground text-center">Pricing Variants</h1>

          {/* Variant A */}
          <div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">A — Compact Elegant</h2>
            <VariantA />
          </div>

          {/* Variant B */}
          <div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">B — Glassmorphism + CTA</h2>
            <VariantB />
          </div>

          {/* Variant C */}
          <div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">C — Premium Header</h2>
            <VariantC />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PricingDemo;
