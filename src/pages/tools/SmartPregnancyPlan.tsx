import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Activity, Utensils, FileText, Printer } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { WeekSlider } from "@/components/WeekSlider";

const SmartPregnancyPlan = () => {
  const { t } = useTranslation();
  const [week, setWeek] = useState<number>(24);
  const [weight, setWeight] = useState<number>(65);
  const [painLevel, setPainLevel] = useState<number>(5);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    if (printRef.current) {
      // Simple window print which is robust
      window.print();
      toast.success(t("smartPlan.printSuccess"));
    }
  };

  // Mock Logic for "AI" Plans
  const getCalories = () => {
    // Basic BMR estimate for pregnancy
    return Math.round(10 * weight + 6.25 * 165 - 5 * 30 - 161 + (week > 13 ? 300 : 0));
  };

  const getExercisePlan = () => {
    if (week >= 20 && painLevel > 3) {
      return [
        { name: t("smartPlan.ex1.name"), duration: "5 " + t("common.minutes"), type: "Relief" },
        { name: t("smartPlan.ex2.name"), duration: "10 " + t("common.minutes"), type: "Strength" },
        { name: t("smartPlan.ex3.name"), duration: "5 " + t("common.minutes"), type: "Flexibility" },
      ];
    }
    return [
      { name: t("smartPlan.exGeneral.name"), duration: "20 " + t("common.minutes"), type: "Cardio" },
    ];
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          {t("smartPlan.title")}
        </h1>
        <p className="text-muted-foreground">{t("smartPlan.subtitle")}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>{t("smartPlan.yourData")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <WeekSlider
              week={week}
              onChange={setWeek}
              showCard={false}
              showTrimester
              label={t("smartPlan.currentWeek")}
            />
            <div className="space-y-2">
              <Label>{t("smartPlan.weight")} (kg)</Label>
              <Input 
                type="number" 
                value={weight} 
                onChange={(e) => setWeight(Number(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <Label>{t("smartPlan.backPainLevel")}: {painLevel}/10</Label>
              <Slider 
                value={[painLevel]} 
                onValueChange={(v) => setPainLevel(v[0])} 
                max={10} step={1} 
              />
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="exercises" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="exercises">
                <Activity className="w-4 h-4 mr-2" />
                {t("smartPlan.exercises")}
              </TabsTrigger>
              <TabsTrigger value="meals">
                <Utensils className="w-4 h-4 mr-2" />
                {t("smartPlan.meals")}
              </TabsTrigger>
              <TabsTrigger value="report">
                <FileText className="w-4 h-4 mr-2" />
                {t("smartPlan.report")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="exercises">
              <Card>
                <CardHeader>
                  <CardTitle>{t("smartPlan.dailyRoutine")}</CardTitle>
                  <CardDescription>
                    {t("smartPlan.exerciseDesc", { week })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getExercisePlan().map((ex, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {i + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold">{ex.name}</h4>
                            <span className="text-xs text-muted-foreground px-2 py-1 bg-background rounded-full border">
                              {ex.type}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono font-medium">{ex.duration}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="meals">
              <Card>
                <CardHeader>
                  <CardTitle>{t("smartPlan.nutritionPlan")}</CardTitle>
                  <CardDescription>
                    {t("smartPlan.caloriesTarget")}: ~{getCalories()} kcal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2 text-primary">{t("smartPlan.breakfast")}</h3>
                    <p className="text-sm text-muted-foreground">{t("smartPlan.breakfastDesc")}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2 text-primary">{t("smartPlan.lunch")}</h3>
                    <p className="text-sm text-muted-foreground">{t("smartPlan.lunchDesc")}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2 text-primary">{t("smartPlan.dinner")}</h3>
                    <p className="text-sm text-muted-foreground">{t("smartPlan.dinnerDesc")}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="report">
              <Card>
                <CardHeader>
                  <CardTitle>{t("smartPlan.weeklyReport")}</CardTitle>
                  <CardDescription>{t("smartPlan.reportDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-6 border-2 border-dashed rounded-lg bg-muted/50 text-center space-y-4" id="printable-area">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{t("smartPlan.readyToPrint")}</h3>
                      <p className="text-sm text-muted-foreground">{t("smartPlan.printNote")}</p>
                    </div>
                    <Button onClick={handlePrint} className="w-full sm:w-auto">
                      <Printer className="mr-2 h-4 w-4" />
                      {t("smartPlan.printBtn")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hidden Print Section */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-primary">{t("app.name")}</h1>
            <h2 className="text-xl">{t("smartPlan.weeklyReport")} - {t("common.week")} {week}</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold mb-2">{t("smartPlan.vitals")}</h3>
              <ul className="space-y-2 border-l-2 pl-4">
                <li>{t("smartPlan.weight")}: {weight} kg</li>
                <li>{t("smartPlan.pain")}: {painLevel}/10</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">{t("smartPlan.summary")}</h3>
              <p>{t("smartPlan.summaryText")}</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">{t("smartPlan.doctorNotes")}</h3>
            <div className="h-40 border rounded-lg p-4 bg-gray-50"></div>
          </div>
          
          <div className="text-center text-sm text-gray-400 mt-12">
            Generated by PregnancyTools App
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartPregnancyPlan;
