import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, FileText } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useResetOnLanguageChange } from "@/hooks/useResetOnLanguageChange";
import { HealthStatsGrid } from "@/components/smart-plan/HealthStatsGrid";
import { HealthInputForm } from "@/components/smart-plan/HealthInputForm";
import { PlanResultView } from "@/components/smart-plan/PlanResultView";
import { ReportResultView } from "@/components/smart-plan/ReportResultView";
import { useHealthData } from "@/components/smart-plan/useHealthData";

const SmartPregnancyPlan = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("aiplan");
  const [aiResponse, setAiResponse] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [researchEnhanced, setResearchEnhanced] = useState(false);
  const [enhancedLoading, setEnhancedLoading] = useState(false);
  const { streamChat, isLoading, error } = usePregnancyAI();
  const reportRef = useRef<HTMLDivElement>(null);

  const { health, update, getBMI, getCalories, getTrimester, progress, daysRemaining } = useHealthData();

  const lang = i18n.language?.split('-')[0] || 'en';
  const isRTL = lang === 'ar';
  const trimester = getTrimester();
  const trimesterLabels: Record<number, string> = {
    1: t("smartPlan.trimester1", "First Trimester"),
    2: t("smartPlan.trimester2", "Second Trimester"),
    3: t("smartPlan.trimester3", "Third Trimester"),
  };
  const trimesterLabel = trimesterLabels[trimester.num];
  const bmi = getBMI();
  const calories = getCalories();
  const bloodPressure = `${health.bloodPressureSys}/${health.bloodPressureDia}`;
  const combinedLoading = isLoading || enhancedLoading;

  useResetOnLanguageChange(() => {
    setAiResponse('');
    setReportContent('');
  });

  const streamEnhanced = useCallback(async (mode: "plan" | "report", onDelta: (text: string) => void) => {
    setEnhancedLoading(true);
    setResearchEnhanced(false);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pregnancy-plan-enhanced`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            week: health.week, weight: health.weight, height: health.height, age: health.age,
            painLevel: health.painLevel, bloodPressureSys: health.bloodPressureSys,
            bloodPressureDia: health.bloodPressureDia, sleepHours: health.sleepHours,
            activityLevel: health.activityLevel, mood: health.mood,
            conditions: health.conditions, language: lang, mode,
          }),
        }
      );

      if (!response.ok || !response.body) throw new Error("Enhanced endpoint failed");

      setResearchEnhanced(response.headers.get("X-Research-Enhanced") === "true");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ") || line.trim() === "") continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") return;
          try {
            const content = JSON.parse(json).choices?.[0]?.delta?.content;
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

  const fallbackPrompt = useCallback((mode: "plan" | "report") => {
    const conditionsText = health.conditions.length > 0 ? health.conditions.join(', ') : 'none';
    const base = `Week ${health.week}, Weight: ${health.weight}kg, Height: ${health.height}cm, Age: ${health.age}, Pain: ${health.painLevel}/10, BP: ${health.bloodPressureSys}/${health.bloodPressureDia}, Sleep: ${health.sleepHours}hrs, Mood: ${health.mood}, Activity: ${health.activityLevel}, Conditions: ${conditionsText}`;
    return mode === "plan"
      ? `I'm in week ${health.week} of pregnancy. ${base}. Give me a personalized weekly pregnancy plan covering exercises, nutrition tips, and wellness recommendations.`
      : `Generate a comprehensive weekly pregnancy health report for ${base}, BMI: ${bmi}.`;
  }, [health, bmi]);

  const generateContent = useCallback(async (mode: "plan" | "report") => {
    const setter = mode === "plan" ? setAiResponse : setReportContent;
    setter('');
    setActiveTab(mode === "plan" ? "aiplan" : "report");

    try {
      await streamEnhanced(mode, (text) => setter(prev => prev + text));
    } catch {
      await streamChat({
        type: 'pregnancy-plan',
        messages: [{ role: 'user', content: fallbackPrompt(mode) }],
        context: { week: health.week, weight: health.weight, language: lang },
        onDelta: (text) => setter(prev => prev + text),
        onDone: () => {},
      });
    }
  }, [streamEnhanced, streamChat, fallbackPrompt, health.week, health.weight, lang]);

  return (
    <ToolFrame title={t("smartPlan.title")} subtitle={t("smartPlan.subtitle")} icon={Brain} mood="nurturing" toolId="smart-pregnancy-plan">
      <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
        <HealthStatsGrid week={health.week} bmi={bmi} calories={calories} bloodPressure={bloodPressure} />
        <HealthInputForm health={health} onUpdate={update} lang={lang} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 h-auto">
            <TabsTrigger value="aiplan" className="text-xs py-2 gap-1.5">
              <Brain className="w-3.5 h-3.5" /> {t("smartPlan.aiPlan", "AI Plan")}
            </TabsTrigger>
            <TabsTrigger value="report" className="text-xs py-2 gap-1.5">
              <FileText className="w-3.5 h-3.5" /> {t("smartPlan.report", "Report")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="aiplan" className="space-y-3 mt-3">
            <PlanResultView
              content={aiResponse}
              week={health.week}
              trimesterLabel={trimesterLabel}
              researchEnhanced={researchEnhanced}
              isLoading={combinedLoading}
              onGenerate={() => generateContent("plan")}
              onRegenerate={() => generateContent("plan")}
            />
          </TabsContent>

          <TabsContent value="report" className="space-y-3 mt-3">
            <ReportResultView
              ref={reportRef}
              content={reportContent}
              week={health.week}
              trimesterLabel={trimesterLabel}
              trimesterColor={trimester.color}
              progress={progress}
              daysRemaining={daysRemaining}
              bmi={bmi}
              calories={calories}
              bloodPressure={bloodPressure}
              researchEnhanced={researchEnhanced}
              isLoading={combinedLoading}
              isRTL={isRTL}
              lang={lang}
              onGenerate={() => generateContent("report")}
            />
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
