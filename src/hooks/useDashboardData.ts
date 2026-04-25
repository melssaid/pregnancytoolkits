import { useMemo } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTrackingStats } from "@/hooks/useTrackingStats";
import { useDashboardDataCheck } from "@/hooks/useDashboardDataCheck";
import { safeParseLocalStorage } from "@/lib/safeStorage";

/**
 * Unified data source for the SmartDashboard.
 * Combines profile, tracking stats, data presence, and health check-in
 * into a single hook to minimize re-renders.
 */
export function useDashboardData() {
  const { profile } = useUserProfile();
  const { stats } = useTrackingStats();
  const dataCheck = useDashboardDataCheck();

  const healthCheckin = useMemo(
    () => safeParseLocalStorage<any>("dashboard_health_checkin_v1", null),
    []
  );

  const bloodPressure = healthCheckin?.bloodPressure || "";

  // Time of day for personalization
  const hour = new Date().getHours();
  const timeSlot: "morning" | "afternoon" | "evening" =
    hour < 11 ? "morning" : hour < 17 ? "afternoon" : "evening";

  return {
    profile,
    stats,
    dataCheck,
    healthCheckin,
    bloodPressure,
    timeSlot,
    hour,
    week: profile.pregnancyWeek || 0,
    isPregnant: (profile.pregnancyWeek || 0) > 0,
  };
}
