import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Calculator, Info } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIInsightCard } from "@/components/ai/AIInsightCard";

interface Result {
  bmi: number;
  category: string;
  recommendedGain: { min: number; max: number };
  weeklyGain: { min: number; max: number };
}

export default function PregnancyBMI() {
  const { t } = useTranslation();
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [unit, setUnit] = useState<"imperial" | "metric">("metric");
  const [result, setResult] = useState<Result | null>(null);

  const calculate = () => {
    if (!weight || !height) return;

    let bmi: number;
    if (unit === "imperial") {
      bmi = (parseFloat(weight) / Math.pow(parseFloat(height), 2)) * 703;
    } else {
      const heightM = parseFloat(height) / 100;
      bmi = parseFloat(weight) / Math.pow(heightM, 2);
    }

    let category: string;
    let recommendedGain: { min: number; max: number };
    let weeklyGain: { min: number; max: number };

    if (bmi < 18.5) {
      category = "Underweight";
      recommendedGain = { min: 28, max: 40 };
      weeklyGain = { min: 1, max: 1.3 };
    } else if (bmi < 25) {
      category = "Normal weight";
      recommendedGain = { min: 25, max: 35 };
      weeklyGain = { min: 0.8, max: 1 };
    } else if (bmi < 30) {
      category = "Overweight";
      recommendedGain = { min: 15, max: 25 };
      weeklyGain = { min: 0.5, max: 0.7 };
    } else {
      category = "Obese";
      recommendedGain = { min: 11, max: 20 };
      weeklyGain = { min: 0.4, max: 0.6 };
    }

    setResult({
      bmi: Math.round(bmi * 10) / 10,
      category,
      recommendedGain,
      weeklyGain,
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Underweight": return "text-amber-600";
      case "Normal weight": return "text-emerald-600";
      case "Overweight": return "text-amber-600";
      case "Obese": return "text-destructive";
      default: return "text-foreground";
    }
  };

  return (
    <ToolFrame
      title={t('toolsInternal.bmi.title')}
      subtitle={t('toolsInternal.bmi.subtitle')}
      customIcon="weight-scale"
      mood="calm"
      toolId="pregnancy-bmi"
    >
      <div className="space-y-6">
        {/* Input Card */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>{t('toolsInternal.bmi.unitSystem')}</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v as "imperial" | "metric")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="imperial">{t('toolsInternal.bmi.imperial')}</SelectItem>
                  <SelectItem value="metric">{t('toolsInternal.bmi.metric')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="weight">
                  {t('toolsInternal.bmi.prePregnancyWeight')} ({unit === "imperial" ? "lbs" : "kg"})
                </Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder={unit === "imperial" ? "e.g., 150" : "e.g., 68"}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">
                  {t('toolsInternal.bmi.height')} ({unit === "imperial" ? "inches" : "cm"})
                </Label>
                <Input
                  id="height"
                  type="number"
                  placeholder={unit === "imperial" ? "e.g., 65" : "e.g., 165"}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={calculate} className="w-full">
              {t('toolsInternal.bmi.calculateBtn')}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="pt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-card p-4 shadow-sm text-center">
                    <p className="text-sm text-muted-foreground">{t('toolsInternal.bmi.prePregnancyBMI')}</p>
                    <p className="text-3xl font-bold text-primary">{result.bmi}</p>
                    <p className={`text-sm font-medium ${getCategoryColor(result.category)}`}>
                      {t(`toolsInternal.bmi.categories.${result.category.toLowerCase().replace(' ', '')}`)}
                    </p>
                  </div>
                  
                  <div className="rounded-xl bg-card p-4 shadow-sm text-center">
                    <p className="text-sm text-muted-foreground">{t('toolsInternal.bmi.recommendedGain')}</p>
                    <p className="text-3xl font-bold text-foreground">
                      {result.recommendedGain.min}-{result.recommendedGain.max}
                    </p>
                    <p className="text-sm text-muted-foreground">{t('toolsInternal.bmi.pounds')}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-card p-4 shadow-sm">
                  <p className="font-medium text-foreground mb-2">
                    {t('toolsInternal.bmi.weeklyGainTitle')}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {result.weeklyGain.min} - {result.weeklyGain.max} {t('toolsInternal.bmi.lbsPerWeek')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('toolsInternal.bmi.firstTrimesterNote')}
                  </p>
                </div>

                <AIInsightCard
                  title={t('toolsInternal.bmi.aiGuideTitle')}
                  prompt={`My pre-pregnancy BMI is ${result.bmi} (${result.category}).
Recommended total weight gain: ${result.recommendedGain.min}-${result.recommendedGain.max} pounds
Weekly gain target (2nd/3rd trimester): ${result.weeklyGain.min}-${result.weeklyGain.max} lbs/week

Please provide personalized guidance:

## 📊 Your BMI Analysis
What my BMI category means for pregnancy

## 🍽️ Nutrition Plan
Specific daily calorie and macro recommendations for healthy weight gain

## 🥗 Sample Meal Ideas
3-4 balanced meal ideas appropriate for my category

## 🏃‍♀️ Exercise Recommendations
Safe exercises to help maintain healthy weight gain

## 📈 Weight Tracking Tips
How to monitor weight gain healthily without stress

## ⚠️ Warning Signs
When weight changes might indicate a concern`}
                  variant="compact"
                  buttonText={t('toolsInternal.bmi.getPersonalizedPlan')}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                {t('toolsInternal.bmi.disclaimer')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
