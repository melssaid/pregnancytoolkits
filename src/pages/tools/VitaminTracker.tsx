import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Pill, Check, Clock, TrendingUp, Loader2, Brain, RefreshCw, Droplets, Sun, Fish, Bone, Dna } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { VitaminService } from '@/services/localStorageServices';
import { ToolFrame } from '@/components/ToolFrame';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { AIResponseFrame } from '@/components/ai/AIResponseFrame';
import { WeekSlider } from '@/components/WeekSlider';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AILoadingDots } from '@/components/ai/AILoadingDots';
import { RelatedToolLinks } from '@/components/RelatedToolLinks';

interface VitaminDef {
  id: string;
  nameKey: string;
  icon: React.ElementType;
}

const VITAMIN_DEFS: VitaminDef[] = [
  { id: 'folic-acid', nameKey: 'folicAcid', icon: Dna },
  { id: 'iron', nameKey: 'iron', icon: Droplets },
  { id: 'calcium', nameKey: 'calcium', icon: Bone },
  { id: 'vitamin-d', nameKey: 'vitaminD', icon: Sun },
  { id: 'omega-3', nameKey: 'omega3', icon: Fish },
];

interface Vitamin {
  id: string;
  name: string;
  dosage: string;
  icon: React.ElementType;
  importance: string;
}

const VitaminTracker: React.FC = () => {
  const { t } = useTranslation();
  const { profile: userProfile } = useUserProfile();
  const [todayLogs, setTodayLogs] = useState<any[]>([]);
  const [weekHistory, setWeekHistory] = useState<any[]>([]);
  const [currentWeek, setCurrentWeek] = useState(userProfile.pregnancyWeek || 0);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
  const { toast } = useToast();
  const { streamChat, isLoading: aiLoading } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setAiAnalysis('');
    setShowAiAnalysis(false);
  });

  useEffect(() => {
    if (userProfile.pregnancyWeek) setCurrentWeek(userProfile.pregnancyWeek);
  }, [userProfile.pregnancyWeek]);

  const VITAMINS: Vitamin[] = useMemo(() => VITAMIN_DEFS.map(v => ({
    id: v.id,
    name: t(`toolsInternal.vitaminTracker.vitamins.${v.nameKey}`),
    dosage: t(`toolsInternal.vitaminTracker.dosages.${v.nameKey}`),
    icon: v.icon,
    importance: t(`toolsInternal.vitaminTracker.importance.${v.nameKey}`)
  })), [t]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [today, history] = await Promise.all([
        VitaminService.getTodayLogs(),
        VitaminService.getHistory(7)
      ]);
      setTodayLogs(today);
      setWeekHistory(history);
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
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
      toast({ title: t('toolsInternal.vitaminTracker.failedToLog'), description: error.message, variant: 'destructive' });
    } finally {
      setSavingId(null);
    }
  };

  const isVitaminTakenToday = (vitaminName: string) => todayLogs.some(log => log.vitamin_name === vitaminName);

  const getWeeklyStats = () => {
    const stats: Record<string, number> = {};
    VITAMINS.forEach(v => { stats[v.name] = weekHistory.filter(log => log.vitamin_name === v.name).length; });
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
    const prompt = `As a prenatal nutrition specialist, analyze this vitamin intake data for a woman in week ${currentWeek} of pregnancy:\n\nToday: Taken: ${takenVitamins.join(', ') || 'None'}, Missed: ${missedVitamins.join(', ') || 'All taken!'}, Progress: ${getTodayProgress()}%\nWeekly: ${weeklyData}\n\nProvide:\n1. Intake assessment and score\n2. Priority vitamins for week ${currentWeek}\n3. Interaction warnings\n4. Absorption tips\n5. 3 weekly goals`;

    await streamChat({
      type: 'pregnancy-assistant',
      messages: [{ role: 'user', content: prompt }],
      context: { week: currentWeek },
      onDelta: (text) => setAiAnalysis(prev => prev + text),
      onDone: () => {},
    });
  };

  const weeklyStats = getWeeklyStats();
  const todayProgress = getTodayProgress();

  if (isLoading) {
    return (
      <ToolFrame title={t('tools.vitaminTracker.title')} subtitle={t('toolsInternal.vitaminTracker.subtitle')} mood="joyful" toolId="vitamin-tracker">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ToolFrame>
    );
  }

  return (
    <ToolFrame title={t('tools.vitaminTracker.title')} subtitle={t('toolsInternal.vitaminTracker.subtitle')} mood="joyful" toolId="vitamin-tracker">
      <div className="space-y-4">
        {/* Week Selector */}
        <WeekSlider week={currentWeek} onChange={setCurrentWeek} showTrimester label={t('toolsInternal.vitaminTracker.pregnancyWeek')} />

        {/* Progress + AI */}
        <Card>
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {t('toolsInternal.vitaminTracker.vitaminsCount', { taken: todayLogs.length, total: VITAMINS.length })}
              </span>
              <span className="text-xs font-bold text-primary">{todayProgress}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${todayProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <motion.button
              onClick={getAIAnalysis}
              disabled={aiLoading}
              whileTap={{ scale: 0.95 }}
              className="w-full relative overflow-hidden rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="w-full flex items-center justify-center gap-2 px-4 h-10 font-semibold text-white text-[13px] rounded-xl bg-primary" style={{ boxShadow: '0 4px 16px -4px hsl(var(--primary) / 0.4)' }}>
                {aiLoading ? (
                  <AILoadingDots text={t('toolsInternal.vitaminTracker.analyzing')} />
                ) : (
                  <><Brain className="w-4 h-4 shrink-0" /><span>{t('toolsInternal.vitaminTracker.analyzeRoutine')}</span></>
                )}
              </div>
            </motion.button>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        {showAiAnalysis && (
          <AIResponseFrame
            content={aiAnalysis || ''}
            isLoading={aiLoading}
            title={t('toolsInternal.vitaminTracker.aiAnalysisTitle')}
            icon={Brain}
            footer={
              !aiAnalysis ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-xs">{t('toolsInternal.vitaminTracker.analyzingIntake')}</span>
                </div>
              ) : undefined
            }
          />
        )}

        {/* Vitamins List */}
        <div className="space-y-2">
          {VITAMINS.map((vitamin, index) => {
            const taken = isVitaminTakenToday(vitamin.name);
            const isSaving = savingId === vitamin.id;
            const weekCount = weeklyStats[vitamin.name] || 0;
            const Icon = vitamin.icon;

            return (
              <motion.div
                key={vitamin.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`transition-all ${taken ? 'opacity-60 border-primary/30 bg-primary/5' : 'border-border'}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        taken ? 'bg-primary/10' : 'bg-muted/50'
                      }`}>
                        {taken ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}>
                            <Check className="w-5 h-5 text-primary" />
                          </motion.div>
                        ) : (
                          <Icon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm text-foreground">{vitamin.name}</h3>
                            <p className="text-[10px] text-muted-foreground">{vitamin.dosage}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <Button
                              variant={taken ? 'outline' : 'default'}
                              size="sm"
                              onClick={() => handleTakeVitamin(vitamin)}
                              disabled={taken || isSaving}
                              className="text-[11px] h-7 px-2.5 gap-1"
                            >
                              {isSaving ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : taken ? (
                                <><Check className="w-3 h-3" /> {t('toolsInternal.vitaminTracker.done')}</>
                              ) : (
                                t('toolsInternal.vitaminTracker.take')
                              )}
                            </Button>
                            <span className="text-[9px] text-muted-foreground">
                              {weekCount}/7 {t('toolsInternal.vitaminTracker.thisWeek')}
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{vitamin.importance}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Weekly Stats */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-semibold">{t('toolsInternal.vitaminTracker.weeklyStats')}</h3>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {VITAMINS.map(vitamin => {
                const count = weeklyStats[vitamin.name] || 0;
                const percentage = Math.round((count / 7) * 100);
                const Icon = vitamin.icon;
                return (
                  <div key={vitamin.id} className="text-center p-2 bg-muted/30 rounded-lg">
                    <Icon className="w-4 h-4 mx-auto text-primary mb-1" />
                    <div className="w-full bg-muted rounded-full h-1 mt-1">
                      <div className="bg-primary h-1 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1">{count}/7</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent History */}
        {weekHistory.length > 0 && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-semibold">{t('toolsInternal.vitaminTracker.recentHistory')}</h3>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {weekHistory.slice(0, 8).map((log, index) => {
                  const vitDef = VITAMIN_DEFS.find(v => {
                    const translatedName = t(`toolsInternal.vitaminTracker.vitamins.${v.nameKey}`);
                    return translatedName === log.vitamin_name;
                  });
                  const Icon = vitDef?.icon || Pill;
                  return (
                    <div key={log.id || index} className="flex items-center justify-between p-1.5 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-medium">{log.vitamin_name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(log.taken_at).toLocaleDateString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Related Nutrition Tools */}
        <RelatedToolLinks links={[
          { to: "/tools/ai-meal-suggestion", titleKey: "nutritionLinks.mealSuggestionLink", titleFallback: "AI Meal Planner", descKey: "nutritionLinks.mealSuggestionLinkDesc", descFallback: "Get personalized meal suggestions", icon: "utensils" },
          { to: "/tools/smart-grocery-list", titleKey: "nutritionLinks.groceryListLink", titleFallback: "Smart Grocery List", descKey: "nutritionLinks.groceryListLinkDesc", descFallback: "Build a pregnancy-optimized shopping list", icon: "cart" },
          { to: "/tools/ai-craving-alternatives", titleKey: "nutritionLinks.cravingLink", titleFallback: "Craving Alternatives", descKey: "nutritionLinks.cravingLinkDesc", descFallback: "Find healthy swaps for your cravings", icon: "utensils" },
        ]} />
      </div>
    </ToolFrame>
  );
};

export default VitaminTracker;
