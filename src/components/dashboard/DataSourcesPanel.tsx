import { memo } from "react";
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
  Circle,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardDataCheck } from "@/hooks/useDashboardDataCheck";
import { useHolisticDashboardSnapshot } from "@/hooks/useHolisticDashboardSnapshot";

interface SourceRow {
  key: keyof ReturnType<typeof useDashboardDataCheck>;
  icon: typeof Heart;
  i18nKey: string;
  href: string;
  color: string;
}

const SOURCES: SourceRow[] = [
  { key: "hasMoodData",      icon: Heart,       i18nKey: "mood",         href: "/tools/wellness-diary",       color: "hsl(345 75% 60%)" },
  { key: "hasSymptomsData",  icon: Activity,    i18nKey: "symptoms",     href: "/tools/wellness-diary",       color: "hsl(280 60% 60%)" },
  { key: "hasWeight",        icon: Scale,       i18nKey: "weight",       href: "/tools/smart-weight-gain",    color: "hsl(330 70% 55%)" },
  { key: "hasHydration",     icon: Droplet,     i18nKey: "hydration",    href: "/tools/smart-pregnancy-plan", color: "hsl(200 80% 55%)" },
  { key: "hasVitamins",      icon: Pill,        i18nKey: "vitamins",     href: "/tools/vitamin-tracker",      color: "hsl(160 60% 50%)" },
  { key: "hasKickSessions",  icon: Baby,        i18nKey: "kicks",        href: "/tools/smart-kick-counter",   color: "hsl(25 80% 55%)" },
  { key: "hasContractions",  icon: Timer,       i18nKey: "contractions", href: "/tools/contraction-timer",    color: "hsl(0 70% 55%)" },
  { key: "hasAppointments",  icon: CalendarDays,i18nKey: "appointments", href: "/tools/smart-appointment-reminder", color: "hsl(220 70% 55%)" },
  { key: "hasMeals",         icon: Apple,       i18nKey: "meals",        href: "/tools/ai-meal-suggestion",   color: "hsl(140 55% 50%)" },
  { key: "hasFitness",       icon: Dumbbell,    i18nKey: "fitness",      href: "/tools/ai-fitness-coach",     color: "hsl(45 80% 50%)" },
];

const MIN_SOURCES = 3;

/**
 * Transparent breakdown of WHICH data sources fed the holistic snapshot.
 * Active sources are linked to their tool pages so users can quickly fill gaps.
 */
export const DataSourcesPanel = memo(function DataSourcesPanel() {
  const { t } = useTranslation();
  const dataCheck = useDashboardDataCheck();
  const { sourcesCount, hasMinimumData, dataRichness } = useHolisticDashboardSnapshot();

  const activeCount = sourcesCount;
  const totalCount = SOURCES.length;

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
            {dataRichness}%
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

        {/* Grid of sources */}
        <div className="grid grid-cols-2 gap-1.5">
          {SOURCES.map((s) => {
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
