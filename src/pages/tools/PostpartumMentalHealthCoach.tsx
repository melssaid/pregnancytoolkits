import React, { useState } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, AlertTriangle, Phone, CheckCircle, HelpCircle, Brain, MessageCircle, Sun, Loader2, Sparkles } from 'lucide-react';
import { VideoLibrary, Video } from '@/components/VideoLibrary';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
const mentalHealthVideos: Video[] = [
  { id: "1", title: "Understanding Postpartum Depression", description: "Signs, symptoms, and when to seek help", youtubeId: "qbMQwVJY_Jc", duration: "12:30", category: "Education" },
  { id: "2", title: "Self-Care Tips for New Moms", description: "Practical mental wellness strategies", youtubeId: "BHY0FxzoKZE", duration: "10:15", category: "Self-Care" },
  { id: "3", title: "Postpartum Anxiety Explained", description: "Coping with anxiety after birth", youtubeId: "7V8CRLYh0Vo", duration: "11:45", category: "Education" },
  { id: "4", title: "Mindfulness for New Parents", description: "Relaxation and breathing exercises", youtubeId: "inpok4MKVLM", duration: "15:00", category: "Relaxation" },
];

interface ScreeningQuestion {
  id: string;
  question: string;
  options: { label: string; value: number }[];
}

const epdsQuestions: ScreeningQuestion[] = [
  {
    id: '1',
    question: 'I have been able to laugh and see the funny side of things',
    options: [
      { label: 'As much as I always could', value: 0 },
      { label: 'Not quite so much now', value: 1 },
      { label: 'Definitely not so much now', value: 2 },
      { label: 'Not at all', value: 3 }
    ]
  },
  {
    id: '2',
    question: 'I have looked forward with enjoyment to things',
    options: [
      { label: 'As much as I ever did', value: 0 },
      { label: 'Rather less than I used to', value: 1 },
      { label: 'Definitely less than I used to', value: 2 },
      { label: 'Hardly at all', value: 3 }
    ]
  },
  {
    id: '3',
    question: 'I have blamed myself unnecessarily when things went wrong',
    options: [
      { label: 'No, never', value: 0 },
      { label: 'Not very often', value: 1 },
      { label: 'Yes, some of the time', value: 2 },
      { label: 'Yes, most of the time', value: 3 }
    ]
  },
  {
    id: '4',
    question: 'I have been anxious or worried for no good reason',
    options: [
      { label: 'No, not at all', value: 0 },
      { label: 'Hardly ever', value: 1 },
      { label: 'Yes, sometimes', value: 2 },
      { label: 'Yes, very often', value: 3 }
    ]
  },
  {
    id: '5',
    question: 'I have felt scared or panicky for no very good reason',
    options: [
      { label: 'No, not at all', value: 0 },
      { label: 'No, not much', value: 1 },
      { label: 'Yes, sometimes', value: 2 },
      { label: 'Yes, quite a lot', value: 3 }
    ]
  }
];

const copingStrategies = [
  { icon: '🌤️', title: 'Morning Sunlight', desc: 'Get 10-15 minutes of natural light each morning' },
  { icon: '🚶‍♀️', title: 'Gentle Movement', desc: 'A short walk can boost mood significantly' },
  { icon: '📞', title: 'Connect Daily', desc: 'Talk to a friend or family member each day' },
  { icon: '😴', title: 'Rest When Possible', desc: 'Sleep when baby sleeps, even briefly' },
  { icon: '🥗', title: 'Nourish Yourself', desc: 'Eat regular, nutritious meals' },
  { icon: '✍️', title: 'Journal', desc: 'Write down 3 things you\'re grateful for' }
];

export default function PostpartumMentalHealthCoach() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [aiCopingPlan, setAiCopingPlan] = useState('');
  const [showAICoping, setShowAICoping] = useState(false);
  
  const { streamChat, isLoading: aiLoading } = usePregnancyAI();

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
        toolName="Postpartum Mental Health Coach"
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title="Postpartum Mental Health Coach"
      subtitle="Edinburgh Postnatal Depression Scale screening"
      customIcon="health-shield"
      mood="nurturing"
      toolId="mental-health-coach"
    >
      <div className="space-y-6">
          {/* Emergency Alert */}
          {showEmergency && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-8 h-8 text-destructive flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-destructive text-lg mb-2">
                      💙 You're Not Alone
                    </h3>
                    <p className="text-sm text-foreground mb-4">
                      Based on your responses, it's important to talk to someone who can help. 
                      Postpartum depression is common and treatable.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        variant="destructive"
                        onClick={() => window.open('tel:1-800-944-4773', '_self')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Postpartum Support Intl.
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => window.open('tel:988', '_self')}
                      >
                        Call 988 Hotline
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Screening Questions */}
          {!showResults ? (
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">
                      Question {currentQuestion + 1} of {epdsQuestions.length}
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
                    {epdsQuestions[currentQuestion].question}
                  </h3>

                  <div className="space-y-3">
                    {epdsQuestions[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(epdsQuestions[currentQuestion].id, option.value)}
                        className="w-full p-4 text-left rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Results */}
              <Card className={getScoreInterpretation().bg}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {React.createElement(getScoreInterpretation().icon, {
                      className: `w-8 h-8 ${getScoreInterpretation().color}`
                    })}
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold ${getScoreInterpretation().color} mb-2`}>
                        {getScoreInterpretation().level}
                      </h3>
                      <p className="text-sm text-foreground mb-4">
                        Score: {getScore()} / {epdsQuestions.length * 3}
                      </p>
                      <p className="text-foreground">
                        {getScoreInterpretation().message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Personalized Coping Plan */}
              <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-violet-500" />
                      AI Personalized Coping Plan
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
                      Generate My Personalized Plan
                    </Button>
                  ) : (
                    <div className="bg-white/50 dark:bg-black/20 rounded-xl p-4 max-h-[500px] overflow-y-auto">
                      {aiCopingPlan ? (
                        <MarkdownRenderer content={aiCopingPlan} />
                      ) : (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Creating your personalized plan...
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Coping Strategies */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-primary" />
                    Daily Coping Strategies
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {copingStrategies.map((strategy, index) => (
                      <div key={index} className="p-4 bg-muted/50 rounded-xl">
                        <div className="text-2xl mb-2">{strategy.icon}</div>
                        <h4 className="font-medium text-sm mb-1">{strategy.title}</h4>
                        <p className="text-xs text-muted-foreground">{strategy.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Resources */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    Support Resources
                  </h3>
                  <div className="space-y-3">
                    <a 
                      href="tel:1-800-944-4773"
                      className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                    >
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">Postpartum Support International</div>
                        <div className="text-sm text-muted-foreground">1-800-944-4773</div>
                      </div>
                    </a>
                    <a 
                      href="tel:988"
                      className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                    >
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">988 Suicide & Crisis Lifeline</div>
                        <div className="text-sm text-muted-foreground">Call or text 988</div>
                      </div>
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={resetScreening} variant="outline" className="w-full">
                Take Screening Again
              </Button>
            </>
          )}

          {/* Important Note */}
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">
            ⚠️ This is a screening tool based on the Edinburgh Postnatal Depression Scale (EPDS). 
            It does not provide a diagnosis. Always consult with a healthcare professional for proper evaluation.
            </p>
          </div>

          {/* Educational Videos */}
          <VideoLibrary
            videos={mentalHealthVideos}
            title="Mental Wellness Videos"
            subtitle="Support and self-care resources"
            accentColor="rose"
          />
      </div>
    </ToolFrame>
  );
}
