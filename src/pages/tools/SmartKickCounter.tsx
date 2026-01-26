import React, { useState, useEffect } from 'react';
import { Baby, Clock, TrendingUp, AlertTriangle, Sparkles, Brain } from 'lucide-react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { RelatedTools } from '@/components/RelatedTools';
import MedicalDisclaimer from '@/components/compliance/MedicalDisclaimer';

interface KickSession {
  date: string;
  kicks: number;
  duration: number;
  startTime: string;
}

const STORAGE_KEY = 'smart-kick-counter-sessions';

const SmartKickCounter: React.FC = () => {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [kickCount, setKickCount] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [sessions, setSessions] = useState<KickSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  // AI Analysis
  const { streamChat, isLoading } = usePregnancyAI();
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [showAI, setShowAI] = useState(false);

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
    setShowAI(false);
    setAiAnalysis('');
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
  const avgKicks = recentSessions.length > 0
    ? recentSessions.reduce((acc, s) => acc + s.kicks, 0) / recentSessions.length
    : 0;

  // AI Analysis
  const getAIAnalysis = async () => {
    if (sessions.length === 0) return;
    
    setShowAI(true);
    setAiAnalysis('');
    
    const sessionData = recentSessions.map(s => 
      `Date: ${s.date}, Time: ${s.startTime}, Kicks: ${s.kicks}, Duration: ${s.duration}min`
    ).join('\n');

    await streamChat({
      type: 'symptom-analysis',
      messages: [{
        role: 'user',
        content: `As a prenatal health advisor, analyze these fetal movement tracking sessions and provide insights:

${sessionData}

Average duration for 10 kicks: ${avgDuration.toFixed(1)} minutes
Average kicks per session: ${avgKicks.toFixed(1)}

Provide:
1. Pattern analysis (is movement consistent?)
2. Comparison to healthy ranges (10 kicks in 2 hours is normal)
3. Any concerns or positive observations
4. Tips for optimal kick counting times

Keep response concise and supportive. Use markdown formatting.`
      }],
      onDelta: (text) => setAiAnalysis(prev => prev + text),
      onDone: () => {}
    });
  };

  if (!disclaimerAccepted) {
    return <MedicalDisclaimer toolName="Smart Kick Counter" onAccept={() => setDisclaimerAccepted(true)} />;
  }

  const progress = Math.min((kickCount / 10) * 100, 100);

  return (
    <ToolFrame
      title="Smart Kick Counter"
      subtitle="AI-powered fetal movement tracking"
      icon={Baby}
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

        {/* Counter Display */}
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
        {sessions.length > 0 && (
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

        {/* AI Analysis Button */}
        {sessions.length >= 3 && !isTracking && (
          <Button
            onClick={getAIAnalysis}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
          >
            <Brain className="w-5 h-5 mr-2" />
            {isLoading ? 'Analyzing...' : 'Get AI Pattern Analysis'}
          </Button>
        )}

        {/* AI Analysis Result */}
        <AnimatePresence>
          {showAI && aiAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground">AI Analysis</h3>
                  </div>
                  <MarkdownRenderer content={aiAnalysis} />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Sessions</h2>
              <div className="space-y-3">
                {sessions.slice(0, 5).map((session, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
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
        )}

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
