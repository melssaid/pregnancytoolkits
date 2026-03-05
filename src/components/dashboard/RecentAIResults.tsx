import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, FileText, Star, Activity, ChevronRight, ChevronLeft, 
  Clock, Stethoscope, Baby 
} from "lucide-react";
import { safeParseLocalStorage } from "@/lib/safeStorage";

interface AIResult {
  id: string;
  toolName: string;
  toolIcon: React.ComponentType<{ className?: string }>;
  preview: string;
  date: string;
  href: string;
}

function getRecentAIResults(t: (key: string) => string): AIResult[] {
  const results: AIResult[] = [];

  // 1. Weekly Summary
  try {
    const summaries = safeParseLocalStorage<{ week: number; content: string; generatedAt: string }[]>(
      "weekly-summary-data", [], (d): d is any[] => Array.isArray(d)
    );
    if (summaries.length > 0) {
      const latest = summaries[0];
      results.push({
        id: "weekly-summary-" + latest.generatedAt,
        toolName: t('dashboard.recentResults.weeklySummary'),
        toolIcon: Star,
        preview: `${t('dashboard.recentResults.week')} ${latest.week} — ${latest.content.slice(0, 80)}...`,
        date: latest.generatedAt,
        href: "/tools/weekly-summary",
      });
    }
  } catch {}

  // 2. Birth Plan
  try {
    const plans = safeParseLocalStorage<{ id: string; date: string; generatedPlan: string }[]>(
      "birthPlans", [], (d): d is any[] => Array.isArray(d)
    );
    if (plans.length > 0) {
      const latest = plans[0];
      results.push({
        id: "birth-plan-" + latest.id,
        toolName: t('dashboard.recentResults.birthPlan'),
        toolIcon: FileText,
        preview: latest.generatedPlan.replace(/[#*_\n]/g, ' ').slice(0, 80) + "...",
        date: latest.date,
        href: "/tools/ai-birth-plan",
      });
    }
  } catch {}

  // 3. Wellness Diary (Symptom Analyzer)
  try {
    const entries = safeParseLocalStorage<{ id: string; date: string; aiInsight?: string; symptoms: string[] }[]>(
      "wellness-diary-entries", [], (d): d is any[] => Array.isArray(d)
    );
    const withAI = entries.filter(e => e.aiInsight && e.aiInsight.length > 10);
    if (withAI.length > 0) {
      const latest = withAI[0];
      results.push({
        id: "wellness-" + latest.id,
        toolName: t('dashboard.recentResults.wellnessDiary'),
        toolIcon: Stethoscope,
        preview: (latest.aiInsight || '').replace(/[#*_\n]/g, ' ').slice(0, 80) + "...",
        date: latest.date,
        href: "/tools/wellness-diary",
      });
    }
  } catch {}

  // 5. Baby Growth
  try {
    const entries = safeParseLocalStorage<{ id: string; date: string; weight: number; height: number; ageMonths: number }[]>(
      "baby-growth-entries", [], (d): d is any[] => Array.isArray(d)
    );
    if (entries.length > 0) {
      const latest = entries[0];
      results.push({
        id: "baby-growth-" + latest.id,
        toolName: t('dashboard.recentResults.babyGrowth'),
        toolIcon: Baby,
        preview: `${latest.weight}kg / ${latest.height}cm — ${t('dashboard.recentResults.month')} ${latest.ageMonths}`,
        date: latest.date,
        href: "/tools/baby-growth",
      });
    }
  } catch {}

  // Sort by date descending, take top 3
  return results
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
}

function formatRelativeDate(dateStr: string, t: (key: string) => string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return t('dashboard.recentResults.justNow');
    if (diffMin < 60) return `${diffMin}${t('dashboard.recentResults.minAgo')}`;
    if (diffHrs < 24) return `${diffHrs}${t('dashboard.recentResults.hrsAgo')}`;
    if (diffDays < 7) return `${diffDays}${t('dashboard.recentResults.daysAgo')}`;
    return date.toLocaleDateString();
  } catch {
    return "";
  }
}

export function RecentAIResults() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
  
  const results = useMemo(() => getRecentAIResults(t), [t]);

  if (results.length === 0) return null;

  return (
    <Card className="overflow-hidden card-pink-top">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          {t('dashboard.recentResults.title')}
        </h3>
        <div className="space-y-2">
          {results.map((result, i) => {
            const Icon = result.toolIcon;
            return (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link to={result.href}>
                  <div className="group flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-primary/8 border border-transparent hover:border-primary/20 transition-all">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mt-0.5 transition-colors">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-foreground">{result.toolName}</span>
                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {formatRelativeDate(result.date, t)}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {result.preview}
                      </p>
                    </div>
                    <ChevronIcon className="flex-shrink-0 w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary/60 mt-2 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
