import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, HelpCircle, Brain, Sun, Loader2, Sparkles, ArrowRight, ArrowLeft, RotateCcw, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoLibrary } from '@/components/VideoLibrary';
import { useSmartInsight } from '@/hooks/useSmartInsight';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { AIResponseFrame } from '@/components/ai/AIResponseFrame';
import { AIActionButton } from '@/components/ai/AIActionButton';
import { mentalHealthVideosByLang } from '@/data/videoData';
import { PrintableReport } from '@/components/PrintableReport';
import { useAIUsage } from '@/contexts/AIUsageContext';
import { useNavigate } from 'react-router-dom';
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
  { id: '2', icon: '🌟', questionKey: 'toolsInternal.mentalHealthCoach.epds.q2.question', options: [ { labelKey: 'toolsInternal.mentalHealthCoach.epds.q2.o0', value: 0 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q2.o1', value: 1 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q2.o2', value: 2 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q2.o3', value: 3 } ] },
  { id: '3', icon: '💭', questionKey: 'toolsInternal.mentalHealthCoach.epds.q3.question', options: [ { labelKey: 'toolsInternal.mentalHealthCoach.epds.q3.o0', value: 0 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q3.o1', value: 1 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q3.o2', value: 2 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q3.o3', value: 3 } ] },
  { id: '4', icon: '😰', questionKey: 'toolsInternal.mentalHealthCoach.epds.q4.question', options: [ { labelKey: 'toolsInternal.mentalHealthCoach.epds.q4.o0', value: 0 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q4.o1', value: 1 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q4.o2', value: 2 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q4.o3', value: 3 } ] },
  { id: '5', icon: '😢', questionKey: 'toolsInternal.mentalHealthCoach.epds.q5.question', options: [ { labelKey: 'toolsInternal.mentalHealthCoach.epds.q5.o0', value: 0 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q5.o1', value: 1 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q5.o2', value: 2 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q5.o3', value: 3 } ] },
  { id: '6', icon: '😓', questionKey: 'toolsInternal.mentalHealthCoach.epds.q6.question', options: [ { labelKey: 'toolsInternal.mentalHealthCoach.epds.q6.o0', value: 0 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q6.o1', value: 1 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q6.o2', value: 2 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q6.o3', value: 3 } ] },
  { id: '7', icon: '😴', questionKey: 'toolsInternal.mentalHealthCoach.epds.q7.question', options: [ { labelKey: 'toolsInternal.mentalHealthCoach.epds.q7.o0', value: 0 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q7.o1', value: 1 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q7.o2', value: 2 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q7.o3', value: 3 } ] },
  { id: '8', icon: '💔', questionKey: 'toolsInternal.mentalHealthCoach.epds.q8.question', options: [ { labelKey: 'toolsInternal.mentalHealthCoach.epds.q8.o0', value: 0 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q8.o1', value: 1 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q8.o2', value: 2 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q8.o3', value: 3 } ] },
  { id: '9', icon: '😿', questionKey: 'toolsInternal.mentalHealthCoach.epds.q9.question', options: [ { labelKey: 'toolsInternal.mentalHealthCoach.epds.q9.o0', value: 0 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q9.o1', value: 1 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q9.o2', value: 2 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q9.o3', value: 3 } ] },
  { id: '10', icon: '⚠️', questionKey: 'toolsInternal.mentalHealthCoach.epds.q10.question', options: [ { labelKey: 'toolsInternal.mentalHealthCoach.epds.q10.o0', value: 0 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q10.o1', value: 1 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q10.o2', value: 2 }, { labelKey: 'toolsInternal.mentalHealthCoach.epds.q10.o3', value: 3 } ] },
];

export default function PostpartumMentalHealthCoach() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const isRTL = lang === 'ar';
  const questions = useMemo(getEpdsQuestions, []);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [direction, setDirection] = useState(1);

  const { generate, isLoading: aiLoading, content: aiCopingPlan } = useSmartInsight({
    section: 'mental-wellbeing',
    toolType: 'mental-health',
  });
  const { isLimitReached } = useAIUsage();
  const navigate = useNavigate();
  const [showAICoping, setShowAICoping] = useState(false);

  const maxScore = questions.length * 3;
  const getScore = () => Object.values(answers).reduce((sum, v) => sum + v, 0);
  const getRiskLevel = (score: number) => score <= 8 ? 'low' : score <= 12 ? 'moderate' : 'high';

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, [questions[currentQuestion].id]: value }));
    if (currentQuestion < questions.length - 1) {
      setDirection(1);
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

  const buildAnswersSummary = () => {
    return questions.map((q, i) => {
      const answerValue = answers[q.id];
      const selectedOption = q.options.find(o => o.value === answerValue);
      const questionText = t(q.questionKey);
      const answerText = selectedOption ? t(selectedOption.labelKey) : '—';
      return `Q${i + 1}: ${questionText} → ${answerText} (${answerValue}/3)`;
    }).join('\n');
  };

  const getAICopingPlan = async () => {
    setShowAICoping(true);
    const score = getScore();
    const level = getRiskLevel(score);
    const answersSummary = buildAnswersSummary();

    const detailedContext = `
Postpartum Mood Wellness Self-Check Results (EPDS-based):
Total Score: ${score}/${maxScore} (${level} risk level)

Individual Answers:
${answersSummary}
`;

    const prompts: Record<string, string> = {
      en: `As a postpartum wellness guide, analyze these detailed self-check results and create a personalized coping plan:\n\n${detailedContext}\n\nBased on the specific areas where the mother scored higher, provide targeted advice. Include:\n1. Analysis of the key concern areas based on her specific answers\n2. Daily routines tailored to her struggles\n3. Self-care tips for her specific symptoms\n4. Breathing and relaxation exercises\n5. When to seek professional support\n6. Partner/family support suggestions\n7. Baby bonding activities that may help`,
      ar: `بصفتك مرشدة صحية متخصصة في فترة ما بعد الولادة، حللي نتائج الفحص التالية وأنشئي خطة تكيف مخصصة:\n\n${detailedContext}\n\nبناءً على المجالات التي سجلت فيها الأم درجات أعلى، قدمي نصائح موجهة.`,
      de: `Als postpartale Wellness-Beraterin, analysiere diese Selbstcheck-Ergebnisse und erstelle einen personalisierten Bewältigungsplan:\n\n${detailedContext}`,
      fr: `En tant que guide bien-être postnatal, analysez ces résultats de dépistage et créez un plan personnalisé:\n\n${detailedContext}`,
      es: `Como guía de bienestar posparto, analiza estos resultados de evaluación y crea un plan personalizado:\n\n${detailedContext}`,
      pt: `Como guia de bem-estar pós-parto, analise estes resultados de rastreio e crie um plano personalizado:\n\n${detailedContext}`,
      tr: `Doğum sonrası sağlık rehberi olarak, bu tarama sonuçlarını analiz edin ve kişiselleştirilmiş bir başa çıkma planı oluşturun:\n\n${detailedContext}`,
    };

    await generate({
      prompt: prompts[lang] || prompts.en,
      context: { language: lang },
    });
  };

  const resetAll = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setShowAICoping(false);
    setDirection(1);
  };

  const videoData = mentalHealthVideosByLang(t);
  const videos = videoData[lang] || videoData.en;

  if (showResults) {
    const score = getScore();
    const level = getRiskLevel(score);
    const riskConfig = {
      low: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200' },
      moderate: { icon: HelpCircle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200' },
      high: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200' },
    };
    const config = riskConfig[level];
    const Icon = config.icon;

    return (
      <ToolFrame title={t('toolsInternal.mentalHealthCoach.title')} subtitle={t('toolsInternal.mentalHealthCoach.subtitle')} icon={Brain} mood="calm" toolId="postpartum-mental-health">
        <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <MedicalDisclaimer toolName="mentalHealthCoach" onAccept={() => {}} />

          <Card className={`${config.border} ${config.bg}`}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${config.bg}`}>
                  <Icon className={`w-6 h-6 ${config.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold ${config.color}`}>
                    {t(`toolsInternal.mentalHealthCoach.riskLevels.${level}.title`)}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t('toolsInternal.mentalHealthCoach.score')}: {score}/{maxScore}
                  </p>
                </div>
              </div>

              <p className="text-sm">
                {t(`toolsInternal.mentalHealthCoach.riskLevels.${level}.message`)}
              </p>

              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${level === 'low' ? 'bg-emerald-500' : level === 'moderate' ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, (score / maxScore) * 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-500" />
                <h3 className="font-semibold text-sm">
                  {t('toolsInternal.mentalHealthCoach.aiPersonalizedPlan')}
                </h3>
              </div>
              
              {!showAICoping ? (
                <AIActionButton
                  onClick={getAICopingPlan}
                  isLoading={aiLoading}
                  label={t('toolsInternal.mentalHealthCoach.generateMyPlan')}
                  loadingLabel={t('toolsInternal.mentalHealthCoach.generating', 'Generating...')}
                  icon={Brain}
                  toolType="mental-health"
                  section="mental-wellbeing"
                />
              ) : (
                <div className="max-h-[500px] overflow-y-auto">
                  {aiCopingPlan ? (
                    <PrintableReport title={t('toolsInternal.mentalHealthCoach.title')} isLoading={aiLoading}>
                      <AIResponseFrame
                        content={aiCopingPlan}
                        title={t('toolsInternal.mentalHealthCoach.title')}
                        icon={Brain}
                        toolId="postpartum-mental-health"
                      />
                    </PrintableReport>
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

          <Button onClick={resetAll} variant="outline" className="w-full gap-2">
            <RotateCcw className="w-4 h-4" /> {t('toolsInternal.mentalHealthCoach.takeScreeningAgain')}
          </Button>

          {videos.length > 0 && <VideoLibrary videos={videos} title={t('toolsInternal.mentalHealthCoach.mentalWellnessVideos')} />}
        </div>
      </ToolFrame>
    );
  }

  // Questionnaire UI
  const q = questions[currentQuestion];

  return (
    <ToolFrame title={t('toolsInternal.mentalHealthCoach.title')} subtitle={t('toolsInternal.mentalHealthCoach.subtitle')} icon={Brain} mood="calm" toolId="postpartum-mental-health">
      <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <MedicalDisclaimer toolName="mentalHealthCoach" onAccept={() => {}} />

        <div className="flex items-center gap-2 px-1">
          <div className="flex-1 bg-muted rounded-full h-2">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
              initial={false}
              animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium">{currentQuestion + 1}/{questions.length}</span>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion}
            custom={direction}
            initial={{ x: direction * 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -50, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="text-center">
                  <h3 className="text-sm font-semibold">{t(q.questionKey)}</h3>
                </div>

                <div className="space-y-2">
                  {q.options.map((option, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleAnswer(option.value)}
                      className={`w-full text-start p-3 rounded-xl border transition-all text-sm ${
                        answers[q.id] === option.value
                          ? 'border-violet-400 bg-violet-50 dark:bg-violet-950/30'
                          : 'border-border hover:border-violet-200 hover:bg-violet-50/50 dark:hover:bg-violet-950/10'
                      }`}
                    >
                      {t(option.labelKey)}
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2">
          {currentQuestion > 0 && (
            <Button variant="outline" onClick={goBack} className="gap-1">
              {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {t('common.back')}
            </Button>
          )}
        </div>
      </div>
    </ToolFrame>
  );
}
