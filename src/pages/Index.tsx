import { useState, useMemo, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Brain, Baby, Heart, Activity, Dumbbell, AlertTriangle, Clock, CheckCircle, Flower2, Star, TrendingUp, Droplets, Footprints, SmilePlus, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { getSortedTools, getToolsByCategory } from "@/lib/tools-data";
import { Link } from "react-router-dom";

interface CategoryConfig {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
}

const categoryConfig: CategoryConfig[] = [
  { key: "categories.ai", icon: Brain },
  { key: "categories.pregnancy", icon: Baby },
  { key: "categories.labor", icon: Clock },
  { key: "categories.wellness", icon: Dumbbell },
  { key: "categories.mentalHealth", icon: Heart },
  { key: "categories.fertility", icon: Activity },
  { key: "categories.preparation", icon: CheckCircle },
  { key: "categories.riskAssessment", icon: AlertTriangle },
  { key: "categories.postpartum", icon: Flower2 },
];

const MemoizedToolCard = memo(ToolCard);

// Quick stat card
function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-border/40 min-w-0`}>
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-primary-foreground" />
      </div>
      <span className="text-lg font-bold text-foreground leading-none">{value}</span>
      <span className="text-[10px] text-muted-foreground font-medium text-center truncate w-full">{label}</span>
    </div>
  );
}

// Favorite tools (first 4 from AI category as default favorites)
function FavoritesSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const aiTools = useMemo(() => getToolsByCategory("categories.ai").slice(0, 4), []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-warning fill-warning" />
          <h2 className="text-sm font-bold text-foreground">{t('dashboard.quickActions', 'Quick Access')}</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {aiTools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.id} to={tool.href} className="block">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/40 hover:border-primary/30 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0 group-hover:from-primary/25 group-hover:to-primary/10 transition-all">
                  <Icon className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                </div>
                <h3 className="text-[11px] font-semibold text-foreground truncate leading-snug flex-1 min-w-0">
                  {t(tool.titleKey)}
                </h3>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const Index = () => {
  const { t } = useTranslation();
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  return (
    <Layout>
      {/* Aesthetic gradient overlay */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[35vh] bg-gradient-to-t from-primary/15 via-primary/8 to-transparent z-30" />

      <section className="py-4 relative z-10">
        <div className="container space-y-5">

          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-1"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">{t('dashboard.welcome', 'Welcome Back')}</h1>
              <p className="text-xs text-muted-foreground">{t('dashboard.subtitle', 'Your health companion')}</p>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-4 gap-2"
          >
            <StatCard icon={TrendingUp} label={t('stats.weight', 'Weight')} value="--" color="bg-primary" />
            <StatCard icon={Footprints} label={t('stats.kicks', 'Kicks')} value="--" color="bg-accent" />
            <StatCard icon={SmilePlus} label={t('stats.mood', 'Mood')} value="--" color="bg-warning" />
            <StatCard icon={Droplets} label={t('stats.water', 'Water')} value="--" color="bg-accent" />
          </motion.div>

          {/* Favorites */}
          <FavoritesSection />

          {/* All Categories */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1 h-5 rounded-full bg-primary" />
              <h2 className="text-sm font-bold text-foreground">{t('home.allTools', 'All Tools')}</h2>
            </div>

            <div className="space-y-2">
              {categoryConfig.map((cat) => {
                const tools = getToolsByCategory(cat.key);
                if (tools.length === 0) return null;
                const Icon = cat.icon;
                const isOpen = expandedCat === cat.key;

                return (
                  <div key={cat.key} className="rounded-2xl border border-border/40 bg-card overflow-hidden">
                    {/* Category Header - Clickable */}
                    <button
                      onClick={() => setExpandedCat(isOpen ? null : cat.key)}
                      className="w-full flex items-center gap-3 p-3.5 hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/12 to-primary/5 border border-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary/70" />
                      </div>
                      <div className="flex-1 min-w-0 text-start">
                        <h3 className="text-[13px] font-semibold text-foreground truncate">{t(cat.key)}</h3>
                        <p className="text-[10px] text-muted-foreground">{tools.length} {t('common.tools', 'tools')}</p>
                      </div>
                      <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                    </button>

                    {/* Expanded Tools */}
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-border/30"
                      >
                        <div className="p-2 space-y-1">
                          {tools.map((tool, index) => (
                            <MemoizedToolCard
                              key={tool.id}
                              titleKey={tool.titleKey}
                              descriptionKey={tool.descriptionKey}
                              icon={tool.icon}
                              href={tool.href}
                              categoryKey={tool.categoryKey}
                              index={index}
                              hasAI={false}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>
    </Layout>
  );
};

export default Index;
