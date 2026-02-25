import { useMemo, memo } from "react";
import { Brain, Baby, Heart, Activity, Dumbbell, AlertTriangle, CheckCircle, Flower2, ChevronRight, ChevronLeft, Calendar, Sparkles, Shield, UtensilsCrossed, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { getToolsByCategory } from "@/lib/tools-data";
import { Link } from "react-router-dom";


interface CategoryConfig {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  border: string;
  accentBar: string;
  toolHover: string;
  iconColor: string;
}

// Ordered by user journey: Assistant → Fertility → Pregnancy → Nutrition → Wellness → Mental → Self-Check → Labor → Preparation → Postpartum
const categoryConfig: CategoryConfig[] = [
  {
    key: "categories.smartAssistant", icon: MessageSquare,
    bg: "from-pink-500/12 via-rose-400/8 to-pink-200/4",
    border: "border-pink-300/40",
    accentBar: "bg-gradient-to-r from-pink-500 to-rose-500",
    iconColor: "text-pink-500 dark:text-pink-400",
    toolHover: "hover:bg-pink-50/70 dark:hover:bg-pink-900/20",
  },
  {
    key: "categories.fertility", icon: Calendar,
    bg: "from-rose-500/10 via-pink-400/6 to-rose-200/4",
    border: "border-rose-300/30",
    accentBar: "bg-rose-500",
    iconColor: "text-rose-500 dark:text-rose-400",
    toolHover: "hover:bg-rose-50/70 dark:hover:bg-rose-900/20",
  },
  {
    key: "categories.pregnancy", icon: Baby,
    bg: "from-pink-500/10 via-pink-300/6 to-pink-200/4",
    border: "border-pink-300/30",
    accentBar: "bg-pink-500",
    iconColor: "text-pink-500 dark:text-pink-400",
    toolHover: "hover:bg-pink-50/70 dark:hover:bg-pink-900/20",
  },
  {
    key: "categories.nutrition", icon: UtensilsCrossed,
    bg: "from-orange-500/10 via-amber-400/6 to-orange-200/4",
    border: "border-orange-300/30",
    accentBar: "bg-gradient-to-r from-orange-500 to-amber-500",
    iconColor: "text-orange-500 dark:text-orange-400",
    toolHover: "hover:bg-orange-50/70 dark:hover:bg-orange-900/20",
  },
  {
    key: "categories.wellness", icon: Dumbbell,
    bg: "from-emerald-500/10 via-green-400/6 to-emerald-200/4",
    border: "border-emerald-300/30",
    accentBar: "bg-emerald-500",
    iconColor: "text-emerald-500 dark:text-emerald-400",
    toolHover: "hover:bg-emerald-50/70 dark:hover:bg-emerald-900/20",
  },
  {
    key: "categories.mentalHealth", icon: Heart,
    bg: "from-sky-500/10 via-blue-400/6 to-sky-200/4",
    border: "border-sky-300/30",
    accentBar: "bg-sky-500",
    iconColor: "text-sky-500 dark:text-sky-400",
    toolHover: "hover:bg-sky-50/70 dark:hover:bg-sky-900/20",
  },
  {
    key: "categories.selfCheck", icon: Shield,
    bg: "from-amber-500/10 via-yellow-400/6 to-amber-200/4",
    border: "border-amber-300/30",
    accentBar: "bg-amber-500",
    iconColor: "text-amber-500 dark:text-amber-400",
    toolHover: "hover:bg-amber-50/70 dark:hover:bg-amber-900/20",
  },
  {
    key: "categories.labor", icon: Activity,
    bg: "from-rose-500/10 via-red-400/6 to-rose-200/4",
    border: "border-rose-300/30",
    accentBar: "bg-rose-500",
    iconColor: "text-rose-500 dark:text-rose-400",
    toolHover: "hover:bg-rose-50/70 dark:hover:bg-rose-900/20",
  },
  {
    key: "categories.preparation", icon: CheckCircle,
    bg: "from-teal-500/10 via-cyan-400/6 to-teal-200/4",
    border: "border-teal-300/30",
    accentBar: "bg-teal-500",
    iconColor: "text-teal-500 dark:text-teal-400",
    toolHover: "hover:bg-teal-50/70 dark:hover:bg-teal-900/20",
  },
  {
    key: "categories.postpartum", icon: Flower2,
    bg: "from-fuchsia-500/10 via-purple-400/6 to-fuchsia-200/4",
    border: "border-fuchsia-300/30",
    accentBar: "bg-fuchsia-500",
    iconColor: "text-fuchsia-500 dark:text-fuchsia-400",
    toolHover: "hover:bg-fuchsia-50/70 dark:hover:bg-fuchsia-900/20",
  },
];

const CategoryCard = memo(function CategoryCard({ config, index }: { config: CategoryConfig; index: number }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const tools = useMemo(() => getToolsByCategory(config.key), [config.key]);
  const Icon = config.icon;
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  if (tools.length === 0) return null;

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${config.bg} border ${config.border} overflow-hidden shadow-sm animate-fade-in`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header with accent bar */}
      <div className="relative">
        <div className={`absolute top-0 inset-x-0 h-1 ${config.accentBar} rounded-t-2xl`} />
        <div className="flex items-center gap-2.5 px-3.5 pt-4 pb-2">
          <div className={`w-7 h-7 rounded-lg bg-white/80 dark:bg-white/10 flex items-center justify-center shadow-sm`}>
            <Icon className={`w-4 h-4 ${config.iconColor}`} />
          </div>
          <h2 className="text-sm font-extrabold text-foreground tracking-tight truncate flex-1">
            {t(config.key)}
          </h2>
        </div>
      </div>

      {/* Tools list */}
      <div className="px-2 pb-2.5 pt-0.5 space-y-1">
        {tools.map((tool) => {
          const ToolIcon = tool.icon;
          return (
            <Link key={tool.id} to={tool.href} className="block">
              <div className={`group flex items-center gap-2.5 p-2.5 rounded-xl bg-card/60 backdrop-blur-sm ${config.toolHover} border border-transparent hover:border-border/30 transition-all duration-200`}>
                <div className={`flex-shrink-0 w-9 h-9 rounded-xl bg-white/90 dark:bg-white/10 border border-border/20 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                  <ToolIcon className={`w-4 h-4 ${config.iconColor} opacity-70 group-hover:opacity-100 transition-opacity`} strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-foreground truncate leading-snug">{t(tool.titleKey)}</h3>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{t(tool.descriptionKey)}</p>
                </div>
                <ChevronIcon className="flex-shrink-0 w-3.5 h-3.5 text-muted-foreground/25 group-hover:text-muted-foreground/60 transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
});

const Index = () => {
  return (
    <Layout>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[30vh] bg-gradient-to-t from-primary/10 via-primary/5 to-transparent z-30" />

      <section className="py-3 relative z-10">
        <div className="container space-y-3">
          {categoryConfig.map((cat, index) => (
            <CategoryCard key={cat.key} config={cat} index={index} />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;