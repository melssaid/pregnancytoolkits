import { forwardRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BackButtonProps {
  className?: string;
  fallbackPath?: string;
}

export const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(
  ({ className = "", fallbackPath = "/" }, ref) => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const isRTL = i18n.language === "ar";
    const Icon = isRTL ? ArrowRight : ArrowLeft;

    const handleBack = useCallback(() => {
      const hasRouterHistory = (window.history.state?.idx ?? 0) > 0;
      
      if (hasRouterHistory) {
        navigate(-1);
      } else {
        const path = location.pathname;
        if (path.startsWith("/tools/")) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate(fallbackPath, { replace: true });
        }
      }
    }, [navigate, location.pathname, fallbackPath]);

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
