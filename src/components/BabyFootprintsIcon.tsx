import { motion } from "framer-motion";

/**
 * Realistic baby footprint icon.
 * Based on real newborn footprint anatomy:
 * - Chubby, round toes bunched closely together
 * - Wide, flat sole (babies have no arch)
 * - Plump round heel connected fully to the ball (flat foot)
 * - Overall pear/oval shape — wider at toes, narrower at heel
 */
const BabyFootprintsIcon = ({ className = "w-9 h-9" }: { className?: string }) => {
  return (
    <div className={`${className} relative`}>
      {/* Left foot — steps first */}
      <motion.svg
        viewBox="0 0 100 150"
        className="absolute w-[46%] h-[90%] left-[3%] top-[5%]"
        fill="currentColor"
        animate={{
          y: [0, -3, 0, 0, 0],
          opacity: [0.88, 1, 0.88, 0.88, 0.88],
        }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          repeatDelay: 1.4,
          ease: "easeInOut",
          times: [0, 0.2, 0.4, 0.7, 1],
        }}
      >
        <BabyFoot />
      </motion.svg>

      {/* Right foot — steps second */}
      <motion.svg
        viewBox="0 0 100 150"
        className="absolute w-[46%] h-[90%] right-[3%] top-[5%]"
        fill="currentColor"
        style={{ scaleX: -1 }}
        animate={{
          y: [0, 0, 0, -3, 0],
          opacity: [0.88, 0.88, 0.88, 1, 0.88],
        }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          repeatDelay: 1.4,
          ease: "easeInOut",
          times: [0, 0.2, 0.5, 0.7, 1],
        }}
      >
        <BabyFoot />
      </motion.svg>
    </div>
  );
};

/** Single baby foot — anatomically realistic newborn proportions */
function BabyFoot() {
  return (
    <>
      {/* ── Toes: small, round, bunched close together ── */}
      {/* Big toe — slightly larger, slightly separated */}
      <ellipse cx="28" cy="12" rx="11" ry="11.5" />
      {/* 2nd toe */}
      <ellipse cx="48" cy="6" rx="9" ry="9.5" />
      {/* 3rd toe */}
      <ellipse cx="64" cy="8" rx="8" ry="8.5" />
      {/* 4th toe */}
      <ellipse cx="77" cy="14" rx="7.5" ry="7.5" />
      {/* 5th (pinky) toe */}
      <ellipse cx="87" cy="24" rx="6.5" ry="6.5" />

      {/* ── Sole: single chubby shape, flat arch (newborn) ── */}
      <path
        d="
          M 18 28
          C 8 32, 2 50, 4 70
          C 5 85, 8 100, 16 115
          C 22 126, 30 134, 42 138
          C 52 141, 58 138, 64 130
          C 72 118, 78 100, 82 82
          C 86 64, 84 44, 76 32
          C 70 24, 58 22, 48 24
          C 38 26, 26 26, 18 28
          Z
        "
      />
    </>
  );
}

export default BabyFootprintsIcon;
