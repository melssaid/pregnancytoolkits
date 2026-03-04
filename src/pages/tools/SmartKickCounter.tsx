import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Baby, Play, TrendingUp, Clock, Loader2, Save, Sparkles, AlertTriangle, Activity, BarChart3, Brain, RefreshCw, Zap, Target, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { KickService } from '@/services/localStorageServices';
import { ToolFrame } from '@/components/ToolFrame';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { motion, AnimatePresence } from 'framer-motion';
import { RelatedToolLinks } from '@/components/RelatedToolLinks';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { useUserProfile } from '@/hooks/useUserProfile';

const SmartKickCounter: React.FC = () => {
  const { t } = useTranslation();
  const [isActive, setIsActive] = useState(false);
  const [kicks, setKicks] = useState<{ time: string }[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { profile: userProfile } = useUserProfile();
  const [currentWeek, setCurrentWeek] = useState(userProfile.pregnancyWeek || 0);
  const [history, setHistory] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // AI States
  const [aiPatternAnalysis, setAiPatternAnalysis] = useState('');
  const [aiHealthInsight, setAiHealthInsight] = useState('');
  const [aiActiveTab, setAiActiveTab] = useState<'pattern' | 'health' | 'tips' | null>(null);
  const [aiTips, setAiTips] = useState('');
  
  const { streamChat, isLoading: aiLoading } = usePregnancyAI();
  const { toast } = useToast();

  useResetOnLanguageChange(() => {
    setAiPatternAnalysis('');
    setAiHealthInsight('');
    setAiTips('');
  });

  useEffect(() => {
    // Sync week from central profile
    if (userProfile.pregnancyWeek) setCurrentWeek(userProfile.pregnancyWeek);
  }, [userProfile.pregnancyWeek]);

  useEffect(() => {
    loadData();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const activeSession = await KickService.getActiveSession();
      if (activeSession) {
        setSessionId(activeSession.id);
        setKicks(activeSession.kicks || []);
        setStartTime(new Date(activeSession.started_at));
        setIsActive(true);
      }
      
      const sessionHistory = await KickService.getHistory(10);
      setHistory(sessionHistory);
      
    } catch (error: any) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async () => {
    try {
      const session = await KickService.startSession(currentWeek);
      setSessionId(session.id);
      setStartTime(new Date());
      setIsActive(true);
      setKicks([]);
      setElapsedTime(0);
      setNotes('');
      
      toast({
        title: t('toolsInternal.kickCounter.sessionStarted'),
        description: t('toolsInternal.kickCounter.sessionStartedDesc')
      });
    } catch (error: any) {
      toast({
        title: t('toolsInternal.kickCounter.error'),
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const recordKick = async () => {
    if (!isActive || !sessionId) return;
    
    const timestamp = new Date().toISOString();
    const newKicks = await KickService.addKick(sessionId, kicks, timestamp);
    setKicks(newKicks);
    
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;
    
    try {
      setIsSaving(true);
      const durationMinutes = Math.floor(elapsedTime / 60);
      
      await KickService.endSession(sessionId, durationMinutes, notes);
      
      setIsActive(false);
      setSessionId(null);
      
      toast({
        title: t('toolsInternal.kickCounter.sessionSaved'),
        description: t('toolsInternal.kickCounter.sessionSavedDesc', { kicks: kicks.length, minutes: durationMinutes })
      });
      
      const sessionHistory = await KickService.getHistory(10);
      setHistory(sessionHistory);
      
      // Auto-analyze if enough data
      if (sessionHistory.length >= 2) {
        analyzePatterns(sessionHistory);
      }
      
    } catch (error: any) {
      toast({
        title: t('toolsInternal.kickCounter.saveError'),
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAverageKicks = () => {
    if (history.length === 0) return 0;
    const total = history.reduce((sum, s) => sum + s.total_kicks, 0);
    return Math.round(total / history.length);
  };

  const getMovementScore = () => {
    if (history.length === 0) return 0;
    const avgKicks = getAverageKicks();
    const avgDuration = history.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / history.length;
    
    // Score based on kicks per hour ratio (10 kicks in 2 hours = 100%)
    const kicksPerHour = avgDuration > 0 ? (avgKicks / avgDuration) * 60 : 0;
    const score = Math.min(100, Math.round((kicksPerHour / 5) * 100));
    return score;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-accent';
    if (score >= 50) return 'text-primary';
    return 'text-muted-foreground';
  };

  // AI Pattern Analysis
  const analyzePatterns = async (sessions: any[]) => {
    setAiActiveTab('pattern');
    setAiPatternAnalysis('');

    const sessionData = sessions.slice(0, 7).map(s => ({
      kicks: s.total_kicks,
      duration: s.duration_minutes,
      date: new Date(s.started_at).toLocaleDateString(),
      time: new Date(s.started_at).toLocaleTimeString(),
      week: s.week
    }));

    const avgKicks = sessions.reduce((sum, s) => sum + s.total_kicks, 0) / sessions.length;
    const avgDuration = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / sessions.length;

    const prompt = `As a pregnancy wellness guide, review this baby movement diary for a pregnancy at week ${currentWeek}. Use supportive, non-clinical language. Do NOT use words like "danger", "high risk", "go to hospital", or provide any medical diagnoses.

**Journal Entries (Last ${sessions.length} entries):**
${sessionData.map(s => `- ${s.date} at ${s.time}: ${s.kicks} movements in ${s.duration} minutes`).join('\n')}

**Summary:**
- Average movements per entry: ${avgKicks.toFixed(1)}
- Average entry duration: ${avgDuration.toFixed(1)} minutes

Provide a supportive journal review including:

1. **📊 Movement Patterns**
   - Daily activity trends
   - Time-of-day observations
   - Consistency notes

2. **📝 Journal Summary**
   - How this compares to typical activity at week ${currentWeek}
   - Observations about the entries

3. **📈 Trend Notes**
   - Is activity increasing, stable, or changing?
   - Expected patterns for this stage

4. **✅ Your Takeaway**
   - Encouraging summary for the mother
   - Suggestion to share journal with healthcare provider if desired

Keep the tone warm, supportive, and educational. Avoid any clinical or diagnostic language.`;

    await streamChat({
      type: 'kick-analysis',
      messages: [{ role: 'user', content: prompt }],
      context: { week: currentWeek },
      onDelta: (text) => setAiPatternAnalysis((prev) => prev + text),
      onDone: () => {},
    });
  };

  // AI Health Insight
  const getHealthInsight = async () => {
    setAiActiveTab('health');
    setAiHealthInsight('');

    const avgKicks = getAverageKicks();
    const movementScore = getMovementScore();

    const prompt = `As a pregnancy wellness guide, provide supportive guidance based on baby movement diary data. Do NOT use clinical or diagnostic language. Avoid words like "danger", "high risk", "warning signs", or "go to hospital".

**Pregnancy Week:** ${currentWeek}
**Activity Level:** ${movementScore}/100
**Average Movements Per Entry:** ${avgKicks}
**Total Entries:** ${history.length}

Provide friendly, educational guidance:

1. **💓 Baby's Activity**
   - What these movement patterns generally suggest
   - Understanding quieter vs more active periods

2. **📋 When to Share Your Journal**
   - Changes worth noting for your next provider visit
   - What information to have ready

3. **💪 Encouraging Baby's Activity**
   - Best times to journal movements
   - Foods and activities that may encourage movement

4. **📅 Week ${currentWeek} Notes**
   - Typical movement patterns for this stage
   - How patterns may evolve

Be warm, supportive, and educational. Always suggest consulting with a healthcare provider for personalized guidance.`;

    await streamChat({
      type: 'kick-analysis',
      messages: [{ role: 'user', content: prompt }],
      context: { week: currentWeek },
      onDelta: (text) => setAiHealthInsight((prev) => prev + text),
      onDone: () => {},
    });
  };

  // AI Tips
  const getAITips = async () => {
    setAiActiveTab('tips');
    setAiTips('');

    const prompt = `As a pregnancy wellness guide, provide practical journaling tips for baby movement at week ${currentWeek}. Use warm, encouraging language. Avoid clinical or diagnostic terminology.

**Current Journal:**
- Entries logged: ${history.length}
- Average movements: ${getAverageKicks()} per entry
- Activity level: ${getMovementScore()}/100

Provide a helpful guide:

1. **🕐 Best Times to Journal**
   - Optimal times for noting movements
   - Baby's natural activity cycles

2. **🛋️ Comfortable Positions**
   - Best positions to feel movements
   - Tips for different placenta positions

3. **🍎 Encouraging Movement**
   - Snacks that may increase activity
   - Music, talking, and bonding

4. **📝 Journaling Tips**
   - What to note besides movement counts
   - Making entries meaningful

5. **🧘 Mindful Moments**
   - Using journal time for bonding
   - Relaxation during movement journaling

Keep it practical, warm, and easy to follow.`;

    await streamChat({
      type: 'kick-analysis',
      messages: [{ role: 'user', content: prompt }],
      context: { week: currentWeek },
      onDelta: (text) => setAiTips((prev) => prev + text),
      onDone: () => {},
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('toolsInternal.kickCounter.loading')}</p>
        </div>
      </div>
    );
  }

  const movementScore = getMovementScore();

  return (
    <ToolFrame
      title={t('toolsInternal.kickCounter.title')}
      subtitle={t('toolsInternal.kickCounter.subtitle', { week: currentWeek })}
      customIcon="baby-growth"
      mood="nurturing"
      toolId="smart-kick-counter"
    >
      <div className="space-y-4">
        {/* Movement Score Card */}
        {history.length > 0 && (
          <Card className="bg-gradient-to-br from-primary/5 to-secondary border-primary/20">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{t('toolsInternal.kickCounter.movementScore')}</p>
                  <div className={`text-lg font-bold ${getScoreColor(movementScore)}`}>
                    {movementScore}
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted/20"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${(movementScore / 100) * 220} 220`}
                      strokeLinecap="round"
                      className={getScoreColor(movementScore)}
                    />
                  </svg>
                  <Activity className={`absolute inset-0 m-auto w-8 h-8 ${getScoreColor(movementScore)}`} />
                </div>
              </div>
              <Progress value={movementScore} className="mt-3 h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {t('toolsInternal.kickCounter.basedOnSessions', { count: history.length })}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Counter */}
        <Card className="shadow-xl overflow-hidden">
          <CardContent className="p-0">
            {/* Timer Bar */}
            {isActive && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-primary/15 to-primary/5 px-4 py-2.5 border-b border-primary/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-destructive"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  <span className="text-xs font-medium text-muted-foreground">{t('toolsInternal.kickCounter.recording', 'جارٍ التسجيل')}</span>
                </div>
                <div className="font-mono text-sm font-bold text-foreground tabular-nums">
                  {formatTime(elapsedTime)}
                </div>
              </motion.div>
            )}

            <div className="p-5 pb-6">
              {/* Kick Counter Circle */}
              <div className="flex flex-col items-center">
                {/* Main Tap Area */}
                <div className="relative">
                  {/* Outer pulse rings - only when active */}
                  {isActive && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary/20"
                        animate={{ scale: [1, 1.3, 1.3], opacity: [0.4, 0, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                        style={{ margin: -8 }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary/15"
                        animate={{ scale: [1, 1.5, 1.5], opacity: [0.3, 0, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                        style={{ margin: -8 }}
                      />
                    </>
                  )}

                  <motion.div
                    className={`relative w-44 h-44 rounded-full flex items-center justify-center cursor-pointer select-none transition-colors duration-300 ${
                      isActive
                        ? 'bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-2xl shadow-primary/30'
                        : 'bg-gradient-to-br from-muted to-muted/80 shadow-lg'
                    }`}
                    onClick={isActive ? recordKick : undefined}
                    whileTap={isActive ? { scale: 0.92 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    {/* Inner glow ring */}
                    {isActive && (
                      <div className="absolute inset-2 rounded-full border border-primary-foreground/20" />
                    )}

                    <div className="text-center z-10">
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={kicks.length}
                          initial={{ scale: 1.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          className={`text-4xl font-bold leading-none ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                        >
                          {kicks.length}
                        </motion.div>
                      </AnimatePresence>
                      <div className={`text-sm mt-1 font-medium ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground/60'}`}>
                        {t('toolsInternal.kickCounter.kicks')}
                      </div>
                    </div>

                    {/* Ripple effect on tap */}
                    {isActive && kicks.length > 0 && (
                      <motion.div
                        key={`ripple-${kicks.length}`}
                        className="absolute inset-0 rounded-full bg-primary-foreground/20"
                        initial={{ scale: 0.5, opacity: 0.6 }}
                        animate={{ scale: 1.2, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </motion.div>
                </div>

                {/* Gesture Hint - Before starting */}
                {!isActive && (
                  <motion.div 
                    className="mt-6 flex flex-col items-center gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-sm text-muted-foreground text-center max-w-[220px] leading-relaxed">
                      {t('toolsInternal.kickCounter.startHint')}
                    </p>
                    <Button
                      className="px-8 h-12 text-sm font-bold rounded-2xl shadow-lg shadow-primary/20"
                      onClick={startSession}
                    >
                      <Play className="w-4 h-4 me-2" />
                      {t('toolsInternal.kickCounter.startNewSession')}
                    </Button>
                  </motion.div>
                )}

                {/* Active State - Tap hint with animated hand */}
                {isActive && (
                  <motion.div 
                    className="mt-5 flex flex-col items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {/* Animated tap gesture */}
                    <motion.div
                      className="flex items-center gap-2 text-primary"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <motion.span 
                        className="text-2xl"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        👆
                      </motion.span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {t('toolsInternal.kickCounter.tapCircle')}
                      </span>
                    </motion.div>

                    {/* Last kick time */}
                    {kicks.length > 0 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] text-muted-foreground/60"
                      >
                        {t('toolsInternal.kickCounter.lastKick')}: {new Date(kicks[kicks.length - 1].time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </motion.p>
                    )}

                    {/* Goal progress indicator */}
                    <div className="w-full max-w-[200px]">
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground">{t('toolsInternal.kickCounter.goal', 'الهدف')}</span>
                        <span className="text-[10px] font-bold text-primary">{kicks.length}/10</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (kicks.length / 10) * 100)}%` }}
                          transition={{ type: "spring", stiffness: 100 }}
                        />
                      </div>
                    </div>

                    {/* End Session Button */}
                    <Button
                      variant="outline"
                      className="h-10 text-xs rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 mt-1"
                      onClick={endSession}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="w-3.5 h-3.5 me-1.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5 me-1.5" />
                      )}
                      {t('toolsInternal.kickCounter.endAndSave')}
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Notes - Compact */}
              {isActive && kicks.length >= 3 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4"
                >
                  <Textarea
                    placeholder={t('toolsInternal.kickCounter.notesPlaceholder')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none text-xs rounded-xl"
                    rows={2}
                  />
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Success celebration when goal reached */}
        <AnimatePresence>
          {isActive && kicks.length === 10 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-4 text-center"
            >
              <motion.span 
                className="text-3xl block mb-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                🎉
              </motion.span>
               <p className="text-sm font-bold text-foreground">{t('toolsInternal.kickCounter.goalReached')}</p>
               <p className="text-xs text-muted-foreground mt-1">{t('toolsInternal.kickCounter.goalReachedDesc')}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold">{getAverageKicks()}</div>
              <p className="text-xs text-muted-foreground">{t('toolsInternal.kickCounter.avgKicks')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold">{history.length}</div>
              <p className="text-xs text-muted-foreground">{t('toolsInternal.kickCounter.sessions')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 text-center">
              <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold">
                {history.length > 0 
                  ? Math.round(history.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / history.length)
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">{t('toolsInternal.kickCounter.avgMin')}</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Section - always visible after 1+ sessions */}
        {history.length >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Section header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(330 70% 55% / 0.1))' }}>
                <Brain className="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{t('toolsInternal.kickCounter.aiDataAnalysis')}</h3>
            </div>

            {/* 3 AI action cards */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { tab: 'pattern' as const, onClick: () => analyzePatterns(history), icon: BarChart3, label: t('toolsInternal.kickCounter.patterns'), color: 'from-primary/10 to-primary/5', minSessions: 2 },
                { tab: 'health' as const, onClick: getHealthInsight, icon: Heart, label: t('toolsInternal.kickCounter.health'), color: 'from-pink-500/10 to-pink-500/5', minSessions: 1 },
                { tab: 'tips' as const, onClick: getAITips, icon: Sparkles, label: t('toolsInternal.kickCounter.tips'), color: 'from-purple-500/10 to-purple-500/5', minSessions: 1 },
              ].map(({ tab, onClick, icon: Icon, label, color, minSessions }) => {
                const isSelected = aiActiveTab === tab;
                const isDisabled = aiLoading || history.length < minSessions;
                return (
                  <motion.button
                    key={tab}
                    whileTap={{ scale: 0.95 }}
                    disabled={isDisabled}
                    onClick={() => {
                      setAiActiveTab(tab);
                      onClick();
                    }}
                    className={`relative rounded-xl p-3 text-center transition-all border disabled:opacity-40 ${
                      isSelected 
                        ? 'border-primary/30 shadow-sm' 
                        : 'border-border/40 hover:border-primary/20'
                    } bg-gradient-to-b ${color}`}
                  >
                    <div className={`w-8 h-8 rounded-full mx-auto mb-1.5 flex items-center justify-center ${isSelected ? 'bg-primary/15' : 'bg-muted/50'}`}>
                      {aiLoading && isSelected ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      ) : (
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      )}
                    </div>
                    <span className={`text-[11px] font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                    {history.length < minSessions && (
                      <p className="text-[8px] text-muted-foreground/60 mt-0.5">{t('toolsInternal.kickCounter.needMoreSessions', '٢+ جلسات')}</p>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* AI Result */}
            <AnimatePresence mode="wait">
              {aiActiveTab && (aiPatternAnalysis || aiHealthInsight || aiTips || aiLoading) && (
                <motion.div
                  key={aiActiveTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="overflow-hidden border-border/40">
                    <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))' }} />
                    <CardContent className="p-4">
                      {aiLoading && !aiPatternAnalysis && !aiHealthInsight && !aiTips ? (
                        <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-xs">{t('toolsInternal.kickCounter.analyzingMovements')}</span>
                        </div>
                      ) : (
                        <>
                          <MarkdownRenderer
                            content={
                              aiActiveTab === 'pattern' ? aiPatternAnalysis :
                              aiActiveTab === 'health' ? aiHealthInsight :
                              aiTips
                            }
                            isLoading={aiLoading}
                          />
                          {/* Refresh */}
                          {!aiLoading && (
                            <div className="flex justify-end mt-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[10px] text-muted-foreground"
                                onClick={() => {
                                  if (aiActiveTab === 'pattern') analyzePatterns(history);
                                  else if (aiActiveTab === 'health') getHealthInsight();
                                  else getAITips();
                                }}
                              >
                                <RefreshCw className="w-3 h-3 me-1" />
                                {t('common.refresh', 'تحديث')}
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                      {/* Disclaimer */}
                      <div className="mt-3 mx-auto max-w-[85%] px-3 py-1.5 rounded-full bg-muted/40 border border-border/30 text-center">
                        <p className="text-[9px] text-muted-foreground/60 tracking-wide">
                          {t('ai.resultDisclaimer', 'AI-generated • Consult your healthcare provider')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state when no tab selected */}
            {!aiActiveTab && !aiLoading && (
              <div className="text-center py-4 bg-muted/20 rounded-xl border border-border/30">
                <p className="text-xs text-muted-foreground">
                  {t('toolsInternal.kickCounter.tapForInsights')}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* History */}
        {history.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                {t('toolsInternal.kickCounter.recentSessions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.map((session, index) => (
                  <motion.div 
                    key={session.id || index} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Baby className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {session.total_kicks} {t('toolsInternal.kickCounter.movements')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('toolsInternal.kickCounter.minWeek', { min: session.duration_minutes, week: session.week })}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(session.started_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Baby className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground text-xs mb-1">{t('toolsInternal.kickCounter.whenToCallDoctor')}</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• {t('toolsInternal.kickCounter.warningFewer')}</li>
                  <li>• {t('toolsInternal.kickCounter.warningDecrease')}</li>
                  <li>• {t('toolsInternal.kickCounter.warningNoMovements')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Tools */}
        <RelatedToolLinks links={[
          { to: "/tools/fetal-growth", titleKey: "toolsInternal.kickCounter.fetalDevLink", titleFallback: "Fetal Development", descKey: "toolsInternal.kickCounter.fetalDevLinkDesc", descFallback: "Track your baby's growth week by week", icon: "ruler" },
          { to: "/tools/weight-gain", titleKey: "toolsInternal.kickCounter.weightGainLink", titleFallback: "Weight Gain Analyzer", descKey: "toolsInternal.kickCounter.weightGainLinkDesc", descFallback: "Monitor healthy weight gain", icon: "trending" },
          { to: "/tools/weekly-summary", titleKey: "toolsInternal.kickCounter.weeklySummaryLink", titleFallback: "Weekly Summary", descKey: "toolsInternal.kickCounter.weeklySummaryLinkDesc", descFallback: "Get AI-powered weekly insights", icon: "trending" },
        ]} />

        {/* Educational Note */}
        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">
            💡 {t('toolsInternal.kickCounter.educationalNote')}
          </p>
        </div>
      </div>
    </ToolFrame>
  );
};

export default SmartKickCounter;