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
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-xs space-y-1.5">
      <p className="font-bold text-foreground text-[11px]">{t('toolsInternal.weightGain.week')} {label}</p>
      {actual?.value != null && (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-primary font-bold">{actual.value.toFixed(1)} kg</span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded bg-primary/20" />
        <span className="text-muted-foreground">{min?.value?.toFixed(1)} – {max?.value?.toFixed(1)} kg</span>
      </div>
    </div>
  );
}

export function WeightGainChart({ chartData, t }: WeightGainChartProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden">
        {/* Header gradient stripe */}
        <div className="h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
        
        <CardContent className="p-4 pt-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[12px] font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              {t('toolsInternal.weightGain.weightGainTrend')}
            </h3>
            {/* Trimester markers legend */}
            <div className="flex items-center gap-2 text-[8px] text-muted-foreground">
              <span>T1</span>
              <span className="w-px h-3 bg-border" />
              <span>T2</span>
              <span className="w-px h-3 bg-border" />
              <span>T3</span>
            </div>
          </div>
          
          <div className="h-52 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="rangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 0.5 }}
                  interval={3}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  unit="kg"
                />
                <Tooltip content={<CustomTooltip t={t} />} />
                
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" strokeWidth={0.5} />
                <ReferenceLine x={13} stroke="hsl(var(--muted-foreground)/0.15)" strokeDasharray="4 4" />
                <ReferenceLine x={26} stroke="hsl(var(--muted-foreground)/0.15)" strokeDasharray="4 4" />

                <Area
                  type="monotone"
                  dataKey="max"
                  stroke="hsl(var(--primary)/0.2)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  fill="url(#rangeGrad)"
                  dot={false}
                  activeDot={false}
                />
                <Area
                  type="monotone"
                  dataKey="min"
                  stroke="hsl(var(--primary)/0.2)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  fill="hsl(var(--background))"
                  dot={false}
                  activeDot={false}
                />

                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="url(#lineGrad)"
                  strokeWidth={2.5}
                  dot={{ fill: 'hsl(var(--primary))', r: 4, strokeWidth: 2.5, stroke: 'hsl(var(--background))' }}
                  activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 3 }}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-2 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-[2.5px] rounded-full bg-primary inline-block" />
              {t('toolsInternal.weightGain.yourWeight')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-2.5 rounded bg-primary/10 border border-primary/20 inline-block" />
              {t('toolsInternal.weightGain.chartNote')}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
