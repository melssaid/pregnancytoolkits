import { motion } from "framer-motion";

/**
 * Style 2: Sparkling eye with a joyful tear — wide open, 
 * shimmering with stars and a small happy tear drop.
 */
const DreamEyeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="white" className={className} overflow="visible">
    {/* ── Sparkle particles around the eye ── */}
    {[
      { cx: 18, cy: 28, r: 2, delay: 0 },
      { cx: 82, cy: 30, r: 1.8, delay: 0.8 },
      { cx: 30, cy: 18, r: 1.5, delay: 1.6 },
      { cx: 72, cy: 20, r: 1.3, delay: 2.2 },
    ].map((s, i) => (
      <motion.circle
        key={i}
        cx={s.cx} cy={s.cy} r={s.r}
        fill="white"
        animate={{
          opacity: [0, 0.9, 0],
          scale: [0.3, 1.2, 0.3],
        }}
        transition={{ duration: 2, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
      />
    ))}

    {/* ── 4-point star sparkles ── */}
    {[
      { x: 14, y: 40, size: 4, delay: 0.4 },
      { x: 86, y: 42, size: 3.5, delay: 1.2 },
    ].map((st, i) => (
      <motion.path
        key={`star${i}`}
        d={`M${st.x} ${st.y - st.size} L${st.x + st.size * 0.3} ${st.y} L${st.x} ${st.y + st.size} L${st.x - st.size * 0.3} ${st.y} Z`}
        fill="white"
        animate={{
          opacity: [0, 0.8, 0],
          scale: [0.5, 1.3, 0.5],
        }}
        transition={{ duration: 2.5, repeat: Infinity, delay: st.delay, ease: "easeInOut" }}
      />
    ))}

    {/* ── Main eye — wide open almond shape ── */}
    <motion.g
      animate={{ scale: [1, 1.015, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "50px 50px" }}
    >
      {/* Eye white */}
      <path
        d="M8 50 C8 50, 25 24, 50 24 C75 24, 92 50, 92 50 C92 50, 75 76, 50 76 C25 76, 8 50, 8 50 Z"
        fill="white"
        opacity="0.95"
      />

      {/* Iris ring */}
      <circle cx="50" cy="50" r="17" fill="none" stroke="white" strokeWidth="3" opacity="0.4" />
      {/* Iris inner fill */}
      <circle cx="50" cy="50" r="17" fill="white" opacity="0.15" />

      {/* Pupil */}
      <circle cx="50" cy="50" r="9" fill="currentColor" opacity="0.15" />

      {/* Eye shine — large */}
      <circle cx="43" cy="44" r="4" fill="white" opacity="0.55" />
      {/* Eye shine — small */}
      <circle cx="56" cy="43" r="2" fill="white" opacity="0.4" />
      {/* Bottom reflection */}
      <ellipse cx="50" cy="58" rx="6" ry="2" fill="white" opacity="0.15" />

      {/* Upper eyelid line */}
      <path
        d="M12 48 C12 48, 28 20, 50 20 C72 20, 88 48, 88 48"
        fill="none" stroke="white" strokeWidth="2" opacity="0.3" strokeLinecap="round"
      />

      {/* ── Eyelashes — elegant curve ── */}
      <path d="M18 42 L12 32" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.35" />
      <path d="M28 32 L24 22" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
      <path d="M38 26 L36 16" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
      <path d="M50 24 L50 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
      <path d="M62 26 L64 16" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
      <path d="M72 32 L76 22" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
      <path d="M82 42 L88 32" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.35" />

      {/* Lower subtle lashes */}
      <path d="M35 73 L33 79" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.2" />
      <path d="M50 76 L50 82" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.2" />
      <path d="M65 73 L67 79" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.2" />
    </motion.g>

    {/* ── Joyful tear drop — sliding down from corner ── */}
    <motion.g
      animate={{
        y: [0, 12, 24],
        opacity: [0, 0.8, 0],
        scale: [0.6, 1, 0.7],
      }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        repeatDelay: 1.5,
        ease: "easeIn",
      }}
    >
      {/* Tear */}
      <path
        d="M78 62 C78 62, 80 68, 80 72 C80 75, 78 77, 76 77 C74 77, 72 75, 72 72 C72 68, 74 62, 78 62 Z"
        fill="white"
        opacity="0.7"
      />
      {/* Tear shine */}
      <circle cx="76" cy="70" r="1.2" fill="white" opacity="0.4" />
    </motion.g>

    {/* ── Pulsing glow aura ── */}
    <motion.ellipse
      cx="50" cy="50" rx="46" ry="32"
      fill="none" stroke="white" strokeWidth="0.6"
      animate={{
        rx: [44, 48, 44],
        ry: [30, 34, 30],
        opacity: [0.08, 0.22, 0.08],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

export default DreamEyeIcon;
