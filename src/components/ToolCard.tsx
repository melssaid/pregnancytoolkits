import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LucideIcon, ChevronRight } from "lucide-react";
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
  const { t } = useTranslation();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.1) }}
    >
      <Link to={href} className="block">
        <div className="group flex items-center gap-3.5 p-3.5 rounded-xl bg-background/80 border border-border/40 hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm transition-all duration-200">
          {/* Icon Container */}
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary group-hover:from-primary group-hover:to-primary/90 group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
            <Icon className="w-5 h-5" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 py-0.5">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate leading-tight">
              {t(titleKey)}
            </h3>
            <p className="text-xs text-muted-foreground truncate mt-0.5 leading-tight">
              {t(descriptionKey)}
            </p>
          </div>
          
          {/* Arrow */}
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}