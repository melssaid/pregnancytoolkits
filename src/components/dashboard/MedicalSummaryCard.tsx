import { useState, useCallback } from "react";
import { Download, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTrackingStats } from "@/hooks/useTrackingStats";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getUserId } from "@/hooks/useSupabase";
import { buildPrintHTML, loadLogoBase64 } from "@/lib/printUtils";

export function MedicalSummaryCard() {
  const { t, i18n } = useTranslation();
  const { profile } = useUserProfile();
  const { stats } = useTrackingStats();
  const [exporting, setExporting] = useState(false);

  const userId = getUserId();
  const weightEntries = JSON.parse(localStorage.getItem("weight_gain_entries") || "[]");
  const symptomLogs = JSON.parse(localStorage.getItem("symptom_logs") || "[]");
  const kickSessionsRaw = JSON.parse(localStorage.getItem(`kick_sessions_${userId}`) || "[]");

  const summaryItems = [
    { label: t("medicalSummary.currentWeek"), value: `${profile.pregnancyWeek}` },
    { label: t("medicalSummary.weight"), value: stats.dailyTracking.lastWeight || "—" },
    { label: t("medicalSummary.weightEntries"), value: `${weightEntries.length}` },
    { label: t("medicalSummary.totalKickSessions"), value: `${kickSessionsRaw.length}` },
    { label: t("medicalSummary.bloodType"), value: profile.bloodType || "—" },
  ];

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const lang = (i18n.language?.split("-")[0] || "en");
      const isRTL = lang === "ar";
      const logoDataUrl = await loadLogoBase64();

      // Build summary content as HTML table
      const rows = summaryItems
        .map(item => `<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;color:#64748b">${item.label}</td><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:700">${item.value}</td></tr>`)
        .join("");

      const content = `
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <tbody>${rows}</tbody>
        </table>
        <p style="font-size:12px;color:#64748b;margin-top:12px">${t("medicalSummary.symptomEntries", "Symptom entries")}: ${symptomLogs.length}</p>
        <p style="font-size:12px;color:#64748b">${t("medicalSummary.totalKickSessions")}: ${kickSessionsRaw.length}</p>
      `;

      const htmlContent = buildPrintHTML({
        content,
        title: t("medicalSummary.title"),
        lang,
        isRTL,
        profile,
        logoDataUrl,
      });

      // Open browser print dialog via iframe
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;top:-10000px;left:-10000px;width:210mm;height:297mm;border:none";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        document.body.removeChild(iframe);
        throw new Error("Cannot access iframe document");
      }

      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow?.print();
          } catch {
            const win = window.open("", "_blank");
            if (win) {
              win.document.write(htmlContent);
              win.document.close();
              win.print();
            }
          }
          setTimeout(() => {
            try { document.body.removeChild(iframe); } catch { /* already removed */ }
          }, 2000);
        }, 500);
      };

      toast.success(t("medicalSummary.exportSuccess", "تم تصدير التقرير بنجاح"));
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error(t("medicalSummary.exportError", "فشل تصدير التقرير"));
    } finally {
      setExporting(false);
    }
  }, [i18n.language, summaryItems, symptomLogs.length, kickSessionsRaw.length, profile, t]);

  return (
    <Card className="p-4 bg-card border-border/50">
      <div className="mb-3">
        <h3 className="text-base font-bold text-foreground">{t("medicalSummary.title")}</h3>
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
