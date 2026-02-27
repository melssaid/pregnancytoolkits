import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Info, Shield, Heart } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIInsightCard } from "@/components/ai/AIInsightCard";

// ═══════════════════════════════════════════════════════════════
// GDM Risk Factors
// ═══════════════════════════════════════════════════════════════
const GDM_FACTORS = [
  { id: "age", labelKey: "toolsInternal.gdm.riskFactors.age", points: 1 },
  { id: "bmi", labelKey: "toolsInternal.gdm.riskFactors.bmi", points: 2 },
  { id: "family", labelKey: "toolsInternal.gdm.riskFactors.family", points: 1 },
  { id: "previous-gdm", labelKey: "toolsInternal.gdm.riskFactors.previousGdm", points: 3 },
  { id: "previous-large", labelKey: "toolsInternal.gdm.riskFactors.previousLarge", points: 1 },
  { id: "pcos", labelKey: "toolsInternal.gdm.riskFactors.pcos", points: 1 },
  { id: "prediabetes", labelKey: "toolsInternal.gdm.riskFactors.prediabetes", points: 2 },
  { id: "ethnicity", labelKey: "toolsInternal.gdm.riskFactors.ethnicity", points: 1 },
  { id: "multiple", labelKey: "toolsInternal.gdm.riskFactors.multiple", points: 1 },
  { id: "sedentary", labelKey: "toolsInternal.gdm.riskFactors.sedentary", points: 1 },
];

// ═══════════════════════════════════════════════════════════════
// Preeclampsia Risk Factors
// ═══════════════════════════════════════════════════════════════
const PE_FACTORS = [
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

const PE_WARNING_SIGNS = ["headaches", "vision", "abdominalPain", "swelling", "weightGain"];

// ═══════════════════════════════════════════════════════════════
// GDM Tab Content
// ═══════════════════════════════════════════════════════════════
function GDMTab() {
  const { t } = useTranslation();
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);

  const toggleFactor = (id: string) => {
    setSelectedFactors(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const totalPoints = GDM_FACTORS.filter(f => selectedFactors.includes(f.id)).reduce((s, f) => s + f.points, 0);
  const risk = totalPoints >= 5
    ? { level: "high", color: "text-destructive", bgColor: "bg-destructive/10", borderColor: "border-destructive/20", icon: AlertTriangle }
    : totalPoints >= 3
    ? { level: "moderate", color: "text-muted-foreground", bgColor: "bg-muted", borderColor: "border-border", icon: Shield }
    : { level: "low", color: "text-primary", bgColor: "bg-primary/5", borderColor: "border-primary/20", icon: CheckCircle };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-sm mb-3">{t('toolsInternal.gdm.checkRiskFactors')}</h3>
          <div className="space-y-2">
            {GDM_FACTORS.map(factor => (
              <button
                key={factor.id}
                type="button"
                className={`flex items-start gap-3 p-2.5 rounded-xl transition-all w-full text-left border-2 ${
                  selectedFactors.includes(factor.id)
                    ? "bg-primary/10 border-primary/40 shadow-sm"
                    : "bg-muted/50 hover:bg-muted border-transparent"
                }`}
                onClick={() => toggleFactor(factor.id)}
              >
                <Checkbox checked={selectedFactors.includes(factor.id)} className="mt-0.5 pointer-events-none" />
                <span className="text-xs text-foreground font-medium">{t(factor.labelKey)}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className={`${risk.bgColor} ${risk.borderColor} border`}>
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${risk.bgColor}`}>
              <risk.icon className={`h-5 w-5 ${risk.color}`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-sm ${risk.color}`}>{t(`toolsInternal.gdm.riskLevels.${risk.level}.title`)}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t(`toolsInternal.gdm.riskLevels.${risk.level}.description`)}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{t('toolsInternal.gdm.riskFactorsSelected')}:</span>
                <span className="font-bold text-foreground">{selectedFactors.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedFactors.length > 0 && (
        <AIInsightCard
          title={t('toolsInternal.gdm.aiCoachTitle')}
          prompt={`I'm assessing my gestational diabetes risk. My risk level is ${risk.level}.
My risk factors:\n${GDM_FACTORS.filter(f => selectedFactors.includes(f.id)).map(f => `- ${t(f.labelKey)}`).join('\n')}
Please provide personalized advice:
## 🎯 Your Risk Profile
## 🥗 Meal Plan Suggestions
## 🏃‍♀️ Exercise Recommendations
## 📋 Daily Monitoring Tips
## 🩺 Questions for My Doctor
## 💪 Motivation`}
          variant="default"
          buttonText={t('toolsInternal.gdm.getPreventionPlan')}
        />
      )}

      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            {t('toolsInternal.gdm.preventionTipsTitle')}
          </h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {[1, 2, 3, 4, 5].map(i => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                {t(`toolsInternal.gdm.preventionTips.tip${i}`)}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Preeclampsia Tab Content
// ═══════════════════════════════════════════════════════════════
function PreeclampsiaTab() {
  const { t } = useTranslation();
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const toggleFactor = (id: string) => {
    setSelectedFactors(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const totalPoints = PE_FACTORS.filter(f => selectedFactors.includes(f.id)).reduce((s, f) => s + f.points, 0);
  const hasHighRisk = selectedFactors.some(id =>
    ["prev-preeclampsia", "chronic-hypertension", "diabetes", "kidney-disease", "autoimmune", "multiples"].includes(id)
  );

  const result = (hasHighRisk || totalPoints >= 6)
    ? { level: "high" as const, color: "text-destructive", bgColor: "bg-destructive/10", borderColor: "border-destructive/20" }
    : totalPoints >= 3
    ? { level: "moderate" as const, color: "text-warning", bgColor: "bg-warning/10", borderColor: "border-warning/20" }
    : { level: "low" as const, color: "text-primary", bgColor: "bg-primary/5", borderColor: "border-primary/20" };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Heart className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">{t('preeclampsiaRisk.riskFactorsTitle')}</span>
          </CardTitle>
          <CardDescription className="text-xs">{t('preeclampsiaRisk.riskFactorsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 pt-0">
          {PE_FACTORS.map(factor => (
            <label key={factor.id} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-muted transition-colors">
              <Checkbox checked={selectedFactors.includes(factor.id)} onCheckedChange={() => toggleFactor(factor.id)} />
              <div className="min-w-0 flex-1">
                <span className="text-xs text-foreground group-hover:text-primary transition-colors">
                  {t(`preeclampsiaRisk.riskFactors.${factor.labelKey}`)}
                </span>
                <span className="text-[10px] text-muted-foreground ml-1.5">
                  ({t(`preeclampsiaRisk.categories.${factor.categoryKey}`)})
                </span>
              </div>
            </label>
          ))}
          <Button onClick={() => setShowResults(true)} className="w-full mt-3 text-xs" size="sm">
            {t('preeclampsiaRisk.calculateRisk')}
          </Button>
        </CardContent>
      </Card>

      {showResults && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className={`border ${result.borderColor} ${result.bgColor}`}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                {result.level === "low"
                  ? <CheckCircle className={`h-5 w-5 ${result.color} shrink-0 mt-0.5`} />
                  : <AlertTriangle className={`h-5 w-5 ${result.color} shrink-0 mt-0.5`} />
                }
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${result.color}`}>{t(`preeclampsiaRisk.riskLevels.${result.level}.title`)}</p>
                  <p className="text-xs text-foreground mt-1 leading-relaxed">{t(`preeclampsiaRisk.riskLevels.${result.level}.description`)}</p>
                  <div className="mt-3 p-2 rounded-lg bg-card border border-border">
                    <p className="text-xs font-medium text-primary leading-relaxed">{t(`preeclampsiaRisk.riskLevels.${result.level}.recommendation`)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedFactors.length > 0 && (
            <AIInsightCard
              title={t('preeclampsiaRisk.aiCoachTitle')}
              prompt={`I'm assessing my preeclampsia risk. My risk level is: ${t(`preeclampsiaRisk.riskLevels.${result.level}.title`)}
My risk factors:\n${PE_FACTORS.filter(f => selectedFactors.includes(f.id)).map(f => `- ${t(`preeclampsiaRisk.riskFactors.${f.labelKey}`)}`).join('\n')}
Please provide personalized guidance:
## 🎯 Your Risk Analysis
## 🥗 Dietary Recommendations
## 🏃‍♀️ Safe Exercise Plan
## 📊 Monitoring Schedule
## 🩺 Medical Discussion Points
## 🌟 Positive Steps`}
              variant="default"
              buttonText={t('preeclampsiaRisk.getPreventionPlan')}
            />
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('preeclampsiaRisk.warningSignsTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {PE_WARNING_SIGNS.map(key => (
                  <li key={key} className="flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                    <span className="text-xs text-muted-foreground leading-relaxed">{t(`preeclampsiaRisk.warningSigns.${key}`)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs font-medium text-destructive">{t('preeclampsiaRisk.warningNote')}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════
export default function MaternalHealthAwareness() {
  const { t } = useTranslation();

  return (
    <ToolFrame
      title={t('tools.maternalHealth.title')}
      subtitle={t('tools.maternalHealth.description')}
      mood="calm"
      toolId="maternal-health-awareness"
    >
      <div className="space-y-4">
        <Tabs defaultValue="gdm" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="gdm" className="flex-1 text-xs">
              {t('tools.gestationalDiabetes.title')}
            </TabsTrigger>
            <TabsTrigger value="preeclampsia" className="flex-1 text-xs">
              {t('tools.preeclampsiaRisk.title')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="gdm"><GDMTab /></TabsContent>
          <TabsContent value="preeclampsia"><PreeclampsiaTab /></TabsContent>
        </Tabs>

        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">{t('toolsInternal.gdm.infoNote')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
