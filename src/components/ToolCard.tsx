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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      className="h-full"
    >
      <Link to={href} className="block h-full">
        <div className={`group relative h-full overflow-hidden rounded-2xl border-2 bg-card p-6 shadow-card transition-all duration-500 hover:shadow-card-hover hover:-translate-y-1 ${
          isLocked 
            ? "border-border opacity-80" 
            : isPremium
              ? "border-primary/20 hover:border-primary/40"
              : "border-transparent hover:border-primary/20"
        }`}>
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          
          {/* Premium Badge */}
          {isPremium && (
            <div className={`absolute top-4 right-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
              isLocked
                ? "bg-gradient-to-r from-muted to-muted text-muted-foreground"
                : isTrialActive
                  ? "gradient-primary text-primary-foreground shadow-lg"
                  : "gradient-premium text-white shadow-lg"
            }`}>
              {isLocked ? (
                <>
                  <Crown className="h-3 w-3" />
                  <span>Premium</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" />
                  <span>{isTrialActive ? 'Trial' : 'PRO'}</span>
                </>
              )}
            </div>
          )}
          
          <div className="relative z-10 flex flex-col h-full">
            {/* Icon */}
            <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-500 ${
              isPremium 
                ? "gradient-primary text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl" 
                : "bg-secondary text-primary group-hover:gradient-primary group-hover:text-white group-hover:scale-110"
            }`}>
              <Icon className="h-7 w-7" />
            </div>
            
            {/* Category */}
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-primary/70">
              {t(categoryKey)}
            </span>
            
            {/* Title */}
            <h3 className="mb-2 text-lg font-bold text-card-foreground group-hover:text-primary transition-colors duration-300">
              {t(titleKey)}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
              {t(descriptionKey)}
            </p>
            
            {/* CTA Arrow */}
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary opacity-0 transform translate-x-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
              <span>{isLocked ? 'Unlock' : 'Open'}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
