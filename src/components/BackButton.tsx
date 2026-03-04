import { forwardRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

// Global in-app navigation depth tracker (immune to iframe/sandbox quirks)
let navDepth = 0;
export function incrementNavDepth() { navDepth++; }

interface BackButtonProps {
  className?: string;
  fallbackPath?: string;
}

export const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(
  ({ className = "", fallbackPath }, ref) => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const isRTL = i18n.language === "ar";
    const Icon = isRTL ? ArrowRight : ArrowLeft;

    const handleBack = useCallback(() => {
      // Always try real browser back if there's history
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        // Truly no history (direct link access) → go home
        navigate(fallbackPath ?? "/", { replace: true });
      }
    }, [navigate, fallbackPath]);

    return (
      <button
        ref={ref}
        onClick={handleBack}
        className={className}
        aria-label="Go back"
        type="button"
      >
        <motion.div
          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className="h-4 w-4" />
        </motion.div>
      </button>
    );
  }
);

BackButton.displayName = "BackButton";
export default BackButton;
