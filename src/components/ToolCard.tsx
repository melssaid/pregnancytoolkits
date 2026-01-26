import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LucideIcon, ArrowRight, Brain, Sparkles, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ToolCardProps {
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  href: string;
  categoryKey: string;
  index: number;
  hasAI?: boolean;
}

export function ToolCard({ titleKey, descriptionKey, icon: Icon, href, categoryKey, index, hasAI }: ToolCardProps) {
  const { t } = useTranslation();
  
  const isAITool = hasAI || categoryKey === "categories.ai";
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.02,
        ease: "easeOut"
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Link to={href} className="block">
        <div className={`group relative flex items-center gap-3 p-3 rounded-xl bg-card border transition-all duration-200 ${
          isAITool
            ? "border-primary/20 bg-gradient-to-r from-primary/5 to-transparent hover:border-primary/40 hover:shadow-md hover:shadow-primary/10"
            : "border-border/50 hover:border-primary/20 hover:bg-muted/30"
        }`}>
          
          {/* Icon */}
          <div className={`relative flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
            isAITool
              ? "bg-gradient-to-br from-primary to-accent text-white shadow-md shadow-primary/20"
              : "bg-secondary text-primary group-hover:bg-primary group-hover:text-white"
          }`}>
            <Icon className="h-5 w-5" />
            {isAITool && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm ring-2 ring-card">
                <Brain className="h-2 w-2 text-white" />
              </span>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-semibold truncate transition-colors ${
                isAITool 
                  ? "text-foreground group-hover:text-primary" 
                  : "text-card-foreground group-hover:text-primary"
              }`}>
                {t(titleKey)}
              </h3>
              {isAITool && (
                <span className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                  <Sparkles className="h-2 w-2" />
                  AI
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              {t(descriptionKey)}
            </p>
          </div>
          
          {/* Arrow */}
          <ChevronRight className="flex-shrink-0 h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </Link>
    </motion.div>
  );
}
