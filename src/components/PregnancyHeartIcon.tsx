import { motion } from "framer-motion";

/**
 * Animated pregnancy heart icon — pulsing heartbeat with baby silhouette inside
 * Matches the premium custom SVG style of RockingBabyIcon & BabyFootprintsIcon
 */
const PregnancyHeartIcon = ({ className = "w-14 h-14" }: { className?: string }) => {
  return (
    <motion.svg
      viewBox="0 0 64 72"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Heart shape with heartbeat pulse ── */}
      <motion.path
        d="M32 62 C16 48, 5 36, 5 25 Q5 15, 13 13 Q21 11, 26 18 Q29 22, 32 25 Q35 22, 38 18 Q43 11, 51 13 Q59 15, 59 25 C59 36, 48 48, 32 62Z"
        fill="white"
        fillOpacity={0.2}
        stroke="white"
        strokeWidth={2.2}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.9}
        animate={{ scale: [1, 1.06, 1, 1.03, 1] }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ originX: "50%", originY: "50%" }}
      />

      {/* ── Pregnant belly silhouette inside heart ── */}
      <motion.path
        d="M30 47 Q28 43, 28 40 Q28 35, 32 32 Q36 35, 36 40 Q36 43, 34 47"
        stroke="white"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="white"
        fillOpacity={0.12}
        opacity={0.7}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Baby head inside belly ── */}
      <circle
        cx="32"
        cy="38"
        r="2.5"
        fill="white"
        fillOpacity={0.25}
        stroke="white"
        strokeWidth={1}
        opacity={0.65}
      />

      {/* ── Heartbeat line / EKG ── */}
      <motion.path
        d="M14 32 L22 32 L25 27 L28 37 L30 30 L32 32 L42 32"
        stroke="white"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.5}
        animate={{ opacity: [0.2, 0.6, 0.2], pathLength: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Sparkle ── */}
      <motion.g
        animate={{ opacity: [0, 0.7, 0], scale: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
        style={{ originX: "52px", originY: "16px" }}
      >
        <line x1="52" y1="12" x2="52" y2="20" stroke="white" strokeWidth={1.1} strokeLinecap="round" opacity={0.7} />
        <line x1="48" y1="16" x2="56" y2="16" stroke="white" strokeWidth={1.1} strokeLinecap="round" opacity={0.7} />
      </motion.g>

      {/* ── Small star ── */}
      <motion.circle
        cx="12" cy="16" r="1.2" fill="white"
        animate={{ opacity: [0.1, 0.5, 0.1], scale: [0.7, 1.2, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, delay: 1, ease: "easeInOut" }}
      />
    </motion.svg>
  );
};

export default PregnancyHeartIcon;
