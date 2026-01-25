import { useEffect, useCallback } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const SCROLL_POSITIONS_KEY = "scrollPositions";
const MAX_STORED_POSITIONS = 50;

interface ScrollPositions {
  [key: string]: number;
}

// Get scroll positions from sessionStorage
const getScrollPositions = (): ScrollPositions => {
  try {
    const stored = sessionStorage.getItem(SCROLL_POSITIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Save scroll positions to sessionStorage
const saveScrollPositions = (positions: ScrollPositions) => {
  try {
    // Limit stored positions to prevent memory issues
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

  // Save current scroll position before navigation
  const saveCurrentPosition = useCallback(() => {
    const positions = getScrollPositions();
    positions[location.pathname + location.search] = window.scrollY;
    saveScrollPositions(positions);
  }, [location.pathname, location.search]);

  // Save position on scroll (debounced via beforeunload and navigation)
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveCurrentPosition();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveCurrentPosition]);

  // Handle scroll restoration on navigation
  useEffect(() => {
    const key = location.pathname + location.search;
    
    // On POP navigation (back/forward button), restore scroll position
    if (navigationType === "POP") {
      const positions = getScrollPositions();
      const savedPosition = positions[key];
      
      if (savedPosition !== undefined) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          window.scrollTo({
            top: savedPosition,
            left: 0,
            behavior: "instant",
          });
        });
      }
    } else {
      // On PUSH navigation (clicking links), scroll to top
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [location.pathname, location.search, navigationType]);

  // Save position when leaving current route
  useEffect(() => {
    return () => {
      saveCurrentPosition();
    };
  }, [location.pathname, saveCurrentPosition]);

  return { saveCurrentPosition };
}
