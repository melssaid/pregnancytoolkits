import { Star } from "lucide-react";
import { useToolRating } from '@/hooks/useToolRating';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ToolRatingProps {
  toolId: string;
  compact?: boolean;
}

export function ToolRating({ toolId, compact = false }: ToolRatingProps) {
  const { averageRating, totalRatings, userRating, rateTool } = useToolRating(toolId);
  const { t } = useTranslation();

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        <span className="text-xs font-medium text-foreground/70">
          {averageRating > 0 ? averageRating.toFixed(1) : '–'}
        </span>
        {totalRatings > 0 && (
          <span className="text-[10px] text-muted-foreground">({totalRatings})</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 py-3 px-4 rounded-xl bg-muted/30 border border-border/30">
      <p className="text-xs font-medium text-muted-foreground">
        {t('toolRating.rateThis', 'Rate this tool')}
      </p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileTap={{ scale: 1.3 }}
            onClick={() => rateTool(star)}
            className="p-0.5"
          >
            <Star
              className={cn(
                "w-6 h-6 transition-colors",
                star <= (userRating || 0)
                  ? "text-amber-400 fill-amber-400"
                  : "text-muted-foreground/30"
              )}
            />
          </motion.button>
        ))}
      </div>
      {averageRating > 0 && (
        <p className="text-[10px] text-muted-foreground">
          {averageRating.toFixed(1)} / 5 ({totalRatings} {t('toolRating.ratings', 'ratings')})
        </p>
      )}
    </div>
  );
}

export default ToolRating;
