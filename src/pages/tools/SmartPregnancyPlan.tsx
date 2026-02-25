import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, Utensils, FileText, Brain, Loader2, 
  Download, RefreshCw, Baby, Heart, Scale, Flame,
  Clock, CheckCircle2, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { WeekSlider } from "@/components/WeekSlider";
import { ToolFrame } from "@/components/ToolFrame";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useResetOnLanguageChange } from "@/hooks/useResetOnLanguageChange";
import { motion } from "framer-motion";
import { exportElementToPDF } from "@/lib/pdfExport";

const SmartPregnancyPlan = () => {
  const { t, i18n } = useTranslation();
  const [week, setWeek] = useState<number>(24);
  const [weight, setWeight] = useState<number>(65);
  const [painLevel, setPainLevel] = useState<number>(5);
  const [activeTab, setActiveTab] = useState("exercises");
  const [aiResponse, setAiResponse] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const { streamChat, isLoading, error } = usePregnancyAI();
  const reportRef = useRef<HTMLDivElement>(null);

  useResetOnLanguageChange(() => {
    setAiResponse('');
    setReportContent('');
  });

  const lang = i18n.language?.split('-')[0] || 'en';
  const isRTL = lang === 'ar';

  const getTrimester = (w: number) => {
    if (w <= 12) return { num: 1, label: t("smartPlan.trimester1", "First Trimester"), color: "bg-emerald-500" };
    if (w <= 27) return { num: 2, label: t("smartPlan.trimester2", "Second Trimester"), color: "bg-primary" };
    return { num: 3, label: t("smartPlan.trimester3", "Third Trimester"), color: "bg-amber-500" };
  };

  const trimester = getTrimester(week);
  const progress = Math.round((week / 40) * 100);
  const daysRemaining = (40 - week) * 7;

  const getCalories = () => {
    return Math.round(10 * weight + 6.25 * 165 - 5 * 30 - 161 + (week > 13 ? 300 : 0));
  };

  const getBMI = () => (weight / (1.65 * 1.65)).toFixed(1);

  const getExercisePlan = () => {
    if (week >= 20 && painLevel > 3) {
      return [
        { name: t("smartPlan.ex1"), duration: `5 ${t("common.minutes")}`, type: t("smartPlan.typeRelief"), icon: "🧘" },
        { name: t("smartPlan.ex2"), duration: `10 ${t("common.minutes")}`, type: t("smartPlan.typeStrength"), icon: "💪" },
        { name: t("smartPlan.ex3"), duration: `5 ${t("common.minutes")}`, type: t("smartPlan.typeFlexibility"), icon: "🤸" },
      ];
    }
    return [
      { name: t("smartPlan.exGeneral"), duration: `20 ${t("common.minutes")}`, type: t("smartPlan.typeCardio"), icon: "🚶" },
    ];
  };

  // Generate comprehensive AI report
  const generateReport = async () => {
    setReportContent('');
    setActiveTab('report');

    const reportPrompts: Record<string, string> = {
      ar: `أنتِ طبيبة نساء وولادة متخصصة. أعدّي تقريراً صحياً شاملاً ومفصلاً للأسبوع ${week} من الحمل بناءً على هذه البيانات:
- الوزن: ${weight} كجم
- مؤشر كتلة الجسم: ${getBMI()}
- مستوى ألم الظهر: ${painLevel}/10
- الثلث: ${trimester.num}
- السعرات الحرارية المطلوبة: ${getCalories()} سعرة

يجب أن يتضمن التقرير الأقسام التالية بتفصيل:
## 📊 ملخص الحالة الصحية
- تحليل شامل للمؤشرات الحيوية وتقييم الوزن

## 🏥 تطور الجنين هذا الأسبوع
- حجم الجنين ووزنه التقريبي والتطورات الجسدية

## 🍽️ خطة التغذية المخصصة
- وجبات مفصلة (فطور، غداء، عشاء، وجبات خفيفة) مع الفيتامينات المطلوبة

## 🏃‍♀️ برنامج التمارين الآمنة
- تمارين مخصصة حسب مستوى الألم والأسبوع

## ⚠️ أعراض يجب مراقبتها
- أعراض طبيعية وأعراض تستدعي مراجعة الطبيب

## 💡 نصائح مخصصة للأسبوع ${week}
- نصائح عملية للراحة والنوم والعناية الشخصية

## 📋 قائمة الفحوصات المطلوبة
- الفحوصات والتحاليل المناسبة لهذا الأسبوع

اجعلي التقرير مفصلاً ومهنياً وشاملاً.`,

      en: `You are a specialized OB-GYN doctor. Create a comprehensive, detailed health report for pregnancy week ${week} based on this data:
- Weight: ${weight} kg
- BMI: ${getBMI()}
- Back pain level: ${painLevel}/10
- Trimester: ${trimester.num}
- Required calories: ${getCalories()} kcal

Include these sections in detail:
## 📊 Health Status Summary
- Comprehensive vital signs analysis and weight assessment

## 🏥 Fetal Development This Week
- Baby's approximate size, weight, and physical developments

## 🍽️ Personalized Nutrition Plan
- Detailed meals (breakfast, lunch, dinner, snacks) with required vitamins

## 🏃‍♀️ Safe Exercise Program
- Customized exercises based on pain level and week

## ⚠️ Symptoms to Watch
- Normal symptoms and warning signs requiring medical attention

## 💡 Tips for Week ${week}
- Practical tips for rest, sleep, and self-care

## 📋 Required Checkups
- Appropriate tests and screenings for this week

Make the report detailed, professional, and comprehensive.`,

      de: `Sie sind eine spezialisierte Gynäkologin. Erstellen Sie einen umfassenden Gesundheitsbericht für Schwangerschaftswoche ${week}:
- Gewicht: ${weight} kg, BMI: ${getBMI()}, Rückenschmerzen: ${painLevel}/10, Trimester: ${trimester.num}, Kalorien: ${getCalories()} kcal

Bitte folgende Abschnitte detailliert:
## 📊 Gesundheitsstatus
## 🏥 Fetale Entwicklung
## 🍽️ Ernährungsplan
## 🏃‍♀️ Übungsprogramm
## ⚠️ Zu beachtende Symptome
## 💡 Tipps für Woche ${week}
## 📋 Erforderliche Untersuchungen`,

      fr: `Vous êtes une gynécologue-obstétricienne. Créez un rapport de santé complet pour la semaine ${week} de grossesse:
- Poids: ${weight} kg, IMC: ${getBMI()}, Douleur dorsale: ${painLevel}/10, Trimestre: ${trimester.num}, Calories: ${getCalories()} kcal

Sections détaillées:
## 📊 Bilan de santé
## 🏥 Développement fœtal
## 🍽️ Plan nutritionnel
## 🏃‍♀️ Programme d'exercices
## ⚠️ Symptômes à surveiller
## 💡 Conseils semaine ${week}
## 📋 Examens requis`,

      es: `Eres una ginecóloga-obstetra especializada. Crea un informe de salud completo para la semana ${week} de embarazo:
- Peso: ${weight} kg, IMC: ${getBMI()}, Dolor de espalda: ${painLevel}/10, Trimestre: ${trimester.num}, Calorías: ${getCalories()} kcal

Secciones detalladas:
## 📊 Resumen de salud
## 🏥 Desarrollo fetal
## 🍽️ Plan nutricional
## 🏃‍♀️ Programa de ejercicios
## ⚠️ Síntomas a vigilar
## 💡 Consejos semana ${week}
## 📋 Chequeos requeridos`,

      pt: `Você é uma ginecologista-obstetra especializada. Crie um relatório de saúde completo para a semana ${week} de gravidez:
- Peso: ${weight} kg, IMC: ${getBMI()}, Dor nas costas: ${painLevel}/10, Trimestre: ${trimester.num}, Calorias: ${getCalories()} kcal

Seções detalhadas:
## 📊 Resumo de saúde
## 🏥 Desenvolvimento fetal
## 🍽️ Plano nutricional
## 🏃‍♀️ Programa de exercícios
## ⚠️ Sintomas a observar
## 💡 Dicas semana ${week}
## 📋 Exames necessários`,

      tr: `Uzman bir kadın doğum uzmanısınız. Hamileliğin ${week}. haftası için kapsamlı bir sağlık raporu oluşturun:
- Kilo: ${weight} kg, VKİ: ${getBMI()}, Bel ağrısı: ${painLevel}/10, Trimester: ${trimester.num}, Kalori: ${getCalories()} kcal

Ayrıntılı bölümler:
## 📊 Sağlık Durumu
## 🏥 Fetal Gelişim
## 🍽️ Beslenme Planı
## 🏃‍♀️ Egzersiz Programı
## ⚠️ İzlenmesi Gereken Belirtiler
## 💡 ${week}. Hafta İpuçları
## 📋 Gerekli Kontroller`,
    };

    await streamChat({
      type: 'pregnancy-assistant',
      messages: [{ role: 'user', content: reportPrompts[lang] || reportPrompts.en }],
      context: { week, weight, language: lang },
      onDelta: (text) => setReportContent(prev => prev + text),
      onDone: () => {},
    });
  };

  // Generate quick AI plan
  const getAIPlan = async () => {
    setAiResponse('');

    const prompts: Record<string, string> = {
      ar: `أنا في الأسبوع ${week} من الحمل، وزني ${weight} كجم، ومستوى ألم الظهر ${painLevel}/10. أنشئي خطة يومية مخصصة تشمل تمارين آمنة، واقتراحات وجبات، ونصائح صحية مناسبة لحالتي الحالية. رتبي الخطة بعناوين واضحة وفقرات منظمة.`,
      de: `Ich bin in Woche ${week} der Schwangerschaft, wiege ${weight}kg, Rückenschmerzen Stufe ${painLevel}/10. Erstelle einen personalisierten Tagesplan mit sicheren Übungen, Mahlzeitenvorschlägen und Wellness-Tipps.`,
      fr: `Je suis à la semaine ${week} de grossesse, je pèse ${weight}kg, niveau de douleur dorsale ${painLevel}/10. Créez un plan quotidien personnalisé avec des exercices sûrs, des suggestions de repas et des conseils bien-être.`,
      es: `Estoy en la semana ${week} de embarazo, peso ${weight}kg, nivel de dolor de espalda ${painLevel}/10. Crea un plan diario personalizado con ejercicios seguros, sugerencias de comidas y consejos de bienestar.`,
      pt: `Estou na semana ${week} da gravidez, peso ${weight}kg, nível de dor nas costas ${painLevel}/10. Crie um plano diário personalizado com exercícios seguros, sugestões de refeições e dicas de bem-estar.`,
      tr: `Hamileliğimin ${week}. haftasındayım, ${weight}kg ağırlığındayım, bel ağrısı seviyem ${painLevel}/10. Güvenli egzersizler, yemek önerileri ve sağlık ipuçları içeren kişiselleştirilmiş bir günlük plan oluşturun.`,
      en: `I'm at week ${week} of pregnancy, weighing ${weight}kg, with back pain level ${painLevel}/10. Create a personalized daily plan including safe exercises, meal suggestions, and wellness tips tailored to my current state. Use clear headings and organized paragraphs.`,
    };

    await streamChat({
      type: 'pregnancy-assistant',
      messages: [{ role: 'user', content: prompts[lang] || prompts.en }],
      context: { week, weight, language: lang },
      onDelta: (text) => setAiResponse(prev => prev + text),
      onDone: () => {},
    });
  };

  const handleExportPDF = async () => {
    if (isExportingPDF) return;
    setIsExportingPDF(true);
    try {
      await exportElementToPDF({
        elementId: 'smart-plan-report',
        filename: `pregnancy-report-week-${week}`,
        onProgress: () => {},
        onError: (err) => {
          toast.error(err.message);
        },
      });
      toast.success(t("smartPlan.pdfExported", "Report exported successfully"));
    } catch {
      toast.error(t("smartPlan.pdfError", "Failed to export PDF"));
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Stats cards data
  const statsCards = [
    { icon: Baby, label: t("smartPlan.currentWeek", "Week"), value: `${week}/40`, color: "text-primary" },
    { icon: Scale, label: t("smartPlan.bmi", "BMI"), value: getBMI(), color: "text-blue-500" },
    { icon: Flame, label: t("smartPlan.calories", "Calories"), value: `${getCalories()}`, color: "text-orange-500" },
    { icon: Heart, label: t("smartPlan.pain", "Pain"), value: `${painLevel}/10`, color: "text-rose-500" },
  ];

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
            <WeekSlider week={week} onChange={setWeek} showCard={false} showTrimester label={t("smartPlan.currentWeek")} />
            <div className="space-y-2">
              <Label className="text-xs">{t("smartPlan.weight")} (kg)</Label>
              <Input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t("smartPlan.backPainLevel")}: {painLevel}/10</Label>
              <Slider value={[painLevel]} onValueChange={(v) => setPainLevel(v[0])} max={10} step={1} />
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          {statsCards.map((stat, i) => (
            <Card key={i} className="p-2 text-center">
              <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
              <p className="text-xs font-bold">{stat.value}</p>
              <p className="text-[9px] text-muted-foreground truncate">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                <CardDescription className="text-xs">{t("smartPlan.exerciseDesc", { week })}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getExercisePlan().map((ex, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">
                          {ex.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold">{ex.name}</h4>
                          <span className="text-[10px] text-muted-foreground px-2 py-0.5 bg-background rounded-full border">{ex.type}</span>
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
                <CardDescription className="text-xs">{t("smartPlan.caloriesTarget")}: ~{getCalories()} kcal</CardDescription>
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
            {!reportContent ? (
              <Card>
                <CardContent className="p-5 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <FileText className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{t("smartPlan.generateReport", "Generate Comprehensive Report")}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("smartPlan.reportHint", "Get a detailed AI-powered health report personalized for your week, weight, and condition")}
                    </p>
                  </div>
                  <motion.button
                    onClick={generateReport}
                    disabled={isLoading}
                    whileTap={{ scale: 0.95 }}
                    className="w-full relative overflow-hidden rounded-xl h-11 flex items-center justify-center gap-2 text-white text-sm font-semibold disabled:opacity-60 disabled:pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))' }}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                    {t("smartPlan.createReport", "Create Health Report")}
                  </motion.button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {/* Report Content */}
                <div id="smart-plan-report" ref={reportRef} className="bg-background rounded-xl" dir={isRTL ? 'rtl' : 'ltr'} lang={lang}>
                  {/* Report Header */}
                  <Card className="border-primary/20">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Baby className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold">{t("smartPlan.weeklyReport")} — {t("common.week", "Week")} {week}</h3>
                            <p className="text-[10px] text-muted-foreground">{new Date().toLocaleDateString(isRTL ? 'ar-SA' : undefined)}</p>
                          </div>
                        </div>
                        <Badge className={`${trimester.color} text-white text-[10px]`}>{trimester.label}</Badge>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>{t("smartPlan.pregnancyProgress", "Pregnancy Progress")}</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-[10px] text-center text-muted-foreground">
                          {t("smartPlan.daysRemaining", "{{days}} days remaining", { days: daysRemaining })}
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {statsCards.map((stat, i) => (
                          <div key={i} className="bg-muted/50 rounded-lg p-2 text-center">
                            <stat.icon className={`w-3.5 h-3.5 mx-auto mb-0.5 ${stat.color}`} />
                            <p className="text-xs font-bold">{stat.value}</p>
                            <p className="text-[8px] text-muted-foreground">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Report Content */}
                  <Card className="border-primary/20 bg-primary/5 mt-3">
                    <CardContent className="p-4">
                      <MarkdownRenderer content={reportContent} isLoading={isLoading} />
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleExportPDF}
                    disabled={isExportingPDF || isLoading}
                    variant="outline"
                    className="flex-1 text-xs h-9"
                  >
                    {isExportingPDF ? <Loader2 className="w-3.5 h-3.5 me-1.5 animate-spin" /> : <Download className="w-3.5 h-3.5 me-1.5" />}
                    {t("smartPlan.exportPDF", "Export PDF")}
                  </Button>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={generateReport}
                    disabled={isLoading}
                    className="relative flex-1 overflow-hidden rounded-md h-9 flex items-center justify-center gap-1.5 text-white text-xs font-semibold disabled:opacity-60 disabled:pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))' }}
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    {t("smartPlan.regenerate", "Regenerate")}
                  </motion.button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* AI Quick Plan Button */}
        <motion.button
          onClick={getAIPlan}
          disabled={isLoading}
          whileTap={{ scale: 0.92 }}
          className="w-full relative overflow-hidden rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3 font-semibold text-white text-[13px] rounded-2xl"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))', boxShadow: '0 4px 20px -4px hsl(var(--primary) / 0.5)' }}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <Brain className="h-4 w-4 shrink-0" />}
            <span className="truncate">{t('smartPlan.getAIPlan', 'Get AI-Personalized Plan')}</span>
          </div>
          <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" aria-hidden />
        </motion.button>

        {/* AI Quick Plan Result */}
        {aiResponse && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">{t('smartPlan.aiPlanTitle', 'AI Personalized Plan')}</h3>
                </div>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setAiResponse('')}>✕</Button>
              </div>
              <MarkdownRenderer content={aiResponse} isLoading={isLoading} />
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-destructive text-xs">{error}</CardContent>
          </Card>
        )}
      </div>
    </ToolFrame>
  );
};

export default SmartPregnancyPlan;
