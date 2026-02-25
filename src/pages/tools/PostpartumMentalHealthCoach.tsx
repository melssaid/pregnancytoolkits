import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, HelpCircle, Brain, Sun, Loader2, Sparkles, FileDown, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoLibrary } from '@/components/VideoLibrary';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { mentalHealthVideosByLang } from '@/data/videoData';
import { exportAIResultPDF } from '@/lib/pdfExport';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface ScreeningQuestion {
  id: string;
  questionKey: string;
  icon: string;
  options: { labelKey: string; value: number }[];
}

const getEpdsQuestions = (): ScreeningQuestion[] => [
  {
    id: '1', icon: '😊',
    questionKey: 'toolsInternal.mentalHealthCoach.epds.q1.question',
    options: [
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q1.o0', value: 0 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q1.o1', value: 1 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q1.o2', value: 2 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q1.o3', value: 3 }
    ]
  },
  {
    id: '2', icon: '🌟',
    questionKey: 'toolsInternal.mentalHealthCoach.epds.q2.question',
    options: [
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q2.o0', value: 0 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q2.o1', value: 1 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q2.o2', value: 2 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q2.o3', value: 3 }
    ]
  },
  {
    id: '3', icon: '💭',
    questionKey: 'toolsInternal.mentalHealthCoach.epds.q3.question',
    options: [
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q3.o0', value: 0 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q3.o1', value: 1 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q3.o2', value: 2 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q3.o3', value: 3 }
    ]
  },
  {
    id: '4', icon: '😰',
    questionKey: 'toolsInternal.mentalHealthCoach.epds.q4.question',
    options: [
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q4.o0', value: 0 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q4.o1', value: 1 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q4.o2', value: 2 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q4.o3', value: 3 }
    ]
  },
  {
    id: '5', icon: '😨',
    questionKey: 'toolsInternal.mentalHealthCoach.epds.q5.question',
    options: [
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q5.o0', value: 0 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q5.o1', value: 1 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q5.o2', value: 2 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q5.o3', value: 3 }
    ]
  },
  {
    id: '6', icon: '😴',
    questionKey: 'toolsInternal.mentalHealthCoach.epds.q6.question',
    options: [
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q6.o0', value: 0 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q6.o1', value: 1 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q6.o2', value: 2 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q6.o3', value: 3 }
    ]
  },
  {
    id: '7', icon: '😢',
    questionKey: 'toolsInternal.mentalHealthCoach.epds.q7.question',
    options: [
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q7.o0', value: 0 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q7.o1', value: 1 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q7.o2', value: 2 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q7.o3', value: 3 }
    ]
  },
  {
    id: '8', icon: '🍽️',
    questionKey: 'toolsInternal.mentalHealthCoach.epds.q8.question',
    options: [
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q8.o0', value: 0 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q8.o1', value: 1 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q8.o2', value: 2 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q8.o3', value: 3 }
    ]
  },
  {
    id: '9', icon: '🧠',
    questionKey: 'toolsInternal.mentalHealthCoach.epds.q9.question',
    options: [
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q9.o0', value: 0 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q9.o1', value: 1 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q9.o2', value: 2 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q9.o3', value: 3 }
    ]
  },
  {
    id: '10', icon: '⚡',
    questionKey: 'toolsInternal.mentalHealthCoach.epds.q10.question',
    options: [
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q10.o0', value: 0 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q10.o1', value: 1 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q10.o2', value: 2 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q10.o3', value: 3 }
    ]
  }
];

const copingStrategyKeys = [
  { icon: '🌤️', titleKey: 'toolsInternal.mentalHealthCoach.coping.sunlight.title', descKey: 'toolsInternal.mentalHealthCoach.coping.sunlight.desc' },
  { icon: '🚶‍♀️', titleKey: 'toolsInternal.mentalHealthCoach.coping.movement.title', descKey: 'toolsInternal.mentalHealthCoach.coping.movement.desc' },
  { icon: '📞', titleKey: 'toolsInternal.mentalHealthCoach.coping.connect.title', descKey: 'toolsInternal.mentalHealthCoach.coping.connect.desc' },
  { icon: '😴', titleKey: 'toolsInternal.mentalHealthCoach.coping.rest.title', descKey: 'toolsInternal.mentalHealthCoach.coping.rest.desc' },
  { icon: '🥗', titleKey: 'toolsInternal.mentalHealthCoach.coping.nourish.title', descKey: 'toolsInternal.mentalHealthCoach.coping.nourish.desc' },
  { icon: '✍️', titleKey: 'toolsInternal.mentalHealthCoach.coping.journal.title', descKey: 'toolsInternal.mentalHealthCoach.coping.journal.desc' }
];

type RiskLevel = 'low' | 'moderate' | 'high';

export default function PostpartumMentalHealthCoach() {
  const { t, i18n } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  
  const [aiCopingPlan, setAiCopingPlan] = useState('');
  const [showAICoping, setShowAICoping] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  
  const { streamChat, isLoading: aiLoading } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setAiCopingPlan('');
    setShowAICoping(false);
  });
  
  const epdsQuestions = useMemo(() => getEpdsQuestions(), []);
  const mentalHealthVideos = mentalHealthVideosByLang(t);
  const maxScore = epdsQuestions.length * 3; // 30

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setDirection(1);
    
    if (currentQuestion < epdsQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setDirection(-1);
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const getScore = () => Object.values(answers).reduce((sum, val) => sum + val, 0);

  const getRiskLevel = (score: number): RiskLevel => {
    if (score <= 9) return 'low';
    if (score <= 18) return 'moderate';
    return 'high';
  };

  const getScoreConfig = (level: RiskLevel) => {
    const configs = {
      low: {
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30',
        border: 'border-emerald-200/50 dark:border-emerald-800/50',
        ringColor: 'stroke-emerald-500',
        icon: CheckCircle,
        emoji: '🌸'
      },
      moderate: {
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
        border: 'border-amber-200/50 dark:border-amber-800/50',
        ringColor: 'stroke-amber-500',
        icon: HelpCircle,
        emoji: '💛'
      },
      high: {
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30',
        border: 'border-rose-200/50 dark:border-rose-800/50',
        ringColor: 'stroke-rose-500',
        icon: AlertTriangle,
        emoji: '💜'
      }
    };
    return configs[level];
  };

  const resetScreening = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setAiCopingPlan('');
    setShowAICoping(false);
    setIsExportingPDF(false);
    setPdfProgress(0);
    setDirection(1);
  };

  const handleExportPDF = async () => {
    if (!aiCopingPlan || isExportingPDF) return;
    setIsExportingPDF(true);
    setPdfProgress(0);
    try {
      const lang = (i18n.language || 'en') as string;
      const score = getScore();
      const level = getRiskLevel(score);
      const scoreLabel = t(`toolsInternal.mentalHealthCoach.riskLevels.${level}.title`);
      
      await exportAIResultPDF({
        title: t('toolsInternal.mentalHealthCoach.title'),
        subtitle: t('toolsInternal.mentalHealthCoach.subtitle'),
        content: aiCopingPlan,
        score: { value: score, max: maxScore, label: scoreLabel },
        language: lang,
        onProgress: setPdfProgress,
      });
      toast.success(t('common.exportComplete', 'Export complete!'));
    } catch (err) {
      console.error('PDF export failed:', err);
      toast.error(t('common.exportFailed', 'Export failed'));
    } finally {
      setIsExportingPDF(false);
    }
  };

  const getAICopingPlan = async () => {
    const score = getScore();
    const level = getRiskLevel(score);
    
    setShowAICoping(true);
    setAiCopingPlan('');

    const prompt = `As a compassionate postpartum mental health specialist, create a personalized coping plan:

**Wellness Assessment Score:** ${score}/${maxScore}
**Level:** ${t(`toolsInternal.mentalHealthCoach.riskLevels.${level}.title`)}
**Responses Pattern:** ${Object.entries(answers).map(([q, a]) => `Q${q}: ${a}/3`).join(', ')}

Based on this assessment, provide:

1. **Understanding Your Feelings** 🌸
   - Validate their experience
   - Explain what the score means in compassionate terms
   - Normalize postpartum challenges

2. **Your Daily Self-Care Routine** ☀️
   - Morning ritual (5 mins)
   - Afternoon check-in (5 mins)
   - Evening wind-down (10 mins)

3. **Connection & Support Plan** 💜
   - Who to reach out to
   - How to communicate your needs
   - Building your support circle

4. **Quick Relief Techniques** 🌿
   - 3 grounding exercises for anxiety moments
   - Breathing technique for overwhelm
   - Self-compassion phrases to repeat

5. **Weekly Goals** 📝
   - 3 achievable, gentle goals for this week
   - How to track progress without pressure

6. **When to Seek Help** ⚕️
   - Clear indicators that professional support is needed
   - How to take the first step

Keep the tone warm, non-judgmental, and empowering. Use emojis sparingly. Remind them they're doing better than they think.`;

    await streamChat({
      type: 'pregnancy-assistant',
      messages: [{ role: 'user', content: prompt }],
      onDelta: (text) => setAiCopingPlan((prev) => prev + text),
      onDone: () => {},
    });
  };

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName={t('toolsInternal.mentalHealthCoach.title')}
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  const score = getScore();
  const level = getRiskLevel(score);
  const config = getScoreConfig(level);
  const progressPercent = ((currentQuestion + (showResults ? 1 : 0)) / epdsQuestions.length) * 100;
  const scorePercent = (score / maxScore) * 100;

  // SVG ring parameters
  const ringSize = 120;
  const ringStroke = 8;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (scorePercent / 100) * ringCircumference;

  return (
    <ToolFrame
      title={t('toolsInternal.mentalHealthCoach.title')}
      subtitle={t('toolsInternal.mentalHealthCoach.subtitle')}
      customIcon="health-shield"
      mood="nurturing"
      toolId="mental-health-coach"
    >
      <div className="space-y-5">
        {/* Progress bar */}
        {!showResults && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t('toolsInternal.mentalHealthCoach.question')} {currentQuestion + 1} {t('toolsInternal.mentalHealthCoach.of')} {epdsQuestions.length}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {!showResults ? (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <Card className="overflow-hidden border-border/40">
                <CardContent className="p-5">
                  <div className="text-center mb-5">
                    <span className="text-3xl mb-2 block">{epdsQuestions[currentQuestion].icon}</span>
                    <h3 className="text-base font-semibold leading-relaxed">
                      {t(epdsQuestions[currentQuestion].questionKey)}
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {epdsQuestions[currentQuestion].options.map((option, index) => {
                      const isSelected = answers[epdsQuestions[currentQuestion].id] === option.value;
                      return (
                        <motion.button
                          key={index}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswer(epdsQuestions[currentQuestion].id, option.value)}
                          className={`w-full p-3.5 text-sm text-start rounded-xl border transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary/10 text-primary font-medium' 
                              : 'border-border/60 hover:border-primary/50 hover:bg-primary/5'
                          }`}
                        >
                          {t(option.labelKey)}
                        </motion.button>
                      );
                    })}
                  </div>

                  {currentQuestion > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goBack}
                      className="mt-4 gap-1.5 text-muted-foreground"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      {t('toolsInternal.mentalHealthCoach.previousQuestion')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            {/* Score card with ring */}
            <Card className={`bg-gradient-to-br ${config.bg} ${config.border} overflow-hidden`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-5">
                  {/* Score ring */}
                  <div className="relative flex-shrink-0">
                    <svg width={ringSize} height={ringSize} className="-rotate-90">
                      <circle
                        cx={ringSize / 2}
                        cy={ringSize / 2}
                        r={ringRadius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={ringStroke}
                        className="text-muted/20"
                      />
                      <motion.circle
                        cx={ringSize / 2}
                        cy={ringSize / 2}
                        r={ringRadius}
                        fill="none"
                        strokeWidth={ringStroke}
                        strokeLinecap="round"
                        className={config.ringColor}
                        strokeDasharray={ringCircumference}
                        initial={{ strokeDashoffset: ringCircumference }}
                        animate={{ strokeDashoffset: ringOffset }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-2xl font-bold ${config.color}`}>{score}</span>
                      <span className="text-[10px] text-muted-foreground">/ {maxScore}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-lg">{config.emoji}</span>
                      <h3 className={`text-lg font-bold ${config.color}`}>
                        {t(`toolsInternal.mentalHealthCoach.riskLevels.${level}.title`)}
                      </h3>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {t(`toolsInternal.mentalHealthCoach.riskLevels.${level}.message`)}
                    </p>
                  </div>
                </div>

                {/* Score breakdown bars */}
                <div className="mt-4 pt-4 border-t border-border/30">
                  <p className="text-xs font-medium text-muted-foreground mb-2.5">
                    {t('toolsInternal.mentalHealthCoach.responseBreakdown')}
                  </p>
                  <div className="grid grid-cols-10 gap-1">
                    {epdsQuestions.map((q, i) => {
                      const val = answers[q.id] ?? 0;
                      const barColors = ['bg-emerald-400', 'bg-amber-400', 'bg-orange-400', 'bg-rose-400'];
                      return (
                        <div key={i} className="flex flex-col items-center gap-0.5">
                          <div className="w-full h-8 bg-muted/30 rounded-sm relative overflow-hidden">
                            <motion.div
                              className={`absolute bottom-0 w-full rounded-sm ${barColors[val]}`}
                              initial={{ height: 0 }}
                              animate={{ height: `${(val / 3) * 100}%` }}
                              transition={{ duration: 0.5, delay: 0.5 + i * 0.05 }}
                            />
                          </div>
                          <span className="text-[8px] text-muted-foreground">{i + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Personalized Plan */}
            <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50 dark:border-violet-800/50 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5 text-violet-500" />
                    {t('toolsInternal.mentalHealthCoach.aiPersonalizedPlan')}
                  </h3>
                </div>
                
                {!showAICoping ? (
                  <Button
                    onClick={getAICopingPlan}
                    disabled={aiLoading}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 gap-2"
                  >
                    {aiLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4" />
                    )}
                    {t('toolsInternal.mentalHealthCoach.generateMyPlan')}
                  </Button>
                ) : (
                  <div className="bg-white/50 dark:bg-black/20 rounded-xl p-4 max-h-[500px] overflow-y-auto">
                    {aiCopingPlan ? (
                      <>
                        <MarkdownRenderer content={aiCopingPlan} />
                        {!aiLoading && (
                          <Button
                            onClick={handleExportPDF}
                            variant="outline"
                            disabled={isExportingPDF}
                            className="w-full mt-4 border-violet-300 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 disabled:opacity-70 gap-2"
                          >
                            {isExportingPDF ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <FileDown className="w-4 h-4" />
                            )}
                            {isExportingPDF ? t('common.exporting', 'Exporting...') : t('common.downloadPDF', 'Download PDF')}
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        {t('toolsInternal.mentalHealthCoach.creatingPlan')}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Coping strategies */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{t('toolsInternal.mentalHealthCoach.dailyCopingStrategies')}</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {copingStrategyKeys.map((strategy, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-3 bg-muted/50 rounded-xl overflow-hidden"
                    >
                      <div className="text-xl mb-1">{strategy.icon}</div>
                      <h4 className="font-medium text-xs mb-0.5 truncate">{t(strategy.titleKey)}</h4>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{t(strategy.descKey)}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Retake button */}
            <Button onClick={resetScreening} variant="outline" className="w-full gap-2">
              <RotateCcw className="w-3.5 h-3.5" />
              {t('toolsInternal.mentalHealthCoach.takeScreeningAgain')}
            </Button>
          </motion.div>
        )}

        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">
            {t('toolsInternal.mentalHealthCoach.screeningDisclaimer')}
          </p>
        </div>

        <VideoLibrary
          videosByLang={mentalHealthVideos}
          title={t('toolsInternal.mentalHealthCoach.mentalWellnessVideos')}
          subtitle={t('toolsInternal.mentalHealthCoach.videosSubtitle')}
          accentColor="rose"
        />
      </div>
    </ToolFrame>
  );
}
