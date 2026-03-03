import { motion } from "framer-motion";

/**
 * Animated blinking eye with floating hearts.
 */
const DreamEyeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 120 120" fill="white" className={className} overflow="visible">
    {/* ── 2 large floating hearts ── */}
    {[
      { delay: 0.5, dx: -12, startY: 50, maxScale: 2.5 },
      { delay: 2.5, dx: 10, startY: 48, maxScale: 2.8 },
    ].map((h, i) => (
      <motion.path
        key={i}
        d="M0 -10 C-4 -18 -15 -18 -15 -10 C-15 0 0 13 0 16 C0 13 15 0 15 -10 C15 -18 4 -18 0 -10 Z"
        fill="white"
        style={{ transform: `translate(60px, ${h.startY}px)` }}
        animate={{
          y: [0, -25, -50],
          x: [0, h.dx, h.dx * 1.4],
          opacity: [0, 0.85, 0],
          scale: [0.2, h.maxScale, h.maxScale * 0.3],
        }}
        transition={{ duration: 3.5, repeat: Infinity, delay: h.delay, ease: "easeOut" }}
      />
    ))}

    <defs>
      {/* Clip path for the eyelid blink — animated via motion */}
      <clipPath id="eyeClip">
        <motion.ellipse
          cx="60" cy="60" rx="50" ry="35"
          animate={{
            ry: [35, 35, 0, 0, 35, 35],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            times: [0, 0.7, 0.75, 0.8, 0.85, 1],
            ease: "easeInOut",
          }}
        />
      </clipPath>
    </defs>

    {/* ── Eye body with blink clip ── */}
    <g clipPath="url(#eyeClip)">
      {/* Eye white — almond shape */}
      <path
        d="M8 60 Q28 22 60 22 Q92 22 112 60 Q92 98 60 98 Q28 98 8 60 Z"
        fill="white"
      />

      {/* Iris */}
      <circle cx="60" cy="60" r="24" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="8" />

      {/* Pupil layers */}
      <circle cx="60" cy="60" r="15" fill="black" opacity="0.45" />
      <circle cx="60" cy="60" r="10" fill="black" opacity="0.25" />

      {/* Eye shine highlights */}
      <circle cx="51" cy="52" r="5.5" fill="white" opacity="0.9" />
      <circle cx="68" cy="51" r="3" fill="white" opacity="0.55" />
    </g>

    {/* ── Eyelid line (closes with blink) ── */}
    <motion.path
      d="M8 60 Q28 22 60 22 Q92 22 112 60"
      fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.3"
      animate={{
        d: [
          "M8 60 Q28 22 60 22 Q92 22 112 60",
          "M8 60 Q28 22 60 22 Q92 22 112 60",
          "M8 60 Q28 58 60 60 Q92 58 112 60",
          "M8 60 Q28 58 60 60 Q92 58 112 60",
          "M8 60 Q28 22 60 22 Q92 22 112 60",
          "M8 60 Q28 22 60 22 Q92 22 112 60",
        ],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        times: [0, 0.7, 0.75, 0.8, 0.85, 1],
        ease: "easeInOut",
      }}
    />

    {/* ── Eyelashes ── */}
    <path d="M22 44 L14 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
    <path d="M36 32 L30 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
    <path d="M50 25 L47 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    <path d="M60 22 L60 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    <path d="M70 25 L73 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    <path d="M84 32 L90 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
    <path d="M98 44 L106 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />

    {/* ── Glow aura ── */}
    <motion.ellipse
      cx="60" cy="60" rx="52" ry="38"
      fill="none" stroke="white" strokeWidth="0.8"
      animate={{ rx: [50, 56, 50], ry: [36, 41, 36], opacity: [0.05, 0.18, 0.05] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

export default DreamEyeIcon;
