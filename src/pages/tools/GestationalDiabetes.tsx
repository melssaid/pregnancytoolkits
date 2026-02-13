import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Info, Shield } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AIInsightCard } from "@/components/ai/AIInsightCard";

const RISK_FACTOR_KEYS = [
  { id: "age", labelKey: "toolsInternal.gdm.riskFactors.age", points: 1 },
  { id: "bmi", labelKey: "toolsInternal.gdm.riskFactors.bmi", points: 2 },
  { id: "family", labelKey: "toolsInternal.gdm.riskFactors.family", points: 1 },
  { id: "previous-gdm", labelKey: "toolsInternal.gdm.riskFactors.previousGdm", points: 3 },
  { id: "previous-large", labelKey: "toolsInternal.gdm.riskFactors.previousLarge", points: 1 },
  { id: "pcos", labelKey: "toolsInternal.gdm.riskFactors.pcos", points: 1 },
  { id: "prediabetes", labelKey: "toolsInternal.gdm.riskFactors.prediabetes", points: 2 },
  { id: "ethnicity", labelKey: "toolsInternal.gdm.riskFactors.ethnicity", points: 1 },
  { id: "multiple", labelKey: "toolsInternal.gdm.riskFactors.multiple", points: 1 },
  { id: "sedentary", labelKey: "toolsInternal.gdm.riskFactors.sedentary", points: 1 }
];

export default function GestationalDiabetes() {
  const { t } = useTranslation();
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const toggleFactor = (id: string) => {
    setSelectedFactors((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const calculateRisk = () => {
    const totalPoints = RISK_FACTOR_KEYS
      .filter((f) => selectedFactors.includes(f.id))
      .reduce((sum, f) => sum + f.points, 0);

    if (totalPoints >= 5) {
      return {
        level: "high",
        title: t('toolsInternal.gdm.riskLevels.high.title', 'More Factors Present'),
        description: t('toolsInternal.gdm.riskLevels.high.description', 'You have selected several factors. Consider discussing screening options with your healthcare provider.'),
        icon: AlertTriangle,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/20",
      };
    } else if (totalPoints >= 3) {
      return {
        level: "moderate",
        title: t('toolsInternal.gdm.riskLevels.moderate.title', 'Some Factors Present'),
        description: t('toolsInternal.gdm.riskLevels.moderate.description', 'You have some factors. Standard screening at 24-28 weeks is commonly recommended.'),
        icon: Shield,
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        borderColor: "border-border",
      };
    } else {
      return {
        level: "low",
        title: t('toolsInternal.gdm.riskLevels.low.title', 'Fewer Factors'),
        description: t('toolsInternal.gdm.riskLevels.low.description', 'You have selected few factors. Routine screening at 24-28 weeks is still commonly recommended.'),
        icon: CheckCircle,
        color: "text-primary",
        bgColor: "bg-primary/5",
        borderColor: "border-primary/20",
      };
    }
  };

  const risk = calculateRisk();

  return (
    <ToolFrame
      title={t('toolsInternal.gdm.title')}
      subtitle={t('toolsInternal.gdm.subtitle')}
      customIcon="medical-report"
      mood="calm"
      toolId="gestational-diabetes"
    >
      <div className="space-y-4">

        {/* Risk Factors Checklist */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-sm mb-3">{t('toolsInternal.gdm.checkRiskFactors')}</h3>
            <div className="space-y-3">
              {RISK_FACTOR_KEYS.map((factor) => (
                <button
                  key={factor.id}
                  type="button"
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all w-full text-left border-2 ${
                    selectedFactors.includes(factor.id)
                      ? "bg-primary/10 border-primary/40 shadow-sm"
                      : "bg-muted/50 hover:bg-muted border-transparent"
                  }`}
                  onClick={() => toggleFactor(factor.id)}
                >
                  <Checkbox
                    checked={selectedFactors.includes(factor.id)}
                    onCheckedChange={() => toggleFactor(factor.id)}
                    className="mt-0.5 pointer-events-none"
                  />
                  <span className="text-xs text-foreground font-medium">{t(factor.labelKey)}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <motion.div
          key={selectedFactors.length}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={`${risk.bgColor} ${risk.borderColor} border`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${risk.bgColor}`}>
                  <risk.icon className={`h-6 w-6 ${risk.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-base ${risk.color}`}>
                    {t(`toolsInternal.gdm.riskLevels.${risk.level}.title`)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(`toolsInternal.gdm.riskLevels.${risk.level}.description`)}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{t('toolsInternal.gdm.riskFactorsSelected')}:</span>
                    <span className="font-bold text-foreground">{selectedFactors.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {selectedFactors.length > 0 && (
          <AIInsightCard
            title={t('toolsInternal.gdm.aiCoachTitle')}
            prompt={`I'm assessing my gestational diabetes risk. My risk level is ${risk.level} (${risk.title}).

My risk factors:
${RISK_FACTOR_KEYS.filter(f => selectedFactors.includes(f.id)).map(f => `- ${t(f.labelKey)}`).join('\n')}

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
            buttonText={t('toolsInternal.gdm.getPreventionPlan')}
          />
        )}

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              {t('toolsInternal.gdm.preventionTipsTitle')}
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                {t('toolsInternal.gdm.preventionTips.tip1')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                {t('toolsInternal.gdm.preventionTips.tip2')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                {t('toolsInternal.gdm.preventionTips.tip3')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                {t('toolsInternal.gdm.preventionTips.tip4')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                {t('toolsInternal.gdm.preventionTips.tip5')}
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                {t('toolsInternal.gdm.infoNote')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
