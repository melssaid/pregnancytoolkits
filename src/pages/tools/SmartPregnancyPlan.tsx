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
  Activity, Utensils, FileText, Brain, Loader2, 
  Download, RefreshCw, Baby, Heart, Scale, Flame,
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
import { exportSmartPlanPDF } from "@/lib/pdfExport";

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
  const [activeTab, setActiveTab] = useState("exercises");
  const [aiResponse, setAiResponse] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
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

  const toggleCondition = (condition: string) => {
    setHealth(prev => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions, condition],
    }));
  };

  const getTrimester = (w: number) => {
    if (w <= 12) return { num: 1, label: t("smartPlan.trimester1", "First Trimester"), color: "bg-emerald-500" };
    if (w <= 27) return { num: 2, label: t("smartPlan.trimester2", "Second Trimester"), color: "bg-primary" };
    return { num: 3, label: t("smartPlan.trimester3", "Third Trimester"), color: "bg-amber-500" };
  };

  const trimester = getTrimester(health.week);
  const progress = Math.round((health.week / 40) * 100);
  const daysRemaining = (40 - health.week) * 7;

  const getBMI = () => {
    const h = health.height / 100;
    return h > 0 ? (health.weight / (h * h)).toFixed(1) : '0';
  };

  const getCalories = () => {
    return Math.round(10 * health.weight + 6.25 * health.height - 5 * health.age - 161 + (health.week > 13 ? 300 : 0));
  };

  // Build health summary for AI
  const buildHealthSummary = (langKey: string) => {
    const bmi = getBMI();
    const cal = getCalories();
    const bp = `${health.bloodPressureSys}/${health.bloodPressureDia}`;
    const conditionsText = health.conditions.length > 0 ? health.conditions.join(', ') : '';

    const summaries: Record<string, string> = {
      ar: `- الأسبوع: ${health.week}
- العمر: ${health.age} سنة
- الوزن: ${health.weight} كجم
- الطول: ${health.height} سم
- مؤشر كتلة الجسم: ${bmi}
- ضغط الدم: ${bp} mmHg
- فصيلة الدم: ${health.bloodType || 'غير محدد'}
- مستوى ألم الظهر: ${health.painLevel}/10
- ساعات النوم: ${health.sleepHours}
- مستوى النشاط: ${health.activityLevel === 'sedentary' ? 'قليل' : health.activityLevel === 'moderate' ? 'متوسط' : 'نشيط'}
- الحالة المزاجية: ${health.mood === 'great' ? 'ممتازة' : health.mood === 'good' ? 'جيدة' : health.mood === 'okay' ? 'مقبولة' : health.mood === 'stressed' ? 'متوترة' : 'منخفضة'}
- السعرات الحرارية المطلوبة: ${cal} سعرة
- الثلث: ${trimester.num}${conditionsText ? `\n- حالات صحية: ${conditionsText}` : ''}`,

      en: `- Week: ${health.week}
- Age: ${health.age} years
- Weight: ${health.weight} kg
- Height: ${health.height} cm
- BMI: ${bmi}
- Blood Pressure: ${bp} mmHg
- Blood Type: ${health.bloodType || 'Not specified'}
- Back Pain Level: ${health.painLevel}/10
- Sleep Hours: ${health.sleepHours}
- Activity Level: ${health.activityLevel}
- Mood: ${health.mood}
- Required Calories: ${cal} kcal
- Trimester: ${trimester.num}${conditionsText ? `\n- Health Conditions: ${conditionsText}` : ''}`,

      de: `- Woche: ${health.week}, Alter: ${health.age}, Gewicht: ${health.weight}kg, Größe: ${health.height}cm
- BMI: ${bmi}, Blutdruck: ${bp}, Blutgruppe: ${health.bloodType || '-'}
- Rückenschmerzen: ${health.painLevel}/10, Schlaf: ${health.sleepHours}h, Aktivität: ${health.activityLevel}
- Stimmung: ${health.mood}, Kalorien: ${cal}, Trimester: ${trimester.num}${conditionsText ? `, Bedingungen: ${conditionsText}` : ''}`,

      fr: `- Semaine: ${health.week}, Âge: ${health.age}, Poids: ${health.weight}kg, Taille: ${health.height}cm
- IMC: ${bmi}, Tension: ${bp}, Groupe sanguin: ${health.bloodType || '-'}
- Douleur dorsale: ${health.painLevel}/10, Sommeil: ${health.sleepHours}h, Activité: ${health.activityLevel}
- Humeur: ${health.mood}, Calories: ${cal}, Trimestre: ${trimester.num}${conditionsText ? `, Conditions: ${conditionsText}` : ''}`,

      es: `- Semana: ${health.week}, Edad: ${health.age}, Peso: ${health.weight}kg, Altura: ${health.height}cm
- IMC: ${bmi}, Presión: ${bp}, Grupo sanguíneo: ${health.bloodType || '-'}
- Dolor de espalda: ${health.painLevel}/10, Sueño: ${health.sleepHours}h, Actividad: ${health.activityLevel}
- Estado de ánimo: ${health.mood}, Calorías: ${cal}, Trimestre: ${trimester.num}${conditionsText ? `, Condiciones: ${conditionsText}` : ''}`,

      pt: `- Semana: ${health.week}, Idade: ${health.age}, Peso: ${health.weight}kg, Altura: ${health.height}cm
- IMC: ${bmi}, Pressão: ${bp}, Tipo sanguíneo: ${health.bloodType || '-'}
- Dor nas costas: ${health.painLevel}/10, Sono: ${health.sleepHours}h, Atividade: ${health.activityLevel}
- Humor: ${health.mood}, Calorias: ${cal}, Trimestre: ${trimester.num}${conditionsText ? `, Condições: ${conditionsText}` : ''}`,

      tr: `- Hafta: ${health.week}, Yaş: ${health.age}, Kilo: ${health.weight}kg, Boy: ${health.height}cm
- VKİ: ${bmi}, Tansiyon: ${bp}, Kan grubu: ${health.bloodType || '-'}
- Bel ağrısı: ${health.painLevel}/10, Uyku: ${health.sleepHours}h, Aktivite: ${health.activityLevel}
- Ruh hali: ${health.mood}, Kalori: ${cal}, Trimester: ${trimester.num}${conditionsText ? `, Durumlar: ${conditionsText}` : ''}`,
    };
    return summaries[langKey] || summaries.en;
  };

  const getExercisePlan = () => {
    if (health.week >= 20 && health.painLevel > 3) {
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
    const summary = buildHealthSummary(lang);

    const reportPrompts: Record<string, string> = {
      ar: `أنتِ طبيبة نساء وولادة متخصصة. أعدّي تقريراً صحياً شاملاً ومفصلاً بناءً على هذه البيانات الصحية:
${summary}

يجب أن يتضمن التقرير الأقسام التالية بتفصيل:
## 📊 ملخص الحالة الصحية
- تحليل شامل للمؤشرات الحيوية (الوزن، ضغط الدم، مؤشر كتلة الجسم) وتقييم المخاطر

## 🏥 تطور الجنين هذا الأسبوع
- حجم الجنين ووزنه التقريبي والتطورات الجسدية

## 🍽️ خطة التغذية المخصصة
- وجبات مفصلة (فطور، غداء، عشاء، وجبات خفيفة) مع الفيتامينات المطلوبة حسب الحالة الصحية

## 🏃‍♀️ برنامج التمارين الآمنة
- تمارين مخصصة حسب مستوى الألم والنشاط والأسبوع

## 😴 تحسين النوم والراحة
- نصائح مخصصة حسب ساعات النوم الحالية والحالة المزاجية

## ⚠️ أعراض يجب مراقبتها
- أعراض طبيعية وأعراض تستدعي مراجعة الطبيب (مع مراعاة ضغط الدم وأي حالات صحية)

## 💡 نصائح مخصصة للأسبوع ${health.week}
- نصائح عملية مبنية على كل البيانات المدخلة

## 📋 قائمة الفحوصات المطلوبة
- الفحوصات والتحاليل المناسبة لهذا الأسبوع مع مراعاة فصيلة الدم والحالات الصحية

اجعلي التقرير مفصلاً ومهنياً وشاملاً.`,

      en: `You are a specialized OB-GYN doctor. Create a comprehensive, detailed health report based on this health data:
${summary}

Include these sections in detail:
## 📊 Health Status Summary
- Comprehensive vital signs analysis (weight, blood pressure, BMI) and risk assessment

## 🏥 Fetal Development This Week
- Baby's approximate size, weight, and physical developments

## 🍽️ Personalized Nutrition Plan
- Detailed meals (breakfast, lunch, dinner, snacks) with required vitamins based on health conditions

## 🏃‍♀️ Safe Exercise Program
- Customized exercises based on pain level, activity level, and week

## 😴 Sleep & Rest Optimization
- Personalized tips based on current sleep hours and mood

## ⚠️ Symptoms to Watch
- Normal symptoms and warning signs (considering blood pressure and health conditions)

## 💡 Tips for Week ${health.week}
- Practical tips built on all entered data

## 📋 Required Checkups
- Appropriate tests and screenings considering blood type and health conditions

Make the report detailed, professional, and comprehensive.`,

      de: `Sie sind eine spezialisierte Gynäkologin. Erstellen Sie einen umfassenden Gesundheitsbericht:
${summary}

Detaillierte Abschnitte: Gesundheitsstatus, Fetale Entwicklung, Ernährungsplan, Übungsprogramm, Schlafoptimierung, Symptome, Tipps Woche ${health.week}, Untersuchungen.`,

      fr: `Vous êtes gynécologue-obstétricienne. Créez un rapport de santé complet:
${summary}

Sections détaillées: Bilan de santé, Développement fœtal, Plan nutritionnel, Exercices, Sommeil, Symptômes, Conseils semaine ${health.week}, Examens.`,

      es: `Eres ginecóloga-obstetra. Crea un informe de salud completo:
${summary}

Secciones detalladas: Resumen de salud, Desarrollo fetal, Plan nutricional, Ejercicios, Sueño, Síntomas, Consejos semana ${health.week}, Chequeos.`,

      pt: `Você é ginecologista-obstetra. Crie um relatório de saúde completo:
${summary}

Seções detalhadas: Resumo de saúde, Desenvolvimento fetal, Plano nutricional, Exercícios, Sono, Sintomas, Dicas semana ${health.week}, Exames.`,

      tr: `Uzman kadın doğum uzmanısınız. Kapsamlı sağlık raporu oluşturun:
${summary}

Ayrıntılı bölümler: Sağlık Durumu, Fetal Gelişim, Beslenme Planı, Egzersiz, Uyku, Belirtiler, ${health.week}. Hafta İpuçları, Kontroller.`,
    };

    await streamChat({
      type: 'pregnancy-assistant',
      messages: [{ role: 'user', content: reportPrompts[lang] || reportPrompts.en }],
      context: { week: health.week, weight: health.weight, language: lang },
      onDelta: (text) => setReportContent(prev => prev + text),
      onDone: () => {},
    });
  };

  // Generate quick AI plan
  const getAIPlan = async () => {
    setAiResponse('');
    const summary = buildHealthSummary(lang);

    const prompts: Record<string, string> = {
      ar: `أنا حامل، هذه بياناتي الصحية:\n${summary}\nأنشئي خطة يومية مخصصة تشمل تمارين آمنة، واقتراحات وجبات، ونصائح صحية مبنية على كل بياناتي. رتبي الخطة بعناوين واضحة.`,
      en: `I'm pregnant. Here's my health data:\n${summary}\nCreate a personalized daily plan including safe exercises, meal suggestions, and wellness tips based on ALL my data. Use clear headings.`,
      de: `Ich bin schwanger. Meine Gesundheitsdaten:\n${summary}\nErstellen Sie einen personalisierten Tagesplan mit Übungen, Mahlzeiten und Tipps.`,
      fr: `Je suis enceinte. Mes données de santé:\n${summary}\nCréez un plan quotidien personnalisé avec exercices, repas et conseils.`,
      es: `Estoy embarazada. Mis datos de salud:\n${summary}\nCrea un plan diario personalizado con ejercicios, comidas y consejos.`,
      pt: `Estou grávida. Meus dados de saúde:\n${summary}\nCrie um plano diário personalizado com exercícios, refeições e dicas.`,
      tr: `Hamileyim. Sağlık verilerim:\n${summary}\nEgzersizler, yemekler ve ipuçları içeren kişiselleştirilmiş bir günlük plan oluşturun.`,
    };

    await streamChat({
      type: 'pregnancy-assistant',
      messages: [{ role: 'user', content: prompts[lang] || prompts.en }],
      context: { week: health.week, weight: health.weight, language: lang },
      onDelta: (text) => setAiResponse(prev => prev + text),
      onDone: () => {},
    });
  };

  const handleExportPDF = async () => {
    if (isExportingPDF) return;
    setIsExportingPDF(true);
    try {
      await exportSmartPlanPDF({
        week: health.week,
        weight: health.weight,
        bmi: getBMI(),
        calories: getCalories(),
        painLevel: health.painLevel,
        trimester: { num: trimester.num, label: trimester.label },
        progress,
        daysRemaining,
        reportContent,
        language: lang,
        onProgress: () => {},
      });
      toast.success(t("smartPlan.pdfExported", "Report exported successfully"));
    } catch {
      toast.error(t("smartPlan.pdfError", "Failed to export PDF"));
    } finally {
      setIsExportingPDF(false);
    }
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
    { value: 'great', ar: 'ممتازة', en: 'Great', de: 'Ausgezeichnet', fr: 'Excellent', es: 'Excelente', pt: 'Excelente', tr: 'Harika', icon: '😊' },
    { value: 'good', ar: 'جيدة', en: 'Good', de: 'Gut', fr: 'Bien', es: 'Bien', pt: 'Bom', tr: 'İyi', icon: '🙂' },
    { value: 'okay', ar: 'مقبولة', en: 'Okay', de: 'Okay', fr: 'Correct', es: 'Regular', pt: 'Razoável', tr: 'İdare eder', icon: '😐' },
    { value: 'stressed', ar: 'متوترة', en: 'Stressed', de: 'Gestresst', fr: 'Stressée', es: 'Estresada', pt: 'Estressada', tr: 'Stresli', icon: '😰' },
    { value: 'low', ar: 'منخفضة', en: 'Low', de: 'Niedrig', fr: 'Basse', es: 'Baja', pt: 'Baixo', tr: 'Düşük', icon: '😔' },
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
      toolId="smart-plan"
      mood="empowering"
      icon={FileText}
    >
      <div className="space-y-5">
        {/* Health Data Input Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-primary" />
              {t("smartPlan.yourHealthData", "Your Health Data")}
            </CardTitle>
            <CardDescription className="text-[10px]">
              {t("smartPlan.healthDataDesc", "Enter your data for a personalized report")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Week slider */}
            <WeekSlider week={health.week} onChange={(w) => update('week', w)} showCard={false} showTrimester label={t("smartPlan.currentWeek")} />

            {/* Row 1: Weight + Height */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px]">{t("smartPlan.weight", "Weight")} (kg)</Label>
                <Input type="number" value={health.weight} onChange={(e) => update('weight', Number(e.target.value))} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px]">{t("smartPlan.height", "Height")} (cm)</Label>
                <Input type="number" value={health.height} onChange={(e) => update('height', Number(e.target.value))} className="h-9 text-sm" />
              </div>
            </div>

            {/* Row 2: Age + Blood Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px]">{t("smartPlan.age", "Age")}</Label>
                <Input type="number" value={health.age} onChange={(e) => update('age', Number(e.target.value))} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px]">{t("smartPlan.bloodType", "Blood Type")}</Label>
                <Select value={health.bloodType} onValueChange={(v) => update('bloodType', v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                      <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Back pain slider */}
            <div className="space-y-1.5">
              <Label className="text-[11px]">{t("smartPlan.backPainLevel", "Back Pain Level")}: {health.painLevel}/10</Label>
              <Slider value={[health.painLevel]} onValueChange={(v) => update('painLevel', v[0])} max={10} step={1} />
            </div>

            {/* Expandable section */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs gap-1 h-7 text-muted-foreground"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showMore
                ? t("smartPlan.showLess", "Show Less")
                : t("smartPlan.moreHealthData", "More Health Data")}
            </Button>

            {showMore && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {/* Blood Pressure */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-rose-400" />
                    {t("smartPlan.bloodPressure", "Blood Pressure")} (mmHg)
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Input type="number" value={health.bloodPressureSys} onChange={(e) => update('bloodPressureSys', Number(e.target.value))} className="h-9 text-sm" />
                      <span className="absolute end-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground">SYS</span>
                    </div>
                    <div className="relative">
                      <Input type="number" value={health.bloodPressureDia} onChange={(e) => update('bloodPressureDia', Number(e.target.value))} className="h-9 text-sm" />
                      <span className="absolute end-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground">DIA</span>
                    </div>
                  </div>
                </div>

                {/* Sleep Hours */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] flex items-center gap-1">
                    <Moon className="w-3 h-3 text-indigo-400" />
                    {t("smartPlan.sleepHours", "Sleep Hours")}: {health.sleepHours}h
                  </Label>
                  <Slider value={[health.sleepHours]} onValueChange={(v) => update('sleepHours', v[0])} min={3} max={12} step={0.5} />
                </div>

                {/* Activity Level */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] flex items-center gap-1">
                    <Activity className="w-3 h-3 text-emerald-500" />
                    {t("smartPlan.activityLevel", "Activity Level")}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {activityOptions.map(opt => (
                      <Button
                        key={opt.value}
                        variant={health.activityLevel === opt.value ? "default" : "outline"}
                        size="sm"
                        className="text-[10px] h-8"
                        onClick={() => update('activityLevel', opt.value)}
                      >
                        {getLocalizedLabel(opt)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Mood */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] flex items-center gap-1">
                    <Smile className="w-3 h-3 text-amber-500" />
                    {t("smartPlan.mood", "Mood")}
                  </Label>
                  <div className="flex gap-1.5 flex-wrap">
                    {moodOptions.map(opt => (
                      <Button
                        key={opt.value}
                        variant={health.mood === opt.value ? "default" : "outline"}
                        size="sm"
                        className="text-[10px] h-7 gap-1 px-2"
                        onClick={() => update('mood', opt.value)}
                      >
                        <span>{opt.icon}</span>
                        {getLocalizedLabel(opt)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Health Conditions */}
                <div className="space-y-2">
                  <Label className="text-[11px] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    {t("smartPlan.healthConditions", "Health Conditions")}
                  </Label>
                  <div className="space-y-2">
                    {conditionOptions.map(cond => (
                      <div key={cond.key} className="flex items-center gap-2">
                        <Checkbox
                          id={cond.key}
                          checked={health.conditions.includes(cond.key)}
                          onCheckedChange={() => toggleCondition(cond.key)}
                        />
                        <label htmlFor={cond.key} className="text-xs cursor-pointer">
                          {getLocalizedLabel(cond)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          {statsCards.map((stat, i) => (
            <Card key={i} className="p-2 text-center">
              <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
              <p className="text-xs font-bold">{stat.value}</p>
              <p className="text-[9px] text-muted-foreground leading-tight">{stat.label}</p>
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
                <CardDescription className="text-xs">{t("smartPlan.exerciseDesc", { week: health.week })}</CardDescription>
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
                            <h3 className="text-sm font-bold">{t("smartPlan.weeklyReport")} — {t("common.week", "Week")} {health.week}</h3>
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
