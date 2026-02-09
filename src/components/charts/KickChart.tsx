import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

interface KickSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  kicks: number;
  duration: number; // in seconds
}

interface KickChartProps {
  sessions: KickSession[];
}

export function KickChart({ sessions }: KickChartProps) {
  const { t } = useTranslation();
  
  const chartData = useMemo(() => {
    // Get last 7 sessions
    const recentSessions = sessions.slice(0, 7).reverse();
    
    return recentSessions.map((session) => ({
      date: format(session.startTime, "EEE"),
      fullDate: format(session.startTime, "MMM d"),
      kicks: session.kicks,
      duration: Math.round(session.duration / 60), // Convert to minutes
      isGood: session.kicks >= 10 && session.duration <= 7200,
    }));
  }, [sessions]);

  const averageKicks = useMemo(() => {
    if (chartData.length === 0) return 0;
    return chartData.reduce((sum, d) => sum + d.kicks, 0) / chartData.length;
  }, [chartData]);

  if (sessions.length < 2) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            {t('charts.kick.noData')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{data.fullDate}</p>
          <p className="text-primary">
            {data.kicks} {t('charts.kick.kicks')}
          </p>
          <p className="text-muted-foreground text-sm">
            {t('charts.kick.duration')}: {data.duration} {t('charts.kick.min')}
          </p>
          {data.isGood && (
            <p className="text-success text-sm mt-1">✓ {t('charts.kick.excellentActivity')}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          {t('charts.kick.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="kickGradientGood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="kickGradientNormal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                domain={[0, 'dataMax + 2']}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Goal line at 10 kicks */}
              <ReferenceLine
                y={10}
                stroke="hsl(var(--success))"
                strokeDasharray="5 5"
                label={{
                  value: t('charts.kick.goal'),
                  fill: "hsl(var(--success))",
                  fontSize: 10,
                  position: "right",
                }}
              />
              
              <Bar
                dataKey="kicks"
                radius={[8, 8, 0, 0]}
                maxBarSize={50}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isGood ? "url(#kickGradientGood)" : "url(#kickGradientNormal)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-secondary rounded-lg p-3 text-center">
            <p className="text-base font-bold text-primary">{averageKicks.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">{t('charts.kick.avgKicks')}</p>
          </div>
          <div className="bg-secondary rounded-lg p-3 text-center">
            <p className="text-base font-bold text-success">
              {chartData.filter(d => d.isGood).length}
            </p>
            <p className="text-xs text-muted-foreground">{t('charts.kick.excellentSessions')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default KickChart;
