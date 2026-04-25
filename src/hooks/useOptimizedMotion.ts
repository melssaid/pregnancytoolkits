import { useMemo } from "react";
import { useReducedMotion, type Transition, type Variants } from "framer-motion";

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
 *   <motion.circle {...m.draw(value)} />
 */

interface OptimizedMotion {
  /** True when animations should be disabled / instant. */
  disabled: boolean;
  /** True for low-end devices (shorter, simpler animations). */
  lowEnd: boolean;
  /** Standard tween used everywhere. */
  transition: Transition;
  /** Fade + slight upward translate. Index applies a tiny stagger. */
  fadeUp: (index?: number) => {
    initial: Variants["initial"];
    animate: Variants["animate"];
    transition: Transition;
  };
  /** Plain fade. */
  fadeIn: {
    initial: Variants["initial"];
    animate: Variants["animate"];
    transition: Transition;
  };
  /** Horizontal slide-in (used for timelines). */
  slideIn: (index?: number) => {
    initial: Variants["initial"];
    animate: Variants["animate"];
    transition: Transition;
  };
  /** Spring pop used for score numbers. */
  pop: {
    initial: Variants["initial"];
    animate: Variants["animate"];
    transition: Transition;
  };
  /** SVG stroke-dashoffset / width tween for ring + bar progress. */
  draw: (to: number | string, fromKey?: "strokeDashoffset" | "width") => {
    initial: Record<string, number | string>;
    animate: Record<string, number | string>;
    transition: Transition;
  };
}

function detectLowEnd(): boolean {
  if (typeof navigator === "undefined") return false;
  // deviceMemory is in GB. Treat <= 2 GB as low-end.
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof mem === "number" && mem <= 2) return true;
  // hardwareConcurrency: cores. <= 4 is low-end on mobile.
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

    // Tween durations — short on low-end, normal otherwise. Disabled => instant.
    const D = disabled ? 0 : lowEnd ? 0.18 : 0.28;
    const longD = disabled ? 0 : lowEnd ? 0.6 : 1.2; // for ring draws
    const stagger = disabled || lowEnd ? 0 : 0.04;

    const baseTransition: Transition = {
      duration: D,
      ease: [0.22, 1, 0.36, 1],
    };

    return {
      disabled,
      lowEnd,
      transition: baseTransition,

      fadeUp: (index = 0) => ({
        initial: disabled ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        transition: { ...baseTransition, delay: stagger * index },
      }),

      fadeIn: {
        initial: disabled ? { opacity: 1 } : { opacity: 0 },
        animate: { opacity: 1 },
        transition: baseTransition,
      },

      slideIn: (index = 0) => ({
        initial: disabled ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 },
        animate: { opacity: 1, x: 0 },
        transition: { ...baseTransition, delay: stagger * index * 1.5 },
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

      draw: (to, fromKey = "strokeDashoffset") => {
        return {
          initial: { [fromKey]: fromKey === "width" ? (disabled ? to : "0%") : (disabled ? to : 0) },
          animate: { [fromKey]: to },
          transition: { duration: longD, ease: "easeOut" },
        };
      },
    };
  }, [reduced]);
}
