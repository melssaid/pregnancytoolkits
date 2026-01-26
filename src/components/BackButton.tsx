import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Home } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BackButtonProps {
  className?: string;
}

export const BackButton = forwardRef<HTMLAnchorElement, BackButtonProps>(
  ({ className = "" }, ref) => {
    const { t } = useTranslation();

    return (
      <Link to="/" className={className} ref={ref}>
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-primary/10 text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
          whileHover={{ scale: 1.02, x: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 group-hover:bg-white/20"
            initial={{ x: 0 }}
            whileHover={{ x: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
          <span className="text-sm font-medium">{t('app.back')}</span>
          <div className="w-px h-4 bg-current opacity-20 mx-1" />
          <Home className="h-3.5 w-3.5 opacity-60" />
        </motion.div>
      </Link>
    );
  }
);

BackButton.displayName = "BackButton";

export default BackButton;
