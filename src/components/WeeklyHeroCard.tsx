import { memo, useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Baby, ChevronDown, ChevronUp, Sparkles, Heart } from "lucide-react";
import { Link } from "react-router-dom";

// Baby size comparisons by week — keys reference i18n: weeklyHero.fetalSize.<week>
const fetalSizeData: Record<number, { sizeKey: string; lengthCm: string; weightG: string; emoji: string }> = {
  4: { sizeKey: "4", lengthCm: "0.1", weightG: "<1", emoji: "🌱" },
  5: { sizeKey: "5", lengthCm: "0.2", weightG: "<1", emoji: "🌱" },
  6: { sizeKey: "6", lengthCm: "0.6", weightG: "<1", emoji: "🫘" },
  7: { sizeKey: "7", lengthCm: "1.3", weightG: "1", emoji: "🫐" },
  8: { sizeKey: "8", lengthCm: "1.6", weightG: "1", emoji: "🍇" },
  9: { sizeKey: "9", lengthCm: "2.3", weightG: "2", emoji: "🍒" },
  10: { sizeKey: "10", lengthCm: "3.1", weightG: "4", emoji: "🍓" },
  11: { sizeKey: "11", lengthCm: "4.1", weightG: "7", emoji: "🫒" },
  12: { sizeKey: "12", lengthCm: "5.4", weightG: "14", emoji: "🍋" },
  13: { sizeKey: "13", lengthCm: "7.4", weightG: "23", emoji: "🍑" },
  14: { sizeKey: "14", lengthCm: "8.7", weightG: "43", emoji: "🍋" },
  15: { sizeKey: "15", lengthCm: "10.1", weightG: "70", emoji: "🍎" },
  16: { sizeKey: "16", lengthCm: "11.6", weightG: "100", emoji: "🥑" },
  17: { sizeKey: "17", lengthCm: "13", weightG: "140", emoji: "🍐" },
  18: { sizeKey: "18", lengthCm: "14.2", weightG: "190", emoji: "🫑" },
  19: { sizeKey: "19", lengthCm: "15.3", weightG: "240", emoji: "🥭" },
  20: { sizeKey: "20", lengthCm: "16.4", weightG: "300", emoji: "🍌" },
  21: { sizeKey: "21", lengthCm: "26.7", weightG: "360", emoji: "🥕" },
  22: { sizeKey: "22", lengthCm: "27.8", weightG: "430", emoji: "🥭" },
  23: { sizeKey: "23", lengthCm: "28.9", weightG: "500", emoji: "🍊" },
  24: { sizeKey: "24", lengthCm: "30", weightG: "600", emoji: "🌽" },
  25: { sizeKey: "25", lengthCm: "34.6", weightG: "660", emoji: "🥦" },
  26: { sizeKey: "26", lengthCm: "35.6", weightG: "760", emoji: "🥬" },
  27: { sizeKey: "27", lengthCm: "36.6", weightG: "875", emoji: "🥬" },
  28: { sizeKey: "28", lengthCm: "37.6", weightG: "1000", emoji: "🍆" },
  29: { sizeKey: "29", lengthCm: "38.6", weightG: "1150", emoji: "🎃" },
  30: { sizeKey: "30", lengthCm: "39.9", weightG: "1320", emoji: "🥥" },
  31: { sizeKey: "31", lengthCm: "41.1", weightG: "1500", emoji: "🍍" },
  32: { sizeKey: "32", lengthCm: "42.4", weightG: "1700", emoji: "🎃" },
  33: { sizeKey: "33", lengthCm: "43.7", weightG: "1920", emoji: "🥒" },
  34: { sizeKey: "34", lengthCm: "45", weightG: "2150", emoji: "🍈" },
  35: { sizeKey: "35", lengthCm: "46.2", weightG: "2380", emoji: "🍈" },
  36: { sizeKey: "36", lengthCm: "47.4", weightG: "2620", emoji: "🥬" },
  37: { sizeKey: "37", lengthCm: "48.6", weightG: "2860", emoji: "🥬" },
  38: { sizeKey: "38", lengthCm: "49.8", weightG: "3080", emoji: "🧅" },
  39: { sizeKey: "39", lengthCm: "50.7", weightG: "3290", emoji: "🍉" },
  40: { sizeKey: "40", lengthCm: "51.2", weightG: "3460", emoji: "🎃" },
  41: { sizeKey: "41", lengthCm: "51.5", weightG: "3600", emoji: "🍉" },
  42: { sizeKey: "42", lengthCm: "51.7", weightG: "3700", emoji: "🍈" },
};

const DAILY_TIP_COUNT = 7;

const WeeklyHeroCard = memo(function WeeklyHeroCard() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [week, setWeek] = useState(() => {
    try {
      const profile = localStorage.getItem(`profile_${localStorage.getItem("pregnancy_user_id") || ""}`);
      if (profile) {
        const parsed = JSON.parse(profile);
        return parsed.pregnancy_week || 0;
      }
    } catch {}
    return 0;
  });

  const [showSelector, setShowSelector] = useState(false);

  const fetalInfo = useMemo(() => fetalSizeData[week] || null, [week]);
  
  const dailyTip = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const index = dayOfYear % DAILY_TIP_COUNT;
    return t(`weeklyHero.dailyTips.${index}`);
  }, [t]);

  const trimester = week <= 13 ? 1 : week <= 26 ? 2 : 3;
  const progress = Math.min(100, Math.round((week / 40) * 100));

  const handleSetWeek = (w: number) => {
    setWeek(w);
    setShowSelector(false);
    try {
      const userId = localStorage.getItem("pregnancy_user_id") || "";
      const profile = localStorage.getItem(`profile_${userId}`);
      const parsed = profile ? JSON.parse(profile) : {};
      parsed.pregnancy_week = w;
      localStorage.setItem(`profile_${userId}`, JSON.stringify(parsed));
    } catch {}
  };

  // If no week set, show compact setup prompt
  if (!week) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary/8 via-card to-card border border-primary/15 shadow-sm"
      >
        <div className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
            👶
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">
              {t("weeklyHero.whatWeek")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("weeklyHero.setWeekDesc")}
            </p>
          </div>
          <button
            onClick={() => setShowSelector(true)}
            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
          >
            {t("weeklyHero.set")}
          </button>
        </div>

        <AnimatePresence>
          {showSelector && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 grid grid-cols-8 gap-1.5">
                {Array.from({ length: 42 }, (_, i) => i + 1).map(w => (
                  <button
                    key={w}
                    onClick={() => handleSetWeek(w)}
                    className="h-8 rounded-lg text-xs font-bold bg-muted/40 hover:bg-primary hover:text-primary-foreground transition-colors tabular-nums"
                  >
                    {w}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-2xl overflow-hidden relative"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(340,65%,52%)] via-[hsl(345,60%,56%)] to-[hsl(350,55%,60%)] dark:from-[hsl(340,60%,38%)] dark:via-[hsl(345,55%,42%)] dark:to-[hsl(350,50%,46%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
      <div className="absolute -top-10 -end-10 w-32 h-32 rounded-full bg-white/10 blur-3xl" />

      <div className="relative p-4 text-white">
        {/* Top row: Week + Trimester */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <button onClick={() => setShowSelector(!showSelector)} className="flex items-center gap-1.5 group">
              <span className="text-[11px] opacity-80 font-medium">
                {t("weeklyHero.weekLabel")}
              </span>
              <span className="text-3xl font-extrabold tabular-nums leading-none font-cairo">
                {week}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>
            <p className="text-[10px] opacity-70 mt-0.5">
              {t(`weeklyHero.trimester${trimester}`)}
            </p>
          </div>

          {/* Baby emoji + size */}
          {fetalInfo && (
            <motion.div 
              className="text-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-4xl block">{fetalInfo.emoji}</span>
              <span className="text-[10px] opacity-80 block mt-0.5 font-medium">
                {t(`weeklyHero.fetalSize.${fetalInfo.sizeKey}`)}
              </span>
            </motion.div>
          )}
        </div>

        {/* Week selector dropdown */}
        <AnimatePresence>
          {showSelector && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-3"
            >
              <div className="grid grid-cols-8 gap-1 bg-black/20 rounded-xl p-2 backdrop-blur-sm">
                {Array.from({ length: 42 }, (_, i) => i + 1).map(w => (
                  <button
                    key={w}
                    onClick={() => handleSetWeek(w)}
                    className={`h-7 rounded-md text-[11px] font-bold transition-all tabular-nums ${
                      w === week
                        ? "bg-white text-[hsl(340,65%,52%)] shadow-sm"
                        : "bg-white/10 hover:bg-white/25"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] opacity-70">{t("weeklyHero.progress")}</span>
            <span className="text-[10px] font-bold tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-white/80"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Baby metrics */}
        {fetalInfo && (
          <div className="flex gap-2 mb-3">
            <div className="flex-1 bg-white/10 rounded-xl px-3 py-2 backdrop-blur-sm text-center">
              <span className="text-[10px] opacity-70 block">{t("weeklyHero.length")}</span>
              <span className="text-sm font-bold tabular-nums">{fetalInfo.lengthCm} cm</span>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl px-3 py-2 backdrop-blur-sm text-center">
              <span className="text-[10px] opacity-70 block">{t("weeklyHero.weight")}</span>
              <span className="text-sm font-bold tabular-nums">{fetalInfo.weightG} g</span>
            </div>
            <Link to="/tools/fetal-growth" className="flex-1 bg-white/15 hover:bg-white/25 rounded-xl px-3 py-2 backdrop-blur-sm text-center transition-colors">
              <Baby className="w-4 h-4 mx-auto opacity-80" />
              <span className="text-[9px] opacity-70 block mt-0.5">{t("weeklyHero.details")}</span>
            </Link>
          </div>
        )}

        {/* Daily tip */}
        <div className="bg-white/10 rounded-xl px-3 py-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3 h-3 opacity-80" />
            <span className="text-[10px] font-bold opacity-90">
              {t("weeklyHero.todaysTip")}
            </span>
          </div>
          <p className="text-[11px] opacity-85 leading-relaxed">{dailyTip}</p>
        </div>
      </div>
    </motion.div>
  );
});

export default WeeklyHeroCard;
