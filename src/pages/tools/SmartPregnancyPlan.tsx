import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Utensils, FileText, Brain, Loader2,
  RefreshCw, Baby, Heart, Scale, Flame,
  Ruler, Droplets, Moon, Smile, ChevronDown, ChevronUp,
  Stethoscope, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { WeekSlider } from "@/components/WeekSlider";
import { ToolFrame } from "@/components/ToolFrame";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useResetOnLanguageChange } from "@/hooks/useResetOnLanguageChange";
import { motion } from "framer-motion";
import { PrintableReport } from "@/components/PrintableReport";

const STORAGE_KEY = 'smart-plan-health-data';

interface HealthData {
  week: number;
  weight: number;
  height: number;
  age: number;
  painLevel: number;
  bloodType: string;
  bloodPressureSys: number;
  bloodPressureDia: number;
  sleepHours: number;
  activityLevel: string;
  mood: string;
  conditions: string[];
}

const DEFAULT_HEALTH: HealthData = {
  week: 24, weight: 65, height: 165, age: 28,
  painLevel: 3, bloodType: '', bloodPressureSys: 120, bloodPressureDia: 80,
  sleepHours: 7, activityLevel: 'moderate', mood: 'good', conditions: [],
};

const SmartPregnancyPlan = () => {
  const { t, i18n } = useTranslation();
  const [health, setHealth] = useState<HealthData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_HEALTH, ...JSON.parse(saved) } : DEFAULT_HEALTH;
    } catch { return DEFAULT_HEALTH; }
  });
  const [showMore, setShowMore] = useState(false);
  const [activeTab, setActiveTab] = useState("aiplan");
  const [aiResponse, setAiResponse] = useState('');
  const [reportContent, setReportContent] = useState('');
  const { streamChat, isLoading, error } = usePregnancyAI();
  const reportRef = useRef<HTMLDivElement>(null);

  // Save health data on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(health));
  }, [health]);

  useResetOnLanguageChange(() => {
    setAiResponse('');
    setReportContent('');
  });

  const lang = i18n.language?.split('-')[0] || 'en';
  const isRTL = lang === 'ar';

  const update = (field: keyof HealthData, value: any) => {
    setHealth(prev => ({ ...prev, [field]: value }));
  };

  const getBMI = () => {
    const heightM = health.height / 100;
    return (health.weight / (heightM * heightM)).toFixed(1);
  };

  const getCalories = () => {
    const base = 1800;
    const weekBonus = health.week > 13 ? (health.week > 28 ? 450 : 340) : 0;
    const activityBonus = health.activityLevel === 'active' ? 200 : health.activityLevel === 'moderate' ? 100 : 0;
    return base + weekBonus + activityBonus;
  };

  const trimester = health.week <= 13
    ? { num: 1, label: t("smartPlan.trimester1", "First Trimester"), color: 'bg-emerald-500' }
    : health.week <= 27
    ? { num: 2, label: t("smartPlan.trimester2", "Second Trimester"), color: 'bg-blue-500' }
    : { num: 3, label: t("smartPlan.trimester3", "Third Trimester"), color: 'bg-purple-500' };

  const progress = Math.min(100, Math.round((health.week / 40) * 100));
  const daysRemaining = Math.max(0, (40 - health.week) * 7);

  const generateAIPlan = async () => {
    setAiResponse('');
    setActiveTab('aiplan');

    const conditionsText = health.conditions.length > 0 ? health.conditions.join(', ') : 'none';
    const prompts: Record<string, string> = {
      en: `I'm in week ${health.week} of pregnancy. My weight is ${health.weight}kg, height ${health.height}cm, age ${health.age}, pain level ${health.painLevel}/10, blood pressure ${health.bloodPressureSys}/${health.bloodPressureDia}, sleep ${health.sleepHours}hrs, mood: ${health.mood}, activity: ${health.activityLevel}, conditions: ${conditionsText}. Give me a personalized weekly pregnancy plan covering exercises, nutrition tips, and wellness recommendations. Be specific and practical.`,
      ar: `أنا في الأسبوع ${health.week} من الحمل. وزني ${health.weight} كجم، طولي ${health.height} سم، عمري ${health.age}، مستوى الألم ${health.painLevel}/10، ضغط الدم ${health.bloodPressureSys}/${health.bloodPressureDia}، النوم ${health.sleepHours} ساعات، المزاج: ${health.mood}، النشاط: ${health.activityLevel}، الحالات الصحية: ${conditionsText}. أعطني خطة حمل أسبوعية مخصصة تشمل تمارين ونصائح تغذية وتوصيات صحية. كوني محددة وعملية.`,
      de: `Ich bin in der ${health.week}. Schwangerschaftswoche. Gewicht ${health.weight}kg, Größe ${health.height}cm, Alter ${health.age}, Schmerzniveau ${health.painLevel}/10, Blutdruck ${health.bloodPressureSys}/${health.bloodPressureDia}, Schlaf ${health.sleepHours}h, Stimmung: ${health.mood}, Aktivität: ${health.activityLevel}, Vorerkrankungen: ${conditionsText}. Erstelle einen personalisierten Schwangerschaftsplan.`,
      fr: `Je suis à la semaine ${health.week} de grossesse. Poids ${health.weight}kg, taille ${health.height}cm, âge ${health.age}, douleur ${health.painLevel}/10, tension ${health.bloodPressureSys}/${health.bloodPressureDia}, sommeil ${health.sleepHours}h, humeur: ${health.mood}, activité: ${health.activityLevel}, conditions: ${conditionsText}. Créez un plan de grossesse personnalisé.`,
      es: `Estoy en la semana ${health.week} de embarazo. Peso ${health.weight}kg, altura ${health.height}cm, edad ${health.age}, dolor ${health.painLevel}/10, presión ${health.bloodPressureSys}/${health.bloodPressureDia}, sueño ${health.sleepHours}h, ánimo: ${health.mood}, actividad: ${health.activityLevel}, condiciones: ${conditionsText}. Crea un plan de embarazo personalizado.`,
      pt: `Estou na semana ${health.week} de gravidez. Peso ${health.weight}kg, altura ${health.height}cm, idade ${health.age}, dor ${health.painLevel}/10, pressão ${health.bloodPressureSys}/${health.bloodPressureDia}, sono ${health.sleepHours}h, humor: ${health.mood}, atividade: ${health.activityLevel}, condições: ${conditionsText}. Crie um plano de gravidez personalizado.`,
      tr: `Hamileliğimin ${health.week}. haftasındayım. Kilo ${health.weight}kg, boy ${health.height}cm, yaş ${health.age}, ağrı ${health.painLevel}/10, tansiyon ${health.bloodPressureSys}/${health.bloodPressureDia}, uyku ${health.sleepHours}sa, ruh hali: ${health.mood}, aktivite: ${health.activityLevel}, durumlar: ${conditionsText}. Kişiselleştirilmiş bir gebelik planı oluşturun.`,
    };

    await streamChat({
      type: 'pregnancy-assistant',
      messages: [{ role: 'user', content: prompts[lang] || prompts.en }],
      context: { week: health.week, weight: health.weight, language: lang },
      onDelta: (text) => setAiResponse(prev => prev + text),
      onDone: () => { },
    });
  };

  const generateReport = async () => {
    setReportContent('');
    setActiveTab('report');

    const conditionsText = health.conditions.length > 0 ? health.conditions.join(', ') : 'none';
    const prompts: Record<string, string> = {
      en: `Generate a comprehensive weekly pregnancy health report for Week ${health.week}. Patient data: Weight ${health.weight}kg, Height ${health.height}cm, BMI ${getBMI()}, Age ${health.age}, BP ${health.bloodPressureSys}/${health.bloodPressureDia}, Pain ${health.painLevel}/10, Sleep ${health.sleepHours}hrs, Mood ${health.mood}, Activity ${health.activityLevel}, Conditions: ${conditionsText}. Include: 1) Health assessment 2) Risk factors 3) Recommended tests 4) Nutrition guidance 5) Exercise recommendations 6) Warning signs to watch. Be thorough and medical.`,
      ar: `أنشئ تقريرًا صحيًا أسبوعيًا شاملاً للحمل للأسبوع ${health.week}. بيانات المريضة: الوزن ${health.weight} كجم، الطول ${health.height} سم، مؤشر كتلة الجسم ${getBMI()}، العمر ${health.age}، ضغط الدم ${health.bloodPressureSys}/${health.bloodPressureDia}، الألم ${health.painLevel}/10، النوم ${health.sleepHours} ساعات، المزاج ${health.mood}، النشاط ${health.activityLevel}، الحالات الصحية: ${conditionsText}. يشمل: 1) تقييم صحي 2) عوامل الخطر 3) الفحوصات الموصى بها 4) إرشادات التغذية 5) توصيات التمارين 6) علامات التحذير. كن شاملاً وطبيًا.`,
      de: `Erstelle einen umfassenden wöchentlichen Schwangerschaftsgesundheitsbericht für Woche ${health.week}. Patientendaten: Gewicht ${health.weight}kg, Größe ${health.height}cm, BMI ${getBMI()}, Alter ${health.age}, Blutdruck ${health.bloodPressureSys}/${health.bloodPressureDia}, Schmerz ${health.painLevel}/10, Schlaf ${health.sleepHours}h, Stimmung ${health.mood}, Aktivität ${health.activityLevel}, Vorerkrankungen: ${conditionsText}.`,
      fr: `Générez un rapport de santé hebdomadaire complet pour la semaine ${health.week} de grossesse. Données: Poids ${health.weight}kg, Taille ${health.height}cm, IMC ${getBMI()}, Âge ${health.age}, TA ${health.bloodPressureSys}/${health.bloodPressureDia}, Douleur ${health.painLevel}/10, Sommeil ${health.sleepHours}h, Humeur ${health.mood}, Activité ${health.activityLevel}, Conditions: ${conditionsText}.`,
      es: `Genera un informe de salud semanal completo para la semana ${health.week} de embarazo. Datos: Peso ${health.weight}kg, Altura ${health.height}cm, IMC ${getBMI()}, Edad ${health.age}, PA ${health.bloodPressureSys}/${health.bloodPressureDia}, Dolor ${health.painLevel}/10, Sueño ${health.sleepHours}h, Ánimo ${health.mood}, Actividad ${health.activityLevel}, Condiciones: ${conditionsText}.`,
      pt: `Gere um relatório semanal de saúde para a semana ${health.week} de gravidez. Dados: Peso ${health.weight}kg, Altura ${health.height}cm, IMC ${getBMI()}, Idade ${health.age}, PA ${health.bloodPressureSys}/${health.bloodPressureDia}, Dor ${health.painLevel}/10, Sono ${health.sleepHours}h, Humor ${health.mood}, Atividade ${health.activityLevel}, Condições: ${conditionsText}.`,
      tr: `${health.week}. hafta için kapsamlı bir gebelik sağlık raporu oluşturun. Veriler: Kilo ${health.weight}kg, Boy ${health.height}cm, VKİ ${getBMI()}, Yaş ${health.age}, Tansiyon ${health.bloodPressureSys}/${health.bloodPressureDia}, Ağrı ${health.painLevel}/10, Uyku ${health.sleepHours}sa, Ruh hali ${health.mood}, Aktivite ${health.activityLevel}, Durumlar: ${conditionsText}.`,
    };

    await streamChat({
      type: 'pregnancy-assistant',
      messages: [{ role: 'user', content: prompts[lang] || prompts.en }],
      context: { week: health.week, weight: health.weight, language: lang },
      onDelta: (text) => setReportContent(prev => prev + text),
      onDone: () => { },
    });
  };

  // Conditions list
  const conditionOptions = [
    { key: 'gestational_diabetes', ar: 'سكري الحمل', en: 'Gestational Diabetes', de: 'Schwangerschaftsdiabetes', fr: 'Diabète gestationnel', es: 'Diabetes gestacional', pt: 'Diabetes gestacional', tr: 'Gebelik Diyabeti' },
    { key: 'hypertension', ar: 'ارتفاع ضغط الدم', en: 'Hypertension', de: 'Bluthochdruck', fr: 'Hypertension', es: 'Hipertensión', pt: 'Hipertensão', tr: 'Hipertansiyon' },
    { key: 'anemia', ar: 'فقر الدم', en: 'Anemia', de: 'Anämie', fr: 'Anémie', es: 'Anemia', pt: 'Anemia', tr: 'Anemi' },
    { key: 'thyroid', ar: 'مشاكل الغدة الدرقية', en: 'Thyroid Issues', de: 'Schilddrüsenprobleme', fr: 'Problèmes thyroïdiens', es: 'Problemas de tiroides', pt: 'Problemas de tireoide', tr: 'Tiroid Sorunları' },
    { key: 'preeclampsia_risk', ar: 'خطر تسمم الحمل', en: 'Preeclampsia Risk', de: 'Präeklampsie-Risiko', fr: 'Risque de prééclampsie', es: 'Riesgo de preeclampsia', pt: 'Risco de pré-eclâmpsia', tr: 'Preeklampsi Riski' },
  ];

  const moodOptions = [
    { value: 'great', ar: 'ممتازة', en: 'Great', de: 'Ausgezeichnet', fr: 'Excellent', es: 'Excelente', pt: 'Excelente', tr: 'Harika' },
    { value: 'good', ar: 'جيدة', en: 'Good', de: 'Gut', fr: 'Bien', es: 'Bien', pt: 'Bom', tr: 'İyi' },
    { value: 'okay', ar: 'مقبولة', en: 'Okay', de: 'Okay', fr: 'Correct', es: 'Regular', pt: 'Razoável', tr: 'İdare eder' },
    { value: 'stressed', ar: 'متوترة', en: 'Stressed', de: 'Gestresst', fr: 'Stressée', es: 'Estresada', pt: 'Estressada', tr: 'Stresli' },
    { value: 'low', ar: 'منخفضة', en: 'Low', de: 'Niedrig', fr: 'Basse', es: 'Baja', pt: 'Baixo', tr: 'Düşük' },
  ];

  const activityOptions = [
    { value: 'sedentary', ar: 'قليل الحركة', en: 'Sedentary', de: 'Sitzend', fr: 'Sédentaire', es: 'Sedentario', pt: 'Sedentário', tr: 'Hareketsiz' },
    { value: 'moderate', ar: 'متوسط', en: 'Moderate', de: 'Mäßig', fr: 'Modéré', es: 'Moderado', pt: 'Moderado', tr: 'Orta' },
    { value: 'active', ar: 'نشيط', en: 'Active', de: 'Aktiv', fr: 'Actif', es: 'Activo', pt: 'Ativo', tr: 'Aktif' },
  ];

  const getLocalizedLabel = (option: Record<string, string>) => option[lang] || option.en;

  const statsCards = [
    { icon: Baby, label: t("smartPlan.currentWeek", "Week"), value: `${health.week}/40`, color: "text-primary" },
    { icon: Scale, label: t("smartPlan.bmi", "BMI"), value: getBMI(), color: "text-blue-500" },
    { icon: Flame, label: t("smartPlan.calories", "Calories"), value: `${getCalories()}`, color: "text-orange-500" },
    { icon: Droplets, label: t("smartPlan.bp", "BP"), value: `${health.bloodPressureSys}/${health.bloodPressureDia}`, color: "text-rose-500" },
  ];

  return (
    <ToolFrame
      title={t("smartPlan.title")}
      subtitle={t("smartPlan.subtitle")}
      icon={Brain}
      mood="nurturing"
      toolId="smart-pregnancy-plan"
    >
      <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-2">
          {statsCards.map((stat, i) => (
            <Card key={i} className="text-center p-2">
              <stat.icon className={`w-4 h-4 mx-auto mb-0.5 ${stat.color}`} />
              <p className="text-sm font-bold">{stat.value}</p>
              <p className="text-[9px] text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Trimester & Progress */}
        <Card>
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Badge className={`${trimester.color} text-white text-xs`}>{trimester.label}</Badge>
              <span className="text-xs text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-[10px] text-center text-muted-foreground">
              {t("smartPlan.daysRemaining", "{{days}} days remaining", { days: daysRemaining })}
            </p>
          </CardContent>
        </Card>

        {/* Health Inputs */}
        <Card>
          <CardContent className="p-3 space-y-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">{t("smartPlan.pregnancyWeek", "Pregnancy Week")}</Label>
              <WeekSlider week={health.week} onChange={(v) => update('week', v)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t("smartPlan.weight", "Weight (kg)")}</Label>
                <Input type="number" value={health.weight} onChange={e => update('weight', +e.target.value)} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">{t("smartPlan.height", "Height (cm)")}</Label>
                <Input type="number" value={health.height} onChange={e => update('height', +e.target.value)} className="h-8 text-xs" />
              </div>
            </div>

            <div>
              <Label className="text-xs">{t("smartPlan.painLevel", "Pain Level")}: {health.painLevel}/10</Label>
              <Slider value={[health.painLevel]} max={10} step={1} onValueChange={([v]) => update('painLevel', v)} />
            </div>

            <button onClick={() => setShowMore(!showMore)} className="text-xs text-primary flex items-center gap-1">
              {showMore ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {t("smartPlan.moreOptions", "More details")}
            </button>

            {showMore && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">{t("smartPlan.age", "Age")}</Label>
                    <Input type="number" value={health.age} onChange={e => update('age', +e.target.value)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">{t("smartPlan.sleepHours", "Sleep (hrs)")}</Label>
                    <Input type="number" value={health.sleepHours} onChange={e => update('sleepHours', +e.target.value)} className="h-8 text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">{t("smartPlan.systolic", "Systolic")}</Label>
                    <Input type="number" value={health.bloodPressureSys} onChange={e => update('bloodPressureSys', +e.target.value)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">{t("smartPlan.diastolic", "Diastolic")}</Label>
                    <Input type="number" value={health.bloodPressureDia} onChange={e => update('bloodPressureDia', +e.target.value)} className="h-8 text-xs" />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">{t("smartPlan.mood", "Mood")}</Label>
                  <Select value={health.mood} onValueChange={v => update('mood', v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {moodOptions.map(o => <SelectItem key={o.value} value={o.value}>{getLocalizedLabel(o)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">{t("smartPlan.activityLevel", "Activity Level")}</Label>
                  <Select value={health.activityLevel} onValueChange={v => update('activityLevel', v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {activityOptions.map(o => <SelectItem key={o.value} value={o.value}>{getLocalizedLabel(o)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs mb-1 block">{t("smartPlan.conditions", "Health Conditions")}</Label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {conditionOptions.map(c => (
                      <label key={c.key} className="flex items-center gap-2 text-xs">
                        <Checkbox
                          checked={health.conditions.includes(c.key)}
                          onCheckedChange={checked => {
                            update('conditions', checked
                              ? [...health.conditions, c.key]
                              : health.conditions.filter(k => k !== c.key)
                            );
                          }}
                        />
                        {getLocalizedLabel(c)}
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 h-auto">
            <TabsTrigger value="aiplan" className="text-xs py-2 gap-1.5">
              <Brain className="w-3.5 h-3.5" /> {t("smartPlan.aiPlan", "AI Plan")}
            </TabsTrigger>
            <TabsTrigger value="report" className="text-xs py-2 gap-1.5">
              <FileText className="w-3.5 h-3.5" /> {t("smartPlan.report", "Report")}
            </TabsTrigger>
          </TabsList>

          {/* AI Plan Tab */}
          <TabsContent value="aiplan" className="space-y-3">
            {aiResponse ? (
              <PrintableReport title={t("smartPlan.aiPlan", "AI Plan")}>
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <MarkdownRenderer content={aiResponse} isLoading={isLoading} />
                  </CardContent>
                </Card>
              </PrintableReport>
            ) : (
              <Card>
                <CardContent className="p-5 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("smartPlan.aiPlanHint", "Get a personalized AI-powered pregnancy plan based on your profile")}
                  </p>
                  <Button onClick={generateAIPlan} disabled={isLoading} className="gap-2">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                    {t("smartPlan.getAIPlan", "Get Smart Plan")}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Report Tab */}
          <TabsContent value="report" className="space-y-3">
            {reportContent ? (
              <div className="space-y-3">
                <PrintableReport title={`${t("smartPlan.weeklyReport")} — ${t("common.week", "Week")} ${health.week}`}>
                  <div id="smart-plan-report" ref={reportRef} className="bg-background rounded-xl" dir={isRTL ? 'rtl' : 'ltr'} lang={lang}>
                    <Card className="border-primary/20">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <Baby className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold">{t("smartPlan.weeklyReport")} — {t("common.week", "Week")} {health.week}</h3>
                              <p className="text-[10px] text-muted-foreground">{new Date().toLocaleDateString(isRTL ? 'ar-SA' : undefined)}</p>
                            </div>
                          </div>
                          <Badge className={`${trimester.color} text-white text-[10px]`}>{trimester.label}</Badge>
                        </div>

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

                    <Card className="border-primary/20 bg-primary/5 mt-3">
                      <CardContent className="p-4">
                        <MarkdownRenderer content={reportContent} isLoading={isLoading} />
                      </CardContent>
                    </Card>
                  </div>
                </PrintableReport>

                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={generateReport}
                  disabled={isLoading}
                  className="relative w-full overflow-hidden rounded-md h-9 flex items-center justify-center gap-1.5 text-white text-xs font-semibold disabled:opacity-60 disabled:pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))' }}
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  {t("smartPlan.regenerate", "Regenerate")}
                </motion.button>
              </div>
            ) : (
              <Card>
                <CardContent className="p-5 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("smartPlan.reportHint", "Get a detailed AI-powered health report personalized for your week, weight, and condition")}
                  </p>
                  <Button onClick={generateReport} disabled={isLoading} className="gap-2">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
                    {t("smartPlan.generateReport", "Generate Health Report")}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

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
