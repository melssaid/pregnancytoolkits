import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Activity, Clock, Users, TrendingUp,
  BarChart3, Globe, Zap, ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

interface DailyStats {
  total: number;
  successful: number;
  failed: number;
  avgResponseTime: number;
}

interface ToolBreakdown {
  ai_type: string;
  count: number;
}

interface LanguageBreakdown {
  language: string;
  count: number;
}

export default function AIUsageDashboard() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [todayStats, setTodayStats] = useState<DailyStats>({ total: 0, successful: 0, failed: 0, avgResponseTime: 0 });
  const [weekStats, setWeekStats] = useState<DailyStats>({ total: 0, successful: 0, failed: 0, avgResponseTime: 0 });
  const [toolBreakdown, setToolBreakdown] = useState<ToolBreakdown[]>([]);
  const [languageBreakdown, setLanguageBreakdown] = useState<LanguageBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const today = new Date().toISOString().split("T")[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Today's stats
      const { data: todayData } = await supabase
        .from("ai_usage_logs")
        .select("*")
        .gte("created_at", today);

      if (todayData) {
        const successful = todayData.filter(r => r.success).length;
        const avgTime = todayData.length > 0
          ? todayData.reduce((sum, r) => sum + (r.response_time_ms || 0), 0) / todayData.length
          : 0;
        setTodayStats({
          total: todayData.length,
          successful,
          failed: todayData.length - successful,
          avgResponseTime: Math.round(avgTime),
        });
      }

      // Week stats
      const { data: weekData } = await supabase
        .from("ai_usage_logs")
        .select("*")
        .gte("created_at", weekAgo);

      if (weekData) {
        const successful = weekData.filter(r => r.success).length;
        const avgTime = weekData.length > 0
          ? weekData.reduce((sum, r) => sum + (r.response_time_ms || 0), 0) / weekData.length
          : 0;
        setWeekStats({
          total: weekData.length,
          successful,
          failed: weekData.length - successful,
          avgResponseTime: Math.round(avgTime),
        });

        // Tool breakdown
        const toolMap: Record<string, number> = {};
        weekData.forEach(r => {
          toolMap[r.ai_type] = (toolMap[r.ai_type] || 0) + 1;
        });
        setToolBreakdown(
          Object.entries(toolMap)
            .map(([ai_type, count]) => ({ ai_type, count }))
            .sort((a, b) => b.count - a.count)
        );

        // Language breakdown
        const langMap: Record<string, number> = {};
        weekData.forEach(r => {
          langMap[r.language] = (langMap[r.language] || 0) + 1;
        });
        setLanguageBreakdown(
          Object.entries(langMap)
            .map(([language, count]) => ({ language, count }))
            .sort((a, b) => b.count - a.count)
        );
      }
    } catch (err) {
      console.error("Failed to fetch AI stats:", err);
    } finally {
      setLoading(false);
    }
  }

  const successRate = todayStats.total > 0
    ? Math.round((todayStats.successful / todayStats.total) * 100)
    : 100;

  const statCards = [
    {
      icon: <Zap className="h-5 w-5" />,
      label: t("admin.todayRequests", "طلبات اليوم"),
      value: todayStats.total,
      color: "text-blue-500",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      label: t("admin.successRate", "نسبة النجاح"),
      value: `${successRate}%`,
      color: "text-green-500",
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: t("admin.avgResponse", "متوسط الاستجابة"),
      value: `${todayStats.avgResponseTime}ms`,
      color: "text-amber-500",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: t("admin.weekTotal", "إجمالي الأسبوع"),
      value: weekStats.total,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-lg font-bold text-foreground flex-1 flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {t("admin.aiDashboard", "لوحة تحكم الذكاء الاصطناعي")}
          </h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Activity className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {statCards.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-3 flex flex-col gap-1">
                      <div className={`flex items-center gap-1.5 ${stat.color}`}>
                        {stat.icon}
                        <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Success Rate Bar */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("admin.successRate", "نسبة النجاح")}</span>
                    <span className="font-semibold text-foreground">{successRate}%</span>
                  </div>
                  <Progress value={successRate} className="h-2" />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{todayStats.successful} {t("admin.successful", "ناجح")}</span>
                    <span>{todayStats.failed} {t("admin.failed", "فاشل")}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tool Breakdown */}
            {toolBreakdown.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <Card>
                  <CardHeader className="pb-2 p-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      {t("admin.toolBreakdown", "توزيع الأدوات")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-2">
                      {toolBreakdown.slice(0, 8).map((tool, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground truncate flex-1">{tool.ai_type}</span>
                          <span className="font-semibold text-foreground ms-2">{tool.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Language Breakdown */}
            {languageBreakdown.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader className="pb-2 p-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      {t("admin.languageBreakdown", "توزيع اللغات")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-2">
                      {languageBreakdown.map((lang, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{lang.language.toUpperCase()}</span>
                          <span className="font-semibold text-foreground">{lang.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
