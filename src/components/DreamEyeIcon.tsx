import { motion } from "framer-motion";

/**
 * Model 1: Blinking eye with clip-path, larger and natural.
 */
const DreamEyeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 140 140" fill="white" className={className} overflow="visible">
    {/* ── 2 floating hearts ── */}
    {[
      { delay: 0.5, dx: -14, startY: 48, maxScale: 2.6 },
      { delay: 2.8, dx: 11, startY: 45, maxScale: 2.9 },
    ].map((h, i) => (
      <motion.path
        key={i}
        d="M0 -10 C-4 -18 -15 -18 -15 -10 C-15 0 0 13 0 16 C0 13 15 0 15 -10 C15 -18 4 -18 0 -10 Z"
        fill="white"
        style={{ transform: `translate(70px, ${h.startY}px)` }}
        animate={{
          y: [0, -28, -55],
          x: [0, h.dx, h.dx * 1.3],
          opacity: [0, 0.85, 0],
          scale: [0.15, h.maxScale, h.maxScale * 0.2],
        }}
        transition={{ duration: 4, repeat: Infinity, delay: h.delay, ease: "easeOut" }}
      />
    ))}

    <defs>
      <clipPath id="eyeClip">
        <motion.ellipse
          cx="70" cy="70" rx="58" ry="42"
          animate={{ ry: [42, 42, 0, 0, 42, 42] }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            times: [0, 0.68, 0.73, 0.78, 0.83, 1],
            ease: "easeInOut",
          }}
        />
      </clipPath>
    </defs>

    {/* ── Eye body with blink ── */}
    <g clipPath="url(#eyeClip)">
      <path
        d="M5 70 Q30 18 70 18 Q110 18 135 70 Q110 122 70 122 Q30 122 5 70 Z"
        fill="white"
      />
      <circle cx="70" cy="70" r="28" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="9" />
      <circle cx="70" cy="70" r="17" fill="black" opacity="0.42" />
      <circle cx="70" cy="70" r="11" fill="black" opacity="0.22" />
      <circle cx="60" cy="62" r="6" fill="white" opacity="0.9" />
      <circle cx="80" cy="60" r="3.2" fill="white" opacity="0.5" />
    </g>

    {/* ── Eyelid crease ── */}
    <motion.path
      d="M5 70 Q30 18 70 18 Q110 18 135 70"
      fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.25"
      animate={{
        d: [
          "M5 70 Q30 18 70 18 Q110 18 135 70",
          "M5 70 Q30 18 70 18 Q110 18 135 70",
          "M5 70 Q30 68 70 70 Q110 68 135 70",
          "M5 70 Q30 68 70 70 Q110 68 135 70",
          "M5 70 Q30 18 70 18 Q110 18 135 70",
          "M5 70 Q30 18 70 18 Q110 18 135 70",
        ],
      }}
      transition={{
        duration: 4.5,
        repeat: Infinity,
        times: [0, 0.68, 0.73, 0.78, 0.83, 1],
        ease: "easeInOut",
      }}
    />

    {/* ── Eyelashes ── */}
    <path d="M20 50 L11 32" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
    <path d="M36 34 L28 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
    <path d="M54 22 L50 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    <path d="M70 18 L70 0" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    <path d="M86 22 L90 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    <path d="M104 34 L112 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
    <path d="M120 50 L129 32" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />

    {/* ── Glow ── */}
    <motion.ellipse
      cx="70" cy="70" rx="62" ry="45"
      fill="none" stroke="white" strokeWidth="0.7"
      animate={{ rx: [60, 66, 60], ry: [43, 48, 43], opacity: [0.04, 0.16, 0.04] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

export default DreamEyeIcon;
