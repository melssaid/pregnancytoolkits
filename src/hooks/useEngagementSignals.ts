import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const SESSION_KEY = "pt_session_id";
const SESSION_START_KEY = "pt_session_start";

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
    sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
  }
  return id;
}

/**
 * Tracks session duration and page views for Play Console vitals.
 * Logs to tool_analytics table for engagement monitoring.
 */
export function useEngagementSignals() {
  const location = useLocation();
  const sessionId = useRef(getOrCreateSessionId());
  const lastPath = useRef("");

  // Track page views
  useEffect(() => {
    const path = location.pathname;
    if (path === lastPath.current) return;
    lastPath.current = path;

    // Track tool visits
    if (path.startsWith("/tools/")) {
      const toolId = path.replace("/tools/", "");
      logEvent(sessionId.current, toolId, "tool_view");

      // Increment tools used counter for install prompt
      const key = "pt_tools_used_count";
      const count = parseInt(localStorage.getItem(key) || "0") + 1;
      localStorage.setItem(key, count.toString());
    }
  }, [location.pathname]);

  // Track session duration on unload
  useEffect(() => {
    const handleUnload = () => {
      const start = parseInt(sessionStorage.getItem(SESSION_START_KEY) || "0");
      if (!start) return;
      const duration = Math.round((Date.now() - start) / 1000);
      if (duration < 3) return; // Ignore bounces

      // Use sendBeacon for reliable delivery
      const payload = JSON.stringify({
        session_id: sessionId.current,
        tool_id: "_session",
        action_type: "session_end",
        metadata: { duration_seconds: duration, pages_viewed: lastPath.current },
      });

      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/tool_analytics`;
      navigator.sendBeacon?.(url + `?apikey=${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`, 
        new Blob([payload], { type: "application/json" })
      );
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);
}

async function logEvent(sessionId: string, toolId: string, actionType: string, metadata?: Record<string, unknown>) {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("tool_analytics").insert({
      session_id: sessionId,
      tool_id: toolId,
      action_type: actionType,
      metadata: metadata || null,
    });
  } catch {
    // Silent fail — analytics are non-critical
  }
}
