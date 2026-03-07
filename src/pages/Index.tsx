import { useMemo, memo, useState, useCallback } from "react";
import { useSubscriptionStatus, isToolPremium } from "@/hooks/useSubscriptionStatus";
import { ChevronRight, ChevronLeft, ChevronDown, Lock } from "lucide-react";
import PregnancyHeartIcon from "@/components/PregnancyHeartIcon";
import BabyFootprintsIcon from "@/components/BabyFootprintsIcon";
import RockingBabyIcon from "@/components/RockingBabyIcon";
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
  
  "categories.preparation":   { iconColor: "text-[hsl(170,35%,45%)] dark:text-[hsl(170,30%,55%)]", toolHover: "hover:bg-[hsl(170,25%,96%)] dark:hover:bg-[hsl(170,20%,14%)]", hoverShadow: "hover:shadow-[0_2px_12px_-2px_hsl(170,30%,45%,0.15)]", hoverBorder: "hover:border-[hsl(170,22%,85%)] dark:hover:border-[hsl(170,18%,25%)]" },
  "categories.postpartum":    { iconColor: "text-[hsl(310,35%,52%)] dark:text-[hsl(310,30%,62%)]", toolHover: "hover:bg-[hsl(310,25%,96%)] dark:hover:bg-[hsl(310,20%,14%)]", hoverShadow: "hover:shadow-[0_2px_12px_-2px_hsl(310,30%,52%,0.15)]", hoverBorder: "hover:border-[hsl(310,22%,85%)] dark:hover:border-[hsl(310,18%,25%)]" },
};

// ── Journey card theming — emotionally resonant, brand-cohesive ─────────
interface JourneyConfig {
  key: JourneyKey;
  icon?: LucideIcon;
  customIcon?: "footprints" | "rockingBaby" | "pregnancyHeart";
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
    customIcon: "rockingBaby",
    headerGradient: "bg-gradient-to-r from-[hsl(15,70%,62%)] via-[hsl(25,65%,65%)] to-[hsl(340,50%,65%)] dark:from-[hsl(15,65%,50%)] dark:via-[hsl(25,60%,52%)] dark:to-[hsl(340,45%,55%)]",
    headerText: "text-white",
    iconBg: "bg-white/20",
    bg: "from-[hsl(20,40%,97%)] via-[hsl(30,30%,97%)] to-[hsl(340,25%,97%)] dark:from-[hsl(20,20%,10%)] dark:via-[hsl(30,15%,9%)] dark:to-[hsl(340,15%,10%)]",
    border: "border-[hsl(20,30%,90%)] dark:border-[hsl(20,15%,18%)]",
  },
  {
    // Pregnancy — Deep Rose-Pink: love, strength, the core journey
    key: "pregnant",
    customIcon: "pregnancyHeart",
    headerGradient: "bg-gradient-to-r from-[hsl(340,65%,52%)] via-[hsl(345,60%,56%)] to-[hsl(350,55%,60%)] dark:from-[hsl(340,60%,45%)] dark:via-[hsl(345,55%,48%)] dark:to-[hsl(350,50%,52%)]",
    headerText: "text-white",
    iconBg: "bg-white/20",
    bg: "from-[hsl(340,30%,97%)] via-[hsl(345,25%,97%)] to-[hsl(350,20%,97%)] dark:from-[hsl(340,20%,10%)] dark:via-[hsl(345,15%,9%)] dark:to-[hsl(350,12%,10%)]",
    border: "border-[hsl(340,25%,90%)] dark:border-[hsl(340,15%,18%)]",
  },
  {
    // Postpartum/Baby — Soft Mauve-Lavender: tenderness, nurturing calm
    key: "postpartum",
    customIcon: "footprints",
    headerGradient: "bg-gradient-to-r from-[hsl(320,40%,58%)] via-[hsl(300,30%,60%)] to-[hsl(280,35%,62%)] dark:from-[hsl(320,35%,48%)] dark:via-[hsl(300,25%,50%)] dark:to-[hsl(280,30%,52%)]",
    headerText: "text-white",
    iconBg: "bg-white/20",
    bg: "from-[hsl(320,25%,97%)] via-[hsl(300,20%,97%)] to-[hsl(280,20%,97%)] dark:from-[hsl(320,15%,10%)] dark:via-[hsl(300,12%,9%)] dark:to-[hsl(280,12%,10%)]",
    border: "border-[hsl(310,20%,90%)] dark:border-[hsl(310,12%,18%)]",
  },
];

// ── Tool row component ──────────────────────────────────────────────────
const ToolRow = memo(function ToolRow({ tool, isRTL, isLocked = false }: { tool: Tool; isRTL: boolean; isLocked?: boolean }) {
  const { t } = useTranslation();
  const ToolIcon = tool.icon;
  const style = categoryStyles[tool.categoryKey] || { iconColor: "text-muted-foreground", toolHover: "hover:bg-muted/50", hoverShadow: "hover:shadow-sm", hoverBorder: "hover:border-border/30" };
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
    }
  };

  return (
    <Link to={isLocked ? "/pricing-demo" : tool.href} onClick={handleClick} className="block">
      <div className={`group flex items-center gap-3 p-3 rounded-2xl bg-card/60 backdrop-blur-sm shadow-[0_1px_3px_0_hsl(0,0%,0%,0.04)] ${style.toolHover} ${style.hoverShadow} ${style.hoverBorder} border border-border/10 transition-all duration-250 hover:-translate-y-[1px] ${isLocked ? "opacity-50" : ""}`}>
        <div className={`flex-shrink-0 w-9 h-9 rounded-xl bg-white/90 dark:bg-white/10 border border-border/20 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-250 group-hover:scale-105 ${isLocked ? "grayscale-[30%]" : ""}`}>
          <ToolIcon className={`w-4 h-4 ${style.iconColor} opacity-70 group-hover:opacity-100 transition-opacity duration-250`} strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-foreground leading-snug break-words">{t(tool.titleKey)}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed break-words">{t(tool.descriptionKey)}</p>
        </div>
        {isLocked ? (
          <Lock className="flex-shrink-0 w-4 h-4 text-muted-foreground/40" />
        ) : (
          <ChevronIcon className="flex-shrink-0 w-4 h-4 text-muted-foreground/20 group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all duration-250" />
        )}
      </div>
    </Link>
  );
});




// ── Journey card ────────────────────────────────────────────────────────


const JourneyCard = memo(function JourneyCard({ config, index }: { config: JourneyConfig; index: number }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const Icon = config.icon;

  const [isOpen, setIsOpen] = useState(() => {
    try {
      const saved = localStorage.getItem("journey-states");
      if (saved) {
        const states = JSON.parse(saved);
        return !!states[config.key];
      }
    } catch {}
    return false;
  });

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      const next = !prev;
      try {
        const saved = localStorage.getItem("journey-states");
        const states = saved ? JSON.parse(saved) : {};
        states[config.key] = next;
        localStorage.setItem("journey-states", JSON.stringify(states));
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

  

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${config.bg} border ${config.border} overflow-hidden shadow-sm animate-fade-in journey-card-glow relative journey-card-shimmer`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Gradient Header — clickable to toggle */}
      <button
        onClick={toggle}
        className={`${config.headerGradient} px-4 py-3.5 relative overflow-hidden w-full text-start min-h-[68px] flex items-center`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
        <div className="absolute -top-6 -end-6 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
        
        <div className="relative flex items-center gap-2.5 w-full">
          <div className={`w-10 h-10 rounded-xl ${config.iconBg} backdrop-blur-sm flex items-center justify-center shadow-lg flex-shrink-0`}>
            {config.customIcon === "footprints" ? (
              <BabyFootprintsIcon className="w-6 h-6" />
            ) : config.customIcon === "rockingBaby" ? (
              <RockingBabyIcon className="w-6 h-6" />
            ) : config.customIcon === "pregnancyHeart" ? (
              <PregnancyHeartIcon className="w-6 h-6" />
            ) : Icon ? (
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
              >
                <Icon className={`w-5.5 h-5.5 ${config.headerText}`} strokeWidth={2} />
              </motion.div>
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`text-xl sm:text-2xl font-bold ${config.headerText} tracking-tight leading-snug break-words`}>
              {t(`journeys.${config.key}`)}
            </h2>
            <p className={`text-[11px] ${config.headerText} opacity-75 mt-0.5 leading-snug break-words`}>
              {t(`journeys.${config.key}Desc`)}
            </p>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex-shrink-0"
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
            transition={{ 
              height: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
              opacity: { duration: 0.3, delay: 0.05, ease: "easeOut" }
            }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-4 pt-2 space-y-1.5">
              {toolsByCategory.map(({ catKey, tools }) => (
                <div key={catKey}>
                  <div className="space-y-2">
                    {tools.map((tool, toolIdx) => (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: toolIdx * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
                      >
                        <ToolRow tool={tool} isRTL={isRTL} />
                      </motion.div>
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

      <section className="pt-5 pb-0 relative z-10">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-4xl mx-auto space-y-4 pb-6">
          {journeyConfigs.map((config, index) => (
            <JourneyCard key={config.key} config={config} index={index} />
          ))}
          
        </div>
      </section>
    </Layout>
  );
};

export default Index;
