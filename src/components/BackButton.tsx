import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BackButtonProps {
  className?: string;
}

export const BackButton = forwardRef<HTMLAnchorElement, BackButtonProps>(
  ({ className = "" }, ref) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const Icon = isRTL ? ArrowRight : ArrowLeft;
    
    return (
      <Link to="/" ref={ref} className={className}>
        <motion.div
          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Go to home"
        >
          <Icon className="h-4 w-4" />
        </motion.div>
      </Link>
    );
  }
);

BackButton.displayName = "BackButton";

export default BackButton;
