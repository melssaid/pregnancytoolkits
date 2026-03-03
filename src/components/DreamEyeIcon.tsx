import { motion } from "framer-motion";

/**
 * Dreaming eye icon with floating hearts.
 * Represents "I dream of a baby" — hope and anticipation.
 * White fill to match BabyFootprintsIcon style.
 */
const DreamEyeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="white" className={className} overflow="visible">
    {/* ── Floating hearts emerging from the eye ── */}
    {[
      { x: 50, delay: 0, size: 6, dx: -8 },
      { x: 50, delay: 1.2, size: 4.5, dx: 6 },
      { x: 50, delay: 2.4, size: 5, dx: -3 },
    ].map((h, i) => (
      <motion.g
        key={i}
        animate={{
          y: [0, -18, -36],
          x: [0, h.dx, h.dx * 1.5],
          opacity: [0, 0.9, 0],
          scale: [0.5, 1, 0.6],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          delay: h.delay,
          ease: "easeOut",
        }}
        style={{ transformOrigin: `${h.x}px 30px` }}
      >
        <path
          d={`M${h.x} ${28 - h.size * 0.3} 
            c${-h.size * 0.15} ${-h.size * 0.6} ${-h.size * 0.9} ${-h.size * 0.6} ${-h.size * 0.9} ${-h.size * 0.15} 
            c0 ${h.size * 0.55} ${h.size * 0.9} ${h.size * 0.95} ${h.size * 0.9} ${h.size * 1.2} 
            c0 ${-h.size * 0.25} ${h.size * 0.9} ${-h.size * 0.65} ${h.size * 0.9} ${-h.size * 1.2} 
            c0 ${-h.size * 0.45} ${-h.size * 0.75} ${-h.size * 0.45} ${-h.size * 0.9} ${h.size * 0.15}z`}
          fill="white"
          opacity="0.85"
        />
      </motion.g>
    ))}

    {/* ── Main eye shape ── */}
    <motion.g
      animate={{
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ transformOrigin: "50px 50px" }}
    >
      {/* Eye outline — almond shape */}
      <path
        d="M8 50 C8 50, 28 22, 50 22 C72 22, 92 50, 92 50 C92 50, 72 78, 50 78 C28 78, 8 50, 8 50 Z"
        fill="white"
        opacity="0.95"
      />

      {/* Iris */}
      <circle cx="50" cy="50" r="16" fill="white" opacity="0.3" />
      <circle cx="50" cy="50" r="16" fill="none" stroke="white" strokeWidth="2.5" opacity="0.5" />

      {/* Pupil */}
      <circle cx="50" cy="50" r="9" fill="currentColor" opacity="0.15" />

      {/* Pupil inner — heart-shaped highlight */}
      <path
        d="M50 46 c-0.8 -3.2 -5 -3.2 -5 -0.8 c0 3 5 5.5 5 7 c0 -1.5 5 -4 5 -7 c0 -2.4 -4.2 -2.4 -5 0.8z"
        fill="white"
        opacity="0.6"
      />

      {/* Eye shine / reflection */}
      <circle cx="43" cy="44" r="3" fill="white" opacity="0.5" />
      <circle cx="55" cy="43" r="1.5" fill="white" opacity="0.35" />

      {/* Upper eyelid crease */}
      <path
        d="M14 48 C14 48, 30 18, 50 18 C70 18, 86 48, 86 48"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.25"
        strokeLinecap="round"
      />

      {/* Lower lash line accent */}
      <path
        d="M20 52 C20 52, 34 72, 50 72 C66 72, 80 52, 80 52"
        fill="none"
        stroke="white"
        strokeWidth="1"
        opacity="0.15"
        strokeLinecap="round"
      />

      {/* Subtle eyelashes — top */}
      <path d="M22 40 L18 34" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M32 30 L30 23" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <path d="M50 24 L50 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M68 30 L70 23" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <path d="M78 40 L82 34" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </motion.g>

    {/* ── Soft glow aura ── */}
    <motion.ellipse
      cx="50" cy="50" rx="46" ry="32"
      fill="none"
      stroke="white"
      strokeWidth="0.8"
      animate={{
        rx: [44, 48, 44],
        ry: [30, 34, 30],
        opacity: [0.1, 0.25, 0.1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </svg>
);

export default DreamEyeIcon;
