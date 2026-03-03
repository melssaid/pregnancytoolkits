import { motion } from "framer-motion";
import { Eye } from "lucide-react";

/**
 * Lucide Eye icon with animated pulsing hearts.
 */
const DreamEyeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <div className={`relative inline-flex items-center justify-center ${className}`}>
    {/* Lucide Eye icon */}
    <Eye className="w-full h-full text-white" strokeWidth={1.8} />

    {/* 2 pulsing hearts */}
    {[
      { delay: 0, x: "-60%", y: "-70%" },
      { delay: 2.2, x: "50%", y: "-65%" },
    ].map((h, i) => (
      <motion.svg
        key={i}
        viewBox="0 0 24 24"
        className="absolute w-[45%] h-[45%] text-white"
        style={{ left: h.x, top: h.y }}
        animate={{
          scale: [0, 1.2, 1.5, 0],
          opacity: [0, 0.9, 0.5, 0],
          rotate: [0, -10, 10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: h.delay,
          ease: "easeInOut",
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
