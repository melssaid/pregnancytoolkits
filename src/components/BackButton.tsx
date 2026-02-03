import { forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
}

export const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(
  ({ className = "" }, ref) => {
    const navigate = useNavigate();

    const handleBack = () => {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    };

    return (
      <motion.button
        ref={ref}
        onClick={handleBack}
        className={`inline-flex items-center justify-center w-9 h-9 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4" />
      </motion.button>
    );
  }
);

BackButton.displayName = "BackButton";

export default BackButton;
