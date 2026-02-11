import { useState, useMemo, memo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Baby, Heart, Activity, Dumbbell, AlertTriangle, Clock, CheckCircle, Flower2, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { getSortedTools, getToolsByCategory } from "@/lib/tools-data";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import useSubscription from "@/hooks/useSubscription";

interface CategoryConfig {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  iconBg: string;
}

// Reordered categories with harmonious theme colors
const categoryConfig: CategoryConfig[] = [
  { key: "categories.ai", icon: Brain, bgColor: "bg-primary/5", iconBg: "bg-primary/15" },
  { key: "categories.pregnancy", icon: Baby, bgColor: "bg-primary/5", iconBg: "bg-primary/15" },
  { key: "categories.labor", icon: Clock, bgColor: "bg-primary/5", iconBg: "bg-primary/15" },
  { key: "categories.wellness", icon: Dumbbell, bgColor: "bg-primary/5", iconBg: "bg-primary/15" },
  { key: "categories.mentalHealth", icon: Heart, bgColor: "bg-primary/5", iconBg: "bg-primary/15" },
  { key: "categories.fertility", icon: Activity, bgColor: "bg-primary/5", iconBg: "bg-primary/15" },
  { key: "categories.preparation", icon: CheckCircle, bgColor: "bg-primary/5", iconBg: "bg-primary/15" },
  { key: "categories.riskAssessment", icon: AlertTriangle, bgColor: "bg-primary/5", iconBg: "bg-primary/15" },
  { key: "categories.postpartum", icon: Flower2, bgColor: "bg-primary/5", iconBg: "bg-primary/15" },
];

const EXPANDED_CATEGORIES_KEY = 'pregnancy_expanded_categories';

// Memoized ToolCard for performance
const MemoizedToolCard = memo(ToolCard);

const Index = () => {
  const { t } = useTranslation();
  
  // Load expanded state from localStorage
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(EXPANDED_CATEGORIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return new Set(Array.isArray(parsed) ? parsed : []);
      }
    } catch (e) {
      console.error('Error loading expanded categories:', e);
    }
    return new Set();
  });
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { hasAccess } = useSubscription();
  
  const sortedTools = useMemo(() => getSortedTools(), []);
  const totalTools = sortedTools.length;

  // Save expanded state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(EXPANDED_CATEGORIES_KEY, JSON.stringify([...expandedCategories]));
    } catch (e) {
      console.error('Error saving expanded categories:', e);
    }
  }, [expandedCategories]);

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
      {/* Aesthetic gradient overlay from bottom to top */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[35vh] bg-gradient-to-t from-primary/15 via-primary/8 to-transparent z-30" />

      {/* Categories */}
      <section className="py-4 relative z-10">
        <div className="container space-y-5">
          {categoryConfig.map((cat, categoryIndex) => {
            const allTools = getToolsByCategory(cat.key);
            const isFirstCategory = categoryIndex === 0;
            const isExpanded = expandedCategories.has(cat.key);
            // Only first category has collapse/expand, others show all tools
            const displayTools = isFirstCategory 
              ? (isExpanded ? allTools : allTools.slice(0, 3))
              : allTools;
            const remainingCount = allTools.length - 3;
            const Icon = cat.icon;
            
            if (allTools.length === 0) return null;

            return (
              <div key={cat.key}>
                {/* Section Header - Tech-forward connected design */}
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-rose-700" />
                    <Icon className="w-4 h-4 text-foreground/50" />
                    <h2 className="text-xs font-semibold text-foreground/70 tracking-widest uppercase">
                      {t(cat.key)}
                    </h2>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
                </div>
                
                {/* Tools Container - Clean connected layout */}
                <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
                  <div className="divide-y divide-border/30">
                    <AnimatePresence initial={false} mode="sync">
                      {displayTools.map((tool, index) => (
                        <motion.div
                          key={tool.id}
                          initial={index >= 3 ? { opacity: 0, height: 0 } : false}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="px-2 py-1"
                        >
                          <MemoizedToolCard
                            titleKey={tool.titleKey}
                            descriptionKey={tool.descriptionKey}
                            icon={tool.icon}
                            href={tool.href}
                            categoryKey={tool.categoryKey}
                            index={index}
                            hasAI={false}
                            isPremium={tool.isPremium}
                            isLocked={tool.isPremium && !hasAccess(true)}
                            onLockedClick={openModal}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  
                  {/* Expand Button - Only for first category */}
                  {isFirstCategory && allTools.length > 3 && (
                    <motion.button
                      onClick={() => toggleCategory(cat.key)}
                      className="w-full py-3 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 hover:from-primary/20 hover:via-primary/10 hover:to-primary/20 border-t border-primary/20 flex items-center justify-center gap-2 transition-all duration-300 group relative overflow-hidden"
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      {/* Shimmer effect */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                        animate={{ translateX: ['100%', '-100%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      />
                      
                      {/* Decorative dots */}
                      <div className="absolute left-4 flex gap-1">
                        <span className="w-1 h-1 rounded-full bg-primary/40" />
                        <span className="w-1 h-1 rounded-full bg-primary/30" />
                        <span className="w-1 h-1 rounded-full bg-primary/20" />
                      </div>
                      
                      <span className="text-xs font-semibold text-primary group-hover:text-primary/80 tracking-wide relative z-10">
                        {isExpanded ? t('common.showLess', 'Show Less') : t('common.moreItems', '+{{count}} More', { count: remainingCount })}
                      </span>
                      
                      <motion.div
                        animate={{ rotate: isExpanded ? -90 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-10"
                      >
                        <ChevronRight className="w-4 h-4 text-primary group-hover:text-primary/80" />
                      </motion.div>
                      
                      {/* Decorative dots */}
                      <div className="absolute right-4 flex gap-1">
                        <span className="w-1 h-1 rounded-full bg-primary/20" />
                        <span className="w-1 h-1 rounded-full bg-primary/30" />
                        <span className="w-1 h-1 rounded-full bg-primary/40" />
                      </div>
                    </motion.button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={closeModal} 
      />
    </Layout>
  );
};

export default Index;
