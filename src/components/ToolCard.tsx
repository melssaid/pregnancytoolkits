import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LucideIcon, ArrowRight, Brain } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ToolCardProps {
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  href: string;
  categoryKey: string;
  index: number;
}

export function ToolCard({ titleKey, descriptionKey, icon: Icon, href, categoryKey, index }: ToolCardProps) {
  const { t } = useTranslation();
  
  const isSmartTool = categoryKey === "categories.ai";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.03,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -6, 
        scale: 1.02,
        transition: { duration: 0.25, ease: "easeOut" } 
      }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Link to={href} className="block h-full">
        <div className={`group relative h-full overflow-hidden rounded-2xl bg-card border transition-all duration-300 ${
          isSmartTool
            ? "border-primary/30 bg-gradient-to-br from-primary/5 via-card to-accent/5 shadow-md hover:shadow-xl hover:shadow-primary/15 hover:border-primary/50"
            : "border-border/50 hover:border-primary/30 shadow-sm hover:shadow-lg"
        }`}>
          
          {/* Smart Tools Special Background - Rose/Gold Theme */}
          {isSmartTool && (
            <>
              {/* Animated gradient orbs matching primary theme */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-primary/15 to-pink-400/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            </>
          )}
          
          {/* Standard animated gradient background */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            isSmartTool 
              ? "bg-gradient-to-br from-primary/10 via-transparent to-accent/10" 
              : "bg-gradient-to-br from-transparent via-transparent to-primary/5"
          }`} />
          
          {/* Glow effect on hover */}
          <div className={`absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl ${
            isSmartTool
              ? "bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15"
              : "bg-gradient-to-r from-primary/0 via-primary/10 to-accent/0"
          }`} />
          
          <div className="relative p-5 h-full flex flex-col">
            {/* Top row - Icon and Badge */}
            <div className="flex items-start justify-between mb-4">
              {/* Icon with enhanced animation */}
              <motion.div 
                className={`relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
                  isSmartTool
                    ? "bg-gradient-to-br from-primary via-pink-500 to-accent text-white shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/35"
                    : "bg-secondary text-primary group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-accent group-hover:text-white"
                }`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.25, type: "spring", stiffness: 300 }}
              >
                <Icon className="h-6 w-6" />
                {/* Special pulse for Smart Tools */}
                {isSmartTool && (
                  <>
                    <span className="absolute inset-0 rounded-xl animate-ping bg-primary/25 opacity-75" style={{ animationDuration: '2s' }} />
                    <motion.span 
                      className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-lg ring-2 ring-white"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </>
                )}
              </motion.div>
              
              {/* Smart Tool Badge */}
              {isSmartTool && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.03 + 0.2 }}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20"
                >
                  <Brain className="h-3.5 w-3.5" />
                  <span>Smart</span>
                </motion.div>
              )}
            </div>
            
            {/* Category */}
            <span className={`inline-flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-widest ${
              isSmartTool ? "text-primary" : "text-primary/60"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isSmartTool ? "bg-primary" : "bg-primary/40"}`} />
              {t(categoryKey)}
            </span>
            
            {/* Title */}
            <h3 className={`mb-2 text-base font-bold transition-colors duration-300 line-clamp-2 ${
              isSmartTool 
                ? "text-foreground group-hover:text-primary" 
                : "text-card-foreground group-hover:text-primary"
            }`}>
              {t(titleKey)}
            </h3>
            
            {/* Description */}
            <p className="text-xs leading-relaxed flex-grow line-clamp-2 text-muted-foreground">
              {t(descriptionKey)}
            </p>
            
            {/* CTA */}
            <div className={`mt-4 pt-4 border-t flex items-center justify-between ${
              isSmartTool ? "border-primary/20" : "border-border/50"
            }`}>
              <span className="text-xs font-semibold text-primary">
                {isSmartTool ? 'Try Now' : 'Open Tool'}
              </span>
              <motion.div
                className="flex items-center gap-1"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 text-primary" />
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
