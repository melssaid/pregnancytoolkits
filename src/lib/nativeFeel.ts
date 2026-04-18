/**
 * Native App Feel — runtime tricks
 * Adds tactile + native-like behaviors that CSS can't do alone.
 */

import { haptic } from "./haptics";

let initialized = false;

export function initNativeFeel() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // ── 1. Haptic feedback on every tap of buttons/links ──
  document.addEventListener(
    "pointerdown",
    (e) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const tappable = target.closest(
        'button, a, [role="button"], [data-haptic]'
      );
      if (tappable && !tappable.hasAttribute("data-no-haptic")) {
        haptic("tick");
      }
    },
    { passive: true }
  );

  // ── 2. Prevent double-tap zoom on iOS Safari ──
  let lastTouch = 0;
  document.addEventListener(
    "touchend",
    (e) => {
      const now = Date.now();
      if (now - lastTouch <= 300) e.preventDefault();
      lastTouch = now;
    },
    { passive: false }
  );

  // ── 3. Block context menu (long-press menu) globally ──
  document.addEventListener("contextmenu", (e) => {
    const target = e.target as HTMLElement;
    // Allow on inputs/textareas
    if (target.matches('input, textarea, [contenteditable="true"], .selectable, .selectable *')) return;
    e.preventDefault();
  });

  // ── 4. Block pinch-zoom gestures (iOS) ──
  document.addEventListener("gesturestart", (e) => e.preventDefault());
  document.addEventListener("gesturechange", (e) => e.preventDefault());

  // ── 5. Dynamic theme-color: match header (rose) instead of black ──
  const setThemeColor = (color: string) => {
    let meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", color);
  };
  // Rose primary (hsl(340 65% 52%) ≈ #d4608a)
  setThemeColor("#d4608a");
}
