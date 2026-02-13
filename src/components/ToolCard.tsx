import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LucideIcon, ChevronRight, ChevronLeft, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ToolCardProps {
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  href: string;
  categoryKey: string;
  index: number;
  hasAI?: boolean;
  isPremium?: boolean;
  isLocked?: boolean;
  onLockedClick?: () => void;
}

export function ToolCard({ titleKey, descriptionKey, icon: Icon, href, index, isPremium, isLocked, onLockedClick }: ToolCardProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  if (isLocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, delay: Math.min(index * 0.015, 0.08) }}
      >
        <button onClick={onLockedClick} className="block w-full text-start">
          <div className="group flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-border/50 hover:border-primary/40 transition-all duration-200 opacity-75 hover:opacity-100">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center relative">
              <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                <Lock className="w-2 h-2 text-primary-foreground" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[11px] font-semibold text-foreground truncate leading-snug">
                {t(titleKey)}
              </h3>
              <p className="text-[9px] text-muted-foreground truncate mt-0.5">
                {t(descriptionKey)}
              </p>
            </div>
            <Lock className="flex-shrink-0 w-3.5 h-3.5 text-primary/60" />
          </div>
        </button>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: Math.min(index * 0.015, 0.08) }}
    >
      <Link to={href} className="block">
        <div className="group flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-border/50 hover:border-border hover:shadow-sm transition-all duration-200">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
              <h3 className="text-[11px] font-semibold text-foreground truncate leading-snug">
                {t(titleKey)}
              </h3>
              <p className="text-[9px] text-muted-foreground truncate mt-0.5">
                {t(descriptionKey)}
              </p>
          </div>
          <ChevronIcon className="flex-shrink-0 w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-foreground/60 transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
}
