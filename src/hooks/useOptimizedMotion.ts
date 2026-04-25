import { useMemo } from "react";
import { useReducedMotion, type Transition, type TargetAndTransition } from "framer-motion";

/**
 * Centralized motion preset for dashboard cards.
 *
 * Goals (low-end device friendly):
 *  - Respect prefers-reduced-motion (instant, no transform/opacity churn).
 *  - Detect low-end devices via deviceMemory / hardwareConcurrency and shorten / strip animations.
 *  - Use only GPU-cheap properties (opacity + translate + scale) — never width/height/left/top.
 *  - Provide a single shared spring/tween config so the compositor can batch frames.
 *
 * Usage:
 *   const m = useOptimizedMotion();
 *   <motion.div {...m.fadeUp(index)} />
 *   <motion.div {...m.fadeIn} />
 *   <motion.span {...m.pop} />
 *   <motion.circle ... transition={m.longTransition} />
 */

interface MotionPreset {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  transition: Transition;
}

interface OptimizedMotion {
  /** True when animations should be disabled / instant. */
  disabled: boolean;
  /** True for low-end devices (shorter, simpler animations). */
  lowEnd: boolean;
  /** Standard short tween (entry animations). */
  transition: Transition;
  /** Longer tween for ring/bar draws (~600–1200ms). */
  longTransition: Transition;
  /** Fade + slight upward translate. Index applies a tiny stagger. */
  fadeUp: (index?: number) => MotionPreset;
  /** Plain fade. */
  fadeIn: MotionPreset;
  /** Horizontal slide-in (used for timelines). */
  slideIn: (index?: number) => MotionPreset;
  /** Spring pop used for score numbers. */
  pop: MotionPreset;
}

function detectLowEnd(): boolean {
  if (typeof navigator === "undefined") return false;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof mem === "number" && mem <= 2) return true;
  if (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4) {
    return true;
  }
  return false;
}

export function useOptimizedMotion(): OptimizedMotion {
  const reduced = useReducedMotion();

  return useMemo(() => {
    const lowEnd = detectLowEnd();
    const disabled = !!reduced;

    const D = disabled ? 0 : lowEnd ? 0.18 : 0.28;
    const longD = disabled ? 0 : lowEnd ? 0.6 : 1.2;
    const stagger = disabled || lowEnd ? 0 : 0.04;

    const transition: Transition = { duration: D, ease: [0.22, 1, 0.36, 1] };
    const longTransition: Transition = { duration: longD, ease: [0.22, 1, 0.36, 1] };

    return {
      disabled,
      lowEnd,
      transition,
      longTransition,

      fadeUp: (index = 0) => ({
        initial: disabled ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        transition: { ...transition, delay: stagger * index },
      }),

      fadeIn: {
        initial: disabled ? { opacity: 1 } : { opacity: 0 },
        animate: { opacity: 1 },
        transition,
      },

      slideIn: (index = 0) => ({
        initial: disabled ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 },
        animate: { opacity: 1, x: 0 },
        transition: { ...transition, delay: stagger * index * 1.5 },
      }),

      pop: {
        initial: disabled ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: disabled
          ? { duration: 0 }
          : lowEnd
          ? { duration: 0.25, ease: "easeOut" }
          : { type: "spring", stiffness: 220, damping: 18, delay: 0.15 },
      },
    };
  }, [reduced]);
}
