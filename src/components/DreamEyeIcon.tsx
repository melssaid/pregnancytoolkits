import { motion } from "framer-motion";

/**
 * Model 1: Blinking eye with clip-path, larger and natural.
 */
const DreamEyeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 140 140" fill="white" className={className} overflow="visible">
    {/* ── 2 hearts that pulse & bloom from the eye ── */}
    {[
      { delay: 0, angle: -40, dist: 50 },
      { delay: 2.2, angle: 35, dist: 46 },
    ].map((h, i) => {
      const rad = (h.angle * Math.PI) / 180;
      const tx = 70 + Math.cos(rad) * h.dist;
      const ty = 38 + Math.sin(rad) * h.dist * 0.35;
      return (
        <motion.path
          key={i}
          d="M0 -6 C-3 -12 -10 -12 -10 -6 C-10 2 0 9 0 11 C0 9 10 2 10 -6 C10 -12 3 -12 0 -6 Z"
          fill="white"
          style={{ transform: `translate(${tx}px, ${ty}px)` }}
          animate={{
            scale: [0, 2, 2.6, 0],
            opacity: [0, 0.9, 0.6, 0],
            rotate: [0, -12, 12, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: h.delay,
            ease: "easeInOut",
          }}
        />
      );
    })}

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
