import { useMemo } from "react";
import { motion } from "framer-motion";
import { Brain, Baby, Heart, Activity, Dumbbell, AlertTriangle, Clock, CheckCircle, Flower2, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { getToolsByCategory } from "@/lib/tools-data";
import { Link } from "react-router-dom";

interface CategoryConfig {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  border: string;
  iconBg: string;
  iconText: string;
  toolHover: string;
}

const categoryConfig: CategoryConfig[] = [
  {
    key: "categories.ai", icon: Brain,
    bg: "from-rose-400/12 via-pink-300/8 to-rose-200/5",
    border: "border-rose-300/25",
    iconBg: "bg-rose-500/15",
    iconText: "text-rose-600 dark:text-rose-400",
    toolHover: "hover:bg-rose-50/60 dark:hover:bg-rose-900/20",
  },
  {
    key: "categories.pregnancy", icon: Baby,
    bg: "from-pink-400/12 via-pink-300/8 to-pink-200/5",
    border: "border-pink-300/25",
    iconBg: "bg-pink-500/15",
    iconText: "text-pink-600 dark:text-pink-400",
    toolHover: "hover:bg-pink-50/60 dark:hover:bg-pink-900/20",
  },
  {
    key: "categories.labor", icon: Clock,
    bg: "from-fuchsia-400/12 via-fuchsia-300/8 to-fuchsia-200/5",
    border: "border-fuchsia-300/25",
    iconBg: "bg-fuchsia-500/15",
    iconText: "text-fuchsia-600 dark:text-fuchsia-400",
    toolHover: "hover:bg-fuchsia-50/60 dark:hover:bg-fuchsia-900/20",
  },
  {
    key: "categories.wellness", icon: Dumbbell,
    bg: "from-rose-300/12 via-rose-200/8 to-rose-100/5",
    border: "border-rose-200/25",
    iconBg: "bg-rose-400/15",
    iconText: "text-rose-500 dark:text-rose-400",
    toolHover: "hover:bg-rose-50/60 dark:hover:bg-rose-900/20",
  },
  {
    key: "categories.mentalHealth", icon: Heart,
    bg: "from-pink-500/12 via-pink-400/8 to-pink-300/5",
    border: "border-pink-400/25",
    iconBg: "bg-pink-600/15",
    iconText: "text-pink-700 dark:text-pink-300",
    toolHover: "hover:bg-pink-50/60 dark:hover:bg-pink-900/20",
  },
  {
    key: "categories.fertility", icon: Activity,
    bg: "from-rose-400/10 via-pink-300/8 to-rose-200/5",
    border: "border-rose-300/20",
    iconBg: "bg-rose-500/12",
    iconText: "text-rose-500 dark:text-rose-400",
    toolHover: "hover:bg-rose-50/50 dark:hover:bg-rose-900/15",
  },
  {
    key: "categories.preparation", icon: CheckCircle,
    bg: "from-pink-300/12 via-rose-200/8 to-pink-100/5",
    border: "border-pink-200/25",
    iconBg: "bg-pink-400/15",
    iconText: "text-pink-500 dark:text-pink-400",
    toolHover: "hover:bg-pink-50/50 dark:hover:bg-pink-900/15",
  },
  {
    key: "categories.selfCheck", icon: AlertTriangle,
    bg: "from-fuchsia-300/12 via-rose-300/8 to-fuchsia-200/5",
    border: "border-fuchsia-200/25",
    iconBg: "bg-fuchsia-400/15",
    iconText: "text-fuchsia-500 dark:text-fuchsia-400",
    toolHover: "hover:bg-fuchsia-50/50 dark:hover:bg-fuchsia-900/15",
  },
  {
    key: "categories.postpartum", icon: Flower2,
    bg: "from-pink-400/10 via-fuchsia-300/8 to-pink-200/5",
    border: "border-pink-300/20",
    iconBg: "bg-pink-500/12",
    iconText: "text-pink-600 dark:text-pink-400",
    toolHover: "hover:bg-pink-50/50 dark:hover:bg-pink-900/15",
  },
];

function CategoryCard({ config, index }: { config: CategoryConfig; index: number }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const tools = useMemo(() => getToolsByCategory(config.key), [config.key]);
  const Icon = config.icon;
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  if (tools.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <div className={`rounded-2xl bg-gradient-to-br ${config.bg} border ${config.border} overflow-hidden shadow-sm`}>
        {/* Compact Header */}
        <div className="flex items-center gap-2.5 px-3.5 pt-3.5 pb-2">
          <div className="w-1.5 h-5 rounded-full bg-rose-800 dark:bg-rose-600" />
          <h2 className="text-sm font-extrabold text-foreground tracking-tight truncate">{t(config.key)}</h2>
        </div>

        {/* Tools */}
        <div className="px-2 pb-2 pt-1 space-y-0.5">
          {tools.map((tool) => {
            const ToolIcon = tool.icon;
            return (
              <Link key={tool.id} to={tool.href} className="block">
                <div className={`group flex items-center gap-2.5 p-2 rounded-xl bg-card/50 backdrop-blur-sm ${config.toolHover} transition-all duration-200`}>
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-card/80 border border-border/20 flex items-center justify-center">
                    <ToolIcon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-[11px] font-semibold text-foreground truncate leading-snug">{t(tool.titleKey)}</h3>
                      {tool.hasAI && (
                        <span className="flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                          <Sparkles className="w-2 h-2 text-primary" />
                          <span className="text-[8px] font-bold text-primary leading-none">AI</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-muted-foreground truncate mt-0.5">{t(tool.descriptionKey)}</p>
                  </div>
                  <ChevronIcon className="flex-shrink-0 w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

const Index = () => {
  return (
    <Layout>
      {/* Subtle gradient overlay */}
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
