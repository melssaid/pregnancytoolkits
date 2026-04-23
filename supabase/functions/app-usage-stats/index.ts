import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ToolRow = {
  tool_id: string;
  session_id: string;
  action_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const APP_PLATFORM_RE = /wv|android.*version\//i;
const APP_HOST_RE = /(android|app|twa|webview)/i;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isAppSession(row: ToolRow) {
  const platform = typeof row.metadata?.platform === "string" ? row.metadata.platform : "";
  const host = typeof row.metadata?.host === "string" ? row.metadata.host : "";
  return APP_PLATFORM_RE.test(platform) || APP_HOST_RE.test(host);
}

function bucketOf(row: ToolRow): "app" | "web" {
  return isAppSession(row) ? "app" : "web";
}

function extractLang(row: ToolRow) {
  const raw = typeof row.metadata?.lang === "string" ? row.metadata.lang : "unknown";
  return raw.slice(0, 5);
}

function extractDuration(row: ToolRow) {
  const raw = row.metadata?.duration_seconds;
  if (typeof raw === "number") return raw;
  if (typeof raw === "string" && /^\d+$/.test(raw)) return Number(raw);
  return null;
}

function normalizePath(toolId: string) {
  if (toolId === "_home") return "/";
  if (toolId.startsWith("tools_")) return `/tools/${toolId.replace(/^tools_/, "").replace(/_/g, "-")}`;
  if (toolId.startsWith("articles_")) return `/articles/${toolId.replace(/^articles_/, "").replace(/_/g, "-")}`;
  return `/${toolId.replace(/_/g, "-")}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const url = new URL(req.url);
    const hours = Math.min(Math.max(Number(url.searchParams.get("hours") || 48), 1), 168);
    const liveMinutes = Math.min(Math.max(Number(url.searchParams.get("liveMinutes") || 5), 1), 30);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      authHeader ? { global: { headers: { Authorization: authHeader } } } : undefined,
    );

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const now = new Date();
    const from = new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
    const liveFrom = new Date(now.getTime() - liveMinutes * 60 * 1000).toISOString();

    const { data, error } = await adminClient
      .from("tool_analytics")
      .select("tool_id, session_id, action_type, metadata, created_at")
      .gte("created_at", from)
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error) throw error;

    const rows = (data || []) as ToolRow[];
    const rowsByBucket = {
      app: rows.filter((row) => bucketOf(row) === "app"),
      web: rows.filter((row) => bucketOf(row) === "web"),
    };

    const summarize = (subset: ToolRow[]) => {
      const sessionStarts = subset.filter((row) => row.action_type === "session_start");
      const pageViews = subset.filter((row) => row.action_type === "page_view" || row.action_type === "view");
      const toolViews = subset.filter((row) => row.action_type === "tool_view");
      const liveSessions = new Set(
        subset
          .filter((row) => row.created_at >= liveFrom && ["session_start", "heartbeat", "page_view", "tool_view", "view"].includes(row.action_type))
          .map((row) => row.session_id),
      ).size;

      const topPages = Object.entries(
        pageViews.reduce<Record<string, number>>((acc, row) => {
          acc[row.tool_id] = (acc[row.tool_id] || 0) + 1;
          return acc;
        }, {}),
      )
        .map(([tool_id, views]) => ({ tool_id, path: normalizePath(tool_id), views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 12);

      const byHourMap = subset.reduce<Record<string, { hour: string; views: number; sessions: Set<string> }>>((acc, row) => {
        const date = new Date(row.created_at);
        const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")} ${String(date.getUTCHours()).padStart(2, "0")}:00`;
        if (!acc[key]) acc[key] = { hour: key, views: 0, sessions: new Set() };
        if (["page_view", "tool_view", "view"].includes(row.action_type)) acc[key].views += 1;
        acc[key].sessions.add(row.session_id);
        return acc;
      }, {});

      const hourly = Object.values(byHourMap)
        .sort((a, b) => a.hour.localeCompare(b.hour))
        .map((entry) => ({ hour: entry.hour, views: entry.views, sessions: entry.sessions.size }));

      const languages = Object.entries(
        sessionStarts.reduce<Record<string, number>>((acc, row) => {
          const lang = extractLang(row);
          acc[lang] = (acc[lang] || 0) + 1;
          return acc;
        }, {}),
      )
        .map(([lang, count]) => ({ lang, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const avgDurationSeconds = (() => {
        const durations = subset
          .filter((row) => row.action_type === "session_end")
          .map(extractDuration)
          .filter((value): value is number => value !== null && value > 0);
        if (!durations.length) return null;
        return Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length);
      })();

      return {
        totalEvents: subset.length,
        totalViews: pageViews.length + toolViews.length,
        pageViews: pageViews.length,
        toolViews: toolViews.length,
        uniqueSessions: new Set(subset.map((row) => row.session_id)).size,
        sessionStarts: sessionStarts.length,
        liveSessions,
        avgDurationSeconds,
        topPages,
        hourly,
        languages,
      };
    };

    return json({
      generatedAt: now.toISOString(),
      rangeHours: hours,
      liveWindowMinutes: liveMinutes,
      app: summarize(rowsByBucket.app),
      web: summarize(rowsByBucket.web),
      combined: summarize(rows),
    });
  } catch (error) {
    console.error("[app-usage-stats]", error);
    return json({ error: "Failed to fetch analytics" }, 500);
  }
});