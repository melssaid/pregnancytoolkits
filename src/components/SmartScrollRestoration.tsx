import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { incrementNavDepth } from "@/components/BackButton";

/**
 * Single source of truth for scroll management + navigation depth tracking.
 */
export function SmartScrollRestoration() {
  useScrollRestoration();

  const location = useLocation();
  const navType = useNavigationType();
  const isFirst = useRef(true);

  useEffect(() => {
    // Skip the initial mount (not a real navigation)
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    // Only count PUSH navigations (user clicking links/navigating forward)
    if (navType === "PUSH") {
      incrementNavDepth();
    }
  }, [location.pathname, navType]);

  return null;
}
