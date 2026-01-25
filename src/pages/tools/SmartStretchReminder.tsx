import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock, Play, CheckCircle, RotateCcw, Bell, AlertCircle } from 'lucide-react';

interface Stretch {
  id: string;
  name: string;
  duration: number;
  description: string;
  icon: string;
  bodyPart: string;
}

const stretches: Stretch[] = [
  { id: '1', name: 'Neck Rolls', duration: 30, description: 'Gently roll your head in circles', icon: '🔄', bodyPart: 'Neck' },
  { id: '2', name: 'Shoulder Shrugs', duration: 20, description: 'Raise shoulders to ears, then release', icon: '💪', bodyPart: 'Shoulders' },
  { id: '3', name: 'Wrist Circles', duration: 20, description: 'Rotate wrists in both directions', icon: '🖐️', bodyPart: 'Wrists' },
  { id: '4', name: 'Side Stretch', duration: 30, description: 'Reach arm overhead and lean to side', icon: '🌈', bodyPart: 'Back' },
  { id: '5', name: 'Cat-Cow', duration: 45, description: 'Alternate arching and rounding back', icon: '🐱', bodyPart: 'Spine' },
  { id: '6', name: 'Hip Circles', duration: 30, description: 'Stand and rotate hips in circles', icon: '⭕', bodyPart: 'Hips' },
  { id: '7', name: 'Calf Raises', duration: 30, description: 'Rise up on toes, then lower', icon: '🦵', bodyPart: 'Legs' },
  { id: '8', name: 'Deep Breathing', duration: 60, description: 'Slow, deep breaths with hands on belly', icon: '🌬️', bodyPart: 'Relaxation' },
];

export default function SmartStretchReminder() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [activeStretch, setActiveStretch] = useState<Stretch | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completedStretches, setCompletedStretches] = useState<string[]>([]);
  const [lastStretchTime, setLastStretchTime] = useState<Date | null>(null);

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
        <Button onClick={startQuickRoutine} className="w-full gap-2" size="lg">
          <Play className="w-5 h-5" />
          Start Quick Stretch Routine
        </Button>

        {/* Active Stretch */}
        {activeStretch && isActive && (
          <Card className="border-2 border-primary">
            <CardContent className="p-6 text-center">
              <span className="text-6xl block mb-4">{activeStretch.icon}</span>
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
            <div className="grid grid-cols-2 gap-3">
              {stretches.map((stretch) => {
                const isCompleted = completedStretches.includes(stretch.id);
                return (
                  <button
                    key={stretch.id}
                    onClick={() => startStretch(stretch)}
                    disabled={isActive}
                    className={`p-4 rounded-lg text-center transition-all ${
                      isCompleted 
                        ? 'bg-green-500/10 border border-green-500/20' 
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <span className="text-3xl block mb-2">{stretch.icon}</span>
                    <p className="font-medium text-sm">{stretch.name}</p>
                    <p className="text-xs text-muted-foreground">{stretch.duration}s</p>
                    {isCompleted && (
                      <CheckCircle className="w-4 h-4 text-green-600 mx-auto mt-2" />
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

        {/* Disclaimer */}
        <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Stop if you feel pain. These stretches are for general wellness and not a substitute for medical advice.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
