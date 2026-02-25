import { useMemo, memo, useState, useCallback } from "react";
import { Baby, Heart, Activity, Dumbbell, AlertTriangle, CheckCircle, Flower2, ChevronRight, ChevronLeft, ChevronDown, Calendar, Shield, UtensilsCrossed, MessageSquare, HeartPulse, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { getJourneyCategories, getToolsByCategory, JourneyKey, Tool } from "@/lib/tools-data";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  headerGradient: string;
  headerText: string;
  bg: string;
  border: string;
  iconBg: string;
}

const journeyConfigs: JourneyConfig[] = [
  {
    key: "planning",
    icon: Flower2,
    headerGradient: "bg-gradient-to-r from-amber-400 via-orange-300 to-rose-300 dark:from-amber-500 dark:via-orange-400 dark:to-rose-400",
    headerText: "text-white",
    iconBg: "bg-white/25",
    bg: "from-amber-50/80 via-orange-50/40 to-rose-50/30 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-rose-950/10",
    border: "border-amber-200/50 dark:border-amber-800/30",
  },
  {
    key: "pregnant",
    icon: Heart,
    headerGradient: "bg-gradient-to-r from-pink-500 via-rose-400 to-pink-400 dark:from-pink-600 dark:via-rose-500 dark:to-pink-500",
    headerText: "text-white",
    iconBg: "bg-white/25",
    bg: "from-pink-50/80 via-rose-50/40 to-pink-50/30 dark:from-pink-950/30 dark:via-rose-950/20 dark:to-pink-950/10",
    border: "border-pink-200/50 dark:border-pink-800/30",
  },
  {
    key: "postpartum",
    icon: Baby,
    headerGradient: "bg-gradient-to-r from-rose-400 via-pink-300 to-fuchsia-300 dark:from-rose-500 dark:via-pink-400 dark:to-fuchsia-400",
    headerText: "text-white",
    iconBg: "bg-white/25",
    bg: "from-rose-50/80 via-pink-50/40 to-fuchsia-50/30 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-fuchsia-950/10",
    border: "border-rose-200/50 dark:border-rose-800/30",
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
const SubCategoryDivider = memo(function SubCategoryDivider({ iconColor }: { iconColor: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 pt-3 pb-1">
      <div className={`w-1 h-1 rounded-full ${iconColor} opacity-40`} />
      <div className={`h-[1.5px] flex-1 bg-gradient-to-r from-border/50 via-border/20 to-transparent dark:from-border/30 dark:via-border/10`} />
    </div>
  );
});

// ── Journey card ────────────────────────────────────────────────────────
const JOURNEY_STATE_KEY = "journey-card-states";

const JourneyCard = memo(function JourneyCard({ config, index }: { config: JourneyConfig; index: number }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const Icon = config.icon;

  const [isOpen, setIsOpen] = useState(() => {
    try {
      const saved = localStorage.getItem(JOURNEY_STATE_KEY);
      if (saved) {
        const states = JSON.parse(saved);
        if (typeof states[config.key] === "boolean") return states[config.key];
      }
    } catch {}
    return false;
  });

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      const next = !prev;
      try {
        const saved = localStorage.getItem(JOURNEY_STATE_KEY);
        const states = saved ? JSON.parse(saved) : {};
        states[config.key] = next;
        localStorage.setItem(JOURNEY_STATE_KEY, JSON.stringify(states));
      } catch {}
      return next;
    });
  }, [config.key]);

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
      {/* Gradient Header — clickable to toggle */}
      <button
        onClick={toggle}
        className={`${config.headerGradient} px-4 py-4 relative overflow-hidden w-full text-start`}
      >
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
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <ChevronDown className={`w-5 h-5 ${config.headerText} opacity-60`} strokeWidth={2} />
          </motion.div>
        </div>
      </button>

      {/* Collapsible Tools */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-2 pb-3 pt-1">
              {toolsByCategory.map(({ catKey, tools }) => (
                <div key={catKey}>
                  {showSubHeaders && (
                    <SubCategoryDivider
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
          </motion.div>
        )}
      </AnimatePresence>
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
