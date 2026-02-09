import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, CheckCircle, AlertTriangle, Clock, Play, RefreshCw, Brain, Loader2 } from 'lucide-react';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useTranslation } from 'react-i18next';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';

interface PostureExercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  steps: string[];
  benefits: string[];
  trimester: number[];
}

const postureExercises: PostureExercise[] = [
  {
    id: 'wall-stand',
    name: 'Wall Stand Check',
    description: 'Align your spine against a wall to check and improve posture',
    duration: 60,
    steps: [
      'Stand with your back against a wall',
      'Heels should be 2-4 inches from the wall',
      'Touch your buttocks, shoulder blades, and head to the wall',
      'Hold this position and breathe deeply',
      'Step away and try to maintain this posture',
    ],
    benefits: ['Improves spine alignment', 'Reduces back pain', 'Builds awareness'],
    trimester: [1, 2, 3],
  },
  {
    id: 'chin-tuck',
    name: 'Chin Tucks',
    description: 'Strengthen neck muscles and reduce forward head posture',
    duration: 45,
    steps: [
      'Sit or stand with your spine straight',
      'Look straight ahead',
      'Gently pull your chin back (like making a double chin)',
      'Hold for 5 seconds',
      'Repeat 10 times',
    ],
    benefits: ['Reduces neck strain', 'Prevents headaches', 'Improves head position'],
    trimester: [1, 2, 3],
  },
  {
    id: 'shoulder-rolls',
    name: 'Shoulder Rolls',
    description: 'Release tension and improve upper body posture',
    duration: 30,
    steps: [
      'Sit or stand comfortably',
      'Roll shoulders up toward your ears',
      'Roll them back and down in a circular motion',
      'Repeat 10 times forward',
      'Repeat 10 times backward',
    ],
    benefits: ['Releases shoulder tension', 'Improves circulation', 'Easy to do anywhere'],
    trimester: [1, 2, 3],
  },
  {
    id: 'pelvic-tilt-standing',
    name: 'Standing Pelvic Tilts',
    description: 'Support lower back and maintain proper pelvic alignment',
    duration: 60,
    steps: [
      'Stand with feet hip-width apart',
      'Bend knees slightly',
      'Tuck your pelvis under gently',
      'Hold for 5 seconds',
      'Release and repeat 10 times',
    ],
    benefits: ['Supports lower back', 'Reduces lumbar strain', 'Strengthens core'],
    trimester: [1, 2, 3],
  },
  {
    id: 'seated-twist',
    name: 'Gentle Seated Twist',
    description: 'Maintain spine mobility and release tension',
    duration: 45,
    steps: [
      'Sit on a chair with feet flat on floor',
      'Place right hand on left knee',
      'Gently twist to the left',
      'Hold for 15-30 seconds',
      'Repeat on the other side',
    ],
    benefits: ['Maintains spine mobility', 'Reduces stiffness', 'Gentle stretch'],
    trimester: [1, 2],
  },
];

export default function AIPostureCoach() {
  const { t } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentTrimester, setCurrentTrimester] = useState(2);
  const [activeExercise, setActiveExercise] = useState<PostureExercise | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [showAIAdvice, setShowAIAdvice] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  
  const { streamChat, isLoading, error } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setAiResponse('');
  });

  useEffect(() => {
    const saved = localStorage.getItem('postureCompletedToday');
    const savedDate = localStorage.getItem('postureLastDate');
    const today = new Date().toDateString();
    
    if (savedDate === today && saved) {
      setCompletedToday(JSON.parse(saved));
    } else {
      localStorage.setItem('postureLastDate', today);
      localStorage.setItem('postureCompletedToday', '[]');
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && activeExercise && isActive) {
      setIsActive(false);
      if (!completedToday.includes(activeExercise.id)) {
        const updated = [...completedToday, activeExercise.id];
        setCompletedToday(updated);
        localStorage.setItem('postureCompletedToday', JSON.stringify(updated));
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining, activeExercise, completedToday]);

  const startExercise = (exercise: PostureExercise) => {
    setActiveExercise(exercise);
    setTimeRemaining(exercise.duration);
    setIsActive(true);
  };

  const filteredExercises = postureExercises.filter(e => e.trimester.includes(currentTrimester));

  const getAIPostureAdvice = async () => {
    setShowAIAdvice(true);
    setAiResponse('');
    
    const completedNames = completedToday.map(id => 
      postureExercises.find(e => e.id === id)?.name
    ).filter(Boolean);

    await streamChat({
      type: 'posture-coach' as any,
      messages: [
        {
          role: 'user',
          content: `I'm in trimester ${currentTrimester} of my pregnancy. Today I completed these posture exercises: ${completedNames.join(', ') || 'none yet'}. Total exercises available: ${filteredExercises.length}. Give me personalized posture improvement advice.`
        }
      ],
      context: { trimester: currentTrimester },
      onDelta: (text) => setAiResponse(prev => prev + text),
      onDone: () => {}
    });
  };

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName={t('toolsInternal.postureCoach.title', 'AI Posture Coach')}
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title={t('toolsInternal.postureCoach.title', 'AI Posture Coach')}
      subtitle={t('toolsInternal.postureCoach.subtitle', 'Improve pregnancy posture to reduce back pain and discomfort')}
      icon={User}
      mood="empowering"
      toolId="ai-posture-coach"
    >
      <div className="space-y-6">
        {/* Trimester Selector */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('toolsInternal.postureCoach.yourTrimester', 'Your Trimester')}</h3>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((tm) => (
                <button
                  key={tm}
                  onClick={() => setCurrentTrimester(tm)}
                  className={`py-3 rounded-lg font-semibold transition-all ${
                    currentTrimester === tm
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {t('common.trimester', 'Trimester')} {tm}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress + AI Button */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{t('toolsInternal.postureCoach.todaysProgress', "Today's Progress")}</h3>
              <span className="text-primary font-bold">
                {completedToday.length}/{filteredExercises.length}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full mb-4">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(completedToday.length / filteredExercises.length) * 100}%` }}
              />
            </div>
            <Button 
              onClick={getAIPostureAdvice} 
              disabled={isLoading}
              className="w-full gap-2"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              {t('toolsInternal.postureCoach.getAIAdvice', 'Get AI Posture Advice')}
            </Button>
          </CardContent>
        </Card>

        {/* AI Response */}
        {showAIAdvice && aiResponse && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">{t('toolsInternal.postureCoach.aiPostureCoach', 'AI Posture Coach')}</h3>
              </div>
              <MarkdownRenderer content={aiResponse} />
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-destructive text-sm">
              {error}
            </CardContent>
          </Card>
        )}

        {/* Active Exercise */}
        {activeExercise && isActive && (
          <Card className="border-primary">
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-bold mb-2">{activeExercise.name}</h3>
              <div className="text-2xl font-bold text-primary mb-4">
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </div>
              <div className="space-y-2 text-left bg-muted/50 p-4 rounded-lg">
                {activeExercise.steps.map((step, i) => (
                  <p key={i} className="text-sm flex items-start gap-2">
                    <span className="text-primary font-bold">{i + 1}.</span>
                    {step}
                  </p>
                ))}
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsActive(false)}
                className="mt-4"
              >
                {t('common.stop', 'Stop')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Exercise List */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">{t('toolsInternal.postureCoach.postureExercises', 'Posture Exercises')}</h3>
            <div className="space-y-3">
              {filteredExercises.map((exercise) => {
                const isCompleted = completedToday.includes(exercise.id);
                return (
                  <div
                    key={exercise.id}
                    className={`p-4 rounded-lg transition-all ${
                      isCompleted ? 'bg-green-500/10 border border-green-500/20' : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                          )}
                          <span className="font-semibold">{exercise.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 ml-7">
                          {exercise.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 ml-7">
                          <span className="text-xs flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {exercise.duration}s
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {exercise.benefits.slice(0, 2).map((b, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                {b}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isCompleted ? 'outline' : 'default'}
                        onClick={() => startExercise(exercise)}
                        disabled={isActive}
                      >
                        {isCompleted ? <RefreshCw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>
    </ToolFrame>
  );
}