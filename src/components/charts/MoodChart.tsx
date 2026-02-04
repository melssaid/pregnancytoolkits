import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { useTranslation } from "react-i18next";

interface MoodEntry {
  id: string;
  date: string;
  mood: number; // 1-5
  note?: string;
}

interface MoodChartProps {
  entries: MoodEntry[];
}

const getMoods = (t: (key: string) => string) => [
  { value: 1, emoji: "😢", label: t('charts.mood.moods.veryBad'), color: "hsl(var(--destructive))" },
  { value: 2, emoji: "😔", label: t('charts.mood.moods.bad'), color: "hsl(var(--warning))" },
  { value: 3, emoji: "😐", label: t('charts.mood.moods.okay'), color: "hsl(var(--muted-foreground))" },
  { value: 4, emoji: "🙂", label: t('charts.mood.moods.good'), color: "hsl(var(--primary))" },
  { value: 5, emoji: "😊", label: t('charts.mood.moods.great'), color: "hsl(var(--success))" },
];

export function MoodChart({ entries }: MoodChartProps) {
  const { t } = useTranslation();
  const MOODS = getMoods(t);
  
  const chartData = useMemo(() => {
    // Get last 14 days
    const days = eachDayOfInterval({
      start: subDays(new Date(), 13),
      end: new Date(),
    });

    return days.map((day) => {
      const entry = entries.find(
        (e) => new Date(e.date).toDateString() === day.toDateString()
      );
      
      return {
        date: format(day, "EEE"),
        fullDate: format(day, "MMM d"),
        mood: entry?.mood || null,
        note: entry?.note,
      };
    });
  }, [entries]);

  const stats = useMemo(() => {
    const validEntries = chartData.filter((d) => d.mood !== null);
    if (validEntries.length === 0) return { avg: 0, trend: "neutral" };
    
    const avg = validEntries.reduce((sum, d) => sum + (d.mood || 0), 0) / validEntries.length;
    
    // Calculate trend (compare first half to second half)
    const halfIndex = Math.floor(validEntries.length / 2);
    if (validEntries.length >= 4) {
      const firstHalf = validEntries.slice(0, halfIndex);
      const secondHalf = validEntries.slice(halfIndex);
      const firstAvg = firstHalf.reduce((s, d) => s + (d.mood || 0), 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((s, d) => s + (d.mood || 0), 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 0.3) return { avg, trend: "up" };
      if (secondAvg < firstAvg - 0.3) return { avg, trend: "down" };
    }
    
    return { avg, trend: "neutral" };
  }, [chartData]);

  if (entries.length < 3) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            {t('charts.mood.noData')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && payload[0].value !== null) {
      const data = payload[0].payload;
      const moodData = MOODS.find((m) => m.value === data.mood);
      
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{data.fullDate}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl">{moodData?.emoji}</span>
            <span className="text-foreground">{moodData?.label}</span>
          </div>
          {data.note && (
            <p className="text-muted-foreground text-sm mt-1 max-w-[200px] truncate">
              "{data.note}"
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.mood === null) return null;
    
    const moodData = MOODS.find((m) => m.value === payload.mood);
    
    return (
      <g>
        <circle cx={cx} cy={cy} r={16} fill="hsl(var(--card))" />
        <text
          x={cx}
          y={cy + 5}
          textAnchor="middle"
          fontSize="14"
        >
          {moodData?.emoji}
        </text>
      </g>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="h-5 w-5 text-primary" />
          {t('charts.mood.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickFormatter={(value) => MOODS.find(m => m.value === value)?.emoji || ""}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Average line */}
              <ReferenceLine
                y={stats.avg}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="5 5"
              />
              
              <Line
                type="monotone"
                dataKey="mood"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={{ r: 8 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {MOODS.find((m) => m.value === Math.round(stats.avg))?.emoji}
            </span>
            <div>
              <p className="font-semibold text-foreground">
                {stats.avg.toFixed(1)}/5
              </p>
              <p className="text-xs text-muted-foreground">{t('charts.mood.average')}</p>
            </div>
          </div>
          
          <div className="h-8 w-px bg-border" />
          
          <div className="flex items-center gap-2">
            {stats.trend === "up" && (
              <>
                <TrendingUp className="h-5 w-5 text-success" />
                <span className="text-success text-sm">{t('charts.mood.improving')}</span>
              </>
            )}
            {stats.trend === "down" && (
              <>
                <TrendingDown className="h-5 w-5 text-warning" />
                <span className="text-warning text-sm">{t('charts.mood.declining')}</span>
              </>
            )}
            {stats.trend === "neutral" && (
              <>
                <Minus className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">{t('charts.mood.stable')}</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MoodChart;
