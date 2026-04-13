import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { useTrackingStats } from "@/hooks/useTrackingStats";

export function HealthScoreRing() {
  const { t } = useTranslation();
  const { stats } = useTrackingStats();

  // Calculate score from 4 pillars (each 25 points max)
  const waterScore = Math.min(stats.dailyTracking.waterGlasses / 8, 1) * 25;
  const kickScore = Math.min(stats.dailyTracking.todayKicks / 10, 1) * 25;
  const vitaminScore = Math.min(stats.dailyTracking.vitaminsTaken / 3, 1) * 25;
  // Activity score based on any logged data today
  const activityScore = (stats.dailyTracking.lastWeight ? 12.5 : 0) + (stats.postpartum.sleepHoursToday > 0 ? 12.5 : 0);

  const totalScore = Math.round(waterScore + kickScore + vitaminScore + activityScore);
  const progress = totalScore / 100;
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - progress * circumference;

  const scoreColor = totalScore >= 70 ? "text-green-500" : totalScore >= 40 ? "text-yellow-500" : "text-red-400";
  const scoreLabel = totalScore >= 70 ? t("healthScore.great") : totalScore >= 40 ? t("healthScore.good") : t("healthScore.needsWork");

  const pillars = [
    { label: t("healthScore.water"), value: Math.round(waterScore), max: 25, color: "bg-blue-400" },
    { label: t("healthScore.kicks"), value: Math.round(kickScore), max: 25, color: "bg-pink-400" },
    { label: t("healthScore.vitamins"), value: Math.round(vitaminScore), max: 25, color: "bg-green-400" },
    { label: t("healthScore.activity"), value: Math.round(activityScore), max: 25, color: "bg-purple-400" },
  ];

  return (
    <Card className="p-4 bg-card border-border/50">
      <h3 className="text-base font-bold text-foreground mb-3">{t("healthScore.title")}</h3>
      <div className="flex items-center gap-4">
        {/* Ring */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
            <motion.circle
              cx="48" cy="48" r="42" fill="none"
              stroke="url(#healthGrad)" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.4, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(142, 60%, 50%)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className={`text-2xl font-black ${scoreColor}`}
            >
              {totalScore}
            </motion.span>
            <span className="text-[9px] text-muted-foreground">/100</span>
          </div>
        </div>

        {/* Pillars breakdown */}
        <div className="flex-1 space-y-1.5">
          <p className={`text-xs font-bold ${scoreColor}`}>{scoreLabel}</p>
          {pillars.map((p) => (
            <div key={p.label} className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-14 truncate">{p.label}</span>
              <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${p.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(p.value / p.max) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
              <span className="text-[9px] text-muted-foreground w-6 text-end">{p.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
