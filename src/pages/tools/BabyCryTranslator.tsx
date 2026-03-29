import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Baby, Volume2, Clock, AlertCircle, Heart, Moon, Thermometer, Wind,
  RotateCcw, Sparkles, History, ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToolFrame } from "@/components/ToolFrame";
import { useSmartInsight } from "@/hooks/useSmartInsight";
import { AIActionButton } from "@/components/ai/AIActionButton";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface CryLog {
  id: string;
  timestamp: Date;
  duration: string;
  selectedPatterns: string[];
  analysis: string;
}

const CRY_PATTERNS = [
  { id: "continuous", icon: Volume2, gradient: "from-red-500 to-rose-500", bg: "bg-red-500/10 border-red-500/20" },
  { id: "intermittent", icon: Wind, gradient: "from-amber-500 to-orange-400", bg: "bg-amber-500/10 border-amber-500/20" },
  { id: "highPitch", icon: AlertCircle, gradient: "from-purple-500 to-violet-500", bg: "bg-purple-500/10 border-purple-500/20" },
  { id: "whimpering", icon: Heart, gradient: "from-pink-400 to-rose-400", bg: "bg-pink-400/10 border-pink-400/20" },
  { id: "rhythmic", icon: Clock, gradient: "from-blue-500 to-indigo-500", bg: "bg-blue-500/10 border-blue-500/20" },
  { id: "sudden", icon: Thermometer, gradient: "from-red-600 to-red-500", bg: "bg-red-600/10 border-red-600/20" },
] as const;

const DURATION_OPTIONS = ["under1", "1to5", "5to15", "over15"] as const;
const CONTEXT_OPTIONS = ["afterFeeding", "beforeSleep", "afterWaking", "duringChange", "noReason", "afterBath"] as const;

const CONTEXT_ICONS: Record<string, string> = {
  afterFeeding: "🍼", beforeSleep: "😴", afterWaking: "👶",
  duringChange: "🧷", noReason: "❓", afterBath: "🛁",
};

export default function BabyCryTranslator() {
  const { t } = useTranslation();
  const { generate, isLoading, content: analysis, error, reset } = useSmartInsight({
    section: "postpartum", toolType: "baby-cry-analysis",
  });

  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>("");
  const [context, setContext] = useState<string>("");
  const [babyAgeWeeks, setBabyAgeWeeks] = useState<number>(4);
  const [cryLog, setCryLog] = useState<CryLog[]>([]);
  const [showLog, setShowLog] = useState(false);

  const togglePattern = (id: string) => {
    setSelectedPatterns((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const analyzesCry = async () => {
    if (selectedPatterns.length === 0) return;
    const patternsText = selectedPatterns
      .map((id) => t(`toolsInternal.babyCryTranslator.patterns.${id}`))
      .join(", ");
    const durationText = duration ? t(`toolsInternal.babyCryTranslator.durations.${duration}`) : "";
    const contextText = context ? t(`toolsInternal.babyCryTranslator.contexts.${context}`) : "";

    const prompt = `As a newborn care specialist, analyze the following baby cry patterns and provide soothing strategies:\n\n**Baby Age:** ${babyAgeWeeks} weeks\n**Cry Patterns:** ${patternsText}\n${durationText ? `**Duration:** ${durationText}` : ""}\n${contextText ? `**Context:** ${contextText}` : ""}\n\nProvide insights on what the baby might be communicating and practical soothing techniques.`;

    let fullAnalysis = "";
    await generate({
      prompt, context: { week: babyAgeWeeks },
      onDelta: (chunk) => { fullAnalysis += chunk; },
    });

    if (fullAnalysis) {
      setCryLog((prev) => [{
        id: Date.now().toString(), timestamp: new Date(), duration: durationText,
        selectedPatterns: [...selectedPatterns], analysis: fullAnalysis,
      }, ...prev].slice(0, 10));
    }
  };

  const resetForm = () => {
    setSelectedPatterns([]);
    setDuration("");
    setContext("");
    reset();
  };

  const selectedCount = selectedPatterns.length;

  return (
    <ToolFrame
      title={t("tools.babyCryTranslator.title")}
      subtitle={t("toolsInternal.babyCryTranslator.subtitle")}
      mood="nurturing" toolId="baby-cry-translator"
    >
      <div className="space-y-4">
        {!analysis ? (
          <>
            {/* Baby Age Selector */}
            <Card className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400" />
              <CardContent className="p-4">
                <label className="text-[11px] font-semibold text-muted-foreground mb-2 block">
                  {t("toolsInternal.babyCryTranslator.babyAge")}
                </label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl"
                    onClick={() => setBabyAgeWeeks(Math.max(0, babyAgeWeeks - 1))}>-</Button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-extrabold text-foreground tabular-nums">{babyAgeWeeks}</span>
                    <span className="text-xs text-muted-foreground ms-1.5">
                      {t("toolsInternal.babyCryTranslator.weeks")}
                    </span>
                  </div>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl"
                    onClick={() => setBabyAgeWeeks(Math.min(52, babyAgeWeeks + 1))}>+</Button>
                </div>
              </CardContent>
            </Card>

            {/* Cry Patterns Grid */}
            <div>
              <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5 px-1">
                <Volume2 className="w-3.5 h-3.5 text-primary" />
                {t("toolsInternal.babyCryTranslator.cryPattern")}
                {selectedCount > 0 && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{selectedCount}</Badge>
                )}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {CRY_PATTERNS.map((pattern) => {
                  const isSelected = selectedPatterns.includes(pattern.id);
                  return (
                    <motion.button
                      key={pattern.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => togglePattern(pattern.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all duration-200 text-start ${
                        isSelected ? `${pattern.bg} shadow-sm` : "border-border/30 bg-card hover:border-border/50"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? `bg-gradient-to-br ${pattern.gradient} shadow-sm` : "bg-muted/60"
                      }`}>
                        <pattern.icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-muted-foreground"}`} />
                      </div>
                      <span className={`text-[11px] font-medium leading-tight ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                        {t(`toolsInternal.babyCryTranslator.patterns.${pattern.id}`)}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Duration Pills */}
            <div>
              <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5 px-1">
                <Clock className="w-3.5 h-3.5 text-primary" />
                {t("toolsInternal.babyCryTranslator.cryDuration")}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(duration === d ? "" : d)}
                    className={`text-[10px] font-medium px-3 py-1.5 rounded-xl border transition-all ${
                      duration === d
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card border-border/30 text-muted-foreground hover:border-border/60"
                    }`}
                  >
                    {t(`toolsInternal.babyCryTranslator.durations.${d}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Context */}
            <div>
              <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5 px-1">
                <Moon className="w-3.5 h-3.5 text-primary" />
                {t("toolsInternal.babyCryTranslator.whenCrying")}
              </h3>
              <div className="grid grid-cols-3 gap-1.5">
                {CONTEXT_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setContext(context === c ? "" : c)}
                    className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border transition-all text-center ${
                      context === c
                        ? "bg-primary/10 border-primary/30 shadow-sm"
                        : "bg-card border-border/30 hover:border-border/50"
                    }`}
                  >
                    <span className="text-lg">{CONTEXT_ICONS[c]}</span>
                    <span className={`text-[9px] font-medium leading-tight ${context === c ? "text-foreground" : "text-muted-foreground"}`}>
                      {t(`toolsInternal.babyCryTranslator.contexts.${c}`)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Analyze Button */}
            <AIActionButton
              onClick={analyzesCry}
              isLoading={isLoading}
              disabled={selectedPatterns.length === 0}
              label={t("toolsInternal.babyCryTranslator.analyzeButton")}
              loadingLabel={t("toolsInternal.babyCryTranslator.analyzing", "Analyzing...")}
              icon={Baby}
              toolType="baby-cry-analysis"
              section="postpartum"
            />
          </>
        ) : (
          <>
            {/* Analysis Result */}
            <Card className="border-primary/20 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-pink-400 to-purple-400" />
              <CardHeader className="pb-2 pt-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center shadow-sm">
                      <Baby className="w-4 h-4 text-white" />
                    </div>
                    {t("toolsInternal.babyCryTranslator.analysisResult")}
                  </CardTitle>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {selectedPatterns.map((p) => (
                    <Badge key={p} variant="secondary" className="text-[9px] px-1.5 py-0">
                      {t(`toolsInternal.babyCryTranslator.patterns.${p}`)}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <MarkdownRenderer content={analysis} isLoading={isLoading} accentColor="primary" />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={resetForm} variant="outline" className="flex-1 rounded-xl gap-1.5 text-xs">
                <RotateCcw className="w-3.5 h-3.5" />
                {t("toolsInternal.babyCryTranslator.newAnalysis")}
              </Button>
              <AIActionButton
                onClick={analyzesCry}
                isLoading={isLoading}
                label={t("toolsInternal.babyCryTranslator.reanalyze")}
                className="flex-1"
                toolType="baby-cry-analysis"
                section="postpartum"
              />
            </div>
          </>
        )}

        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="p-3">
              <p className="text-xs text-destructive text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Cry Log History */}
        {cryLog.length > 0 && !analysis && (
          <div>
            <button
              onClick={() => setShowLog(!showLog)}
              className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-2 px-1"
            >
              <History className="w-3.5 h-3.5 text-muted-foreground" />
              {t("toolsInternal.babyCryTranslator.recentLogs")} ({cryLog.length})
              <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${showLog ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {showLog && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-1.5"
                >
                  {cryLog.slice(0, 5).map((log) => (
                    <Card key={log.id} className="border-border/20">
                      <CardContent className="p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                            <Baby className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-[10px] text-foreground font-medium">
                            {log.selectedPatterns
                              .map((p) => t(`toolsInternal.babyCryTranslator.patterns.${p}`))
                              .join(", ")}
                          </span>
                        </div>
                        <span className="text-[9px] text-muted-foreground tabular-nums">
                          {log.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Soothing Tips */}
        <Card className="border-pink-400/15 bg-pink-500/5">
          <CardContent className="p-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <div className="text-[11px] text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground text-xs">
                  {t("toolsInternal.babyCryTranslator.tipsTitle")}
                </p>
                <ul className="space-y-0.5 list-disc list-inside">
                  <li>{t("toolsInternal.babyCryTranslator.tips.tip1")}</li>
                  <li>{t("toolsInternal.babyCryTranslator.tips.tip2")}</li>
                  <li>{t("toolsInternal.babyCryTranslator.tips.tip3")}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
