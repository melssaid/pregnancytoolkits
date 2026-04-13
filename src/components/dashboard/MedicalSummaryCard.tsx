import { FileText, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTrackingStats } from "@/hooks/useTrackingStats";
import { motion } from "framer-motion";

export function MedicalSummaryCard() {
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const { stats } = useTrackingStats();

  const weightEntries = JSON.parse(localStorage.getItem("weight_gain_entries") || "[]");
  const symptomLogs = JSON.parse(localStorage.getItem("symptom_logs") || "[]");

  const summaryItems = [
    { label: t("medicalSummary.currentWeek"), value: `${profile.pregnancyWeek}` },
    { label: t("medicalSummary.weight"), value: stats.dailyTracking.lastWeight || "—" },
    { label: t("medicalSummary.weightEntries"), value: `${weightEntries.length}` },
    { label: t("medicalSummary.totalKickSessions"), value: `${JSON.parse(localStorage.getItem(`kick_sessions_${localStorage.getItem("pregnancy_user_id") || "anon"}`) || "[]").length}` },
    { label: t("medicalSummary.bloodType"), value: profile.bloodType || "—" },
  ];

  const handleExport = () => {
    const lines = [
      t("medicalSummary.reportTitle"),
      `${t("medicalSummary.generatedAt")}: ${new Date().toLocaleDateString()}`,
      "---",
      ...summaryItems.map(s => `${s.label}: ${s.value}`),
      "---",
      t("medicalSummary.weightHistory"),
      ...weightEntries.map((e: any) => `  ${t("milestones.week", { week: e.week })}: ${e.weight} kg`),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pregnancy-summary-week${profile.pregnancyWeek}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
        className="w-full text-xs h-8 gap-1"
      >
        <Download className="w-3.5 h-3.5" />
        {t("medicalSummary.export")}
      </Button>
    </Card>
  );
}
