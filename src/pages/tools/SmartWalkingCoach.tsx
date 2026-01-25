import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Footprints, Play, Pause, Clock, TrendingUp, MapPin, AlertCircle } from 'lucide-react';

interface WalkSession {
  id: string;
  date: string;
  duration: number; // in seconds
  goal: number;
}

export default function SmartWalkingCoach() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isWalking, setIsWalking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [goal, setGoal] = useState(15); // minutes
  const [sessions, setSessions] = useState<WalkSession[]>([]);
  const [currentTrimester, setCurrentTrimester] = useState(2);

  useEffect(() => {
    const saved = localStorage.getItem('walkingSessions');
    if (saved) setSessions(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('walkingSessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWalking) {
      interval = setInterval(() => {
        setCurrentTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWalking]);

  const startWalk = () => {
    setCurrentTime(0);
    setIsWalking(true);
  };

  const endWalk = () => {
    setIsWalking(false);
    if (currentTime > 60) { // At least 1 minute
      const session: WalkSession = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        duration: currentTime,
        goal: goal * 60,
      };
      setSessions([session, ...sessions]);
    }
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTodayTotal = () => {
    const today = new Date().toDateString();
    return sessions
      .filter(s => new Date(s.date).toDateString() === today)
      .reduce((acc, s) => acc + s.duration, 0);
  };

  const getWeekTotal = () => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return sessions
      .filter(s => new Date(s.date).getTime() > weekAgo)
      .reduce((acc, s) => acc + s.duration, 0);
  };

  const trimesterGoals = {
    1: { min: 15, max: 30, note: 'Start slowly, listen to your body' },
    2: { min: 20, max: 40, note: 'Best time for active walking' },
    3: { min: 15, max: 30, note: 'Shorter walks, more frequent breaks' },
  };

  const currentGoal = trimesterGoals[currentTrimester as keyof typeof trimesterGoals];
  const progress = Math.min((currentTime / (goal * 60)) * 100, 100);

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName="Smart Walking Coach"
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title="Smart Walking Coach"
      subtitle="Personalized walking program for a healthy pregnancy"
      icon={Footprints}
      mood="empowering"
      toolId="smart-walking-coach"
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
                  onClick={() => {
                    setCurrentTrimester(t);
                    setGoal(trimesterGoals[t as keyof typeof trimesterGoals].min);
                  }}
                  className={`py-3 rounded-lg font-semibold transition-all ${
                    currentTrimester === t
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  Trimester {t}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {currentGoal.note} • Goal: {currentGoal.min}-{currentGoal.max} min/day
            </p>
          </CardContent>
        </Card>

        {/* Walk Timer */}
        <Card className={isWalking ? 'border-2 border-primary' : ''}>
          <CardContent className="p-6 text-center">
            {isWalking ? (
              <>
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={440}
                      strokeDashoffset={440 - (440 * progress) / 100}
                      className="text-primary transition-all"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">{formatTime(currentTime)}</span>
                    <span className="text-sm text-muted-foreground">/ {goal} min</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Keep up the great work! 🚶‍♀️</p>
                <Button onClick={endWalk} variant="destructive" size="lg">
                  <Pause className="w-4 h-4 mr-2" />
                  End Walk
                </Button>
              </>
            ) : (
              <>
                <Footprints className="w-16 h-16 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Ready to Walk?</h3>
                <div className="mb-4">
                  <label className="block text-sm text-muted-foreground mb-2">Goal (minutes)</label>
                  <div className="flex items-center justify-center gap-2">
                    {[currentGoal.min, Math.round((currentGoal.min + currentGoal.max) / 2), currentGoal.max].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGoal(g)}
                        className={`px-4 py-2 rounded-lg ${
                          goal === g ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}
                      >
                        {g} min
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={startWalk} size="lg" className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Start Walking
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{Math.round(getTodayTotal() / 60)}</p>
              <p className="text-xs text-muted-foreground">Minutes Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold">{Math.round(getWeekTotal() / 60)}</p>
              <p className="text-xs text-muted-foreground">Minutes This Week</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Recent Walks</h3>
              <div className="space-y-2">
                {sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <span className="font-medium">{Math.round(session.duration / 60)} minutes</span>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-sm px-2 py-0.5 rounded-full ${
                      session.duration >= session.goal 
                        ? 'bg-green-500/10 text-green-600' 
                        : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {session.duration >= session.goal ? 'Goal Met!' : `${Math.round((session.duration / session.goal) * 100)}%`}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Walking Tips
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Walk on flat, even surfaces</li>
              <li>• Wear supportive shoes</li>
              <li>• Stay hydrated</li>
              <li>• Walk during cooler parts of the day</li>
              <li>• Take breaks when needed</li>
            </ul>
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Stop walking if you experience dizziness, shortness of breath, chest pain, 
                contractions, or any unusual symptoms. Always consult your healthcare provider.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
