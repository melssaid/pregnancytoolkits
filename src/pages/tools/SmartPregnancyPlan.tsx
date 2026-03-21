import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
const STORAGE_KEY = 'ai_daily_usage';
function isAdminBypass(): boolean {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r).adminBypass === true : false; } catch { return false; }
}
import { Brain } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { SavedResultsViewer } from "@/components/ai/SavedResultsViewer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useResetOnLanguageChange } from "@/hooks/useResetOnLanguageChange";
import { HealthStatsGrid } from "@/components/smart-plan/HealthStatsGrid";
import { HealthInputForm } from "@/components/smart-plan/HealthInputForm";
import { SmartPlanResultView } from "@/components/smart-plan/SmartPlanResultView";
import { useHealthData } from "@/components/smart-plan/useHealthData";
import { useAIUsage } from "@/contexts/AIUsageContext";

const SmartPregnancyPlan = () => {
  const { t, i18n } = useTranslation();
  const [planContent, setPlanContent] = useState('');
  const [researchEnhanced, setResearchEnhanced] = useState(false);
  const [enhancedLoading, setEnhancedLoading] = useState(false);
  const { streamChat, isLoading, error } = usePregnancyAI();
  const { isLimitReached, incrementUsage, syncFromServer, syncLimit, limit } = useAIUsage();
  const reportRef = useRef<HTMLDivElement>(null);
  const [limitError, setLimitError] = useState('');

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

  useResetOnLanguageChange(() => setPlanContent(''));

  const streamEnhanced = useCallback(async (onDelta: (text: string) => void) => {
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
            conditions: health.conditions, language: lang, mode: "plan",
          }),
        }
      );

      if (!response.ok) {
        // Check for daily limit
        if (response.status === 429) {
          try {
            const errBody = await response.json();
            if (errBody?.error === "daily_limit_reached") {
              const serverUsed = parseInt(response.headers.get("X-Daily-Used") || "0", 10);
              if (serverUsed) syncFromServer(serverUsed);
              setLimitError(t('aiErrors.dailyLimitMsg', { limit, remaining: 0 }));
              return;
            }
          } catch { /* ignore */ }
        }
        throw new Error("Enhanced endpoint failed");
      }
      if (!response.body) throw new Error("No response body");
      
      // Sync usage headers
      const serverUsed = response.headers.get("X-Daily-Used");
      if (serverUsed) syncFromServer(parseInt(serverUsed, 10));
      const serverLimit = response.headers.get("X-Daily-Limit");
      if (serverLimit) syncLimit(parseInt(serverLimit, 10));

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

  const generatePlan = useCallback(async () => {
    if (isLimitReached) {
      setLimitError(t('aiErrors.dailyLimitMsg', { limit, remaining: 0 }));
      return;
    }
    setPlanContent('');
    setLimitError('');
    try {
      await streamEnhanced((text) => setPlanContent(prev => prev + text));
      incrementUsage();
    } catch {
      const conditionsText = health.conditions.length > 0 ? health.conditions.join(', ') : 'none';
      const base = `Week ${health.week}, Weight: ${health.weight}kg, Height: ${health.height}cm, Age: ${health.age}, Pain: ${health.painLevel}/10, BP: ${health.bloodPressureSys}/${health.bloodPressureDia}, Sleep: ${health.sleepHours}hrs, Mood: ${health.mood}, Activity: ${health.activityLevel}, Conditions: ${conditionsText}`;
      await streamChat({
        type: 'pregnancy-plan',
        messages: [{ role: 'user', content: `I'm in week ${health.week} of pregnancy. ${base}. Give me a personalized weekly pregnancy plan covering exercises, nutrition tips, and wellness recommendations.` }],
        context: { week: health.week, weight: health.weight, language: lang },
        onDelta: (text) => setPlanContent(prev => prev + text),
        onDone: () => {},
      });
    }
  }, [streamEnhanced, streamChat, health, lang, isLimitReached, incrementUsage, limit, t]);

  return (
    <ToolFrame title={t("smartPlan.title")} subtitle={t("smartPlan.subtitle")} icon={Brain} mood="nurturing" toolId="smart-pregnancy-plan">
      <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
        <HealthStatsGrid week={health.week} bmi={bmi} calories={calories} bloodPressure={bloodPressure} />
        <HealthInputForm health={health} onUpdate={update} lang={lang} />

        <SmartPlanResultView
          ref={reportRef}
          content={planContent}
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
          onGenerate={generatePlan}
        />

        <SavedResultsViewer toolId="smart-pregnancy-plan" onLoad={(r) => setPlanContent(r.content)} />

        {(error || limitError) && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive text-xs">{limitError || error}</div>
        )}
      </div>
    </ToolFrame>
  );
};

export default SmartPregnancyPlan;
