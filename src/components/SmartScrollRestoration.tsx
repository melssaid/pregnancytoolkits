import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { handleNavigationAction } from "@/lib/navigationTracker";

/**
 * Single source of truth for scroll management + navigation depth tracking.
 */
export function SmartScrollRestoration() {
  useScrollRestoration();

  const location = useLocation();
  const navType = useNavigationType();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    // Track ALL navigation types (PUSH, POP, REPLACE) for accurate depth
    handleNavigationAction(navType);
  }, [location.key, navType]);

  return null;
}
