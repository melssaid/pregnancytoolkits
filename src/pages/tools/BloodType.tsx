import { useState } from "react";
import { motion } from "framer-motion";
import { Droplet, Info } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export default function BloodType() {
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

  const possibleTypes = getPossibleTypes();
  const rhProbs = getRhProbabilities();

  const needsRhWarning = parent1.rh === "-" && parent2.rh === "+";

  return (
    <Layout title="Blood Type Calculator" showBack>
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
                  <Droplet className="h-5 w-5 text-primary" />
                  Predict Baby's Blood Type
                </CardTitle>
                <CardDescription>
                  Enter both parents' blood types to see possible outcomes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Parent 1 */}
                  <div className="space-y-4 p-4 rounded-lg bg-secondary/30">
                    <p className="font-medium text-foreground">Mother</p>
                    <div className="space-y-2">
                      <Label>Blood Type</Label>
                      <Select 
                        value={parent1.type} 
                        onValueChange={(v) => setParent1({ ...parent1, type: v as BloodType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Type A</SelectItem>
                          <SelectItem value="B">Type B</SelectItem>
                          <SelectItem value="AB">Type AB</SelectItem>
                          <SelectItem value="O">Type O</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Rh Factor</Label>
                      <Select 
                        value={parent1.rh} 
                        onValueChange={(v) => setParent1({ ...parent1, rh: v as RhFactor })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+">Positive (+)</SelectItem>
                          <SelectItem value="-">Negative (-)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Parent 2 */}
                  <div className="space-y-4 p-4 rounded-lg bg-secondary/30">
                    <p className="font-medium text-foreground">Father</p>
                    <div className="space-y-2">
                      <Label>Blood Type</Label>
                      <Select 
                        value={parent2.type} 
                        onValueChange={(v) => setParent2({ ...parent2, type: v as BloodType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Type A</SelectItem>
                          <SelectItem value="B">Type B</SelectItem>
                          <SelectItem value="AB">Type AB</SelectItem>
                          <SelectItem value="O">Type O</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Rh Factor</Label>
                      <Select 
                        value={parent2.rh} 
                        onValueChange={(v) => setParent2({ ...parent2, rh: v as RhFactor })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+">Positive (+)</SelectItem>
                          <SelectItem value="-">Negative (-)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <motion.div
              key={`${parent1.type}${parent1.rh}${parent2.type}${parent2.rh}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-primary/20 bg-secondary/30">
                <CardHeader>
                  <CardTitle className="text-lg">Possible Blood Types for Baby</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {possibleTypes.map((type) => (
                      <div key={type} className="space-y-2">
                        {rhProbs.positive > 0 && (
                          <div className="rounded-lg bg-card p-4 shadow-card text-center min-w-[80px]">
                            <p className="text-2xl font-bold text-primary">{type}+</p>
                          </div>
                        )}
                        {rhProbs.negative > 0 && (
                          <div className="rounded-lg bg-card p-4 shadow-card text-center min-w-[80px]">
                            <p className="text-2xl font-bold text-primary">{type}-</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 pt-2">
                    <div className="rounded-lg bg-card p-3 shadow-card">
                      <p className="text-sm text-muted-foreground">Rh Positive Chance</p>
                      <p className="text-xl font-bold text-foreground">{rhProbs.positive}%</p>
                    </div>
                    <div className="rounded-lg bg-card p-3 shadow-card">
                      <p className="text-sm text-muted-foreground">Rh Negative Chance</p>
                      <p className="text-xl font-bold text-foreground">{rhProbs.negative}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {needsRhWarning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-lg bg-warning/10 border border-warning/30 p-4 flex items-start gap-3"
              >
                <Info className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Rh Incompatibility Consideration</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    When the mother is Rh-negative and father is Rh-positive, the baby may be 
                    Rh-positive. Your doctor may recommend RhoGAM injections during pregnancy 
                    to prevent complications.
                  </p>
                </div>
              </motion.div>
            )}

            <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted p-4">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                This calculator shows possible blood types based on genetics. The actual 
                blood type will be confirmed through testing after birth.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
