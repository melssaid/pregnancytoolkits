import { forwardRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BackButtonProps {
  className?: string;
}

export const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(
  ({ className = "" }, ref) => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === "ar";
    const Icon = isRTL ? ArrowRight : ArrowLeft;

    const handleBack = useCallback(() => {
      // Check if there's history to go back to
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        // Fallback: navigate to home if no history
        navigate("/");
      }
    }, [navigate]);

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
