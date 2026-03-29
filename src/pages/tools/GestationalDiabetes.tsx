import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, CheckCircle, Info, Shield, Activity, Apple, Footprints,
  Droplets, TrendingUp, RotateCcw, Sparkles,
} from "lucide-react";
import { WhenToCallDoctorCard, EvidenceInfoBlock } from "@/components/safety";
import { ToolFrame } from "@/components/ToolFrame";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AIInsightCard } from "@/components/ai/AIInsightCard";

const RISK_FACTORS = [
  { id: "age", labelKey: "toolsInternal.gdm.riskFactors.age", points: 1, icon: Activity, gradient: "from-amber-500 to-orange-400" },
  { id: "bmi", labelKey: "toolsInternal.gdm.riskFactors.bmi", points: 2, icon: TrendingUp, gradient: "from-rose-500 to-red-400" },
  { id: "family", labelKey: "toolsInternal.gdm.riskFactors.family", points: 1, icon: Shield, gradient: "from-blue-500 to-indigo-400" },
  { id: "previous-gdm", labelKey: "toolsInternal.gdm.riskFactors.previousGdm", points: 3, icon: AlertTriangle, gradient: "from-red-600 to-rose-500" },
  { id: "previous-large", labelKey: "toolsInternal.gdm.riskFactors.previousLarge", points: 1, icon: Activity, gradient: "from-purple-500 to-violet-400" },
  { id: "pcos", labelKey: "toolsInternal.gdm.riskFactors.pcos", points: 1, icon: Droplets, gradient: "from-pink-500 to-rose-400" },
  { id: "prediabetes", labelKey: "toolsInternal.gdm.riskFactors.prediabetes", points: 2, icon: Droplets, gradient: "from-red-500 to-orange-500" },
  { id: "ethnicity", labelKey: "toolsInternal.gdm.riskFactors.ethnicity", points: 1, icon: Shield, gradient: "from-teal-500 to-emerald-400" },
  { id: "multiple", labelKey: "toolsInternal.gdm.riskFactors.multiple", points: 1, icon: Activity, gradient: "from-indigo-500 to-blue-400" },
  { id: "sedentary", labelKey: "toolsInternal.gdm.riskFactors.sedentary", points: 1, icon: Footprints, gradient: "from-gray-500 to-slate-400" },
] as const;

export default function GestationalDiabetes() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);

  const toggleFactor = (id: string) => {
    setSelectedFactors((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const { risk, totalPoints, maxPoints } = useMemo(() => {
    const total = RISK_FACTORS
      .filter((f) => selectedFactors.includes(f.id))
      .reduce((sum, f) => sum + f.points, 0);
    const max = RISK_FACTORS.reduce((sum, f) => sum + f.points, 0);

    let r;
    if (total >= 5) {
      r = { level: "high" as const, gradient: "from-red-500 to-rose-500", bg: "bg-destructive/8 border-destructive/20", color: "text-destructive", icon: AlertTriangle };
    } else if (total >= 3) {
      r = { level: "moderate" as const, gradient: "from-amber-500 to-orange-400", bg: "bg-amber-500/8 border-amber-500/20", color: "text-amber-600 dark:text-amber-400", icon: Shield };
    } else {
      r = { level: "low" as const, gradient: "from-emerald-500 to-teal-400", bg: "bg-primary/5 border-primary/20", color: "text-primary", icon: CheckCircle };
    }
    return { risk: r, totalPoints: total, maxPoints: max };
  }, [selectedFactors]);

  const scorePercent = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

  return (
    <ToolFrame
      title={t("toolsInternal.gdm.title")}
      subtitle={t("toolsInternal.gdm.subtitle")}
      customIcon="medical-report"
      mood="calm"
      toolId="gestational-diabetes"
    >
      <div className="space-y-4">

        {/* Score Hero */}
        <Card className="overflow-hidden">
          <div className={`h-1.5 bg-gradient-to-r ${risk.gradient}`} style={{ width: `${Math.max(scorePercent, 5)}%`, transition: "width 0.5s" }} />
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="27" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
                  <motion.circle
                    cx="32" cy="32" r="27" fill="none"
                    stroke={totalPoints >= 5 ? "hsl(var(--destructive))" : totalPoints >= 3 ? "#f59e0b" : "hsl(var(--primary))"}
                    strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 27}`}
                    animate={{ strokeDashoffset: 2 * Math.PI * 27 * (1 - scorePercent / 100) }}
                    transition={{ duration: 0.8 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-lg font-extrabold ${risk.color} tabular-nums`}>{totalPoints}</span>
                  <span className="text-[8px] text-muted-foreground">/{maxPoints}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <risk.icon className={`w-4 h-4 ${risk.color}`} />
                  <span className={`text-sm font-bold ${risk.color}`}>
                    {t(`toolsInternal.gdm.riskLevels.${risk.level}.title`)}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                  {t(`toolsInternal.gdm.riskLevels.${risk.level}.description`)}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                    {t("toolsInternal.gdm.riskFactorsSelected")}: {selectedFactors.length}
                  </Badge>
                  {selectedFactors.length > 0 && (
                    <button onClick={() => setSelectedFactors([])} className="text-[9px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                      <RotateCcw className="w-2.5 h-2.5" /> {t("toolsInternal.gdm.reset", "Reset")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Factors Grid */}
        <div>
          <h3 className="text-xs font-bold text-foreground mb-2.5 flex items-center gap-1.5 px-1">
            <Activity className="w-3.5 h-3.5 text-primary" />
            {t("toolsInternal.gdm.checkRiskFactors")}
          </h3>
          <div className="space-y-1.5">
            {RISK_FACTORS.map((factor, idx) => {
              const isSelected = selectedFactors.includes(factor.id);
              const FIcon = factor.icon;
              return (
                <motion.button
                  key={factor.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleFactor(factor.id)}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-200 text-start ${
                    isSelected
                      ? `${risk.level === "high" ? "bg-destructive/5 border-destructive/20" : risk.level === "moderate" ? "bg-amber-500/5 border-amber-500/20" : "bg-primary/5 border-primary/20"} shadow-sm`
                      : "border-border/30 bg-card hover:border-border/50"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? `bg-gradient-to-br ${factor.gradient} shadow-sm` : "bg-muted/60"
                  }`}>
                    {isSelected
                      ? <CheckCircle className="w-4 h-4 text-white" />
                      : <FIcon className="w-4 h-4 text-muted-foreground/50" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-semibold leading-tight ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                      {t(factor.labelKey)}
                    </p>
                  </div>
                  {isSelected && (
                    <Badge variant="outline" className="text-[8px] px-1 py-0 border-current shrink-0">
                      +{factor.points}
                    </Badge>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* AI Coach */}
        {selectedFactors.length > 0 && (
          <AIInsightCard
            title={t("toolsInternal.gdm.aiCoachTitle")}
            prompt={`I'm assessing my gestational diabetes risk. My risk level is ${risk.level} (${t(`toolsInternal.gdm.riskLevels.${risk.level}.title`)}).

My risk factors:
${RISK_FACTORS.filter(f => selectedFactors.includes(f.id)).map(f => `- ${t(f.labelKey)}`).join('\n')}

Please provide personalized advice:

## 🎯 Your Risk Profile
Brief analysis of my specific risk factors

## 🥗 Meal Plan Suggestions
5-6 specific meal ideas that help manage blood sugar during pregnancy

## 🏃‍♀️ Exercise Recommendations
Safe exercises for my situation

## 📋 Daily Monitoring Tips
How to track and manage my blood sugar if needed

## 🩺 Questions for My Doctor
3-4 questions I should ask at my next appointment

## 💪 Motivation
Encouraging message about managing this condition`}
            variant="default"
            buttonText={t("toolsInternal.gdm.getPreventionPlan")}
          />
        )}

        {/* Prevention Tips */}
        <Card className="border-emerald-500/15 bg-emerald-500/5">
          <CardContent className="p-3">
            <h3 className="text-xs font-bold text-foreground mb-2.5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-sm">
                <Apple className="h-3.5 w-3.5 text-white" />
              </div>
              {t("toolsInternal.gdm.preventionTipsTitle")}
            </h3>
            <ul className="space-y-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  {t(`toolsInternal.gdm.preventionTips.tip${i}`)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Evidence */}
        <EvidenceInfoBlock
          title={t("gdm.evidence.title")}
          content={t("gdm.evidence.content")}
          source={t("gdm.evidence.source")}
        />
        <EvidenceInfoBlock
          title={t("gdm.evidence2.title")}
          content={t("gdm.evidence2.content")}
          source={t("gdm.evidence2.source")}
        />

        <WhenToCallDoctorCard context="gestationalDiabetes" />

        {/* Disclaimer */}
        <Card className="bg-muted/30">
          <CardContent className="pt-4 pb-3">
            <div className="flex gap-2.5">
              <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {t("toolsInternal.gdm.infoNote")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
