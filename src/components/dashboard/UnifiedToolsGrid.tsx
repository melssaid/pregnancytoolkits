import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Bot, Hand, Gauge, Heart, Camera, Utensils, Dumbbell, Moon,
  Pill, Baby, Stethoscope, ShoppingBag, Briefcase, Sparkles,
  ChevronRight, ChevronLeft,
} from "lucide-react";
import { safeParseLocalStorage } from "@/lib/safeStorage";

interface ToolItem {
  id: string;
  href: string;
  icon: any;
  labelKey: string;
  labelAr: string;
  labelEn: string;
  count: number;
  accent: string;
  iconColor: string;
}

function safeArr(key: string): any[] {
  return safeParseLocalStorage<any[]>(key, [], (d): d is any[] => Array.isArray(d));
}

function getUserId(): string | null {
  try { return localStorage.getItem("pregnancy_user_id"); } catch { return null; }
}

/**
 * Unified, professional tools grid — replaces QuickActionsBar + MyToolsQuickGrid.
 * Active tools (with data) are sorted first with usage count badge.
 * Tools without data appear as suggestions below.
 */
export const UnifiedToolsGrid = memo(function UnifiedToolsGrid() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const tools = useMemo<ToolItem[]>(() => {
    const uid = getUserId();
    const kicks = uid ? safeArr(`kick_sessions_${uid}`).filter((k: any) => k.ended_at) : [];
    const vits = uid ? safeArr(`vitamin_logs_${uid}`) : [];
    const contractions = safeArr("contraction_timer_data");
    const weights = safeArr("weight_gain_entries");
    const diapers = safeArr("diaperEntries");
    const symptoms = safeArr("quick_symptom_logs");
    const wellness = safeArr("wellness-diary-entries");
    const groceries = safeArr("pregnancyGroceryList");
    const bag = safeArr("hospital-bag-items");
    const birthPlans = safeArr("birthPlans");
    const meals = safeArr("ai-saved-results").filter((r: any) => r.toolId === "ai-meal-suggestion");
    const fitness = safeArr("ai-saved-results").filter((r: any) => r.toolId === "ai-fitness-coach");

    return [
      { id: "assistant", href: "/tools/pregnancy-assistant", icon: Bot,
        labelKey: "dailyDashboard.quickActions.assistant", labelAr: "المساعدة", labelEn: "Assistant",
        count: 0, accent: "from-violet-500/12 to-violet-500/[0.04]", iconColor: "text-violet-600 dark:text-violet-400" },
      { id: "kicks", href: "/tools/kick-counter", icon: Hand,
        labelKey: "dailyDashboard.quickActions.kicks", labelAr: "حركات الجنين", labelEn: "Movements",
        count: kicks.length, accent: "from-pink-500/12 to-pink-500/[0.04]", iconColor: "text-pink-600 dark:text-pink-400" },
      { id: "weight", href: "/tools/weight-gain", icon: Gauge,
        labelKey: "dailyDashboard.quickActions.weight", labelAr: "الوزن", labelEn: "Weight",
        count: weights.length, accent: "from-emerald-500/12 to-emerald-500/[0.04]", iconColor: "text-emerald-600 dark:text-emerald-400" },
      { id: "meals", href: "/tools/ai-meal-suggestion", icon: Utensils,
        labelKey: "dailyDashboard.quickActions.meals", labelAr: "الوجبات", labelEn: "Meals",
        count: meals.length, accent: "from-orange-500/12 to-orange-500/[0.04]", iconColor: "text-orange-600 dark:text-orange-400" },
      { id: "wellness", href: "/tools/wellness-diary", icon: Heart,
        labelKey: "dailyDashboard.quickActions.symptoms", labelAr: "العافية", labelEn: "Wellness",
        count: symptoms.length + wellness.length, accent: "from-rose-500/12 to-rose-500/[0.04]", iconColor: "text-rose-600 dark:text-rose-400" },
      { id: "fitness", href: "/tools/ai-fitness-coach", icon: Dumbbell,
        labelKey: "dailyDashboard.quickActions.fitness", labelAr: "اللياقة", labelEn: "Fitness",
        count: fitness.length, accent: "from-blue-500/12 to-blue-500/[0.04]", iconColor: "text-blue-600 dark:text-blue-400" },
      { id: "vitamins", href: "/tools/vitamin-tracker", icon: Pill,
        labelKey: "dashboard.myTools.vitamins", labelAr: "الفيتامينات", labelEn: "Vitamins",
        count: vits.length, accent: "from-amber-500/12 to-amber-500/[0.04]", iconColor: "text-amber-600 dark:text-amber-400" },
      { id: "comfort", href: "/tools/pregnancy-comfort", icon: Moon,
        labelKey: "dailyDashboard.quickActions.comfort", labelAr: "الراحة", labelEn: "Comfort",
        count: 0, accent: "from-indigo-500/12 to-indigo-500/[0.04]", iconColor: "text-indigo-600 dark:text-indigo-400" },
      { id: "contractions", href: "/tools/contraction-timer", icon: Heart,
        labelKey: "dashboard.myTools.contractions", labelAr: "الانقباضات", labelEn: "Contractions",
        count: contractions.length, accent: "from-red-500/12 to-red-500/[0.04]", iconColor: "text-red-600 dark:text-red-400" },
      { id: "diaper", href: "/tools/diaper-tracker", icon: Baby,
        labelKey: "dashboard.myTools.diaper", labelAr: "حفاضات الطفل", labelEn: "Diaper",
        count: diapers.length, accent: "from-cyan-500/12 to-cyan-500/[0.04]", iconColor: "text-cyan-600 dark:text-cyan-400" },
      { id: "photos", href: "/tools/ai-bump-photos", icon: Camera,
        labelKey: "dailyDashboard.quickActions.photos", labelAr: "الصور", labelEn: "Photos",
        count: 0, accent: "from-purple-500/12 to-purple-500/[0.04]", iconColor: "text-purple-600 dark:text-purple-400" },
      { id: "grocery", href: "/tools/smart-grocery-list", icon: ShoppingBag,
        labelKey: "dashboard.myTools.grocery", labelAr: "قائمة التسوق", labelEn: "Grocery",
        count: groceries.length, accent: "from-lime-500/12 to-lime-500/[0.04]", iconColor: "text-lime-600 dark:text-lime-400" },
      { id: "bag", href: "/tools/ai-hospital-bag", icon: Briefcase,
        labelKey: "dashboard.myTools.hospitalBag", labelAr: "حقيبة المستشفى", labelEn: "Hospital Bag",
        count: bag.length, accent: "from-fuchsia-500/12 to-fuchsia-500/[0.04]", iconColor: "text-fuchsia-600 dark:text-fuchsia-400" },
      { id: "birthPlan", href: "/tools/ai-birth-plan", icon: Sparkles,
        labelKey: "dashboard.myTools.birthPlan", labelAr: "خطة الولادة", labelEn: "Birth Plan",
        count: birthPlans.length, accent: "from-rose-400/12 to-rose-400/[0.04]", iconColor: "text-rose-500 dark:text-rose-300" },
    ];
  }, []);

  // Sort: tools with data first, then suggestions
  const sorted = useMemo(() => {
    const withData = tools.filter(t => t.count > 0);
    const empty = tools.filter(t => t.count === 0);
    return [...withData, ...empty];
  }, [tools]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      aria-labelledby="dashboard-tools-heading"
    >
      <div className="flex items-center justify-between mb-3">
        <h2
          id="dashboard-tools-heading"
          className="text-lg font-extrabold text-foreground tracking-tight"
        >
          {t("dashboardV2.tools.title")}
        </h2>
        <Link
          to="/discover"
          className="inline-flex items-center gap-0.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          {t("dashboardV2.tools.viewAll")}
          <Chevron className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {sorted.map((tool, i) => {
          const Icon = tool.icon;
          const hasData = tool.count > 0;
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.02 * i, duration: 0.25 }}
            >
              <Link
                to={tool.href}
                className={`group relative flex h-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-border/30 bg-gradient-to-br ${tool.accent} p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md active:scale-[0.97]`}
              >
                {hasData && (
                  <span className={`absolute top-1.5 end-1.5 text-[9px] font-black tabular-nums ${tool.iconColor}`}>
                    {tool.count}
                  </span>
                )}
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-background/70 backdrop-blur-sm shadow-sm">
                  <Icon className={`h-5 w-5 ${tool.iconColor}`} strokeWidth={1.85} />
                </div>
                <span className="text-[10px] font-semibold leading-tight text-foreground/85 text-center line-clamp-2">
                  {t(tool.labelKey, tool.labelEn)}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
});
