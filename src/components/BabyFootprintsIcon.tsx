import { motion } from "framer-motion";

/**
 * Realistic baby footprint icon with natural walking animation.
 * Each foot lifts, tilts, and steps down alternately.
 */
const BabyFootprintsIcon = ({ className = "w-9 h-9" }: { className?: string }) => {
  return (
    <div className={`${className} relative`}>
      {/* Left foot — steps first */}
      <motion.svg
        viewBox="0 0 100 150"
        className="absolute w-[46%] h-[90%] left-[3%] top-[5%] origin-bottom"
        fill="currentColor"
        animate={{
          y: [0, -4, -2, 0, 0, 0],
          rotate: [0, -6, -3, 0, 0, 0],
          scale: [1, 1.05, 1.02, 1, 0.98, 1],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          repeatDelay: 1,
          ease: "easeInOut",
          times: [0, 0.15, 0.3, 0.45, 0.7, 1],
        }}
      >
        <BabyFoot />
      </motion.svg>

      {/* Right foot — steps second */}
      <motion.svg
        viewBox="0 0 100 150"
        className="absolute w-[46%] h-[90%] right-[3%] top-[5%] origin-bottom"
        fill="currentColor"
        style={{ scaleX: -1 }}
        animate={{
          y: [0, 0, 0, -4, -2, 0],
          rotate: [0, 0, 0, 6, 3, 0],
          scale: [0.98, 1, 1, 1.05, 1.02, 1],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          repeatDelay: 1,
          ease: "easeInOut",
          times: [0, 0.15, 0.45, 0.6, 0.75, 1],
        }}
      >
        <BabyFoot />
      </motion.svg>
    </div>
  );
};

function BabyFoot() {
  return (
    <>
      <ellipse cx="28" cy="12" rx="11" ry="11.5" />
      <ellipse cx="48" cy="6" rx="9" ry="9.5" />
      <ellipse cx="64" cy="8" rx="8" ry="8.5" />
      <ellipse cx="77" cy="14" rx="7.5" ry="7.5" />
      <ellipse cx="87" cy="24" rx="6.5" ry="6.5" />
      <path d="M 18 28 C 8 32, 2 50, 4 70 C 5 85, 8 100, 16 115 C 22 126, 30 134, 42 138 C 52 141, 58 138, 64 130 C 72 118, 78 100, 82 82 C 86 64, 84 44, 76 32 C 70 24, 58 22, 48 24 C 38 26, 26 26, 18 28 Z" />
    </>
  );
}

export default BabyFootprintsIcon;
