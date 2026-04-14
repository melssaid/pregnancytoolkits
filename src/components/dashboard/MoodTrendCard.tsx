import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Smile } from "lucide-react";
import { safeParseLocalStorage } from "@/lib/safeStorage";

interface DailyLog {
  date: string;
  mood: number;
  symptoms: string[];
}

const moodEmojis = ["", "😢", "😟", "😐", "😊", "🤩"];

export const MoodTrendCard = memo(function MoodTrendCard() {
  const { t } = useTranslation();

  const data = useMemo(() => {
    const logs = safeParseLocalStorage<DailyLog[]>("quick_symptom_logs", [], (d): d is DailyLog[] => Array.isArray(d));
    if (logs.length === 0) return null;

    const sorted = [...logs].filter(l => l.mood > 0).sort((a, b) => a.date.localeCompare(b.date));
    const last7 = sorted.slice(-7);
    if (last7.length === 0) return null;

    const avg = last7.reduce((s, l) => s + l.mood, 0) / last7.length;
    const rounded = Math.round(avg);

    return { days: last7, avg: Math.round(avg * 10) / 10, emoji: moodEmojis[rounded] || "😐", rounded };
  }, []);

  if (!data) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/20 bg-card p-3.5"
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <Smile className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          {t("dashboard.moodTrend.title", "اتجاه المزاج")}
        </h3>
      </div>

      {/* Mini bar chart */}
      <div className="flex items-end gap-1 h-12 mb-2">
        {data.days.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div
              className="w-full rounded-t-md bg-primary/60 transition-all"
              style={{ height: `${(d.mood / 5) * 100}%` }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {t("dashboard.moodTrend.last7days", "آخر 7 أيام")}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-base">{data.emoji}</span>
          <span className="text-xs font-bold text-foreground">{data.avg}/5</span>
        </div>
      </div>
    </motion.div>
  );
});
