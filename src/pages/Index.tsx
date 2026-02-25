import { useMemo, memo } from "react";
import { Baby, Heart, Activity, Dumbbell, AlertTriangle, CheckCircle, Flower2, ChevronRight, ChevronLeft, Calendar, Shield, UtensilsCrossed, MessageSquare, HeartPulse, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { getJourneyCategories, getToolsByCategory, JourneyKey, Tool } from "@/lib/tools-data";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

// ── Category styling lookup ──────────────────────────────────────────────
const categoryStyles: Record<string, { iconColor: string; toolHover: string }> = {
  "categories.smartAssistant": { iconColor: "text-pink-500 dark:text-pink-400", toolHover: "hover:bg-pink-50/70 dark:hover:bg-pink-900/20" },
  "categories.fertility":     { iconColor: "text-rose-500 dark:text-rose-400", toolHover: "hover:bg-rose-50/70 dark:hover:bg-rose-900/20" },
  "categories.pregnancy":     { iconColor: "text-pink-500 dark:text-pink-400", toolHover: "hover:bg-pink-50/70 dark:hover:bg-pink-900/20" },
  "categories.nutrition":     { iconColor: "text-orange-500 dark:text-orange-400", toolHover: "hover:bg-orange-50/70 dark:hover:bg-orange-900/20" },
  "categories.wellness":      { iconColor: "text-emerald-500 dark:text-emerald-400", toolHover: "hover:bg-emerald-50/70 dark:hover:bg-emerald-900/20" },
  "categories.mentalHealth":   { iconColor: "text-sky-500 dark:text-sky-400", toolHover: "hover:bg-sky-50/70 dark:hover:bg-sky-900/20" },
  "categories.selfCheck":     { iconColor: "text-amber-500 dark:text-amber-400", toolHover: "hover:bg-amber-50/70 dark:hover:bg-amber-900/20" },
  "categories.labor":         { iconColor: "text-rose-500 dark:text-rose-400", toolHover: "hover:bg-rose-50/70 dark:hover:bg-rose-900/20" },
  "categories.preparation":   { iconColor: "text-teal-500 dark:text-teal-400", toolHover: "hover:bg-teal-50/70 dark:hover:bg-teal-900/20" },
  "categories.postpartum":    { iconColor: "text-fuchsia-500 dark:text-fuchsia-400", toolHover: "hover:bg-fuchsia-50/70 dark:hover:bg-fuchsia-900/20" },
};

// ── Journey card theming with psychological color impact ─────────────────
interface JourneyConfig {
  key: JourneyKey;
  icon: LucideIcon;
  // Header gradient — the emotional anchor
  headerGradient: string;
  headerText: string;
  // Card body
  bg: string;
  border: string;
  // Icon container in header
  iconBg: string;
}

const journeyConfigs: JourneyConfig[] = [
  {
    // أحلم بطفل — Hope & Aspiration: warm rose → amber gold
    key: "planning",
    icon: Sparkles,
    headerGradient: "bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 dark:from-rose-500 dark:via-pink-500 dark:to-amber-400",
    headerText: "text-white",
    iconBg: "bg-white/25",
    bg: "from-rose-50/80 via-pink-50/40 to-amber-50/30 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-amber-950/10",
    border: "border-rose-200/50 dark:border-rose-800/30",
  },
  {
    // حملي — Nurturing & Vitality: rich pink → soft coral
    key: "pregnant",
    icon: HeartPulse,
    headerGradient: "bg-gradient-to-r from-pink-500 via-rose-400 to-pink-400 dark:from-pink-600 dark:via-rose-500 dark:to-pink-500",
    headerText: "text-white",
    iconBg: "bg-white/25",
    bg: "from-pink-50/80 via-rose-50/40 to-pink-50/30 dark:from-pink-950/30 dark:via-rose-950/20 dark:to-pink-950/10",
    border: "border-pink-200/50 dark:border-pink-800/30",
  },
  {
    // طفلي — Tenderness & New Life: fuchsia → soft lavender
    key: "postpartum",
    icon: Baby,
    headerGradient: "bg-gradient-to-r from-fuchsia-400 via-purple-400 to-violet-300 dark:from-fuchsia-500 dark:via-purple-500 dark:to-violet-400",
    headerText: "text-white",
    iconBg: "bg-white/25",
    bg: "from-fuchsia-50/80 via-purple-50/40 to-violet-50/30 dark:from-fuchsia-950/30 dark:via-purple-950/20 dark:to-violet-950/10",
    border: "border-fuchsia-200/50 dark:border-fuchsia-800/30",
  },
];

// ── Tool row component ──────────────────────────────────────────────────
const ToolRow = memo(function ToolRow({ tool, isRTL }: { tool: Tool; isRTL: boolean }) {
  const { t } = useTranslation();
  const ToolIcon = tool.icon;
  const style = categoryStyles[tool.categoryKey] || { iconColor: "text-muted-foreground", toolHover: "hover:bg-muted/50" };
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Link to={tool.href} className="block">
      <div className={`group flex items-center gap-2.5 p-2.5 rounded-xl bg-card/60 backdrop-blur-sm ${style.toolHover} border border-transparent hover:border-border/30 transition-all duration-200`}>
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/90 dark:bg-white/10 border border-border/20 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
          <ToolIcon className={`w-4 h-4 ${style.iconColor} opacity-70 group-hover:opacity-100 transition-opacity`} strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-foreground truncate leading-snug">{t(tool.titleKey)}</h3>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{t(tool.descriptionKey)}</p>
        </div>
        <ChevronIcon className="flex-shrink-0 w-3.5 h-3.5 text-muted-foreground/25 group-hover:text-muted-foreground/60 transition-colors" />
      </div>
    </Link>
  );
});

// ── Sub-category divider ────────────────────────────────────────────────
const SubCategoryHeader = memo(function SubCategoryHeader({ categoryKey, iconColor }: { categoryKey: string; iconColor: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 px-1 pt-3 pb-1">
      <div className="h-px flex-1 bg-border/40" />
      <span className={`text-[10px] font-bold uppercase tracking-wider ${iconColor}`}>
        {t(categoryKey)}
      </span>
      <div className="h-px flex-1 bg-border/40" />
    </div>
  );
});

// ── Journey card ────────────────────────────────────────────────────────
const JourneyCard = memo(function JourneyCard({ config, index }: { config: JourneyConfig; index: number }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const Icon = config.icon;

  const categories = useMemo(() => getJourneyCategories(config.key), [config.key]);
  const toolsByCategory = useMemo(() => {
    return categories.map(catKey => ({
      catKey,
      tools: getToolsByCategory(catKey),
    })).filter(g => g.tools.length > 0);
  }, [categories]);

  const totalTools = useMemo(() => toolsByCategory.reduce((sum, g) => sum + g.tools.length, 0), [toolsByCategory]);
  if (totalTools === 0) return null;

  const showSubHeaders = toolsByCategory.length > 1;

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${config.bg} border ${config.border} overflow-hidden shadow-sm animate-fade-in`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Gradient Header — the emotional anchor */}
      <div className={`${config.headerGradient} px-4 py-4 relative overflow-hidden`}>
        {/* Subtle decorative glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
        <div className="absolute -top-6 -end-6 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
        
        <div className="relative flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl ${config.iconBg} backdrop-blur-sm flex items-center justify-center shadow-lg`}>
            <Icon className={`w-5.5 h-5.5 ${config.headerText}`} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`text-lg font-extrabold ${config.headerText} tracking-tight truncate`}>
              {t(`journeys.${config.key}`)}
            </h2>
            <p className={`text-[11px] ${config.headerText} opacity-80 mt-0.5`}>
              {t(`journeys.${config.key}Desc`)}
            </p>
          </div>
          <div className={`text-[10px] font-bold ${config.headerText} opacity-70 bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-sm`}>
            {totalTools}
          </div>
        </div>
      </div>

      {/* Tools */}
      <div className="px-2 pb-3 pt-1">
        {toolsByCategory.map(({ catKey, tools }) => (
          <div key={catKey}>
            {showSubHeaders && (
              <SubCategoryHeader
                categoryKey={catKey}
                iconColor={categoryStyles[catKey]?.iconColor || "text-muted-foreground"}
              />
            )}
            <div className="space-y-1">
              {tools.map(tool => (
                <ToolRow key={tool.id} tool={tool} isRTL={isRTL} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// ── Main page ───────────────────────────────────────────────────────────
const Index = () => {
  return (
    <Layout>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[30vh] bg-gradient-to-t from-primary/10 via-primary/5 to-transparent z-30" />

      <section className="py-3 relative z-10">
        <div className="container space-y-4">
          {journeyConfigs.map((config, index) => (
            <JourneyCard key={config.key} config={config} index={index} />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
