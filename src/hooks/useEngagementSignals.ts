import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "pt_session_id";
const SESSION_START_KEY = "pt_session_start";
const SESSION_LAST_PING_KEY = "pt_session_last_ping";

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
    sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
  }
  return id;
}

// Sanitize a path into a valid tool_id matching RLS regex ^[a-z0-9_-]{2,50}$
function pathToToolId(path: string): string {
  if (path === "/" || path === "") return "_home";
  const cleaned = path
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-z0-9_-]+/g, "_")
    .slice(0, 50);
  return cleaned.length >= 2 ? cleaned : "_home";
}

async function logEvent(
  sessionId: string,
  toolId: string,
  actionType: string,
  metadata?: Record<string, string | number>
) {
  try {
    await supabase.from("tool_analytics").insert([
      {
        session_id: sessionId.slice(0, 100),
        tool_id: toolId,
        action_type: actionType,
        metadata: metadata || null,
      },
    ]);
  } catch {
    // Silent fail — analytics are non-critical
  }
}

/**
 * Tracks session duration and page views for Play Console vitals.
 * Logs to tool_analytics table for engagement monitoring.
 *
 * Optimized for Android TWA where `beforeunload` rarely fires:
 * - Tracks ALL page views (not just /tools/*)
 * - Uses visibilitychange (reliable in TWA) instead of beforeunload
 * - Sends 30s heartbeat to confirm active sessions
 */
export function useEngagementSignals() {
  const location = useLocation();
  const sessionId = useRef(getOrCreateSessionId());
  const lastPath = useRef("");
  const sessionStartLogged = useRef(false);

  // Log session_start once per session
  useEffect(() => {
    if (sessionStartLogged.current) return;
    sessionStartLogged.current = true;
    const isReturning = !!sessionStorage.getItem(SESSION_KEY);
    logEvent(sessionId.current, "_session", "session_start", {
      platform: /wv|Android.*Version\//i.test(navigator.userAgent) ? "twa" : "web",
      lang: navigator.language?.slice(0, 5) || "unknown",
      returning: isReturning ? 1 : 0,
    });
  }, []);

  // Track ALL page views (not just /tools/*)
  useEffect(() => {
    const path = location.pathname;
    if (path === lastPath.current) return;
    lastPath.current = path;

    const toolId = pathToToolId(path);
    const isToolPage = path.startsWith("/tools/");
    logEvent(sessionId.current, toolId, isToolPage ? "tool_view" : "page_view");

    // Increment tools used counter for install prompt
    if (isToolPage) {
      const key = "pt_tools_used_count";
      const count = parseInt(localStorage.getItem(key) || "0") + 1;
      localStorage.setItem(key, count.toString());
    }
  }, [location.pathname]);

  // Heartbeat: confirm session is still alive every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      // Only ping if tab is visible AND we haven't pinged in last 25s
      if (document.visibilityState !== "visible") return;
      const last = parseInt(sessionStorage.getItem(SESSION_LAST_PING_KEY) || "0");
      if (Date.now() - last < 25_000) return;
      sessionStorage.setItem(SESSION_LAST_PING_KEY, Date.now().toString());

      const start = parseInt(sessionStorage.getItem(SESSION_START_KEY) || "0");
      const duration = start ? Math.round((Date.now() - start) / 1000) : 0;
      logEvent(sessionId.current, "_session", "heartbeat", {
        duration_seconds: duration,
      });
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  // Session end: use visibilitychange (works in Android TWA) + pagehide as fallback
  useEffect(() => {
    const sendSessionEnd = () => {
      const start = parseInt(sessionStorage.getItem(SESSION_START_KEY) || "0");
      if (!start) return;
      const duration = Math.round((Date.now() - start) / 1000);
      if (duration < 3) return; // Ignore bounces

      // Try sendBeacon for reliable delivery (works during page unload)
      try {
        const payload = JSON.stringify({
          session_id: sessionId.current.slice(0, 100),
          tool_id: "_session",
          action_type: "session_end",
          metadata: { duration_seconds: duration, last_path: pathToToolId(lastPath.current) },
        });
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/tool_analytics`;
        const blob = new Blob([payload], { type: "application/json" });
        const sent = navigator.sendBeacon?.(
          `${url}?apikey=${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          blob
        );
        // Fallback: regular insert if beacon fails
        if (!sent) {
          logEvent(sessionId.current, "_session", "session_end", {
            duration_seconds: duration,
          });
        }
      } catch {
        // Silent fail
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        sendSessionEnd();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", sendSessionEnd);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", sendSessionEnd);
    };
  }, []);
}
