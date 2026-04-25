import { memo, type ElementType } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface EmptyStateCardProps {
  icon: ElementType;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Compact variant — used inline inside tabs alongside other cards */
  compact?: boolean;
}

/**
 * Reusable smart empty-state card.
 * - Dashed border to signal "no data yet" without feeling broken
 * - Optional CTA link to drive the user to the relevant tool
 * - RTL-aware arrow direction
 */
export const EmptyStateCard = memo(function EmptyStateCard({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
  compact = false,
}: EmptyStateCardProps) {
  const { isRTL } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-3xl border border-dashed border-border/60 bg-card/60 text-center ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <div
        className={`mx-auto mb-3 flex items-center justify-center rounded-2xl bg-primary/10 text-primary ${
          compact ? "h-10 w-10" : "h-12 w-12"
        }`}
      >
        <Icon className={compact ? "h-5 w-5" : "h-6 w-6"} strokeWidth={2} />
      </div>
      <h3
        className={`font-bold text-foreground mb-1 leading-tight ${
          compact ? "text-sm" : "text-base"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-muted-foreground max-w-xs mx-auto leading-snug ${
          compact ? "text-xs mb-3" : "text-sm mb-4"
        }`}
      >
        {description}
      </p>
      {ctaLabel && ctaHref && (
        <Link
          to={ctaHref}
          className={`inline-flex items-center gap-1.5 rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90 transition-colors ${
            compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
          }`}
        >
          {ctaLabel}
          <Arrow className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} strokeWidth={2.5} />
        </Link>
      )}
    </motion.div>
  );
});

export default EmptyStateCard;
