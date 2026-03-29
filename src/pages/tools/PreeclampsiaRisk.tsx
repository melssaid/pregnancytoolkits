import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, CheckCircle, AlertTriangle, Info, Shield, Activity,
  Eye, Brain, TrendingUp, RotateCcw, Sparkles,
} from "lucide-react";
import { WhenToCallDoctorCard, EvidenceInfoBlock } from "@/components/safety";
import { ToolFrame } from "@/components/ToolFrame";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AIInsightCard } from "@/components/ai/AIInsightCard";

interface RiskFactor {
  id: string;
  labelKey: string;
  points: number;
  categoryKey: string;
  icon: React.ElementType;
  gradient: string;
}

const CATEGORIES = ["pregnancy", "history", "medical", "demographics"] as const;

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; gradient: string; bg: string }> = {
  pregnancy: { icon: Heart, gradient: "from-pink-500 to-rose-400", bg: "bg-pink-500/8 border-pink-500/15" },
  history: { icon: Brain, gradient: "from-purple-500 to-violet-400", bg: "bg-purple-500/8 border-purple-500/15" },
  medical: { icon: Activity, gradient: "from-red-500 to-rose-500", bg: "bg-red-500/8 border-red-500/15" },
  demographics: { icon: Shield, gradient: "from-blue-500 to-indigo-400", bg: "bg-blue-500/8 border-blue-500/15" },
};

const riskFactors: RiskFactor[] = [
  { id: "first-pregnancy", labelKey: "firstPregnancy", points: 1, categoryKey: "pregnancy", icon: Heart, gradient: "from-pink-400 to-rose-400" },
  { id: "prev-preeclampsia", labelKey: "prevPreeclampsia", points: 3, categoryKey: "history", icon: AlertTriangle, gradient: "from-red-600 to-rose-500" },
  { id: "chronic-hypertension", labelKey: "chronicHypertension", points: 2, categoryKey: "medical", icon: Activity, gradient: "from-red-500 to-red-400" },
  { id: "diabetes", labelKey: "diabetes", points: 2, categoryKey: "medical", icon: TrendingUp, gradient: "from-amber-500 to-orange-400" },
  { id: "kidney-disease", labelKey: "kidneyDisease", points: 2, categoryKey: "medical", icon: Shield, gradient: "from-rose-500 to-pink-400" },
  { id: "autoimmune", labelKey: "autoimmune", points: 2, categoryKey: "medical", icon: Shield, gradient: "from-purple-500 to-violet-400" },
  { id: "multiples", labelKey: "multiples", points: 2, categoryKey: "pregnancy", icon: Heart, gradient: "from-pink-500 to-rose-500" },
  { id: "age-35", labelKey: "age35", points: 1, categoryKey: "demographics", icon: Brain, gradient: "from-blue-400 to-indigo-400" },
  { id: "age-40", labelKey: "age40", points: 2, categoryKey: "demographics", icon: Brain, gradient: "from-blue-500 to-indigo-500" },
  { id: "obesity", labelKey: "obesity", points: 1, categoryKey: "medical", icon: TrendingUp, gradient: "from-orange-500 to-amber-400" },
  { id: "ivf", labelKey: "ivf", points: 1, categoryKey: "pregnancy", icon: Sparkles, gradient: "from-violet-400 to-purple-400" },
  { id: "family-history", labelKey: "familyHistory", points: 1, categoryKey: "history", icon: Brain, gradient: "from-indigo-400 to-blue-400" },
  { id: "long-gap", labelKey: "longGap", points: 1, categoryKey: "history", icon: Eye, gradient: "from-teal-500 to-emerald-400" },
];

const WARNING_SIGNS = ["headaches", "vision", "abdominalPain", "swelling", "weightGain"];

export default function PreeclampsiaRisk() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleFactor = (id: string) => {
    setSelectedFactors((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const { result, totalPoints, maxPoints } = useMemo(() => {
    const total = riskFactors
      .filter((f) => selectedFactors.includes(f.id))
      .reduce((sum, f) => sum + f.points, 0);
    const max = riskFactors.reduce((sum, f) => sum + f.points, 0);

    const hasHighRiskFactor = selectedFactors.some((id) =>
      ["prev-preeclampsia", "chronic-hypertension", "diabetes", "kidney-disease", "autoimmune", "multiples"].includes(id)
    );

    let r;
    if (hasHighRiskFactor || total >= 6) {
      r = { level: "high" as const, gradient: "from-red-500 to-rose-500", color: "text-destructive", bg: "bg-destructive/8 border-destructive/20", icon: AlertTriangle };
    } else if (total >= 3) {
      r = { level: "moderate" as const, gradient: "from-amber-500 to-orange-400", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/8 border-amber-500/20", icon: Shield };
    } else {
      r = { level: "low" as const, gradient: "from-emerald-500 to-teal-400", color: "text-primary", bg: "bg-primary/5 border-primary/20", icon: CheckCircle };
    }
    return { result: r, totalPoints: total, maxPoints: max };
  }, [selectedFactors]);

  const scorePercent = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

  const factorsByCategory = useMemo(() => {
    const grouped: Record<string, RiskFactor[]> = {};
    CATEGORIES.forEach((cat) => {
      grouped[cat] = riskFactors.filter((f) => f.categoryKey === cat);
    });
    return grouped;
  }, []);

  return (
    <ToolFrame
      title={t("preeclampsiaRisk.title")}
      subtitle={t("preeclampsiaRisk.subtitle")}
      customIcon="health-shield"
      mood="calm"
      toolId="preeclampsia-risk"
    >
      <div className="space-y-4">

        {/* Score Hero */}
        <Card className="overflow-hidden">
          <div className={`h-1.5 bg-gradient-to-r ${result.gradient}`} style={{ width: `${Math.max(scorePercent, 5)}%`, transition: "width 0.5s" }} />
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="27" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
                  <motion.circle
                    cx="32" cy="32" r="27" fill="none"
                    stroke={totalPoints >= 6 ? "hsl(var(--destructive))" : totalPoints >= 3 ? "#f59e0b" : "hsl(var(--primary))"}
                    strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 27}`}
                    animate={{ strokeDashoffset: 2 * Math.PI * 27 * (1 - scorePercent / 100) }}
                    transition={{ duration: 0.8 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-lg font-extrabold ${result.color} tabular-nums`}>{totalPoints}</span>
                  <span className="text-[8px] text-muted-foreground">/{maxPoints}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <result.icon className={`w-4 h-4 ${result.color}`} />
                  <span className={`text-sm font-bold ${result.color}`}>
                    {t(`preeclampsiaRisk.riskLevels.${result.level}.title`)}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                  {t(`preeclampsiaRisk.riskLevels.${result.level}.description`)}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                    {t("preeclampsiaRisk.yourRiskFactors", "Factors")}: {selectedFactors.length}
                  </Badge>
                  {selectedFactors.length > 0 && (
                    <button onClick={() => setSelectedFactors([])} className="text-[9px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                      <RotateCcw className="w-2.5 h-2.5" /> {t("toolsInternal.gdm.reset", "Reset")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            const CIcon = config.icon;
            const isActive = activeCategory === cat;
            const catCount = factorsByCategory[cat].filter((f) => selectedFactors.includes(f.id)).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(isActive ? null : cat)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-semibold transition-all whitespace-nowrap ${
                  isActive ? `${config.bg} shadow-sm` : "border-border/30 bg-card hover:bg-muted/30"
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                  isActive ? `bg-gradient-to-br ${config.gradient}` : "bg-muted/60"
                }`}>
                  <CIcon className={`w-3 h-3 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                </div>
                {t(`preeclampsiaRisk.categories.${cat}`)}
                {catCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[8px] font-bold flex items-center justify-center">
                    {catCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Risk Factors List */}
        {(activeCategory ? [activeCategory] : CATEGORIES).map((cat) => (
          <div key={cat}>
            {!activeCategory && (
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center bg-gradient-to-br ${CATEGORY_CONFIG[cat].gradient}`}>
                  {(() => { const CI = CATEGORY_CONFIG[cat].icon; return <CI className="w-3 h-3 text-white" />; })()}
                </div>
                <span className="text-[11px] font-bold text-foreground">
                  {t(`preeclampsiaRisk.categories.${cat}`)}
                </span>
              </div>
            )}
            <div className="space-y-1.5 mb-3">
              {factorsByCategory[cat].map((factor, idx) => {
                const isSelected = selectedFactors.includes(factor.id);
                const FIcon = factor.icon;
                return (
                  <motion.button
                    key={factor.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleFactor(factor.id)}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-200 text-start ${
                      isSelected ? `${CATEGORY_CONFIG[cat].bg} shadow-sm` : "border-border/30 bg-card hover:border-border/50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected ? `bg-gradient-to-br ${factor.gradient} shadow-sm` : "bg-muted/60"
                    }`}>
                      {isSelected
                        ? <CheckCircle className="w-4 h-4 text-white" />
                        : <FIcon className="w-4 h-4 text-muted-foreground/50" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] font-semibold leading-tight ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                        {t(`preeclampsiaRisk.riskFactors.${factor.labelKey}`)}
                      </p>
                    </div>
                    {isSelected && (
                      <Badge variant="outline" className="text-[8px] px-1 py-0 border-current shrink-0">
                        +{factor.points}
                      </Badge>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Warning Signs */}
        <Card className="border-amber-500/15 bg-amber-500/5">
          <CardContent className="p-3">
            <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shadow-sm">
                <Eye className="h-3.5 w-3.5 text-white" />
              </div>
              {t("preeclampsiaRisk.warningSignsTitle")}
            </h3>
            <ul className="space-y-1.5">
              {WARNING_SIGNS.map((sign) => (
                <li key={sign} className="flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  {t(`preeclampsiaRisk.warningSigns.${sign}`)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recommendation */}
        {selectedFactors.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`overflow-hidden border ${result.bg}`}>
              <div className={`h-1 bg-gradient-to-r ${result.gradient}`} />
              <CardContent className="p-3">
                <p className="text-xs font-medium text-foreground leading-relaxed">
                  {t(`preeclampsiaRisk.riskLevels.${result.level}.recommendation`)}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* AI Coach */}
        {selectedFactors.length > 0 && (
          <AIInsightCard
            title={t("preeclampsiaRisk.aiCoachTitle")}
            prompt={`I'm assessing my preeclampsia risk. My risk level is: ${t(`preeclampsiaRisk.riskLevels.${result.level}.title`)}

My risk factors:
${riskFactors.filter(f => selectedFactors.includes(f.id)).map(f => `- ${t(`preeclampsiaRisk.riskFactors.${f.labelKey}`)} (${t(`preeclampsiaRisk.categories.${f.categoryKey}`)})`).join('\n')}

Please provide personalized guidance:

## 🎯 Your Risk Analysis
Detailed analysis of my specific combination of risk factors

## 🥗 Dietary Recommendations
Foods and nutrients that may help reduce preeclampsia risk

## 🏃‍♀️ Safe Exercise Plan
Exercises that support healthy blood pressure during pregnancy

## 📊 Monitoring Schedule
What vital signs to track and how often

## 🩺 Medical Discussion Points
Specific questions to ask my doctor about my risk profile

## 🌟 Positive Steps
Encouraging message about proactive health management`}
            variant="default"
            buttonText={t("preeclampsiaRisk.getPreventionPlan")}
          />
        )}

        {/* Evidence */}
        <EvidenceInfoBlock
          title={t("preeclampsiaRisk.evidence.title")}
          content={t("preeclampsiaRisk.evidence.content")}
          source={t("preeclampsiaRisk.evidence.source")}
        />
        <EvidenceInfoBlock
          title={t("preeclampsiaRisk.evidence2.title")}
          content={t("preeclampsiaRisk.evidence2.content")}
          source={t("preeclampsiaRisk.evidence2.source")}
        />

        <WhenToCallDoctorCard context="preeclampsia" />

        {/* Disclaimer */}
        <Card className="bg-muted/30">
          <CardContent className="pt-4 pb-3">
            <div className="flex gap-2.5">
              <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {t("preeclampsiaRisk.disclaimer")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
