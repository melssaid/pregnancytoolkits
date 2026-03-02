import { motion } from "framer-motion";

/**
 * Anatomically accurate newborn footprint icon.
 * 
 * Real newborn foot characteristics:
 * - 5 small round toes, closely bunched, nearly equal size
 * - Very wide, flat, chubby sole with NO arch
 * - Round plump heel almost as wide as the ball
 * - Overall egg/bean shape — very different from adult feet
 * - Toes point slightly outward in a gentle fan
 */
const BabyFootprintsIcon = ({ className = "w-9 h-9" }: { className?: string }) => {
  return (
    <div className={`${className} relative`}>
      {/* Left foot */}
      <motion.svg
        viewBox="0 0 90 140"
        className="absolute w-[47%] h-[90%] left-[2%] top-[5%] origin-bottom"
        fill="currentColor"
        animate={{
          y: [0, -3.5, -1, 0, 0, 0],
          rotate: [-2, -6, -3, 0, 0, -2],
          scale: [1, 1.04, 1.01, 1, 0.98, 1],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          repeatDelay: 1.2,
          ease: "easeInOut",
          times: [0, 0.18, 0.35, 0.5, 0.75, 1],
        }}
      >
        <NewbornFoot />
      </motion.svg>

      {/* Right foot */}
      <motion.svg
        viewBox="0 0 90 140"
        className="absolute w-[47%] h-[90%] right-[2%] top-[5%] origin-bottom"
        fill="currentColor"
        style={{ scaleX: -1 }}
        animate={{
          y: [0, 0, 0, -3.5, -1, 0],
          rotate: [0, 0, 2, 6, 3, 0],
          scale: [0.98, 1, 1, 1.04, 1.01, 1],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          repeatDelay: 1.2,
          ease: "easeInOut",
          times: [0, 0.18, 0.5, 0.65, 0.82, 1],
        }}
      >
        <NewbornFoot />
      </motion.svg>
    </div>
  );
};

function NewbornFoot() {
  return (
    <>
      {/* ── Toes: closely bunched, nearly equal, gentle fan ── */}
      <ellipse cx="22" cy="11" rx="9.5" ry="10" />
      <ellipse cx="38" cy="6"  rx="8.5" ry="8.5" />
      <ellipse cx="52" cy="6"  rx="7.5" ry="7.5" />
      <ellipse cx="64" cy="10" rx="7"   ry="7" />
      <ellipse cx="74" cy="18" rx="6"   ry="6.5" />

      {/* ── Sole: wide chubby bean shape, completely flat ── */}
      <path
        d="
          M 12 26
          C 6 32, 3 48, 4 65
          C 5 78, 7 90, 12 104
          C 17 116, 25 126, 36 131
          C 44 134, 52 132, 58 126
          C 66 116, 72 100, 76 82
          C 79 66, 78 48, 72 34
          C 68 28, 58 24, 46 24
          C 34 24, 22 24, 12 26
          Z
        "
      />
    </>
  );
}

export default BabyFootprintsIcon;
