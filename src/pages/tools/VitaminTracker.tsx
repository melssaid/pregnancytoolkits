import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Pill, Check, Clock, Calendar, TrendingUp, Loader2, Sparkles, Brain, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { VitaminService, UserProfileService } from '@/services/localStorageServices';
import { ToolFrame } from '@/components/ToolFrame';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { WeekSlider } from '@/components/WeekSlider';
import { useTranslation } from 'react-i18next';

interface Vitamin {
  id: string;
  name: string;
  dosage: string;
  icon: string;
  color: string;
  importance: string;
}

const VITAMIN_IDS = [
  { id: 'folic-acid', nameKey: 'folicAcid', icon: '🧬', color: 'bg-green-100 border-green-400' },
  { id: 'iron', nameKey: 'iron', icon: '💪', color: 'bg-red-100 border-red-400' },
  { id: 'calcium', nameKey: 'calcium', icon: '🦴', color: 'bg-blue-100 border-blue-400' },
  { id: 'vitamin-d', nameKey: 'vitaminD', icon: '☀️', color: 'bg-yellow-100 border-yellow-400' },
  { id: 'omega-3', nameKey: 'omega3', icon: '🐟', color: 'bg-cyan-100 border-cyan-400' },
  { id: 'prenatal', nameKey: 'prenatal', icon: '💊', color: 'bg-purple-100 border-purple-400' },
];

const VitaminTracker: React.FC = () => {
  const { t } = useTranslation();
  const [todayLogs, setTodayLogs] = useState<any[]>([]);
  const [weekHistory, setWeekHistory] = useState<any[]>([]);
  const [currentWeek, setCurrentWeek] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
  const { toast } = useToast();
  const { streamChat, isLoading: aiLoading } = usePregnancyAI();

  const VITAMINS: Vitamin[] = useMemo(() => VITAMIN_IDS.map(v => ({
    id: v.id,
    name: t(`toolsInternal.vitaminTracker.vitamins.${v.nameKey}`),
    dosage: t(`toolsInternal.vitaminTracker.dosages.${v.nameKey}`),
    icon: v.icon,
    color: v.color,
    importance: t(`toolsInternal.vitaminTracker.importance.${v.nameKey}`)
  })), [t]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const profile = await UserProfileService.get();
      if (profile?.pregnancy_week) {
        setCurrentWeek(profile.pregnancy_week);
      }
      
      const [today, history] = await Promise.all([
        VitaminService.getTodayLogs(),
        VitaminService.getHistory(7)
      ]);
      
      setTodayLogs(today);
      setWeekHistory(history);
      
    } catch (error: any) {
      console.error('Error loading vitamins:', error);
      toast({
        title: 'Loading Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakeVitamin = async (vitamin: Vitamin) => {
    const alreadyTaken = todayLogs.some(log => log.vitamin_name === vitamin.name);
    if (alreadyTaken) {
      toast({
        title: t('toolsInternal.vitaminTracker.alreadyTaken'),
        description: t('toolsInternal.vitaminTracker.alreadyTakenDesc', { name: vitamin.name }),
      });
      return;
    }

    try {
      setSavingId(vitamin.id);
      
      const newLog = await VitaminService.log(vitamin.name, vitamin.dosage, currentWeek);
      
      setTodayLogs(prev => [...prev, newLog]);
      setWeekHistory(prev => [newLog, ...prev]);
      
      toast({
        title: t('toolsInternal.vitaminTracker.logged'),
        description: t('toolsInternal.vitaminTracker.loggedDesc', { name: vitamin.name })
      });
      
    } catch (error: any) {
      toast({
        title: t('toolsInternal.vitaminTracker.failedToLog'),
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSavingId(null);
    }
  };

  const isVitaminTakenToday = (vitaminName: string) => {
    return todayLogs.some(log => log.vitamin_name === vitaminName);
  };

  const getWeeklyStats = () => {
    const stats: Record<string, number> = {};
    VITAMINS.forEach(v => {
      stats[v.name] = weekHistory.filter(log => log.vitamin_name === v.name).length;
    });
    return stats;
  };

  const getTodayProgress = () => {
    const taken = VITAMINS.filter(v => isVitaminTakenToday(v.name)).length;
    return Math.round((taken / VITAMINS.length) * 100);
  };

  const getAIAnalysis = async () => {
    setShowAiAnalysis(true);
    setAiAnalysis('');

    const takenVitamins = VITAMINS.filter(v => isVitaminTakenToday(v.name)).map(v => v.name);
    const missedVitamins = VITAMINS.filter(v => !isVitaminTakenToday(v.name)).map(v => v.name);
    const weeklyData = Object.entries(weeklyStats).map(([name, count]) => `${name}: ${count}/7 days`).join(', ');

    const prompt = `As a prenatal nutrition specialist, analyze this vitamin intake data for a woman in week ${currentWeek} of pregnancy:

**Today's Intake:**
- Taken: ${takenVitamins.length > 0 ? takenVitamins.join(', ') : 'None yet'}
- Missed: ${missedVitamins.length > 0 ? missedVitamins.join(', ') : 'All taken!'}
- Progress: ${getTodayProgress()}%

**Weekly Consistency:**
${weeklyData}

Please provide a comprehensive analysis:

## 📊 Intake Assessment
- Overall score and rating
- Strengths in current routine
- Areas needing improvement

## 💊 Personalized Recommendations
- Priority vitamins for week ${currentWeek}
- Optimal timing for each supplement
- Best food sources to complement supplements

## ⚠️ Interaction Warnings
- Which vitamins should NOT be taken together
- Time gaps needed between certain supplements
- Foods/drinks to avoid with specific vitamins

## 🍽️ Absorption Tips
- How to maximize nutrient absorption
- Pairing suggestions (e.g., Iron + Vitamin C)
- When to take with vs without food

## 📅 Weekly Goals
- 3 actionable goals for this week
- Reminder strategy suggestions

Keep advice practical and specific to pregnancy week ${currentWeek}.`;

    await streamChat({
      type: 'pregnancy-assistant',
      messages: [{ role: 'user', content: prompt }],
      context: { week: currentWeek },
      onDelta: (text) => setAiAnalysis(prev => prev + text),
      onDone: () => {},
    });
  };

  const weeklyStats = getWeeklyStats();

  if (isLoading) {
    return (
      <ToolFrame
        title={t('tools.vitaminTracker.title')}
        subtitle={t('toolsInternal.vitaminTracker.subtitle')}
        mood="joyful"
        toolId="vitamin-tracker"
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ToolFrame>
    );
  }

  const todayProgress = getTodayProgress();

  return (
    <ToolFrame
      title={t('tools.vitaminTracker.title')}
      subtitle={t('toolsInternal.vitaminTracker.subtitle')}
      mood="joyful"
      toolId="vitamin-tracker"
    >
      <div className="space-y-6">
        {/* Week Selector */}
        <WeekSlider
          week={currentWeek}
          onChange={setCurrentWeek}
          showTrimester
          label={t('toolsInternal.vitaminTracker.pregnancyWeek')}
        />
        {/* Today's Progress */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {t('toolsInternal.vitaminTracker.todaysProgress')}
              </span>
              <span className="text-2xl font-bold text-primary">{todayProgress}%</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-3 mb-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-pink-500 h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${todayProgress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {t('toolsInternal.vitaminTracker.vitaminsCount', { taken: todayLogs.length, total: VITAMINS.length })}
            </p>
          </CardContent>
        </Card>

        {/* AI Analysis Card */}
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-violet-500" />
                {t('toolsInternal.vitaminTracker.aiAnalysisTitle')}
              </span>
              {showAiAnalysis && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={getAIAnalysis}
                  disabled={aiLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showAiAnalysis ? (
              <Button
                onClick={getAIAnalysis}
                disabled={aiLoading}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
              >
                {aiLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {t('toolsInternal.vitaminTracker.analyzeRoutine')}
              </Button>
            ) : (
              <div className="bg-white/50 dark:bg-black/20 rounded-xl p-4 max-h-[400px] overflow-y-auto">
                {aiAnalysis ? (
                  <MarkdownRenderer content={aiAnalysis} isLoading={aiLoading} />
                ) : (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    {t('toolsInternal.vitaminTracker.analyzingIntake')}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vitamins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VITAMINS.map((vitamin) => {
            const taken = isVitaminTakenToday(vitamin.name);
            const isSaving = savingId === vitamin.id;
            const weekCount = weeklyStats[vitamin.name] || 0;
            
            return (
              <Card
                key={vitamin.id}
                className={`border-2 transition-all duration-300 hover:shadow-lg ${
                  taken
                    ? 'bg-green-50 border-green-400 shadow-green-100'
                    : vitamin.color
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{vitamin.icon}</span>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{vitamin.name}</h3>
                        <p className="text-sm text-gray-600">{vitamin.dosage}</p>
                        <p className="text-xs text-gray-500 mt-1">{vitamin.importance}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                        <Button
                          variant={taken ? 'default' : 'outline'}
                          size="sm"
                          className={taken ? 'bg-green-500 hover:bg-green-600' : 'hover:bg-purple-100'}
                          onClick={() => handleTakeVitamin(vitamin)}
                          disabled={taken || isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : taken ? (
                            <><Check className="w-4 h-4 mr-1" /> {t('toolsInternal.vitaminTracker.done')}</>
                          ) : (
                            t('toolsInternal.vitaminTracker.take')
                          )}
                      </Button>
                      <span className="text-xs text-gray-500">
                        {weekCount}/7 {t('toolsInternal.vitaminTracker.thisWeek')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Weekly Stats */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              {t('toolsInternal.vitaminTracker.weeklyStats')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {VITAMINS.map(vitamin => {
                const count = weeklyStats[vitamin.name] || 0;
                const percentage = Math.round((count / 7) * 100);
                
                return (
                  <div key={vitamin.id} className="text-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">{vitamin.icon}</span>
                    <p className="text-sm font-medium mt-1">{vitamin.name}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{count}/7 {t('toolsInternal.vitaminTracker.days')}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent History */}
        {weekHistory.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                {t('toolsInternal.vitaminTracker.recentHistory')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {weekHistory.slice(0, 10).map((log, index) => (
                  <div key={log.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span>{VITAMINS.find(v => v.name === log.vitamin_name)?.icon || '💊'}</span>
                      <span className="font-medium">{log.vitamin_name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(log.taken_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <h3 className="font-bold text-amber-800 mb-2">💡 {t('toolsInternal.vitaminTracker.tipTitle')}</h3>
            <p className="text-amber-700 text-sm">
              {t('toolsInternal.vitaminTracker.tipContent')}
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default VitaminTracker;