import { motion } from "framer-motion";

/**
 * Animated pregnancy heart icon — pulsing heartbeat with baby silhouette inside
 * Matches the premium custom SVG style of RockingBabyIcon & BabyFootprintsIcon
 */
const PregnancyHeartIcon = ({ className = "w-14 h-14" }: { className?: string }) => {
  return (
    <motion.svg
      viewBox="0 0 80 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Heart shape with heartbeat pulse ── */}
      <motion.path
        d="M40 68 C20 52, 6 40, 6 28 Q6 16, 16 14 Q26 12, 32 20 Q36 24, 40 28 Q44 24, 48 20 Q54 12, 64 14 Q74 16, 74 28 C74 40, 60 52, 40 68Z"
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
        d="M38 52 Q36 48, 36 44 Q36 38, 40 35 Q44 38, 44 44 Q44 48, 42 52"
        stroke="white"
        strokeWidth={1.5}
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
        cx="40"
        cy="42"
        r="3"
        fill="white"
        fillOpacity={0.25}
        stroke="white"
        strokeWidth={1.2}
        opacity={0.65}
      />

      {/* ── Heartbeat line / EKG ── */}
      <motion.path
        d="M18 36 L28 36 L31 30 L34 42 L37 33 L40 36 L50 36"
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.5}
        animate={{ opacity: [0.2, 0.6, 0.2], pathLength: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Sparkle top-right ── */}
      <motion.g
        animate={{ opacity: [0, 0.7, 0], scale: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
        style={{ originX: "64px", originY: "18px" }}
      >
        <line x1="64" y1="14" x2="64" y2="22" stroke="white" strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />
        <line x1="60" y1="18" x2="68" y2="18" stroke="white" strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />
      </motion.g>

      {/* ── Small star ── */}
      <motion.circle
        cx="18" cy="20" r="1.3" fill="white"
        animate={{ opacity: [0.1, 0.5, 0.1], scale: [0.7, 1.2, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, delay: 1, ease: "easeInOut" }}
      />
    </motion.svg>
  );
};

export default PregnancyHeartIcon;
