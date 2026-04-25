import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Activity, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useHolisticDashboardSnapshot } from "@/hooks/useHolisticDashboardSnapshot";

interface SignalRow {
  flag: string;
  label: string;
  value: string;
  tone: "risk" | "positive";
}

/**
 * Live preview of every risk flag and positive signal that the snapshot derived,
 * each annotated with the EXACT measured value that triggered it.
 * Updates reactively because useHolisticDashboardSnapshot reads from dataBus.
 */
export const SignalsPreviewPanel = memo(function SignalsPreviewPanel() {
  const { t } = useTranslation();
  const { derivedInsights } = useHolisticDashboardSnapshot();
  const d = derivedInsights;

  const fmt = (n?: number, digits = 1) =>
    n === undefined || !Number.isFinite(n) ? "—" : n.toFixed(digits);

  // Map flag string → human-readable value annotation
  const valueOf = (flag: string): string => {
    switch (flag) {
      case "low_mood_3plus_days_last_week":
        return t("dashboardV2.signals.values.lowMoodDays", { count: d.mood.lowMoodDays });
      case "avg_mood_below_threshold":
        return t("dashboardV2.signals.values.avgMood", { value: fmt(d.mood.avgLevel, 2) });
      case "hydration_below_target":
        return t("dashboardV2.signals.values.hydrationPct", {
          pct: d.hydration.targetAchievementPct ?? 0,
          ml: d.hydration.avgMlPerDay ?? 0,
        });
      case "vitamin_adherence_low":
        return t("dashboardV2.signals.values.vitaminDays", {
          days: d.vitamins.last7DaysCount,
          pct: d.vitamins.adherencePct,
        });
      case "low_kick_tracking_third_trimester":
        return t("dashboardV2.signals.values.kickSessions", {
          count: d.kicks.sessionsLast7Days,
        });
      case "no_kick_session_48h_third_trimester":
        return t("dashboardV2.signals.values.lastKickHours", {
          hours: d.kicks.lastSessionAgoHours ?? 0,
        });
      case "recurring_symptom_pattern":
        return d.symptoms.topSymptoms[0]
          ? t("dashboardV2.signals.values.topSymptom", {
              name: d.symptoms.topSymptoms[0].name,
              count: d.symptoms.topSymptoms[0].count,
            })
          : "—";
      case "strong_vitamin_streak":
        return t("dashboardV2.signals.values.vitaminDays", {
          days: d.vitamins.last7DaysCount,
          pct: d.vitamins.adherencePct,
        });
      case "hydration_on_target":
        return t("dashboardV2.signals.values.hydrationPct", {
          pct: d.hydration.targetAchievementPct ?? 0,
          ml: d.hydration.avgMlPerDay ?? 0,
        });
      case "positive_mood_trend":
        return t("dashboardV2.signals.values.avgMood", { value: fmt(d.mood.avgLevel, 2) });
      case "consistent_kick_tracking":
        return t("dashboardV2.signals.values.kickSessions", {
          count: d.kicks.sessionsLast7Days,
        });
      case "weight_gain_within_healthy_range":
        return t("dashboardV2.signals.values.weeklyGain", {
          value: fmt(d.weight.weeklyAvgGainKg, 2),
        });
      case "upcoming_care_appointment_scheduled":
        return t("dashboardV2.signals.values.daysUntil", {
          days: d.appointments.daysUntilNext ?? 0,
        });
      case "high_tracking_engagement":
        return t("dashboardV2.signals.values.engagement", { pct: d.engagementScore });
      case "ultrasound_journal_consistent":
        return t("dashboardV2.signals.values.ultrasoundCount", { count: d.ultrasound.count });
      case "recent_ultrasound_ai_reading_available":
        return t("dashboardV2.signals.values.weekTag", { week: d.ultrasound.latestWeek ?? "—" });
      default:
        return "—";
    }
  };

  const rows: SignalRow[] = [
    ...d.riskFlags.map<SignalRow>((flag) => ({
      flag,
      label: t(`dashboardV2.signals.labels.${flag}`, { defaultValue: flag.replace(/_/g, " ") }),
      value: valueOf(flag),
      tone: "risk" as const,
    })),
    ...d.positiveSignals.map<SignalRow>((flag) => ({
      flag,
      label: t(`dashboardV2.signals.labels.${flag}`, { defaultValue: flag.replace(/_/g, " ") }),
      value: valueOf(flag),
      tone: "positive" as const,
    })),
  ];

  return (
    <Card
      className="overflow-hidden border-0"
      style={{
        background: "linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(280 30% 98%) 100%)",
        boxShadow: "0 4px 14px -4px hsl(280 40% 50% / 0.12)",
        border: "1px solid hsl(280 30% 92%)",
      }}
    >
      <CardContent className="pt-4 pb-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-2">
          <div
            className="shrink-0 p-1.5 rounded-xl"
            style={{ background: "linear-gradient(135deg, hsl(280 60% 55%), hsl(330 60% 55%))" }}
          >
            <Activity className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[14px] text-foreground leading-tight">
              {t("dashboardV2.signals.title")}
            </h3>
            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
              {t("dashboardV2.signals.subtitle", {
                positive: d.positiveSignals.length,
                risks: d.riskFlags.length,
              })}
            </p>
          </div>
        </div>

        {rows.length === 0 ? (
          <div
            className="flex items-center gap-2 rounded-lg px-2.5 py-3 text-[11px] text-muted-foreground"
            style={{ background: "hsl(0 0% 0% / 0.03)" }}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{t("dashboardV2.signals.empty")}</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {rows.map((r) => {
              const isRisk = r.tone === "risk";
              const accent = isRisk ? "hsl(35 85% 50%)" : "hsl(150 60% 40%)";
              const bg = isRisk ? "hsl(40 90% 96%)" : "hsl(150 50% 96%)";
              const Icon = isRisk ? AlertTriangle : CheckCircle2;
              return (
                <div
                  key={r.flag}
                  className="flex items-start gap-2 px-2.5 py-2 rounded-xl"
                  style={{ background: bg, border: `1px solid ${accent.replace(")", " / 0.2)")}` }}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: accent }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-foreground leading-tight">
                      {r.label}
                    </div>
                    <div
                      className="text-[10px] mt-0.5 leading-tight font-medium tabular-nums"
                      style={{ color: accent }}
                    >
                      {r.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default SignalsPreviewPanel;
