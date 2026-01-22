import { useState } from "react";
import { motion } from "framer-motion";
import { Baby, Info, Calendar } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addDays, addWeeks, differenceInWeeks, differenceInDays, format } from "date-fns";

export default function DueDateCalculator() {
  const [lmpDate, setLmpDate] = useState("");
  const [conceptionDate, setConceptionDate] = useState("");
  const [result, setResult] = useState<{
    dueDate: Date;
    currentWeeks: number;
    currentDays: number;
    trimester: number;
    conception: Date;
    firstTrimesterEnd: Date;
    secondTrimesterEnd: Date;
  } | null>(null);

  const calculateFromLMP = () => {
    if (!lmpDate) return;
    const lmp = new Date(lmpDate);
    calculate(lmp, addWeeks(lmp, 2)); // Conception ~2 weeks after LMP
  };

  const calculateFromConception = () => {
    if (!conceptionDate) return;
    const conception = new Date(conceptionDate);
    const lmp = addWeeks(conception, -2); // LMP ~2 weeks before conception
    calculate(lmp, conception);
  };

  const calculate = (lmp: Date, conception: Date) => {
    const dueDate = addDays(lmp, 280); // 40 weeks from LMP
    const today = new Date();
    
    const totalDaysPregnant = differenceInDays(today, lmp);
    const currentWeeks = Math.floor(totalDaysPregnant / 7);
    const currentDays = totalDaysPregnant % 7;
    
    let trimester = 1;
    if (currentWeeks >= 28) trimester = 3;
    else if (currentWeeks >= 14) trimester = 2;

    setResult({
      dueDate,
      currentWeeks: Math.max(0, currentWeeks),
      currentDays: Math.max(0, currentDays),
      trimester,
      conception,
      firstTrimesterEnd: addWeeks(lmp, 13),
      secondTrimesterEnd: addWeeks(lmp, 27),
    });
  };

  return (
    <Layout title="Due Date Calculator" showBack>
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
                  <Baby className="h-5 w-5 text-primary" />
                  Calculate Your Due Date
                </CardTitle>
                <CardDescription>
                  Estimate when your baby will arrive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="lmp">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="lmp">Last Period</TabsTrigger>
                    <TabsTrigger value="conception">Conception Date</TabsTrigger>
                  </TabsList>

                  <TabsContent value="lmp" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="lmp">First Day of Last Menstrual Period</Label>
                      <Input
                        id="lmp"
                        type="date"
                        value={lmpDate}
                        onChange={(e) => setLmpDate(e.target.value)}
                      />
                    </div>
                    <Button onClick={calculateFromLMP} className="w-full">
                      Calculate Due Date
                    </Button>
                  </TabsContent>

                  <TabsContent value="conception" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="conception">Conception Date</Label>
                      <Input
                        id="conception"
                        type="date"
                        value={conceptionDate}
                        onChange={(e) => setConceptionDate(e.target.value)}
                      />
                    </div>
                    <Button onClick={calculateFromConception} className="w-full">
                      Calculate Due Date
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-primary/20 bg-secondary/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Your Pregnancy Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg bg-primary p-6 text-center">
                      <p className="text-sm text-primary-foreground/80 mb-1">Estimated Due Date</p>
                      <p className="text-3xl font-bold text-primary-foreground">
                        {format(result.dueDate, "MMMM d, yyyy")}
                      </p>
                    </div>

                    {result.currentWeeks >= 0 && (
                      <div className="rounded-lg bg-card p-4 shadow-card text-center">
                        <p className="text-sm text-muted-foreground mb-1">You are currently</p>
                        <p className="text-2xl font-semibold text-foreground">
                          {result.currentWeeks} weeks, {result.currentDays} days
                        </p>
                        <p className="text-sm text-primary mt-1">
                          Trimester {result.trimester}
                        </p>
                      </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg bg-card p-3 shadow-card">
                        <p className="text-xs text-muted-foreground">Conception</p>
                        <p className="font-medium text-foreground">
                          {format(result.conception, "MMM d")}
                        </p>
                      </div>
                      <div className="rounded-lg bg-card p-3 shadow-card">
                        <p className="text-xs text-muted-foreground">2nd Trimester</p>
                        <p className="font-medium text-foreground">
                          {format(result.firstTrimesterEnd, "MMM d")}
                        </p>
                      </div>
                      <div className="rounded-lg bg-card p-3 shadow-card">
                        <p className="text-xs text-muted-foreground">3rd Trimester</p>
                        <p className="font-medium text-foreground">
                          {format(result.secondTrimesterEnd, "MMM d")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted p-4">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Only about 5% of babies are born on their exact due date. Most are born 
                within 2 weeks before or after. Your healthcare provider may adjust your 
                due date based on ultrasound measurements.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
