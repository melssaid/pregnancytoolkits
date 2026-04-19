import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Calendar, ArrowRight, CalendarPlus, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Reads appointments from the same localStorage key used by AppointmentService
 * Key: "appointments" — filtered by user_id matching pregnancy_user_id
 * Field: appointment_date (not "date")
 */
const getLocalUserId = (): string => {
  return localStorage.getItem('pregnancy_user_id') || '';
};

const getUpcomingAppointments = (userId: string) => {
  try {
    const raw = localStorage.getItem('appointments');
    if (!raw) return [];
    const all = JSON.parse(raw) as any[];
    const now = new Date();
    return all
      .filter((a: any) => a.user_id === userId && new Date(a.appointment_date) >= now)
      .sort((a: any, b: any) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
      .slice(0, 3);
  } catch {
    return [];
  }
};

export const AppointmentsCard = memo(function AppointmentsCard() {
  const { t } = useTranslation();
  const userId = getLocalUserId();

  const upcoming = useMemo(() => getUpcomingAppointments(userId), [userId]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const appointmentDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((appointmentDay.getTime() - today.getTime()) / 86400000);
    if (diffDays <= 0) return t("dailyDashboard.appointments.today");
    if (diffDays === 1) return t("dailyDashboard.appointments.tomorrow");
    return t("dailyDashboard.appointments.inDays", { days: diffDays });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border border-border/20 bg-card p-3.5"
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
          <h3 className="text-sm font-extrabold text-foreground whitespace-normal leading-tight">{t("dailyDashboard.appointments.title")}</h3>
        </div>
        <Link to="/tools/smart-appointment-reminder">
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
        </Link>
      </div>

      {upcoming.length > 0 ? (
        <div className="space-y-1.5">
          {upcoming.map((apt: any, i: number) => (
            <div key={apt.id || i} className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/30">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-3 h-3 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-foreground leading-tight whitespace-normal break-words line-clamp-2" style={{ overflowWrap: 'anywhere' }}>
                  {apt.title || t("dailyDashboard.appointments.checkup")}
                </p>
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                  <span>{formatDate(apt.appointment_date)}</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTime(apt.appointment_date)}
                  </span>
                </div>
                {apt.doctor_name && (
                  <p className="text-[9px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                    <User className="w-2.5 h-2.5" />
                    {apt.doctor_name}
                  </p>
                )}
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
