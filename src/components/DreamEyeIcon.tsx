import { motion } from "framer-motion";

/**
 * Model 2: Dreamy eye with smooth eyelid blink — larger, softer style.
 */
const DreamEyeIcon = ({ className = "w-6 h-6" }: { className?: string }) => {
  const blinkTiming = {
    duration: 5,
    repeat: Infinity,
    times: [0, 0.65, 0.7, 0.75, 0.8, 1],
    ease: "easeInOut" as const,
  };

  return (
    <svg viewBox="0 0 140 140" fill="white" className={className} overflow="visible">
      {/* ── 2 floating hearts ── */}
      {[
        { delay: 0.8, dx: -14, startY: 45, maxScale: 2.6 },
        { delay: 3, dx: 12, startY: 42, maxScale: 3 },
      ].map((h, i) => (
        <motion.path
          key={i}
          d="M0 -10 C-4 -18 -15 -18 -15 -10 C-15 0 0 13 0 16 C0 13 15 0 15 -10 C15 -18 4 -18 0 -10 Z"
          fill="white"
          style={{ transform: `translate(70px, ${h.startY}px)` }}
          animate={{
            y: [0, -30, -55],
            x: [0, h.dx, h.dx * 1.3],
            opacity: [0, 0.8, 0],
            scale: [0.15, h.maxScale, h.maxScale * 0.2],
          }}
          transition={{ duration: 4, repeat: Infinity, delay: h.delay, ease: "easeOut" }}
        />
      ))}

      {/* ── Upper eyelid (closes downward) ── */}
      <motion.path
        d="M5 70 Q35 15 70 15 Q105 15 135 70 L135 0 L5 0 Z"
        fill="currentColor"
        opacity="0.15"
        animate={{
          d: [
            "M5 70 Q35 15 70 15 Q105 15 135 70 L135 0 L5 0 Z",
            "M5 70 Q35 15 70 15 Q105 15 135 70 L135 0 L5 0 Z",
            "M5 70 Q35 65 70 70 Q105 65 135 70 L135 0 L5 0 Z",
            "M5 70 Q35 65 70 70 Q105 65 135 70 L135 0 L5 0 Z",
            "M5 70 Q35 15 70 15 Q105 15 135 70 L135 0 L5 0 Z",
            "M5 70 Q35 15 70 15 Q105 15 135 70 L135 0 L5 0 Z",
          ],
        }}
        transition={blinkTiming}
      />

      {/* ── Lower eyelid (closes upward) ── */}
      <motion.path
        d="M5 70 Q35 125 70 125 Q105 125 135 70 L135 140 L5 140 Z"
        fill="currentColor"
        opacity="0.1"
        animate={{
          d: [
            "M5 70 Q35 125 70 125 Q105 125 135 70 L135 140 L5 140 Z",
            "M5 70 Q35 125 70 125 Q105 125 135 70 L135 140 L5 140 Z",
            "M5 70 Q35 75 70 70 Q105 75 135 70 L135 140 L5 140 Z",
            "M5 70 Q35 75 70 70 Q105 75 135 70 L135 140 L5 140 Z",
            "M5 70 Q35 125 70 125 Q105 125 135 70 L135 140 L5 140 Z",
            "M5 70 Q35 125 70 125 Q105 125 135 70 L135 140 L5 140 Z",
          ],
        }}
        transition={blinkTiming}
      />

      {/* ── Eye white ── */}
      <motion.path
        d="M5 70 Q35 15 70 15 Q105 15 135 70 Q105 125 70 125 Q35 125 5 70 Z"
        fill="white"
        animate={{
          d: [
            "M5 70 Q35 15 70 15 Q105 15 135 70 Q105 125 70 125 Q35 125 5 70 Z",
            "M5 70 Q35 15 70 15 Q105 15 135 70 Q105 125 70 125 Q35 125 5 70 Z",
            "M5 70 Q35 67 70 70 Q105 67 135 70 Q105 73 70 70 Q35 73 5 70 Z",
            "M5 70 Q35 67 70 70 Q105 67 135 70 Q105 73 70 70 Q35 73 5 70 Z",
            "M5 70 Q35 15 70 15 Q105 15 135 70 Q105 125 70 125 Q35 125 5 70 Z",
            "M5 70 Q35 15 70 15 Q105 15 135 70 Q105 125 70 125 Q35 125 5 70 Z",
          ],
        }}
        transition={blinkTiming}
      />

      {/* ── Iris + Pupil (hidden during blink) ── */}
      <motion.g
        animate={{ opacity: [1, 1, 0, 0, 1, 1] }}
        transition={blinkTiming}
      >
        <circle cx="70" cy="70" r="28" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="9" />
        <circle cx="70" cy="70" r="17" fill="black" opacity="0.4" />
        <circle cx="70" cy="70" r="11" fill="black" opacity="0.2" />
        {/* Shine */}
        <circle cx="60" cy="61" r="6" fill="white" opacity="0.9" />
        <circle cx="79" cy="60" r="3.5" fill="white" opacity="0.5" />
      </motion.g>

      {/* ── Eyelashes ── */}
      <path d="M18 52 L9 34" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      <path d="M34 36 L27 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      <path d="M52 22 L48 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M70 18 L70 0" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M88 22 L92 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M106 36 L113 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      <path d="M122 52 L131 34" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />

      {/* ── Glow ── */}
      <motion.ellipse
        cx="70" cy="70" rx="62" ry="46"
        fill="none" stroke="white" strokeWidth="0.7"
        animate={{ rx: [60, 66, 60], ry: [44, 49, 44], opacity: [0.04, 0.15, 0.04] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
};

export default DreamEyeIcon;
