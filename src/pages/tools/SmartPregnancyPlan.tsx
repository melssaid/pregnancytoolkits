import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Brain } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { SavedResultsViewer } from "@/components/ai/SavedResultsViewer";
import { useResetOnLanguageChange } from "@/hooks/useResetOnLanguageChange";
import { HealthStatsGrid } from "@/components/smart-plan/HealthStatsGrid";
import { HealthInputForm } from "@/components/smart-plan/HealthInputForm";
import { SmartPlanResultView } from "@/components/smart-plan/SmartPlanResultView";
import { useHealthData } from "@/components/smart-plan/useHealthData";
import { useSmartInsight } from "@/hooks/useSmartInsight";

const SmartPregnancyPlan = () => {
  const { t, i18n } = useTranslation();
  const [researchEnhanced, setResearchEnhanced] = useState(false);
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

  const {
    generate,
    isLoading: enhancedLoading,
    content: planContent,
    error: limitError,
    reset,
  } = useSmartInsight({
    section: 'pregnancy-plan',
    toolType: 'pregnancy-plan',
  });

  useResetOnLanguageChange(() => reset());

  const generatePlan = useCallback(async () => {
    const conditionsText = health.conditions.length > 0 ? health.conditions.join(', ') : 'none';
    const base = `Week ${health.week}, Weight: ${health.weight}kg, Height: ${health.height}cm, Age: ${health.age}, Last Kick Count: ${health.lastKickCount} kicks, BP: ${health.bloodPressureSys}/${health.bloodPressureDia}, Sleep: ${health.sleepHours}hrs, Mood: ${health.mood}, Activity: ${health.activityLevel}, Conditions: ${conditionsText}`;

    setResearchEnhanced(false);

    await generate({
      prompt: `I'm in week ${health.week} of pregnancy. ${base}. Give me a personalized weekly pregnancy plan covering exercises, nutrition tips, and wellness recommendations.`,
      context: { week: health.week, weight: health.weight },
    });
  }, [health, generate]);

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
          isLoading={enhancedLoading}
          isRTL={isRTL}
          lang={lang}
          onGenerate={generatePlan}
        />

        <SavedResultsViewer toolId="smart-pregnancy-plan" onLoad={(r) => reset()} />

        {limitError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive text-xs">{limitError}</div>
        )}
      </div>
    </ToolFrame>
  );
};

export default SmartPregnancyPlan;
