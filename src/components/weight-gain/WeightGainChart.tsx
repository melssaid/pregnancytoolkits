import React from 'react';
import { TFunction } from 'i18next';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, ComposedChart, ReferenceLine,
} from 'recharts';

interface ChartDataPoint {
  week: number;
  min: number;
  max: number;
  actual: number | null;
}

interface WeightGainChartProps {
  chartData: ChartDataPoint[];
  t: TFunction;
}

function CustomTooltip({ active, payload, label, t }: any) {
  if (!active || !payload?.length) return null;
  const actual = payload.find((p: any) => p.dataKey === 'actual');
  const min = payload.find((p: any) => p.dataKey === 'min');
  const max = payload.find((p: any) => p.dataKey === 'max');
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs space-y-1">
      <p className="font-bold text-foreground">{t('toolsInternal.weightGain.week')} {label}</p>
      {actual?.value != null && (
        <p className="text-primary font-semibold">⚖️ {actual.value.toFixed(1)} kg</p>
      )}
      <p className="text-muted-foreground">
        📊 {min?.value?.toFixed(1)} – {max?.value?.toFixed(1)} kg
      </p>
    </div>
  );
}

export function WeightGainChart({ chartData, t }: WeightGainChartProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="p-4 pt-5">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            {t('toolsInternal.weightGain.weightGainTrend')}
          </h3>
          <div className="h-56 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="rangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.03} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  interval={3}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  width={35}
                  unit=" kg"
                />
                <Tooltip content={<CustomTooltip t={t} />} />
                
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />

                {/* Trimester markers */}
                <ReferenceLine x={13} stroke="hsl(var(--muted-foreground)/0.2)" strokeDasharray="4 4" />
                <ReferenceLine x={26} stroke="hsl(var(--muted-foreground)/0.2)" strokeDasharray="4 4" />

                <Area
                  type="monotone"
                  dataKey="max"
                  stroke="hsl(var(--primary)/0.25)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  fill="url(#rangeGrad)"
                  dot={false}
                  activeDot={false}
                />
                <Area
                  type="monotone"
                  dataKey="min"
                  stroke="hsl(var(--primary)/0.25)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  fill="hsl(var(--background))"
                  dot={false}
                  activeDot={false}
                />

                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ fill: 'hsl(var(--primary))', r: 3.5, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  activeDot={{ r: 5, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-5 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-[2.5px] rounded-full bg-primary inline-block" />
              {t('toolsInternal.weightGain.yourWeight')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-3 rounded bg-primary/10 border border-primary/20 inline-block" />
              {t('toolsInternal.weightGain.chartNote')}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
