import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock, Play, CheckCircle, RotateCcw, Bell, AlertCircle, Brain, Loader2, RotateCw, Hand, ArrowUp, Zap, Activity, Circle, Footprints, Wind } from 'lucide-react';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { ExerciseIcon } from '@/components/ExerciseIcon';

interface Stretch {
  id: string;
  name: string;
  duration: number;
  description: string;
  icon: string;
  bodyPart: string;
}

const stretches: Stretch[] = [
  { id: '1', name: 'Neck Rolls', duration: 30, description: 'Gently roll your head in circles', icon: 'neck', bodyPart: 'Neck' },
  { id: '2', name: 'Shoulder Shrugs', duration: 20, description: 'Raise shoulders to ears, then release', icon: 'shoulders', bodyPart: 'Shoulders' },
  { id: '3', name: 'Wrist Circles', duration: 20, description: 'Rotate wrists in both directions', icon: 'wrists', bodyPart: 'Wrists' },
  { id: '4', name: 'Side Stretch', duration: 30, description: 'Reach arm overhead and lean to side', icon: 'back', bodyPart: 'Back' },
  { id: '5', name: 'Cat-Cow', duration: 45, description: 'Alternate arching and rounding back', icon: 'spine', bodyPart: 'Spine' },
  { id: '6', name: 'Hip Circles', duration: 30, description: 'Stand and rotate hips in circles', icon: 'hips', bodyPart: 'Hips' },
  { id: '7', name: 'Calf Raises', duration: 30, description: 'Rise up on toes, then lower', icon: 'legs', bodyPart: 'Legs' },
  { id: '8', name: 'Deep Breathing', duration: 60, description: 'Slow, deep breaths with hands on belly', icon: 'breathing', bodyPart: 'Relaxation' },
];

export default function SmartStretchReminder() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [activeStretch, setActiveStretch] = useState<Stretch | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completedStretches, setCompletedStretches] = useState<string[]>([]);
  const [lastStretchTime, setLastStretchTime] = useState<Date | null>(null);
  const [showAIAdvice, setShowAIAdvice] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [currentTrimester, setCurrentTrimester] = useState(2);

  const { streamChat, isLoading, error } = usePregnancyAI();

  useEffect(() => {
    const saved = localStorage.getItem('stretchCompletedToday');
    const savedDate = localStorage.getItem('stretchLastDate');
    const today = new Date().toDateString();
    
    if (savedDate === today && saved) {
      setCompletedStretches(JSON.parse(saved));
    } else {
      localStorage.setItem('stretchLastDate', today);
      localStorage.setItem('stretchCompletedToday', '[]');
    }

    const lastTime = localStorage.getItem('lastStretchTime');
    if (lastTime) setLastStretchTime(new Date(lastTime));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && activeStretch && isActive) {
      completeStretch();
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining, activeStretch]);

  const startStretch = (stretch: Stretch) => {
    setActiveStretch(stretch);
    setTimeRemaining(stretch.duration);
    setIsActive(true);
  };

  const completeStretch = () => {
    if (activeStretch && !completedStretches.includes(activeStretch.id)) {
      const updated = [...completedStretches, activeStretch.id];
      setCompletedStretches(updated);
      localStorage.setItem('stretchCompletedToday', JSON.stringify(updated));
    }
    setIsActive(false);
    setLastStretchTime(new Date());
    localStorage.setItem('lastStretchTime', new Date().toISOString());
  };

  const startQuickRoutine = () => {
    const incompleteStretches = stretches.filter(s => !completedStretches.includes(s.id));
    if (incompleteStretches.length > 0) {
      startStretch(incompleteStretches[0]);
    }
  };

  const getTimeSinceLastStretch = () => {
    if (!lastStretchTime) return 'No stretches yet today';
    const diff = Date.now() - lastStretchTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    return `${minutes}m ago`;
  };

  const getAIStretchAdvice = async () => {
    setShowAIAdvice(true);
    setAiResponse('');

    const completedNames = completedStretches.map(id => 
      stretches.find(s => s.id === id)?.name
    ).filter(Boolean);

    const bodyParts = completedStretches.map(id =>
      stretches.find(s => s.id === id)?.bodyPart
    ).filter(Boolean);

    await streamChat({
      type: 'stretch-reminder' as any,
      messages: [
        {
          role: 'user',
          content: `I'm in trimester ${currentTrimester} of my pregnancy. Today I completed these stretches: ${completedNames.join(', ') || 'none yet'}. Body parts targeted: ${[...new Set(bodyParts)].join(', ') || 'none'}. Total available stretches: ${stretches.length}. Give me personalized stretching advice and recommendations for what to do next.`
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
        toolName="Smart Stretch Reminder"
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title="Smart Stretch Reminder"
      subtitle="Personalized stretching reminders to keep you comfortable"
      icon={Sparkles}
      mood="empowering"
      toolId="smart-stretch-reminder"
    >
      <div className="space-y-6">
        {/* Trimester Selector */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Your Trimester</h3>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((t) => (
                <button
                  key={t}
                  onClick={() => setCurrentTrimester(t)}
                  className={`py-2 rounded-lg font-semibold transition-all ${
                    currentTrimester === t
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  Trimester {t}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Today's Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {completedStretches.length}/{stretches.length} stretches done
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3" />
                  {getTimeSinceLastStretch()}
                </p>
              </div>
            </div>
            <div className="w-full h-2 bg-primary/20 rounded-full mt-3">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(completedStretches.length / stretches.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Start */}
        <div className="flex gap-2">
          <Button onClick={startQuickRoutine} className="flex-1 gap-2" size="lg" disabled={isActive}>
            <Play className="w-5 h-5" />
            Start Routine
          </Button>
          <Button onClick={getAIStretchAdvice} variant="outline" size="lg" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Brain className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* AI Response */}
        {showAIAdvice && aiResponse && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">AI Stretch Coach</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowAIAdvice(false)}>
                  Close
                </Button>
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

        {/* Active Stretch */}
        {activeStretch && isActive && (
          <Card className="border-2 border-primary">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <ExerciseIcon type={activeStretch.icon} className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{activeStretch.name}</h3>
              <p className="text-muted-foreground mb-4">{activeStretch.description}</p>
              <div className="text-5xl font-bold text-primary mb-4">
                {timeRemaining}
              </div>
              <p className="text-sm text-muted-foreground">seconds remaining</p>
              <Button variant="outline" onClick={() => setIsActive(false)} className="mt-4">
                Skip
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stretch List */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">All Stretches</h3>
            <div className="space-y-2">
              {stretches.map((stretch) => {
                const isCompleted = completedStretches.includes(stretch.id);
                return (
                  <button
                    key={stretch.id}
                    onClick={() => startStretch(stretch)}
                    disabled={isActive}
                    className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${
                      isCompleted 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ExerciseIcon type={stretch.icon} className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{stretch.name}</p>
                      <p className="text-xs text-muted-foreground">{stretch.duration}s • {stretch.bodyPart}</p>
                    </div>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    ) : (
                      <Play className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Stretch Reminders
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Stretch every 1-2 hours when sitting</li>
              <li>• Never force a stretch - go gently</li>
              <li>• Breathe deeply during each stretch</li>
              <li>• Stay hydrated for flexible muscles</li>
            </ul>
          </CardContent>
        </Card>

      </div>
    </ToolFrame>
  );
}
