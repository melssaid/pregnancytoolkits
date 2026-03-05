// Edge function to query AI usage statistics (admin-only)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Hardcoded admin user IDs — only these users can access stats
const ADMIN_USER_IDS: string[] = [
  // Add your admin user IDs here
];

function jsonError(msg: string, status: number): Response {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonError("Unauthorized", 401);
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");

    // Verify the user via getUser() (correct supabase-js v2 method)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user?.id) {
      return jsonError("Unauthorized - valid session required", 401);
    }

    const userId = user.id;

    // Admin role check
    if (ADMIN_USER_IDS.length > 0 && !ADMIN_USER_IDS.includes(userId)) {
      return jsonError("Forbidden - admin access required", 403);
    }

    // Use service_role to bypass RLS
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

    // Fetch all logs for this month (max 1000)
    const { data: monthLogs, error } = await adminClient
      .from("ai_usage_logs")
      .select("*")
      .gte("created_at", monthStart)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) throw error;

    const logs = monthLogs || [];

    // Today's stats
    const todayLogs = logs.filter(l => l.created_at >= todayStart);
    const todayTotal = todayLogs.length;
    const todaySuccess = todayLogs.filter(l => l.success).length;
    const todayAvgTime = todayLogs.length > 0
      ? Math.round(todayLogs.reduce((s, l) => s + (l.response_time_ms || 0), 0) / todayLogs.length)
      : 0;

    // Monthly stats
    const monthTotal = logs.length;
    const monthSuccess = logs.filter(l => l.success).length;

    // By type breakdown
    const byType: Record<string, number> = {};
    for (const l of logs) {
      byType[l.ai_type] = (byType[l.ai_type] || 0) + 1;
    }

    // By language breakdown
    const byLanguage: Record<string, number> = {};
    for (const l of logs) {
      byLanguage[l.language] = (byLanguage[l.language] || 0) + 1;
    }

    // Daily breakdown
    const dailyMap: Record<string, number> = {};
    for (const l of logs) {
      const day = l.created_at.split("T")[0];
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    }
    const dailyBreakdown = Object.entries(dailyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Unique users
    const uniqueUsersToday = new Set(todayLogs.map(l => l.client_id)).size;
    const uniqueUsersMonth = new Set(logs.map(l => l.client_id)).size;

    return new Response(JSON.stringify({
      today: {
        total: todayTotal,
        success: todaySuccess,
        failed: todayTotal - todaySuccess,
        avgResponseMs: todayAvgTime,
        uniqueUsers: uniqueUsersToday,
      },
      month: {
        total: monthTotal,
        success: monthSuccess,
        failed: monthTotal - monthSuccess,
        uniqueUsers: uniqueUsersMonth,
      },
      byType,
      byLanguage,
      dailyBreakdown,
      generatedAt: now.toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[AI Stats] Error:", error);
    return jsonError("Failed to fetch stats", 500);
  }
});
