/**
 * Reliable in-app navigation depth tracker.
 * Tracks PUSH/REPLACE/POP actions to maintain an accurate depth count,
 * immune to iframe/sandbox quirks with window.history.length.
 */

let navDepth = 0;

export function getNavDepth(): number {
  return navDepth;
}

export function handleNavigationAction(action: "PUSH" | "REPLACE" | "POP") {
  if (action === "PUSH") {
    navDepth++;
  } else if (action === "POP") {
    navDepth = Math.max(0, navDepth - 1);
  }
  // REPLACE doesn't change depth
}
