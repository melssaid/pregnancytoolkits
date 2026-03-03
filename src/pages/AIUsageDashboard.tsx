import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { RefreshCw, Activity, Users, Clock, TrendingUp, Zap, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UsageStats {
  today: { total: number; success: number; failed: number; avgResponseMs: number; uniqueUsers: number };
  month: { total: number; success: number; failed: number; uniqueUsers: number };
  byType: Record<string, number>;
  byLanguage: Record<string, number>;
  dailyBreakdown: { date: string; count: number }[];
  generatedAt: string;
}

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--accent))", "#f59e0b", "#10b981",
  "#6366f1", "#ec4899", "#14b8a6", "#f97316", "#8b5cf6",
];

const LANG_NAMES: Record<string, string> = {
  ar: "العربية", en: "English", de: "Deutsch", fr: "Français",
  es: "Español", pt: "Português", tr: "Türkçe",
};

export default function AIUsageDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-usage-stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const typeChartData = stats
    ? Object.entries(stats.byType)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name: name.replace(/-/g, " "), value }))
    : [];

  const langChartData = stats
    ? Object.entries(stats.byLanguage)
        .sort((a, b) => b[1] - a[1])
        .map(([code, value]) => ({ name: LANG_NAMES[code] || code, value }))
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

          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="daily" className="flex-1">📈 Daily</TabsTrigger>
              <TabsTrigger value="tools" className="flex-1">🔧 Tools</TabsTrigger>
              <TabsTrigger value="langs" className="flex-1">🌐 Languages</TabsTrigger>
            </TabsList>

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
                    <p className="text-muted-foreground text-sm text-center py-8">No data yet. AI calls will appear here.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

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
                            <TableHead>Tool</TableHead>
                            <TableHead className="text-right">Calls</TableHead>
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
                            <TableHead>Language</TableHead>
                            <TableHead className="text-right">Calls</TableHead>
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
