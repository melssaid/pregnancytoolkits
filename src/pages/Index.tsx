import { useState, useMemo, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Baby, Heart, Activity, Dumbbell, AlertTriangle, Clock, CheckCircle, Flower2, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { AIToolsShowcase } from "@/components/AIToolsShowcase";
import { getSortedTools, getToolsByCategory } from "@/lib/tools-data";
import { SubscriptionModal } from "@/components/SubscriptionModal";

interface CategoryConfig {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Non-AI categories - AI is handled separately with AIToolsShowcase
const categoryConfig: CategoryConfig[] = [
  { key: "categories.pregnancy", icon: Baby },
  { key: "categories.labor", icon: Clock },
  { key: "categories.wellness", icon: Dumbbell },
  { key: "categories.mentalHealth", icon: Heart },
  { key: "categories.fertility", icon: Activity },
  { key: "categories.preparation", icon: CheckCircle },
  { key: "categories.riskAssessment", icon: AlertTriangle },
  { key: "categories.postpartum", icon: Flower2 },
];

// Memoized ToolCard for performance
const MemoizedToolCard = memo(ToolCard);

const Index = () => {
  const { t } = useTranslation();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  // Get AI tools for the showcase
  const aiTools = useMemo(() => getToolsByCategory("categories.ai"), []);

  const closeModal = useCallback(() => setShowSubscriptionModal(false), []);

  return (
    <Layout>
      {/* Aesthetic gradient overlay from bottom to top */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[50vh] bg-gradient-to-t from-primary/15 via-primary/8 to-transparent z-30" />

      {/* Categories */}
      <section className="py-4 relative z-10">
        <div className="container space-y-5">
          {/* AI Tools Showcase - Creative Grid Design */}
          {aiTools.length > 0 && (
            <AIToolsShowcase tools={aiTools} />
          )}

          {/* Other Categories */}
          {categoryConfig.map((cat) => {
            const allTools = getToolsByCategory(cat.key);
            const Icon = cat.icon;
            
            if (allTools.length === 0) return null;

            return (
              <div key={cat.key}>
                {/* Section Header */}
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-primary" />
                    <Icon className="w-4 h-4 text-foreground/50" />
                    <h2 className="text-xs font-semibold text-foreground/70 tracking-widest uppercase">
                      {t(cat.key)}
                    </h2>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
                </div>
                
                {/* Tools Container */}
                <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
                  <div className="divide-y divide-border/30">
                    {allTools.map((tool, index) => (
                      <div key={tool.id} className="px-2 py-1">
                        <MemoizedToolCard
                          titleKey={tool.titleKey}
                          descriptionKey={tool.descriptionKey}
                          icon={tool.icon}
                          href={tool.href}
                          categoryKey={tool.categoryKey}
                          index={index}
                          hasAI={false}
                        />
                      </div>
                    ))}
                  </div>
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
