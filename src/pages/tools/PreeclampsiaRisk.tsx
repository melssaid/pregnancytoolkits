import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Heart, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AIInsightCard } from "@/components/ai/AIInsightCard";

interface RiskFactor {
  id: string;
  labelKey: string;
  points: number;
  categoryKey: string;
}

const riskFactors: RiskFactor[] = [
  { id: "first-pregnancy", labelKey: "firstPregnancy", points: 1, categoryKey: "pregnancy" },
  { id: "prev-preeclampsia", labelKey: "prevPreeclampsia", points: 3, categoryKey: "history" },
  { id: "chronic-hypertension", labelKey: "chronicHypertension", points: 2, categoryKey: "medical" },
  { id: "diabetes", labelKey: "diabetes", points: 2, categoryKey: "medical" },
  { id: "kidney-disease", labelKey: "kidneyDisease", points: 2, categoryKey: "medical" },
  { id: "autoimmune", labelKey: "autoimmune", points: 2, categoryKey: "medical" },
  { id: "multiples", labelKey: "multiples", points: 2, categoryKey: "pregnancy" },
  { id: "age-35", labelKey: "age35", points: 1, categoryKey: "demographics" },
  { id: "age-40", labelKey: "age40", points: 2, categoryKey: "demographics" },
  { id: "obesity", labelKey: "obesity", points: 1, categoryKey: "medical" },
  { id: "ivf", labelKey: "ivf", points: 1, categoryKey: "pregnancy" },
  { id: "family-history", labelKey: "familyHistory", points: 1, categoryKey: "history" },
  { id: "long-gap", labelKey: "longGap", points: 1, categoryKey: "history" },
];

const warningSignKeys = ["headaches", "vision", "abdominalPain", "swelling", "weightGain"];

export default function PreeclampsiaRisk() {
  const { t } = useTranslation();
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const toggleFactor = (id: string) => {
    setSelectedFactors((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const calculateRisk = () => {
    const totalPoints = riskFactors
      .filter((f) => selectedFactors.includes(f.id))
      .reduce((sum, f) => sum + f.points, 0);

    const hasHighRiskFactor = selectedFactors.some((id) =>
      ["prev-preeclampsia", "chronic-hypertension", "diabetes", "kidney-disease", "autoimmune", "multiples"].includes(id)
    );

    if (hasHighRiskFactor || totalPoints >= 6) {
      return {
        level: "high" as const,
        title: t('preeclampsiaRisk.riskLevels.high.title'),
        description: t('preeclampsiaRisk.riskLevels.high.description'),
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/20",
        recommendation: t('preeclampsiaRisk.riskLevels.high.recommendation'),
      };
    } else if (totalPoints >= 3) {
      return {
        level: "moderate" as const,
        title: t('preeclampsiaRisk.riskLevels.moderate.title'),
        description: t('preeclampsiaRisk.riskLevels.moderate.description'),
        color: "text-warning",
        bgColor: "bg-warning/10",
        borderColor: "border-warning/20",
        recommendation: t('preeclampsiaRisk.riskLevels.moderate.recommendation'),
      };
    } else {
      return {
        level: "low" as const,
        title: t('preeclampsiaRisk.riskLevels.low.title'),
        description: t('preeclampsiaRisk.riskLevels.low.description'),
        color: "text-success",
        bgColor: "bg-success/10",
        borderColor: "border-success/20",
        recommendation: t('preeclampsiaRisk.riskLevels.low.recommendation'),
      };
    }
  };

  const result = calculateRisk();

  return (
    <ToolFrame 
      title={t('preeclampsiaRisk.title')}
      subtitle={t('preeclampsiaRisk.subtitle')}
      customIcon="health-shield"
      mood="calm"
      toolId="preeclampsia-risk"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  {t('preeclampsiaRisk.riskFactorsTitle')}
                </CardTitle>
                <CardDescription>
                  {t('preeclampsiaRisk.riskFactorsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {riskFactors.map((factor, index) => (
                  <motion.div
                    key={factor.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg hover:bg-muted transition-colors">
                      <Checkbox
                        checked={selectedFactors.includes(factor.id)}
                        onCheckedChange={() => toggleFactor(factor.id)}
                        className="mt-0.5"
                      />
                      <div>
                        <span className="text-foreground group-hover:text-primary transition-colors">
                          {t(`preeclampsiaRisk.riskFactors.${factor.labelKey}`)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({t(`preeclampsiaRisk.categories.${factor.categoryKey}`)})
                        </span>
                      </div>
                    </label>
                  </motion.div>
                ))}

                <Button 
                  onClick={() => setShowResults(true)} 
                  className="w-full mt-4"
                >
                  {t('preeclampsiaRisk.calculateRisk')}
                </Button>
              </CardContent>
            </Card>

            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`border ${result.borderColor} ${result.bgColor}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      {result.level === "low" ? (
                        <CheckCircle className={`h-6 w-6 ${result.color} flex-shrink-0`} />
                      ) : (
                        <AlertTriangle className={`h-6 w-6 ${result.color} flex-shrink-0`} />
                      )}
                      <div className="flex-1">
                        <p className={`font-semibold text-lg ${result.color}`}>{result.title}</p>
                        <p className="text-foreground mt-1">{result.description}</p>
                        
                        <div className="mt-3 p-3 rounded-lg bg-card border border-border">
                          <p className="text-sm font-medium text-primary">{result.recommendation}</p>
                        </div>

                        {selectedFactors.length > 0 && (
                          <div className="mt-4 p-3 rounded-lg bg-card">
                            <p className="font-medium text-foreground mb-2">{t('preeclampsiaRisk.yourRiskFactors')}</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {riskFactors
                                .filter((f) => selectedFactors.includes(f.id))
                                .map((f) => (
                                  <li key={f.id}>• {t(`preeclampsiaRisk.riskFactors.${f.labelKey}`)}</li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedFactors.length > 0 && (
                  <AIInsightCard
                    title={t('preeclampsiaRisk.aiCoachTitle')}
                    prompt={`I'm assessing my preeclampsia risk. My risk level is: ${result.title}

My risk factors:
${riskFactors.filter(f => selectedFactors.includes(f.id)).map(f => `- ${t(`preeclampsiaRisk.riskFactors.${f.labelKey}`)} (${t(`preeclampsiaRisk.categories.${f.categoryKey}`)})`).join('\n')}

Please provide personalized guidance:

## 🎯 Your Risk Analysis
Detailed analysis of my specific combination of risk factors

## 🥗 Dietary Recommendations
Foods and nutrients that may help reduce preeclampsia risk

## 🏃‍♀️ Safe Exercise Plan
Exercises that support healthy blood pressure during pregnancy

## 📊 Monitoring Schedule
What vital signs to track and how often

## 🩺 Medical Discussion Points
Specific questions to ask my doctor about my risk profile

## 🌟 Positive Steps
Encouraging message about proactive health management`}
                    variant="default"
                    buttonText={t('preeclampsiaRisk.getPreventionPlan')}
                  />
                )}

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">{t('preeclampsiaRisk.warningSignsTitle')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {warningSignKeys.map((key) => (
                        <li key={key} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                          <span>{t(`preeclampsiaRisk.warningSigns.${key}`)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-sm font-medium text-destructive">
                      {t('preeclampsiaRisk.warningNote')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted p-4">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                {t('preeclampsiaRisk.disclaimer')}
              </p>
            </div>
          </motion.div>
    </ToolFrame>
  );
}