import { motion } from "framer-motion";

/**
 * Style 1: Dreamy sleeping eye — half-closed with long lashes,
 * floating hearts and stars representing dreaming of a baby.
 */
const DreamEyeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="white" className={className} overflow="visible">
    {/* ── Floating hearts ── */}
    {[
      { delay: 0, dx: -10, size: 5 },
      { delay: 1.4, dx: 7, size: 4 },
      { delay: 2.6, dx: -2, size: 3.5 },
    ].map((h, i) => (
      <motion.path
        key={`h${i}`}
        d={`M50 32 c-${h.size * 0.15} -${h.size * 0.55} -${h.size * 0.85} -${h.size * 0.55} -${h.size * 0.85} -${h.size * 0.1} c0 ${h.size * 0.5} ${h.size * 0.85} ${h.size * 0.9} ${h.size * 0.85} ${h.size * 1.1} c0 -${h.size * 0.2} ${h.size * 0.85} -${h.size * 0.6} ${h.size * 0.85} -${h.size * 1.1} c0 -${h.size * 0.45} -${h.size * 0.7} -${h.size * 0.45} -${h.size * 0.85} ${h.size * 0.1}z`}
        fill="white"
        animate={{
          y: [0, -20, -40],
          x: [0, h.dx, h.dx * 1.8],
          opacity: [0, 0.85, 0],
          scale: [0.4, 1, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity, delay: h.delay, ease: "easeOut" }}
      />
    ))}

    {/* ── Tiny floating stars ── */}
    {[
      { x: 30, delay: 0.5, size: 2.5 },
      { x: 70, delay: 2, size: 2 },
    ].map((s, i) => (
      <motion.circle
        key={`s${i}`}
        cx={s.x} cy="35" r={s.size}
        fill="white" opacity="0.6"
        animate={{
          y: [0, -15, -30],
          opacity: [0, 0.7, 0],
          scale: [0.3, 1, 0.3],
        }}
        transition={{ duration: 2.5, repeat: Infinity, delay: s.delay, ease: "easeOut" }}
      />
    ))}

    {/* ── Half-closed eye (sleeping/dreaming) ── */}
    <motion.g
      animate={{ scale: [1, 1.01, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "50px 55px" }}
    >
      {/* Lower eye shape — visible part */}
      <path
        d="M10 55 C10 55, 28 75, 50 75 C72 75, 90 55, 90 55"
        fill="white"
        opacity="0.9"
      />
      {/* Closed eyelid — top, slightly curved */}
      <path
        d="M10 55 C10 55, 28 48, 50 48 C72 48, 90 55, 90 55"
        fill="white"
        opacity="0.7"
      />
      {/* Eyelid line */}
      <path
        d="M10 55 C10 55, 30 47, 50 47 C70 47, 90 55, 90 55"
        fill="none" stroke="white" strokeWidth="2" opacity="0.5" strokeLinecap="round"
      />

      {/* Iris peeking — crescent */}
      <path
        d="M35 58 C35 52, 50 50, 50 55 C50 60, 65 52, 65 58 C65 68, 35 68, 35 58 Z"
        fill="currentColor" opacity="0.12"
      />

      {/* Pupil hint */}
      <ellipse cx="50" cy="60" rx="5" ry="4" fill="currentColor" opacity="0.08" />

      {/* Eye shine */}
      <circle cx="45" cy="57" r="2" fill="white" opacity="0.5" />

      {/* ── Long upper eyelashes ── */}
      <path d="M15 54 L10 44" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M25 50 L20 39" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
      <path d="M35 47 L32 36" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M45 46 L44 34" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M55 46 L56 34" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M65 47 L68 36" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
      <path d="M75 50 L80 39" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M85 54 L90 44" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.35" />

      {/* ── Lower lash hints ── */}
      <path d="M30 72 L28 78" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.2" />
      <path d="M50 75 L50 82" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.2" />
      <path d="M70 72 L72 78" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.2" />
    </motion.g>

    {/* ── Gentle glow ── */}
    <motion.ellipse
      cx="50" cy="58" rx="44" ry="28"
      fill="none" stroke="white" strokeWidth="0.7"
      animate={{
        rx: [42, 46, 42],
        ry: [26, 30, 26],
        opacity: [0.08, 0.2, 0.08],
      }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

export default DreamEyeIcon;
