import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LucideIcon, Crown } from "lucide-react";
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
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={href} className="block h-full">
        <div className={`group relative h-full rounded-lg border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover ${
          isLocked 
            ? "border-border/50 opacity-75" 
            : "border-border hover:border-primary/20"
        }`}>
          <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-primary/0 to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          {/* Premium Badge */}
          {isPremium && (
            <div className={`absolute top-3 end-3 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              isLocked
                ? "bg-muted text-muted-foreground"
                : isTrialActive
                  ? "bg-primary/10 text-primary"
                  : "bg-amber-500/10 text-amber-600"
            }`}>
              <Crown className="h-3 w-3" />
              {isLocked ? t('common.premium') : isTrialActive ? t('common.freeTrial') : t('common.premium')}
            </div>
          )}
          
          <div className="relative z-10">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-6 w-6" />
            </div>
            
            <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t(categoryKey)}
            </span>
            
            <h3 className="mb-2 text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors duration-300">
              {t(titleKey)}
            </h3>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t(descriptionKey)}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
