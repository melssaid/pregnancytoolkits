import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { safeParseLocalStorage } from "@/lib/safeStorage";
import { STORAGE_KEYS } from "@/lib/dataBus";
import { getUserId } from "@/hooks/useSupabase";

type Range = 7 | 30;

interface DayPoint {
  date: string; // YYYY-MM-DD
  weight?: number;
  symptomCount?: number;
  hydration?: number;
  mood?: number;
}

const METRICS = [
  { key: "weight", color: "hsl(330 70% 55%)", labelKey: "dashboardV2.holistic.timeline.metrics.weight" },
  { key: "mood", color: "hsl(45 90% 55%)", labelKey: "dashboardV2.holistic.timeline.metrics.mood" },
  { key: "hydration", color: "hsl(200 80% 55%)", labelKey: "dashboardV2.holistic.timeline.metrics.hydration" },
  { key: "symptomCount", color: "hsl(280 60% 60%)", labelKey: "dashboardV2.holistic.timeline.metrics.symptoms" },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

function buildDateRange(days: number): string[] {
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function buildPath(values: Array<number | undefined>, w: number, h: number, pad = 4): string {
  const valid = values.map((v, i) => ({ v, i })).filter((x) => x.v !== undefined) as { v: number; i: number }[];
  if (valid.length < 2) return "";
  const min = Math.min(...valid.map((x) => x.v));
  const max = Math.max(...valid.map((x) => x.v));
  const span = max - min || 1;
  const stepX = (w - pad * 2) / Math.max(1, values.length - 1);
  return valid
    .map((p, idx) => {
      const x = pad + p.i * stepX;
      const y = pad + (h - pad * 2) * (1 - (p.v - min) / span);
      return `${idx === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

interface HolisticTimelineChartProps {
  initialRange?: Range;
}

export const HolisticTimelineChart = memo(function HolisticTimelineChart({
  initialRange = 7,
}: HolisticTimelineChartProps = {}) {
  const { t } = useTranslation();
  const [range, setRange] = useState<Range>(initialRange);
  const [active, setActive] = useState<MetricKey>("weight");

  const points = useMemo<DayPoint[]>(() => {
    const userId = getUserId();
    const dates = buildDateRange(range);
    const symptoms = safeParseLocalStorage<any[]>(STORAGE_KEYS.SYMPTOM_LOGS, []) || [];
    const weightEntries = safeParseLocalStorage<any[]>(STORAGE_KEYS.WEIGHT_ENTRIES, []) || [];
    const waterLogs = safeParseLocalStorage<any[]>(STORAGE_KEYS.WATER_LOGS(userId), []) || [];

    const wMap = new Map<string, number>();
    weightEntries.forEach((e: any) => {
      const d = (e?.date || "").slice(0, 10);
      const kg = Number(e?.weight ?? e?.kg);
      if (d && kg > 0) wMap.set(d, kg);
    });
    const sCountMap = new Map<string, number>();
    const moodMap = new Map<string, number>();
    symptoms.forEach((l: any) => {
      const d = (l?.date || l?.timestamp || "").slice(0, 10);
      if (!d) return;
      if (Array.isArray(l?.symptoms) && l.symptoms.length > 0) {
        sCountMap.set(d, (sCountMap.get(d) || 0) + l.symptoms.length);
      }
      if ((l?.mood ?? 0) > 0) moodMap.set(d, Number(l.mood));
    });
    const hMap = new Map<string, number>();
    waterLogs.forEach((e: any) => {
      const d = (e?.date || "").slice(0, 10);
      const ml = Number(e?.totalMl ?? e?.ml);
      if (d && ml > 0) hMap.set(d, ml);
    });

    return dates.map((d) => ({
      date: d,
      weight: wMap.get(d),
      symptomCount: sCountMap.get(d),
      hydration: hMap.get(d),
      mood: moodMap.get(d),
    }));
  }, [range]);

  const series = useMemo(() => points.map((p) => p[active]), [points, active]);
  const hasData = series.some((v) => v !== undefined);
  const meta = METRICS.find((m) => m.key === active)!;

  const w = 280;
  const h = 70;
  const path = buildPath(series, w, h);

  return (
    <div
      className="rounded-xl p-3 space-y-2"
      style={{ background: "hsl(0 0% 100% / 0.55)", border: "1px solid hsl(330 30% 90% / 0.6)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-bold text-foreground/85">
          {t("dashboardV2.holistic.timeline.title")}
        </span>
        <div className="inline-flex rounded-full bg-foreground/5 p-0.5 text-[10px] font-semibold">
          {([7, 30] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-0.5 rounded-full transition-colors ${
                range === r ? "bg-white text-foreground shadow-sm" : "text-foreground/60"
              }`}
            >
              {t("dashboardV2.holistic.timeline.range", { count: r })}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {METRICS.map((m) => {
          const isActive = m.key === active;
          return (
            <button
              key={m.key}
              onClick={() => setActive(m.key)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                isActive ? "text-foreground" : "text-foreground/55 hover:text-foreground/80"
              }`}
              style={{
                background: isActive ? `${m.color.replace("hsl(", "hsl(").replace(")", " / 0.18)")}` : "transparent",
                border: `1px solid ${isActive ? m.color : "hsl(0 0% 0% / 0.08)"}`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
              {t(m.labelKey)}
            </button>
          );
        })}
      </div>

      <div className="relative" style={{ height: h }}>
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id={`grad-${active}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={meta.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={meta.color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {hasData && path ? (
            <>
              <path d={`${path} L${w - 4},${h - 4} L4,${h - 4} Z`} fill={`url(#grad-${active})`} />
              <path d={path} fill="none" stroke={meta.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </>
          ) : null}
        </svg>
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center text-[11px] text-muted-foreground">
            {t("dashboardV2.holistic.timeline.empty")}
          </div>
        )}
      </div>
    </div>
  );
});

export default HolisticTimelineChart;
