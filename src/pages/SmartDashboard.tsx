import { lazy, Suspense, useState, useEffect, useCallback } from "react";
import { SEOHead } from "@/components/SEOHead";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { useSmartConversionPrompt } from "@/hooks/useSmartConversionPrompt";
import { useTrimesterTheme } from "@/hooks/useTrimesterTheme";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sun, BarChart3, Calendar, LayoutGrid } from "lucide-react";
import { haptic } from "@/lib/haptics";
import roseLeft from "@/assets/rose-left.png";

// Today tab is eager — first paint
import { TodayTab } from "@/components/dashboard/tabs/TodayTab";
import { DashboardTabSkeleton } from "@/components/dashboard/DashboardTabSkeleton";

// Lazy-loaded tabs to shrink initial bundle
const InsightsTab = lazy(() => import("@/components/dashboard/tabs/InsightsTab"));
const ArchiveTab = lazy(() => import("@/components/dashboard/tabs/ArchiveTab"));
const MoreTab = lazy(() => import("@/components/dashboard/tabs/MoreTab"));

const TAB_KEY = "dashboard_active_tab";
type TabKey = "today" | "insights" | "archive" | "more";

const SmartDashboard = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  useSmartConversionPrompt();
  const trimesterTheme = useTrimesterTheme();

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    try {
      const saved = sessionStorage.getItem(TAB_KEY) as TabKey | null;
      if (saved && ["today", "insights", "archive", "more"].includes(saved)) return saved;
    } catch {}
    return "today";
  });

  // Restore scroll per-tab
  useEffect(() => {
    try {
      const y = sessionStorage.getItem(`dashboard_tab_scroll_${activeTab}`);
      if (y) window.scrollTo(0, parseInt(y, 10));
      else window.scrollTo(0, 0);
    } catch {}
  }, [activeTab]);

  // Save scroll position
  useEffect(() => {
    const onScroll = () => {
      try {
        sessionStorage.setItem(`dashboard_tab_scroll_${activeTab}`, String(window.scrollY));
      } catch {}
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [activeTab]);

  const handleTabChange = useCallback((value: string) => {
    haptic("tap");
    const next = value as TabKey;
    try { sessionStorage.setItem(TAB_KEY, next); } catch {}
    setActiveTab(next);
  }, []);

  // Decorative parallax
  const { scrollY } = useScroll();
  const roseLeftY = useTransform(scrollY, [0, 400], [0, -60]);
  const roseOpacity = useTransform(scrollY, [0, 300], [0.85, 0]);
  const roseLeftScale = useTransform(scrollY, [0, 400], [1, 0.7]);

  const tabs: Array<{ key: TabKey; icon: typeof Sun; labelAr: string; labelEn: string }> = [
    { key: "today",    icon: Sun,        labelAr: "اليوم",  labelEn: "Today" },
    { key: "insights", icon: BarChart3,  labelAr: "الرؤى",  labelEn: "Insights" },
    { key: "archive",  icon: Calendar,   labelAr: "الأرشيف", labelEn: "Archive" },
    { key: "more",     icon: LayoutGrid, labelAr: "المزيد", labelEn: "More" },
  ];

  return (
    <Layout>
      <SEOHead
        title={t("dailyDashboard.pageTitle", "Pregnancy Dashboard")}
        description="Your personalized pregnancy dashboard"
      />

      <main className={`relative pb-24 bg-gradient-to-b ${trimesterTheme.gradient}`}>
        {/* Decorative rose */}
        <div className="pointer-events-none absolute -top-3 left-0 right-0 z-0 flex px-1">
          <motion.img
            src={roseLeft}
            alt=""
            width={84}
            height={84}
            style={{ y: roseLeftY, opacity: roseOpacity, scale: roseLeftScale }}
            initial={{ y: -20, opacity: 0, rotate: -20, scale: 0.5 }}
            animate={{
              y: [0, -5, 0],
              opacity: 0.85,
              rotate: [-10, -4, -10],
              scale: [1, 1.06, 1],
            }}
            transition={{
              y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 0.8, ease: "easeOut" },
            }}
            className="drop-shadow-md"
          />
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="relative z-10">
          {/* Sticky tab bar — pro Apple-style */}
          <TabsList
            className="sticky top-[3.5rem] sm:top-[4.5rem] z-30 grid h-auto w-full
                       grid-cols-4 gap-0 rounded-none border-b border-border/40
                       bg-background/92 p-0 backdrop-blur-xl shadow-sm"
            aria-label={isAr ? "أقسام لوحة التحكم" : "Dashboard sections"}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="relative flex h-14 flex-col items-center justify-center gap-0.5 rounded-none border-0 bg-transparent
                             text-[10px] font-bold transition-colors
                             data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none
                             data-[state=inactive]:text-muted-foreground"
                >
                  <Icon className={`h-[18px] w-[18px] transition-transform ${isActive ? "scale-110" : ""}`} strokeWidth={isActive ? 2.4 : 2} />
                  <span className="leading-none mt-0.5">{isAr ? tab.labelAr : tab.labelEn}</span>
                  {isActive && (
                    <motion.span
                      layoutId="dashboard-tab-indicator"
                      className="absolute bottom-0 left-1/4 right-1/4 h-[3px] rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab contents */}
          <div className="container px-3 sm:px-4 pt-4">
            <TabsContent value="today" className="mt-0">
              <TodayTab />
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              <Suspense fallback={<DashboardTabSkeleton />}>
                <InsightsTab />
              </Suspense>
            </TabsContent>

            <TabsContent value="archive" className="mt-0">
              <Suspense fallback={<DashboardTabSkeleton />}>
                <ArchiveTab />
              </Suspense>
            </TabsContent>

            <TabsContent value="more" className="mt-0">
              <Suspense fallback={<DashboardTabSkeleton />}>
                <MoreTab />
              </Suspense>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </Layout>
  );
};

export default SmartDashboard;
