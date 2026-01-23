import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Scatter,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Baby, TrendingUp } from "lucide-react";

interface GrowthEntry {
  id: string;
  date: string;
  ageMonths: number;
  weight: number;
  height?: number;
  headCirc?: number;
  gender: "boy" | "girl";
}

interface BabyGrowthChartProps {
  entries: GrowthEntry[];
  gender: "boy" | "girl";
}

// WHO growth standards
const WHO_WEIGHT_BOYS = [
  { month: 0, p3: 2.5, p50: 3.3, p97: 4.3 },
  { month: 1, p3: 3.4, p50: 4.5, p97: 5.8 },
  { month: 2, p3: 4.3, p50: 5.6, p97: 7.1 },
  { month: 3, p3: 5.0, p50: 6.4, p97: 8.0 },
  { month: 4, p3: 5.6, p50: 7.0, p97: 8.7 },
  { month: 5, p3: 6.0, p50: 7.5, p97: 9.3 },
  { month: 6, p3: 6.4, p50: 7.9, p97: 9.8 },
  { month: 9, p3: 7.2, p50: 9.0, p97: 11.0 },
  { month: 12, p3: 7.8, p50: 9.6, p97: 11.8 },
  { month: 18, p3: 8.9, p50: 10.9, p97: 13.5 },
  { month: 24, p3: 9.8, p50: 12.2, p97: 15.3 },
];

const WHO_WEIGHT_GIRLS = [
  { month: 0, p3: 2.4, p50: 3.2, p97: 4.2 },
  { month: 1, p3: 3.2, p50: 4.2, p97: 5.5 },
  { month: 2, p3: 3.9, p50: 5.1, p97: 6.6 },
  { month: 3, p3: 4.5, p50: 5.8, p97: 7.5 },
  { month: 4, p3: 5.0, p50: 6.4, p97: 8.2 },
  { month: 5, p3: 5.4, p50: 6.9, p97: 8.8 },
  { month: 6, p3: 5.8, p50: 7.3, p97: 9.3 },
  { month: 9, p3: 6.6, p50: 8.2, p97: 10.4 },
  { month: 12, p3: 7.1, p50: 8.9, p97: 11.3 },
  { month: 18, p3: 8.2, p50: 10.2, p97: 13.0 },
  { month: 24, p3: 9.2, p50: 11.5, p97: 14.8 },
];

export function BabyGrowthChart({ entries, gender }: BabyGrowthChartProps) {
  const chartData = useMemo(() => {
    const standards = gender === "boy" ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS;
    
    // Create base data from standards
    const baseData = standards.map((s) => ({
      month: s.month,
      p3: s.p3,
      p50: s.p50,
      p97: s.p97,
      actual: undefined as number | undefined,
    }));
    
    // Add actual entries
    entries.forEach((entry) => {
      const existingIndex = baseData.findIndex((d) => d.month === entry.ageMonths);
      if (existingIndex >= 0) {
        baseData[existingIndex].actual = entry.weight;
      } else {
        // Insert at correct position
        const insertIndex = baseData.findIndex((d) => d.month > entry.ageMonths);
        const prevStandard = standards.find((s) => s.month <= entry.ageMonths) || standards[0];
        const nextStandard = standards.find((s) => s.month > entry.ageMonths) || standards[standards.length - 1];
        
        // Interpolate percentiles
        const ratio = (entry.ageMonths - prevStandard.month) / (nextStandard.month - prevStandard.month || 1);
        
        const newPoint = {
          month: entry.ageMonths,
          p3: prevStandard.p3 + ratio * (nextStandard.p3 - prevStandard.p3),
          p50: prevStandard.p50 + ratio * (nextStandard.p50 - prevStandard.p50),
          p97: prevStandard.p97 + ratio * (nextStandard.p97 - prevStandard.p97),
          actual: entry.weight,
        };
        
        if (insertIndex === -1) {
          baseData.push(newPoint);
        } else {
          baseData.splice(insertIndex, 0, newPoint);
        }
      }
    });
    
    return baseData;
  }, [entries, gender]);

  if (entries.length < 1) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            أضيفي قياساً واحداً على الأقل لعرض الرسم البياني
          </p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">
            الشهر {label}
          </p>
          {data.actual && (
            <p className="text-primary font-medium">
              الوزن الفعلي: {data.actual.toFixed(1)} كجم
            </p>
          )}
          <div className="text-sm text-muted-foreground mt-1">
            <p>الحد الأدنى (3%): {data.p3.toFixed(1)} كجم</p>
            <p>المتوسط (50%): {data.p50.toFixed(1)} كجم</p>
            <p>الحد الأعلى (97%): {data.p97.toFixed(1)} كجم</p>
          </div>
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
          منحنى نمو الوزن - معايير منظمة الصحة العالمية
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="normalRangeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                label={{
                  value: "العمر (شهور)",
                  position: "bottom",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                label={{
                  value: "الوزن (كجم)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Normal range area (p3 to p97) */}
              <Area
                type="monotone"
                dataKey="p97"
                stroke="transparent"
                fill="url(#normalRangeGradient)"
              />
              
              {/* Percentile lines */}
              <Line
                type="monotone"
                dataKey="p3"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="3%"
              />
              <Line
                type="monotone"
                dataKey="p50"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                dot={false}
                name="50%"
              />
              <Line
                type="monotone"
                dataKey="p97"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="97%"
              />
              
              {/* Actual measurements */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: "hsl(var(--primary))" }}
                connectNulls
                name="طفلك"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-primary" />
            <span className="text-muted-foreground">
              وزن {gender === "boy" ? "طفلك" : "طفلتك"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-success" />
            <span className="text-muted-foreground">المتوسط (50%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success/20" />
            <span className="text-muted-foreground">النطاق الطبيعي</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BabyGrowthChart;
