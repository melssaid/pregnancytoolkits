import { memo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Baby } from "lucide-react";

interface DailyHeroCardProps {
  week: number;
  dueDate?: string | null;
}

export const DailyHeroCard = memo(function DailyHeroCard({ week, dueDate }: DailyHeroCardProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  if (week <= 0) return null;

  const progress = Math.min(100, (week / 40) * 100);
  const trimester = week <= 13 ? 1 : week <= 26 ? 2 : 3;
  const daysRemaining = dueDate
    ? Math.max(0, Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000))
    : (40 - week) * 7;

  const circumference = 2 * Math.PI * 42;
  const strokeDash = (progress / 100) * circumference;

  const trimesterKey = trimester === 1 ? "first" : trimester === 2 ? "second" : "third";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-card/40 via-card/30 to-card/40 border border-border/30 p-4 relative overflow-hidden shadow-sm"
    >
      <div className="absolute -top-10 -end-10 w-32 h-32 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

      <div className="relative flex items-center gap-4">
        {/* Progress Ring */}
        <div className="relative flex-shrink-0 w-[88px] h-[88px]">
          <svg viewBox="0 0 92 92" className="w-full h-full -rotate-90">
            <circle cx="46" cy="46" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" opacity={0.25} />
            <motion.circle
              cx="46" cy="46" r="42"
              fill="none"
              stroke="url(#heroRingGrad)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - strokeDash }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
            />
            <defs>
              <linearGradient id="heroRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(340, 55%, 65%)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="flex flex-col items-center"
            >
              <span className="text-xl font-black text-primary leading-none">{week}</span>
              <span className="text-[9px] text-muted-foreground font-medium mt-0.5">
                {t("dailyDashboard.week")}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-primary whitespace-normal leading-tight">
            {t(`dailyDashboard.trimester.${trimesterKey}`)}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground leading-none">{daysRemaining}</span>
              <span className="text-[9px] text-muted-foreground whitespace-nowrap">{t("dailyDashboard.daysLeft")}</span>
            </div>
            <div className="w-px h-4 bg-border/50 flex-shrink-0" />
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground leading-none">{Math.round(progress)}%</span>
              <span className="text-[9px] text-muted-foreground whitespace-nowrap">{t("dailyDashboard.complete")}</span>
            </div>
          </div>
          {/* Mini progress bar */}
          <div className="mt-2 h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
});
