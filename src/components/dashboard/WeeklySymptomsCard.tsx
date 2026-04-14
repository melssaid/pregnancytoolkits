import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { safeParseLocalStorage } from "@/lib/safeStorage";

interface DailyLog {
  date: string;
  mood: number;
  symptoms: string[];
  week?: number;
}

const symptomEmoji: Record<string, string> = {
  nausea: "🤢", fatigue: "😴", headache: "🤕", backPain: "💆",
  swelling: "🦶", dizziness: "😵", heartburn: "🔥", insomnia: "🌙",
  cramps: "⚡", anxiety: "😰",
};

export const WeeklySymptomsCard = memo(function WeeklySymptomsCard() {
  const { t } = useTranslation();

  const topSymptoms = useMemo(() => {
    const logs = safeParseLocalStorage<DailyLog[]>("quick_symptom_logs", [], (d): d is DailyLog[] => Array.isArray(d));
    if (logs.length === 0) return [];

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStr = weekAgo.toISOString().split("T")[0];

    const recent = logs.filter(l => l.date >= weekStr);
    const counts: Record<string, number> = {};
    recent.forEach(l => l.symptoms?.forEach(s => { counts[s] = (counts[s] || 0) + 1; }));

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count, emoji: symptomEmoji[name] || "•" }));
  }, []);

  if (topSymptoms.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Link to="/tools/symptom-analyzer" className="block rounded-2xl border border-border/20 bg-card p-3.5 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            {t("dashboard.weeklySymptoms.title", "أعراض هذا الأسبوع")}
          </h3>
        </div>
        <div className="flex gap-2">
          {topSymptoms.map(s => (
            <div key={s.name} className="flex-1 rounded-xl bg-muted/30 p-2 text-center">
              <span className="text-lg block">{s.emoji}</span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                {t(`symptoms.${s.name}`, s.name)}
              </span>
              <span className="text-xs font-bold text-foreground">{s.count}×</span>
            </div>
          ))}
        </div>
      </Link>
    </motion.div>
  );
});
