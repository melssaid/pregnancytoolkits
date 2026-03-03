import { motion } from "framer-motion";

/**
 * Stylized eye icon with large floating hearts.
 * "I dream of a baby" — fertility planning journey.
 */
const DreamEyeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 120 120" fill="white" className={className} overflow="visible">
    {/* ── 3 large floating hearts ── */}
    {[
      { delay: 0, dx: -10, startY: 55, maxScale: 2.2 },
      { delay: 1.2, dx: 8, startY: 55, maxScale: 1.8 },
      { delay: 2.2, dx: -1, startY: 52, maxScale: 2.5 },
    ].map((h, i) => (
      <motion.path
        key={i}
        d="M0 -8 C-3 -14 -12 -14 -12 -8 C-12 0 0 10 0 13 C0 10 12 0 12 -8 C12 -14 3 -14 0 -8 Z"
        fill="white"
        style={{ transform: `translate(60px, ${h.startY}px)` }}
        animate={{
          y: [0, -20, -45],
          x: [0, h.dx, h.dx * 1.5],
          opacity: [0, 0.9, 0],
          scale: [0.3, h.maxScale, h.maxScale * 0.4],
        }}
        transition={{ duration: 3, repeat: Infinity, delay: h.delay, ease: "easeOut" }}
      />
    ))}

    {/* ── Eye body — rounder, bigger ── */}
    <motion.g
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "60px 60px" }}
    >
      {/* Eye shape — rounder almond */}
      <path
        d="M10 60 Q30 25 60 25 Q90 25 110 60 Q90 95 60 95 Q30 95 10 60 Z"
        fill="white"
      />

      {/* Iris ring */}
      <circle cx="60" cy="60" r="22" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="7" />

      {/* Pupil */}
      <circle cx="60" cy="60" r="14" fill="black" opacity="0.5" />
      <circle cx="60" cy="60" r="9" fill="black" opacity="0.3" />

      {/* Eye shine */}
      <circle cx="52" cy="53" r="5" fill="white" opacity="0.85" />
      <circle cx="67" cy="52" r="2.5" fill="white" opacity="0.6" />

      {/* Upper lid crease */}
      <path
        d="M14 57 Q35 20 60 20 Q85 20 106 57"
        fill="none" stroke="white" strokeWidth="2" opacity="0.2" strokeLinecap="round"
      />

      {/* Eyelashes */}
      <path d="M24 46 L17 32" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      <path d="M38 34 L33 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      <path d="M52 27 L49 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M60 25 L60 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M68 27 L71 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M82 34 L87 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      <path d="M96 46 L103 32" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
    </motion.g>

    {/* ── Glow aura ── */}
    <motion.ellipse
      cx="60" cy="60" rx="52" ry="38"
      fill="none" stroke="white" strokeWidth="0.8"
      animate={{ rx: [50, 55, 50], ry: [36, 40, 36], opacity: [0.05, 0.15, 0.05] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

export default DreamEyeIcon;
