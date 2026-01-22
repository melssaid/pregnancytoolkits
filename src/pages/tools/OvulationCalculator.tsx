import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Info } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addDays, format, subDays } from "date-fns";

export default function OvulationCalculator() {
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [result, setResult] = useState<{
    ovulationDate: Date;
    fertileStart: Date;
    fertileEnd: Date;
    nextPeriod: Date;
  } | null>(null);

  const calculate = () => {
    if (!lastPeriod) return;

    const lmpDate = new Date(lastPeriod);
    const cycle = parseInt(cycleLength);
    
    // Ovulation typically occurs 14 days before next period
    const ovulationDate = addDays(lmpDate, cycle - 14);
    const fertileStart = subDays(ovulationDate, 5);
    const fertileEnd = addDays(ovulationDate, 1);
    const nextPeriod = addDays(lmpDate, cycle);

    setResult({
      ovulationDate,
      fertileStart,
      fertileEnd,
      nextPeriod,
    });
  };

  return (
    <Layout title="Ovulation Calculator" showBack>
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
                  <Calendar className="h-5 w-5 text-primary" />
                  Calculate Your Fertile Window
                </CardTitle>
                <CardDescription>
                  Enter your cycle details to find your most fertile days
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lastPeriod">First Day of Last Period</Label>
                  <Input
                    id="lastPeriod"
                    type="date"
                    value={lastPeriod}
                    onChange={(e) => setLastPeriod(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cycleLength">Average Cycle Length (days)</Label>
                  <Input
                    id="cycleLength"
                    type="number"
                    min="21"
                    max="45"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Most cycles range from 21-35 days
                  </p>
                </div>

                <Button onClick={calculate} className="w-full">
                  Calculate Ovulation
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
                      <div className="rounded-lg bg-card p-4 shadow-card">
                        <p className="text-sm text-muted-foreground">Estimated Ovulation</p>
                        <p className="text-xl font-semibold text-primary">
                          {format(result.ovulationDate, "MMM d, yyyy")}
                        </p>
                      </div>
                      
                      <div className="rounded-lg bg-card p-4 shadow-card">
                        <p className="text-sm text-muted-foreground">Next Period</p>
                        <p className="text-xl font-semibold text-foreground">
                          {format(result.nextPeriod, "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-success/10 p-4 border border-success/20">
                      <p className="font-medium text-success mb-1">Fertile Window</p>
                      <p className="text-foreground">
                        {format(result.fertileStart, "MMM d")} – {format(result.fertileEnd, "MMM d, yyyy")}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        This is your most likely window for conception
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted p-4">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                This calculator provides estimates based on average cycle patterns. 
                Individual cycles may vary. For accurate fertility tracking, consider 
                using ovulation predictor kits or consulting with your healthcare provider.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
