/**
 * Fetal Development Icons — using Phosphor Icons (duotone/fill)
 * for clear, professional, instantly recognizable organ icons.
 */
import {
  Heartbeat,
  Brain,
  Ear,
  Eye,
  HandPalm,
  Footprints,
  Stethoscope,
  Leaf,
  PersonSimpleRun,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';

// ── Organ Icons (for badges) ──

export const OrganHeart = () => (
  <motion.span
    animate={{ scale: [1, 1.15, 1] }}
    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
    className="inline-flex"
  >
    <Heartbeat size={16} weight="duotone" className="text-rose-500" />
  </motion.span>
);

export const OrganBrain = () => (
  <Brain size={16} weight="duotone" className="text-violet-500" />
);

export const OrganEar = () => (
  <Ear size={16} weight="duotone" className="text-cyan-500" />
);

export const OrganEye = () => (
  <Eye size={16} weight="duotone" className="text-blue-500" />
);

export const OrganHand = () => (
  <HandPalm size={16} weight="duotone" className="text-amber-500" />
);

export const OrganFoot = () => (
  <Footprints size={16} weight="duotone" className="text-pink-500" />
);

// ── Organ Icon Map ──
export const organIconMap: Record<string, React.ReactNode> = {
  heart: <OrganHeart />,
  brain: <OrganBrain />,
  ears: <OrganEar />,
  eyes: <OrganEye />,
  hands: <OrganHand />,
  feet: <OrganFoot />,
};

// ── AI Tab Icons ──

export const AnimatedDevelopmentIcon = ({ className = "w-5 h-5", active = false }: { className?: string; active?: boolean }) => (
  <Stethoscope size={20} weight="duotone" className={active ? 'text-white' : 'text-violet-500'} />
);

export const AnimatedNutritionIcon = ({ className = "w-5 h-5", active = false }: { className?: string; active?: boolean }) => (
  <Leaf size={20} weight="duotone" className={active ? 'text-white' : 'text-emerald-500'} />
);

export const AnimatedExerciseIcon = ({ className = "w-5 h-5", active = false }: { className?: string; active?: boolean }) => (
  <PersonSimpleRun size={20} weight="duotone" className={active ? 'text-white' : 'text-amber-500'} />
);

// ── Baby Visualization Icon ──

export const AnimatedBabyIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <motion.div
    className={`${className} flex items-center justify-center`}
    animate={{ scale: [1, 1.05, 1] }}
    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
  >
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <defs>
        <radialGradient id="babyGlow2" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.03" />
        </radialGradient>
        <linearGradient id="babyGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill="url(#babyGlow2)" />
      <motion.g
        animate={{ y: [0, -1.5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Head */}
        <circle cx="24" cy="15" r="7" fill="url(#babyGrad2)" opacity="0.8" />
        <ellipse cx="22" cy="14.5" rx="0.8" ry="0.5" fill="white" opacity="0.5" />
        <ellipse cx="26" cy="14.5" rx="0.8" ry="0.5" fill="white" opacity="0.5" />
        <path d="M23 16.5c.5.5 1.5.5 2 0" stroke="white" strokeWidth="0.6" strokeLinecap="round" opacity="0.4" fill="none" />
        {/* Body */}
        <path d="M20 20c-3 2-5 6-4 10 1 4 5 6 8 5 3-1 5-4 6-7 1-3 0-6-2-8" fill="url(#babyGrad2)" opacity="0.6" />
        <path d="M19 22c-1 2-1 4 0 5" stroke="url(#babyGrad2)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M26 28c1 2 2 4 1 5" stroke="url(#babyGrad2)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      </motion.g>
      <motion.circle
        cx="24" cy="24" r="20"
        stroke="url(#babyGrad2)" strokeWidth="0.8" fill="none"
        animate={{ r: [20, 23, 20], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
    </svg>
  </motion.div>
);

// Re-export for backward compat
export const AnimatedBrainOrgan = OrganBrain;
