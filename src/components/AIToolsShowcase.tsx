import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Brain, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Zap,
  Star,
  TrendingUp,
  Grid3X3,
  LayoutList
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tool } from "@/lib/tools-data";

interface AIToolsShowcaseProps {
  tools: Tool[];
}

// Featured AI tools (first 4 get special treatment)
const FEATURED_COUNT = 4;
const INITIAL_DISPLAY = 8;

const AIToolCard = memo(({ tool, isFeatured, index }: { tool: Tool; isFeatured: boolean; index: number }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const Icon = tool.icon;
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  if (isFeatured) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Link to={tool.href} className="block group">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/20 p-4 h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/40 hover:-translate-y-1">
            {/* Shimmer effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full pointer-events-none"
              animate={{ translateX: ['100%', '-100%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
            />
            
            {/* AI Badge */}
            <div className="absolute top-3 end-3">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-bold text-primary">AI</span>
              </div>
            </div>
            
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-3 shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-6 h-6 text-white" strokeWidth={1.75} />
            </div>
            
            {/* Content */}
            <h3 className="text-base font-bold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {t(tool.titleKey)}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {t(tool.descriptionKey)}
            </p>
            
            {/* Arrow indicator */}
            <div className="absolute bottom-3 end-3 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <ChevronIcon className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Compact card for remaining tools
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      <Link to={tool.href} className="block group">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-card/80 border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center group-hover:from-primary/25 group-hover:to-primary/10 transition-colors">
            <Icon className="w-5 h-5 text-primary" strokeWidth={1.75} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {t(tool.titleKey)}
              </h3>
              <Sparkles className="w-3 h-3 text-primary/60 flex-shrink-0" />
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {t(tool.descriptionKey)}
            </p>
          </div>
          
          {/* Chevron */}
          <ChevronIcon className="flex-shrink-0 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
});

AIToolCard.displayName = "AIToolCard";

export function AIToolsShowcase({ tools }: AIToolsShowcaseProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const featuredTools = tools.slice(0, FEATURED_COUNT);
  const remainingTools = tools.slice(FEATURED_COUNT);
  const displayedRemaining = isExpanded ? remainingTools : remainingTools.slice(0, INITIAL_DISPLAY - FEATURED_COUNT);
  const hiddenCount = remainingTools.length - displayedRemaining.length;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-primary to-primary/50" />
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground tracking-wide">
              {t('categories.ai')}
            </h2>
            <p className="text-[10px] text-muted-foreground">
              {tools.length} {t('common.tools', 'tools')}
            </p>
          </div>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-semibold text-primary">Smart AI</span>
        </div>
      </div>

      {/* Featured Tools Grid (2x2) */}
      <div className="grid grid-cols-2 gap-3">
        {featuredTools.map((tool, index) => (
          <AIToolCard 
            key={tool.id} 
            tool={tool} 
            isFeatured={true}
            index={index}
          />
        ))}
      </div>

      {/* Remaining Tools List */}
      {displayedRemaining.length > 0 && (
        <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
          <div className="divide-y divide-border/30">
            <AnimatePresence initial={false} mode="sync">
              {displayedRemaining.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={!isExpanded && index >= (INITIAL_DISPLAY - FEATURED_COUNT) ? { opacity: 0, height: 0 } : false}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="px-2 py-1"
                >
                  <AIToolCard 
                    tool={tool} 
                    isFeatured={false}
                    index={index + FEATURED_COUNT}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Expand/Collapse Button */}
          {remainingTools.length > (INITIAL_DISPLAY - FEATURED_COUNT) && (
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
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
              
              {/* Decorative elements */}
              <div className="absolute start-4 flex gap-1">
                <Star className="w-3 h-3 text-primary/40" />
              </div>
              
              <span className="text-xs font-semibold text-primary group-hover:text-primary/80 tracking-wide relative z-10">
                {isExpanded 
                  ? t('common.showLess', 'Show Less')
                  : t('common.moreItems', '+{{count}} More', { count: hiddenCount })
                }
              </span>
              
              <motion.div
                animate={{ rotate: isExpanded ? -90 : 0 }}
                transition={{ duration: 0.2 }}
                className="relative z-10"
              >
                <ChevronRight className="w-4 h-4 text-primary group-hover:text-primary/80" />
              </motion.div>
              
              <div className="absolute end-4 flex gap-1">
                <TrendingUp className="w-3 h-3 text-primary/40" />
              </div>
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
}

export default AIToolsShowcase;
