import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LucideIcon, ChevronRight, ChevronLeft } from "lucide-react";
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

export function ToolCard({ titleKey, descriptionKey, icon: Icon, href, index }: ToolCardProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.1) }}
    >
      <Link to={href} className="block">
        <div className="group flex items-center gap-3.5 p-3.5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-card-hover transition-all duration-300">
          {/* Large Icon Container */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
            <Icon className="w-5.5 h-5.5 text-primary/70 group-hover:text-primary transition-colors duration-300" strokeWidth={1.75} />
          </div>
          
          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate leading-snug">
              {t(titleKey)}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
              {t(descriptionKey)}
            </p>
          </div>
          
          {/* Arrow */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-all duration-300">
            <ChevronIcon className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary transition-colors duration-300" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
