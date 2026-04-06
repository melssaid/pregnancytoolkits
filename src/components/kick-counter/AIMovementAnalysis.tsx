import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Zap, Shield, Clock, Activity, ChevronRight, Crown, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSmartInsight } from '@/hooks/useSmartInsight';
import { useAIUsage } from '@/contexts/AIUsageContext';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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

type AnalysisPhase = 'idle' | 'rule-summary' | 'collecting' | 'analyzing' | 'generating' | 'complete';

/**
 * Rule-based pre-analysis — runs locally without AI, no quota cost.
 */
function generateRuleSummary(sessions: KickSession[], week: number, t: (key: string, fallback: string) => string): string {
  if (sessions.length < 3) return '';
  
  const recent = sessions.slice(0, 7);
  const avgDuration = recent.reduce((a, s) => a + s.duration, 0) / recent.length;
  const avgKicks = recent.reduce((a, s) => a + s.kicks, 0) / recent.length;
  
  // Trend: compare last 3 vs previous 3
  const last3 = sessions.slice(0, 3);
  const prev3 = sessions.slice(3, 6);
  const lastAvg = last3.reduce((a, s) => a + s.duration, 0) / last3.length;
  const prevAvg = prev3.length > 0 ? prev3.reduce((a, s) => a + s.duration, 0) / prev3.length : lastAvg;
  
  const trendDiff = ((lastAvg - prevAvg) / prevAvg) * 100;
  
  let trendNote: string;
  if (Math.abs(trendDiff) < 15) {
    trendNote = t('kickAnalysis.trendStable', "Today's movement pattern looks similar to your recent logs.");
  } else if (trendDiff > 0) {
    trendNote = t('kickAnalysis.trendSlower', 'Movement appears slightly slower than your recent usual pattern. This is often normal — activity can vary day to day.');
  } else {
    trendNote = t('kickAnalysis.trendFaster', 'Baby seems more active recently! Movement times are shorter than usual.');
  }
  
  const warningThreshold = avgDuration > 90;
  const warningNote = warningThreshold 
    ? t('kickAnalysis.warningLong', 'If this change continues or worries you, consider contacting your healthcare provider.')
    : '';
  
  return `${trendNote}${warningNote ? '\n\n⚠️ ' + warningNote : ''}`;
}

export const AIMovementAnalysis: React.FC<AIMovementAnalysisProps> = ({ 
  sessions,
  currentWeek = 28 
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { remaining, used, limit, isLimitReached, tier } = useAIUsage();
  const navigate = useNavigate();
  const isFree = tier === 'free';
  
  const { generate, isLoading, content: aiAnalysis, error, errorType, clearError } = useSmartInsight({
    section: 'kick-analysis',
    toolType: 'kick-analysis',
  });
  
  const [ruleSummary, setRuleSummary] = useState('');
  const [phase, setPhase] = useState<AnalysisPhase>('idle');
  const [progress, setProgress] = useState(0);
  const prevLangRef = useRef(currentLanguage);

  // Reset on language change
  useEffect(() => {
    if (prevLangRef.current !== currentLanguage) {
      prevLangRef.current = currentLanguage;
      if (phase === 'complete' || phase === 'rule-summary') {
        setRuleSummary('');
        setPhase('idle');
        setProgress(0);
      }
    }
  }, [currentLanguage, phase]);

  const recentSessions = sessions.slice(0, 14);

  // Step 1: Show rule-based summary first (free, no AI)
  const showRuleSummary = () => {
    const summary = generateRuleSummary(sessions, currentWeek, (key: string, fallback: string) => t(key, fallback));
    setRuleSummary(summary);
    setPhase('rule-summary');
  };

  // Step 2: Deep AI analysis (costs 1 quota)
  const runDeepAnalysis = async () => {
    if (sessions.length < 3) return;
    if (isLimitReached) {
      navigate('/pricing-demo');
      return;
    }
    setPhase('collecting');
    setProgress(0);

    // Visual phases
    const phases: { p: AnalysisPhase; dur: number; prog: number }[] = [
      { p: 'collecting', dur: 600, prog: 25 },
      { p: 'analyzing', dur: 800, prog: 60 },
      { p: 'generating', dur: 0, prog: 80 },
    ];

    for (const step of phases) {
      setPhase(step.p);
      setProgress(step.prog);
      if (step.dur > 0) await new Promise(r => setTimeout(r, step.dur));
    }

    const durations = recentSessions.map(s => s.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    const timeDistribution = recentSessions.reduce((acc, s) => {
      const hour = parseInt(s.startTime.split(':')[0]);
      const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      acc[period] = (acc[period] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostActiveTime = Object.entries(timeDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'varied';

    const sessionData = recentSessions.map(s => `${s.date} at ${s.startTime}: ${s.kicks} kicks in ${s.duration} min`).join('\n');

    await generate({
      prompt: `You are an supportive pregnancy wellness guide reviewing baby movement patterns.

## Patient Data
- Pregnancy Week: ${currentWeek}
- Sessions Recorded: ${sessions.length}
- Analysis Period: Last ${recentSessions.length} sessions

## Session Records
${sessionData}

## Statistics
- Average time to 10 kicks: ${avgDuration.toFixed(1)} min
- Fastest: ${minDuration} min | Slowest: ${maxDuration} min  
- Most active time: ${mostActiveTime}

Provide:
### 📊 Pattern Review
### 🎯 Pattern Interpretation (week ${currentWeek})
### ⚡ Personalized Recommendations (3-4 tips)
### 🛡️ When to Seek Care
### 💡 Quick Tips (2-3 for week ${currentWeek})

Be warm, reassuring, and accurate. Use calm, non-alarming language.`,
      context: { week: currentWeek },
      skipCache: false,
      onDelta: () => setProgress(prev => Math.min(prev + 0.5, 98)),
    });

    setPhase('complete');
    setProgress(100);
  };

  const phaseLabels: Record<string, string> = {
    idle: t('kickAnalysis.ready', 'Ready to analyze'),
    'rule-summary': t('kickAnalysis.quickSummary', 'Quick Summary'),
    collecting: t('kickAnalysis.collecting', 'Collecting session data...'),
    analyzing: t('kickAnalysis.analyzing', 'Analyzing movement patterns...'),
    generating: t('kickAnalysis.generating', 'Generating personalized insights...'),
    complete: t('kickAnalysis.complete', 'Analysis complete'),
  };

  if (sessions.length < 3) {
    return (
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50">
        <CardContent className="pt-4 text-center">
          <div className="p-3 rounded-full bg-violet-100 dark:bg-violet-900/50 w-fit mx-auto mb-3">
            <Brain className="w-6 h-6 text-violet-600" />
          </div>
          <h3 className="font-semibold text-foreground">{t('kickAnalysis.title', 'Analyze Movement')}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t('kickAnalysis.minSessions', 'Record at least 3 sessions to unlock movement analysis')}
          </p>
          <div className="flex justify-center gap-2 mt-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-3 h-3 rounded-full ${sessions.length >= i ? 'bg-violet-500' : 'bg-muted'}`} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Idle State — Show Quick Summary button first */}
      {phase === 'idle' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-primary/90 to-primary/70 border-0 text-white overflow-hidden">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ boxShadow: ['0 0 0 0 rgba(255,255,255,0.4)', '0 0 0 15px rgba(255,255,255,0)'] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm"
                  >
                    <Brain className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-lg">{t('kickAnalysis.title', 'Analyze Movement')}</h3>
                    <p className="text-white/80 text-sm">
                      {t('kickAnalysis.sessionCount', '{{count}} sessions recorded', { count: sessions.length })}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={showRuleSummary}
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90"
                >
                  {t('kickAnalysis.quickCheck', 'Quick Check')}
                  <ChevronRight className="w-4 h-4 ms-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Rule Summary — Free, no AI */}
      {phase === 'rule-summary' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <h3 className="font-semibold text-sm text-foreground">{t('kickAnalysis.quickSummary', 'Quick Summary')}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{ruleSummary}</p>
              
              <div className="flex gap-2 mt-4 pt-3 border-t border-border/30">
                <Button
                  onClick={runDeepAnalysis}
                  disabled={isLimitReached}
                  size="sm"
                  className="gap-1.5 bg-gradient-to-r from-primary to-primary/80 text-white"
                >
                  <Brain className="w-3.5 h-3.5" />
                  {t('kickAnalysis.deepAnalysis', 'Deep AI Analysis')}
                </Button>
                <Button onClick={() => setPhase('idle')} variant="ghost" size="sm">
                  {t('common.back', 'Back')}
                </Button>
              </div>
              
              {/* Usage bar */}
              <div className="flex items-center gap-2 mt-3 pt-2">
                <Zap className={`w-2.5 h-2.5 shrink-0 ${isLimitReached ? 'text-destructive' : 'text-primary'}`} />
                <div className="flex-1 h-1 rounded-full bg-muted/40 overflow-hidden">
                  <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${limit > 0 ? Math.min((used / limit) * 100, 100) : 0}%` }} />
                </div>
                <span className="text-[9px] text-muted-foreground font-medium tabular-nums shrink-0">{remaining}/{limit}</span>
                {isFree && (
                  <button onClick={() => navigate('/pricing-demo')} className="shrink-0">
                    <Crown className="w-2.5 h-2.5 text-primary" />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Progress State */}
      {(['collecting', 'analyzing', 'generating'] as AnalysisPhase[]).includes(phase) && (
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500"
              >
                <Brain className="w-5 h-5 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{phaseLabels[phase]}</h3>
                <Progress value={progress} className="h-2 mt-2" />
              </div>
              <span className="text-sm font-medium text-violet-600">{Math.round(progress)}%</span>
            </div>
            
            <AnimatePresence>
              {aiAnalysis && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-violet-200/50"
                >
                  <MarkdownRenderer content={aiAnalysis} />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Complete State */}
      {phase === 'complete' && aiAnalysis && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{phaseLabels.complete}</h3>
                    <p className="text-xs text-muted-foreground">
                      {t('kickAnalysis.basedOn', 'Based on {{count}} sessions', { count: sessions.length })}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => { setPhase('idle'); }}
                  variant="ghost"
                  size="sm"
                  className="text-violet-600"
                >
                  <Brain className="w-4 h-4 me-1" />
                  {t('kickAnalysis.reAnalyze', 'Re-analyze')}
                </Button>
              </div>
              <MarkdownRenderer content={aiAnalysis} />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default AIMovementAnalysis;
