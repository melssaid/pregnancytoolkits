import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTrackingStats } from "@/hooks/useTrackingStats";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { exportMedicalSummaryPDF } from "@/lib/pdfExport";
import { getUserId } from "@/hooks/useSupabase";

export function MedicalSummaryCard() {
  const { t, i18n } = useTranslation();
  const { profile } = useUserProfile();
  const { stats } = useTrackingStats();
  const [exporting, setExporting] = useState(false);

  const userId = getUserId();
  const weightEntries = JSON.parse(localStorage.getItem("weight_gain_entries") || "[]");
  const symptomLogs = JSON.parse(localStorage.getItem("symptom_logs") || "[]");
  const kickSessionsRaw = JSON.parse(localStorage.getItem(`kick_sessions_${userId}`) || "[]");
  const waterLogs = JSON.parse(localStorage.getItem(`water_logs_${userId}`) || "[]");
  const vitaminLogs = JSON.parse(localStorage.getItem("vitamin-tracker-logs") || "{}");
  const allAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");
  const userAppointments = allAppointments.filter((a: any) => a.user_id === userId);

  const summaryItems = [
    { label: t("medicalSummary.currentWeek"), value: `${profile.pregnancyWeek}` },
    { label: t("medicalSummary.weight"), value: stats.dailyTracking.lastWeight || "—" },
    { label: t("medicalSummary.weightEntries"), value: `${weightEntries.length}` },
    { label: t("medicalSummary.totalKickSessions"), value: `${kickSessionsRaw.length}` },
    { label: t("medicalSummary.bloodType"), value: profile.bloodType || "—" },
  ];

  const handleExport = async () => {
    setExporting(true);
    try {
      const language = (i18n.language?.split("-")[0] || "en") as "en" | "ar" | "de" | "fr" | "es" | "pt" | "tr";
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      const waterDays = Array.from({ length: 7 }, (_, index) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - index));
        const ds = d.toISOString().split("T")[0];
        const amount = waterLogs
          .filter((l: any) => l.date?.startsWith(ds))
          .reduce((sum: number, l: any) => sum + (l.glasses || 1), 0);
        return { date: ds, amount };
      });

      const vitaminDays = Array.from({ length: 7 }, (_, index) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - index));
        const ds = d.toISOString().split("T")[0];
        return { date: ds, taken: Boolean(vitaminLogs?.[ds] && Object.keys(vitaminLogs[ds]).length > 0) };
      });

      const kickSessions = kickSessionsRaw.slice(-12).map((entry: any) => ({
        date: entry.started_at,
        total: Number(entry.total_kicks || 0),
      }));

      const symptoms = symptomLogs.slice(-12).map((entry: any) => ({
        date: entry.date || entry.created_at || entry.timestamp,
        symptom: entry.symptom || entry.name || entry.label || t("medicalSummary.unknownSymptom", "Symptom"),
        severity: entry.severity || entry.intensity || entry.level || "",
      }));

      const appointments = userAppointments
        .filter((a: any) => new Date(a.appointment_date || a.date) >= new Date(todayStr))
        .slice(0, 8)
        .map((entry: any) => ({
          date: entry.appointment_date || entry.date,
          title: entry.title || entry.reason || t("medicalSummary.upcomingVisit", "Upcoming appointment"),
          doctor: entry.doctor || entry.provider || "",
        }));

      await exportMedicalSummaryPDF({
        language,
        profile: {
          isPregnant: profile.isPregnant,
          pregnancyWeek: profile.pregnancyWeek,
          dueDate: profile.dueDate,
          lastPeriodDate: profile.lastPeriodDate,
          bloodType: profile.bloodType,
          weight: profile.weight,
          prePregnancyWeight: profile.prePregnancyWeight,
          height: profile.height,
        },
        summary: {
          currentWeight: stats.dailyTracking.lastWeight || "—",
          todayKicks: stats.dailyTracking.todayKicks,
          waterToday: stats.dailyTracking.waterGlasses,
          vitaminsToday: stats.dailyTracking.vitaminsTaken,
          upcomingAppointments: stats.planning.upcomingAppointments,
          weightEntriesCount: weightEntries.length,
          symptomEntriesCount: symptomLogs.length,
        },
        weightEntries: weightEntries.slice(-12),
        waterDays,
        vitaminDays,
        kickSessions,
        symptoms,
        appointments,
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
        <FileText className="w-4 h-4 text-primary" />
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
        {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
        {exporting ? t("medicalSummary.exporting", "جارٍ التصدير...") : t("medicalSummary.export")}
      </Button>
    </Card>
  );
}
