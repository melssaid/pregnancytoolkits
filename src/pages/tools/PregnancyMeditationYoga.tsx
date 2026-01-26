import React, { useState, useEffect, useRef } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, Heart, Brain, Wind, Calendar, Clock, CheckCircle } from 'lucide-react';
import { safeParseLocalStorage, safeSaveToLocalStorage } from '@/lib/safeStorage';

interface Session {
  id: string;
  title: string;
  duration: number;
  type: 'meditation' | 'yoga' | 'breathing';
  description: string;
  benefits: string[];
  trimester: number[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
}

const sessions: Session[] = [
  {
    id: 'meditation-morning',
    title: 'Morning Energy Meditation',
    duration: 600,
    type: 'meditation',
    description: 'Start your day with positive energy and calm mindfulness',
    benefits: ['Reduces morning anxiety', 'Increases focus', 'Improves mood'],
    trimester: [1, 2, 3],
    difficulty: 'beginner',
    instructions: [
      'Find a comfortable seated position',
      'Close your eyes and take deep breaths',
      'Focus on your breathing pattern',
      'Visualize positive energy flowing through your body',
      'Set daily intentions for you and your baby'
    ]
  },
  {
    id: 'yoga-first-trimester',
    title: 'Gentle First Trimester Yoga',
    duration: 900,
    type: 'yoga',
    description: 'Safe yoga poses for early pregnancy to reduce nausea and fatigue',
    benefits: ['Reduces morning sickness', 'Increases flexibility', 'Improves circulation'],
    trimester: [1],
    difficulty: 'beginner',
    instructions: [
      'Start with gentle neck stretches',
      'Practice cat-cow pose for 5 rounds',
      'Do seated side stretches',
      'Try gentle hip circles',
      'End with child pose relaxation'
    ]
  },
  {
    id: 'breathing-labor-prep',
    title: 'Labor Breathing Preparation',
    duration: 480,
    type: 'breathing',
    description: 'Essential breathing techniques for labor and delivery',
    benefits: ['Manages labor pain', 'Reduces anxiety', 'Increases oxygen flow'],
    trimester: [2, 3],
    difficulty: 'intermediate',
    instructions: [
      'Practice deep belly breathing',
      'Try the 4-7-8 breathing technique',
      'Learn patterned breathing for contractions',
      'Practice exhaling with pursed lips',
      'Combine breathing with visualization'
    ]
  },
  {
    id: 'yoga-second-trimester',
    title: 'Energizing Second Trimester Flow',
    duration: 1200,
    type: 'yoga',
    description: 'Build strength and prepare your body for the third trimester',
    benefits: ['Strengthens core muscles', 'Reduces back pain', 'Improves posture'],
    trimester: [2],
    difficulty: 'intermediate',
    instructions: [
      'Warm up with gentle stretches',
      'Practice warrior II pose (supported)',
      'Do modified triangle pose',
      'Try gentle pigeon pose for hip opening',
      'Finish with relaxation pose'
    ]
  },
  {
    id: 'meditation-sleep',
    title: 'Sleep Better Meditation',
    duration: 720,
    type: 'meditation',
    description: 'Guided meditation to improve sleep quality during pregnancy',
    benefits: ['Improves sleep quality', 'Reduces insomnia', 'Calms racing thoughts'],
    trimester: [1, 2, 3],
    difficulty: 'beginner',
    instructions: [
      'Lie on your left side with pillows for support',
      'Start with body scan relaxation',
      'Practice progressive muscle relaxation',
      'Use guided imagery of peaceful scenes',
      'End with gratitude meditation'
    ]
  },
  {
    id: 'yoga-third-trimester',
    title: 'Third Trimester Preparation Yoga',
    duration: 1080,
    type: 'yoga',
    description: 'Gentle poses to prepare for labor and reduce discomfort',
    benefits: ['Prepares pelvis for birth', 'Reduces swelling', 'Relieves back pressure'],
    trimester: [3],
    difficulty: 'beginner',
    instructions: [
      'Start with seated breathing exercises',
      'Practice supported squats',
      'Do gentle pelvic tilts',
      'Try side-lying leg exercises',
      'End with supported relaxation pose'
    ]
  }
];

export default function PregnancyMeditationYoga() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [currentTrimester, setCurrentTrimester] = useState(2);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedSessions, setCompletedSessions] = useState<string[]>([]);
  const isInitialized = useRef(false);

  useEffect(() => {
    const saved = safeParseLocalStorage<string[]>('completedMeditationSessions', [], (data): data is string[] => {
      return Array.isArray(data) && data.every(item => typeof item === 'string');
    });
    setCompletedSessions(saved);
    isInitialized.current = true;
  }, []);

  useEffect(() => {
    if (isInitialized.current) {
      safeSaveToLocalStorage('completedMeditationSessions', completedSessions);
    }
  }, [completedSessions]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            if (selectedSession && !completedSessions.includes(selectedSession.id)) {
              setCompletedSessions([...completedSessions, selectedSession.id]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeRemaining, selectedSession, completedSessions]);

  const startSession = (session: Session) => {
    setSelectedSession(session);
    setTimeRemaining(session.duration);
    setIsPlaying(true);
  };

  const togglePause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetSession = () => {
    setIsPlaying(false);
    if (selectedSession) {
      setTimeRemaining(selectedSession.duration);
    }
  };

  const closePlayer = () => {
    setIsPlaying(false);
    setSelectedSession(null);
    setTimeRemaining(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFilteredSessions = () => {
    return sessions.filter(session => session.trimester.includes(currentTrimester));
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'meditation':
        return <Brain className="w-5 h-5" />;
      case 'yoga':
        return <Heart className="w-5 h-5" />;
      case 'breathing':
        return <Wind className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meditation':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'yoga':
        return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
      case 'breathing':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName="Pregnancy Meditation & Yoga"
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title="Pregnancy Meditation & Yoga"
      subtitle="Guided meditation and yoga sessions tailored for each trimester"
      icon={Heart}
      mood="calm"
      toolId="pregnancy-meditation-yoga"
    >
        <div className="space-y-6">
          {/* Active Session Player */}
          {selectedSession && (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {getSessionIcon(selectedSession.type)}
                      {selectedSession.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedSession.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={closePlayer}>
                    ✕
                  </Button>
                </div>

                {/* Timer Display */}
                <div className="text-center py-8">
                  <div className="text-5xl font-bold text-primary mb-4">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={resetSession}
                    >
                      <RefreshCw className="w-5 h-5" />
                    </Button>
                    <Button
                      size="lg"
                      onClick={togglePause}
                      className="px-8"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 mr-2" />
                      ) : (
                        <Play className="w-5 h-5 mr-2" />
                      )}
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Instructions:</h4>
                  <ol className="space-y-2">
                    {selectedSession.instructions.map((instruction, index) => (
                      <li key={index} className="flex gap-3 text-sm text-muted-foreground">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trimester Selector */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Select Your Trimester
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((trimester) => (
                  <Button
                    key={trimester}
                    variant={currentTrimester === trimester ? 'default' : 'outline'}
                    onClick={() => setCurrentTrimester(trimester)}
                    className="flex flex-col h-auto py-3"
                  >
                    <span className="text-lg font-bold">{trimester}</span>
                    <span className="text-xs opacity-80">
                      {trimester === 1 ? 'Weeks 1-12' : trimester === 2 ? 'Weeks 13-26' : 'Weeks 27-40'}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Your Progress
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {completedSessions.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {sessions.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Sessions</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round((completedSessions.length / sessions.length) * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Complete</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Available Sessions for Trimester {currentTrimester}
            </h3>
            {getFilteredSessions().map((session) => (
              <Card 
                key={session.id}
                className={completedSessions.includes(session.id) ? 'border-green-500/30' : ''}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`p-1.5 rounded-lg border ${getTypeColor(session.type)}`}>
                          {getSessionIcon(session.type)}
                        </span>
                        <h4 className="font-semibold">{session.title}</h4>
                        {completedSessions.includes(session.id) && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {session.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-xs px-2 py-1 bg-muted rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.floor(session.duration / 60)} min
                        </span>
                        <span className="text-xs px-2 py-1 bg-muted rounded-full capitalize">
                          {session.difficulty}
                        </span>
                        <span className="text-xs px-2 py-1 bg-muted rounded-full capitalize">
                          {session.type}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {session.benefits.map((benefit, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => startSession(session)}
                      className="flex-shrink-0"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
    </ToolFrame>
  );
}
