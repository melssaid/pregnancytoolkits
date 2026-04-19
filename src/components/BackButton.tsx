import { forwardRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getNavDepth } from "@/lib/navigationTracker";

interface BackButtonProps {
  className?: string;
  fallbackPath?: string;
}

export const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(
  ({ className = "", fallbackPath }, ref) => {
    const { i18n, t } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === "ar";
    // Semantic "back": in RTL the back-arrow visually points right
    const Icon = isRTL ? ChevronRight : ChevronLeft;

    const handleBack = useCallback(() => {
      if (getNavDepth() > 0) {
        navigate(-1);
      } else {
        navigate(fallbackPath ?? "/", { replace: true });
      }
    }, [navigate, fallbackPath]);

    return (
      <motion.button
        ref={ref}
        onClick={handleBack}
        className={`group relative inline-flex items-center justify-center h-10 w-10 rounded-full bg-card border border-border/60 shadow-[0_2px_8px_-2px_hsl(340_30%_25%/0.12)] hover:border-primary/40 hover:bg-primary/5 hover:shadow-[0_4px_14px_-2px_hsl(340_50%_55%/0.25)] active:scale-95 transition-all duration-200 ${className}`}
        aria-label={t('common.back', 'Back')}
        type="button"
        whileTap={{ scale: 0.92 }}
      >
        <Icon
          className="h-[19px] w-[19px] text-foreground/75 group-hover:text-primary transition-colors"
          strokeWidth={2.4}
        />
      </motion.button>
    );
  }
);

BackButton.displayName = "BackButton";
export default BackButton;
