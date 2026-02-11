import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Droplet, Info, AlertTriangle } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIInsightCard } from "@/components/ai/AIInsightCard";

type BloodType = "A" | "B" | "AB" | "O";
type RhFactor = "+" | "-";

interface ParentBlood {
  type: BloodType;
  rh: RhFactor;
}

const bloodTypeOutcomes: Record<string, BloodType[]> = {
  "A-A": ["A", "O"],
  "A-B": ["A", "B", "AB", "O"],
  "A-AB": ["A", "B", "AB"],
  "A-O": ["A", "O"],
  "B-B": ["B", "O"],
  "B-AB": ["A", "B", "AB"],
  "B-O": ["B", "O"],
  "AB-AB": ["A", "B", "AB"],
  "AB-O": ["A", "B"],
  "O-O": ["O"],
};

const rhOutcomes: Record<string, { positive: number; negative: number }> = {
  "+-+": { positive: 100, negative: 0 },
  "+--": { positive: 50, negative: 50 },
  "--+": { positive: 50, negative: 50 },
  "---": { positive: 0, negative: 100 },
};

export default function BloodTypeCalculator() {
  const [parent1, setParent1] = useState<ParentBlood>({ type: "A", rh: "+" });
  const [parent2, setParent2] = useState<ParentBlood>({ type: "B", rh: "+" });

  const getPossibleTypes = () => {
    const key1 = `${parent1.type}-${parent2.type}`;
    const key2 = `${parent2.type}-${parent1.type}`;
    return bloodTypeOutcomes[key1] || bloodTypeOutcomes[key2] || [];
  };

  const getRhProbabilities = () => {
    const key = `${parent1.rh}-${parent2.rh}`;
    return rhOutcomes[key] || rhOutcomes[`${parent2.rh}-${parent1.rh}`] || { positive: 50, negative: 50 };
  };

  const { t } = useTranslation();
  const possibleTypes = getPossibleTypes();
  const rhProbs = getRhProbabilities();
  const needsRhWarning = parent1.rh === "-" && parent2.rh === "+";

  return (
    <ToolFrame
      title={t('toolsInternal.bloodType.title')}
      subtitle={t('toolsInternal.bloodType.subtitle')}
      customIcon="blood-type"
      mood="calm"
      toolId="blood-type"
    >
      <div className="space-y-4">
        {/* Parents Selection */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Parent 1 - Mother */}
          <Card>
            <CardContent className="pt-3 space-y-3">
              <p className="text-sm font-semibold text-foreground">{t('toolsInternal.bloodType.mother')}</p>
              <div className="space-y-2">
                <Label className="text-xs">{t('toolsInternal.bloodType.bloodType')}</Label>
                <Select 
                  value={parent1.type} 
                  onValueChange={(v) => setParent1({ ...parent1, type: v as BloodType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">{t('toolsInternal.bloodType.typeA')}</SelectItem>
                    <SelectItem value="B">{t('toolsInternal.bloodType.typeB')}</SelectItem>
                    <SelectItem value="AB">{t('toolsInternal.bloodType.typeAB')}</SelectItem>
                    <SelectItem value="O">{t('toolsInternal.bloodType.typeO')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('toolsInternal.bloodType.rhFactor')}</Label>
                <Select 
                  value={parent1.rh} 
                  onValueChange={(v) => setParent1({ ...parent1, rh: v as RhFactor })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+">{t('toolsInternal.bloodType.positive')}</SelectItem>
                    <SelectItem value="-">{t('toolsInternal.bloodType.negative')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-center pt-2">
                <span className="text-base font-bold text-primary">
                  {parent1.type}{parent1.rh}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Parent 2 - Father */}
          <Card>
            <CardContent className="pt-3 space-y-3">
              <p className="text-sm font-semibold text-foreground">{t('toolsInternal.bloodType.father')}</p>
              <div className="space-y-2">
                <Label className="text-xs">{t('toolsInternal.bloodType.bloodType')}</Label>
                <Select 
                  value={parent2.type} 
                  onValueChange={(v) => setParent2({ ...parent2, type: v as BloodType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">{t('toolsInternal.bloodType.typeA')}</SelectItem>
                    <SelectItem value="B">{t('toolsInternal.bloodType.typeB')}</SelectItem>
                    <SelectItem value="AB">{t('toolsInternal.bloodType.typeAB')}</SelectItem>
                    <SelectItem value="O">{t('toolsInternal.bloodType.typeO')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('toolsInternal.bloodType.rhFactor')}</Label>
                <Select 
                  value={parent2.rh} 
                  onValueChange={(v) => setParent2({ ...parent2, rh: v as RhFactor })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+">{t('toolsInternal.bloodType.positive')}</SelectItem>
                    <SelectItem value="-">{t('toolsInternal.bloodType.negative')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-center pt-2">
                <span className="text-base font-bold text-primary">
                  {parent2.type}{parent2.rh}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <motion.div
          key={`${parent1.type}${parent1.rh}${parent2.type}${parent2.rh}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-4">
              <h3 className="text-sm font-semibold mb-3">{t('toolsInternal.bloodType.possibleTypes')}</h3>
              <div className="flex flex-wrap gap-3 justify-center mb-6">
                {possibleTypes.map((type) => (
                  <div key={type} className="space-y-2">
                    {rhProbs.positive > 0 && (
                      <div className="rounded-xl bg-card p-4 shadow-sm text-center min-w-[70px]">
                        <p className="text-sm font-bold text-primary">{type}+</p>
                      </div>
                    )}
                    {rhProbs.negative > 0 && (
                      <div className="rounded-xl bg-card p-4 shadow-sm text-center min-w-[70px]">
                        <p className="text-sm font-bold text-primary">{type}-</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-card p-4 text-center">
                  <p className="text-xs text-muted-foreground">{t('toolsInternal.bloodType.rhPositiveChance')}</p>
                  <p className="text-sm font-bold text-foreground">{rhProbs.positive}%</p>
                </div>
                <div className="rounded-xl bg-card p-4 text-center">
                  <p className="text-xs text-muted-foreground">{t('toolsInternal.bloodType.rhNegativeChance')}</p>
                  <p className="text-sm font-bold text-foreground">{rhProbs.negative}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Blood Type Insights */}
        <AIInsightCard
          title={t('toolsInternal.aiInsights.bloodTypeGuide')}
          prompt={`Mother's blood type: ${parent1.type}${parent1.rh}
Father's blood type: ${parent2.type}${parent2.rh}
Possible baby blood types: ${possibleTypes.map(t => `${t}+ or ${t}-`).join(', ')}
Rh+ chance: ${rhProbs.positive}%, Rh- chance: ${rhProbs.negative}%
${needsRhWarning ? 'Note: There is potential Rh incompatibility (mother Rh-, father Rh+)' : ''}

Please provide:

## 🧬 Genetics Explained
Simple explanation of how blood type inheritance works for our combination

## 👶 Baby's Likely Blood Types
Analysis of the most likely outcomes

${needsRhWarning ? `## ⚠️ Rh Incompatibility Guide
Detailed information about Rh incompatibility, RhoGAM shots, and what to expect

` : ''}## 🩸 Blood Type Facts
Interesting facts about our blood type combination

## 🩺 Medical Considerations
What to discuss with the doctor regarding blood types during pregnancy`}
          variant="compact"
          buttonText={t('toolsInternal.bloodType.learnAboutBloodTypes')}
        />

        {/* Rh Warning */}
        {needsRhWarning && (
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">{t('toolsInternal.bloodType.rhIncompatibility')}</p>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                    {t('toolsInternal.bloodType.rhWarning')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Note */}
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                {t('toolsInternal.bloodType.disclaimer')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
