import { motion } from "framer-motion";

/**
 * Style 2 (refined): Bold sparkling eye with clear pupil, joyful tear,
 * and twinkling stars. High contrast for small icon sizes.
 */
const DreamEyeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="white" className={className} overflow="visible">
    {/* ── Sparkles around the eye ── */}
    {[
      { cx: 15, cy: 30, delay: 0 },
      { cx: 85, cy: 32, delay: 1 },
      { cx: 50, cy: 12, delay: 2 },
    ].map((s, i) => (
      <motion.circle
        key={i}
        cx={s.cx} cy={s.cy} r={2.5}
        fill="white"
        animate={{ opacity: [0, 1, 0], scale: [0.3, 1.3, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
      />
    ))}

    {/* ── Eye shape — bold & clear ── */}
    <motion.g
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "50px 50px" }}
    >
      {/* Eye white — thick almond */}
      <path
        d="M6 50 Q28 20 50 20 Q72 20 94 50 Q72 80 50 80 Q28 80 6 50 Z"
        fill="white"
      />

      {/* ── IRIS — large, bold circle ── */}
      <circle cx="50" cy="50" r="20" fill="white" opacity="0.3" />
      <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="4" opacity="0.6" />

      {/* ── PUPIL — very visible dark center ── */}
      <circle cx="50" cy="50" r="11" fill="currentColor" opacity="0.25" />
      <circle cx="50" cy="50" r="7" fill="currentColor" opacity="0.15" />

      {/* ── Eye shine highlights ── */}
      <circle cx="42" cy="43" r="5" fill="white" opacity="0.7" />
      <circle cx="56" cy="42" r="2.5" fill="white" opacity="0.5" />

      {/* ── Upper eyelid crease ── */}
      <path
        d="M10 47 Q30 16 50 16 Q70 16 90 47"
        fill="none" stroke="white" strokeWidth="2.5" opacity="0.3" strokeLinecap="round"
      />

      {/* ── Bold eyelashes ── */}
      <path d="M20 38 L14 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      <path d="M32 28 L28 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      <path d="M44 22 L42 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M56 22 L58 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M68 28 L72 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      <path d="M80 38 L86 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
    </motion.g>

    {/* ── Joyful tear ── */}
    <motion.path
      d="M82 60 Q84 68 84 73 Q84 78 80 78 Q76 78 76 73 Q76 68 78 60 Z"
      fill="white" opacity="0.7"
      animate={{
        y: [0, 14, 28],
        opacity: [0, 0.8, 0],
        scale: [0.5, 1, 0.6],
      }}
      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeIn" }}
    />

    {/* ── Glow pulse ── */}
    <motion.ellipse
      cx="50" cy="50" rx="46" ry="34"
      fill="none" stroke="white" strokeWidth="0.8"
      animate={{ rx: [44, 48, 44], ry: [32, 36, 32], opacity: [0.06, 0.2, 0.06] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

export default DreamEyeIcon;
