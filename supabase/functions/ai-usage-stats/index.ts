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

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user?.id) {
      return jsonError("Unauthorized - valid session required", 401);
    }

    if (ADMIN_USER_IDS.length > 0 && !ADMIN_USER_IDS.includes(user.id)) {
      return jsonError("Forbidden - admin access required", 403);
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

    // Fetch all logs for this month (max 2000)
    const { data: monthLogs, error } = await adminClient
      .from("ai_usage_logs")
      .select("*")
      .gte("created_at", monthStart)
      .order("created_at", { ascending: false })
      .limit(2000);

    if (error) throw error;

    const logs = monthLogs || [];
    const todayLogs = logs.filter(l => l.created_at >= todayStart);

    // Today's stats
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

    // ── By IP (client_id) breakdown ──
    const byIP: Record<string, { total: number; success: number; lastSeen: string; types: Record<string, number>; languages: Set<string> }> = {};
    for (const l of logs) {
      const ip = l.client_id || "unknown";
      if (!byIP[ip]) byIP[ip] = { total: 0, success: 0, lastSeen: l.created_at, types: {}, languages: new Set() };
      byIP[ip].total++;
      if (l.success) byIP[ip].success++;
      if (l.created_at > byIP[ip].lastSeen) byIP[ip].lastSeen = l.created_at;
      byIP[ip].types[l.ai_type] = (byIP[ip].types[l.ai_type] || 0) + 1;
      byIP[ip].languages.add(l.language);
    }

    const ipBreakdown = Object.entries(byIP)
      .map(([ip, data]) => ({
        ip: ip.length > 20 ? ip.substring(0, 20) + "…" : ip,
        ipFull: ip,
        total: data.total,
        success: data.success,
        lastSeen: data.lastSeen,
        topTool: Object.entries(data.types).sort((a, b) => b[1] - a[1])[0]?.[0] || "",
        languages: [...data.languages],
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 50);

    // ── By user_id breakdown ──
    const byUser: Record<string, { total: number; success: number; lastSeen: string; ips: Set<string>; types: Record<string, number> }> = {};
    for (const l of logs) {
      const uid = l.user_id || "anonymous";
      if (!byUser[uid]) byUser[uid] = { total: 0, success: 0, lastSeen: l.created_at, ips: new Set(), types: {} };
      byUser[uid].total++;
      if (l.success) byUser[uid].success++;
      if (l.created_at > byUser[uid].lastSeen) byUser[uid].lastSeen = l.created_at;
      byUser[uid].ips.add(l.client_id || "unknown");
      byUser[uid].types[l.ai_type] = (byUser[uid].types[l.ai_type] || 0) + 1;
    }

    const userBreakdown = Object.entries(byUser)
      .map(([userId, data]) => ({
        userId: userId === "anonymous" ? "anonymous" : userId.substring(0, 8) + "…",
        userIdFull: userId,
        total: data.total,
        success: data.success,
        lastSeen: data.lastSeen,
        ipCount: data.ips.size,
        topTool: Object.entries(data.types).sort((a, b) => b[1] - a[1])[0]?.[0] || "",
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 50);

    // ── Suspicious patterns: IPs with multiple user_ids (potential exploit) ──
    const ipToUsers: Record<string, Set<string>> = {};
    for (const l of logs) {
      const ip = l.client_id || "unknown";
      if (!ipToUsers[ip]) ipToUsers[ip] = new Set();
      if (l.user_id) ipToUsers[ip].add(l.user_id);
    }
    const suspiciousIPs = Object.entries(ipToUsers)
      .filter(([_, users]) => users.size > 2)
      .map(([ip, users]) => ({
        ip: ip.length > 20 ? ip.substring(0, 20) + "…" : ip,
        ipFull: ip,
        userCount: users.size,
        totalCalls: byIP[ip]?.total || 0,
      }))
      .sort((a, b) => b.userCount - a.userCount)
      .slice(0, 20);

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
      ipBreakdown,
      userBreakdown,
      suspiciousIPs,
      generatedAt: now.toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[AI Stats] Error:", error);
    return jsonError("Failed to fetch stats", 500);
  }
});
