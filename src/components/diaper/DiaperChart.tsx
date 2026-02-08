import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { BarChart3 } from "lucide-react";
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
        date: format(date, "MM/dd"),
        wet: dayEntries.filter(e => e.type === "wet" || e.type === "both").length,
        dirty: dayEntries.filter(e => e.type === "dirty" || e.type === "both").length,
      });
    }
    
    return data;
  }, [entries]);

  const hasData = chartData.some(d => d.wet > 0 || d.dirty > 0);

  if (!hasData) return null;

  const avg = entries.length > 0 
    ? (chartData.reduce((s, d) => s + d.wet + d.dirty, 0) / 7).toFixed(1)
    : "0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-semibold">{t('diaperPage.weeklyTrend')}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              ≈ {avg} {t('diaperPage.avgPerDay')}
            </span>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={2}>
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 11 }} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  allowDecimals={false} 
                  tick={{ fontSize: 11 }} 
                  tickLine={false} 
                  axisLine={false}
                  width={24}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid hsl(var(--border))',
                    backgroundColor: 'hsl(var(--card))',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === 'wet' ? t('diaperPage.wet') : t('diaperPage.dirty')
                  ]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      return (payload[0].payload as any).date;
                    }
                    return label;
                  }}
                />
                <Legend 
                  formatter={(value) => (
                    <span className="text-xs">
                      {value === 'wet' ? t('diaperPage.wet') : t('diaperPage.dirty')}
                    </span>
                  )}
                />
                <Bar 
                  dataKey="wet" 
                  fill="hsl(210, 80%, 60%)" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={28}
                />
                <Bar 
                  dataKey="dirty" 
                  fill="hsl(30, 70%, 50%)" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
