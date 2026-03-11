import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles, Brain, Shield, Zap, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { requestPurchase, type PlanType } from "@/lib/googlePlayBilling";
import { useNavigate, Link } from "react-router-dom";

const features = [
  { icon: Brain, key: "feature1" },
  { icon: Zap, key: "feature2" },
  { icon: Heart, key: "feature3" },
  { icon: Shield, key: "feature4" },
  { icon: Sparkles, key: "feature5" },
];

export default function PricingDemo() {
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<PlanType>("yearly");
  const isAr = i18n.language === "ar";

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
      className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Subtle background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-[45vh] bg-gradient-to-b from-primary/[0.04] to-transparent" />
        <div className="absolute -top-20 -end-20 w-60 h-60 rounded-full bg-primary/[0.06] blur-[80px]" />
        <div className="absolute bottom-0 -start-20 w-40 h-40 rounded-full bg-primary/[0.04] blur-[60px]" />
      </div>

      {/* Close */}
      <div className="sticky top-0 z-30 px-4 py-3 flex justify-end">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-muted/60 backdrop-blur-sm flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 px-5 pb-6 max-w-md mx-auto w-full flex flex-col justify-between relative z-10">
        {/* Top content */}
        <div>
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center mb-3"
          >
            <motion.div
              className="relative w-[88px] h-[88px] mx-auto mb-4 flex items-center justify-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
            >
              {/* Ripple rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-primary/20"
                  initial={{ scale: 0.5, opacity: 0.6 }}
                  animate={{ scale: [0.5, 1.4], opacity: [0.5, 0] }}
                  transition={{
                    duration: 2.5,
                    delay: i * 0.7,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              ))}
              {/* Breathing aura */}
              <motion.div
                className="absolute w-16 h-16 rounded-full bg-primary/10 blur-lg"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Logo */}
              <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-xl shadow-primary/20 ring-2 ring-primary/15">
                <img
                  src="/logo.webp"
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <h1
              className="text-[20px] font-extrabold text-foreground tracking-tight mb-1 leading-tight"
              style={{ fontFamily: isAr ? "'Almarai', 'Tajawal', sans-serif" : "'Montserrat', sans-serif" }}
            >
              {t("pricing.title")}
            </h1>
            <p
              className="text-[11px] text-muted-foreground leading-relaxed max-w-[240px] mx-auto"
              style={{ fontFamily: isAr ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif" }}
            >
              {t("pricing.subtitle")}
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
            className="grid grid-cols-1 gap-1.5 mb-4"
          >
            {features.map(({ icon: Icon, key }, idx) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: isRTL ? 8 : -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.12 + idx * 0.04 }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-card/60 border border-border/5"
              >
                <div className="w-7 h-7 rounded-md bg-primary/[0.08] flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.8} />
                </div>
                <span
                  className="text-[11px] font-medium text-foreground leading-tight"
                  style={{ fontFamily: isAr ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif" }}
                >
                  {t(`pricing.${key}`)}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-border/40 to-transparent" />
            <Sparkles className="w-2.5 h-2.5 text-primary/20" />
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-border/40 to-transparent" />
          </div>

          {/* Plan cards */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-3"
          >
            {/* Yearly */}
            <button
              onClick={() => setSelected("yearly")}
              className={`w-full px-4 py-4 rounded-2xl border-2 transition-all duration-300 text-start flex items-center gap-3 relative overflow-hidden ${
                selected === "yearly"
                  ? "border-primary bg-primary/[0.04] shadow-[0_0_24px_-6px_hsl(var(--primary)/0.18)]"
                  : "border-border/30 bg-card/60 hover:border-border/50"
              }`}
            >
              {selected === "yearly" && (
                <div className="absolute top-0 end-0 px-2 py-0.5 rounded-es-lg bg-primary">
                  <span
                    className="text-[9px] font-bold text-primary-foreground"
                    style={{ fontFamily: isAr ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif" }}
                  >
                    {t("pricing.bestValue")}
                  </span>
                </div>
              )}

              <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                selected === "yearly" ? "border-primary bg-primary" : "border-muted-foreground/25"
              }`}>
                {selected === "yearly" && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[13px] font-bold text-foreground"
                    style={{ fontFamily: isAr ? "'Almarai', sans-serif" : "'Montserrat', sans-serif" }}
                  >
                    {t("pricing.yearly")}
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 leading-tight">
                    {t("pricing.save")}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  $1.67/{t("pricing.mo")}
                </span>
              </div>

              <div className="text-end shrink-0">
                <span
                  className="text-[20px] font-extrabold text-foreground tabular-nums"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  $19.99
                </span>
                <span className="text-[11px] text-muted-foreground">/{t("pricing.yr")}</span>
              </div>
            </button>

            {/* Monthly */}
            <button
              onClick={() => setSelected("monthly")}
              className={`w-full px-4 py-4 rounded-2xl border-2 transition-all duration-300 text-start flex items-center gap-3 ${
                selected === "monthly"
                  ? "border-primary bg-primary/[0.04] shadow-[0_0_24px_-6px_hsl(var(--primary)/0.18)]"
                  : "border-border/30 bg-card/60 hover:border-border/50"
              }`}
            >
              <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                selected === "monthly" ? "border-primary bg-primary" : "border-muted-foreground/25"
              }`}>
                {selected === "monthly" && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
              </div>

              <div className="flex-1 min-w-0">
                <span
                  className="text-[13px] font-bold text-foreground"
                  style={{ fontFamily: isAr ? "'Almarai', sans-serif" : "'Montserrat', sans-serif" }}
                >
                  {t("pricing.monthly")}
                </span>
              </div>

              <div className="text-end shrink-0">
                <span
                  className="text-[20px] font-extrabold text-foreground tabular-nums"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  $2.99
                </span>
                <span className="text-[11px] text-muted-foreground">/{t("pricing.mo")}</span>
              </div>
            </button>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28 }}
          className="mt-8 space-y-3"
        >
          <Button
            onClick={handleSubscribe}
            size="lg"
            className="w-full h-[52px] text-[14px] font-bold rounded-2xl shadow-lg shadow-primary/20 whitespace-normal leading-snug"
            style={{ fontFamily: isAr ? "'Almarai', sans-serif" : "'Montserrat', sans-serif" }}
          >
            {t("pricing.cta")}
          </Button>

          <p
            className="text-center text-[11px] text-muted-foreground leading-snug"
            style={{ fontFamily: isAr ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif" }}
          >
            {t("pricing.ctaSub", { price, period })}
          </p>

          <p className="text-center text-[10px] text-muted-foreground/50 leading-relaxed">
            {t("pricing.autoRenew")}
          </p>

          <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
            <button
              onClick={() => toast.info(t("pricing.restore"))}
              className="text-[11px] text-primary/70 hover:text-primary transition-colors"
            >
              {t("pricing.restore")}
            </button>
            <span className="text-muted-foreground/20">·</span>
            <span className="text-[10px] text-muted-foreground/50 text-center">
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
