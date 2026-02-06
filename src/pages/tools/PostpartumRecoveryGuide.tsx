import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Sparkles,
  Loader2,
  Calendar,
  CheckCircle2,
  Baby,
  Activity,
  Shield,
  Flower2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ToolFrame } from "@/components/ToolFrame";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useResetOnLanguageChange } from "@/hooks/useResetOnLanguageChange";

type BirthType = "vaginal" | "cesarean";
type RecoveryPhase = "week1" | "week2" | "week3_4" | "week5_6";

interface ChecklistItem {
  id: string;
  done: boolean;
}

const PHASES: RecoveryPhase[] = ["week1", "week2", "week3_4", "week5_6"];

const PHASE_ICONS = {
  week1: Shield,
  week2: Flower2,
  week3_4: Activity,
  week5_6: Heart,
};

const PHASE_COLORS = {
  week1: "from-red-500 to-rose-600",
  week2: "from-amber-500 to-orange-500",
  week3_4: "from-emerald-500 to-teal-500",
  week5_6: "from-primary to-pink-500",
};

export default function PostpartumRecoveryGuide() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { streamChat, isLoading, error } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setAiAdvice('');
  });
  const [birthType, setBirthType] = useState<BirthType | null>(null);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [checklist, setChecklist] = useState<Record<string, ChecklistItem[]>>({});

  const CHECKLIST_KEYS: Record<RecoveryPhase, string[]> = {
    week1: ["rest", "hydration", "woundCare", "feedingSchedule", "painManagement"],
    week2: ["gentleWalking", "emotionalCheck", "nutrition", "sleepRoutine", "socialSupport"],
    week3_4: ["lightExercise", "posturalExercises", "kegelExercises", "mentalHealthCheck", "doctorVisit"],
    week5_6: ["returnToExercise", "intimacyReadiness", "fullCheckup", "longTermPlan", "selfCare"],
  };

  const initChecklist = (type: BirthType) => {
    setBirthType(type);
    const newChecklist: Record<string, ChecklistItem[]> = {};
    for (const phase of PHASES) {
      newChecklist[phase] = CHECKLIST_KEYS[phase].map((key) => ({
        id: key,
        done: false,
      }));
    }
    setChecklist(newChecklist);
  };

  const toggleCheckItem = (phase: RecoveryPhase, itemId: string) => {
    setChecklist((prev) => ({
      ...prev,
      [phase]: prev[phase].map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      ),
    }));
  };

  const getPhaseProgress = (phase: RecoveryPhase): number => {
    const items = checklist[phase] || [];
    if (items.length === 0) return 0;
    return Math.round((items.filter((i) => i.done).length / items.length) * 100);
  };

  const getAIAdvice = async (phase: RecoveryPhase) => {
    setAiAdvice("");
    const phaseLabel = t(`toolsInternal.postpartumRecovery.phases.${phase}.title`);
    const birthLabel = t(`toolsInternal.postpartumRecovery.birthTypes.${birthType}`);

    const prompt = `I had a ${birthType} delivery. I'm currently in the "${phaseLabel}" phase of postpartum recovery.
Please provide detailed recovery advice for this phase including:
- Physical recovery tips specific to ${birthType} delivery
- Emotional wellness guidance
- Exercise recommendations (if appropriate for this phase)
- Nutrition tips for recovery and breastfeeding
- Warning signs to watch for`;

    await streamChat({
      type: "postpartum-recovery",
      messages: [{ role: "user", content: prompt }],
      context: { trimester: 4 },
      onDelta: (chunk) => setAiAdvice((prev) => prev + chunk),
      onDone: () => {},
    });
  };

  const phase = PHASES[currentPhase];
  const PhaseIcon = PHASE_ICONS[phase];

  if (!birthType) {
    return (
      <ToolFrame
        title={t("tools.postpartumRecovery.title")}
        subtitle={t("toolsInternal.postpartumRecovery.subtitle")}
        mood="nurturing"
        toolId="postpartum-recovery"
      >
        <div className="space-y-6">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              {t("toolsInternal.postpartumRecovery.welcomeTitle")}
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {t("toolsInternal.postpartumRecovery.welcomeDesc")}
            </p>
          </motion.div>

          {/* Birth Type Selection */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-center text-foreground">
              {t("toolsInternal.postpartumRecovery.selectBirthType")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => initChecklist("vaginal")}
                className="p-5 rounded-2xl border-2 border-border/50 hover:border-primary/40 bg-card hover:bg-primary/5 transition-all duration-200 text-center space-y-2"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto shadow-md">
                  <Baby className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {t("toolsInternal.postpartumRecovery.birthTypes.vaginal")}
                </p>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => initChecklist("cesarean")}
                className="p-5 rounded-2xl border-2 border-border/50 hover:border-primary/40 bg-card hover:bg-primary/5 transition-all duration-200 text-center space-y-2"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mx-auto shadow-md">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {t("toolsInternal.postpartumRecovery.birthTypes.cesarean")}
                </p>
              </motion.button>
            </div>
          </div>
        </div>
      </ToolFrame>
    );
  }

  return (
    <ToolFrame
      title={t("tools.postpartumRecovery.title")}
      subtitle={t("toolsInternal.postpartumRecovery.subtitle")}
      mood="nurturing"
      toolId="postpartum-recovery"
    >
      <div className="space-y-5">
        {/* Phase Navigator */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg shrink-0"
            disabled={currentPhase === 0}
            onClick={() => { setCurrentPhase((p) => p - 1); setAiAdvice(""); }}
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </Button>

          <div className="flex-1">
            <div className="flex gap-1">
              {PHASES.map((p, i) => (
                <button
                  key={p}
                  onClick={() => { setCurrentPhase(i); setAiAdvice(""); }}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    i === currentPhase
                      ? "bg-primary"
                      : i < currentPhase
                      ? "bg-primary/40"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg shrink-0"
            disabled={currentPhase === PHASES.length - 1}
            onClick={() => { setCurrentPhase((p) => p + 1); setAiAdvice(""); }}
          >
            {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Current Phase Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-primary/20 overflow-hidden">
              <div className={`h-1.5 bg-gradient-to-r ${PHASE_COLORS[phase]}`} />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${PHASE_COLORS[phase]} shadow-sm`}>
                      <PhaseIcon className="w-4 h-4 text-white" />
                    </div>
                    {t(`toolsInternal.postpartumRecovery.phases.${phase}.title`)}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {t(`toolsInternal.postpartumRecovery.birthTypes.${birthType}`)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t(`toolsInternal.postpartumRecovery.phases.${phase}.description`)}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {t("toolsInternal.postpartumRecovery.progress")}
                    </span>
                    <span className="font-medium text-foreground">{getPhaseProgress(phase)}%</span>
                  </div>
                  <Progress value={getPhaseProgress(phase)} className="h-2" />
                </div>

                {/* Checklist */}
                <div className="space-y-2">
                  {(checklist[phase] || []).map((item) => (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleCheckItem(phase, item.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-start ${
                        item.done
                          ? "border-primary/30 bg-primary/5"
                          : "border-border/50 bg-card hover:border-border"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-5 h-5 shrink-0 transition-colors ${
                          item.done ? "text-primary" : "text-muted-foreground/40"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            item.done ? "text-primary line-through" : "text-foreground"
                          }`}
                        >
                          {t(`toolsInternal.postpartumRecovery.checklist.${item.id}.title`)}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          {t(`toolsInternal.postpartumRecovery.checklist.${item.id}.desc`)}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* AI Advice Button */}
                <Button
                  onClick={() => getAIAdvice(phase)}
                  disabled={isLoading}
                  className="w-full gap-2 rounded-xl"
                  variant={aiAdvice ? "outline" : "default"}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {t("toolsInternal.postpartumRecovery.getAIAdvice")}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* AI Advice */}
        {aiAdvice && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {t("toolsInternal.postpartumRecovery.aiAdviceTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MarkdownRenderer
                  content={aiAdvice}
                  isLoading={isLoading}
                  accentColor="primary"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-sm text-destructive text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Change birth type */}
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => { setBirthType(null); setCurrentPhase(0); setAiAdvice(""); setChecklist({}); }}
          >
            {t("toolsInternal.postpartumRecovery.changeBirthType")}
          </Button>
        </div>
      </div>
    </ToolFrame>
  );
}
