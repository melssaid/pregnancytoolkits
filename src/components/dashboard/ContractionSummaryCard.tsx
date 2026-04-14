import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { safeParseLocalStorage } from "@/lib/safeStorage";

interface Contraction {
  id: string;
  start: number;
  end: number;
  duration: number;
  intensity: number;
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export const ContractionSummaryCard = memo(function ContractionSummaryCard() {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const data = safeParseLocalStorage<Contraction[]>("contraction_timer_data", [], (d): d is Contraction[] => Array.isArray(d));
    if (data.length === 0) return null;

    const durations = data.map(c => c.duration);
    const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);

    const intervals: number[] = [];
    for (let i = 0; i < data.length - 1; i++) {
      const gap = Math.floor((data[i].start - (data[i + 1].end || data[i + 1].start)) / 1000);
      if (gap > 0) intervals.push(gap);
    }
    const avgInterval = intervals.length > 0 ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length) : 0;

    return { count: data.length, avgDuration, avgInterval };
  }, []);

  if (!stats) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Link to="/tools/contraction-timer" className="block rounded-2xl border border-border/20 bg-card p-3.5 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Timer className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            {t("dashboard.contractions.title", "ملخص الانقباضات")}
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-muted/30 p-2 text-center">
            <span className="text-lg font-bold text-foreground block">{stats.count}</span>
            <span className="text-[10px] text-muted-foreground">{t("dashboard.contractions.total", "انقباض")}</span>
          </div>
          <div className="rounded-xl bg-muted/30 p-2 text-center">
            <span className="text-lg font-bold text-foreground block">{fmt(stats.avgDuration)}</span>
            <span className="text-[10px] text-muted-foreground">{t("dashboard.contractions.avgDuration", "متوسط المدة")}</span>
          </div>
          <div className="rounded-xl bg-muted/30 p-2 text-center">
            <span className="text-lg font-bold text-foreground block">{stats.avgInterval > 0 ? fmt(stats.avgInterval) : "—"}</span>
            <span className="text-[10px] text-muted-foreground">{t("dashboard.contractions.avgInterval", "متوسط الفاصل")}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});
