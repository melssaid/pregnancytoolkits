import React, { useState, useEffect, useRef } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalInfoBar } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, Heart, Brain, Wind, Calendar, Clock, CheckCircle, Video, Image as ImageIcon, ExternalLink } from 'lucide-react';
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
  videoUrl?: string;
  thumbnailUrl?: string;
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
    ],
    videoUrl: 'https://www.youtube.com/embed/inpok4MKVLM',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=225&fit=crop'
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
    ],
    videoUrl: 'https://www.youtube.com/embed/B10taRSlbio',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=225&fit=crop'
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
    ],
    videoUrl: 'https://www.youtube.com/embed/tybOi4hjZFQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=225&fit=crop'
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
    ],
    videoUrl: 'https://www.youtube.com/embed/Ryxj3pzrRqk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop'
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
    ],
    videoUrl: 'https://www.youtube.com/embed/aEqlQvczMJQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=400&h=225&fit=crop'
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
    ],
    videoUrl: 'https://www.youtube.com/embed/dWsLIYQ8m4s',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=225&fit=crop'
  }
];

export default function PregnancyMeditationYoga() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [currentTrimester, setCurrentTrimester] = useState(2);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedSessions, setCompletedSessions] = useState<string[]>([]);
  const [showVideo, setShowVideo] = useState(false);
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
    setIsPlaying(false);
    setShowVideo(false);
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
    setShowVideo(false);
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
        return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20';
      case 'yoga':
        return 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20';
      case 'breathing':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <ToolFrame
      title="Pregnancy Meditation & Yoga"
      subtitle="Guided sessions with video demonstrations"
      icon={Heart}
      mood="calm"
      toolId="pregnancy-meditation-yoga"
    >
      <div className="space-y-6">
        <MedicalInfoBar compact />
        
        {/* Active Session Player */}
        {selectedSession && (
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-4">
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

              {/* Video Player */}
              {selectedSession.videoUrl && (
                <div className="mb-4">
                  {showVideo ? (
                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                      <iframe
                        src={selectedSession.videoUrl}
                        title={selectedSession.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div 
                      className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => setShowVideo(true)}
                    >
                      <img 
                        src={selectedSession.thumbnailUrl} 
                        alt={selectedSession.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="w-8 h-8 text-primary ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white text-sm">
                        <Video className="w-4 h-4" />
                        Watch Video Guide
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Timer Display */}
              <div className="text-center py-6 bg-background/50 rounded-xl">
                <div className="text-4xl font-bold text-primary mb-4">
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
                    {isPlaying ? 'Pause' : 'Start Timer'}
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-4">
                <h4 className="font-medium mb-3 text-sm">Follow Along:</h4>
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
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Select Your Trimester
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((trimester) => (
                <Button
                  key={trimester}
                  variant={currentTrimester === trimester ? 'default' : 'outline'}
                  onClick={() => setCurrentTrimester(trimester)}
                  className="flex flex-col h-auto py-2"
                  size="sm"
                >
                  <span className="text-base font-bold">{trimester}</span>
                  <span className="text-[10px] opacity-80">
                    {trimester === 1 ? 'Weeks 1-12' : trimester === 2 ? 'Weeks 13-26' : 'Weeks 27-40'}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Your Progress
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-muted/50 rounded-lg">
                <div className="text-xl font-bold text-primary">
                  {completedSessions.length}
                </div>
                <div className="text-[10px] text-muted-foreground">Completed</div>
              </div>
              <div className="p-2 bg-muted/50 rounded-lg">
                <div className="text-xl font-bold text-primary">
                  {sessions.length}
                </div>
                <div className="text-[10px] text-muted-foreground">Total</div>
              </div>
              <div className="p-2 bg-muted/50 rounded-lg">
                <div className="text-xl font-bold text-primary">
                  {Math.round((completedSessions.length / sessions.length) * 100)}%
                </div>
                <div className="text-[10px] text-muted-foreground">Complete</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">
            Sessions for Trimester {currentTrimester}
          </h3>
          {getFilteredSessions().map((session) => (
            <Card 
              key={session.id}
              className={completedSessions.includes(session.id) ? 'border-emerald-500/30' : ''}
            >
              <CardContent className="p-3">
                {/* Thumbnail */}
                {session.thumbnailUrl && (
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                    <img 
                      src={session.thumbnailUrl} 
                      alt={session.title}
                      className="w-full h-full object-cover"
                    />
                    {session.videoUrl && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        Video
                      </div>
                    )}
                    {completedSessions.includes(session.id) && (
                      <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Done
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`p-1 rounded border ${getTypeColor(session.type)}`}>
                        {getSessionIcon(session.type)}
                      </span>
                      <h4 className="font-semibold text-sm truncate">{session.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {session.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {Math.floor(session.duration / 60)} min
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full capitalize">
                        {session.difficulty}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => startSession(session)}
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <Play className="w-3 h-3 mr-1" />
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
