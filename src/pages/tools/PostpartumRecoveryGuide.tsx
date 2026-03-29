import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Brain, Calendar, CheckCircle2, Baby, Activity, Shield, Flower2,
  ArrowRight, ArrowLeft, Award, Sparkles, Clock, TrendingUp, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ToolFrame } from "@/components/ToolFrame";
import { useSmartInsight } from "@/hooks/useSmartInsight";
import { AIActionButton } from "@/components/ai/AIActionButton";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { WhenToCallDoctorCard } from "@/components/safety";

type BirthType = "vaginal" | "cesarean";
type RecoveryPhase = "week1" | "week2" | "week3_4" | "week5_6";

interface ChecklistItem { id: string; done: boolean; }

const PHASES: RecoveryPhase[] = ["week1", "week2", "week3_4", "week5_6"];

const PHASE_ICONS = {
  week1: Shield, week2: Flower2, week3_4: Activity, week5_6: Heart,
};

const PHASE_GRADIENTS = {
  week1: "from-red-500 to-rose-500",
  week2: "from-amber-500 to-orange-400",
  week3_4: "from-emerald-500 to-teal-400",
  week5_6: "from-pink-500 to-rose-400",
};

const PHASE_BG = {
  week1: "bg-red-500/5 border-red-500/15",
  week2: "bg-amber-500/5 border-amber-500/15",
  week3_4: "bg-emerald-500/5 border-emerald-500/15",
  week5_6: "bg-pink-500/5 border-pink-500/15",
};

const CHECKLIST_KEYS: Record<RecoveryPhase, string[]> = {
  week1: ["rest", "hydration", "woundCare", "feedingSchedule", "painManagement"],
  week2: ["gentleWalking", "emotionalCheck", "nutrition", "sleepRoutine", "socialSupport"],
  week3_4: ["lightExercise", "posturalExercises", "kegelExercises", "mentalHealthCheck", "doctorVisit"],
  week5_6: ["returnToExercise", "intimacyReadiness", "fullCheckup", "longTermPlan", "selfCare"],
};

const CHECKLIST_ICONS: Record<string, React.ElementType> = {
  rest: Shield, hydration: Activity, woundCare: Heart, feedingSchedule: Baby,
  painManagement: AlertTriangle, gentleWalking: Activity, emotionalCheck: Brain,
  nutrition: Flower2, sleepRoutine: Clock, socialSupport: Heart,
  lightExercise: TrendingUp, posturalExercises: Activity, kegelExercises: Shield,
  mentalHealthCheck: Brain, doctorVisit: Calendar,
  returnToExercise: TrendingUp, intimacyReadiness: Heart, fullCheckup: Calendar,
  longTermPlan: Sparkles, selfCare: Flower2,
};

export default function PostpartumRecoveryGuide() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { generate, isLoading, content: aiAdvice, error, reset: resetAI } = useSmartInsight({
    section: "postpartum", toolType: "postpartum-recovery",
  });

  const [birthType, setBirthType] = useState<BirthType | null>(null);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [checklist, setChecklist] = useState<Record<string, ChecklistItem[]>>({});

  const initChecklist = (type: BirthType) => {
    setBirthType(type);
    const newChecklist: Record<string, ChecklistItem[]> = {};
    for (const phase of PHASES) {
      newChecklist[phase] = CHECKLIST_KEYS[phase].map((key) => ({ id: key, done: false }));
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

  const totalProgress = useMemo(() => {
    if (!birthType) return 0;
    let total = 0, done = 0;
    PHASES.forEach(p => {
      const items = checklist[p] || [];
      total += items.length;
      done += items.filter(i => i.done).length;
    });
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [checklist, birthType]);

  const getAIAdvice = async (phase: RecoveryPhase) => {
    const phaseLabel = t(`toolsInternal.postpartumRecovery.phases.${phase}.title`);
    const birthLabel = t(`toolsInternal.postpartumRecovery.birthTypes.${birthType}`);
    await generate({
      prompt: `As a postpartum wellness specialist, provide detailed recovery guidance for a woman who had a ${birthLabel} delivery, currently in the "${phaseLabel}" phase:\n\n1. **Physical Recovery** - Tips specific to ${birthLabel} delivery\n2. **Emotional Wellness** - Mental health and adjustment guidance\n3. **Exercise Recommendations** - Safe activities for this phase\n4. **Nutrition** - Recovery and breastfeeding nutrition tips\n5. **Signs to Share with Provider** - What to watch for`,
      context: { trimester: 4 },
    });
  };

  const phase = PHASES[currentPhase];
  const PhaseIcon = PHASE_ICONS[phase];

  if (!birthType) {
    return (
      <ToolFrame
        title={t("tools.postpartumRecovery.title")}
        subtitle={t("toolsInternal.postpartumRecovery.subtitle")}
        mood="nurturing" toolId="postpartum-recovery"
      >
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3 py-4">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-pink-500/20">
              <Heart className="w-8 h-8 text-white" />
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-pink-400/30"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </div>
            <h2 className="text-base font-bold text-foreground">
              {t("toolsInternal.postpartumRecovery.welcomeTitle")}
            </h2>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {t("toolsInternal.postpartumRecovery.welcomeDesc")}
            </p>
          </motion.div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-center text-foreground">
              {t("toolsInternal.postpartumRecovery.selectBirthType")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(["vaginal", "cesarean"] as const).map((type) => {
                const Icon = type === "vaginal" ? Baby : Shield;
                const grad = type === "vaginal" ? "from-emerald-400 to-teal-500" : "from-blue-400 to-indigo-500";
                return (
                  <motion.button
                    key={type}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => initChecklist(type)}
                    className="p-5 rounded-2xl border-2 border-border/40 hover:border-primary/30 bg-card hover:bg-primary/5 transition-all duration-200 text-center space-y-2.5 shadow-sm"
                  >
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mx-auto shadow-md`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      {t(`toolsInternal.postpartumRecovery.birthTypes.${type}`)}
                    </p>
                  </motion.button>
                );
              })}
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
      mood="nurturing" toolId="postpartum-recovery"
    >
      <div className="space-y-4">
        {/* Overall Progress Hero */}
        <Card className="overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400" style={{ width: `${totalProgress}%` }} />
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="27" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
                  <motion.circle
                    cx="32" cy="32" r="27" fill="none"
                    stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 27}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 27 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 27 * (1 - totalProgress / 100) }}
                    transition={{ duration: 0.8 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-extrabold text-foreground">{totalProgress}%</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-foreground mb-1">
                  {t("toolsInternal.postpartumRecovery.overallProgress", "Overall Recovery")}
                </h3>
                <Badge variant="secondary" className="text-[10px] mb-1.5">
                  {t(`toolsInternal.postpartumRecovery.birthTypes.${birthType}`)}
                </Badge>
                <div className="flex gap-1">
                  {PHASES.map((p, i) => (
                    <div key={p} className={`flex-1 h-1.5 rounded-full transition-all ${
                      i === currentPhase ? "bg-primary" : i < currentPhase ? "bg-primary/40" : "bg-muted"
                    }`} />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phase Navigator */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl shrink-0"
            disabled={currentPhase === 0}
            onClick={() => { setCurrentPhase((p) => p - 1); resetAI(); }}
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </Button>

          <div className="flex-1 flex gap-1.5">
            {PHASES.map((p, i) => {
              const PIcon = PHASE_ICONS[p];
              const isActive = i === currentPhase;
              return (
                <button
                  key={p}
                  onClick={() => { setCurrentPhase(i); resetAI(); }}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all ${
                    isActive ? `${PHASE_BG[p]} shadow-sm` : "bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isActive ? `bg-gradient-to-br ${PHASE_GRADIENTS[p]}` : "bg-muted"
                  }`}>
                    <PIcon className={`w-3 h-3 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                  </div>
                  <span className={`text-[8px] font-medium leading-tight ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {t(`toolsInternal.postpartumRecovery.phases.${p}.short`, p)}
                  </span>
                </button>
              );
            })}
          </div>

          <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl shrink-0"
            disabled={currentPhase === PHASES.length - 1}
            onClick={() => { setCurrentPhase((p) => p + 1); resetAI(); }}
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
            <Card className={`overflow-hidden ${PHASE_BG[phase]}`}>
              <div className={`h-1.5 bg-gradient-to-r ${PHASE_GRADIENTS[phase]}`} />
              <CardHeader className="pb-2 pt-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${PHASE_GRADIENTS[phase]} shadow-sm`}>
                      <PhaseIcon className="w-4 h-4 text-white" />
                    </div>
                    {t(`toolsInternal.postpartumRecovery.phases.${phase}.title`)}
                  </CardTitle>
                  <span className="text-xs font-bold text-primary tabular-nums">
                    {getPhaseProgress(phase)}%
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  {t(`toolsInternal.postpartumRecovery.phases.${phase}.description`)}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                <Progress value={getPhaseProgress(phase)} className="h-1.5" />

                <div className="space-y-1.5">
                  {(checklist[phase] || []).map((item, idx) => {
                    const ItemIcon = CHECKLIST_ICONS[item.id] || CheckCircle2;
                    return (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleCheckItem(phase, item.id)}
                        className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-200 text-start ${
                          item.done
                            ? "border-primary/20 bg-primary/5"
                            : "border-border/30 bg-card hover:border-border/50"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          item.done
                            ? `bg-gradient-to-br ${PHASE_GRADIENTS[phase]} shadow-sm`
                            : "bg-muted/60"
                        }`}>
                          {item.done
                            ? <CheckCircle2 className="w-4 h-4 text-white" />
                            : <ItemIcon className="w-3.5 h-3.5 text-muted-foreground/50" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-semibold ${
                            item.done ? "text-primary line-through" : "text-foreground"
                          }`}>
                            {t(`toolsInternal.postpartumRecovery.checklist.${item.id}.title`)}
                          </p>
                          <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">
                            {t(`toolsInternal.postpartumRecovery.checklist.${item.id}.desc`)}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <AIActionButton
                  onClick={() => getAIAdvice(phase)}
                  isLoading={isLoading}
                  label={t("toolsInternal.postpartumRecovery.getAIAdvice")}
                  toolType="postpartum-recovery"
                  section="postpartum"
                />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* AI Advice */}
        {aiAdvice && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  {t("toolsInternal.postpartumRecovery.aiAdviceTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MarkdownRenderer content={aiAdvice} isLoading={isLoading} accentColor="primary" />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-sm text-destructive text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* When to call doctor */}
        <WhenToCallDoctorCard context="postpartum" />

        {/* Change birth type */}
        <div className="text-center">
          <Button
            variant="ghost" size="sm" className="text-xs text-muted-foreground"
            onClick={() => { setBirthType(null); setCurrentPhase(0); resetAI(); setChecklist({}); }}
          >
            {t("toolsInternal.postpartumRecovery.changeBirthType")}
          </Button>
        </div>
      </div>
    </ToolFrame>
  );
}
