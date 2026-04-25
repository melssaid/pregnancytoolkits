import { lazy, Suspense, useState, useEffect, useCallback, useRef } from "react";
import { SEOHead } from "@/components/SEOHead";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { useSmartConversionPrompt } from "@/hooks/useSmartConversionPrompt";
import { useTrimesterTheme } from "@/hooks/useTrimesterTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sun, BarChart3, Calendar, LayoutGrid, Sunrise, Moon, Sparkles } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { subscribeToData, STORAGE_KEYS } from "@/lib/dataBus";

// Maps a canonical storage key to the i18n key used in the toast title.
// Anything unmapped falls back to a generic "dashboard updated" message.
const TOOL_KEY_LABELS: Record<string, string> = {
  [STORAGE_KEYS.KICK_SESSIONS]:  "dashboardV2.toolNames.kicks",
  [STORAGE_KEYS.CONTRACTIONS]:   "dashboardV2.toolNames.contractions",
  [STORAGE_KEYS.WEIGHT_ENTRIES]: "dashboardV2.toolNames.weight",
  [STORAGE_KEYS.SYMPTOM_LOGS]:   "dashboardV2.toolNames.symptoms",
  [STORAGE_KEYS.VITAMIN_LOGS]:   "dashboardV2.toolNames.vitamins",
  [STORAGE_KEYS.DIAPER_ENTRIES]: "dashboardV2.toolNames.diapers",
  [STORAGE_KEYS.BABY_SLEEP]:     "dashboardV2.toolNames.sleep",
  [STORAGE_KEYS.BABY_GROWTH]:    "dashboardV2.toolNames.growth",
  [STORAGE_KEYS.APPOINTMENTS]:   "dashboardV2.toolNames.appointments",
  [STORAGE_KEYS.SAVED_RESULTS]:  "dashboardV2.toolNames.saved",
};

const TRACKED_KEYS = Object.keys(TOOL_KEY_LABELS);

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

  // ── Toast on any tracked tool save ────────────────────────────────────────
  // Subscribe once. Throttle to 1.5s so rapid writes (e.g. kick counter)
  // collapse into a single toast. Auto-dismisses after 2s; sonner inherits
  // page direction from <html dir="…"> so RTL works without extra config,
  // but we pass `dir` explicitly to be safe.
  const lastToastAtRef = useRef(0);
  useEffect(() => {
    const unsubscribe = subscribeToData((payload) => {
      // Only react to saves originating from this tab — cross-tab "storage"
      // events would create noise on the dashboard while another tab is open.
      if (payload.source !== "self") return;

      const now = Date.now();
      if (now - lastToastAtRef.current < 1500) return;
      lastToastAtRef.current = now;

      const labelKey = TOOL_KEY_LABELS[payload.key];
      const message = labelKey
        ? t("dashboardV2.toasts.toolUpdated", "تم تحديث {{tool}}", {
            tool: t(labelKey),
          })
        : t("dashboardV2.toasts.dashboardUpdated", "تم تحديث لوحة التحكم");

      toast(message, {
        duration: 2000,
        // Sonner reads direction from the document <html dir="…">, which is
        // already kept in sync with the active language by ToolFrame/Layout.
        className: `text-sm rounded-2xl ${isRTL ? "text-right" : "text-left"}`,
      });
    }, TRACKED_KEYS);

    return unsubscribe;
  }, [t, isRTL]);

  const handleTabChange = useCallback((value: string) => {
    haptic("tap");
    const next = value as TabKey;
    try { sessionStorage.setItem(TAB_KEY, next); } catch {}
    setActiveTab(next);
  }, []);

  // Decorative parallax for the time-aware emblem
  const { scrollY } = useScroll();
  const emblemY = useTransform(scrollY, [0, 400], [0, -40]);
  const emblemOpacity = useTransform(scrollY, [0, 300], [0.9, 0]);
  const emblemScale = useTransform(scrollY, [0, 400], [1, 0.75]);

  // Time-aware emblem: morning sunrise → afternoon sun → evening moon → night sparkles
  const hour = new Date().getHours();
  const TimeEmblem =
    hour < 6  ? Moon :
    hour < 11 ? Sunrise :
    hour < 17 ? Sun :
    hour < 21 ? Sunrise :
                Moon;
  // Per-time gradient + glow color
  const emblemTone =
    hour < 6  ? { from: "from-indigo-400/30",  to: "to-violet-500/15", ring: "shadow-indigo-400/30",  icon: "text-indigo-400" } :
    hour < 11 ? { from: "from-amber-300/40",   to: "to-rose-300/15",   ring: "shadow-amber-300/40",   icon: "text-amber-500" } :
    hour < 17 ? { from: "from-yellow-300/40",  to: "to-orange-300/15", ring: "shadow-yellow-300/40",  icon: "text-amber-500" } :
    hour < 21 ? { from: "from-rose-400/35",    to: "to-purple-400/15", ring: "shadow-rose-400/30",    icon: "text-rose-500" } :
                { from: "from-violet-500/35",  to: "to-indigo-500/15", ring: "shadow-violet-500/30",  icon: "text-violet-400" };

  // Each tab gets its own gradient + accent for the active glass pill icon
  const tabs: Array<{
    key: TabKey; icon: typeof Sun; tKey: string;
    grad: string; activeIcon: string; iconShadow: string;
  }> = [
    { key: "today",    icon: Sun,        tKey: "dashboardV2.tabs.today",
      grad: "from-amber-400/90 to-orange-500/90",   activeIcon: "text-amber-500",  iconShadow: "drop-shadow-[0_1px_3px_hsl(35_95%_55%/0.55)]" },
    { key: "insights", icon: BarChart3,  tKey: "dashboardV2.tabs.insights",
      grad: "from-sky-400/90 to-cyan-500/90",       activeIcon: "text-sky-500",    iconShadow: "drop-shadow-[0_1px_3px_hsl(200_95%_55%/0.55)]" },
    { key: "archive",  icon: Calendar,   tKey: "dashboardV2.tabs.archive",
      grad: "from-emerald-400/90 to-teal-500/90",   activeIcon: "text-emerald-500",iconShadow: "drop-shadow-[0_1px_3px_hsl(160_85%_45%/0.55)]" },
    { key: "more",     icon: LayoutGrid, tKey: "dashboardV2.tabs.more",
      grad: "from-fuchsia-400/90 to-purple-500/90", activeIcon: "text-fuchsia-500",iconShadow: "drop-shadow-[0_1px_3px_hsl(290_85%_60%/0.55)]" },
  ];

  return (
    <Layout>
      <SEOHead
        title={t("dashboardV2.seo.title")}
        description={t("dashboardV2.seo.description")}
      />

      <main dir={isRTL ? "rtl" : "ltr"} className={`relative pb-24 bg-gradient-to-b ${trimesterTheme.gradient}`}>
        {/* Decorative rose — larger, centered, slightly lower */}
        <div
          className="pointer-events-none absolute top-6 sm:top-8 left-1/2 -translate-x-1/2 z-0 flex"
          dir="ltr"
          aria-hidden="true"
        >
          <motion.img
            src={roseLeft}
            alt=""
            width={88}
            height={88}
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
          {/* Sticky glass tab bar — frosted with subtle inner highlight */}
          <div
            className="sticky top-[3.25rem] sm:top-[4rem] z-30 px-3 sm:px-4 pt-2 pb-2
                       bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-2xl
                       border-b border-white/20 dark:border-white/5
                       shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.18)]"
          >
            <TabsList
              className="grid h-auto w-full grid-cols-4 gap-1 rounded-2xl p-1
                         bg-white/40 dark:bg-white/5
                         backdrop-blur-xl
                         border border-white/40 dark:border-white/10
                         shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.6),0_2px_8px_-2px_hsl(var(--primary)/0.08)]"
              aria-label={t("dashboardV2.header.sectionsAria")}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="relative flex h-12 sm:h-14 flex-col items-center justify-center gap-0.5
                               rounded-xl border-0 bg-transparent
                               text-[10px] font-bold transition-all duration-300
                               data-[state=active]:text-primary data-[state=active]:shadow-none
                               data-[state=inactive]:text-muted-foreground
                               data-[state=inactive]:hover:bg-white/30 dark:data-[state=inactive]:hover:bg-white/5"
                  >
                    {/* Glass pill behind active tab */}
                    {isActive && (
                      <motion.span
                        layoutId="dashboard-tab-glass"
                        className="absolute inset-0 rounded-xl
                                   bg-gradient-to-b from-white/80 to-white/50
                                   dark:from-white/15 dark:to-white/5
                                   backdrop-blur-md
                                   border border-white/60 dark:border-white/15
                                   shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.9),0_4px_12px_-4px_hsl(var(--primary)/0.25)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon
                      className={`relative z-10 h-[17px] w-[17px] sm:h-[18px] sm:w-[18px] transition-transform ${
                        isActive ? "scale-110 drop-shadow-[0_1px_2px_hsl(var(--primary)/0.35)]" : ""
                      }`}
                      strokeWidth={isActive ? 2.4 : 2}
                    />
                    <span className="relative z-10 leading-tight mt-0.5 text-[9px] sm:text-[10px] text-center px-0.5">
                      {t(tab.tKey)}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab contents */}
          <div className="container px-3 sm:px-4 pt-4">
            <TabsContent value="today" className="mt-0">
              <TodayTab />
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              <Suspense fallback={<DashboardTabSkeleton tab="insights" />}>
                <InsightsTab />
              </Suspense>
            </TabsContent>

            <TabsContent value="archive" className="mt-0">
              <Suspense fallback={<DashboardTabSkeleton tab="archive" />}>
                <ArchiveTab />
              </Suspense>
            </TabsContent>

            <TabsContent value="more" className="mt-0">
              <Suspense fallback={<DashboardTabSkeleton tab="more" />}>
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
