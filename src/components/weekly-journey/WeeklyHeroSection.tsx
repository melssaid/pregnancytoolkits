import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { fetalSizeData } from "@/data/weeklyJourneyData";

interface Props {
  week: number;
}

export const WeeklyHeroSection = memo(function WeeklyHeroSection({ week }: Props) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const fetal = useMemo(() => fetalSizeData[week] || null, [week]);
  const progress = Math.min(100, Math.round((week / 40) * 100));
  const trimester = week <= 13 ? 1 : week <= 27 ? 2 : 3;
  const daysRemaining = Math.max(0, (40 - week) * 7);

  // SVG progress ring
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(340,65%,52%)] via-[hsl(345,60%,56%)] to-[hsl(280,50%,55%)] dark:from-[hsl(340,60%,38%)] dark:via-[hsl(345,55%,42%)] dark:to-[hsl(280,45%,40%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
      <div className="absolute -top-10 -end-10 w-40 h-40 rounded-full bg-white/8 blur-3xl" />

      <div className="relative p-5 text-white">
        <div className="flex items-center gap-4">
          {/* Progress Ring */}
          <div className="relative flex-shrink-0">
            <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
              <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
              <motion.circle
                cx="60" cy="60" r={radius}
                fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold tabular-nums leading-none">{week}</span>
              <span className="text-[9px] opacity-70 mt-0.5">{t("weeklyJourney.hero.week")}</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] opacity-70 font-medium mb-1">
              {t(`weeklyJourney.hero.trimester${trimester}`)}
            </p>
            
            {fetal && (
              <p className="text-sm font-bold mb-1">
                {t("weeklyJourney.hero.babySize", { size: isAr ? fetal.sizeAr : fetal.sizeEn })}
              </p>
            )}

            {fetal && (
              <div className="flex gap-3 mb-2">
                <span className="text-[11px] opacity-80 tabular-nums">{fetal.lengthCm} {t("weeklyJourney.hero.cm")}</span>
                <span className="text-[11px] opacity-80 tabular-nums">{fetal.weightG} {t("weeklyJourney.hero.g")}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-white/80"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <span className="text-[10px] font-bold tabular-nums">{progress}%</span>
            </div>
            
            <p className="text-[10px] opacity-60 mt-1">
              {t("weeklyJourney.hero.daysRemaining", { days: daysRemaining })}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
