import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, Baby, Utensils, Activity, TrendingUp, Brain, Heart,
  ArrowRight, ArrowLeft, Flower2, Leaf, Dumbbell, Milk, Bed,
} from "lucide-react";
import { useUserProfile, type JourneyStage } from "@/hooks/useUserProfile";
import { fetalSizeData } from "@/data/weeklyJourneyData";
import { cn } from "@/lib/utils";

/* ── animation helpers ─────────────────────────────────── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

/* ── recommended tools per journey ─────────────────────── */
interface Rec {
  icon: typeof Utensils;
  titleKey: string;
  descKey: string;
  href: string;
}

const pregnantRecs: Rec[] = [
  { icon: Utensils, titleKey: "smartResult.rec.nutrition", descKey: "smartResult.rec.nutritionDesc", href: "/tools/ai-meal-suggestion" },
  { icon: Activity, titleKey: "smartResult.rec.symptoms", descKey: "smartResult.rec.symptomsDesc", href: "/tools/wellness-diary" },
  { icon: TrendingUp, titleKey: "smartResult.rec.growth", descKey: "smartResult.rec.growthDesc", href: "/tools/fetal-growth" },
];

const fertilityRecs: Rec[] = [
  { icon: Flower2, titleKey: "smartResult.rec.cycle", descKey: "smartResult.rec.cycleDesc", href: "/tools/cycle-tracker" },
  { icon: Leaf, titleKey: "smartResult.rec.supplements", descKey: "smartResult.rec.supplementsDesc", href: "/tools/nutrition-supplements" },
  { icon: Dumbbell, titleKey: "smartResult.rec.fitness", descKey: "smartResult.rec.fitnessDesc", href: "/tools/ai-fitness-coach" },
];

const postpartumRecs: Rec[] = [
  { icon: Milk, titleKey: "smartResult.rec.lactation", descKey: "smartResult.rec.lactationDesc", href: "/tools/ai-lactation-prep" },
  { icon: Bed, titleKey: "smartResult.rec.babySleep", descKey: "smartResult.rec.babySleepDesc", href: "/tools/baby-sleep-tracker" },
  { icon: Brain, titleKey: "smartResult.rec.mental", descKey: "smartResult.rec.mentalDesc", href: "/tools/mental-health-coach" },
];

function getRecsForJourney(stage: JourneyStage): Rec[] {
  if (stage === "fertility") return fertilityRecs;
  if (stage === "postpartum") return postpartumRecs;
  return pregnantRecs;
}

/* ── AI recommendation messages per journey ────────────── */
function getAIMessage(stage: JourneyStage, week: number): string {
  if (stage === "fertility") return "smartResult.ai.fertilityMsg";
  if (stage === "postpartum") return "smartResult.ai.postpartumMsg";
  if (week <= 13) return "smartResult.ai.trimester1Msg";
  if (week <= 27) return "smartResult.ai.trimester2Msg";
  return "smartResult.ai.trimester3Msg";
}

/* ── component ─────────────────────────────────────────── */
export default function SmartResultScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const isRTL = i18n.language === "ar";
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const week = profile.pregnancyWeek || 0;
  const stage = profile.journeyStage || "pregnant";
  const sizeData = fetalSizeData[week] || fetalSizeData[12];
  const babySize = isRTL || i18n.language === "ar" ? sizeData.sizeAr : sizeData.sizeEn;

  const recs = useMemo(() => getRecsForJourney(stage), [stage]);
  const aiMsgKey = useMemo(() => getAIMessage(stage, week), [stage, week]);

  return (
    <div className="fixed inset-0 z-[250] overflow-y-auto bg-gradient-to-b from-pink-50/80 via-purple-50/40 to-background dark:from-pink-950/20 dark:via-purple-950/10 dark:to-background">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="container max-w-lg mx-auto px-5 py-8 pb-28 space-y-5"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* ─── 1. Success Header ─── */}
        <motion.div variants={fadeUp} className="text-center pt-4">
          {/* Sparkle glow */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-400/20 to-purple-400/20 flex items-center justify-center"
          >
            <Sparkles className="w-8 h-8 text-pink-500" />
          </motion.div>
          <h1 className="text-xl font-black text-foreground leading-tight mb-2">
            {t("smartResult.title", "✨ Your personalized journey is ready")}
          </h1>
          <p className="text-sm text-foreground/70 font-medium leading-relaxed max-w-xs mx-auto">
            {t("smartResult.subtitle", "We've created a smart experience tailored just for you and your baby")}
          </p>
        </motion.div>

        {/* ─── 2. Pregnancy Status Card ─── */}
        {stage === "pregnant" && week > 0 && (
          <motion.div
            variants={fadeUp}
            className="rounded-2xl bg-card border border-border/30 shadow-lg shadow-pink-500/5 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/5 p-5">
              <div className="flex items-center gap-4">
                {/* Week circle */}
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" strokeWidth="5" className="stroke-muted/20" />
                    <circle
                      cx="50" cy="50" r="42" fill="none" strokeWidth="5"
                      strokeDasharray={`${(week / 42) * 264} 264`}
                      strokeLinecap="round"
                      className="stroke-pink-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-foreground">{week}</span>
                    <span className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wide">
                      {t("smartResult.week", "Week")}
                    </span>
                  </div>
                </div>

                {/* Baby info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground mb-1">
                    {t("smartResult.weekTitle", "Week {{week}}", { week })}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Baby className="w-4 h-4 text-pink-500 flex-shrink-0" />
                    <p className="text-xs text-foreground/70 font-medium">
                      {t("smartResult.babySize", "Your baby is the size of {{size}}", { size: babySize })}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    {sizeData.lengthCm} cm · {sizeData.weightG} g
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── 3. Recommended Tools ─── */}
        <motion.div variants={fadeUp} className="space-y-3">
          <h2 className="text-sm font-bold text-foreground px-1">
            {t("smartResult.recTitle", "Recommended for you")}
          </h2>
          <div className="space-y-2.5">
            {recs.map((rec, i) => {
              const Icon = rec.icon;
              return (
                <motion.button
                  key={rec.titleKey}
                  variants={fadeUp}
                  onClick={() => navigate(rec.href)}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-card border border-border/30 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group text-start"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500/15 to-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{t(rec.titleKey)}</p>
                    <p className="text-[11px] text-foreground/60 font-medium mt-0.5 leading-relaxed">
                      {t(rec.descKey)}
                    </p>
                  </div>
                  <ArrowIcon className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ─── 4. AI Recommendation Highlight ─── */}
        <motion.div
          variants={fadeUp}
          className="rounded-2xl border border-purple-200/40 dark:border-purple-800/30 bg-gradient-to-br from-purple-50/60 via-pink-50/30 to-background dark:from-purple-950/20 dark:via-pink-950/10 p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              {t("smartResult.aiTitle", "🤖 Smart Recommendation for You")}
            </h3>
          </div>
          <p className="text-xs text-foreground/70 font-medium leading-relaxed">
            {t(aiMsgKey, "Based on your stage, we recommend focusing on nutrition and rest this week.")}
          </p>
          <button
            onClick={() => navigate("/tools/pregnancy-assistant")}
            className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
          >
            {t("smartResult.askAI", "Ask AI Doctor")}
            <ArrowIcon className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* ─── 5. Dual CTA ─── */}
        <motion.div variants={fadeUp} className="pt-2 space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-black shadow-xl shadow-pink-500/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {t("smartResult.exploreAll", "Explore All Tools")}
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3.5 rounded-2xl border border-border/50 bg-card text-foreground text-sm font-bold hover:bg-accent/50 transition-colors flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4 text-pink-500" />
            {t("smartResult.myDashboard", "My Personal Dashboard")}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
