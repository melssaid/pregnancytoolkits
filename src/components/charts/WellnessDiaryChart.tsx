import { useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DiaryEntry {
  id: string;
  date: string;
  week: number;
  symptoms: string[];
  mood: string;
  notes: string;
  aiInsight?: string;
  createdAt: string;
}

const MOOD_VALUES: Record<string, number> = {
  great: 5, good: 4, okay: 3, tired: 2, tough: 1,
};
const MOOD_EMOJIS: Record<string, string> = {
  great: "😊", good: "🙂", okay: "😐", tired: "😴", tough: "😟",
};

const SYMPTOM_EMOJIS: Record<string, string> = {
  nausea: "🤢", fatigue: "😴", headache: "🤕", backpain: "💆",
  cramps: "⚡", swelling: "🦶", heartburn: "🔥", insomnia: "🌙",
  moodswings: "🎭", dizziness: "💫",
};

export function WellnessDiaryChart({ entries }: { entries: DiaryEntry[] }) {
  const { t } = useTranslation();

  const moodData = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 13),
      end: new Date(),
    });

    return days.map((day) => {
      const dayStr = day.toISOString().split("T")[0];
      const dayEntries = entries.filter((e) => e.date === dayStr);
      const moodEntry = dayEntries.find((e) => e.mood && MOOD_VALUES[e.mood]);
      const moodVal = moodEntry ? MOOD_VALUES[moodEntry.mood] : null;

      return {
        date: format(day, "MM/dd"),
        shortDate: format(day, "EEE"),
        mood: moodVal,
        symptoms: dayEntries.reduce((sum, e) => sum + e.symptoms.length, 0),
      };
    });
  }, [entries]);

  const symptomFrequency = useMemo(() => {
    const freq: Record<string, number> = {};
    const last14 = entries.filter((e) => {
      const d = new Date(e.date);
      return d >= subDays(new Date(), 13);
    });
    last14.forEach((e) => e.symptoms.forEach((s) => {
      freq[s] = (freq[s] || 0) + 1;
    }));
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id, count]) => ({
        name: t(`toolsInternal.symptomAnalyzer.symptoms.${id}`),
        emoji: SYMPTOM_EMOJIS[id] || "",
        count,
      }));
  }, [entries, t]);

  const stats = useMemo(() => {
    const valid = moodData.filter((d) => d.mood !== null);
    if (valid.length === 0) return { avg: 0, trend: "neutral" as const };
    const avg = valid.reduce((s, d) => s + (d.mood || 0), 0) / valid.length;
    const half = Math.floor(valid.length / 2);
    if (valid.length >= 4) {
      const first = valid.slice(0, half).reduce((s, d) => s + (d.mood || 0), 0) / half;
      const second = valid.slice(half).reduce((s, d) => s + (d.mood || 0), 0) / (valid.length - half);
      if (second > first + 0.3) return { avg, trend: "up" as const };
      if (second < first - 0.3) return { avg, trend: "down" as const };
    }
    return { avg, trend: "neutral" as const };
  }, [moodData]);

  if (entries.length < 2) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-xs text-muted-foreground">
            {t("toolsInternal.symptomAnalyzer.chartMinEntries")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const MoodTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const moodKey = Object.entries(MOOD_VALUES).find(([, v]) => v === d.mood)?.[0];
    return (
      <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-xs">
        <p className="font-semibold">{d.date}</p>
        {d.mood && moodKey && (
          <p>{MOOD_EMOJIS[moodKey]} {t(`toolsInternal.symptomAnalyzer.moods.${moodKey}`)}</p>
        )}
        <p className="text-muted-foreground">
          {t("toolsInternal.symptomAnalyzer.chartSymptomCount", { count: d.symptoms })}
        </p>
      </div>
    );
  };

  const roundedMood = Math.round(stats.avg);
  const moodKey = Object.entries(MOOD_VALUES).find(([, v]) => v === roundedMood)?.[0] || "okay";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <BarChart3 className="w-4 h-4 text-primary" />
          {t("toolsInternal.symptomAnalyzer.chartTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <Tabs defaultValue="mood" className="w-full">
          <TabsList className="w-full h-8 mb-3">
            <TabsTrigger value="mood" className="text-[11px] flex-1">
              {t("toolsInternal.symptomAnalyzer.chartMoodTab")}
            </TabsTrigger>
            <TabsTrigger value="symptoms" className="text-[11px] flex-1">
              {t("toolsInternal.symptomAnalyzer.chartSymptomsTab")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mood" className="mt-0">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="shortDate"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickFormatter={(v) => {
                      const k = Object.entries(MOOD_VALUES).find(([, val]) => val === v)?.[0];
                      return k ? MOOD_EMOJIS[k] : "";
                    }}
                  />
                  <Tooltip content={<MoodTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "hsl(var(--primary))" }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Mood Stats */}
            <div className="flex items-center justify-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span>{MOOD_EMOJIS[moodKey]}</span>
                <div>
                  <p className="font-semibold">{stats.avg.toFixed(1)}/5</p>
                  <p className="text-[10px] text-muted-foreground">{t("toolsInternal.symptomAnalyzer.chartAverage")}</p>
                </div>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-1">
                {stats.trend === "up" && <><TrendingUp className="w-3.5 h-3.5 text-primary" /><span className="text-primary">{t("toolsInternal.symptomAnalyzer.chartImproving")}</span></>}
                {stats.trend === "down" && <><TrendingDown className="w-3.5 h-3.5 text-destructive" /><span className="text-destructive">{t("toolsInternal.symptomAnalyzer.chartDeclining")}</span></>}
                {stats.trend === "neutral" && <><Minus className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-muted-foreground">{t("toolsInternal.symptomAnalyzer.chartStable")}</span></>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="symptoms" className="mt-0">
            {symptomFrequency.length > 0 ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={symptomFrequency} margin={{ top: 5, right: 5, left: -15, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                      width={70}
                    />
                    <Tooltip
                      formatter={(value: number) => [value, t("toolsInternal.symptomAnalyzer.chartTimes")]}
                      contentStyle={{ fontSize: 11, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-8">
                {t("toolsInternal.symptomAnalyzer.chartNoSymptoms")}
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default WellnessDiaryChart;
