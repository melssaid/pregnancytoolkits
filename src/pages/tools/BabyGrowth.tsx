import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ToolFrame } from "@/components/ToolFrame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Baby, Plus, Trash2, ChevronDown, ChevronUp, Ruler, Gauge, CircleDot, Brain, TrendingUp, Sparkles, Loader2, RefreshCw, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatLocalized } from "@/lib/dateLocale";
import { useLanguage } from "@/contexts/LanguageContext";
import { BabyGrowthChart } from "@/components/charts/BabyGrowthChart";
import { toast } from "sonner";
import { useSmartInsight } from "@/hooks/useSmartInsight";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { AIActionButton } from "@/components/ai/AIActionButton";
import { emitDataChange, STORAGE_KEYS } from "@/lib/dataBus";

interface GrowthEntry {
  id: string;
  date: string;
  ageMonths: number;
  weight: number;
  height?: number;
  headCirc?: number;
  gender: "boy" | "girl";
}

const STORAGE_KEY = "baby-growth-entries";

const WHO_WEIGHT_BOYS = [
  { month: 0, p3: 2.5, p50: 3.3, p97: 4.3 },
  { month: 3, p3: 5.1, p50: 6.4, p97: 7.9 },
  { month: 6, p3: 6.4, p50: 7.9, p97: 9.7 },
  { month: 9, p3: 7.2, p50: 9.0, p97: 11.0 },
  { month: 12, p3: 7.8, p50: 9.6, p97: 11.8 },
  { month: 18, p3: 8.6, p50: 10.9, p97: 13.5 },
  { month: 24, p3: 9.7, p50: 12.2, p97: 15.1 },
];

const WHO_WEIGHT_GIRLS = [
  { month: 0, p3: 2.4, p50: 3.2, p97: 4.2 },
  { month: 3, p3: 4.6, p50: 5.8, p97: 7.3 },
  { month: 6, p3: 5.8, p50: 7.3, p97: 9.1 },
  { month: 9, p3: 6.6, p50: 8.2, p97: 10.2 },
  { month: 12, p3: 7.1, p50: 8.9, p97: 11.2 },
  { month: 18, p3: 8.0, p50: 10.2, p97: 12.8 },
  { month: 24, p3: 9.0, p50: 11.5, p97: 14.5 },
];

const BabyGrowth = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [entries, setEntries] = useState<GrowthEntry[]>([]);
  const [gender, setGender] = useState<"boy" | "girl">("boy");
  const [ageMonths, setAgeMonths] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [headCirc, setHeadCirc] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  const { generate, isLoading: aiLoading, content: aiResult, reset } = useSmartInsight({
    section: 'pregnancy-plan',
    toolType: 'baby-growth-analysis',
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setEntries(JSON.parse(saved)); } catch { /* */ }
    }
  }, []);

  const lang = currentLanguage?.split("-")[0] || "en";

  const runAIAnalysis = async () => {
    const data = entries.slice(0, 10).map(e => ({
      age: e.ageMonths, weight: e.weight, height: e.height, head: e.headCirc, gender: e.gender
    }));
    const latestAge = entries.length > 0 ? entries[entries.length - 1].ageMonths : 6;
    const prompt = `As a pediatric wellness guide, provide a comprehensive, warm analysis for a baby. Do NOT use clinical or diagnostic terms.\n\n**Growth Entries:**\n${data.map(d => `- ${d.age} months: ${d.weight}kg${d.height ? `, ${d.height}cm` : ''}${d.head ? `, head ${d.head}cm` : ''} (${d.gender})`).join('\n')}\n\nCover these areas concisely:\n1. **📊 Growth Pattern** - Overall trend and how it compares to typical growth\n2. **🍼 Nutrition Tips** - Age-appropriate feeding advice for ${latestAge} months\n3. **🧒 Milestones** - Key developmental milestones at this age\n4. **💡 Tips** - Practical suggestions for healthy growth\n\nWrite in ${lang}. Be warm, encouraging, and concise.`;
    await generate({ prompt });
  };

  const getPercentileInfo = useCallback((age: number, w: number, g: "boy" | "girl") => {
    const standards = g === "boy" ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS;
    let closest = standards[0];
    for (const s of standards) {
      if (s.month <= age) closest = s;
    }
    if (w < closest.p3) return { percentile: "<3%", status: "underweight" as const, color: "text-amber-500" };
    if (w < closest.p50) return { percentile: "3-50%", status: "normal" as const, color: "text-emerald-500" };
    if (w < closest.p97) return { percentile: "50-97%", status: "normal" as const, color: "text-emerald-500" };
    return { percentile: ">97%", status: "overweight" as const, color: "text-amber-500" };
  }, []);

  const getExpectedRange = useCallback((age: number, g: "boy" | "girl") => {
    const standards = g === "boy" ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS;
    let closest = standards[0];
    for (const s of standards) {
      if (s.month <= age) closest = s;
    }
    return { min: closest.p3, max: closest.p97 };
  }, []);

  const canSave = ageMonths !== "" && weight !== "" && parseFloat(weight) > 0;

  const saveEntry = () => {
    const age = parseInt(ageMonths);
    const w = parseFloat(weight);
    if (isNaN(age) || isNaN(w) || w <= 0) return;

    const newEntry: GrowthEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ageMonths: age,
      weight: w,
      height: height ? parseFloat(height) : undefined,
      headCirc: headCirc ? parseFloat(headCirc) : undefined,
      gender,
    };

    const updated = [newEntry, ...entries].sort((a, b) => a.ageMonths - b.ageMonths);
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    emitDataChange(STORAGE_KEYS.BABY_GROWTH);

    setAgeMonths("");
    setWeight("");
    setHeight("");
    setHeadCirc("");
    setShowOptional(false);
    toast.success(t('toolsInternal.babyGrowth.saved'));
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    emitDataChange(STORAGE_KEYS.BABY_GROWTH);
    toast.success(t('toolsInternal.babyGrowth.deleted'));
  };

  const livePercentile = canSave
    ? getPercentileInfo(parseInt(ageMonths), parseFloat(weight), gender)
    : null;
  const liveRange = ageMonths ? getExpectedRange(parseInt(ageMonths), gender) : null;

  return (
    <ToolFrame 
      title={t('tools.babyGrowth.title')} 
      subtitle={t('toolsInternal.babyGrowth.subtitle')}
      customIcon="baby-growth"
      mood="joyful"
      toolId="baby-growth"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4 pb-16"
      >
        {/* ── Gender Toggle ── */}
        <div className="flex gap-2">
          {(["boy", "girl"] as const).map((g) => (
            <motion.button
              key={g}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGender(g)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                gender === g
                  ? g === "boy"
                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-2 border-blue-500/30"
                    : "bg-pink-500/15 text-pink-600 dark:text-pink-400 border-2 border-pink-500/30"
                  : "bg-muted/50 text-muted-foreground border-2 border-transparent"
              }`}
            >
              {g === "boy" ? "👦" : "👧"} {t(`toolsInternal.babyGrowth.${g}`)}
            </motion.button>
          ))}
        </div>

        {/* ── Input Card ── */}
        <div className="rounded-2xl bg-card border border-border/50 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t('toolsInternal.babyGrowth.ageMonths')}</Label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  max="24"
                  inputMode="numeric"
                  placeholder="0-24"
                  value={ageMonths}
                  onChange={(e) => setAgeMonths(e.target.value)}
                  className="pe-10 text-base h-12 rounded-xl"
                />
                <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {t('toolsInternal.babyGrowth.monthUnit')}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t('toolsInternal.babyGrowth.weightKg')} *</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="pe-10 text-base h-12 rounded-xl"
                />
                <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">kg</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowOptional(!showOptional)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showOptional ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {t('toolsInternal.babyGrowth.optionalMeasurements')}
          </button>

          <AnimatePresence>
            {showOptional && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Ruler className="w-3 h-3" />
                      {t('toolsInternal.babyGrowth.heightCm')}
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.1"
                        inputMode="decimal"
                        placeholder="0.0"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="pe-10 h-11 rounded-xl"
                      />
                      <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">cm</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <CircleDot className="w-3 h-3" />
                      {t('toolsInternal.babyGrowth.headCircCm')}
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.1"
                        inputMode="decimal"
                        placeholder="0.0"
                        value={headCirc}
                        onChange={(e) => setHeadCirc(e.target.value)}
                        className="pe-10 h-11 rounded-xl"
                      />
                      <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">cm</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Live Percentile Preview ── */}
          <AnimatePresence>
            {livePercentile && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-xl bg-muted/50 p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{t('toolsInternal.babyGrowth.weightPercentile')}</span>
                  <span className={`text-sm font-bold ${livePercentile.color}`}>
                    {livePercentile.percentile}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{t('toolsInternal.babyGrowth.status.label')}</span>
                  <span className={`text-xs font-medium ${livePercentile.color}`}>
                    {t(`toolsInternal.babyGrowth.status.${livePercentile.status === "normal" ? "normal" : livePercentile.status === "underweight" ? "belowNormal" : "aboveNormal"}`)}
                  </span>
                </div>
                {liveRange && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{t('toolsInternal.babyGrowth.normalRange')}</span>
                    <span className="text-xs font-medium text-foreground">
                      {liveRange.min} – {liveRange.max} kg
                    </span>
                  </div>
                )}

                <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                  {liveRange && (
                    <>
                      <div className="absolute inset-y-0 bg-emerald-500/30 rounded-full"
                        style={{
                          left: `${(liveRange.min / liveRange.max) * 50}%`,
                          right: `${100 - 85}%`,
                        }}
                      />
                      <motion.div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-card shadow-sm"
                        initial={false}
                        animate={{
                          left: `${Math.min(95, Math.max(5, (parseFloat(weight) / liveRange.max) * 85))}%`,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={saveEntry}
            disabled={!canSave}
            className="w-full h-12 rounded-xl text-sm font-semibold gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('toolsInternal.babyGrowth.saveToHistory')}
          </Button>

          <p className="text-[9px] text-muted-foreground/50 text-center">
            {t('toolsInternal.babyGrowth.whoStandards')}
          </p>
        </div>

        {/* ── Growth Chart ── */}
        {entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <BabyGrowthChart entries={entries} gender={gender} />
          </motion.div>
        )}

        {/* ── AI Analysis Section ── */}
        {entries.length >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <AIActionButton
              onClick={runAIAnalysis}
              isLoading={aiLoading}
              label={t('toolsInternal.babyGrowth.aiAnalysis')}
              loadingLabel={t('toolsInternal.babyGrowth.analyzing')}
              icon={Baby}
              toolType="baby-growth-analysis"
              section="pregnancy-plan"
            />

            <AnimatePresence>
              {(aiResult || aiLoading) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="overflow-hidden border-border/40">
                    <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))' }} />
                    <CardContent className="p-4">
                      {aiLoading && !aiResult ? (
                        <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-xs">{t('toolsInternal.babyGrowth.analyzing')}</span>
                        </div>
                      ) : (
                        <MarkdownRenderer content={aiResult} isLoading={aiLoading} />
                      )}
                      <p className="mt-3 text-center text-[9px] font-semibold text-muted-foreground/70 tracking-wide">{t('ai.resultDisclaimer')}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── History ── */}
        {entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-2"
            >
              {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {t('toolsInternal.babyGrowth.history')} ({entries.length})
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-2 mt-2"
                >
                  {entries.map((entry) => {
                    const pInfo = getPercentileInfo(entry.ageMonths, entry.weight, entry.gender);
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/30"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              {entry.ageMonths} {t('toolsInternal.babyGrowth.monthUnit')}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${pInfo.color} bg-current/10`}>
                              {pInfo.percentile}
                            </span>
                          </div>
                          <div className="flex gap-3 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                              <Gauge className="w-3 h-3 inline me-0.5" />
                              {entry.weight}kg
                            </span>
                            {entry.height && (
                              <span className="text-xs text-muted-foreground">
                                <Ruler className="w-3 h-3 inline me-0.5" />
                                {entry.height}cm
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                            {formatLocalized(new Date(entry.date), "PP", lang)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteEntry(entry.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Empty State ── */}
        {entries.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-8 space-y-3"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
              <Baby className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{t('toolsInternal.babyGrowth.emptyTitle')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('toolsInternal.babyGrowth.emptyDesc')}</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </ToolFrame>
  );
};

export default BabyGrowth;
