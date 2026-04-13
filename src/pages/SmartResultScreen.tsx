import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Baby, Heart, ArrowRight, ArrowLeft, Flower2,
  Home, LayoutDashboard,
} from "lucide-react";
import { useUserProfile, type JourneyStage } from "@/hooks/useUserProfile";
import { fetalSizeData } from "@/data/weeklyJourneyData";
import { getToolsByJourney, type JourneyKey, type Tool } from "@/lib/tools-data";
import { cn } from "@/lib/utils";

/* ── animation helpers ─────────────────────────────────── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

/* ── journey → JourneyKey mapping ──────────────────────── */
function toJourneyKey(stage: JourneyStage): JourneyKey {
  if (stage === "fertility") return "planning";
  if (stage === "postpartum") return "postpartum";
  return "pregnant";
}

/* ── journey color theming ─────────────────────────────── */
function getJourneyColors(stage: JourneyStage) {
  if (stage === "fertility") return {
    accent: "hsl(15,70%,55%)",
    bg: "from-[hsl(15,55%,96%)] to-[hsl(25,40%,93%)]",
    iconBg: "bg-[hsl(15,55%,94%)]",
    iconText: "text-[hsl(15,70%,55%)]",
    ring: "stroke-[hsl(15,70%,55%)]",
    gradient: "from-[hsl(15,70%,55%)] to-[hsl(30,80%,60%)]",
    shadow: "shadow-[0_8px_30px_-6px_hsl(15,70%,55%,0.25)]",
  };
  if (stage === "postpartum") return {
    accent: "hsl(290,35%,52%)",
    bg: "from-[hsl(290,30%,96%)] to-[hsl(280,25%,93%)]",
    iconBg: "bg-[hsl(290,30%,94%)]",
    iconText: "text-[hsl(290,35%,52%)]",
    ring: "stroke-[hsl(290,35%,52%)]",
    gradient: "from-[hsl(290,35%,52%)] to-[hsl(270,40%,58%)]",
    shadow: "shadow-[0_8px_30px_-6px_hsl(290,35%,52%,0.25)]",
  };
  return {
    accent: "hsl(340,65%,52%)",
    bg: "from-[hsl(340,50%,96%)] to-[hsl(330,35%,93%)]",
    iconBg: "bg-[hsl(340,50%,94%)]",
    iconText: "text-[hsl(340,65%,52%)]",
    ring: "stroke-[hsl(340,65%,52%)]",
    gradient: "from-[hsl(340,65%,52%)] to-[hsl(320,50%,58%)]",
    shadow: "shadow-[0_8px_30px_-6px_hsl(340,65%,52%,0.25)]",
  };
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
  const babySize = isRTL ? sizeData.sizeAr : sizeData.sizeEn;
  const colors = getJourneyColors(stage);

  const journeyTools = useMemo(() => {
    const key = toJourneyKey(stage);
    return getToolsByJourney(key).sort((a, b) => a.priority - b.priority);
  }, [stage]);

  return (
    <div className="fixed inset-0 z-[250] overflow-y-auto bg-gradient-to-b from-background via-background to-background">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="container max-w-lg mx-auto px-5 py-6 pb-28 space-y-5"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* ─── 1. Header ─── */}
        <motion.div variants={fadeUp} className="text-center pt-6 space-y-2">
          <h1 className="text-xl font-black text-foreground leading-tight">
            {t("smartResult.title", "✨ Your personalized journey is ready")}
          </h1>
          <p className="text-xs text-foreground/60 font-medium leading-relaxed max-w-[260px] mx-auto">
            {t("smartResult.subtitle", "We've created a smart experience tailored just for you and your baby")}
          </p>
        </motion.div>

        {/* ─── 2. Pregnancy Status Card ─── */}
        {stage === "pregnant" && week > 0 && (
          <motion.div
            variants={fadeUp}
            className={cn(
              "rounded-2xl overflow-hidden border border-border/20",
              colors.shadow
            )}
          >
            <div className={cn("bg-gradient-to-r p-5", colors.bg)}>
              <div className="flex items-center gap-4">
                {/* Week circle */}
                <div className="relative w-[72px] h-[72px] flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" strokeWidth="5" className="stroke-foreground/5" />
                    <circle
                      cx="50" cy="50" r="42" fill="none" strokeWidth="5"
                      strokeDasharray={`${(week / 42) * 264} 264`}
                      strokeLinecap="round"
                      className={colors.ring}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-foreground">{week}</span>
                    <span className="text-[7px] text-muted-foreground font-bold uppercase tracking-widest">
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
                    <Baby className={cn("w-4 h-4 flex-shrink-0", colors.iconText)} />
                    <p className="text-xs text-foreground/70 font-medium">
                      {t("smartResult.babySize", "Your baby is the size of {{size}}", { size: babySize })}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {sizeData.lengthCm} cm · {sizeData.weightG} g
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── 3. All Journey Tools Grid ─── */}
        <motion.div variants={fadeUp} className="space-y-3">
          <h2 className="text-sm font-extrabold text-foreground px-1">
            {t("smartResult.recTitle", "Recommended for you")}
          </h2>
          <div className="grid grid-cols-3 gap-1.5">
            {journeyTools.map((tool: Tool) => {
              const Icon = tool.icon;
              return (
                <motion.button
                  key={tool.id}
                  variants={fadeUp}
                  onClick={() => navigate(tool.href)}
                  className="flex flex-col items-center gap-1.5 py-3 px-1.5 rounded-2xl bg-card/80 border border-border/15 hover:border-border/40 hover:shadow-md transition-all"
                >
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center",
                    colors.iconBg
                  )}>
                    <Icon className={cn("w-[18px] h-[18px]", colors.iconText)} />
                  </div>
                  <p className="text-[10px] font-bold text-foreground leading-tight text-center line-clamp-2 max-w-[72px]">
                    {t(tool.titleKey)}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ─── 4. Dual CTA — Dashboard-style gradient banner ─── */}
        <motion.div variants={fadeUp} className="pt-2 space-y-2.5">
          {/* Primary: Explore Home */}
          <button
            onClick={() => navigate("/")}
            className={cn(
              "w-full py-3.5 rounded-2xl bg-gradient-to-r text-white text-sm font-black transition-all hover:opacity-90 flex items-center justify-center gap-2",
              colors.gradient,
              colors.shadow
            )}
          >
            <Home className="w-4 h-4" />
            {t("smartResult.exploreAll", "Explore All Tools")}
          </button>
          {/* Secondary: Dashboard */}
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 rounded-2xl border border-border/30 bg-card/80 text-foreground text-sm font-bold hover:bg-accent/40 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
            {t("smartResult.myDashboard", "My Personal Dashboard")}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
