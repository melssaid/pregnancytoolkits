import { motion } from "framer-motion";

/**
 * Bold, clear eye icon with a prominent dark pupil.
 * Floating hearts + sparkles for "I dream of a baby."
 */
const DreamEyeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="white" className={className} overflow="visible">
    {/* ── Floating hearts — large & prominent, emerging from pupil ── */}
    {[
      { delay: 0, dx: -14, startY: 52, color: "#ff4d6d" },
      { delay: 1.2, dx: 10, startY: 52, color: "white" },
      { delay: 2.4, dx: -3, startY: 52, color: "#e0115f" },
      { delay: 0.7, dx: 16, startY: 52, color: "#ffb3c6" },
    ].map((h, i) => (
      <motion.path
        key={i}
        d="M0 -5 C-2 -9 -8 -9 -8 -5 C-8 0 0 6 0 8 C0 6 8 0 8 -5 C8 -9 2 -9 0 -5 Z"
        fill={h.color}
        style={{ transform: `translate(50px, ${h.startY}px)` }}
        animate={{
          y: [0, -28, -55],
          x: [0, h.dx, h.dx * 1.8],
          opacity: [0, 0.95, 0],
          scale: [0.3, 1.3, 0.7],
        }}
        transition={{ duration: 3, repeat: Infinity, delay: h.delay, ease: "easeOut" }}
      />
    ))}

    {/* ── Sparkle dots ── */}
    {[
      { cx: 16, cy: 32, delay: 0.5 },
      { cx: 84, cy: 34, delay: 1.8 },
    ].map((s, i) => (
      <motion.circle
        key={`sp${i}`}
        cx={s.cx} cy={s.cy} r={2}
        fill="white"
        animate={{ opacity: [0, 1, 0], scale: [0.4, 1.3, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, delay: s.delay }}
      />
    ))}

    {/* ── Eye body ── */}
    <motion.g
      animate={{ scale: [1, 1.015, 1] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "50px 52px" }}
    >
      {/* Eye white — wide open almond */}
      <path
        d="M5 52 Q27 22 50 22 Q73 22 95 52 Q73 82 50 82 Q27 82 5 52 Z"
        fill="white"
      />

      {/* ── Iris — colored ring ── */}
      <circle cx="50" cy="52" r="19" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="6" />

      {/* ── PUPIL — solid dark black circle ── */}
      <circle cx="50" cy="52" r="12" fill="black" opacity="0.55" />
      <circle cx="50" cy="52" r="8" fill="black" opacity="0.35" />

      {/* ── Eye shine / reflections ── */}
      <circle cx="43" cy="46" r="4.5" fill="white" opacity="0.85" />
      <circle cx="56" cy="45" r="2.2" fill="white" opacity="0.6" />

      {/* Upper eyelid crease */}
      <path
        d="M9 49 Q28 18 50 18 Q72 18 91 49"
        fill="none" stroke="white" strokeWidth="2" opacity="0.25" strokeLinecap="round"
      />

      {/* ── Eyelashes — bold & clear ── */}
      <path d="M18 40 L12 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      <path d="M30 30 L26 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      <path d="M42 24 L40 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M50 22 L50 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M58 24 L60 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M70 30 L74 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      <path d="M82 40 L88 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
    </motion.g>

    {/* ── Glow aura ── */}
    <motion.ellipse
      cx="50" cy="52" rx="46" ry="34"
      fill="none" stroke="white" strokeWidth="0.7"
      animate={{ rx: [44, 48, 44], ry: [32, 36, 32], opacity: [0.06, 0.18, 0.06] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

export default DreamEyeIcon;
