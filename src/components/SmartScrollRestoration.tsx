import { useScrollRestoration } from "@/hooks/useScrollRestoration";

/**
 * Single source of truth for scroll management.
 * - PUSH navigation  → scrolls to top instantly
 * - POP  navigation  → restores saved scroll position (after page-transition animations)
 * - Continuous scroll events are debounced and saved to sessionStorage
 */
export function SmartScrollRestoration() {
  useScrollRestoration();
  return null;
}
