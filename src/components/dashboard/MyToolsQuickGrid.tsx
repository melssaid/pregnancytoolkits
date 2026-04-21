import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  Scale,
  Pill,
  Baby,
  ShoppingBag,
  Briefcase,
  Stethoscope,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { safeParseLocalStorage } from "@/lib/safeStorage";

/**
 * MyToolsQuickGrid
 * --------------------------------------------------------------
 * شبكة بطاقات احترافية للأدوات الشخصية التي يدخل فيها المستخدم
 * بياناته يومياً، مع عرض آخر إدخال/عدد. تُربط مع التقويم الأرشيفي
 * (ResultsArchiveCalendar) لتوفير ملاحة سلسة.
 * --------------------------------------------------------------
 */

interface ToolItem {
  id: string;
  href: string;
  icon: any;
  labelKey: string;
  labelDefault: string;
  count: number;
  lastDate?: string;
  color: string;
  ring: string;
}

function getUserId(): string | null {
  try { return localStorage.getItem("pregnancy_user_id"); } catch { return null; }
}

function safeArr(key: string): any[] {
  return safeParseLocalStorage<any[]>(key, [], (d): d is any[] => Array.isArray(d));
}

function lastDateOf(arr: any[], dateField: string): string | undefined {
  if (!arr.length) return undefined;
  const sorted = [...arr]
    .map((r) => r[dateField])
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  return sorted[0];
}

export function MyToolsQuickGrid() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  const items = useMemo<ToolItem[]>(() => {
    const uid = getUserId();
    const kicks = uid ? safeArr(`kick_sessions_${uid}`).filter((k) => k.ended_at) : [];
    const vits = uid ? safeArr(`vitamin_logs_${uid}`) : [];
    const contractions = safeArr("contraction_timer_data");
    const weights = safeArr("weight_gain_entries");
    const diapers = safeArr("diaperEntries");
    const groceries = safeArr("pregnancyGroceryList");
    const bag = safeArr("hospital-bag-items");
    const symptoms = safeArr("quick_symptom_logs");
    const wellness = safeArr("wellness-diary-entries");
    const birthPlans = safeArr("birthPlans");

    const list: ToolItem[] = [
      {
        id: "kicks", href: "/tools/kick-counter", icon: Activity,
        labelKey: "dashboard.myTools.kicks", labelDefault: "حركات الجنين",
        count: kicks.length, lastDate: lastDateOf(kicks, "started_at"),
        color: "text-pink-500", ring: "from-pink-500/15 to-pink-500/5",
      },
      {
        id: "contractions", href: "/tools/contraction-timer", icon: Heart,
        labelKey: "dashboard.myTools.contractions", labelDefault: "انقباضات",
        count: contractions.length, lastDate: lastDateOf(contractions, "startTime"),
        color: "text-red-500", ring: "from-red-500/15 to-red-500/5",
      },
      {
        id: "weight", href: "/tools/weight-gain", icon: Scale,
        labelKey: "dashboard.myTools.weight", labelDefault: "الوزن",
        count: weights.length, lastDate: lastDateOf(weights, "date"),
        color: "text-blue-500", ring: "from-blue-500/15 to-blue-500/5",
      },
      {
        id: "vitamins", href: "/tools/vitamin-tracker", icon: Pill,
        labelKey: "dashboard.myTools.vitamins", labelDefault: "فيتامينات",
        count: vits.length, lastDate: lastDateOf(vits, "taken_at"),
        color: "text-orange-500", ring: "from-orange-500/15 to-orange-500/5",
      },
      {
        id: "diaper", href: "/tools/diaper-tracker", icon: Baby,
        labelKey: "dashboard.myTools.diaper", labelDefault: "حفاضات الطفل",
        count: diapers.length, lastDate: lastDateOf(diapers, "timestamp") || lastDateOf(diapers, "date"),
        color: "text-cyan-500", ring: "from-cyan-500/15 to-cyan-500/5",
      },
      {
        id: "symptoms", href: "/tools/wellness-diary", icon: Stethoscope,
        labelKey: "dashboard.myTools.symptoms", labelDefault: "يوميات العافية",
        count: symptoms.length + wellness.length,
        lastDate: lastDateOf([...symptoms, ...wellness], "date"),
        color: "text-fuchsia-500", ring: "from-fuchsia-500/15 to-fuchsia-500/5",
      },
      {
        id: "grocery", href: "/tools/smart-grocery-list", icon: ShoppingBag,
        labelKey: "dashboard.myTools.grocery", labelDefault: "قائمة التسوق",
        count: groceries.length,
        color: "text-lime-500", ring: "from-lime-500/15 to-lime-500/5",
      },
      {
        id: "bag", href: "/tools/ai-hospital-bag", icon: Briefcase,
        labelKey: "dashboard.myTools.hospitalBag", labelDefault: "حقيبة المستشفى",
        count: bag.length,
        color: "text-violet-500", ring: "from-violet-500/15 to-violet-500/5",
      },
      {
        id: "birthPlan", href: "/tools/ai-birth-plan", icon: Sparkles,
        labelKey: "dashboard.myTools.birthPlan", labelDefault: "خطة الولادة",
        count: birthPlans.length, lastDate: lastDateOf(birthPlans, "date"),
        color: "text-rose-500", ring: "from-rose-500/15 to-rose-500/5",
      },
    ];

    // Show only items the user has interacted with (count > 0). If none, show top 4 as suggestions.
    const withData = list.filter((i) => i.count > 0);
    return withData.length > 0 ? withData : list.slice(0, 4);
  }, []);

  if (items.length === 0) return null;

  return (
    <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-card via-card to-primary/[0.03]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            {t("dashboard.myTools.title", "أدواتي")}
          </h3>
          <span className="text-[10px] text-muted-foreground">
            {t("dashboard.myTools.subtitle", "اضغطي لمتابعة بياناتك")}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={it.href}
                  className={`group relative block rounded-2xl p-2.5 bg-gradient-to-br ${it.ring} border border-border/40 hover:border-primary/40 hover:shadow-md transition-all`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className={`w-7 h-7 rounded-xl bg-background/70 backdrop-blur flex items-center justify-center ${it.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    {it.count > 0 && (
                      <span className={`text-[10px] font-extrabold ${it.color}`}>{it.count}</span>
                    )}
                  </div>
                  <p className="text-[10px] font-semibold text-foreground leading-tight line-clamp-2">
                    {t(it.labelKey, it.labelDefault)}
                  </p>
                  <Chevron className="absolute bottom-1.5 end-1.5 w-2.5 h-2.5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        <p className="text-[9px] text-muted-foreground/70 text-center mt-3">
          {t("dashboard.myTools.archiveHint", "💡 جميع البيانات تُحفظ يومياً في «أرشيف نتائجي» أدناه")}
        </p>
      </CardContent>
    </Card>
  );
}
