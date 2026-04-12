import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { RefreshCw, Activity, Users, Clock, TrendingUp, Zap, Globe, Shield, AlertTriangle, Wifi, UserCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface IPEntry {
  ip: string;
  ipFull: string;
  total: number;
  success: number;
  lastSeen: string;
  topTool: string;
  languages: string[];
}

interface UserEntry {
  userId: string;
  userIdFull: string;
  total: number;
  success: number;
  lastSeen: string;
  ipCount: number;
  topTool: string;
}

interface SuspiciousIP {
  ip: string;
  ipFull: string;
  userCount: number;
  totalCalls: number;
}

interface UsageStats {
  today: { total: number; success: number; failed: number; avgResponseMs: number; uniqueUsers: number };
  month: { total: number; success: number; failed: number; uniqueUsers: number };
  byType: Record<string, number>;
  byLanguage: Record<string, number>;
  dailyBreakdown: { date: string; count: number }[];
  ipBreakdown: IPEntry[];
  userBreakdown: UserEntry[];
  suspiciousIPs: SuspiciousIP[];
  generatedAt: string;
}

const COLORS = [
  "hsl(var(--primary))", "#f59e0b", "#10b981",
  "#6366f1", "#ec4899", "#14b8a6", "#f97316", "#8b5cf6", "#06b6d4",
];

const LANG_NAMES: Record<string, string> = {
  ar: "العربية", en: "English", de: "Deutsch", fr: "Français",
  es: "Español", pt: "Português", tr: "Türkçe",
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffH = Math.round((now.getTime() - d.getTime()) / 3600000);
  if (diffH < 1) return "just now";
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.round(diffH / 24);
  return `${diffD}d ago`;
}

export default function AIUsageDashboard() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("Authentication required. Please sign in to view analytics.");
        return;
      }
      const { getBackendFunctionUrl } = await import('@/lib/backendConfig');
      const res = await fetch(
        getBackendFunctionUrl('ai-usage-stats'),
        { headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStats(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const typeChartData = stats
    ? Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name: name.replace(/-/g, " "), value }))
    : [];

  const langChartData = stats
    ? Object.entries(stats.byLanguage).sort((a, b) => b[1] - a[1]).map(([code, value]) => ({ name: LANG_NAMES[code] || code, value }))
    : [];

  return (
    <div className="min-h-screen bg-background p-4 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <BackButton />
        <h1 className="text-lg font-bold text-foreground flex-1">📊 AI Usage Analytics</h1>
        <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-destructive text-sm">{error}</CardContent>
        </Card>
      )}

      {stats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<Zap className="h-4 w-4" />} label="Today" value={stats.today.total} sub={`${stats.today.success} ✓`} />
            <StatCard icon={<TrendingUp className="h-4 w-4" />} label="This Month" value={stats.month.total} sub={`${stats.month.success} ✓`} />
            <StatCard icon={<Users className="h-4 w-4" />} label="Users Today" value={stats.today.uniqueUsers} sub={`${stats.month.uniqueUsers} /mo`} />
            <StatCard icon={<Clock className="h-4 w-4" />} label="Avg Response" value={`${stats.today.avgResponseMs}ms`} sub="today" />
          </div>

          {/* Suspicious IPs Alert */}
          {stats.suspiciousIPs.length > 0 && (
            <Card className="border-amber-500/50 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  Suspicious IPs — Multiple User IDs Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">IP</TableHead>
                      <TableHead className="text-xs text-right">Users</TableHead>
                      <TableHead className="text-xs text-right">Calls</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.suspiciousIPs.map((s) => (
                      <TableRow key={s.ipFull}>
                        <TableCell className="text-xs font-mono">{s.ip}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="destructive" className="text-[10px]">{s.userCount} IDs</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">{s.totalCalls}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="daily" className="text-[11px]">📈 Daily</TabsTrigger>
              <TabsTrigger value="ips" className="text-[11px]">🌐 IPs</TabsTrigger>
              <TabsTrigger value="users" className="text-[11px]">👤 Users</TabsTrigger>
              <TabsTrigger value="tools" className="text-[11px]">🔧 Tools</TabsTrigger>
              <TabsTrigger value="langs" className="text-[11px]">🗣️ Langs</TabsTrigger>
            </TabsList>

            {/* Daily */}
            <TabsContent value="daily">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Daily AI Calls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.dailyBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={stats.dailyBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* IPs */}
            <TabsContent value="ips">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wifi className="h-4 w-4" /> Usage by IP Address
                    <Badge variant="secondary" className="text-[10px]">{stats.ipBreakdown.length} IPs</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[10px]">IP</TableHead>
                          <TableHead className="text-[10px] text-right">Calls</TableHead>
                          <TableHead className="text-[10px] text-right">OK</TableHead>
                          <TableHead className="text-[10px]">Top Tool</TableHead>
                          <TableHead className="text-[10px]">Langs</TableHead>
                          <TableHead className="text-[10px]">Last</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.ipBreakdown.map((entry) => (
                          <TableRow key={entry.ipFull}>
                            <TableCell className="text-[10px] font-mono max-w-[100px] truncate" title={entry.ipFull}>
                              {entry.ip}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs font-bold">{entry.total}</TableCell>
                            <TableCell className="text-right text-[10px]">
                              <span className={entry.success / entry.total < 0.7 ? "text-destructive" : "text-emerald-600"}>
                                {Math.round((entry.success / entry.total) * 100)}%
                              </span>
                            </TableCell>
                            <TableCell className="text-[10px] capitalize max-w-[80px] truncate">
                              {entry.topTool.replace(/-/g, " ")}
                            </TableCell>
                            <TableCell className="text-[10px]">
                              {entry.languages.join(", ")}
                            </TableCell>
                            <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {formatTime(entry.lastSeen)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users */}
            <TabsContent value="users">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <UserCheck className="h-4 w-4" /> Usage by User ID
                    <Badge variant="secondary" className="text-[10px]">{stats.userBreakdown.length} users</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[10px]">User</TableHead>
                          <TableHead className="text-[10px] text-right">Calls</TableHead>
                          <TableHead className="text-[10px] text-right">IPs</TableHead>
                          <TableHead className="text-[10px]">Top Tool</TableHead>
                          <TableHead className="text-[10px]">Last</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.userBreakdown.map((entry) => (
                          <TableRow key={entry.userIdFull}>
                            <TableCell className="text-[10px] font-mono max-w-[80px] truncate" title={entry.userIdFull}>
                              {entry.userId === "anonymous" ? (
                                <span className="text-muted-foreground italic">anonymous</span>
                              ) : entry.userId}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs font-bold">{entry.total}</TableCell>
                            <TableCell className="text-right text-[10px]">
                              {entry.ipCount > 2 ? (
                                <Badge variant="destructive" className="text-[9px]">{entry.ipCount}</Badge>
                              ) : (
                                <span>{entry.ipCount}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-[10px] capitalize max-w-[80px] truncate">
                              {entry.topTool.replace(/-/g, " ")}
                            </TableCell>
                            <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {formatTime(entry.lastSeen)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tools */}
            <TabsContent value="tools">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Tool Usage Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {typeChartData.length > 0 ? (
                    <div className="space-y-4">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={typeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                            {typeChartData.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Tool</TableHead>
                            <TableHead className="text-xs text-right">Calls</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {typeChartData.map((t) => (
                            <TableRow key={t.name}>
                              <TableCell className="text-xs capitalize">{t.name}</TableCell>
                              <TableCell className="text-right font-mono">{t.value}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Languages */}
            <TabsContent value="langs">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Language Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {langChartData.length > 0 ? (
                    <div className="space-y-4">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={langChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {langChartData.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Language</TableHead>
                            <TableHead className="text-xs text-right">Calls</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {langChartData.map((l) => (
                            <TableRow key={l.name}>
                              <TableCell className="text-xs">{l.name}</TableCell>
                              <TableCell className="text-right font-mono">{l.value}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <p className="text-[10px] text-muted-foreground text-center">
            Updated: {new Date(stats.generatedAt).toLocaleString()}
          </p>
        </>
      )}

      {loading && !stats && (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub: string }) {
  return (
    <Card>
      <CardContent className="p-3 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {icon}
          <span className="text-[10px]">{label}</span>
        </div>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-[10px] text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}
