import { motion } from "framer-motion";
import { Heart, Sparkles, Quote } from "lucide-react";
import { useMemo } from "react";

const quotes = [
  {
    text: "Every day brings you closer to your beautiful moment 💕",
    author: "For the expecting mom",
  },
  {
    text: "You’re creating a miracle of life within you ✨",
    author: "A gentle reminder",
  },
  {
    text: "Your baby feels your love even before seeing you 👶",
    author: "A beautiful truth",
  },
  {
    text: "Savor every moment—this journey is unforgettable 🌸",
    author: "From the heart",
  },
  {
    text: "Your strength as a mother begins right now 💪",
    author: "We believe in you",
  },
  {
    text: "Every little movement is a love note from your baby 💗",
    author: "From your baby",
  },
  {
    text: "You are the hero of a brand‑new story 🌟",
    author: "A simple truth",
  },
  {
    text: "Take care of yourself—you’re your baby’s whole world 🤱",
    author: "An important reminder",
  },
];

interface MotivationalQuoteProps {
  variant?: "card" | "inline" | "banner";
}

export function MotivationalQuote({ variant = "card" }: MotivationalQuoteProps) {
  const quote = useMemo(() => {
    const todayIndex = new Date().getDate() % quotes.length;
    return quotes[todayIndex];
  }, []);

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
