import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Calculator, Info } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");
  const [result, setResult] = useState<Result | null>(null);

  const calculate = () => {
    if (!weight || !height) return;

    let bmi: number;
    if (unit === "imperial") {
      // Weight in lbs, height in inches
      bmi = (parseFloat(weight) / Math.pow(parseFloat(height), 2)) * 703;
    } else {
      // Weight in kg, height in cm
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
      case "Underweight": return "text-warning";
      case "Normal weight": return "text-success";
      case "Overweight": return "text-warning";
      case "Obese": return "text-destructive";
      default: return "text-foreground";
    }
  };

  return (
    <Layout title={t("tools.pregnancyBmi.title")} showBack>
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
                  <Calculator className="h-5 w-5 text-primary" />
                  Calculate Your Pre-Pregnancy BMI
                </CardTitle>
                <CardDescription>
                  Find your recommended weight gain during pregnancy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Unit System</Label>
                  <Select value={unit} onValueChange={(v) => setUnit(v as "imperial" | "metric")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="imperial">Imperial (lbs, inches)</SelectItem>
                      <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="weight">
                      Pre-Pregnancy Weight ({unit === "imperial" ? "lbs" : "kg"})
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
                      Height ({unit === "imperial" ? "inches" : "cm"})
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
                  Calculate BMI
                </Button>
              </CardContent>
            </Card>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-primary/20 bg-secondary/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Your Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg bg-card p-4 shadow-card text-center">
                        <p className="text-sm text-muted-foreground">Pre-Pregnancy BMI</p>
                        <p className="text-3xl font-bold text-primary">{result.bmi}</p>
                        <p className={`text-sm font-medium ${getCategoryColor(result.category)}`}>
                          {result.category}
                        </p>
                      </div>
                      
                      <div className="rounded-lg bg-card p-4 shadow-card text-center">
                        <p className="text-sm text-muted-foreground">Recommended Total Gain</p>
                        <p className="text-3xl font-bold text-foreground">
                          {result.recommendedGain.min}-{result.recommendedGain.max}
                        </p>
                        <p className="text-sm text-muted-foreground">pounds</p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-card p-4 shadow-card">
                      <p className="font-medium text-foreground mb-2">
                        Weekly Weight Gain (2nd & 3rd Trimester)
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {result.weeklyGain.min} - {result.weeklyGain.max} lbs/week
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        First trimester: 1-4 pounds total
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted p-4">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                These recommendations are based on the Institute of Medicine guidelines. 
                Your healthcare provider may give you personalized advice based on your 
                specific health situation and pregnancy.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
