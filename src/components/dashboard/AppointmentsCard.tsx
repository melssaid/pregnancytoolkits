import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Calendar, ArrowRight, CalendarPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { getUserId } from "@/hooks/useSupabase";
import { safeParseLocalStorage } from "@/lib/safeStorage";

export const AppointmentsCard = memo(function AppointmentsCard() {
  const { t, i18n } = useTranslation();
  const userId = getUserId();

  const upcoming = useMemo(() => {
    const all = safeParseLocalStorage<any[]>(`appointments_${userId}`, []);
    const now = new Date();
    return all
      .filter((a: any) => new Date(a.date) >= now)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [userId]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / 86400000);
    if (diffDays <= 0) return t("dailyDashboard.appointments.today");
    if (diffDays === 1) return t("dailyDashboard.appointments.tomorrow");
    return t("dailyDashboard.appointments.inDays", { days: diffDays });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border border-border/20 bg-card p-3.5"
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground">{t("dailyDashboard.appointments.title")}</h3>
        </div>
        <Link to="/tools/smart-appointment-reminder">
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
        </Link>
      </div>

      {upcoming.length > 0 ? (
        <div className="space-y-1.5">
          {upcoming.map((apt: any, i: number) => (
            <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/30">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-3 h-3 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-foreground truncate">{apt.title || apt.name || t("dailyDashboard.appointments.checkup")}</p>
                <p className="text-[9px] text-muted-foreground">{formatDate(apt.date)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Link to="/tools/smart-appointment-reminder" className="block">
          <div className="flex flex-col items-center py-4 text-center">
            <CalendarPlus className="w-6 h-6 text-muted-foreground/40 mb-1.5" />
            <p className="text-[10px] text-muted-foreground">{t("dailyDashboard.appointments.empty")}</p>
            <span className="text-[10px] text-primary font-semibold mt-1">{t("dailyDashboard.appointments.add")}</span>
          </div>
        </Link>
      )}
    </motion.div>
  );
});
