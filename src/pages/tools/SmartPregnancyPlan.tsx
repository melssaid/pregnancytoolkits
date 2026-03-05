import { useState, useRef, useEffect, useCallback } from "react";
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
  Stethoscope, AlertTriangle, Sparkles, Globe
} from "lucide-react";
import { toast } from "sonner";
import { WeekSlider } from "@/components/WeekSlider";
import { ToolFrame } from "@/components/ToolFrame";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { AIActionButton } from '@/components/ai/AIActionButton';
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useResetOnLanguageChange } from "@/hooks/useResetOnLanguageChange";
import { motion } from "framer-motion";


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
  const [researchEnhanced, setResearchEnhanced] = useState(false);
  const [enhancedLoading, setEnhancedLoading] = useState(false);
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

  // SSE stream parser for enhanced endpoint
  const streamEnhanced = useCallback(async (mode: "plan" | "report", onDelta: (text: string) => void) => {
    setEnhancedLoading(true);
    setResearchEnhanced(false);

    try {
      const authHeader = `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pregnancy-plan-enhanced`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({
            week: health.week,
            weight: health.weight,
            height: health.height,
            age: health.age,
            painLevel: health.painLevel,
            bloodPressureSys: health.bloodPressureSys,
            bloodPressureDia: health.bloodPressureDia,
            sleepHours: health.sleepHours,
            activityLevel: health.activityLevel,
            mood: health.mood,
            conditions: health.conditions,
            language: lang,
            mode,
          }),
        }
      );

      if (!response.ok || !response.body) {
        // Fallback to standard AI if enhanced fails
        console.warn("[Enhanced] Failed, falling back to standard AI");
        throw new Error("Enhanced endpoint failed");
      }

      // Check if research was used
      const isResearchEnhanced = response.headers.get("X-Research-Enhanced") === "true";
      setResearchEnhanced(isResearchEnhanced);

      // Parse SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") return;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onDelta(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } finally {
      setEnhancedLoading(false);
    }
  }, [health, lang]);

  const generateAIPlan = async () => {
    setAiResponse('');
    setActiveTab('aiplan');

    try {
      await streamEnhanced("plan", (text) => setAiResponse(prev => prev + text));
    } catch {
      // Fallback to standard Gemini-only flow
      const conditionsText = health.conditions.length > 0 ? health.conditions.join(', ') : 'none';
      const prompt = `I'm in week ${health.week} of pregnancy. Weight: ${health.weight}kg, height: ${health.height}cm, age: ${health.age}, pain: ${health.painLevel}/10, BP: ${health.bloodPressureSys}/${health.bloodPressureDia}, sleep: ${health.sleepHours}hrs, mood: ${health.mood}, activity: ${health.activityLevel}, conditions: ${conditionsText}. Give me a personalized weekly pregnancy plan covering exercises, nutrition tips, and wellness recommendations.`;
      await streamChat({
        type: 'pregnancy-plan',
        messages: [{ role: 'user', content: prompt }],
        context: { week: health.week, weight: health.weight, language: lang },
        onDelta: (text) => setAiResponse(prev => prev + text),
        onDone: () => {},
      });
    }
  };

  const generateReport = async () => {
    setReportContent('');
    setActiveTab('report');

    try {
      await streamEnhanced("report", (text) => setReportContent(prev => prev + text));
    } catch {
      // Fallback to standard Gemini-only flow
      const conditionsText = health.conditions.length > 0 ? health.conditions.join(', ') : 'none';
      const prompt = `Generate a comprehensive weekly pregnancy health report for Week ${health.week}. Weight: ${health.weight}kg, Height: ${health.height}cm, BMI: ${getBMI()}, Age: ${health.age}, BP: ${health.bloodPressureSys}/${health.bloodPressureDia}, Pain: ${health.painLevel}/10, Sleep: ${health.sleepHours}hrs, Mood: ${health.mood}, Activity: ${health.activityLevel}, Conditions: ${conditionsText}.`;
      await streamChat({
        type: 'pregnancy-plan',
        messages: [{ role: 'user', content: prompt }],
        context: { week: health.week, weight: health.weight, language: lang },
        onDelta: (text) => setReportContent(prev => prev + text),
        onDone: () => {},
      });
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
            <div key={i} className="text-center p-2 rounded-xl bg-muted/40 border border-border/30">
              <stat.icon className={`w-4 h-4 mx-auto mb-0.5 ${stat.color}`} />
              <p className="text-sm font-bold">{stat.value}</p>
              <p className="text-[9px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Trimester & Progress */}
        <div className="rounded-xl bg-muted/30 border border-border/30 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Badge className={`${trimester.color} text-white text-xs`}>{trimester.label}</Badge>
            <span className="text-xs text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-[10px] text-center text-muted-foreground">
            {t("smartPlan.daysRemaining", "{{days}} days remaining", { days: daysRemaining })}
          </p>
        </div>

        {/* Health Inputs */}
        <div className="space-y-3">
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
        </div>

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
          <TabsContent value="aiplan" className="space-y-3 mt-3">
            {aiResponse ? (
              <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative rounded-2xl overflow-hidden border border-primary/15 shadow-sm"
                >
                  {/* Gradient accent top bar */}
                  <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))' }} />
                  
                  {/* Header */}
                  <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(330 70% 55% / 0.1))' }}>
                      <Brain className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-foreground">{t("smartPlan.aiPlan", "AI Plan")}</h3>
                      <p className="text-[10px] text-muted-foreground">{t("common.week", "Week")} {health.week} • {trimester.label}</p>
                    </div>
                    {researchEnhanced && (
                      <Badge variant="outline" className="text-[9px] gap-1 border-emerald-500/30 text-emerald-600 bg-emerald-500/10 shrink-0">
                        <Globe className="w-2.5 h-2.5" />
                        {t("smartPlan.researchEnhanced", "Research-Enhanced")}
                      </Badge>
                    )}
                    {(isLoading || enhancedLoading) && (
                      <div className="flex gap-1 ms-auto">
                        {[0, 1, 2].map(i => (
                          <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="px-4 pb-5 pt-1">
                    <div className="rounded-xl bg-gradient-to-b from-primary/[0.04] to-transparent p-3">
                      <MarkdownRenderer content={aiResponse} isLoading={isLoading || enhancedLoading} />
                    </div>
                  </div>
                </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-4 rounded-2xl border border-dashed border-primary/20 bg-gradient-to-b from-primary/[0.03] to-transparent"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(330 70% 55% / 0.08))' }}>
                  <Brain className="h-7 w-7 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
                  {t("smartPlan.aiPlanHintEnhanced", "Get a personalized AI plan enhanced with the latest medical research")}
                </p>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-600">
                  <Globe className="w-3 h-3" />
                  <span>{t("smartPlan.poweredByResearch", "Powered by real-time medical research")}</span>
                </div>
                <AIActionButton
                  onClick={generateAIPlan}
                  isLoading={isLoading || enhancedLoading}
                  label={t("smartPlan.getAIPlan", "Get Smart Plan")}
                />
              </motion.div>
            )}
          </TabsContent>

          {/* Report Tab */}
          <TabsContent value="report" className="space-y-3 mt-3">
            {reportContent ? (
              <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    id="smart-plan-report"
                    ref={reportRef}
                    className="relative rounded-2xl overflow-hidden border border-primary/15 shadow-sm"
                    dir={isRTL ? 'rtl' : 'ltr'}
                    lang={lang}
                  >
                    {/* Gradient accent top bar */}
                    <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, hsl(280 60% 55%), hsl(330 70% 55%), hsl(var(--primary)))' }} />

                    {/* Report Header */}
                    <div className="px-4 pt-4 pb-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(280 60% 55% / 0.1))' }}>
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-foreground">{t("smartPlan.weeklyReport")} — {t("common.week", "Week")} {health.week}</h3>
                            <p className="text-[10px] text-muted-foreground">{new Date().toLocaleDateString(isRTL ? 'ar-SA' : undefined)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {researchEnhanced && (
                            <Badge variant="outline" className="text-[8px] gap-0.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/10 shrink-0">
                              <Globe className="w-2 h-2" />
                              {t("smartPlan.researchEnhanced", "Research-Enhanced")}
                            </Badge>
                          )}
                          <Badge className={`${trimester.color} text-white text-[10px]`}>{trimester.label}</Badge>
                        </div>
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

                      <div className="grid grid-cols-4 gap-2">
                        {statsCards.map((stat, i) => (
                          <div key={i} className="bg-muted/40 rounded-lg p-2 text-center border border-border/20">
                            <stat.icon className={`w-3.5 h-3.5 mx-auto mb-0.5 ${stat.color}`} />
                            <p className="text-xs font-bold">{stat.value}</p>
                            <p className="text-[8px] text-muted-foreground">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Report Content */}
                    <div className="px-4 pb-5">
                      <div className="rounded-xl bg-gradient-to-b from-primary/[0.04] to-transparent p-3">
                        <MarkdownRenderer content={reportContent} isLoading={isLoading || enhancedLoading} />
                      </div>
                    </div>
                  </motion.div>

                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={generateReport}
                  disabled={isLoading || enhancedLoading}
                  className="relative w-full overflow-hidden rounded-2xl h-9 flex items-center justify-center gap-1.5 text-white text-xs font-semibold disabled:opacity-60 disabled:pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))' }}
                >
                  {(isLoading || enhancedLoading) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  {t("smartPlan.regenerate", "Regenerate")}
                </motion.button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-4 rounded-2xl border border-dashed border-primary/20 bg-gradient-to-b from-primary/[0.03] to-transparent"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(135deg, hsl(280 60% 55% / 0.12), hsl(var(--primary) / 0.08))' }}>
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
                  {t("smartPlan.reportHintEnhanced", "Get a detailed health report enhanced with the latest medical research")}
                </p>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-600">
                  <Globe className="w-3 h-3" />
                  <span>{t("smartPlan.poweredByResearch", "Powered by real-time medical research")}</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={generateReport}
                  disabled={isLoading || enhancedLoading}
                  className="relative mx-auto overflow-hidden rounded-2xl h-10 px-6 flex items-center justify-center gap-2 text-white text-sm font-semibold disabled:opacity-60 disabled:pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))' }}
                >
                  {(isLoading || enhancedLoading) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
                  {t("smartPlan.generateReport", "Generate Health Report")}
                </motion.button>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive text-xs">{error}</div>
        )}
      </div>
    </ToolFrame>
  );
};

export default SmartPregnancyPlan;
