import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Heart, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { WhenToCallDoctorCard, EvidenceInfoBlock } from "@/components/safety";
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
        className="space-y-4"
      >
            {/* Risk Factors Card */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Heart className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">{t('preeclampsiaRisk.riskFactorsTitle')}</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {t('preeclampsiaRisk.riskFactorsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 pt-0">
                {riskFactors.map((factor, index) => (
                  <motion.div
                    key={factor.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <label className="flex items-center gap-3 cursor-pointer group p-2.5 rounded-lg hover:bg-muted transition-colors">
                      <Checkbox
                        checked={selectedFactors.includes(factor.id)}
                        onCheckedChange={() => toggleFactor(factor.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                          {t(`preeclampsiaRisk.riskFactors.${factor.labelKey}`)}
                        </span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground ml-1.5">
                          ({t(`preeclampsiaRisk.categories.${factor.categoryKey}`)})
                        </span>
                      </div>
                    </label>
                  </motion.div>
                ))}

                <Button 
                  onClick={() => setShowResults(true)} 
                  className="w-full mt-3 text-sm"
                >
                  {t('preeclampsiaRisk.calculateRisk')}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Risk Level Result */}
                <Card className={`overflow-hidden border ${result.borderColor} ${result.bgColor}`}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      {result.level === "low" ? (
                        <CheckCircle className={`h-5 w-5 ${result.color} shrink-0 mt-0.5`} />
                      ) : (
                        <AlertTriangle className={`h-5 w-5 ${result.color} shrink-0 mt-0.5`} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-base ${result.color}`}>{result.title}</p>
                        <p className="text-sm text-foreground mt-1 leading-relaxed">{result.description}</p>
                        
                        <div className="mt-3 p-2.5 rounded-lg bg-card border border-border">
                          <p className="text-xs sm:text-sm font-medium text-primary leading-relaxed">{result.recommendation}</p>
                        </div>

                        {selectedFactors.length > 0 && (
                          <div className="mt-3 p-2.5 rounded-lg bg-card">
                            <p className="font-medium text-sm text-foreground mb-1.5">{t('preeclampsiaRisk.yourRiskFactors')}</p>
                            <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
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

                {/* AI Coach */}
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

                {/* Evidence-based medical info */}
                <EvidenceInfoBlock
                  title={t('preeclampsiaRisk.evidence.title')}
                  content={t('preeclampsiaRisk.evidence.content')}
                  source={t('preeclampsiaRisk.evidence.source')}
                />

                <EvidenceInfoBlock
                  title={t('preeclampsiaRisk.evidence2.title')}
                  content={t('preeclampsiaRisk.evidence2.content')}
                  source={t('preeclampsiaRisk.evidence2.source')}
                />

                {/* When to Call Doctor — Preeclampsia context */}
                <WhenToCallDoctorCard context="preeclampsia" />
              </motion.div>
            )}

            {/* Disclaimer */}
            <Card className="overflow-hidden bg-muted/50">
              <CardContent className="py-3">
                <div className="flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {t('preeclampsiaRisk.disclaimer')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
    </ToolFrame>
  );
}