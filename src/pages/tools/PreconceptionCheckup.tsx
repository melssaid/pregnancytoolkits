import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp, Info,
  Heart, Droplets, Shield, Brain, Stethoscope, Pill, Syringe,
  Sparkles, Calendar, ShieldCheck
} from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { RelatedToolLinks } from "@/components/RelatedToolLinks";

// ── Category definitions with themed icons ─────────────────────────────
const CATEGORIES = [
  {
    key: "essential",
    icon: Heart,
    colorClass: "text-[hsl(340,60%,55%)]",
    bgClass: "bg-[hsl(340,60%,55%,0.1)]",
    borderClass: "border-[hsl(340,60%,55%,0.2)]",
    checks: ["generalCheckup", "bloodWork", "thyroid"],
  },
  {
    key: "screening",
    icon: Shield,
    colorClass: "text-[hsl(280,45%,55%)]",
    bgClass: "bg-[hsl(280,45%,55%,0.1)]",
    borderClass: "border-[hsl(280,45%,55%,0.2)]",
    checks: ["pap", "rubella", "hepatitis", "hiv"],
  },
  {
    key: "specialized",
    icon: Stethoscope,
    colorClass: "text-[hsl(200,50%,50%)]",
    bgClass: "bg-[hsl(200,50%,50%,0.1)]",
    borderClass: "border-[hsl(200,50%,50%,0.2)]",
    checks: ["dental", "geneticScreening", "mentalHealth"],
  },
  {
    key: "medications",
    icon: Pill,
    colorClass: "text-[hsl(160,40%,45%)]",
    bgClass: "bg-[hsl(160,40%,45%,0.1)]",
    borderClass: "border-[hsl(160,40%,45%,0.2)]",
    checks: ["medications", "vaccinations"],
  },
];

const ALL_CHECKS = CATEGORIES.flatMap(c => c.checks);
const STORAGE_KEY = "preconception-checkup-completed";

export default function PreconceptionCheckup() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const dir = isRTL ? "rtl" : "ltr";

  // Persistent state
  const [completed, setCompleted] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [expandedCats, setExpandedCats] = useState<string[]>(
    () => CATEGORIES.map(c => c.key) // all expanded by default
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }, [completed]);

  const toggle = useCallback((key: string) => {
    setCompleted(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }, []);

  const toggleCategory = useCallback((catKey: string) => {
    setExpandedCats(prev =>
      prev.includes(catKey) ? prev.filter(k => k !== catKey) : [...prev, catKey]
    );
  }, []);

  const totalChecks = ALL_CHECKS.length;
  const completedCount = completed.length;
  const progress = Math.round((completedCount / totalChecks) * 100);
  const allDone = completedCount === totalChecks;

  // AI prompt based on completion status
  const aiPrompt = useMemo(() => {
    const completedNames = completed.map(k =>
      t(`toolsInternal.preconceptionCheckup.checks.${k}.title`)
    );
    const pendingNames = ALL_CHECKS.filter(k => !completed.includes(k)).map(k =>
      t(`toolsInternal.preconceptionCheckup.checks.${k}.title`)
    );

    return `Based on a preconception health preparation checklist:

Completed screenings: ${completedNames.length > 0 ? completedNames.join(", ") : "None yet"}
Pending screenings: ${pendingNames.length > 0 ? pendingNames.join(", ") : "All completed!"}
Progress: ${progress}%

Please provide:
## ${t('toolsInternal.preconceptionCheckup.ai.readinessTitle', 'Readiness Overview')}
A brief assessment of preparation progress

## ${t('toolsInternal.preconceptionCheckup.ai.priorityTitle', 'Priority Recommendations')}
Which pending items to prioritize and why

## ${t('toolsInternal.preconceptionCheckup.ai.tipsTitle', 'Helpful Tips')}
General wellness tips for preconception preparation

## ${t('toolsInternal.preconceptionCheckup.ai.timelineTitle', 'Suggested Timeline')}
A practical timeline for completing remaining items

Important: Frame all advice as general educational information, not medical directives.`;
  }, [completed, progress, t]);

  return (
    <ToolFrame
      title={t('tools.preconceptionCheckup.title')}
      subtitle={t('tools.preconceptionCheckup.description')}
      mood="empowering"
      toolId="preconception-checkup"
    >
      <div className="space-y-4 pb-16" dir={dir} style={{ textAlign: isRTL ? "right" : "left" }}>

        {/* ── Progress Header ──────────────────────────────────────── */}
        <Card className="overflow-hidden border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {completedCount}/{totalChecks}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {t('toolsInternal.preconceptionCheckup.progressLabel', 'Screenings tracked')}
                  </p>
                </div>
              </div>
              <div className="text-end">
                <p className="text-lg font-bold text-primary">{progress}%</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(340 65% 60%), hsl(280 50% 60%))' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>

            {/* Completion celebration */}
            <AnimatePresence>
              {allDone && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-accent/10 border border-accent/20"
                >
                  <Sparkles className="w-4 h-4 text-accent shrink-0" />
                  <p className="text-xs font-medium text-accent">
                    {t('toolsInternal.preconceptionCheckup.allComplete', 'Great preparation! Discuss your results with your healthcare provider.')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* ── Categorized Checks ──────────────────────────────────── */}
        {CATEGORIES.map((cat, catIdx) => {
          const CatIcon = cat.icon;
          const isExpanded = expandedCats.includes(cat.key);
          const catCompleted = cat.checks.filter(k => completed.includes(k)).length;
          const catTotal = cat.checks.length;
          const catDone = catCompleted === catTotal;

          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.08 }}
            >
              <Card className={`overflow-hidden border ${catDone ? 'border-accent/30 bg-accent/3' : cat.borderClass}`}>
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(cat.key)}
                  className="w-full p-3.5 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-xl ${cat.bgClass} flex items-center justify-center shrink-0`}>
                    <CatIcon className={`w-4 h-4 ${cat.colorClass}`} />
                  </div>
                  <div className="flex-1 min-w-0 text-start">
                    <p className="text-sm font-bold text-foreground truncate">
                      {t(`toolsInternal.preconceptionCheckup.categories.${cat.key}`)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {catCompleted}/{catTotal} {t('toolsInternal.preconceptionCheckup.tracked', 'tracked')}
                    </p>
                  </div>
                  {/* Mini progress dots */}
                  <div className="flex items-center gap-1 me-1">
                    {cat.checks.map(ck => (
                      <div
                        key={ck}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          completed.includes(ck) ? 'bg-accent' : 'bg-muted-foreground/20'
                        }`}
                      />
                    ))}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                  )}
                </button>

                {/* Expandable checks */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 space-y-1.5">
                        {cat.checks.map((key, i) => {
                          const isDone = completed.includes(key);
                          return (
                            <motion.div
                              key={key}
                              initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                            >
                              <button
                                onClick={() => toggle(key)}
                                className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-start ${
                                  isDone
                                    ? 'bg-accent/5 border-accent/20'
                                    : 'bg-card border-border/50 hover:border-primary/20 hover:bg-primary/3'
                                }`}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                ) : (
                                  <Circle className="w-5 h-5 text-muted-foreground/30 shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-[13px] font-semibold leading-snug ${
                                    isDone ? 'text-muted-foreground line-through' : 'text-foreground'
                                  }`}>
                                    {t(`toolsInternal.preconceptionCheckup.checks.${key}.title`)}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground/70 mt-1 leading-relaxed">
                                    {t(`toolsInternal.preconceptionCheckup.checks.${key}.description`)}
                                  </p>
                                </div>
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}

        {/* ── AI Analysis ─────────────────────────────────────────── */}
        {completedCount > 0 && (
          <AIInsightCard
            title={t('toolsInternal.preconceptionCheckup.ai.title', 'Preparation Insights')}
            prompt={aiPrompt}
            variant="compact"
            buttonText={t('toolsInternal.preconceptionCheckup.ai.analyze', 'Analyze My Preparation')}
          />
        )}

        {/* ── Related Tools ──────────────────────────────────────── */}
        <RelatedToolLinks links={[
          { to: "/tools/fertility-academy", titleKey: "toolsInternal.preconceptionCheckup.related.academy", titleFallback: "Fertility Academy", descKey: "toolsInternal.preconceptionCheckup.related.academyDesc", descFallback: "Comprehensive fertility education", icon: "book-open" },
          { to: "/tools/nutrition-supplements", titleKey: "toolsInternal.preconceptionCheckup.related.nutrition", titleFallback: "Nutrition Guide", descKey: "toolsInternal.preconceptionCheckup.related.nutritionDesc", descFallback: "Preconception nutrition & supplements", icon: "apple" },
        ]} />

        {/* ── Professional Compliance Notice ──────────────────────── */}
        <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 border border-border/30 p-3.5">
          <ShieldCheck className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0" />
          <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
            {t('toolsInternal.preconceptionCheckup.disclaimer', 
              'This checklist is an educational reference to help you organize conversations with your healthcare provider. It does not replace professional medical advice, diagnosis, or treatment. All screenings and tests should be discussed with and ordered by a qualified healthcare professional.'
            )}
          </p>
        </div>
      </div>
    </ToolFrame>
  );
}
