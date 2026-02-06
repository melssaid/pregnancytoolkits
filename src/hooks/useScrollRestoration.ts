import { useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const SCROLL_POSITIONS_KEY = "scrollPositions";
const MAX_STORED_POSITIONS = 50;
const SCROLL_DEBOUNCE_MS = 100;
const RESTORE_DELAY_MS = 280; // Must exceed exit animation (80ms) + enter animation (150ms) + buffer

interface ScrollPositions {
  [key: string]: number;
}

const getScrollPositions = (): ScrollPositions => {
  try {
    const stored = sessionStorage.getItem(SCROLL_POSITIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveScrollPositions = (positions: ScrollPositions) => {
  try {
    const keys = Object.keys(positions);
    if (keys.length > MAX_STORED_POSITIONS) {
      const trimmed: ScrollPositions = {};
      keys.slice(-MAX_STORED_POSITIONS).forEach((key) => {
        trimmed[key] = positions[key];
      });
      sessionStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(trimmed));
    } else {
      sessionStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(positions));
    }
  } catch {
    // Ignore storage errors
  }
};

export function useScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentKeyRef = useRef(location.pathname + location.search);

  // Update current key ref
  useEffect(() => {
    currentKeyRef.current = location.pathname + location.search;
  }, [location.pathname, location.search]);

  // Save current scroll position (debounced on scroll, immediate on navigation)
  const saveCurrentPosition = useCallback(() => {
    const positions = getScrollPositions();
    positions[currentKeyRef.current] = window.scrollY;
    saveScrollPositions(positions);
  }, []);

  // Continuously save scroll position on scroll (debounced)
  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
      scrollTimerRef.current = setTimeout(() => {
        saveCurrentPosition();
      }, SCROLL_DEBOUNCE_MS);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeunload", saveCurrentPosition);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", saveCurrentPosition);
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, [saveCurrentPosition]);

  // Handle scroll restoration on navigation
  useEffect(() => {
    const key = location.pathname + location.search;

    if (navigationType === "POP") {
      // POP navigation (back/forward) → restore saved position
      const positions = getScrollPositions();
      const savedPosition = positions[key];

      if (savedPosition !== undefined && savedPosition > 0) {
        // Wait for AnimatePresence exit + enter animations to complete before restoring
        const timer = setTimeout(() => {
          const tryRestore = (attempts = 0) => {
            requestAnimationFrame(() => {
              // Check if the page is tall enough to scroll to the saved position
              const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
              if (maxScroll >= savedPosition || attempts >= 5) {
                window.scrollTo({ top: savedPosition, left: 0, behavior: "instant" });
              } else {
                // Page not ready yet, retry after a short delay
                setTimeout(() => tryRestore(attempts + 1), 50);
              }
            });
          };
          tryRestore();
        }, RESTORE_DELAY_MS);
        return () => clearTimeout(timer);
      }
    } else {
      // PUSH/REPLACE navigation → scroll to top immediately
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      });
    }
  }, [location.pathname, location.search, navigationType]);

  // Save position when leaving current route (cleanup)
  useEffect(() => {
    return () => {
      saveCurrentPosition();
    };
  }, [location.pathname, saveCurrentPosition]);

  return { saveCurrentPosition };
}
