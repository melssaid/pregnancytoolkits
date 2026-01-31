import { useState, useMemo, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Baby, Heart, Activity, Dumbbell, AlertTriangle, Clock, CheckCircle, Flower2, ChevronRight, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { getSortedTools, getToolsByCategory } from "@/lib/tools-data";
import { Button } from "@/components/ui/button";
import { SubscriptionModal } from "@/components/SubscriptionModal";

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
      {/* Categories - No duplicate hero */}

      <section className="py-4">
        <div className="container space-y-5">
          {categoryConfig.map((cat) => {
            const allTools = getToolsByCategory(cat.key);
            const isExpanded = expandedCategories.has(cat.key);
            const displayTools = isExpanded ? allTools : allTools.slice(0, 3);
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
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  
                  {/* Expand Button */}
                  {allTools.length > 3 && (
                    <motion.button
                      onClick={() => toggleCategory(cat.key)}
                      className="w-full py-2.5 bg-muted/20 hover:bg-muted/40 border-t border-border/30 flex items-center justify-center gap-1.5 transition-all duration-200 group"
                      whileTap={{ scale: 0.99 }}
                    >
                      <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground tracking-wide">
                        {isExpanded ? 'Show Less' : `+${remainingCount} More`}
                      </span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-foreground" />
                      </motion.div>
                    </motion.button>
                  )}
                </div>
              </div>
            );
          })}
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
