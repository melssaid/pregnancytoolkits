import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Zap, Shield, Clock, Activity, ChevronRight, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { useAIUsage } from '@/contexts/AIUsageContext';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface KickSession {
  date: string;
  kicks: number;
  duration: number;
  startTime: string;
}

interface AIMovementAnalysisProps {
  sessions: KickSession[];
  currentWeek?: number;
}

type AnalysisPhase = 'idle' | 'collecting' | 'analyzing' | 'generating' | 'complete';

export const AIMovementAnalysis: React.FC<AIMovementAnalysisProps> = ({ 
  sessions,
  currentWeek = 28 
}) => {
  const { streamChat, isLoading } = usePregnancyAI();
  const { currentLanguage } = useLanguage();
  const [analysis, setAnalysis] = useState('');
  const [phase, setPhase] = useState<AnalysisPhase>('idle');
  const [progress, setProgress] = useState(0);
  const prevLangRef = useRef(currentLanguage);

  // Reset analysis when language changes
  useEffect(() => {
    if (prevLangRef.current !== currentLanguage) {
      prevLangRef.current = currentLanguage;
      if (phase === 'complete') {
        setAnalysis('');
        setPhase('idle');
        setProgress(0);
      }
    }
  }, [currentLanguage, phase]);

  const recentSessions = sessions.slice(0, 14);

  const runAnalysis = async () => {
    if (sessions.length < 3) return;
    
    setAnalysis('');
    setPhase('collecting');
    setProgress(0);

    // Simulate phased analysis for visual effect
    const phases: { phase: AnalysisPhase; duration: number; progress: number }[] = [
      { phase: 'collecting', duration: 800, progress: 25 },
      { phase: 'analyzing', duration: 1200, progress: 60 },
      { phase: 'generating', duration: 0, progress: 80 }
    ];

    for (const p of phases) {
      setPhase(p.phase);
      setProgress(p.progress);
      if (p.duration > 0) {
        await new Promise(resolve => setTimeout(resolve, p.duration));
      }
    }

    // Calculate detailed statistics
    const durations = recentSessions.map(s => s.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    const variance = durations.reduce((acc, d) => acc + Math.pow(d - avgDuration, 2), 0) / durations.length;
    const stdDev = Math.sqrt(variance);

    // Time of day analysis
    const timeDistribution = recentSessions.reduce((acc, s) => {
      const hour = parseInt(s.startTime.split(':')[0]);
      const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      acc[period] = (acc[period] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostActiveTime = Object.entries(timeDistribution)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'varied';

    // Trend calculation
    const firstHalf = durations.slice(0, Math.floor(durations.length / 2));
    const secondHalf = durations.slice(Math.floor(durations.length / 2));
    const trendDirection = 
      (secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length) <
      (firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length)
        ? 'improving' : 'stable or slowing';

    const sessionData = recentSessions.map(s => 
      `${s.date} at ${s.startTime}: ${s.kicks} kicks in ${s.duration} min`
    ).join('\n');

    await streamChat({
      type: 'symptom-analysis',
      messages: [{
        role: 'user',
        content: `You are an expert perinatal nurse providing fetal movement analysis. Analyze this kick counting data and provide comprehensive insights.

## Patient Data
- Pregnancy Week: ${currentWeek}
- Total Sessions Recorded: ${sessions.length}
- Analysis Period: Last ${recentSessions.length} sessions

## Session Records
${sessionData}

## Calculated Statistics
- Average time to 10 kicks: ${avgDuration.toFixed(1)} minutes
- Fastest session: ${minDuration} minutes
- Slowest session: ${maxDuration} minutes
- Consistency (Std Dev): ${stdDev.toFixed(1)} minutes
- Most active time: ${mostActiveTime}
- Trend: ${trendDirection}

## Required Analysis Sections

### 1. 📊 Pattern Review
Evaluate the consistency and quality of movement patterns. Compare to general guidelines (10 kicks in 2 hours is a commonly referenced expectation).

### 2. 🎯 Pattern Interpretation
Based on week ${currentWeek} of pregnancy:
- Is the movement pattern within normal range?
- Any concerning patterns that need attention?
- What does the timing distribution suggest?

### 3. ⚡ Personalized Recommendations
Provide 3-4 specific, actionable recommendations based on THIS patient's data:
- Optimal counting times based on their activity patterns
- Techniques to encourage fetal movement if needed
- When to count vs when to rest

### 4. 🛡️ When to Seek Care
Clear, non-alarming guidance on:
- What changes would warrant contacting their provider
- Difference between normal variation and concerning changes

### 5. 💡 Quick Tips
2-3 practical tips specific to week ${currentWeek}

Use markdown formatting with headers, bullet points, and **bold** for emphasis. Be supportive and reassuring while being accurate. Avoid medical jargon where possible.`
      }],
      context: { week: currentWeek, language: currentLanguage },
      onDelta: (text) => {
        setAnalysis(prev => prev + text);
        setProgress(prev => Math.min(prev + 0.5, 98));
      },
      onDone: () => {
        setPhase('complete');
        setProgress(100);
      }
    });
  };

  const phaseLabels = {
    idle: 'Ready to analyze',
    collecting: 'Collecting session data...',
    analyzing: 'Analyzing movement patterns...',
    generating: 'Generating personalized insights...',
    complete: 'Analysis complete'
  };

  const phaseIcons = {
    idle: Activity,
    collecting: Zap,
    analyzing: Brain,
    generating: Sparkles,
    complete: Shield
  };

  const PhaseIcon = phaseIcons[phase];

  if (sessions.length < 3) {
    return (
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50">
        <CardContent className="pt-4 text-center">
          <div className="p-3 rounded-full bg-violet-100 dark:bg-violet-900/50 w-fit mx-auto mb-3">
            <Brain className="w-6 h-6 text-violet-600" />
          </div>
          <h3 className="font-semibold text-foreground">AI Movement Analysis</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Record at least 3 sessions to unlock AI-powered pattern analysis
          </p>
          <div className="flex justify-center gap-2 mt-3">
            {[1, 2, 3].map(i => (
              <div 
                key={i}
                className={`w-3 h-3 rounded-full ${
                  sessions.length >= i 
                    ? 'bg-violet-500' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Analysis Trigger */}
      {phase === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-violet-500 to-purple-600 border-0 text-white overflow-hidden">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={{ 
                      boxShadow: ['0 0 0 0 rgba(255,255,255,0.4)', '0 0 0 15px rgba(255,255,255,0)']
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm"
                  >
                    <Brain className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-lg">AI Movement Analysis</h3>
                    <p className="text-white/80 text-sm">
                      Deep pattern analysis of {sessions.length} sessions
                    </p>
                  </div>
                </div>
                <Button
                  onClick={runAnalysis}
                  variant="secondary"
                  className="bg-white text-violet-600 hover:bg-white/90"
                >
                  Analyze
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Progress State */}
      {(phase !== 'idle' && phase !== 'complete') && (
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3 mb-4">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500"
              >
                <PhaseIcon className="w-5 h-5 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{phaseLabels[phase]}</h3>
                <Progress value={progress} className="h-2 mt-2" />
              </div>
              <span className="text-sm font-medium text-violet-600">{Math.round(progress)}%</span>
            </div>
            
            {/* Live Analysis Preview */}
            <AnimatePresence>
              {analysis && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-violet-200/50"
                >
                  <MarkdownRenderer content={analysis} />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Complete State */}
      {phase === 'complete' && analysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">AI Analysis Complete</h3>
                    <p className="text-xs text-muted-foreground">Based on {sessions.length} recorded sessions</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setPhase('idle');
                    setAnalysis('');
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-violet-600"
                >
                  <Brain className="w-4 h-4 mr-1" />
                  Re-analyze
                </Button>
              </div>
              <MarkdownRenderer content={analysis} />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default AIMovementAnalysis;
