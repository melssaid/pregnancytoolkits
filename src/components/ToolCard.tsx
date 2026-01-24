import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LucideIcon, Crown, Sparkles, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import useSubscription from "@/hooks/useSubscription";

interface ToolCardProps {
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  href: string;
  categoryKey: string;
  index: number;
  isPremium?: boolean;
}

export function ToolCard({ titleKey, descriptionKey, icon: Icon, href, categoryKey, index, isPremium }: ToolCardProps) {
  const { t } = useTranslation();
  const { hasAccess, isTrialActive } = useSubscription();
  
  const isLocked = isPremium && !hasAccess(isPremium);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.03,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Link to={href} className="block h-full">
        <div className={`group relative h-full overflow-hidden rounded-2xl bg-card border transition-all duration-300 ${
          isLocked 
            ? "border-border/50 opacity-75 hover:opacity-100" 
            : isPremium
              ? "border-primary/20 hover:border-primary/40 shadow-sm hover:shadow-lg hover:shadow-primary/10"
              : "border-border/50 hover:border-primary/30 shadow-sm hover:shadow-lg"
        }`}>
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Glow effect on hover */}
          <div className="absolute -inset-px bg-gradient-to-r from-primary/0 via-primary/10 to-accent/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
          
          <div className="relative p-5 h-full flex flex-col">
            {/* Top row - Icon and Badge */}
            <div className="flex items-start justify-between mb-4">
              {/* Icon with enhanced animation */}
              <motion.div 
                className={`relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
                  isPremium 
                    ? "bg-gradient-to-br from-primary to-accent text-white shadow-lg group-hover:shadow-xl group-hover:shadow-primary/25" 
                    : "bg-secondary text-primary group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-accent group-hover:text-white"
                }`}
                whileHover={{ scale: 1.05, rotate: 3 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className="h-6 w-6" />
                {/* Pulse ring for premium */}
                {isPremium && !isLocked && (
                  <span className="absolute inset-0 rounded-xl animate-ping bg-primary/20 opacity-75" style={{ animationDuration: '3s' }} />
                )}
              </motion.div>
              
              {/* Premium Badge */}
              {isPremium && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.03 + 0.2 }}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    isLocked
                      ? "bg-muted text-muted-foreground"
                      : isTrialActive
                        ? "bg-gradient-to-r from-primary to-accent text-white"
                        : "bg-primary/10 text-primary"
                  }`}
                >
                  {isLocked ? (
                    <>
                      <Crown className="h-3 w-3" />
                      <span>PRO</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      <span>{isTrialActive ? 'Trial' : 'PRO'}</span>
                    </>
                  )}
                </motion.div>
              )}
            </div>
            
            {/* Category */}
            <span className="inline-flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-widest text-primary/60">
              <span className="h-1 w-1 rounded-full bg-primary/40" />
              {t(categoryKey)}
            </span>
            
            {/* Title */}
            <h3 className="mb-2 text-base font-bold text-card-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
              {t(titleKey)}
            </h3>
            
            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed flex-grow line-clamp-2">
              {t(descriptionKey)}
            </p>
            
            {/* CTA */}
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
              <span className={`text-xs font-semibold ${isLocked ? 'text-muted-foreground' : 'text-primary'}`}>
                {isLocked ? 'Unlock with Pro' : 'Open Tool'}
              </span>
              <motion.div
                initial={{ x: 0, opacity: 0.5 }}
                whileHover={{ x: 4, opacity: 1 }}
                className="flex items-center gap-1"
              >
                <ArrowRight className={`h-4 w-4 ${isLocked ? 'text-muted-foreground' : 'text-primary'} group-hover:translate-x-1 transition-transform duration-300`} />
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
