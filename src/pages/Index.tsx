import { useState, useMemo, memo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Brain, Baby, Heart, Activity, Dumbbell, AlertTriangle, Clock, CheckCircle, Flower2, ChevronRight, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { getSortedTools, getToolsByCategory } from "@/lib/tools-data";

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

function HorizontalScrollRow({ categoryKey, icon: Icon }: { categoryKey: string; icon: React.ComponentType<{ className?: string }> }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const scrollRef = useRef<HTMLDivElement>(null);
  const tools = useMemo(() => getToolsByCategory(categoryKey), [categoryKey]);

  if (tools.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = direction === 'left' ? -300 : 300;
    scrollRef.current.scrollBy({ left: isRTL ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="space-y-2">
      {/* Section Header */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-primary" />
          <Icon className="w-4 h-4 text-primary/70" />
          <h2 className="text-sm font-bold text-foreground tracking-tight">
            {t(categoryKey)}
          </h2>
          <span className="text-[10px] text-muted-foreground font-medium bg-muted/60 px-1.5 py-0.5 rounded-full">
            {tools.length}
          </span>
        </div>
        {/* Scroll Arrows - hidden on mobile, visible on larger screens */}
        <div className="hidden sm:flex items-center gap-1">
          <button 
            onClick={() => scroll('left')} 
            className="w-7 h-7 rounded-full bg-muted/50 hover:bg-primary/10 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button 
            onClick={() => scroll('right')} 
            className="w-7 h-7 rounded-full bg-muted/50 hover:bg-primary/10 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2 snap-x snap-mandatory"
      >
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
            variant="carousel"
          />
        ))}
      </div>
    </div>
  );
}

const Index = () => {
  return (
    <Layout>
      {/* Aesthetic gradient overlay */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[35vh] bg-gradient-to-t from-primary/15 via-primary/8 to-transparent z-30" />

      {/* Categories as horizontal scroll rows */}
      <section className="py-4 relative z-10 space-y-6">
        {categoryConfig.map((cat) => (
          <HorizontalScrollRow
            key={cat.key}
            categoryKey={cat.key}
            icon={cat.icon}
          />
        ))}
      </section>
    </Layout>
  );
};

export default Index;
