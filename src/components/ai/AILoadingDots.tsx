import { motion } from "framer-motion";
import { Brain } from "lucide-react";

interface AILoadingDotsProps {
  text?: string;
  size?: "sm" | "md";
}

export const AILoadingDots = ({ text, size = "sm" }: AILoadingDotsProps) => {
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <span className="inline-flex items-center gap-2">
      <motion.span
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="shrink-0"
      >
        <Brain className={`${iconSize} drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]`} />
      </motion.span>
      {text && <span className="truncate">{text}</span>}
      <span className="inline-flex items-center gap-0.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className={`${dotSize} rounded-full bg-white/90`}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </span>
    </span>
  );
};
