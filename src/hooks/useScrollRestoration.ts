import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const STORAGE_KEY = "scroll_positions";

function readPositions(): Record<string, number> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writePosition(key: string, y: number) {
  try {
    const map = readPositions();
    map[key] = y;
    // Keep only last 30 routes to avoid bloat
    const keys = Object.keys(map);
    if (keys.length > 30) {
      const trimmed: Record<string, number> = {};
      keys.slice(-30).forEach((k) => (trimmed[k] = map[k]));
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    }
  } catch {
    // ignore
  }
}

export function useScrollRestoration() {
  const location = useLocation();
  const navType = useNavigationType();
  const prevKeyRef = useRef<string>(location.pathname + location.search);
  const scrollSavedRef = useRef(false);

  // Save scroll position just before navigating away (on pathname change,
  // capture the OLD position using the previous key)
  useEffect(() => {
    const currentKey = location.pathname + location.search;

    // Same key — skip (e.g. hash-only change or re-render)
    if (currentKey === prevKeyRef.current) return;

    if (navType !== "POP") {
      // PUSH / REPLACE: save the ACTUAL scroll of the outgoing page, then go to top
      writePosition(prevKeyRef.current, window.scrollY);
      // Use rAF to ensure DOM has settled before scrolling
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      });
    } else {
      // POP (back / forward): restore saved position
      const savedY = readPositions()[currentKey] ?? 0;

      if (savedY > 0) {
        // Wait for lazy-load + animations to settle
        const timer = setTimeout(() => {
          const tryScroll = (attempts = 0) => {
            requestAnimationFrame(() => {
              const maxScroll =
                document.documentElement.scrollHeight - window.innerHeight;
              if (maxScroll >= savedY || attempts >= 8) {
                window.scrollTo({ top: savedY, left: 0, behavior: "instant" });
              } else {
                setTimeout(() => tryScroll(attempts + 1), 40);
              }
            });
          };
          tryScroll();
        }, 260);
        return () => clearTimeout(timer);
      }
    }

    prevKeyRef.current = currentKey;
    scrollSavedRef.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  // Continuously save scroll position while user scrolls (debounced)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const key = location.pathname + location.search;

    const onScroll = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        writePosition(key, window.scrollY);
      }, 80);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // Also save on page hide (tab switch / close)
    const onHide = () => writePosition(key, window.scrollY);
    window.addEventListener("pagehide", onHide);
    window.addEventListener("beforeunload", onHide);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("beforeunload", onHide);
      if (timer) clearTimeout(timer);
      // Save immediately on unmount
      writePosition(key, window.scrollY);
    };
  }, [location.pathname, location.search]);
}
