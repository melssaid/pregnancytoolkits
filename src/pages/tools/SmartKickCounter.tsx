import React, { useState, useEffect } from 'react';
import { Baby, Clock, TrendingUp, AlertTriangle, Sparkles, BarChart3 } from 'lucide-react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { RelatedTools } from '@/components/RelatedTools';
import MedicalDisclaimer from '@/components/compliance/MedicalDisclaimer';
import { KickPatternVisualizer } from '@/components/kick-counter/KickPatternVisualizer';
import { AIMovementAnalysis } from '@/components/kick-counter/AIMovementAnalysis';
import { VideoLibrary, Video } from '@/components/VideoLibrary';

interface KickSession {
  date: string;
  kicks: number;
  duration: number;
  startTime: string;
}

const STORAGE_KEY = 'smart-kick-counter-sessions';

const educationalVideos: Video[] = [
  {
    id: 'kick-1',
    title: 'How to Count Baby Kicks',
    description: 'Step-by-step guide to monitoring fetal movement for baby health',
    youtubeId: 'Ej0Yef2sDFM',
    duration: '5:42',
    category: 'Getting Started'
  },
  {
    id: 'kick-2',
    title: 'Fetal Kick Counts Explained',
    description: 'Understanding when and how to monitor baby movements',
    youtubeId: 'pBUXzJURch4',
    duration: '4:18',
    category: 'Getting Started'
  },
  {
    id: 'kick-3',
    title: 'Kick Counting: 10 Kicks in 60 Minutes',
    description: 'Dr. Thomas Moore explains the importance of fetal kick counting',
    youtubeId: 'kXbrD8eu5H4',
    duration: '3:52',
    category: 'Medical Guidance'
  },
  {
    id: 'kick-4',
    title: 'How to Check Baby Kicks',
    description: 'Sarah Lavonne explains proper kick counting technique',
    youtubeId: 'LTjgHYnMP5s',
    duration: '8:15',
    category: 'Expert Tips'
  }
];

const SmartKickCounter: React.FC = () => {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [kickCount, setKickCount] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [activeTab, setActiveTab] = useState('counter');
  const [sessions, setSessions] = useState<KickSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const startSession = () => {
    setIsTracking(true);
    setStartTime(new Date());
    setKickCount(0);
    setElapsed(0);
  };

  const recordKick = () => {
    if (isTracking) {
      const newCount = kickCount + 1;
      setKickCount(newCount);
      
      if (newCount >= 10) {
        endSession(newCount);
      }
    }
  };

  const endSession = (finalKicks?: number) => {
    const kicks = finalKicks || kickCount;
    if (startTime && kicks > 0) {
      const duration = Math.ceil((Date.now() - startTime.getTime()) / 60000);
      const newSession: KickSession = {
        date: new Date().toISOString().split('T')[0],
        kicks,
        duration,
        startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSessions([newSession, ...sessions]);
    }
    setIsTracking(false);
    setStartTime(null);
    setKickCount(0);
    setElapsed(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate statistics
  const recentSessions = sessions.slice(0, 7);
  const avgDuration = recentSessions.length > 0
    ? recentSessions.reduce((acc, s) => acc + s.duration, 0) / recentSessions.length
    : 0;

  if (!disclaimerAccepted) {
    return <MedicalDisclaimer toolName="Smart Kick Counter" onAccept={() => setDisclaimerAccepted(true)} />;
  }

  const progress = Math.min((kickCount / 10) * 100, 100);

  return (
    <ToolFrame
      title="Smart Kick Counter"
      subtitle="AI-powered fetal movement tracking"
      customIcon="heartbeat"
      mood="nurturing"
    >
      <div className="space-y-6">
        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-200">
            Contact your healthcare provider immediately if you notice decreased fetal movement.
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="counter" className="text-xs">
              <Baby className="w-4 h-4 mr-1.5" />
              Counter
            </TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs">
              <BarChart3 className="w-4 h-4 mr-1.5" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <Clock className="w-4 h-4 mr-1.5" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Counter Tab */}
          <TabsContent value="counter" className="space-y-4">
            {!isTracking ? (
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border-blue-200/50">
                <CardContent className="pt-8 pb-8 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Baby className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  </motion.div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Ready to Count?</h2>
                  <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                    Tap the button to start counting kicks. Goal: 10 movements within 2 hours.
                  </p>
                  <Button
                    onClick={startSession}
                    size="lg"
                    className="w-full max-w-xs bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Counting
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 border-0 text-white overflow-hidden">
                  <CardContent className="pt-6 pb-8">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono">{formatTime(elapsed)}</span>
                      </div>
                      <Button
                        onClick={() => endSession()}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        End Session
                      </Button>
                    </div>
                    
                    <motion.button
                      onClick={recordKick}
                      whileTap={{ scale: 0.95 }}
                      className="w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center mx-auto shadow-2xl"
                    >
                      <motion.span 
                        key={kickCount}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        className="text-5xl font-bold text-blue-500"
                      >
                        {kickCount}
                      </motion.span>
                      <span className="text-sm text-blue-400">kicks</span>
                    </motion.button>
                    
                    <p className="mt-6 text-center text-white/80">
                      {10 - kickCount > 0 ? `${10 - kickCount} more to reach goal` : '🎉 Goal reached!'}
                    </p>
                    
                    <div className="mt-4">
                      <Progress value={progress} className="h-3 bg-white/30" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Stats */}
            {sessions.length > 0 && !isTracking && (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-sm font-medium">Sessions</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{sessions.length}</p>
                    <p className="text-xs text-muted-foreground">Total recorded</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-cyan-600 mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm font-medium">Avg Time</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{avgDuration.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">min for 10 kicks</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-4">
            {/* Visual Pattern Analysis */}
            <KickPatternVisualizer sessions={sessions} />
            
            {/* AI Movement Analysis */}
            <AIMovementAnalysis sessions={sessions} currentWeek={28} />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            {sessions.length > 0 ? (
              <Card>
                <CardContent className="pt-4">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Session History</h2>
                  <div className="space-y-3">
                    {sessions.slice(0, 10).map((session, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-muted/50 rounded-xl p-4 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-foreground">{session.date}</p>
                          <p className="text-sm text-muted-foreground">{session.startTime}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">{session.kicks} kicks</p>
                          <p className="text-sm text-muted-foreground">{session.duration} min</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-muted/30">
                <CardContent className="pt-8 pb-8 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No sessions recorded yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start counting to build your history
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Video Library */}
        <VideoLibrary
          videos={educationalVideos}
          title="Learn About Kick Counting"
          subtitle="Expert guidance for tracking fetal movement"
          accentColor="blue"
        />

        {/* Info */}
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200/50">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">About Kick Counting</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Most providers recommend counting kicks from 28 weeks. You should feel at least 10 movements within 2 hours. 
              The best time is after meals when baby is most active. Always consult your provider for personalized guidance.
            </p>
          </CardContent>
        </Card>

        {/* Related Tools */}
        <RelatedTools currentToolId="kick-counter" />
      </div>
    </ToolFrame>
  );
};

export default SmartKickCounter;
