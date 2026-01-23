import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface WeightEntry {
  id: string;
  date: string;
  week: number;
  weight: number;
}

interface WeightChartProps {
  entries: WeightEntry[];
  recommendedMin: number;
  recommendedMax: number;
  prePregnancyWeight: number;
}

export function WeightChart({
  entries,
  recommendedMin,
  recommendedMax,
  prePregnancyWeight,
}: WeightChartProps) {
  const chartData = useMemo(() => {
    // Sort by week
    const sorted = [...entries].sort((a, b) => a.week - b.week);
    
    return sorted.map((entry) => ({
      week: entry.week,
      weight: entry.weight,
      gain: entry.weight - prePregnancyWeight,
      expectedMin: (entry.week / 40) * recommendedMin,
      expectedMax: (entry.week / 40) * recommendedMax,
    }));
  }, [entries, recommendedMin, recommendedMax, prePregnancyWeight]);

  if (entries.length < 2) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            أضيفي قياسين على الأقل لعرض الرسم البياني
          </p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">الأسبوع {label}</p>
          <p className="text-primary">
            الوزن: {payload[0]?.value?.toFixed(1)} كجم
          </p>
          <p className="text-muted-foreground text-sm">
            الزيادة: +{(payload[0]?.value - prePregnancyWeight).toFixed(1)} كجم
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          تتبع الوزن عبر الأسابيع
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="week"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                label={{ value: "الأسبوع", position: "bottom", fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Expected range area */}
              <Area
                type="monotone"
                dataKey="expectedMax"
                stroke="transparent"
                fill="url(#expectedGradient)"
              />
              
              {/* Actual weight */}
              <Area
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fill="url(#weightGradient)"
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
              />
              
              {/* Pre-pregnancy weight reference */}
              <ReferenceLine
                y={prePregnancyWeight}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="5 5"
                label={{
                  value: "وزن ما قبل الحمل",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 10,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">وزنك الفعلي</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success/30" />
            <span className="text-muted-foreground">النطاق الموصى به</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default WeightChart;
