import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  FileText,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { safeParseLocalStorage, safeSaveToLocalStorage } from "@/lib/safeStorage";
import { formatLocalized } from "@/lib/dateLocale";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

/**
 * ResultsArchiveCalendar
 * --------------------------------------------------------------
 * يجمع كل نتائج المستخدم المحفوظة (من جميع الأقسام والأدوات)
 * من localStorage ويصنّفها حسب الشهر، لتكوين أرشيف زمني قابل
 * للتصفح بضغطة زر مع إمكانية عرض التفاصيل والحذف.
 * --------------------------------------------------------------
 */

interface ArchivedResult {
  id: string;
  toolId: string;
  toolName: string;
  date: string; // ISO
  preview: string;
  content: string;
  href: string;
  source: "saved" | "weekly" | "birthPlan" | "wellness" | "babyGrowth";
}

const labelsForTool = (
  source: ArchivedResult["source"],
  t: (k: string, d?: string) => string,
): { name: string; href: string } => {
  switch (source) {
    case "weekly":
      return { name: t("dashboard.recentResults.weeklySummary", "Weekly Summary"), href: "/tools/weekly-summary" };
    case "birthPlan":
      return { name: t("dashboard.recentResults.birthPlan", "Birth Plan"), href: "/tools/ai-birth-plan" };
    case "wellness":
      return { name: t("dashboard.recentResults.wellnessDiary", "Wellness Diary"), href: "/tools/wellness-diary" };
    case "babyGrowth":
      return { name: t("dashboard.recentResults.babyGrowth", "Baby Growth"), href: "/tools/baby-growth" };
    default:
      return { name: t("dashboard.archive.savedResult", "Saved Result"), href: "/dashboard" };
  }
};

function collectAllResults(t: (k: string, d?: string) => string): ArchivedResult[] {
  const out: ArchivedResult[] = [];

  // 1) Unified saved (SaveResultButton across all AI tools)
  try {
    const saved = safeParseLocalStorage<any[]>("ai-saved-results", [], (d): d is any[] => Array.isArray(d));
    saved.forEach((r) => {
      out.push({
        id: r.id,
        toolId: r.toolId || "saved",
        toolName: r.title || t("dashboard.archive.savedResult", "Saved Result"),
        date: r.savedAt,
        preview: (r.content || "").replace(/[#*_\n]/g, " ").slice(0, 120),
        content: r.content || "",
        href: "/dashboard",
        source: "saved",
      });
    });
  } catch {}

  // 2) Weekly summaries
  try {
    const weekly = safeParseLocalStorage<any[]>("weekly-summary-data", [], (d): d is any[] => Array.isArray(d));
    weekly.forEach((w) => {
      const meta = labelsForTool("weekly", t);
      out.push({
        id: "weekly-" + w.generatedAt,
        toolId: "weekly-summary",
        toolName: `${meta.name} — ${t("dashboard.recentResults.week", "Week")} ${w.week}`,
        date: w.generatedAt,
        preview: (w.content || "").replace(/[#*_\n]/g, " ").slice(0, 120),
        content: w.content || "",
        href: meta.href,
        source: "weekly",
      });
    });
  } catch {}

  // 3) Birth plans
  try {
    const plans = safeParseLocalStorage<any[]>("birthPlans", [], (d): d is any[] => Array.isArray(d));
    plans.forEach((p) => {
      const meta = labelsForTool("birthPlan", t);
      out.push({
        id: "plan-" + p.id,
        toolId: "ai-birth-plan",
        toolName: meta.name,
        date: p.date,
        preview: (p.generatedPlan || "").replace(/[#*_\n]/g, " ").slice(0, 120),
        content: p.generatedPlan || "",
        href: meta.href,
        source: "birthPlan",
      });
    });
  } catch {}

  // 4) Wellness diary
  try {
    const entries = safeParseLocalStorage<any[]>("wellness-diary-entries", [], (d): d is any[] => Array.isArray(d));
    entries
      .filter((e) => e.aiInsight && e.aiInsight.length > 10)
      .forEach((e) => {
        const meta = labelsForTool("wellness", t);
        out.push({
          id: "wellness-" + e.id,
          toolId: "wellness-diary",
          toolName: meta.name,
          date: e.date,
          preview: (e.aiInsight || "").replace(/[#*_\n]/g, " ").slice(0, 120),
          content: e.aiInsight || "",
          href: meta.href,
          source: "wellness",
        });
      });
  } catch {}

  // 5) Baby growth entries
  try {
    const grow = safeParseLocalStorage<any[]>("baby-growth-entries", [], (d): d is any[] => Array.isArray(d));
    grow.forEach((g) => {
      const meta = labelsForTool("babyGrowth", t);
      out.push({
        id: "grow-" + g.id,
        toolId: "baby-growth",
        toolName: meta.name,
        date: g.date,
        preview: `${g.weight}kg / ${g.height}cm — ${t("dashboard.recentResults.month", "Month")} ${g.ageMonths}`,
        content: `Weight: ${g.weight}kg\nHeight: ${g.height}cm\nAge: ${g.ageMonths} months`,
        href: meta.href,
        source: "babyGrowth",
      });
    });
  } catch {}

  return out
    .filter((r) => r.date && !isNaN(new Date(r.date).getTime()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function deleteResult(item: ArchivedResult) {
  try {
    if (item.source === "saved") {
      const arr = safeParseLocalStorage<any[]>("ai-saved-results", [], (d): d is any[] => Array.isArray(d));
      safeSaveToLocalStorage("ai-saved-results", arr.filter((r) => r.id !== item.id));
    } else if (item.source === "weekly") {
      const arr = safeParseLocalStorage<any[]>("weekly-summary-data", [], (d): d is any[] => Array.isArray(d));
      safeSaveToLocalStorage("weekly-summary-data", arr.filter((r) => "weekly-" + r.generatedAt !== item.id));
    } else if (item.source === "birthPlan") {
      const arr = safeParseLocalStorage<any[]>("birthPlans", [], (d): d is any[] => Array.isArray(d));
      safeSaveToLocalStorage("birthPlans", arr.filter((r) => "plan-" + r.id !== item.id));
    } else if (item.source === "wellness") {
      const arr = safeParseLocalStorage<any[]>("wellness-diary-entries", [], (d): d is any[] => Array.isArray(d));
      safeSaveToLocalStorage("wellness-diary-entries", arr.filter((r) => "wellness-" + r.id !== item.id));
    } else if (item.source === "babyGrowth") {
      const arr = safeParseLocalStorage<any[]>("baby-growth-entries", [], (d): d is any[] => Array.isArray(d));
      safeSaveToLocalStorage("baby-growth-entries", arr.filter((r) => "grow-" + r.id !== item.id));
    }
  } catch {}
}

export function ResultsArchiveCalendar() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const [expanded, setExpanded] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month
  const [openId, setOpenId] = useState<string | null>(null);
  const [tick, setTick] = useState(0); // force refresh after deletion

  const tHelper = (k: string, d?: string) => t(k, d ?? k) as string;
  const all = useMemo(() => collectAllResults(tHelper), [t, tick]);

  // Group by year-month key
  const monthGroups = useMemo(() => {
    const map = new Map<string, ArchivedResult[]>();
    all.forEach((r) => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return map;
  }, [all]);

  // Build month list (descending) — only months that have results
  const availableMonths = useMemo(() => Array.from(monthGroups.keys()).sort((a, b) => b.localeCompare(a)), [monthGroups]);

  if (availableMonths.length === 0) return null;

  const safeOffset = Math.max(0, Math.min(monthOffset, availableMonths.length - 1));
  const activeMonthKey = availableMonths[safeOffset];
  const [year, month] = activeMonthKey.split("-").map(Number);
  const activeDate = new Date(year, month, 1);
  const monthLabel = formatLocalized(activeDate, "MMMM yyyy", i18n.language);
  const monthResults = monthGroups.get(activeMonthKey) || [];

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-card via-card to-primary/[0.03]">
      <CardContent className="p-4">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between gap-2"
          aria-expanded={expanded}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarDays className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="text-start">
              <h3 className="text-sm font-bold text-foreground">
                {t("dashboard.archive.title", "أرشيف نتائجي")}
              </h3>
              <p className="text-[10px] text-muted-foreground">
                {t("dashboard.archive.subtitle", "{{count}} نتيجة عبر {{months}} شهراً", {
                  count: all.length,
                  months: availableMonths.length,
                })}
              </p>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {/* Month selector */}
              <div className="mt-4 flex items-center justify-between bg-muted/40 rounded-xl p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setMonthOffset((o) => Math.min(availableMonths.length - 1, o + 1))}
                  disabled={safeOffset >= availableMonths.length - 1}
                  aria-label={t("dashboard.archive.prev", "Previous month")}
                >
                  <PrevIcon className="w-4 h-4" />
                </Button>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{monthLabel}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {t("dashboard.archive.entriesCount", "{{count}} نتيجة", { count: monthResults.length })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
                  disabled={safeOffset <= 0}
                  aria-label={t("dashboard.archive.next", "Next month")}
                >
                  <NextIcon className="w-4 h-4" />
                </Button>
              </div>

              {/* Results list */}
              <div className="mt-3 space-y-2 max-h-[420px] overflow-y-auto">
                {monthResults.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    {t("dashboard.archive.empty", "لا توجد نتائج هذا الشهر")}
                  </p>
                ) : (
                  monthResults.map((r) => (
                    <div key={r.id} className="rounded-xl bg-muted/30 border border-border/30 overflow-hidden">
                      <div className="flex items-start gap-2 p-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{r.toolName}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatLocalized(r.date, "d MMM yyyy", i18n.language)}
                          </p>
                          <p className="text-[10px] text-muted-foreground/80 line-clamp-2 mt-0.5">{r.preview}</p>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-[10px] px-2"
                            onClick={() => setOpenId(openId === r.id ? null : r.id)}
                          >
                            {openId === r.id
                              ? t("dashboard.archive.hide", "إخفاء")
                              : t("dashboard.archive.view", "عرض")}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2"
                            onClick={() => {
                              deleteResult(r);
                              setTick((n) => n + 1);
                              if (openId === r.id) setOpenId(null);
                            }}
                            aria-label={t("dashboard.archive.delete", "Delete")}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {openId === r.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 pt-1 max-h-[260px] overflow-y-auto border-t border-border/30 bg-background/60">
                              <MarkdownRenderer content={r.content} />
                              <Link
                                to={r.href}
                                className="block text-center text-[11px] text-primary font-semibold mt-2 hover:underline"
                              >
                                {t("dashboard.archive.openTool", "فتح الأداة")} →
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
