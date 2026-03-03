import { motion } from "framer-motion";

/**
 * Realistic fetal silhouette icon with gentle floating animation and pulsing glow aura.
 */
const EmbryoIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="white" className={className}>
    {/* ── Pulsing glow aura ── */}
    <defs>
      <radialGradient id="embryo-glow" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor="white" stopOpacity="0.3" />
        <stop offset="60%" stopColor="white" stopOpacity="0.08" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Outer glow pulse */}
    <motion.ellipse
      cx="50" cy="48" rx="42" ry="44"
      fill="url(#embryo-glow)"
      animate={{
        rx: [40, 44, 40],
        ry: [42, 46, 42],
        opacity: [0.4, 0.7, 0.4],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />

    {/* Inner glow ring */}
    <motion.ellipse
      cx="50" cy="48" rx="30" ry="32"
      fill="none"
      stroke="white"
      strokeWidth="0.8"
      animate={{
        rx: [28, 32, 28],
        ry: [30, 34, 30],
        opacity: [0.15, 0.35, 0.15],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.3,
      }}
    />

    {/* Gentle floating / breathing animation */}
    <motion.g
      animate={{
        y: [0, -1.5, 0, 1, 0],
        rotate: [0, 1.5, 0, -1, 0],
        scale: [1, 1.02, 1, 0.99, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.25, 0.5, 0.75, 1],
      }}
      style={{ transformOrigin: "50px 50px" }}
    >
      {/* ── Head ── */}
      <ellipse cx="52" cy="24" rx="14" ry="15.5" opacity="1" />

      {/* ── Face details ── */}
      <ellipse cx="56" cy="22" rx="2.8" ry="1" fill="currentColor" opacity="0.15" transform="rotate(-5 56 22)" />
      <circle cx="59" cy="26" r="1" fill="currentColor" opacity="0.1" />

      {/* ── Body / torso ── */}
      <path
        d="M42 36 C38 38, 34 44, 34 52 C34 60, 38 67, 44 72 C48 75, 54 76, 58 73 C64 68, 66 60, 64 52 C63 46, 60 40, 56 37 Z"
        opacity="0.95"
      />

      {/* ── Spine curve hint ── */}
      <path
        d="M40 38 C36 45, 34 54, 37 64 C38 68, 41 71, 44 72"
        fill="none" stroke="white" strokeWidth="1.2" opacity="0.15" strokeLinecap="round"
      />

      {/* ── Right arm (curled near face) ── */}
      <path d="M56 38 C60 40, 63 38, 64 34 C64.5 31, 63 28, 60 27"
        fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
      <circle cx="60" cy="27" r="2.8" opacity="0.8" />

      {/* ── Left arm (tucked) ── */}
      <path d="M44 42 C40 44, 38 42, 37 39"
        fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
      <circle cx="37" cy="39" r="2.2" opacity="0.65" />

      {/* ── Right leg ── */}
      <path d="M56 68 C58 72, 60 76, 58 80 C56 83, 52 84, 50 82"
        fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
      <ellipse cx="49" cy="82" rx="3.5" ry="2" transform="rotate(-20 49 82)" opacity="0.8" />

      {/* ── Left leg ── */}
      <path d="M48 70 C46 74, 43 78, 40 79 C38 79, 36 78, 36 76"
        fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" opacity="0.75" />
      <ellipse cx="36" cy="76" rx="3" ry="1.8" transform="rotate(15 36 76)" opacity="0.7" />

      {/* ── Ear ── */}
      <path d="M40 20 C38 18, 37 21, 38.5 23"
        fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
    </motion.g>

    {/* ── Umbilical cord ── */}
    <motion.path
      d="M50 76 C48 82, 44 86, 40 90 C37 93, 33 94, 30 92"
      fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.35"
      animate={{
        d: [
          "M50 76 C48 82, 44 86, 40 90 C37 93, 33 94, 30 92",
          "M50 76 C49 83, 46 87, 42 90 C39 92, 35 93, 32 91",
          "M50 76 C48 82, 44 86, 40 90 C37 93, 33 94, 30 92",
        ],
      }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

export default EmbryoIcon;
