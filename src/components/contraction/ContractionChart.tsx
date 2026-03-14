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
} from "recharts";
import { useTranslation } from "react-i18next";

interface Contraction {
  id: string;
  start: number;
  end: number | null;
  duration: number;
}

interface ContractionChartProps {
  contractions: Contraction[];
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ContractionChart({ contractions }: ContractionChartProps) {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    if (contractions.length < 2) return [];
    const sorted = [...contractions].reverse();
    return sorted.map((c, i) => {
      const interval =
        i > 0
          ? Math.floor(
              (c.start - (sorted[i - 1].end || sorted[i - 1].start)) / 1000
            )
          : 0;
      return {
        index: i + 1,
        label: `#${i + 1}`,
        duration: c.duration,
        interval: Math.max(0, interval),
        time: new Date(c.start).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });
  }, [contractions]);

  if (chartData.length < 2) return null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs space-y-1">
        <p className="font-bold text-foreground">{d.time}</p>
        <p className="text-destructive">
          {t("toolsInternal.contractionTimer.duration", "مدة")}:{" "}
          {formatDuration(d.duration)}
        </p>
        {d.interval > 0 && (
          <p className="text-primary">
            {t("toolsInternal.contractionTimer.gap", "فاصل")}:{" "}
            {formatDuration(d.interval)}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-foreground px-1">
        {t("toolsInternal.contractionTimer.chartTitle", "نمط الانقباضات")}
      </h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="durationGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(var(--destructive))"
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--destructive))"
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="intervalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${Math.floor(v / 60)}m`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={60}
              stroke="hsl(var(--destructive))"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
            />
            <Area
              type="monotone"
              dataKey="duration"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              fill="url(#durationGrad)"
              dot={{ r: 3, fill: "hsl(var(--destructive))" }}
              name={t("toolsInternal.contractionTimer.duration", "مدة")}
            />
            <Area
              type="monotone"
              dataKey="interval"
              stroke="hsl(var(--primary))"
              strokeWidth={1.5}
              fill="url(#intervalGrad)"
              dot={{ r: 2, fill: "hsl(var(--primary))" }}
              name={t("toolsInternal.contractionTimer.gap", "فاصل")}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-destructive" />
          {t("toolsInternal.contractionTimer.duration", "مدة")}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          {t("toolsInternal.contractionTimer.gap", "فاصل")}
        </span>
      </div>
    </div>
  );
}
