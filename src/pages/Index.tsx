import { useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Baby, Heart, Activity, Dumbbell, AlertTriangle, Clock, CheckCircle, Bell, Flower2, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { getSortedTools, getAITools, getToolsByCategory } from "@/lib/tools-data";
import { Button } from "@/components/ui/button";
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
  { key: "categories.pregnancy", icon: Baby, gradient: "from-pink-500 to-rose-600", bgColor: "bg-pink-50 dark:bg-pink-950/30", iconBg: "bg-gradient-to-br from-pink-500 to-rose-600" },
  { key: "categories.wellness", icon: Dumbbell, gradient: "from-emerald-500 to-teal-600", bgColor: "bg-emerald-50 dark:bg-emerald-950/30", iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600" },
  { key: "categories.fertility", icon: Activity, gradient: "from-sky-500 to-blue-600", bgColor: "bg-sky-50 dark:bg-sky-950/30", iconBg: "bg-gradient-to-br from-sky-500 to-blue-600" },
  { key: "categories.labor", icon: Clock, gradient: "from-orange-500 to-red-600", bgColor: "bg-orange-50 dark:bg-orange-950/30", iconBg: "bg-gradient-to-br from-orange-500 to-red-600" },
  { key: "categories.mentalHealth", icon: Heart, gradient: "from-rose-500 to-pink-600", bgColor: "bg-rose-50 dark:bg-rose-950/30", iconBg: "bg-gradient-to-br from-rose-500 to-pink-600" },
  { key: "categories.riskAssessment", icon: AlertTriangle, gradient: "from-amber-500 to-orange-600", bgColor: "bg-amber-50 dark:bg-amber-950/30", iconBg: "bg-gradient-to-br from-amber-500 to-orange-600" },
  { key: "categories.preparation", icon: CheckCircle, gradient: "from-indigo-500 to-blue-600", bgColor: "bg-indigo-50 dark:bg-indigo-950/30", iconBg: "bg-gradient-to-br from-indigo-500 to-blue-600" },
  { key: "categories.postpartum", icon: Flower2, gradient: "from-fuchsia-500 to-purple-600", bgColor: "bg-fuchsia-50 dark:bg-fuchsia-950/30", iconBg: "bg-gradient-to-br from-fuchsia-500 to-purple-600" },
];

// Memoized ToolCard for performance
const MemoizedToolCard = memo(ToolCard);

const Index = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const sortedTools = useMemo(() => getSortedTools(), []);
  const aiToolsCount = useMemo(() => getAITools().length, []);
  const totalTools = sortedTools.length;

  const getCategoryTools = useMemo(() => (categoryKey: string) => {
    return getToolsByCategory(categoryKey).slice(0, 4);
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-4 pb-2">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-lg font-bold text-foreground">
              {t('app.title', 'Pregnancy')} <span className="text-primary">{t('app.titleHighlight', 'Toolkits')}</span>
            </h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {totalTools} Tools • {aiToolsCount} AI-Powered
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories with Tools */}
      <section className="py-3">
        <div className="container space-y-4">
          {categoryConfig.map((cat, catIndex) => {
            const tools = getCategoryTools(cat.key);
            const allTools = getToolsByCategory(cat.key);
            const totalCount = allTools.length;
            const Icon = cat.icon;
            
            if (tools.length === 0) return null;

            return (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: catIndex * 0.03 }}
              >
                {/* Category Header */}
                <div className={`rounded-lg ${cat.bgColor} p-3 mb-2`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${cat.iconBg} flex items-center justify-center text-white shadow-sm`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-foreground">{t(cat.key)}</h2>
                        <p className="text-[10px] text-muted-foreground">{totalCount} tools</p>
                      </div>
                    </div>
                    {totalCount > 4 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] h-7 px-2"
                        onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
                      >
                        {activeCategory === cat.key ? 'Less' : 'All'}
                        <ChevronRight className={`w-3 h-3 ml-0.5 transition-transform ${activeCategory === cat.key ? 'rotate-90' : ''}`} />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Tools List */}
                <div className="space-y-1.5">
                  {(activeCategory === cat.key ? allTools : tools).map((tool, index) => (
                    <MemoizedToolCard
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

      {/* Quick Access Banner */}
      <section className="py-3">
        <div className="container">
          <Link to="/tools/smart-appointment-reminder">
            <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-3 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-md">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-foreground">Smart Reminders</h3>
                <p className="text-[10px] text-muted-foreground">Appointments, vitamins & exercises</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Link>
        </div>
      </section>

      {/* Premium Banner */}
      <section className="py-3 border-t border-border/50">
          <div className="container">
            <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-5 text-primary-foreground relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="uppercase tracking-widest text-[10px] font-bold opacity-90">Premium</span>
                </div>
                <h2 className="text-lg font-bold mb-1">Unlock Full Access</h2>
                
                <button 
                  onClick={() => setShowSubscriptionModal(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/20 backdrop-blur-sm mb-3 hover:bg-background/30 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-semibold">3 Days Free Trial!</span>
                </button>
                
                <p className="text-xs opacity-90 mb-3">
                  All {totalTools} tools free for 3 days. Then $1.99/month.
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
            <strong>{t('common.warning', 'IMPORTANT')}:</strong> {t('app.medicalDisclaimer', 'For informational purposes only.')}
          </p>
          <div className="flex justify-center gap-4 text-[10px] font-medium text-muted-foreground">
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
            <span>© 2026</span>
          </div>
        </div>
      </footer>

      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
    </Layout>
  );
};

export default Index;
