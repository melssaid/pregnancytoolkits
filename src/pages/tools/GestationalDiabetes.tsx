import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const riskFactors = [
  { id: "age", label: "Age 35 or older", points: 1 },
  { id: "bmi", label: "BMI 30 or higher before pregnancy", points: 2 },
  { id: "family", label: "Family history of diabetes (parent or sibling)", points: 1 },
  { id: "previous-gdm", label: "Previous gestational diabetes", points: 3 },
  { id: "previous-large", label: "Previously gave birth to a baby over 9 lbs", points: 1 },
  { id: "pcos", label: "Polycystic ovary syndrome (PCOS)", points: 1 },
  { id: "prediabetes", label: "Prediabetes or high blood sugar", points: 2 },
  { id: "ethnicity", label: "Higher-risk ethnicity (Hispanic, African American, Asian, Pacific Islander, Native American)", points: 1 },
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
        description: "Your risk factors suggest elevated likelihood of gestational diabetes. Early screening may be recommended.",
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/20",
      };
    } else if (totalPoints >= 3) {
      return {
        level: "moderate",
        title: "Moderate Risk",
        description: "You have some risk factors for gestational diabetes. Standard screening at 24-28 weeks is recommended.",
        color: "text-warning",
        bgColor: "bg-warning/10",
        borderColor: "border-warning/20",
      };
    } else {
      return {
        level: "low",
        title: "Lower Risk",
        description: "You have few risk factors, but routine screening at 24-28 weeks is still recommended.",
        color: "text-success",
        bgColor: "bg-success/10",
        borderColor: "border-success/20",
      };
    }
  };

  const result = calculateRisk();

  return (
    <Layout title="Gestational Diabetes Risk Assessment" showBack>
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  GDM Risk Factors
                </CardTitle>
                <CardDescription>
                  Check all factors that apply to you
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
                      <span className="text-foreground group-hover:text-primary transition-colors">
                        {factor.label}
                      </span>
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
                      <div>
                        <p className={`font-semibold text-lg ${result.color}`}>{result.title}</p>
                        <p className="text-foreground mt-1">{result.description}</p>
                        
                        <div className="mt-4 p-3 rounded-lg bg-card">
                          <p className="font-medium text-foreground mb-2">Risk Factors Selected:</p>
                          {selectedFactors.length > 0 ? (
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {riskFactors
                                .filter((f) => selectedFactors.includes(f.id))
                                .map((f) => (
                                  <li key={f.id}>• {f.label}</li>
                                ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">None selected</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Prevention Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Maintain a healthy weight before and during pregnancy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Eat a balanced diet with limited refined sugars</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Stay physically active with pregnancy-safe exercises</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Attend all prenatal appointments and screenings</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted p-4">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                This is a screening tool only and does not diagnose gestational diabetes. 
                Your healthcare provider will conduct proper testing, typically between 
                24-28 weeks of pregnancy.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
