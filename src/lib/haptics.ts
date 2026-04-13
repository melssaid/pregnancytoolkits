/**
 * Unified Haptic Feedback Engine
 * Professional vibration patterns for native-like feel
 */

type HapticPattern = 'tap' | 'success' | 'warning' | 'error' | 'celebration' | 'tick' | 'heavy';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  tick: 5,
  success: [20, 15, 40],
  warning: [40, 25, 60],
  error: [60, 30, 80, 30, 60],
  celebration: [25, 15, 35, 15, 50, 15, 25],
  heavy: 50,
};

let enabled = true;

// Check user preference
try {
  const pref = localStorage.getItem('pt_haptics_enabled');
  if (pref === 'false') enabled = false;
} catch {}

export function haptic(pattern: HapticPattern = 'tap') {
  if (!enabled) return;
  try {
    if (navigator.vibrate) {
      navigator.vibrate(PATTERNS[pattern] || PATTERNS.tap);
    }
  } catch {}
}

export function setHapticsEnabled(value: boolean) {
  enabled = value;
  try { localStorage.setItem('pt_haptics_enabled', String(value)); } catch {}
}

export function isHapticsEnabled(): boolean {
  return enabled;
}
