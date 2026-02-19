import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Baby, Play, TrendingUp, Clock, Loader2, Save, Sparkles, AlertTriangle, Activity, BarChart3, Brain, RefreshCw, Zap, ChevronDown, ChevronUp, Target, Shield } from 'lucide-react';
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
  const [currentWeek, setCurrentWeek] = useState(userProfile.pregnancyWeek ?? 28);
  const [history, setHistory] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // AI States
  const [aiPatternAnalysis, setAiPatternAnalysis] = useState('');
  const [aiHealthInsight, setAiHealthInsight] = useState('');
  const [aiActiveTab, setAiActiveTab] = useState<'pattern' | 'health' | 'tips'>('pattern');
  const [aiTips, setAiTips] = useState('');
  const [showAIDetails, setShowAIDetails] = useState(false);
  
  const { streamChat, isLoading: aiLoading } = usePregnancyAI();
  const { toast } = useToast();

  useResetOnLanguageChange(() => {
    setAiPatternAnalysis('');
    setAiHealthInsight('');
    setAiTips('');
  });

  useEffect(() => {
    // Sync week from central profile
    setCurrentWeek(userProfile.pregnancyWeek ?? 28);
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

    const prompt = `As a pregnancy wellness educator, review this baby movement diary for a pregnancy at week ${currentWeek}. Use supportive, non-clinical language. Do NOT use words like "danger", "high risk", "go to hospital", or provide any medical diagnoses.

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
      type: 'pregnancy-assistant',
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

    const prompt = `As a pregnancy wellness educator, provide supportive guidance based on baby movement diary data. Do NOT use clinical or diagnostic language. Avoid words like "danger", "high risk", "warning signs", or "go to hospital".

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
      type: 'pregnancy-assistant',
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

    const prompt = `As a pregnancy wellness educator, provide practical journaling tips for baby movement at week ${currentWeek}. Use warm, encouraging language. Avoid clinical or diagnostic terminology.

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
      type: 'pregnancy-assistant',
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
      <div className="space-y-6">
        {/* Movement Score Card */}
        {history.length > 0 && (
          <Card className="bg-gradient-to-br from-primary/5 to-secondary border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('toolsInternal.kickCounter.movementScore')}</p>
                  <div className={`text-xl font-bold ${getScoreColor(movementScore)}`}>
                    {movementScore}
                    <span className="text-sm text-muted-foreground">/100</span>
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
        <Card className="shadow-xl">
          <CardContent className="p-6">
            {/* Timer Display */}
            <div className="text-center mb-6">
              <div className="text-2xl font-bold text-foreground mb-2">
                {formatTime(elapsedTime)}
              </div>
              <p className="text-muted-foreground">{t('toolsInternal.kickCounter.elapsedTime')}</p>
            </div>

            {/* Kick Count Display */}
            <motion.div 
              className={`relative w-44 h-44 mx-auto rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-br from-primary to-primary/80 hover:scale-105 active:scale-95 shadow-2xl' 
                  : 'bg-muted'
              }`}
              onClick={isActive ? recordKick : undefined}
              whileTap={isActive ? { scale: 0.95 } : {}}
            >
              <div className="text-center text-primary-foreground">
                <motion.div 
                  key={kicks.length}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold"
                >
                  {kicks.length}
                </motion.div>
                <div className="text-sm opacity-90">{t('toolsInternal.kickCounter.kicks')}</div>
              </div>
              
              {isActive && (
                <motion.div 
                  className="absolute inset-0 rounded-full border-4 border-primary-foreground/30"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>

            {isActive && (
              <p className="text-center text-muted-foreground mt-4 animate-pulse">
                👆 {t('toolsInternal.kickCounter.tapCircle')}
              </p>
            )}

            {/* Control Buttons */}
            <div className="flex justify-center gap-4 mt-6">
              {!isActive ? (
                <Button
                  size="lg"
                  className="px-8"
                  onClick={startSession}
                >
                  <Play className="w-5 h-5 mr-2" />
                  {t('toolsInternal.kickCounter.startNewSession')}
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={endSession}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  {t('toolsInternal.kickCounter.endAndSave')}
                </Button>
              )}
            </div>

            {/* Notes */}
            {isActive && (
              <div className="mt-4">
                <Textarea
                  placeholder={t('toolsInternal.kickCounter.notesPlaceholder')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <TrendingUp className="w-6 h-6 text-primary mx-auto mb-1" />
              <div className="text-xl font-bold">{getAverageKicks()}</div>
              <p className="text-xs text-muted-foreground">{t('toolsInternal.kickCounter.avgKicks')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <Clock className="w-6 h-6 text-primary mx-auto mb-1" />
              <div className="text-xl font-bold">{history.length}</div>
              <p className="text-xs text-muted-foreground">{t('toolsInternal.kickCounter.sessions')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 text-center">
              <Zap className="w-6 h-6 text-primary mx-auto mb-1" />
              <div className="text-xl font-bold">
                {history.length > 0 
                  ? Math.round(history.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / history.length)
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">{t('toolsInternal.kickCounter.avgMin')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced AI Analysis Section */}
        {history.length >= 2 && (
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/10 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {t('toolsInternal.kickCounter.aiDataAnalysis')}
                </h3>
                <div className="flex items-center gap-2">
                  {(aiPatternAnalysis || aiHealthInsight || aiTips) && !aiLoading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (aiActiveTab === 'pattern') analyzePatterns(history);
                        else if (aiActiveTab === 'health') getHealthInsight();
                        else getAITips();
                      }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAIDetails(!showAIDetails)}
                  >
                    {showAIDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Quick AI Summary Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-background/60 rounded-lg p-3 text-center">
                  <Target className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <div className="text-lg font-bold">{getAverageKicks()}</div>
                  <p className="text-[10px] text-muted-foreground">{t('toolsInternal.kickCounter.avgPerSession')}</p>
                </div>
                <div className="bg-background/60 rounded-lg p-3 text-center">
                  <Activity className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <div className={`text-lg font-bold ${getScoreColor(movementScore)}`}>
                    {movementScore}%
                  </div>
                  <p className="text-[10px] text-muted-foreground">{t('toolsInternal.kickCounter.healthScore')}</p>
                </div>
                <div className="bg-background/60 rounded-lg p-3 text-center">
                  <Shield className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <div className="text-lg font-bold text-accent">
                    {movementScore >= 70 ? '✓' : movementScore >= 40 ? '!' : '⚠'}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{t('toolsInternal.kickCounter.status')}</p>
                </div>
              </div>

              <AnimatePresence>
                {showAIDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {/* AI Tab Buttons */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <Button
                        variant={aiActiveTab === 'pattern' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => analyzePatterns(history)}
                        disabled={aiLoading}
                        className="gap-1"
                      >
                        {aiLoading && aiActiveTab === 'pattern' ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <BarChart3 className="w-3 h-3" />
                        )}
                        <span className="text-xs">{t('toolsInternal.kickCounter.patterns')}</span>
                      </Button>
                      <Button
                        variant={aiActiveTab === 'health' ? 'default' : 'outline'}
                        size="sm"
                        onClick={getHealthInsight}
                        disabled={aiLoading}
                        className="gap-1"
                      >
                        {aiLoading && aiActiveTab === 'health' ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Activity className="w-3 h-3" />
                        )}
                        <span className="text-xs">{t('toolsInternal.kickCounter.health')}</span>
                      </Button>
                      <Button
                        variant={aiActiveTab === 'tips' ? 'default' : 'outline'}
                        size="sm"
                        onClick={getAITips}
                        disabled={aiLoading}
                        className="gap-1"
                      >
                        {aiLoading && aiActiveTab === 'tips' ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Brain className="w-3 h-3" />
                        )}
                        <span className="text-xs">{t('toolsInternal.kickCounter.tips')}</span>
                      </Button>
                    </div>

                    {/* AI Content */}
                    {(aiPatternAnalysis || aiHealthInsight || aiTips || aiLoading) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-background/50 rounded-xl p-4 max-h-[400px] overflow-y-auto"
                      >
                        {aiLoading && !aiPatternAnalysis && !aiHealthInsight && !aiTips ? (
                          <div className="flex items-center justify-center py-8 text-muted-foreground">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            {t('toolsInternal.kickCounter.analyzingMovements')}
                          </div>
                        ) : (
                          <MarkdownRenderer 
                            content={
                              aiActiveTab === 'pattern' ? aiPatternAnalysis :
                              aiActiveTab === 'health' ? aiHealthInsight :
                              aiTips
                            } 
                          />
                        )}
                      </motion.div>
                    )}

                    {!aiPatternAnalysis && !aiHealthInsight && !aiTips && !aiLoading && (
                      <div className="text-center py-6">
                        <Brain className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                          {t('toolsInternal.kickCounter.tapForInsights')}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {!showAIDetails && (
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => setShowAIDetails(true)}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {t('toolsInternal.kickCounter.viewDetailedAnalysis')}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* History */}
        {history.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-primary" />
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
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Baby className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">{t('toolsInternal.kickCounter.whenToCallDoctor')}</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {t('toolsInternal.kickCounter.warningFewer')}</li>
                  <li>• {t('toolsInternal.kickCounter.warningDecrease')}</li>
                  <li>• {t('toolsInternal.kickCounter.warningNoMovements')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

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