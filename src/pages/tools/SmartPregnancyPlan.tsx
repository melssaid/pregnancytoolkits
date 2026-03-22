import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
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
import { executeSmartRequest } from "@/services/smartEngine";

const SmartPregnancyPlan = () => {
  const { t, i18n } = useTranslation();
  const [planContent, setPlanContent] = useState('');
  const [researchEnhanced, setResearchEnhanced] = useState(false);
  const [enhancedLoading, setEnhancedLoading] = useState(false);
  const { streamChat, isLoading, error } = usePregnancyAI();
  const { isLimitReached, limit, refresh } = useAIUsage();
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

  const generatePlan = useCallback(async () => {
    if (isLimitReached) {
      setLimitError(t('aiErrors.monthlyLimitMsg', { limit, remaining: 0 }));
      return;
    }
    setPlanContent('');
    setLimitError('');
    setEnhancedLoading(true);
    setResearchEnhanced(false);

    const conditionsText = health.conditions.length > 0 ? health.conditions.join(', ') : 'none';
    const base = `Week ${health.week}, Weight: ${health.weight}kg, Height: ${health.height}cm, Age: ${health.age}, Pain: ${health.painLevel}/10, BP: ${health.bloodPressureSys}/${health.bloodPressureDia}, Sleep: ${health.sleepHours}hrs, Mood: ${health.mood}, Activity: ${health.activityLevel}, Conditions: ${conditionsText}`;

    try {
      // Route through the unified smart engine for quota + caching
      await executeSmartRequest({
        request: {
          section: 'pregnancy-plan',
          toolType: 'pregnancy-plan',
          weight: 1,
          messages: [{
            role: 'user',
            content: `I'm in week ${health.week} of pregnancy. ${base}. Give me a personalized weekly pregnancy plan covering exercises, nutrition tips, and wellness recommendations.`,
          }],
          context: { week: health.week, weight: health.weight, language: lang },
        },
        onDelta: (text) => setPlanContent(prev => prev + text),
        onDone: () => {
          setEnhancedLoading(false);
          refresh(); // Sync UI with quota consumed by engine
        },
        onError: (err) => {
          setEnhancedLoading(false);
          if (err.type === 'quota_exhausted') {
            setLimitError(t('aiErrors.monthlyLimitMsg', { limit, remaining: 0 }));
          } else {
            setLimitError(err.message);
          }
          refresh();
        },
      });
    } catch {
      setEnhancedLoading(false);
      // Fallback to streamChat (which also routes through smartEngine now)
      await streamChat({
        type: 'pregnancy-plan',
        messages: [{ role: 'user', content: `I'm in week ${health.week} of pregnancy. ${base}. Give me a personalized weekly pregnancy plan covering exercises, nutrition tips, and wellness recommendations.` }],
        context: { week: health.week, weight: health.weight, language: lang },
        onDelta: (text) => setPlanContent(prev => prev + text),
        onDone: () => {},
      });
    }
  }, [streamChat, health, lang, isLimitReached, limit, t, refresh]);

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
