import { memo } from "react";
import { cn } from "@/lib/utils";

interface DailyTipCardProps {
  /** Tip text to display. When empty/undefined, a skeleton placeholder is shown. */
  tip?: string | null;
  /** Force the loading skeleton regardless of tip value. */
  loading?: boolean;
  /** Optional aria-label for the tip region (defaults to a generic label). */
  ariaLabel?: string;
  /** Max lines before truncation (default: 3). */
  maxLines?: 2 | 3 | 4;
  /** Extra class names for the wrapper. */
  className?: string;
}

/**
 * Reusable daily tip / hint card.
 * Renders the tip text with formal mobile-first typography,
 * or a 2-line shimmer skeleton when the tip is empty/loading.
 *
 * Use across dashboard, tools, and any future hint surfaces.
 */
export const DailyTipCard = memo(function DailyTipCard({
  tip,
  loading = false,
  ariaLabel,
  maxLines = 3,
  className,
}: DailyTipCardProps) {
  const isEmpty = loading || !tip || tip.trim().length === 0;

  const lineClampClass =
    maxLines === 2 ? "line-clamp-2" : maxLines === 4 ? "line-clamp-4" : "line-clamp-3";

  return (
    <div className={cn("w-full", className)} aria-label={ariaLabel} role="note">
      {isEmpty ? (
        <div className="space-y-2" aria-hidden="true">
          <div className="h-3.5 w-11/12 rounded-full bg-muted/60 animate-pulse" />
          <div className="h-3.5 w-2/3 rounded-full bg-muted/50 animate-pulse" />
        </div>
      ) : (
        <p
          className={cn(
            "text-[15px] font-medium leading-relaxed text-foreground/90 tracking-tight",
            lineClampClass,
          )}
        >
          {tip}
        </p>
      )}
    </div>
  );
});

export default DailyTipCard;
