import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Activity, Utensils, FileText, Printer, Brain, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { WeekSlider } from "@/components/WeekSlider";
import { ToolFrame } from "@/components/ToolFrame";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useResetOnLanguageChange } from "@/hooks/useResetOnLanguageChange";
import { motion } from "framer-motion";

const SmartPregnancyPlan = () => {
  const { t } = useTranslation();
  const [week, setWeek] = useState<number>(24);
  const [weight, setWeight] = useState<number>(65);
  const [painLevel, setPainLevel] = useState<number>(5);
  const [showAIPlan, setShowAIPlan] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const { streamChat, isLoading, error } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setAiResponse('');
    setShowAIPlan(false);
  });

  const getAIPlan = async () => {
    setShowAIPlan(true);
    setAiResponse('');
    await streamChat({
      type: 'pregnancy-assistant',
      messages: [{
        role: 'user',
        content: `I'm at week ${week} of pregnancy, weighing ${weight}kg, with back pain level ${painLevel}/10. Create a personalized daily plan including safe exercises, meal suggestions, and wellness tips tailored to my current state.`
      }],
      context: { week, weight },
      onDelta: (text) => setAiResponse(prev => prev + text),
      onDone: () => {}
    });
  };

  const handlePrint = () => {
    window.print();
    toast.success(t("smartPlan.printSuccess"));
  };

  const getCalories = () => {
    return Math.round(10 * weight + 6.25 * 165 - 5 * 30 - 161 + (week > 13 ? 300 : 0));
  };

  const getExercisePlan = () => {
    if (week >= 20 && painLevel > 3) {
      return [
        { name: t("smartPlan.ex1"), duration: `5 ${t("common.minutes")}`, type: t("smartPlan.typeRelief") },
        { name: t("smartPlan.ex2"), duration: `10 ${t("common.minutes")}`, type: t("smartPlan.typeStrength") },
        { name: t("smartPlan.ex3"), duration: `5 ${t("common.minutes")}`, type: t("smartPlan.typeFlexibility") },
      ];
    }
    return [
      { name: t("smartPlan.exGeneral"), duration: `20 ${t("common.minutes")}`, type: t("smartPlan.typeCardio") },
    ];
  };

  return (
    <ToolFrame
      title={t("smartPlan.title")}
      subtitle={t("smartPlan.subtitle")}
      toolId="smart-plan"
      mood="empowering"
      icon={FileText}
    >
      <div className="space-y-5">
        {/* Input Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{t("smartPlan.yourData")}</CardTitle>
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
              <Label className="text-xs">{t("smartPlan.weight")} (kg)</Label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t("smartPlan.backPainLevel")}: {painLevel}/10</Label>
              <Slider
                value={[painLevel]}
                onValueChange={(v) => setPainLevel(v[0])}
                max={10}
                step={1}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="exercises" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="exercises" className="text-xs gap-1">
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("smartPlan.exercises")}</span>
            </TabsTrigger>
            <TabsTrigger value="meals" className="text-xs gap-1">
              <Utensils className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("smartPlan.meals")}</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="text-xs gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("smartPlan.report")}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exercises">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{t("smartPlan.dailyRoutine")}</CardTitle>
                <CardDescription className="text-xs">
                  {t("smartPlan.exerciseDesc", { week })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getExercisePlan().map((ex, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold">{ex.name}</h4>
                          <span className="text-[10px] text-muted-foreground px-2 py-0.5 bg-background rounded-full border">
                            {ex.type}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-medium">{ex.duration}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meals">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{t("smartPlan.nutritionPlan")}</CardTitle>
                <CardDescription className="text-xs">
                  {t("smartPlan.caloriesTarget")}: ~{getCalories()} kcal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {["breakfast", "lunch", "dinner"].map((meal) => (
                  <div key={meal} className="p-3 border rounded-xl">
                    <h3 className="text-sm font-semibold mb-1 text-primary">{t(`smartPlan.${meal}`)}</h3>
                    <p className="text-xs text-muted-foreground">{t(`smartPlan.${meal}Desc`)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{t("smartPlan.weeklyReport")}</CardTitle>
                <CardDescription className="text-xs">{t("smartPlan.reportDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-5 border-2 border-dashed rounded-xl bg-muted/50 text-center space-y-3">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-semibold">{t("smartPlan.readyToPrint")}</h3>
                    <p className="text-xs text-muted-foreground">{t("smartPlan.printNote")}</p>
                  </div>
                  <Button onClick={handlePrint} size="sm" className="w-full sm:w-auto">
                    <Printer className="me-2 h-3.5 w-3.5" />
                    {t("smartPlan.printBtn")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AI Personalized Plan */}
        <motion.button
          onClick={getAIPlan}
          disabled={isLoading}
          whileTap={{ scale: 0.92 }}
          className="w-full relative overflow-hidden rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="w-full flex items-center justify-center gap-2.5 px-5 py-3 font-semibold text-white text-[13px] rounded-2xl" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))', boxShadow: '0 4px 20px -4px hsl(var(--primary) / 0.5)' }}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <Brain className="h-4 w-4 shrink-0" />}
            <span className="truncate">{t('smartPlan.getAIPlan', 'Get AI-Personalized Plan')}</span>
            
          </div>
          <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" aria-hidden />
        </motion.button>

        {showAIPlan && aiResponse && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">{t('smartPlan.aiPlanTitle', 'AI Personalized Plan')}</h3>
                </div>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowAIPlan(false)}>✕</Button>
              </div>
              <MarkdownRenderer content={aiResponse} />
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-destructive text-xs">{error}</CardContent>
          </Card>
        )}
      </div>

      {/* Hidden Print Section */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center border-b pb-4">
            <h1 className="text-base font-bold text-primary">{t("app.name")}</h1>
            <h2 className="text-sm">{t("smartPlan.weeklyReport")} - {t("common.week")} {week}</h2>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold mb-2">{t("smartPlan.vitals")}</h3>
              <ul className="space-y-2 border-s-2 ps-4">
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
            <div className="h-40 border rounded-lg p-4 bg-muted/30"></div>
          </div>
          <div className="text-center text-sm text-muted-foreground mt-12">
            {t("app.name")}
          </div>
        </div>
      </div>
    </ToolFrame>
  );
};

export default SmartPregnancyPlan;
