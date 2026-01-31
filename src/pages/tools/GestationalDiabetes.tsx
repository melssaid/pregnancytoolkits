import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Info, Shield } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AIInsightCard } from "@/components/ai/AIInsightCard";

const riskFactors = [
  { id: "age", label: "Age 35 or older", points: 1 },
  { id: "bmi", label: "BMI 30 or higher before pregnancy", points: 2 },
  { id: "family", label: "Family history of diabetes (parent or sibling)", points: 1 },
  { id: "previous-gdm", label: "Previous gestational diabetes", points: 3 },
  { id: "previous-large", label: "Previously gave birth to a baby over 9 lbs", points: 1 },
  { id: "pcos", label: "Polycystic ovary syndrome (PCOS)", points: 1 },
  { id: "prediabetes", label: "Prediabetes or high blood sugar", points: 2 },
  { id: "ethnicity", label: "Higher-risk ethnicity", points: 1 },
  { id: "multiple", label: "Pregnant with multiples (twins, triplets)", points: 1 },
  { id: "sedentary", label: "Sedentary lifestyle before pregnancy", points: 1 },
];

export default function GestationalDiabetes() {
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

    if (totalPoints >= 5) {
      return {
        level: "high",
        title: "Higher Risk",
        description: "Your risk factors suggest elevated likelihood. Early screening may be recommended.",
        icon: AlertTriangle,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/20",
      };
    } else if (totalPoints >= 3) {
      return {
        level: "moderate",
        title: "Moderate Risk",
        description: "You have some risk factors. Standard screening at 24-28 weeks is recommended.",
        icon: Shield,
        color: "text-amber-600",
        bgColor: "bg-amber-50 dark:bg-amber-950/20",
        borderColor: "border-amber-200 dark:border-amber-800",
      };
    } else {
      return {
        level: "low",
        title: "Lower Risk",
        description: "You have few risk factors, but routine screening at 24-28 weeks is still recommended.",
        icon: CheckCircle,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
        borderColor: "border-emerald-200 dark:border-emerald-800",
      };
    }
  };

  const risk = calculateRisk();

  return (
    <ToolFrame
      title="Gestational Diabetes Risk"
      subtitle="Assess your risk factors for gestational diabetes"
      customIcon="medical-report"
      mood="calm"
      toolId="gestational-diabetes"
    >
      <div className="space-y-6">
        {/* Disclaimer */}
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                This is an educational screening tool only. It does not diagnose gestational diabetes. 
                Always consult your healthcare provider for proper testing and diagnosis.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Risk Factors Checklist */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Check Your Risk Factors</h3>
            <div className="space-y-3">
              {riskFactors.map((factor) => (
                <button
                  key={factor.id}
                  type="button"
                  className={`flex items-start gap-3 p-4 rounded-xl transition-all w-full text-left border-2 ${
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
                  <span className="text-sm text-foreground font-medium">{factor.label}</span>
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
                  <h3 className={`font-bold text-lg ${risk.color}`}>{risk.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Risk Factors Selected:</span>
                    <span className="font-bold text-foreground">{selectedFactors.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Personalized Advice */}
        {selectedFactors.length > 0 && (
          <AIInsightCard
            title="AI Diabetes Prevention Coach"
            prompt={`I'm assessing my gestational diabetes risk. My risk level is ${risk.level} (${risk.title}).

My risk factors:
${riskFactors.filter(f => selectedFactors.includes(f.id)).map(f => `- ${f.label}`).join('\n')}

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
            buttonText="Get Personalized Prevention Plan"
          />
        )}

        {/* Prevention Tips */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              Prevention Tips
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                Maintain a healthy weight before and during pregnancy
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                Eat a balanced diet rich in fiber and whole grains
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                Stay physically active with doctor-approved exercises
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                Attend all prenatal appointments for regular monitoring
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                Limit sugary foods and refined carbohydrates
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Info Note */}
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Gestational diabetes screening typically occurs between weeks 24-28. If you have 
                multiple risk factors, your doctor may recommend earlier screening. This tool is 
                for educational purposes only and does not replace medical advice.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
