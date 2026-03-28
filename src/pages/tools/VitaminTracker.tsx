import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pill, Check, Lightbulb, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToolFrame } from '@/components/ToolFrame';
import { AIInsightCard } from '@/components/ai/AIInsightCard';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { loadFromLocalStorage, saveToLocalStorage } from '@/services/localStorageServices';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyLog {
  [vitaminKey: string]: string; // ISO date of when taken
}

const STORAGE_KEY = 'vitamin-tracker-logs';
const VITAMINS = ['folicAcid', 'iron', 'calcium', 'vitaminD', 'omega3', 'prenatal'] as const;

const VITAMIN_COLORS: Record<string, string> = {
  folicAcid: 'from-pink-500/20 to-pink-500/5 border-pink-500/30',
  iron: 'from-red-500/20 to-red-500/5 border-red-500/30',
  calcium: 'from-sky-500/20 to-sky-500/5 border-sky-500/30',
  vitaminD: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
  omega3: 'from-teal-500/20 to-teal-500/5 border-teal-500/30',
  prenatal: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
};

const VITAMIN_ICONS: Record<string, string> = {
  folicAcid: '💊',
  iron: '🩸',
  calcium: '🦴',
  vitaminD: '☀️',
  omega3: '🐟',
  prenatal: '💎',
};

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function getWeekLogs(allLogs: Record<string, DailyLog>): number {
  const now = new Date();
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const dayLog = allLogs[key];
    if (dayLog) count += Object.keys(dayLog).length;
  }
  return count;
}

function getStreak(allLogs: Record<string, DailyLog>): number {
  const now = new Date();
  let streak = 0;
  for (let i = 0; i < 90; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const dayLog = allLogs[key];
    if (dayLog && Object.keys(dayLog).length > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

const VitaminTracker: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { profile } = useUserProfile();
  const [allLogs, setAllLogs] = useState<Record<string, DailyLog>>({});

  useEffect(() => {
    const stored = loadFromLocalStorage<Record<string, DailyLog>>(STORAGE_KEY);
    if (stored) setAllLogs(stored);
  }, []);

  const todayKey = getTodayKey();
  const todayLog = allLogs[todayKey] || {};
  const takenCount = Object.keys(todayLog).length;
  const totalVitamins = VITAMINS.length;
  const progress = (takenCount / totalVitamins) * 100;

  const weeklyCount = useMemo(() => getWeekLogs(allLogs), [allLogs]);
  const streak = useMemo(() => getStreak(allLogs), [allLogs]);

  const toggleVitamin = useCallback((vitaminKey: string) => {
    const today = getTodayKey();
    const currentDayLog = allLogs[today] || {};

    if (currentDayLog[vitaminKey]) {
      toast({
        title: t('toolsInternal.vitaminTracker.alreadyTaken'),
        description: t('toolsInternal.vitaminTracker.alreadyTakenDesc', { name: t(`toolsInternal.vitaminTracker.vitamins.${vitaminKey}`) }),
      });
      return;
    }

    const updated = {
      ...allLogs,
      [today]: { ...currentDayLog, [vitaminKey]: new Date().toISOString() },
    };
    setAllLogs(updated);
    saveToLocalStorage(STORAGE_KEY, updated);
    toast({
      title: t('toolsInternal.vitaminTracker.logged'),
      description: t('toolsInternal.vitaminTracker.loggedDesc', { name: t(`toolsInternal.vitaminTracker.vitamins.${vitaminKey}`) }),
    });
  }, [allLogs, toast, t]);

  const aiPrompt = useMemo(() => {
    const taken = Object.keys(todayLog).map(k => t(`toolsInternal.vitaminTracker.vitamins.${k}`)).join(', ');
    const week = profile.pregnancyWeek || 20;
    return `Pregnancy week ${week}. Vitamins taken today: ${taken || 'none'}. Weekly intake count: ${weeklyCount}. Streak: ${streak} days. Analyze the vitamin routine and provide personalized recommendations.`;
  }, [todayLog, profile.pregnancyWeek, weeklyCount, streak, t]);

  return (
    <ToolFrame
      toolId="vitamin-tracker"
      title={t('tools.vitaminTracker.title', 'Vitamin Tracker')}
      subtitle={t('toolsInternal.vitaminTracker.subtitle')}
      icon={Pill}
    >
      <div className="space-y-4">
        {/* Today's Progress */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">
                {t('toolsInternal.vitaminTracker.todaysProgress')}
              </h3>
              <span className="text-xs font-semibold text-primary">
                {t('toolsInternal.vitaminTracker.vitaminsCount', { taken: takenCount, total: totalVitamins })}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2.5 rounded-full bg-muted/40 overflow-hidden mb-4">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>

            {/* Vitamin Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {VITAMINS.map((vit, i) => {
                const isTaken = !!todayLog[vit];
                return (
                  <motion.button
                    key={vit}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => toggleVitamin(vit)}
                    disabled={isTaken}
                    className={`relative flex items-center gap-2.5 px-3 py-3 rounded-xl border text-start transition-all duration-200 ${
                      isTaken
                        ? `bg-gradient-to-br ${VITAMIN_COLORS[vit]} opacity-80`
                        : 'bg-card border-border/30 hover:bg-muted/40 hover:border-border/50 active:scale-[0.97]'
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{VITAMIN_ICONS[vit]}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${isTaken ? 'text-foreground' : 'text-foreground/80'}`}>
                        {t(`toolsInternal.vitaminTracker.vitamins.${vit}`)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {isTaken ? t('toolsInternal.vitaminTracker.done') : t('toolsInternal.vitaminTracker.take')}
                      </p>
                    </div>
                    {isTaken && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
                      >
                        <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{weeklyCount}</p>
                <p className="text-[10px] text-muted-foreground">{t('toolsInternal.vitaminTracker.thisWeek')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{streak}</p>
                <p className="text-[10px] text-muted-foreground">{t('toolsInternal.vitaminTracker.days')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tip Card */}
        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardContent className="py-3 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-0.5">
                {t('toolsInternal.vitaminTracker.tipTitle')}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t('toolsInternal.vitaminTracker.tipContent')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <AIInsightCard
          toolType="vitamin-tracker"
          section="vitamin"
          prompt={aiPrompt}
          title={t('toolsInternal.vitaminTracker.aiAnalysisTitle')}
          buttonLabel={t('toolsInternal.vitaminTracker.analyzeRoutine')}
          loadingLabel={t('toolsInternal.vitaminTracker.analyzingIntake')}
        />
      </div>
    </ToolFrame>
  );
};

export default VitaminTracker;
