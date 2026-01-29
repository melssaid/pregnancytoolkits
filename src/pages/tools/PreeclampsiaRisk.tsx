import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const riskFactors = [
  { id: "first-pregnancy", label: "First pregnancy", points: 1, category: "Pregnancy" },
  { id: "prev-preeclampsia", label: "Previous pregnancy with preeclampsia", points: 3, category: "History" },
  { id: "chronic-hypertension", label: "Chronic hypertension (high blood pressure)", points: 2, category: "Medical" },
  { id: "diabetes", label: "Type 1 or Type 2 diabetes", points: 2, category: "Medical" },
  { id: "kidney-disease", label: "Kidney disease", points: 2, category: "Medical" },
  { id: "autoimmune", label: "Autoimmune disease (lupus, antiphospholipid syndrome)", points: 2, category: "Medical" },
  { id: "multiples", label: "Pregnant with multiples", points: 2, category: "Pregnancy" },
  { id: "age-35", label: "Age 35 or older", points: 1, category: "Demographics" },
  { id: "age-40", label: "Age 40 or older", points: 2, category: "Demographics" },
  { id: "obesity", label: "Obesity (BMI 30 or higher)", points: 1, category: "Medical" },
  { id: "ivf", label: "Pregnancy through IVF", points: 1, category: "Pregnancy" },
  { id: "family-history", label: "Family history of preeclampsia", points: 1, category: "History" },
  { id: "long-gap", label: "10+ years since last pregnancy", points: 1, category: "History" },
];

export default function PreeclampsiaRisk() {
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

    // Check for high-risk factors
    const hasHighRiskFactor = selectedFactors.some((id) =>
      ["prev-preeclampsia", "chronic-hypertension", "diabetes", "kidney-disease", "autoimmune", "multiples"].includes(id)
    );

    if (hasHighRiskFactor || totalPoints >= 6) {
      return {
        level: "high",
        title: "Higher Risk",
        description: "You have one or more significant risk factors for preeclampsia. Your provider may recommend low-dose aspirin starting at 12 weeks.",
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/20",
        recommendation: "Discuss aspirin prophylaxis with your healthcare provider",
      };
    } else if (totalPoints >= 3) {
      return {
        level: "moderate",
        title: "Moderate Risk",
        description: "You have some risk factors. Enhanced monitoring and lifestyle modifications may be recommended.",
        color: "text-warning",
        bgColor: "bg-warning/10",
        borderColor: "border-warning/20",
        recommendation: "Consider discussing risk with your healthcare provider",
      };
    } else {
      return {
        level: "low",
        title: "Lower Risk",
        description: "You have few identified risk factors. Continue with standard prenatal care.",
        color: "text-success",
        bgColor: "bg-success/10",
        borderColor: "border-success/20",
        recommendation: "Maintain regular prenatal visits",
      };
    }
  };

  const result = calculateRisk();

  return (
    <ToolFrame 
      title="Preeclampsia Risk Calculator" 
      subtitle="Evaluate your risk factors for preeclampsia"
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
                  Risk Factors for Preeclampsia
                </CardTitle>
                <CardDescription>
                  Check all factors that apply to evaluate your risk level
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
                          {factor.label}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({factor.category})
                        </span>
                      </div>
                    </label>
                  </motion.div>
                ))}

                <Button 
                  onClick={() => setShowResults(true)} 
                  className="w-full mt-4"
                >
                  Calculate Risk
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
                            <p className="font-medium text-foreground mb-2">Your Risk Factors:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {riskFactors
                                .filter((f) => selectedFactors.includes(f.id))
                                .map((f) => (
                                  <li key={f.id}>• {f.label}</li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Warning Signs to Watch For</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                        <span>Severe headaches that don't go away</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                        <span>Vision changes (blurriness, seeing spots)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                        <span>Upper abdominal pain (especially right side)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                        <span>Sudden swelling (face, hands, feet)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                        <span>Sudden weight gain (more than 5 lbs in a week)</span>
                      </li>
                    </ul>
                    <p className="mt-3 text-sm font-medium text-destructive">
                      If you experience any of these symptoms, contact your healthcare provider immediately.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted p-4">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                This tool identifies risk factors but cannot predict or diagnose preeclampsia. 
                Regular prenatal care with blood pressure monitoring is essential for all pregnancies.
              </p>
            </div>
          </motion.div>
    </ToolFrame>
  );
}
