import { motion } from "framer-motion";

/**
 * Animated blinking eye with floating heart bubbles.
 * Pure SVG + framer-motion — no external GIF needed.
 */
const DreamEyeIcon = ({ className = "w-6 h-6" }: { className?: string }) => {
  // Heart bubble configs — staggered timing, varied sizes & paths
  const hearts = [
    { delay: 0.0, size: 32, startX: 0, driftX: -8, duration: 3.0 },
    { delay: 1.2, size: 22, startX: 4, driftX: 10, duration: 3.4 },
    { delay: 2.0, size: 26, startX: -3, driftX: -12, duration: 3.2 },
    { delay: 0.7, size: 18, startX: 6, driftX: 6, duration: 2.8 },
    { delay: 2.8, size: 28, startX: -5, driftX: -6, duration: 3.6 },
  ];

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* ── Blinking Eye ── */}
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        {/* Outer eye shape */}
        <motion.path
          d="M4 32 C4 32 18 10 32 10 C46 10 60 32 60 32 C60 32 46 54 32 54 C18 54 4 32 4 32Z"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Iris */}
        <circle cx="32" cy="32" r="10" fill="white" opacity="0.25" />
        <circle cx="32" cy="32" r="6" fill="white" opacity="0.6" />

        {/* Pupil */}
        <circle cx="32" cy="32" r="3" fill="white" />

        {/* Shine */}
        <circle cx="29" cy="29" r="1.5" fill="white" opacity="0.9" />

        {/* Blink — eyelid that covers the eye */}
        <motion.path
          d="M4 32 C4 32 18 10 32 10 C46 10 60 32 60 32"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          animate={{
            d: [
              // Open
              "M4 32 C4 32 18 10 32 10 C46 10 60 32 60 32",
              // Open (hold)
              "M4 32 C4 32 18 10 32 10 C46 10 60 32 60 32",
              // Closed (blink)
              "M4 32 C4 32 18 32 32 32 C46 32 60 32 60 32",
              // Open again
              "M4 32 C4 32 18 10 32 10 C46 10 60 32 60 32",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 1,
            times: [0, 0.7, 0.8, 0.9],
            ease: "easeInOut",
          }}
        />

        {/* Lower eyelid blink */}
        <motion.path
          d="M4 32 C4 32 18 54 32 54 C46 54 60 32 60 32"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          animate={{
            d: [
              "M4 32 C4 32 18 54 32 54 C46 54 60 32 60 32",
              "M4 32 C4 32 18 54 32 54 C46 54 60 32 60 32",
              "M4 32 C4 32 18 32 32 32 C46 32 60 32 60 32",
              "M4 32 C4 32 18 54 32 54 C46 54 60 32 60 32",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 1,
            times: [0, 0.7, 0.8, 0.9],
            ease: "easeInOut",
          }}
        />
      </svg>

      {/* ── Floating Heart Bubbles ── */}
      {hearts.map((h, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            width: `${h.size}%`,
            height: `${h.size}%`,
            left: `calc(50% + ${h.startX}px)`,
            top: "30%",
          }}
          animate={{
            y: [0, -18, -40],
            x: [0, h.driftX * 0.5, h.driftX],
            opacity: [0, 0.9, 0],
            scale: [0.3, 1.1, 0.6],
          }}
          transition={{
            duration: h.duration,
            repeat: Infinity,
            delay: h.delay,
            ease: "easeOut",
          }}
        >
          <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-sm">
            <defs>
              <radialGradient id={`hg${i}`} cx="40%" cy="35%">
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0.5" />
              </radialGradient>
            </defs>
            <path
              d="M12 6 C10 2 5 2 5 6 C5 10 12 16 12 18 C12 16 19 10 19 6 C19 2 14 2 12 6Z"
              fill={`url(#hg${i})`}
            />
            {/* Bubble shine */}
            <circle cx="9" cy="6" r="1.2" fill="white" opacity="0.7" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default DreamEyeIcon;
