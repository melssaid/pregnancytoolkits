import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutGrid, Sparkles, Brain, Baby, Heart, Activity, Dumbbell, AlertTriangle, Clock, Users, Crown, Shield, CheckCircle, Zap, Bell, Flower2, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { getSortedTools, categoryKeys, getAITools, getToolsByCategory } from "@/lib/tools-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { SubscriptionModal } from "@/components/SubscriptionModal";
interface CategoryConfig {
  key: string;
  icon: any;
  gradient: string;
  bgColor: string;
  iconBg: string;
}

const categoryConfig: CategoryConfig[] = [
  { key: "categories.ai", icon: Brain, gradient: "from-violet-500 to-purple-600", bgColor: "bg-violet-50 dark:bg-violet-950/30", iconBg: "bg-gradient-to-br from-violet-500 to-purple-600" },
  { key: "categories.wellness", icon: Dumbbell, gradient: "from-emerald-500 to-teal-600", bgColor: "bg-emerald-50 dark:bg-emerald-950/30", iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600" },
  { key: "categories.pregnancy", icon: Baby, gradient: "from-pink-500 to-rose-600", bgColor: "bg-pink-50 dark:bg-pink-950/30", iconBg: "bg-gradient-to-br from-pink-500 to-rose-600" },
  { key: "categories.labor", icon: Clock, gradient: "from-orange-500 to-red-600", bgColor: "bg-orange-50 dark:bg-orange-950/30", iconBg: "bg-gradient-to-br from-orange-500 to-red-600" },
  { key: "categories.fertility", icon: Activity, gradient: "from-sky-500 to-blue-600", bgColor: "bg-sky-50 dark:bg-sky-950/30", iconBg: "bg-gradient-to-br from-sky-500 to-blue-600" },
  { key: "categories.mentalHealth", icon: Heart, gradient: "from-rose-500 to-pink-600", bgColor: "bg-rose-50 dark:bg-rose-950/30", iconBg: "bg-gradient-to-br from-rose-500 to-pink-600" },
  { key: "categories.riskAssessment", icon: AlertTriangle, gradient: "from-amber-500 to-orange-600", bgColor: "bg-amber-50 dark:bg-amber-950/30", iconBg: "bg-gradient-to-br from-amber-500 to-orange-600" },
  { key: "categories.preparation", icon: CheckCircle, gradient: "from-indigo-500 to-blue-600", bgColor: "bg-indigo-50 dark:bg-indigo-950/30", iconBg: "bg-gradient-to-br from-indigo-500 to-blue-600" },
  { key: "categories.postpartum", icon: Flower2, gradient: "from-fuchsia-500 to-purple-600", bgColor: "bg-fuchsia-50 dark:bg-fuchsia-950/30", iconBg: "bg-gradient-to-br from-fuchsia-500 to-purple-600" },
];

const Index = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const sortedTools = getSortedTools();
  const aiToolsCount = getAITools().length;

  const filteredTools = useMemo(() => {
    if (!search) return [];
    return sortedTools.filter((tool) => {
      const title = t(tool.titleKey).toLowerCase();
      const description = t(tool.descriptionKey).toLowerCase();
      return title.includes(search.toLowerCase()) || description.includes(search.toLowerCase());
    });
  }, [sortedTools, search, t]);

  const getCategoryTools = (categoryKey: string) => {
    return getToolsByCategory(categoryKey).slice(0, 4);
  };

  return (
    <Layout>
      {/* Hero Section - Minimal */}
      <section className="pt-4 pb-2">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-lg font-bold text-foreground">
              {t('app.title', 'Pregnancy')} <span className="text-primary">{t('app.titleHighlight', 'Tools')}</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              {aiToolsCount} AI-Powered Tools
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search Results */}
      {search && (
        <section className="py-4">
          <div className="container">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
              {filteredTools.length} results for "{search}"
            </h3>
            <div className="space-y-2">
              {filteredTools.map((tool, index) => (
                <ToolCard
                  key={tool.id}
                  titleKey={tool.titleKey}
                  descriptionKey={tool.descriptionKey}
                  icon={tool.icon}
                  href={tool.href}
                  categoryKey={tool.categoryKey}
                  index={index}
                  hasAI={tool.hasAI}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories with Tools */}
      {!search && (
        <section className="py-4">
          <div className="container space-y-6">
            {categoryConfig.map((cat, catIndex) => {
              const tools = getCategoryTools(cat.key);
              const totalCount = getToolsByCategory(cat.key).length;
              const Icon = cat.icon;
              
              if (tools.length === 0) return null;

              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: catIndex * 0.05 }}
                >
                  {/* Category Header */}
                  <div className={`rounded-xl ${cat.bgColor} p-4 mb-3`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${cat.iconBg} flex items-center justify-center text-white shadow-lg`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="font-bold text-foreground">{t(cat.key)}</h2>
                          <p className="text-xs text-muted-foreground">{totalCount} tools</p>
                        </div>
                      </div>
                      {totalCount > 4 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
                        >
                          {activeCategory === cat.key ? 'Show Less' : 'View All'}
                          <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${activeCategory === cat.key ? 'rotate-90' : ''}`} />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Tools List */}
                  <div className="space-y-2">
                    {(activeCategory === cat.key ? getToolsByCategory(cat.key) : tools).map((tool, index) => (
                      <ToolCard
                        key={tool.id}
                        titleKey={tool.titleKey}
                        descriptionKey={tool.descriptionKey}
                        icon={tool.icon}
                        href={tool.href}
                        categoryKey={tool.categoryKey}
                        index={index}
                        hasAI={tool.hasAI}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Notification Banner */}
      <section className="py-4">
        <div className="container">
          <Link to="/tools/smart-appointment-reminder">
            <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-4 hover:border-primary/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg">
                <Bell className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">Smart Reminders</h3>
                <p className="text-xs text-muted-foreground">Get AI-powered reminders for appointments, vitamins & exercises</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>
        </div>
      </section>

      {/* Premium Banner */}
      <section className="py-4 border-t border-border/50">
        <div className="container">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-5 text-primary-foreground relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5" />
                <span className="uppercase tracking-widest text-[10px] font-bold opacity-90">Premium</span>
              </div>
              <h2 className="text-lg font-bold mb-1">Unlock Full AI Power</h2>
              
              {/* Free Trial Badge */}
              <button 
                onClick={() => setShowSubscriptionModal(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/20 backdrop-blur-sm mb-3 hover:bg-background/30 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-semibold">3 Days Free Trial - Full Access!</span>
              </button>
              
              <p className="text-xs opacity-90 mb-3">
                Try all AI features free for 3 days. Then $1.99/month or $14.99/year.
              </p>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="rounded-full px-4 text-xs h-8"
                  onClick={() => setShowSubscriptionModal(true)}
                >
                  Start Free Trial
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="rounded-full text-primary-foreground border-primary-foreground/20 hover:bg-background/10 text-xs h-8"
                  onClick={() => setShowSubscriptionModal(true)}
                >
                  View Plans
                </Button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-background/10 -skew-x-12 translate-x-1/2 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 border-t border-border bg-muted/30">
        <div className="container text-center">
          <p className="text-[10px] text-muted-foreground mb-2">
            <strong>{t('common.warning', 'IMPORTANT')}:</strong> {t('app.medicalDisclaimer', 'The information provided is for educational purposes only.')}
          </p>
          <div className="flex justify-center gap-4 text-[10px] font-medium text-muted-foreground">
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
            <span>© 2026 Pregnancy Tools</span>
          </div>
        </div>
      </footer>

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
    </Layout>
  );
};

export default Index;
