import { useMemo, memo, useState, useCallback } from "react";
import { Baby, Heart, Activity, Dumbbell, AlertTriangle, CheckCircle, ChevronRight, ChevronLeft, ChevronDown, Calendar, Shield, UtensilsCrossed, MessageSquare, HeartPulse, Sparkles, Footprints } from "lucide-react";
import dreamBabyIcon from "@/assets/icons/dream-baby.png";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { getJourneyCategories, getToolsByCategory, JourneyKey, Tool } from "@/lib/tools-data";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SEOHead } from "@/components/SEOHead";


// ── Category styling lookup — brand-cohesive rose palette ────────────────
const categoryStyles: Record<string, { iconColor: string; toolHover: string; hoverShadow: string; hoverBorder: string }> = {
  "categories.smartAssistant": { iconColor: "text-[hsl(340,55%,55%)] dark:text-[hsl(340,50%,65%)]", toolHover: "hover:bg-[hsl(340,40%,96%)] dark:hover:bg-[hsl(340,30%,14%)]", hoverShadow: "hover:shadow-[0_2px_12px_-2px_hsl(340,50%,55%,0.15)]", hoverBorder: "hover:border-[hsl(340,40%,85%)] dark:hover:border-[hsl(340,30%,25%)]" },
  "categories.fertility":     { iconColor: "text-[hsl(350,60%,58%)] dark:text-[hsl(350,55%,65%)]", toolHover: "hover:bg-[hsl(350,40%,96%)] dark:hover:bg-[hsl(350,30%,14%)]", hoverShadow: "hover:shadow-[0_2px_12px_-2px_hsl(350,55%,58%,0.15)]", hoverBorder: "hover:border-[hsl(350,40%,85%)] dark:hover:border-[hsl(350,30%,25%)]" },
  "categories.pregnancy":     { iconColor: "text-[hsl(340,65%,52%)] dark:text-[hsl(340,60%,62%)]", toolHover: "hover:bg-[hsl(340,35%,96%)] dark:hover:bg-[hsl(340,25%,14%)]", hoverShadow: "hover:shadow-[0_2px_12px_-2px_hsl(340,60%,52%,0.15)]", hoverBorder: "hover:border-[hsl(340,35%,85%)] dark:hover:border-[hsl(340,25%,25%)]" },
  "categories.nutrition":     { iconColor: "text-[hsl(15,65%,55%)] dark:text-[hsl(15,60%,62%)]",   toolHover: "hover:bg-[hsl(15,40%,96%)] dark:hover:bg-[hsl(15,30%,14%)]", hoverShadow: "hover:shadow-[0_2px_12px_-2px_hsl(15,60%,55%,0.15)]", hoverBorder: "hover:border-[hsl(15,35%,85%)] dark:hover:border-[hsl(15,25%,25%)]" },
  "categories.wellness":      { iconColor: "text-[hsl(160,40%,45%)] dark:text-[hsl(160,35%,55%)]", toolHover: "hover:bg-[hsl(160,30%,96%)] dark:hover:bg-[hsl(160,20%,14%)]", hoverShadow: "hover:shadow-[0_2px_12px_-2px_hsl(160,35%,45%,0.15)]", hoverBorder: "hover:border-[hsl(160,25%,85%)] dark:hover:border-[hsl(160,18%,25%)]" },
  "categories.labor":         { iconColor: "text-[hsl(345,55%,55%)] dark:text-[hsl(345,50%,62%)]", toolHover: "hover:bg-[hsl(345,35%,96%)] dark:hover:bg-[hsl(345,25%,14%)]", hoverShadow: "hover:shadow-[0_2px_12px_-2px_hsl(345,50%,55%,0.15)]", hoverBorder: "hover:border-[hsl(345,30%,85%)] dark:hover:border-[hsl(345,22%,25%)]" },
  "categories.preparation":   { iconColor: "text-[hsl(170,35%,45%)] dark:text-[hsl(170,30%,55%)]", toolHover: "hover:bg-[hsl(170,25%,96%)] dark:hover:bg-[hsl(170,20%,14%)]", hoverShadow: "hover:shadow-[0_2px_12px_-2px_hsl(170,30%,45%,0.15)]", hoverBorder: "hover:border-[hsl(170,22%,85%)] dark:hover:border-[hsl(170,18%,25%)]" },
  "categories.postpartum":    { iconColor: "text-[hsl(310,35%,52%)] dark:text-[hsl(310,30%,62%)]", toolHover: "hover:bg-[hsl(310,25%,96%)] dark:hover:bg-[hsl(310,20%,14%)]", hoverShadow: "hover:shadow-[0_2px_12px_-2px_hsl(310,30%,52%,0.15)]", hoverBorder: "hover:border-[hsl(310,22%,85%)] dark:hover:border-[hsl(310,18%,25%)]" },
};

// ── Journey card theming — emotionally resonant, brand-cohesive ─────────
interface JourneyConfig {
  key: JourneyKey;
  icon?: LucideIcon;
  customIcon?: string;
  headerGradient: string;
  headerText: string;
  bg: string;
  border: string;
  iconBg: string;
}

const journeyConfigs: JourneyConfig[] = [
  {
    // Planning/Fertility — Warm Coral-Peach: hope, warmth, anticipation
    key: "planning",
    customIcon: dreamBabyIcon,
    headerGradient: "bg-gradient-to-r from-[hsl(15,70%,62%)] via-[hsl(25,65%,65%)] to-[hsl(340,50%,65%)] dark:from-[hsl(15,65%,50%)] dark:via-[hsl(25,60%,52%)] dark:to-[hsl(340,45%,55%)]",
    headerText: "text-white",
    iconBg: "bg-white/20",
    bg: "from-[hsl(20,40%,97%)] via-[hsl(30,30%,97%)] to-[hsl(340,25%,97%)] dark:from-[hsl(20,20%,10%)] dark:via-[hsl(30,15%,9%)] dark:to-[hsl(340,15%,10%)]",
    border: "border-[hsl(20,30%,90%)] dark:border-[hsl(20,15%,18%)]",
  },
  {
    // Pregnancy — Deep Rose-Pink: love, strength, the core journey
    key: "pregnant",
    icon: Heart,
    headerGradient: "bg-gradient-to-r from-[hsl(340,65%,52%)] via-[hsl(345,60%,56%)] to-[hsl(350,55%,60%)] dark:from-[hsl(340,60%,45%)] dark:via-[hsl(345,55%,48%)] dark:to-[hsl(350,50%,52%)]",
    headerText: "text-white",
    iconBg: "bg-white/20",
    bg: "from-[hsl(340,30%,97%)] via-[hsl(345,25%,97%)] to-[hsl(350,20%,97%)] dark:from-[hsl(340,20%,10%)] dark:via-[hsl(345,15%,9%)] dark:to-[hsl(350,12%,10%)]",
    border: "border-[hsl(340,25%,90%)] dark:border-[hsl(340,15%,18%)]",
  },
  {
    // Postpartum/Baby — Soft Mauve-Lavender: tenderness, nurturing calm
    key: "postpartum",
    icon: Baby,
    headerGradient: "bg-gradient-to-r from-[hsl(320,40%,58%)] via-[hsl(300,30%,60%)] to-[hsl(280,35%,62%)] dark:from-[hsl(320,35%,48%)] dark:via-[hsl(300,25%,50%)] dark:to-[hsl(280,30%,52%)]",
    headerText: "text-white",
    iconBg: "bg-white/20",
    bg: "from-[hsl(320,25%,97%)] via-[hsl(300,20%,97%)] to-[hsl(280,20%,97%)] dark:from-[hsl(320,15%,10%)] dark:via-[hsl(300,12%,9%)] dark:to-[hsl(280,12%,10%)]",
    border: "border-[hsl(310,20%,90%)] dark:border-[hsl(310,12%,18%)]",
  },
];

// ── Tool row component ──────────────────────────────────────────────────
const ToolRow = memo(function ToolRow({ tool, isRTL }: { tool: Tool; isRTL: boolean }) {
  const { t } = useTranslation();
  const ToolIcon = tool.icon;
  const style = categoryStyles[tool.categoryKey] || { iconColor: "text-muted-foreground", toolHover: "hover:bg-muted/50", hoverShadow: "hover:shadow-sm", hoverBorder: "hover:border-border/30" };
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Link to={tool.href} className="block">
      <div className={`group flex items-center gap-2.5 p-2.5 rounded-xl bg-card/60 backdrop-blur-sm shadow-[0_1px_3px_0_hsl(0,0%,0%,0.04)] ${style.toolHover} ${style.hoverShadow} ${style.hoverBorder} border border-border/10 transition-all duration-250 hover:-translate-y-[1px]`}>
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/90 dark:bg-white/10 border border-border/20 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-250 group-hover:scale-105">
          <ToolIcon className={`w-4 h-4 ${style.iconColor} opacity-70 group-hover:opacity-100 transition-opacity duration-250`} strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-foreground truncate leading-snug">{t(tool.titleKey)}</h3>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{t(tool.descriptionKey)}</p>
        </div>
        <ChevronIcon className="flex-shrink-0 w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all duration-250" />
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
      className={`rounded-2xl bg-gradient-to-br ${config.bg} border ${config.border} overflow-hidden shadow-sm animate-fade-in journey-card-glow relative journey-card-shimmer`}
      style={{ animationDelay: `${index * 120}ms` }}
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
            {config.customIcon ? (
              <motion.img 
                src={config.customIcon} 
                alt="" 
                className="w-10 h-10 object-contain"
                animate={config.key === "planning" ? { scale: [1, 1.15, 1], rotate: [0, -6, 6, 0] } : {}}
                transition={config.key === "planning" ? { duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" } : {}}
              />
            ) : Icon ? (
              <motion.div
                {...(config.key === "planning" ? {
                  animate: { scale: [1, 1.18, 1], rotate: [0, -8, 8, 0] },
                  transition: { duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }
                } : {})}
              >
                <Icon className={`w-5.5 h-5.5 ${config.headerText}`} strokeWidth={2} />
              </motion.div>
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`text-xl font-extrabold ${config.headerText} tracking-tight truncate`}>
              {t(`journeys.${config.key}`)}
            </h2>
            <p className={`text-[11px] ${config.headerText} opacity-80 mt-0.5 truncate`}>
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
  const { t } = useTranslation();
  return (
    <Layout>
      <SEOHead />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[30vh] bg-gradient-to-t from-primary/10 via-primary/5 to-transparent z-30" />

      <section className="pt-4 pb-0 relative z-10">
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
