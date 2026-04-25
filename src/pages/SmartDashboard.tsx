import { lazy, Suspense, useState, useEffect, useCallback } from "react";
import { SEOHead } from "@/components/SEOHead";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { useSmartConversionPrompt } from "@/hooks/useSmartConversionPrompt";
import { useTrimesterTheme } from "@/hooks/useTrimesterTheme";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
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

  const tabs: Array<{ key: TabKey; icon: typeof Sun; tKey: string }> = [
    { key: "today",    icon: Sun,        tKey: "dashboardV2.tabs.today" },
    { key: "insights", icon: BarChart3,  tKey: "dashboardV2.tabs.insights" },
    { key: "archive",  icon: Calendar,   tKey: "dashboardV2.tabs.archive" },
    { key: "more",     icon: LayoutGrid, tKey: "dashboardV2.tabs.more" },
  ];

  return (
    <Layout>
      <SEOHead
        title={t("dailyDashboard.pageTitle", "Pregnancy Dashboard")}
        description="Your personalized pregnancy dashboard"
      />

      <main dir={isRTL ? "rtl" : "ltr"} className={`relative pb-24 bg-gradient-to-b ${trimesterTheme.gradient}`}>
        {/* Decorative rose — always anchored to the visual LEFT side of the screen */}
        <div className="pointer-events-none absolute -top-3 left-0 z-0 flex px-1" dir="ltr" aria-hidden="true">
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

        {/* Premium page header — title only, no eyebrow */}
        <header className="container relative z-10 px-3 sm:px-4 pt-5 pb-3">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-foreground">
                {t("dashboardV2.header.title")}
              </h1>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 shadow-sm">
              <Sun className="h-5 w-5 text-primary" strokeWidth={2.2} />
            </div>
          </motion.div>
        </header>

        <Tabs value={activeTab} onValueChange={handleTabChange} dir={isRTL ? "rtl" : "ltr"} className="relative z-10">
          {/* Sticky tab bar — pro Apple-style */}
          <TabsList
            className="sticky top-[3.25rem] sm:top-[4rem] z-30 grid h-auto w-full
                       grid-cols-4 gap-0 rounded-none border-b border-border/40
                       bg-background/92 p-0 backdrop-blur-xl shadow-[0_4px_12px_-6px_hsl(var(--primary)/0.12)]"
            aria-label={t("dashboardV2.header.sectionsAria")}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="relative flex h-12 sm:h-14 flex-col items-center justify-center gap-0.5 rounded-none border-0 bg-transparent
                             text-[10px] font-bold transition-colors
                             data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none
                             data-[state=inactive]:text-muted-foreground"
                >
                  <Icon className={`h-[17px] w-[17px] sm:h-[18px] sm:w-[18px] transition-transform ${isActive ? "scale-110" : ""}`} strokeWidth={isActive ? 2.4 : 2} />
                  <span className="leading-tight mt-0.5 text-[9px] sm:text-[10px] text-center px-0.5">{t(tab.tKey)}</span>
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
