import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Baby,
  Volume2,
  Clock,
  AlertCircle,
  Heart,
  Moon,
  Thermometer,
  Wind,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToolFrame } from "@/components/ToolFrame";
import { useSmartInsight } from "@/hooks/useSmartInsight";
import { AIActionButton } from '@/components/ai/AIActionButton';
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface CryLog {
  id: string;
  timestamp: Date;
  duration: string;
  selectedPatterns: string[];
  analysis: string;
}

const CRY_PATTERNS = [
  { id: "continuous", icon: Volume2, colorClass: "from-red-500 to-rose-600" },
  { id: "intermittent", icon: Wind, colorClass: "from-amber-500 to-orange-500" },
  { id: "highPitch", icon: AlertCircle, colorClass: "from-purple-500 to-violet-600" },
  { id: "whimpering", icon: Heart, colorClass: "from-pink-400 to-rose-400" },
  { id: "rhythmic", icon: Clock, colorClass: "from-blue-500 to-indigo-500" },
  { id: "sudden", icon: Thermometer, colorClass: "from-red-600 to-red-700" },
] as const;

const DURATION_OPTIONS = ["under1", "1to5", "5to15", "over15"] as const;

const CONTEXT_OPTIONS = ["afterFeeding", "beforeSleep", "afterWaking", "duringChange", "noReason", "afterBath"] as const;

export default function BabyCryTranslator() {
  const { t } = useTranslation();
  const { generate, isLoading, content: analysis, error, reset } = useSmartInsight({
    section: 'postpartum',
    toolType: 'baby-cry-analysis',
  });

  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>("");
  const [context, setContext] = useState<string>("");
  const [babyAgeWeeks, setBabyAgeWeeks] = useState<number>(4);
  const [cryLog, setCryLog] = useState<CryLog[]>([]);

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

    const prompt = `As a newborn care specialist, analyze the following baby cry patterns and provide soothing strategies:

**Baby Age:** ${babyAgeWeeks} weeks
**Cry Patterns:** ${patternsText}
${durationText ? `**Duration:** ${durationText}` : ""}
${contextText ? `**Context:** ${contextText}` : ""}

Provide insights on what the baby might be communicating and practical soothing techniques.`;

    let fullAnalysis = "";

    await generate({
      prompt,
      context: { week: babyAgeWeeks },
      onDelta: (chunk) => {
        fullAnalysis += chunk;
      },
    });

    // Save to cry log after completion
    if (fullAnalysis) {
      const logEntry: CryLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        duration: durationText,
        selectedPatterns: [...selectedPatterns],
        analysis: fullAnalysis,
      };
      setCryLog((prev) => [logEntry, ...prev].slice(0, 10));
    }
  };

  const resetForm = () => {
    setSelectedPatterns([]);
    setDuration("");
    setContext("");
    reset();
  };

  return (
    <ToolFrame
      title={t("tools.babyCryTranslator.title")}
      subtitle={t("toolsInternal.babyCryTranslator.subtitle")}
      mood="nurturing"
      toolId="baby-cry-translator"
    >
      <div className="space-y-5">
        {!analysis ? (
          <>
            {/* Baby Age */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  {t("toolsInternal.babyCryTranslator.babyAge")}
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-lg"
                    onClick={() => setBabyAgeWeeks(Math.max(0, babyAgeWeeks - 1))}
                  >
                    -
                  </Button>
                  <div className="flex-1 text-center">
                    <span className="text-base font-bold text-foreground">{babyAgeWeeks}</span>
                    <span className="text-xs text-muted-foreground ms-1">
                      {t("toolsInternal.babyCryTranslator.weeks")}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-lg"
                    onClick={() => setBabyAgeWeeks(Math.min(52, babyAgeWeeks + 1))}
                  >
                    +
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cry Patterns */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-primary" />
                  {t("toolsInternal.babyCryTranslator.cryPattern")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {CRY_PATTERNS.map((pattern) => {
                    const isSelected = selectedPatterns.includes(pattern.id);
                    return (
                      <motion.button
                        key={pattern.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => togglePattern(pattern.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-200 text-start ${
                          isSelected
                            ? "border-primary/40 bg-primary/5 shadow-sm"
                            : "border-border/50 bg-card hover:border-border"
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg bg-gradient-to-br ${pattern.colorClass} shadow-sm`}
                        >
                          <pattern.icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs font-medium text-foreground leading-tight">
                          {t(`toolsInternal.babyCryTranslator.patterns.${pattern.id}`)}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Duration */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {t("toolsInternal.babyCryTranslator.cryDuration")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {DURATION_OPTIONS.map((d) => (
                    <Button
                      key={d}
                      variant={duration === d ? "default" : "outline"}
                      size="sm"
                      className="rounded-full text-xs"
                      onClick={() => setDuration(duration === d ? "" : d)}
                    >
                      {t(`toolsInternal.babyCryTranslator.durations.${d}`)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Context */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Moon className="w-4 h-4 text-primary" />
                  {t("toolsInternal.babyCryTranslator.whenCrying")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {CONTEXT_OPTIONS.map((c) => (
                    <Button
                      key={c}
                      variant={context === c ? "default" : "outline"}
                      size="sm"
                      className="rounded-full text-xs"
                      onClick={() => setContext(context === c ? "" : c)}
                    >
                      {t(`toolsInternal.babyCryTranslator.contexts.${c}`)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Analyze Button */}
            <AIActionButton
              onClick={analyzesCry}
              isLoading={isLoading}
              disabled={selectedPatterns.length === 0}
              label={t("toolsInternal.babyCryTranslator.analyzeButton")}
              loadingLabel={t("toolsInternal.babyCryTranslator.analyzing", "Analyzing...")}
              icon={Baby}
            />
          </>
        ) : (
          <>
            {/* Analysis Result */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Baby className="w-5 h-5 text-primary" />
                    {t("toolsInternal.babyCryTranslator.analysisResult")}
                  </CardTitle>
                  <div className="flex gap-1">
                    {selectedPatterns.map((p) => (
                      <Badge key={p} variant="secondary" className="text-[10px]">
                        {t(`toolsInternal.babyCryTranslator.patterns.${p}`)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <MarkdownRenderer
                  content={analysis}
                  isLoading={isLoading}
                  accentColor="primary"
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={resetForm}
                variant="outline"
                className="flex-1 rounded-xl"
              >
                {t("toolsInternal.babyCryTranslator.newAnalysis")}
              </Button>
              <AIActionButton
                onClick={analyzesCry}
                isLoading={isLoading}
                label={t("toolsInternal.babyCryTranslator.reanalyze")}
                className="flex-1"
              />
            </div>
          </>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-sm text-destructive text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Cry Log History */}
        {cryLog.length > 0 && !analysis && (
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                {t("toolsInternal.babyCryTranslator.recentLogs")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {cryLog.slice(0, 3).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border/30"
                  >
                    <div className="flex items-center gap-2">
                      <Baby className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-foreground">
                        {log.selectedPatterns
                          .map((p) => t(`toolsInternal.babyCryTranslator.patterns.${p}`))
                          .join(", ")}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {log.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips Card */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">
                  {t("toolsInternal.babyCryTranslator.tipsTitle")}
                </p>
                <ul className="list-disc list-inside space-y-1">
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
