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

// RTL language codes (ISO 639-1)
const RTL_LANGS = new Set(["ar", "he", "fa", "ur", "ps", "sd", "yi", "ckb"]);

export const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(
  ({ className = "", fallbackPath }, ref) => {
    const { i18n, t } = useTranslation();
    const navigate = useNavigate();

    // Dynamic RTL detection — supports any RTL language, not just Arabic
    const langCode = (i18n.language || "en").split("-")[0].toLowerCase();
    const isRTL = RTL_LANGS.has(langCode);

    // Semantic "back": in RTL it points right (toward the start of reading), in LTR it points left
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
        aria-label={t("common.back", "Back")}
        type="button"
        whileTap={{ scale: 0.9 }}
        whileHover={{ y: -1 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className={`group relative inline-flex items-center justify-center h-10 w-10 rounded-full overflow-hidden
          bg-gradient-to-br from-card via-card to-primary/[0.04]
          border border-border/70
          shadow-[0_1px_2px_hsl(340_30%_20%/0.06),0_4px_12px_-4px_hsl(340_40%_45%/0.18)]
          hover:border-primary/50
          hover:shadow-[0_2px_4px_hsl(340_30%_20%/0.08),0_8px_22px_-4px_hsl(340_60%_55%/0.32)]
          active:shadow-[0_1px_2px_hsl(340_30%_20%/0.08)]
          transition-all duration-300 ease-out ${className}`}
      >
        {/* Inner highlight ring */}
        <span
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 25%, hsl(0 0% 100% / 0.6), transparent 55%)",
          }}
        />
        {/* Subtle gradient sweep on hover */}
        <span
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--primary) / 0.08), transparent 60%)",
          }}
        />
        {/* Icon */}
        <Icon
          className="relative h-[19px] w-[19px] text-foreground/80 group-hover:text-primary transition-colors duration-200"
          strokeWidth={2.5}
        />
      </motion.button>
    );
  }
);

BackButton.displayName = "BackButton";
export default BackButton;
