import { Layout } from "@/components/Layout";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Check, X, Star, Shield, Globe, Sparkles, Heart, Zap } from "lucide-react";
import { getTotalToolsCount } from "@/lib/tools-data";
import { Link } from "react-router-dom";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=app.pregnancytoolkits.android";

interface ComparisonRow {
  feature: string;
  us: boolean | string;
  others: boolean | string;
}

export default function WhyUs() {
  const { t } = useTranslation();
  const toolCount = getTotalToolsCount();

  const comparisons: ComparisonRow[] = [
    { feature: t("whyUs.comp.freeTools", "All tools completely free"), us: true, others: false },
    { feature: t("whyUs.comp.aiPowered", "AI-powered recommendations"), us: true, others: false },
    { feature: t("whyUs.comp.languages", "7 languages supported"), us: true, others: false },
    { feature: t("whyUs.comp.toolCount", { count: toolCount, defaultValue: "{{count}}+ smart tools" }), us: true, others: "5-10" },
    { feature: t("whyUs.comp.noAds", "No ads or tracking"), us: true, others: false },
    { feature: t("whyUs.comp.privacyFirst", "Privacy-first, local storage"), us: true, others: false },
    { feature: t("whyUs.comp.offline", "Works offline"), us: true, others: false },
    { feature: t("whyUs.comp.whatsapp", "WhatsApp sharing"), us: true, others: false },
    { feature: t("whyUs.comp.fertility", "Fertility + pregnancy + postpartum"), us: true, others: false },
    { feature: t("whyUs.comp.darkMode", "Dark mode"), us: true, others: false },
  ];

  const highlights = [
    { icon: Sparkles, title: t("whyUs.hl.ai", "AI-Powered"), desc: t("whyUs.hl.aiDesc", "Smart recommendations that adapt to your journey") },
    { icon: Globe, title: t("whyUs.hl.global", "7 Languages"), desc: t("whyUs.hl.globalDesc", "Arabic, English, German, French, Spanish, Turkish, Portuguese") },
    { icon: Shield, title: t("whyUs.hl.privacy", "Privacy First"), desc: t("whyUs.hl.privacyDesc", "Your data stays on your device, encrypted and secure") },
    { icon: Heart, title: t("whyUs.hl.journey", "Full Journey"), desc: t("whyUs.hl.journeyDesc", "From fertility planning to postpartum recovery") },
    { icon: Zap, title: t("whyUs.hl.fast", "Lightning Fast"), desc: t("whyUs.hl.fastDesc", "Instant loading, works offline, no bloat") },
    { icon: Star, title: t("whyUs.hl.free", "100% Free"), desc: t("whyUs.hl.freeDesc", "No hidden fees, no premium walls, no ads") },
  ];

  return (
    <Layout showBack>
      <SEOHead
        title="Why Pregnancy Toolkits — Best Free Pregnancy App 2026"
        description={`Compare Pregnancy Toolkits with other pregnancy apps. ${toolCount}+ free tools, AI-powered, 7 languages, privacy-first. The most complete pregnancy companion.`}
        keywords="best pregnancy app, pregnancy app comparison, free pregnancy tracker, pregnancy toolkits review"
      />
      <div className="container max-w-3xl pb-20">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
          <h1 className="text-2xl font-bold text-foreground mb-3">
            {t("whyUs.title", "Why Pregnancy Toolkits?")}
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {t("whyUs.subtitle", "The most complete, free, and private pregnancy companion — built for every mom, everywhere.")}
          </p>
        </motion.div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          {highlights.map((h, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="p-4 rounded-2xl bg-card border border-border text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <h.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm font-bold text-foreground mb-1">{h.title}</div>
              <div className="text-[11px] text-muted-foreground leading-snug">{h.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-bold text-foreground mb-4 text-center">
            {t("whyUs.compTitle", "How We Compare")}
          </h2>
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="grid grid-cols-[1fr_80px_80px] bg-muted/50 px-4 py-3 text-xs font-bold text-muted-foreground">
              <span>{t("whyUs.feature", "Feature")}</span>
              <span className="text-center text-primary">🤰 {t("whyUs.us", "Us")}</span>
              <span className="text-center">{t("whyUs.others", "Others")}</span>
            </div>
            {comparisons.map((row, i) => (
              <div key={i} className={`grid grid-cols-[1fr_80px_80px] px-4 py-3 text-xs items-center ${i % 2 === 0 ? "bg-card" : "bg-muted/20"}`}>
                <span className="text-foreground font-medium">{row.feature}</span>
                <span className="flex justify-center">
                  {row.us === true ? <Check className="h-4 w-4 text-green-500" /> : <span className="text-foreground font-semibold">{row.us}</span>}
                </span>
                <span className="flex justify-center">
                  {row.others === false ? <X className="h-4 w-4 text-red-400" /> : <span className="text-muted-foreground">{row.others}</span>}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="text-center mt-10">
          <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity">
            {t("whyUs.cta", "Download Free on Google Play")} <Star className="h-4 w-4" />
          </a>
          <p className="text-[10px] text-muted-foreground mt-3">
            {t("whyUs.ctaSub", "No account required • Works offline • Your data stays private")}
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
