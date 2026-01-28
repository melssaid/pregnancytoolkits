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
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: Math.min(index * 0.015, 0.08) }}
    >
      <Link to={href} className="block">
        <div className="group flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-slate-300 hover:shadow-sm transition-all duration-200">
          {/* Minimal Icon */}
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
            <Icon className="w-5 h-5 text-slate-500" strokeWidth={1.75} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate leading-snug">
              {t(titleKey)}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {t(descriptionKey)}
            </p>
          </div>
          
          {/* Chevron */}
          <ChevronRight className="flex-shrink-0 w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
}