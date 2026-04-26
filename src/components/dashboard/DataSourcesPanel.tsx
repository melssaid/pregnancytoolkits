import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Database,
  Heart,
  Activity,
  Scale,
  Droplet,
  Pill,
  Baby,
  Timer,
  CalendarDays,
  Apple,
  Dumbbell,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Moon,
  ScanLine,
  Camera,
  Gauge,
  Flower2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardDataCheck } from "@/hooks/useDashboardDataCheck";
import { useHolisticDashboardSnapshot } from "@/hooks/useHolisticDashboardSnapshot";
import { useUserProfile, type JourneyStage } from "@/hooks/useUserProfile";

type Scope = "universal" | "pregnancy" | "postpartum" | "fertility";

interface SourceRow {
  key: keyof ReturnType<typeof useDashboardDataCheck>;
  icon: typeof Heart;
  i18nKey: string;
  href: string;
  color: string;
  scope: Scope;
}

/**
 * Stage-Adaptive Data Sources catalogue.
 *
 *  - universal  → relevant for everybody (mood, sleep, weight, hydration…)
 *  - pregnancy  → only shown when journeyStage === "pregnant"
 *  - postpartum → only shown when journeyStage === "postpartum"
 *  - fertility  → only shown when journeyStage === "fertility"
 *
 * The dataRichness % is now computed against the visible (in-scope) total —
 * a postpartum mum is no longer penalised for missing kick-counter data.
 */
const SOURCES: SourceRow[] = [
  // ── Universal (every stage) ─────────────────────────────────────
  { key: "hasMoodData",     icon: Heart,        i18nKey: "mood",         href: "/tools/wellness-diary",             color: "hsl(345 75% 60%)", scope: "universal" },
  { key: "hasMoodScore",    icon: Gauge,        i18nKey: "moodScore",    href: "/tools/wellness-diary",             color: "hsl(320 65% 55%)", scope: "universal" },
  { key: "hasSymptomsData", icon: Activity,     i18nKey: "symptoms",     href: "/tools/wellness-diary",             color: "hsl(280 60% 60%)", scope: "universal" },
  { key: "hasSleepData",    icon: Moon,         i18nKey: "sleep",        href: "/tools/baby-sleep-tracker",         color: "hsl(240 55% 55%)", scope: "universal" },
  { key: "hasWeight",       icon: Scale,        i18nKey: "weight",       href: "/tools/weight-gain",                color: "hsl(330 70% 55%)", scope: "universal" },
  { key: "hasHydration",    icon: Droplet,      i18nKey: "hydration",    href: "/tools/smart-plan",                 color: "hsl(200 80% 55%)", scope: "universal" },
  { key: "hasAppointments", icon: CalendarDays, i18nKey: "appointments", href: "/tools/smart-appointment-reminder", color: "hsl(220 70% 55%)", scope: "universal" },
  { key: "hasMeals",        icon: Apple,        i18nKey: "meals",        href: "/tools/ai-meal-suggestion",         color: "hsl(140 55% 50%)", scope: "universal" },
  { key: "hasFitness",      icon: Dumbbell,     i18nKey: "fitness",      href: "/tools/ai-fitness-coach",           color: "hsl(45 80% 50%)",  scope: "universal" },

  // ── Pregnancy-only ──────────────────────────────────────────────
  { key: "hasVitamins",           icon: Pill,      i18nKey: "vitamins",     href: "/tools/vitamin-tracker",     color: "hsl(160 60% 50%)", scope: "pregnancy" },
  { key: "hasKickSessions",       icon: Baby,      i18nKey: "kicks",        href: "/tools/kick-counter",        color: "hsl(25 80% 55%)",  scope: "pregnancy" },
  { key: "hasContractions",       icon: Timer,     i18nKey: "contractions", href: "/tools/contraction-timer",   color: "hsl(0 70% 55%)",   scope: "pregnancy" },
  { key: "hasBumpPhotos",         icon: Camera,    i18nKey: "bumpPhotos",   href: "/tools/ai-bump-photos",      color: "hsl(15 70% 55%)",  scope: "pregnancy" },
  { key: "hasUltrasoundReadings", icon: ScanLine,  i18nKey: "ultrasound",   href: "/tools/ai-bump-photos",      color: "hsl(190 70% 50%)", scope: "pregnancy" },
];

const MIN_SOURCES = 3;

/** Stage badge metadata (label + colour) */
const STAGE_META: Record<JourneyStage, { i18nKey: string; from: string; to: string }> = {
  pregnant:   { i18nKey: "pregnant",   from: "hsl(345 75% 60%)", to: "hsl(15 75% 60%)"  },
  postpartum: { i18nKey: "postpartum", from: "hsl(280 60% 55%)", to: "hsl(330 60% 55%)" },
  fertility:  { i18nKey: "fertility",  from: "hsl(190 65% 50%)", to: "hsl(160 60% 50%)" },
};

const STAGE_ICON: Record<JourneyStage, typeof Heart> = {
  pregnant: Baby,
  postpartum: Sparkles,
  fertility: Flower2,
};

/**
 * Transparent breakdown of WHICH data sources fed the holistic snapshot.
 * Now stage-adaptive: only sources relevant to the user's journey stage
 * are displayed, and the dataRichness % is recomputed against that subset.
 *
 * Active sources are linked to their tool pages so users can quickly fill gaps —
 * gaps shown are always for tools that actually make sense for the user.
 */
export const DataSourcesPanel = memo(function DataSourcesPanel() {
  const { t } = useTranslation();
  const dataCheck = useDashboardDataCheck();
  const { hasMinimumData } = useHolisticDashboardSnapshot();
  const { profile } = useUserProfile();
  const stage: JourneyStage = profile.journeyStage || "pregnant";

  // Filter sources to the active stage (universal + stage-specific)
  const visibleSources = useMemo(
    () => SOURCES.filter((s) => s.scope === "universal" || s.scope === stage),
    [stage],
  );

  // Stage-aware activity & richness metrics
  const activeCount = useMemo(
    () => visibleSources.filter((s) => !!dataCheck[s.key]).length,
    [visibleSources, dataCheck],
  );
  const totalCount = visibleSources.length;
  const stageRichness = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

  const stageMeta = STAGE_META[stage];
  const StageIcon = STAGE_ICON[stage];

  return (
    <Card
      className="overflow-hidden border-0"
      style={{
        background: "linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(220 30% 98%) 100%)",
        boxShadow: "0 4px 14px -4px hsl(220 40% 50% / 0.12)",
        border: "1px solid hsl(220 30% 92%)",
      }}
    >
      <CardContent className="pt-4 pb-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-2">
          <div
            className="shrink-0 p-1.5 rounded-xl"
            style={{ background: "linear-gradient(135deg, hsl(210 70% 55%), hsl(190 65% 50%))" }}
          >
            <Database className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[14px] text-foreground leading-tight">
              {t("dashboardV2.dataSources.title")}
            </h3>
            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
              {t("dashboardV2.dataSources.subtitle", { active: activeCount, total: totalCount })}
            </p>
          </div>
          <span className="shrink-0 text-[11px] font-bold tabular-nums text-foreground/70">
            {stageRichness}%
          </span>
        </div>

        {/* Stage badge — clarifies that the analysis is tailored to this journey */}
        <div
          className="flex items-center gap-1.5 self-start w-fit px-2 py-1 rounded-full text-[10px] font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${stageMeta.from}, ${stageMeta.to})` }}
          aria-label={t("dashboardV2.dataSources.stageBadgeAria")}
        >
          <StageIcon className="w-3 h-3" strokeWidth={2.4} />
          <span>
            {t("dashboardV2.dataSources.stageBadge", {
              stage: t(`dashboardV2.dataSources.stages.${stageMeta.i18nKey}`),
            })}
          </span>
        </div>

        {/* Minimum-data warning */}
        {!hasMinimumData && (
          <div
            className="flex items-start gap-2 rounded-lg px-2.5 py-2 text-[11px] leading-relaxed"
            style={{ background: "hsl(40 90% 95%)", color: "hsl(30 70% 30%)" }}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{t("dashboardV2.dataSources.minWarning", { min: MIN_SOURCES })}</span>
          </div>
        )}

        {/* Grid of sources — stage-filtered */}
        <div className="grid grid-cols-2 gap-1.5">
          {visibleSources.map((s) => {
            const active = !!dataCheck[s.key];
            const Icon = s.icon;
            return (
              <Link
                key={s.key}
                to={s.href}
                className="group flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all"
                style={{
                  background: active ? "hsl(0 0% 100%)" : "hsl(0 0% 0% / 0.03)",
                  border: `1px solid ${active ? "hsl(0 0% 0% / 0.06)" : "hsl(0 0% 0% / 0.04)"}`,
                  opacity: active ? 1 : 0.7,
                }}
              >
                <div
                  className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: active
                      ? `${s.color.replace(")", " / 0.15)")}`
                      : "hsl(0 0% 0% / 0.04)",
                  }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: active ? s.color : "hsl(0 0% 0% / 0.4)" }} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="text-[11px] font-semibold text-foreground truncate leading-tight">
                    {t(`dashboardV2.dataSources.items.${s.i18nKey}`)}
                  </span>
                  <span className="text-[9px] text-muted-foreground leading-tight">
                    {t(active ? "dashboardV2.dataSources.active" : "dashboardV2.dataSources.inactive")}
                  </span>
                </div>
                {active ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: s.color }} />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground rtl:rotate-180" />
                )}
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

export default DataSourcesPanel;
