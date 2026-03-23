import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Activity, Clock, TrendingDown, TrendingUp, Timer, BarChart3 } from "lucide-react";

interface Contraction {
  id: string;
  start: number;
  end: number | null;
  duration: number;
}

interface ContractionStatsProps {
  contractions: Contraction[];
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ContractionStats({ contractions }: ContractionStatsProps) {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    if (contractions.length < 1) return null;

    const durations = contractions.map((c) => c.duration);
    const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    const intervals: number[] = [];
    for (let i = 0; i < contractions.length - 1; i++) {
      const gap = Math.floor(
        (contractions[i].start - (contractions[i + 1].end || contractions[i + 1].start)) / 1000
      );
      if (gap > 0) intervals.push(gap);
    }
    const avgInterval =
      intervals.length > 0 ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length) : 0;

    // Trend: are intervals getting shorter?
    let trend: "shortening" | "stable" | "lengthening" = "stable";
    if (intervals.length >= 3) {
      const recent = intervals.slice(0, 3);
      const older = intervals.slice(-3);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      if (recentAvg < olderAvg * 0.8) trend = "shortening";
      else if (recentAvg > olderAvg * 1.2) trend = "lengthening";
    }

    // Session duration
    const sessionStart = contractions[contractions.length - 1].start;
    const sessionEnd = contractions[0].end || contractions[0].start;
    const sessionDuration = Math.floor((sessionEnd - sessionStart) / 1000);

    // Regularity score (0-100)
    let regularity = 0;
    if (intervals.length >= 2) {
      const mean = avgInterval;
      const variance = intervals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / intervals.length;
      const stdDev = Math.sqrt(variance);
      const cv = mean > 0 ? stdDev / mean : 1;
      regularity = Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
    }

    return {
      count: contractions.length,
      avgDuration,
      avgInterval,
      minDuration,
      maxDuration,
      trend,
      sessionDuration,
      regularity,
    };
  }, [contractions]);

  if (!stats) return null;

  const statCards = [
    {
      icon: Activity,
      value: stats.count.toString(),
      label: t("toolsInternal.contractionTimer.total", "انقباض"),
      color: "text-primary",
    },
    {
      icon: Timer,
      value: formatDuration(stats.avgDuration),
      label: t("toolsInternal.contractionTimer.avgDuration", "متوسط المدة"),
      color: "text-destructive",
    },
    {
      icon: Clock,
      value: stats.avgInterval > 0 ? formatDuration(stats.avgInterval) : "--",
      label: t("toolsInternal.contractionTimer.avgInterval", "متوسط الفاصل"),
      color: "text-amber-500",
    },
    {
      icon: BarChart3,
      value: `${stats.regularity}%`,
      label: t("toolsInternal.contractionTimer.regularity", "الانتظام"),
      color: stats.regularity >= 70 ? "text-green-500" : "text-muted-foreground",
    },
    {
      icon: stats.trend === "shortening" ? TrendingDown : TrendingUp,
      value:
        stats.trend === "shortening"
          ? t("toolsInternal.contractionTimer.trendShortening", "تقارب")
          : stats.trend === "lengthening"
          ? t("toolsInternal.contractionTimer.trendLengthening", "تباعد")
          : t("toolsInternal.contractionTimer.trendStable", "مستقر"),
      label: t("toolsInternal.contractionTimer.trend", "الاتجاه"),
      color:
        stats.trend === "shortening"
          ? "text-destructive"
          : stats.trend === "lengthening"
          ? "text-green-500"
          : "text-muted-foreground",
    },
    {
      icon: Clock,
      value: formatDuration(stats.sessionDuration),
      label: t("toolsInternal.contractionTimer.sessionTime", "مدة الجلسة"),
      color: "text-primary",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-3 gap-2"
    >
      {statCards.map((card, i) => (
        <div
          key={i}
          className="bg-card rounded-xl p-2.5 text-center border border-border/15 shadow-sm"
        >
          <card.icon className={`w-3.5 h-3.5 mx-auto mb-1 ${card.color}`} />
          <span className={`text-sm font-extrabold tabular-nums ${card.color}`}>
            {card.value}
          </span>
          <span className="text-[9px] text-muted-foreground block leading-tight mt-0.5 whitespace-normal break-words overflow-wrap-anywhere">
            {card.label}
          </span>
        </div>
      ))}
    </motion.div>
  );
}
