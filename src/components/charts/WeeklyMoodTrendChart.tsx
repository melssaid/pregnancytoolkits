import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Smile, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { safeParseLocalStorage } from "@/lib/safeStorage";
import { getDateLocale } from "@/lib/dateLocale";

interface DailyLog {
  date: string;
  mood: number;
  symptoms?: string[];
}

const MOOD_EMOJIS = ["", "😢", "😟", "😐", "😊", "🤩"];

export const WeeklyMoodTrendChart = memo(function WeeklyMoodTrendChart() {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);

  const { chartData, stats } = useMemo(() => {
    const logs = safeParseLocalStorage<DailyLog[]>(
      "quick_symptom_logs",
      [],
      (d): d is DailyLog[] => Array.isArray(d)
    );
    const days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
    const data = days.map((day) => {
      const key = format(day, "yyyy-MM-dd");
      const entry = logs.find((l) => l.date?.startsWith(key));
      return {
        date: format(day, "EEE", { locale }),
        fullDate: format(day, "PP", { locale }),
        mood: entry?.mood ?? null,
      };
    });
    const valid = data.filter((d) => d.mood !== null) as { mood: number }[];
    if (valid.length === 0)
      return { chartData: data, stats: { avg: 0, trend: "neutral" as const, count: 0 } };
    const avg = valid.reduce((s, d) => s + d.mood, 0) / valid.length;
    let trend: "up" | "down" | "neutral" = "neutral";
    if (valid.length >= 4) {
      const half = Math.floor(valid.length / 2);
      const a = valid.slice(0, half).reduce((s, d) => s + d.mood, 0) / half;
      const b = valid.slice(half).reduce((s, d) => s + d.mood, 0) / (valid.length - half);
      if (b > a + 0.3) trend = "up";
      else if (b < a - 0.3) trend = "down";
    }
    return { chartData: data, stats: { avg, trend, count: valid.length } };
  }, [locale]);

  if (stats.count === 0) return null;

  const TrendIcon = stats.trend === "up" ? TrendingUp : stats.trend === "down" ? TrendingDown : Minus;
  const trendColor =
    stats.trend === "up" ? "text-success" : stats.trend === "down" ? "text-warning" : "text-muted-foreground";

  return (
    <section
      aria-labelledby="weekly-mood-title"
      className="rounded-3xl border border-border/30 bg-card p-4 shadow-sm"
    >
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Smile className="w-4 h-4 text-amber-500" aria-hidden="true" />
          </div>
          <h3 id="weekly-mood-title" className="text-base font-bold text-foreground">
            {t("charts.weeklyMood.title", "اتجاه المزاج الأسبوعي")}
          </h3>
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t(`charts.weeklyMood.trend.${stats.trend}`, stats.trend)}</span>
        </div>
      </header>

      <div className="h-[160px] w-full" role="img" aria-label={t("charts.weeklyMood.aria", "رسم بياني لاتجاه المزاج خلال آخر 7 أيام")}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[1, 5]} ticks={[1, 3, 5]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              wrapperStyle={{ outline: "none" }}
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                fontSize: "0.8rem",
                color: "hsl(var(--popover-foreground))",
              }}
              formatter={(v: any) =>
                v == null
                  ? [t("charts.weeklyMood.noEntry", "لا يوجد إدخال"), ""]
                  : [`${MOOD_EMOJIS[Math.round(v)] || ""} ${v}/5`, t("charts.weeklyMood.mood", "المزاج")]
              }
              labelFormatter={(_, payload: any) => payload?.[0]?.payload?.fullDate ?? ""}
            />
            <ReferenceLine y={stats.avg} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" opacity={0.5} />
            <Area type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#moodGrad)" connectNulls />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-muted/40 py-2">
          <dt className="text-[10px] text-muted-foreground">{t("charts.weeklyMood.average", "المتوسط")}</dt>
          <dd className="text-sm font-bold text-foreground">
            {MOOD_EMOJIS[Math.round(stats.avg)] || ""} {stats.avg.toFixed(1)}
          </dd>
        </div>
        <div className="rounded-xl bg-muted/40 py-2">
          <dt className="text-[10px] text-muted-foreground">{t("charts.weeklyMood.entries", "الإدخالات")}</dt>
          <dd className="text-sm font-bold text-foreground">{stats.count}/7</dd>
        </div>
        <div className="rounded-xl bg-muted/40 py-2">
          <dt className="text-[10px] text-muted-foreground">{t("charts.weeklyMood.range", "النطاق")}</dt>
          <dd className="text-sm font-bold text-foreground">1–5</dd>
        </div>
      </dl>
    </section>
  );
});

export default WeeklyMoodTrendChart;
