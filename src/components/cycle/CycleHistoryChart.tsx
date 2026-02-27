import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, Cell } from "recharts";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { getDateLocale } from "@/lib/dateLocale";
import { useLanguage } from "@/contexts/LanguageContext";
import type { DetectedCycle } from "@/hooks/useCycleData";

interface CycleHistoryChartProps {
  cycles: DetectedCycle[];
  avgCycle: number;
}

export const CycleHistoryChart = ({ cycles, avgCycle }: CycleHistoryChartProps) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const locale = getDateLocale(currentLanguage);

  const chartData = useMemo(() => {
    return cycles
      .filter(c => c.cycleLength && c.cycleLength > 0 && c.cycleLength < 60)
      .map((c, i) => ({
        label: format(new Date(c.startDate), "MMM d", { locale }),
        length: c.cycleLength!,
        period: c.periodLength,
        idx: i,
      }));
  }, [cycles, locale]);

  if (chartData.length < 2) return null;

  const getBarColor = (length: number) => {
    const diff = Math.abs(length - avgCycle);
    if (diff <= 2) return "hsl(var(--primary))";
    if (diff <= 5) return "hsl(35, 80%, 55%)";
    return "hsl(0, 70%, 55%)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <Card className="overflow-hidden rounded-3xl">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-bold">
                {t('toolsInternal.cycleTracker.cycleHistory', 'Cycle History')}
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {t('toolsInternal.cycleTracker.avgLabel', 'Avg')}: {avgCycle} {t('toolsInternal.cycleTracker.days', 'days')}
            </span>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={2}>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis domain={['dataMin - 3', 'dataMax + 3']} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '14px',
                    border: '1px solid hsl(var(--border))',
                    backgroundColor: 'hsl(var(--card))',
                    fontSize: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} ${t('toolsInternal.cycleTracker.days', 'days')}`,
                    name === 'length'
                      ? t('toolsInternal.cycleTracker.cycleLength', 'Cycle length')
                      : t('toolsInternal.cycleTracker.periodLength', 'Period length'),
                  ]}
                />
                <ReferenceLine
                  y={avgCycle}
                  stroke="hsl(var(--primary) / 0.35)"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
                <Bar dataKey="length" radius={[6, 6, 0, 0]} maxBarSize={28}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={getBarColor(entry.length)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'hsl(var(--primary))' }} />
              {t('toolsInternal.cycleTracker.normal', 'Normal')}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'hsl(35, 80%, 55%)' }} />
              {t('toolsInternal.cycleTracker.slightVariation', 'Slight variation')}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'hsl(0, 70%, 55%)' }} />
              {t('toolsInternal.cycleTracker.irregular', 'Irregular')}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
