import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LucideIcon, ArrowRight, Brain, Sparkles } from "lucide-react";
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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.02,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -4, 
        scale: 1.01,
        transition: { duration: 0.2, ease: "easeOut" } 
      }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Link to={href} className="block h-full">
        <div className={`group relative h-full overflow-hidden rounded-2xl bg-card border transition-all duration-300 ${
          isAITool
            ? "border-primary/30 bg-gradient-to-br from-primary/5 via-card to-accent/5 shadow-md hover:shadow-xl hover:shadow-primary/15 hover:border-primary/50"
            : "border-border/50 hover:border-primary/30 shadow-sm hover:shadow-lg"
        }`}>
          
          {/* AI Tools Special Background */}
          {isAITool && (
            <>
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br from-primary/20 to-accent/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-tr from-primary/15 to-pink-400/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            </>
          )}
          
          {/* Hover gradient */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            isAITool 
              ? "bg-gradient-to-br from-primary/10 via-transparent to-accent/10" 
              : "bg-gradient-to-br from-transparent via-transparent to-primary/5"
          }`} />
          
          <div className="relative p-4 h-full flex flex-col">
            {/* Top row - Icon and Badge */}
            <div className="flex items-start justify-between mb-3">
              {/* Icon */}
              <motion.div 
                className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 ${
                  isAITool
                    ? "bg-gradient-to-br from-primary via-pink-500 to-accent text-white shadow-lg shadow-primary/25"
                    : "bg-secondary text-primary group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-accent group-hover:text-white"
                }`}
                whileHover={{ scale: 1.05, rotate: 3 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className="h-5 w-5" />
                {isAITool && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-card">
                    <Brain className="h-2.5 w-2.5 text-white" />
                  </span>
                )}
              </motion.div>
              
              {/* AI Badge */}
              {isAITool && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.02 + 0.1 }}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md"
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  <span>AI</span>
                </motion.div>
              )}
            </div>
            
            {/* Category */}
            <span className={`inline-flex items-center gap-1 mb-1.5 text-[9px] font-semibold uppercase tracking-wider ${
              isAITool ? "text-primary" : "text-muted-foreground"
            }`}>
              <span className={`h-1 w-1 rounded-full ${isAITool ? "bg-primary" : "bg-muted-foreground/50"}`} />
              {t(categoryKey)}
            </span>
            
            {/* Title */}
            <h3 className={`mb-1.5 text-sm font-bold transition-colors duration-300 line-clamp-2 ${
              isAITool 
                ? "text-foreground group-hover:text-primary" 
                : "text-card-foreground group-hover:text-primary"
            }`}>
              {t(titleKey)}
            </h3>
            
            {/* Description */}
            <p className="text-[11px] leading-relaxed flex-grow line-clamp-2 text-muted-foreground">
              {t(descriptionKey)}
            </p>
            
            {/* CTA */}
            <div className={`mt-3 pt-3 border-t flex items-center justify-between ${
              isAITool ? "border-primary/20" : "border-border/50"
            }`}>
              <span className={`text-[10px] font-semibold ${isAITool ? "text-primary" : "text-muted-foreground"}`}>
                {isAITool ? 'Try AI' : 'Open'}
              </span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 text-primary" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
