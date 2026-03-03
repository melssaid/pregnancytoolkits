import { motion } from "framer-motion";
import { Eye } from "lucide-react";

/**
 * Lucide Eye icon with animated pulsing hearts.
 */
const DreamEyeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <div className={`relative inline-flex items-center justify-center ${className}`}>
    {/* Lucide Eye icon */}
    <Eye className="w-full h-full text-white" strokeWidth={1.8} />

    {/* 2 hearts floating upward */}
    {[
      { delay: 0.3, x: "-40%", y: "10%" },
      { delay: 2.5, x: "80%", y: "5%" },
    ].map((h, i) => (
      <motion.svg
        key={i}
        viewBox="0 0 24 24"
        className="absolute w-[38%] h-[38%] text-white pointer-events-none"
        style={{ left: h.x, top: h.y }}
        animate={{
          y: [0, -16, -30],
          opacity: [0, 0.85, 0],
          scale: [0.4, 1, 0.65],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          delay: h.delay,
          ease: "easeOut",
        }}
      >
        <path
          d="M12 6 C10 2 5 2 5 6 C5 10 12 16 12 18 C12 16 19 10 19 6 C19 2 14 2 12 6Z"
          fill="currentColor"
        />
      </motion.svg>
    ))}
  </div>
);

export default DreamEyeIcon;
