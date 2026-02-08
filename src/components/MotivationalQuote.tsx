import { motion } from "framer-motion";
import { Heart, Sparkles, Quote } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface MotivationalQuoteProps {
  variant?: "card" | "inline" | "banner";
}

export function MotivationalQuote({ variant = "card" }: MotivationalQuoteProps) {
  const { t } = useTranslation();

  const quote = useMemo(() => {
    const todayIndex = new Date().getDate() % 8;
    const num = todayIndex + 1;
    return {
      text: t(`quotes.q${num}`),
      author: t(`quotes.q${num}Author`),
    };
  }, [t]);

  if (variant === "inline") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-sm text-muted-foreground italic"
      >
        <Quote className="h-4 w-4 text-primary/50" />
        <span>{quote.text}</span>
      </motion.div>
    );
  }

  if (variant === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 via-pink-100/50 to-primary/10 rounded-xl p-4 text-center"
      >
        <p className="text-foreground font-medium">{quote.text}</p>
        <p className="text-xs text-muted-foreground mt-1">— {quote.author}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-pink-50 to-rose-50 p-6 border border-primary/10"
    >
      {/* Decorative Elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-4 -right-4 opacity-10"
      >
        <Sparkles className="h-24 w-24 text-primary" />
      </motion.div>

      <div className="relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-medium text-foreground leading-relaxed">
              {quote.text}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              — {quote.author}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default MotivationalQuote;
