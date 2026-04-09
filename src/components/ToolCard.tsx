import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
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
  variant?: "list" | "carousel";
  isLocked?: boolean;
}

export function ToolCard({ titleKey, descriptionKey, icon: Icon, href, index, variant = "list", isLocked = false }: ToolCardProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const handleLockedClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      navigate("/pricing-demo");
    }
  };

  if (variant === "carousel") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.15) }}
        className="flex-shrink-0 w-[148px] snap-start"
      >
        <Link to={isLocked ? "#" : href} onClick={handleLockedClick} className="block">
          <div className={`group flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border/40 hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 h-full relative ${isLocked ? "opacity-60" : ""}`}>
            {isLocked && (
              <div className="absolute top-2 end-2 w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                <Lock className="w-3 h-3 text-muted-foreground" />
              </div>
            )}
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/15 group-hover:scale-105 transition-all duration-300 ${isLocked ? "grayscale-[30%]" : ""}`}>
              <Icon className="w-6 h-6 text-primary group-hover:text-primary transition-colors duration-300" strokeWidth={1.75} />
            </div>
            <h3 className="text-[11px] font-semibold text-foreground text-center leading-snug min-h-[30px] whitespace-normal overflow-wrap-anywhere">
              {t(titleKey)}
            </h3>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.1) }}
    >
      <Link to={isLocked ? "#" : href} onClick={handleLockedClick} className="block">
        <div className={`group flex items-center gap-3.5 p-3.5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 ${isLocked ? "opacity-50" : ""}`}>
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/15 transition-all duration-300 ${isLocked ? "grayscale-[30%]" : ""}`}>
            <Icon className="w-5.5 h-5.5 text-primary group-hover:text-primary transition-colors duration-300" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground leading-snug whitespace-normal" style={{ overflowWrap: 'anywhere' }}>
              {t(titleKey)}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed whitespace-normal" style={{ overflowWrap: 'anywhere' }}>
              {t(descriptionKey)}
            </p>
          </div>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted/70 flex items-center justify-center group-hover:bg-primary/10 transition-all duration-300">
            {isLocked ? (
              <Lock className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
