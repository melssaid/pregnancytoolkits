import { useMemo, memo } from "react";
import { motion } from "framer-motion";
import { Brain, Baby, Heart, Activity, Dumbbell, AlertTriangle, Clock, CheckCircle, Flower2, ChevronRight, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { getSortedTools, getToolsByCategory } from "@/lib/tools-data";
import { Link } from "react-router-dom";

interface CategoryConfig {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconColor: string;
}

const categoryConfig: CategoryConfig[] = [
  { key: "categories.ai", icon: Brain, gradient: "from-violet-500/15 to-purple-500/5", iconColor: "text-violet-600 dark:text-violet-400" },
  { key: "categories.pregnancy", icon: Baby, gradient: "from-pink-500/15 to-rose-500/5", iconColor: "text-pink-600 dark:text-pink-400" },
  { key: "categories.labor", icon: Clock, gradient: "from-amber-500/15 to-orange-500/5", iconColor: "text-amber-600 dark:text-amber-400" },
  { key: "categories.wellness", icon: Dumbbell, gradient: "from-emerald-500/15 to-green-500/5", iconColor: "text-emerald-600 dark:text-emerald-400" },
  { key: "categories.mentalHealth", icon: Heart, gradient: "from-rose-500/15 to-red-500/5", iconColor: "text-rose-600 dark:text-rose-400" },
  { key: "categories.fertility", icon: Activity, gradient: "from-cyan-500/15 to-teal-500/5", iconColor: "text-cyan-600 dark:text-cyan-400" },
  { key: "categories.preparation", icon: CheckCircle, gradient: "from-blue-500/15 to-indigo-500/5", iconColor: "text-blue-600 dark:text-blue-400" },
  { key: "categories.riskAssessment", icon: AlertTriangle, gradient: "from-orange-500/15 to-amber-500/5", iconColor: "text-orange-600 dark:text-orange-400" },
  { key: "categories.postpartum", icon: Flower2, gradient: "from-fuchsia-500/15 to-pink-500/5", iconColor: "text-fuchsia-600 dark:text-fuchsia-400" },
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      {/* Category Hero Card */}
      <div className={`rounded-3xl bg-gradient-to-br ${config.gradient} border border-border/30 overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pb-2">
          <div className="w-11 h-11 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/40 flex items-center justify-center shadow-sm">
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-bold text-foreground tracking-tight truncate">{t(config.key)}</h2>
            <p className="text-[10px] text-muted-foreground font-medium">{tools.length} {t('common.tools', 'tools')}</p>
          </div>
        </div>

        {/* Tools List */}
        <div className="px-3 pb-3 space-y-1">
          {tools.map((tool) => {
            const ToolIcon = tool.icon;
            return (
              <Link key={tool.id} to={tool.href} className="block">
                <div className="group flex items-center gap-3 p-2.5 rounded-xl bg-card/70 backdrop-blur-sm border border-border/20 hover:bg-card hover:border-border/50 hover:shadow-sm transition-all duration-200">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center group-hover:bg-muted transition-colors">
                    <ToolIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-foreground truncate">{t(tool.titleKey)}</h3>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{t(tool.descriptionKey)}</p>
                  </div>
                  <ChevronIcon className="flex-shrink-0 w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
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
      {/* Aesthetic gradient overlay */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[35vh] bg-gradient-to-t from-primary/15 via-primary/8 to-transparent z-30" />

      <section className="py-4 relative z-10">
        <div className="container space-y-4">
          {categoryConfig.map((cat, index) => (
            <CategoryCard key={cat.key} config={cat} index={index} />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
