import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, AlertTriangle, Phone, CheckCircle, HelpCircle, Brain, MessageCircle, Sun, Loader2, Sparkles } from 'lucide-react';
import { VideoLibrary } from '@/components/VideoLibrary';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { mentalHealthVideosByLang } from '@/data/videoData';

interface ScreeningQuestion {
  id: string;
  questionKey: string;
  options: { labelKey: string; value: number }[];
}

const getEpdsQuestions = (t: any): ScreeningQuestion[] => [
  {
    id: '1',
    questionKey: 'toolsInternal.mentalHealthCoach.epds.q1.question',
    options: [
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q1.o0', value: 0 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q1.o1', value: 1 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q1.o2', value: 2 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q1.o3', value: 3 }
    ]
  },
  {
    id: '2',
    questionKey: 'toolsInternal.mentalHealthCoach.epds.q2.question',
    options: [
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q2.o0', value: 0 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q2.o1', value: 1 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q2.o2', value: 2 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q2.o3', value: 3 }
    ]
  },
  {
    id: '3',
    questionKey: 'toolsInternal.mentalHealthCoach.epds.q3.question',
    options: [
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q3.o0', value: 0 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q3.o1', value: 1 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q3.o2', value: 2 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q3.o3', value: 3 }
    ]
  },
  {
    id: '4',
    questionKey: 'toolsInternal.mentalHealthCoach.epds.q4.question',
    options: [
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q4.o0', value: 0 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q4.o1', value: 1 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q4.o2', value: 2 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q4.o3', value: 3 }
    ]
  },
  {
    id: '5',
    questionKey: 'toolsInternal.mentalHealthCoach.epds.q5.question',
    options: [
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q5.o0', value: 0 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q5.o1', value: 1 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q5.o2', value: 2 },
      { labelKey: 'toolsInternal.mentalHealthCoach.epds.q5.o3', value: 3 }
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

export default function PostpartumMentalHealthCoach() {
  const { t } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [aiCopingPlan, setAiCopingPlan] = useState('');
  const [showAICoping, setShowAICoping] = useState(false);
  
  const { streamChat, isLoading: aiLoading } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setAiCopingPlan('');
    setShowAICoping(false);
  });
  
  const epdsQuestions = getEpdsQuestions(t);
  const mentalHealthVideos = mentalHealthVideosByLang(t);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    if (currentQuestion < epdsQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
      checkEmergency();
    }
  };

  const checkEmergency = () => {
    const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
    if (totalScore >= 13) {
      setShowEmergency(true);
    }
  };

  const getScore = () => {
    return Object.values(answers).reduce((sum, val) => sum + val, 0);
  };

  const getScoreInterpretation = () => {
    const score = getScore();
    if (score <= 8) {
      return {
        level: 'Low Risk',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        message: 'Your responses suggest you\'re coping well. Continue practicing self-care.',
        icon: CheckCircle
      };
    } else if (score <= 12) {
      return {
        level: 'Moderate',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        message: 'Consider speaking with your healthcare provider about how you\'re feeling.',
        icon: HelpCircle
      };
    } else {
      return {
        level: 'Seek Support',
        color: 'text-destructive',
        bg: 'bg-destructive/10',
        message: 'Please reach out to your healthcare provider or a mental health professional.',
        icon: AlertTriangle
      };
    }
  };

  const resetScreening = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setShowEmergency(false);
    setAiCopingPlan('');
    setShowAICoping(false);
  };

  const getAICopingPlan = async () => {
    const score = getScore();
    const interpretation = getScoreInterpretation();
    
    setShowAICoping(true);
    setAiCopingPlan('');

    const prompt = `As a compassionate postpartum mental health specialist, create a personalized coping plan:

**EPDS Screening Score:** ${score}/15
**Risk Level:** ${interpretation.level}
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

  return (
    <ToolFrame
      title={t('toolsInternal.mentalHealthCoach.title')}
      subtitle={t('toolsInternal.mentalHealthCoach.subtitle')}
      customIcon="health-shield"
      mood="nurturing"
      toolId="mental-health-coach"
    >
      <div className="space-y-6">
          {showEmergency && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-8 h-8 text-destructive flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-destructive text-lg mb-2">
                      💙 {t('toolsInternal.mentalHealthCoach.youreNotAlone')}
                    </h3>
                    <p className="text-sm text-foreground mb-4">
                      {t('toolsInternal.mentalHealthCoach.emergencyMessage')}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        variant="destructive"
                        onClick={() => window.open('tel:1-800-944-4773', '_self')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        {t('toolsInternal.mentalHealthCoach.postpartumSupport')}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => window.open('tel:988', '_self')}
                      >
                        {t('toolsInternal.mentalHealthCoach.crisisHotline')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!showResults ? (
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">
                      {t('toolsInternal.mentalHealthCoach.question')} {currentQuestion + 1} {t('toolsInternal.mentalHealthCoach.of')} {epdsQuestions.length}
                    </span>
                    <div className="flex gap-1">
                      {epdsQuestions.map((_, i) => (
                        <div 
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < currentQuestion ? 'bg-primary' :
                            i === currentQuestion ? 'bg-primary/50' :
                            'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-6">
                    {t(epdsQuestions[currentQuestion].questionKey)}
                  </h3>

                  <div className="space-y-3">
                    {epdsQuestions[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(epdsQuestions[currentQuestion].id, option.value)}
                        className="w-full p-4 text-left rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all"
                      >
                        {t(option.labelKey)}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className={getScoreInterpretation().bg}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {React.createElement(getScoreInterpretation().icon, {
                      className: `w-8 h-8 ${getScoreInterpretation().color}`
                    })}
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold ${getScoreInterpretation().color} mb-2`}>
                        {t(`toolsInternal.mentalHealthCoach.riskLevels.${getScoreInterpretation().level === 'Low Risk' ? 'low' : getScoreInterpretation().level === 'Moderate' ? 'moderate' : 'high'}.title`)}
                      </h3>
                      <p className="text-sm text-foreground mb-4">
                        {t('toolsInternal.mentalHealthCoach.score')}: {getScore()} / {epdsQuestions.length * 3}
                      </p>
                      <p className="text-foreground">
                        {t(`toolsInternal.mentalHealthCoach.riskLevels.${getScoreInterpretation().level === 'Low Risk' ? 'low' : getScoreInterpretation().level === 'Moderate' ? 'moderate' : 'high'}.message`)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-violet-500" />
                      {t('toolsInternal.mentalHealthCoach.aiPersonalizedPlan')}
                    </h3>
                  </div>
                  
                  {!showAICoping ? (
                    <Button
                      onClick={getAICopingPlan}
                      disabled={aiLoading}
                      className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                    >
                      {aiLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Brain className="w-4 h-4 mr-2" />
                      )}
                      {t('toolsInternal.mentalHealthCoach.generateMyPlan')}
                    </Button>
                  ) : (
                    <div className="bg-white/50 dark:bg-black/20 rounded-xl p-4 max-h-[500px] overflow-y-auto">
                      {aiCopingPlan ? (
                        <MarkdownRenderer content={aiCopingPlan} />
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

              <Card>
                <CardContent className="p-4">
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <Sun className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">{t('toolsInternal.mentalHealthCoach.dailyCopingStrategies')}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {copingStrategyKeys.map((strategy, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-xl overflow-hidden">
                        <div className="text-xl mb-1">{strategy.icon}</div>
                        <h4 className="font-medium text-xs sm:text-sm mb-0.5 truncate">{t(strategy.titleKey)}</h4>
                        <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{t(strategy.descKey)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    {t('toolsInternal.mentalHealthCoach.supportResources')}
                  </h3>
                  <div className="space-y-3">
                    <a 
                      href="tel:1-800-944-4773"
                      className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                    >
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">{t('toolsInternal.mentalHealthCoach.psiName')}</div>
                        <div className="text-sm text-muted-foreground">{t('toolsInternal.mentalHealthCoach.psiNumber')}</div>
                      </div>
                    </a>
                    <a 
                      href="tel:988"
                      className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                    >
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">{t('toolsInternal.mentalHealthCoach.crisisLinelineName')}</div>
                        <div className="text-sm text-muted-foreground">{t('toolsInternal.mentalHealthCoach.crisisLinelineDesc')}</div>
                      </div>
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={resetScreening} variant="outline" className="w-full">
                {t('toolsInternal.mentalHealthCoach.takeScreeningAgain')}
              </Button>
            </>
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
