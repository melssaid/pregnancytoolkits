import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTrackingStats } from "@/hooks/useTrackingStats";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { exportGenericPDF } from "@/lib/pdfExport";
import { getUserId } from "@/hooks/useSupabase";

export function MedicalSummaryCard() {
  const { t, i18n } = useTranslation();
  const { profile } = useUserProfile();
  const { stats } = useTrackingStats();
  const [exporting, setExporting] = useState(false);

  const weightEntries = JSON.parse(localStorage.getItem("weight_gain_entries") || "[]");
  const symptomLogs = JSON.parse(localStorage.getItem("symptom_logs") || "[]");
  const userId = getUserId();
  const kickSessions = JSON.parse(localStorage.getItem(`kick_sessions_${userId}`) || "[]");
  const waterLogs = JSON.parse(localStorage.getItem(`water_logs_${userId}`) || "[]");
  const vitaminLogs = JSON.parse(localStorage.getItem("vitamin-tracker-logs") || "{}");

  const summaryItems = [
    { label: t("medicalSummary.currentWeek"), value: `${profile.pregnancyWeek}` },
    { label: t("medicalSummary.weight"), value: stats.dailyTracking.lastWeight || "—" },
    { label: t("medicalSummary.weightEntries"), value: `${weightEntries.length}` },
    { label: t("medicalSummary.totalKickSessions"), value: `${kickSessions.length}` },
    { label: t("medicalSummary.bloodType"), value: profile.bloodType || "—" },
  ];

  const handleExport = async () => {
    setExporting(true);
    try {
      const language = i18n.language as any;
      const today = new Date();

      // Build weight history section
      const weightHistory = weightEntries.length > 0
        ? weightEntries.slice(-15).map((e: any) => ({
            label: t("milestones.week", { week: e.week }),
            value: `${e.weight} kg`,
          }))
        : [{ label: "—", value: "—" }];

      // Build kick sessions section
      const recentKicks = kickSessions.slice(-10).map((s: any) => ({
        label: s.started_at ? new Date(s.started_at).toLocaleDateString() : "—",
        value: `${s.total_kicks || 0} ${t("partnerSummary.kicks")}`,
      }));

      // Water intake summary (last 7 days)
      const last7Days: { label: string; value: string }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().split("T")[0];
        const dayWater = waterLogs.filter((l: any) => l.date?.startsWith(ds)).reduce((s: number, l: any) => s + (l.glasses || 1), 0);
        last7Days.push({
          label: d.toLocaleDateString(language === 'ar' ? 'ar-SA' : undefined, { weekday: 'short', day: 'numeric' }),
          value: `${dayWater} ${t("weeklyComparison.glasses")}`,
        });
      }

      // Vitamins taken days
      const vitDates = Object.keys(vitaminLogs);
      const recentVitDays = vitDates.slice(-7).map(d => ({
        label: new Date(d).toLocaleDateString(language === 'ar' ? 'ar-SA' : undefined, { day: 'numeric', month: 'short' }),
        value: "✓",
      }));

      const sections = [
        {
          title: t("medicalSummary.reportTitle"),
          items: summaryItems,
        },
        {
          title: t("medicalSummary.weightHistory"),
          items: weightHistory,
        },
        ...(recentKicks.length > 0
          ? [{
              title: t("medicalSummary.totalKickSessions"),
              items: recentKicks,
            }]
          : []),
        {
          title: t("dailyDashboard.hydration.title"),
          items: last7Days,
        },
        ...(recentVitDays.length > 0
          ? [{
              title: t("healthScore.vitamins"),
              items: recentVitDays,
            }]
          : []),
      ];

      await exportGenericPDF({
        title: t("medicalSummary.reportTitle"),
        subtitle: `${t("medicalSummary.currentWeek")}: ${profile.pregnancyWeek} — ${new Date().toLocaleDateString()}`,
        sections,
        language,
        accentColor: { r: 236, g: 72, b: 153 },
      });

      toast.success(t("medicalSummary.exportSuccess", "تم تصدير التقرير بنجاح"));
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error(t("medicalSummary.exportError", "فشل تصدير التقرير"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="p-4 bg-card border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-blue-500" />
        <h3 className="text-sm font-extrabold text-foreground">{t("medicalSummary.title")}</h3>
      </div>
      <div className="space-y-1.5 mb-3">
        {summaryItems.map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between"
          >
            <span className="text-[11px] text-muted-foreground">{item.label}</span>
            <span className="text-[11px] font-bold text-foreground">{item.value}</span>
          </motion.div>
        ))}
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleExport}
        disabled={exporting}
        className="w-full text-xs h-8 gap-1"
      >
        {exporting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        {exporting ? t("medicalSummary.exporting", "جارٍ التصدير...") : t("medicalSummary.export")}
      </Button>
    </Card>
  );
}
