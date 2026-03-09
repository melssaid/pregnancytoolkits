import { motion } from "framer-motion";

/**
 * Premium animated icons for the Fetal Development tracker.
 * Each icon uses gradients, layered shapes, and subtle animations
 * for a polished, medical-grade aesthetic.
 */

// ── Organ Icons (for badges) ──

export const AnimatedHeartOrgan = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f43f5e" />
        <stop offset="100%" stopColor="#e11d48" />
      </linearGradient>
    </defs>
    <motion.path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="url(#heartGrad)"
      animate={{ scale: [1, 1.12, 1] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "12px 12px" }}
    />
  </svg>
);

export const AnimatedBrainOrgan = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#6d28d9" />
      </linearGradient>
    </defs>
    <motion.g
      animate={{ opacity: [0.85, 1, 0.85] }}
      transition={{ duration: 2.5, repeat: Infinity }}
    >
      <path d="M12 2C9.5 2 7.5 3.5 7 5.5C5.5 5 4 6 3.5 7.5C3 9 3.5 10.5 5 11.5C4 12.5 4 14 5 15.5C6 17 7.5 17 9 16.5C9 18 10.5 19.5 12 19.5" fill="url(#brainGrad)" opacity="0.85" />
      <path d="M12 2C14.5 2 16.5 3.5 17 5.5C18.5 5 20 6 20.5 7.5C21 9 20.5 10.5 19 11.5C20 12.5 20 14 19 15.5C18 17 16.5 17 15 16.5C15 18 13.5 19.5 12 19.5" fill="url(#brainGrad)" opacity="0.7" />
      {/* Neural pulse */}
      <motion.circle
        cx="12" cy="10" r="1.5"
        fill="white"
        opacity="0.6"
        animate={{ r: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
    </motion.g>
  </svg>
);

export const AnimatedEarOrgan = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="earGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
    </defs>
    <path d="M6 8.5C6 5.46 8.46 3 11.5 3S17 5.46 17 8.5c0 2.5-1.5 4.5-3 6-1 1-1.5 2-1.5 3.5v1c0 1.1-.9 2-2 2s-2-.9-2-2v-1c0-2 .8-3.2 2-4.5 1.2-1.3 2-2.8 2-4.5 0-1.38-1.12-2.5-2.5-2.5S8 7.12 8 8.5" stroke="url(#earGrad)" strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Sound waves */}
    <motion.path
      d="M18 7c1 1.5 1.5 3 1.5 5s-.5 3.5-1.5 5"
      stroke="url(#earGrad)"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.5"
      animate={{ opacity: [0.2, 0.7, 0.2] }}
      transition={{ duration: 1.8, repeat: Infinity }}
    />
  </svg>
);

export const AnimatedEyeOrgan = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="eyeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" fill="url(#eyeGrad)" opacity="0.15" stroke="url(#eyeGrad)" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="3.5" fill="url(#eyeGrad)" opacity="0.9" />
    <motion.circle
      cx="12" cy="12" r="1.5"
      fill="#1e293b"
      animate={{ r: [1.5, 1.8, 1.5] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    {/* Shine */}
    <circle cx="13.2" cy="10.8" r="0.8" fill="white" opacity="0.7" />
  </svg>
);

export const AnimatedHandOrgan = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="handGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
    <motion.g
      animate={{ rotate: [0, 5, -3, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "12px 18px" }}
    >
      <path d="M18 11V6a1 1 0 0 0-2 0v4M14 10V4a1 1 0 0 0-2 0v6M10 10V5a1 1 0 0 0-2 0v5" stroke="url(#handGrad)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 11a4 4 0 0 1 0 4l-2 3a2 2 0 0 1-1.7 1H10a2 2 0 0 1-1.7-1L6 14v-3a1 1 0 0 1 2 0" stroke="url(#handGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="url(#handGrad)" fillOpacity="0.15" />
    </motion.g>
  </svg>
);

export const AnimatedFootOrgan = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="footGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#db2777" />
      </linearGradient>
    </defs>
    <motion.g
      animate={{ y: [0, -1, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d="M12 22c-4 0-7-2-7-5 0-2 1.5-3.5 3-5 1.5-1.5 3-4 3-7 0-1 1-2 2-2s2 1 2 2c0 3 1.5 5.5 3 7 1.5 1.5 3 3 3 5 0 3-3 5-6 5h-1z" fill="url(#footGrad)" fillOpacity="0.85" stroke="url(#footGrad)" strokeWidth="0.5" />
      {/* Toes */}
      <circle cx="8" cy="9" r="1.2" fill="url(#footGrad)" opacity="0.7" />
      <circle cx="10.5" cy="7.5" r="1.3" fill="url(#footGrad)" opacity="0.8" />
      <circle cx="13.5" cy="7.5" r="1.3" fill="url(#footGrad)" opacity="0.8" />
      <circle cx="16" cy="9" r="1.2" fill="url(#footGrad)" opacity="0.7" />
    </motion.g>
  </svg>
);

// ── AI Tab Icons (larger, more detailed) ──

export const AnimatedDevelopmentIcon = ({ className = "w-5 h-5", active = false }: { className?: string; active?: boolean }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className}>
    <defs>
      <linearGradient id="devGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={active ? "#ffffff" : "#8b5cf6"} />
        <stop offset="100%" stopColor={active ? "#e2d4f0" : "#6d28d9"} />
      </linearGradient>
    </defs>
    {/* Stethoscope head */}
    <circle cx="16" cy="20" r="5" stroke="url(#devGrad)" strokeWidth="2.2" fill="none" />
    <circle cx="16" cy="20" r="2" fill="url(#devGrad)" opacity="0.4" />
    {/* Tube */}
    <path d="M11 20c0-6 2-10 5-12" stroke="url(#devGrad)" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M21 20c0-6-2-10-5-12" stroke="url(#devGrad)" strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Ear tips */}
    <circle cx="11" cy="6" r="1.5" fill="url(#devGrad)" />
    <circle cx="21" cy="6" r="1.5" fill="url(#devGrad)" />
    {/* Heartbeat pulse */}
    <motion.circle
      cx="16" cy="20" r="5"
      stroke="url(#devGrad)"
      strokeWidth="1"
      fill="none"
      opacity="0.3"
      animate={{ r: [5, 8, 5], opacity: [0.3, 0, 0.3] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  </svg>
);

export const AnimatedNutritionIcon = ({ className = "w-5 h-5", active = false }: { className?: string; active?: boolean }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className}>
    <defs>
      <linearGradient id="nutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={active ? "#ffffff" : "#10b981"} />
        <stop offset="100%" stopColor={active ? "#bbf7d0" : "#059669"} />
      </linearGradient>
    </defs>
    {/* Apple body */}
    <motion.path
      d="M16 28c-6 0-10-5-10-11 0-5 3-8 6-9 1-.3 2.5-.5 4-.5s3 .2 4 .5c3 1 6 4 6 9 0 6-4 11-10 11z"
      fill="url(#nutGrad)"
      fillOpacity="0.85"
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
      style={{ transformOrigin: "16px 20px" }}
    />
    {/* Stem */}
    <path d="M16 8V5" stroke="url(#nutGrad)" strokeWidth="2" strokeLinecap="round" />
    {/* Leaf */}
    <path d="M16 6c2-2 5-2 6-1" stroke="url(#nutGrad)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Shine */}
    <ellipse cx="12.5" cy="16" rx="1.5" ry="3" fill="white" opacity="0.25" />
  </svg>
);

export const AnimatedExerciseIcon = ({ className = "w-5 h-5", active = false }: { className?: string; active?: boolean }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className}>
    <defs>
      <linearGradient id="exGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={active ? "#ffffff" : "#f59e0b"} />
        <stop offset="100%" stopColor={active ? "#fef3c7" : "#d97706"} />
      </linearGradient>
    </defs>
    {/* Person doing yoga/stretch — simplified lotus pose */}
    <motion.g
      animate={{ y: [0, -1, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Head */}
      <circle cx="16" cy="8" r="3" fill="url(#exGrad)" />
      {/* Body */}
      <path d="M16 11v7" stroke="url(#exGrad)" strokeWidth="2.2" strokeLinecap="round" />
      {/* Arms reaching up */}
      <path d="M16 14c-3-1-5 0-7-3" stroke="url(#exGrad)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M16 14c3-1 5 0 7-3" stroke="url(#exGrad)" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Legs crossed (lotus) */}
      <path d="M16 18c-2 1-5 3-8 3" stroke="url(#exGrad)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M16 18c2 1 5 3 8 3" stroke="url(#exGrad)" strokeWidth="2" strokeLinecap="round" fill="none" />
    </motion.g>
    {/* Zen circles */}
    <motion.circle
      cx="16" cy="16" r="14"
      stroke="url(#exGrad)"
      strokeWidth="0.8"
      fill="none"
      opacity="0.2"
      animate={{ r: [13, 15, 13], opacity: [0.2, 0.05, 0.2] }}
      transition={{ duration: 4, repeat: Infinity }}
    />
  </svg>
);

// ── Baby Visualization Icon (premium, animated) ──

export const AnimatedBabyIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className}>
    <defs>
      <radialGradient id="babyGlow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
      </radialGradient>
      <linearGradient id="babyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--primary))" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    {/* Glow background */}
    <circle cx="24" cy="24" r="22" fill="url(#babyGlow)" />
    {/* Curled baby silhouette */}
    <motion.g
      animate={{ y: [0, -1.5, 0], rotate: [0, 1, -1, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "24px 24px" }}
    >
      {/* Head */}
      <circle cx="24" cy="15" r="7" fill="url(#babyGrad)" opacity="0.8" />
      {/* Face features */}
      <ellipse cx="22" cy="14.5" rx="0.8" ry="0.5" fill="white" opacity="0.5" />
      <ellipse cx="26" cy="14.5" rx="0.8" ry="0.5" fill="white" opacity="0.5" />
      <path d="M23 16.5c0.5 0.5 1.5 0.5 2 0" stroke="white" strokeWidth="0.6" strokeLinecap="round" opacity="0.4" fill="none" />
      {/* Body curled */}
      <path d="M20 20c-3 2-5 6-4 10 1 4 5 6 8 5 3-1 5-4 6-7 1-3 0-6-2-8" fill="url(#babyGrad)" opacity="0.6" />
      {/* Arm */}
      <path d="M19 22c-1 2-1 4 0 5" stroke="url(#babyGrad)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* Leg */}
      <path d="M26 28c1 2 2 4 1 5" stroke="url(#babyGrad)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
    </motion.g>
    {/* Heartbeat indicator */}
    <motion.circle
      cx="24" cy="24"
      r="20"
      stroke="url(#babyGrad)"
      strokeWidth="0.8"
      fill="none"
      animate={{ r: [20, 23, 20], opacity: [0.3, 0, 0.3] }}
      transition={{ duration: 2.5, repeat: Infinity }}
    />
  </svg>
);

// ── Organ Icon Map ──

export const organIconMap: Record<string, React.ReactNode> = {
  heart: <AnimatedHeartOrgan />,
  brain: <AnimatedBrainOrgan />,
  ears: <AnimatedEarOrgan />,
  eyes: <AnimatedEyeOrgan />,
  hands: <AnimatedHandOrgan />,
  feet: <AnimatedFootOrgan />,
};
