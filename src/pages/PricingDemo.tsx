import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles, Brain, Shield, Zap, Heart, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { requestPurchase, isDigitalGoodsAvailable, type PlanType } from "@/lib/googlePlayBilling";
import { useNavigate, Link } from "react-router-dom";
import pricingLogo from "@/assets/pricing-logo.webp";

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
  const [selected, setSelected] = useState<PlanType>("monthly");
  const isAr = i18n.language === "ar";
  const canPurchase = isDigitalGoodsAvailable();

  const handleSubscribe = async () => {
    console.log('[PricingDemo] canPurchase:', canPurchase, 'getDigitalGoodsService:', typeof window.getDigitalGoodsService);
    if (!canPurchase) {
      // In non-TWA environment, open Play Store listing
      window.open("https://play.google.com/store/apps/details?id=app.pregnancytoolkits.android", "_blank");
      return;
    }
    const sent = await requestPurchase(
      selected,
      () => {
        toast.success(t("pricing.subscriptionSuccess") || "Subscription activated!");
        navigate("/");
      },
      (msg) => toast.error(msg),
    );
    if (!sent) {
      toast.info(t("pricing.purchaseCancelled") || "Purchase was cancelled");
    }
  };

  const price = selected === "yearly" ? "$19.99" : "$2.99";
  const period = selected === "yearly" ? t("pricing.yr") : t("pricing.mo");

  return (
    <div
      className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-[45vh] bg-gradient-to-b from-primary/[0.04] to-transparent" />
        <div className="absolute -top-20 -end-20 w-60 h-60 rounded-full bg-primary/[0.06] blur-[80px]" />
        <div className="absolute bottom-0 -start-20 w-40 h-40 rounded-full bg-primary/[0.04] blur-[60px]" />
      </div>

      {/* Close */}
      <div className="sticky top-0 z-30 px-4 py-3 flex justify-end">
        <motion.button
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-md border border-border/40 shadow-sm flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      </div>

      <div className="flex-1 px-5 pb-6 max-w-md mx-auto w-full flex flex-col justify-between relative z-10">
        <div>
          {/* Hero — Logo + Title */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center mb-4"
          >
            <motion.div
              className="relative w-28 h-28 mx-auto mb-3 flex items-center justify-center"
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
                  animate={{ scale: [0.5, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 2.5, delay: i * 0.7, repeat: Infinity, ease: "easeOut" }}
                />
              ))}
              {/* Breathing aura */}
              <motion.div
                className="absolute w-20 h-20 rounded-full bg-primary/10 blur-xl"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Orbiting hearts */}
              {/* Logo */}
              <div className="relative z-0 rounded-full overflow-hidden shadow-xl shadow-primary/20 ring-[3px] ring-primary/15 bg-white" style={{ width: 88, height: 88 }}>
                <img src={pricingLogo} alt="Pregnancy Toolkits" className="w-full h-full object-cover" loading="eager" width={88} height={88} />
              </div>
              {/* Blooming flowers */}
              {[
                { angle: 0, radius: 52, size: 17, emoji: '🌸', dur: 7, delay: 0 },
                { angle: 72, radius: 48, size: 14, emoji: '🌸', dur: 9, delay: 0.6 },
                { angle: 144, radius: 54, size: 16, emoji: '🌸', dur: 8, delay: 1.2 },
                { angle: 216, radius: 50, size: 13, emoji: '🌸', dur: 10, delay: 0.3 },
                { angle: 288, radius: 53, size: 15, emoji: '🌸', dur: 8.5, delay: 0.9 },
              ].map((f, i) => (
                <motion.span
                  key={`flower-${i}`}
                  className="absolute z-10 pointer-events-none select-none"
                  style={{
                    left: '50%',
                    top: '50%',
                    marginLeft: -f.size / 2,
                    marginTop: -f.size / 2,
                    fontSize: f.size,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    x: [
                      Math.cos((f.angle * Math.PI) / 180) * f.radius,
                      Math.cos(((f.angle + 90) * Math.PI) / 180) * (f.radius * 0.85),
                      Math.cos(((f.angle + 180) * Math.PI) / 180) * f.radius,
                      Math.cos(((f.angle + 270) * Math.PI) / 180) * (f.radius * 0.85),
                      Math.cos(((f.angle + 360) * Math.PI) / 180) * f.radius,
                    ],
                    y: [
                      Math.sin((f.angle * Math.PI) / 180) * f.radius,
                      Math.sin(((f.angle + 90) * Math.PI) / 180) * (f.radius * 0.85),
                      Math.sin(((f.angle + 180) * Math.PI) / 180) * f.radius,
                      Math.sin(((f.angle + 270) * Math.PI) / 180) * (f.radius * 0.85),
                      Math.sin(((f.angle + 360) * Math.PI) / 180) * f.radius,
                    ],
                    scale: [0, 1.2, 1, 1.15, 0],
                    opacity: [0, 1, 0.85, 1, 0],
                    rotate: [0, 15, -10, 8, 0],
                  }}
                  transition={{
                    duration: f.dur,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: f.delay,
                  }}
                >
                  {f.emoji}
                </motion.span>
              ))}
            </motion.div>

            <h1
              className="text-lg font-extrabold text-foreground tracking-tight mb-1 leading-tight"
              style={{ fontFamily: isAr ? "'Almarai', 'Tajawal', sans-serif" : "'Montserrat', sans-serif" }}
            >
              {t("pricing.title")}
            </h1>
            <p
              className="text-[11px] text-muted-foreground leading-relaxed max-w-[220px] mx-auto"
              style={{ fontFamily: isAr ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif" }}
            >
              {t("pricing.subtitle")}
            </p>
          </motion.div>

          {/* Features chips */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
            className="flex flex-wrap justify-center gap-1.5 mb-4"
          >
            {features.map(({ icon: Icon, key }, idx) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.12 + idx * 0.04 }}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/[0.06] border border-primary/10"
              >
                <Icon className="w-2.5 h-2.5 text-primary" strokeWidth={2} />
                <span className="text-[9px] font-semibold text-foreground leading-none whitespace-nowrap">
                  {t(`pricing.${key}`)}
                </span>
              </motion.div>
            ))}
          </motion.div>



          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.18 }}
            className="flex justify-center"
          >
            {/* Monthly — single plan */}
            <div
              className="relative flex flex-col items-center text-center px-6 py-5 rounded-2xl border-2 border-primary bg-primary/[0.04] shadow-[0_0_20px_-6px_hsl(var(--primary)/0.2)] w-full max-w-[240px]"
            >
              <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center mb-2">
                <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />
              </div>

              <span className="text-[11px] font-bold text-foreground mb-1">{t("pricing.monthly")}</span>

              <span className="text-[28px] font-extrabold text-foreground tabular-nums leading-none" style={{ fontFamily: "'Cairo', sans-serif" }}>
                $2.99
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">/{t("pricing.mo")}</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28 }}
          className="mt-5 space-y-2"
        >
          <Button
            onClick={handleSubscribe}
            size="lg"
            className="w-full h-[46px] text-[13px] font-bold rounded-2xl shadow-lg shadow-primary/20 whitespace-normal leading-snug"
            style={{ fontFamily: isAr ? "'Almarai', sans-serif" : "'Montserrat', sans-serif" }}
          >
            {t("pricing.cta")}
          </Button>

          <p
            className="text-center text-[10px] text-muted-foreground leading-snug"
            style={{ fontFamily: isAr ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif" }}
          >
            {t("pricing.ctaSub", { price, period })}
          </p>

          <p className="text-center text-[9px] text-muted-foreground/50 leading-relaxed">
            {t("pricing.autoRenew")}
          </p>

          <div className="flex items-center justify-center gap-2 flex-wrap pt-0.5">
            <button
              onClick={() => toast.info(t("pricing.restore"))}
              className="text-[10px] text-primary/70 hover:text-primary transition-colors"
            >
              {t("pricing.restore")}
            </button>
            <span className="text-muted-foreground/20">·</span>
            <span className="text-[9px] text-muted-foreground/50 text-center">
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
