import { useState, useMemo, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Baby, Heart, Activity, Dumbbell, AlertTriangle, Clock, CheckCircle, Flower2, ChevronDown, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { getSortedTools, getAITools, getToolsByCategory } from "@/lib/tools-data";
import { Button } from "@/components/ui/button";
import { SubscriptionModal } from "@/components/SubscriptionModal";

interface CategoryConfig {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  iconBg: string;
}

const categoryConfig: CategoryConfig[] = [
  { key: "categories.ai", icon: Brain, bgColor: "bg-violet-50 dark:bg-violet-950/30", iconBg: "bg-gradient-to-br from-violet-500 to-purple-600" },
  { key: "categories.pregnancy", icon: Baby, bgColor: "bg-pink-50 dark:bg-pink-950/30", iconBg: "bg-gradient-to-br from-pink-500 to-rose-600" },
  { key: "categories.wellness", icon: Dumbbell, bgColor: "bg-emerald-50 dark:bg-emerald-950/30", iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600" },
  { key: "categories.fertility", icon: Activity, bgColor: "bg-sky-50 dark:bg-sky-950/30", iconBg: "bg-gradient-to-br from-sky-500 to-blue-600" },
  { key: "categories.labor", icon: Clock, bgColor: "bg-orange-50 dark:bg-orange-950/30", iconBg: "bg-gradient-to-br from-orange-500 to-red-600" },
  { key: "categories.mentalHealth", icon: Heart, bgColor: "bg-rose-50 dark:bg-rose-950/30", iconBg: "bg-gradient-to-br from-rose-500 to-pink-600" },
  { key: "categories.riskAssessment", icon: AlertTriangle, bgColor: "bg-amber-50 dark:bg-amber-950/30", iconBg: "bg-gradient-to-br from-amber-500 to-orange-600" },
  { key: "categories.preparation", icon: CheckCircle, bgColor: "bg-indigo-50 dark:bg-indigo-950/30", iconBg: "bg-gradient-to-br from-indigo-500 to-blue-600" },
  { key: "categories.postpartum", icon: Flower2, bgColor: "bg-fuchsia-50 dark:bg-fuchsia-950/30", iconBg: "bg-gradient-to-br from-fuchsia-500 to-purple-600" },
];

// Memoized ToolCard for performance
const MemoizedToolCard = memo(ToolCard);

const Index = () => {
  const { t } = useTranslation();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  const sortedTools = useMemo(() => getSortedTools(), []);
  const totalTools = sortedTools.length;

  const toggleCategory = useCallback((categoryKey: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey);
      } else {
        newSet.add(categoryKey);
      }
      return newSet;
    });
  }, []);

  const openModal = useCallback(() => setShowSubscriptionModal(true), []);
  const closeModal = useCallback(() => setShowSubscriptionModal(false), []);

  return (
    <Layout>
      {/* Compact Hero */}
      <section className="pt-6 pb-4">
        <div className="container text-center">
          <h1 className="text-xl font-bold text-foreground mb-1">
            Pregnancy <span className="text-primary">Toolkits</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            {totalTools} professional tools for your journey
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-6">
        <div className="container space-y-3">
          {categoryConfig.map((cat) => {
            const allTools = getToolsByCategory(cat.key);
            const isExpanded = expandedCategories.has(cat.key);
            const displayTools = isExpanded ? allTools : allTools.slice(0, 3);
            const Icon = cat.icon;
            
            if (allTools.length === 0) return null;

            return (
              <div key={cat.key} className="overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(cat.key)}
                  className={`w-full rounded-xl ${cat.bgColor} p-3 flex items-center justify-between transition-all duration-200 hover:opacity-90`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${cat.iconBg} flex items-center justify-center text-white shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-sm font-semibold text-foreground">{t(cat.key)}</h2>
                      <p className="text-[10px] text-muted-foreground">{allTools.length} tools</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {/* Tools List */}
                <AnimatePresence initial={false}>
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: "auto",
                      opacity: 1 
                    }}
                    className="mt-2 space-y-1.5"
                  >
                    {displayTools.map((tool, index) => (
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
                    
                    {/* Show More Button */}
                    {allTools.length > 3 && !isExpanded && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => toggleCategory(cat.key)}
                        className="w-full py-2 text-xs font-medium text-primary hover:text-primary/80 flex items-center justify-center gap-1 transition-colors"
                      >
                        Show {allTools.length - 3} more
                        <ChevronDown className="w-3.5 h-3.5" />
                      </motion.button>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Premium Banner - Simplified */}
      <section className="py-4 border-t border-border/50">
        <div className="container">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-5 text-primary-foreground relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-xs font-bold opacity-90">FREE TRIAL</span>
              </div>
              <h2 className="text-lg font-bold mb-2">3 Days Free Access</h2>
              <p className="text-xs opacity-90 mb-4">
                All {totalTools} tools • Then $1.99/month
              </p>
              <Button 
                size="sm" 
                variant="secondary" 
                className="rounded-full px-5 text-xs"
                onClick={openModal}
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 border-t border-border bg-muted/30">
        <div className="container text-center">
          <p className="text-[10px] text-muted-foreground mb-2">
            For informational purposes only. Consult your doctor.
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
        onClose={closeModal} 
      />
    </Layout>
  );
};

export default Index;
