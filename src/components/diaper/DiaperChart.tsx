import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { format, subDays, startOfDay } from "date-fns";

interface DiaperEntry {
  id: string;
  time: string;
  type: "wet" | "dirty" | "both";
}

interface DiaperChartProps {
  entries: DiaperEntry[];
}

export const DiaperChart = ({ entries }: DiaperChartProps) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const days = 7;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      
      const dayEntries = entries.filter(e => {
        const t = new Date(e.time).getTime();
        return t >= dayStart.getTime() && t < dayEnd.getTime();
      });

      data.push({
        day: format(date, "EEE"),
        dateNum: format(date, "d"),
        wet: dayEntries.filter(e => e.type === "wet" || e.type === "both").length,
        dirty: dayEntries.filter(e => e.type === "dirty" || e.type === "both").length,
        total: dayEntries.length,
        isToday: i === 0,
      });
    }
    
    return data;
  }, [entries]);

  const hasData = chartData.some(d => d.total > 0);
  if (!hasData) return null;

  const maxTotal = Math.max(...chartData.map(d => d.total), 1);
  const avg = (chartData.reduce((s, d) => s + d.total, 0) / 7).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="rounded-xl border border-border/40 bg-card p-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold text-foreground">{t('diaperPage.weeklyTrend')}</span>
        <span className="text-[10px] text-muted-foreground">≈ {avg} {t('diaperPage.avgPerDay')}</span>
      </div>

      {/* Mini bar chart */}
      <div className="flex items-end gap-1.5 h-14">
        {chartData.map((d, i) => {
          const heightPercent = Math.max(8, (d.total / maxTotal) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              {d.total > 0 && (
                <span className="text-[9px] font-bold text-muted-foreground tabular-nums">{d.total}</span>
              )}
              <div className="w-full relative" style={{ height: `${heightPercent}%`, minHeight: 3 }}>
                {/* Wet portion */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: '100%' }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className={`w-full rounded-t-md overflow-hidden ${d.isToday ? 'bg-primary' : 'bg-primary/25'}`}
                >
                  {d.dirty > 0 && d.wet > 0 && (
                    <div 
                      className={`w-full ${d.isToday ? 'bg-amber-500' : 'bg-amber-500/40'} rounded-t-md`}
                      style={{ height: `${(d.dirty / d.total) * 100}%` }}
                    />
                  )}
                </motion.div>
              </div>
              <span className={`text-[9px] ${d.isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                {d.dateNum}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-primary/40" />
          <span className="text-[9px] text-muted-foreground">{t('diaperPage.wet')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-amber-500/50" />
          <span className="text-[9px] text-muted-foreground">{t('diaperPage.dirty')}</span>
        </div>
      </div>
    </motion.div>
  );
};
