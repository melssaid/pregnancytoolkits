import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolFrame } from '@/components/ToolFrame';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Scale, Ruler, Calendar, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { AIResponseFrame } from '@/components/ai/AIResponseFrame';
import {
  organIconMap,
  AnimatedBabyIcon,
  AnimatedBrainOrgan,
  AnimatedDevelopmentIcon,
  AnimatedNutritionIcon,
  AnimatedExerciseIcon,
} from '@/components/fetal/FetalIcons';


interface WeekData {
  week: number;
  sizeKey: string;
  lengthValue: number;
  lengthUnit: string;
  weightValue: string;
  weightUnit: string;
  developmentKey: string;
  organs: string[];
  tipKey: string;
}

const weeklyData: WeekData[] = [
  { week: 4, sizeKey: 'poppySeed', lengthValue: 0.1, lengthUnit: 'cm', weightValue: '<1', weightUnit: 'g', developmentKey: 'week4', organs: ['brain', 'heart'], tipKey: 'week4' },
  { week: 6, sizeKey: 'sweetPea', lengthValue: 0.6, lengthUnit: 'cm', weightValue: '<1', weightUnit: 'g', developmentKey: 'week6', organs: ['heart', 'brain'], tipKey: 'week6' },
  { week: 8, sizeKey: 'raspberry', lengthValue: 1.6, lengthUnit: 'cm', weightValue: '1', weightUnit: 'g', developmentKey: 'week8', organs: ['heart', 'hands'], tipKey: 'week8' },
  { week: 10, sizeKey: 'prune', lengthValue: 3.1, lengthUnit: 'cm', weightValue: '4', weightUnit: 'g', developmentKey: 'week10', organs: ['brain', 'heart'], tipKey: 'week10' },
  { week: 12, sizeKey: 'lime', lengthValue: 5.4, lengthUnit: 'cm', weightValue: '14', weightUnit: 'g', developmentKey: 'week12', organs: ['hands', 'brain'], tipKey: 'week12' },
  { week: 14, sizeKey: 'lemon', lengthValue: 8.7, lengthUnit: 'cm', weightValue: '43', weightUnit: 'g', developmentKey: 'week14', organs: ['brain', 'eyes'], tipKey: 'week14' },
  { week: 16, sizeKey: 'avocado', lengthValue: 11.6, lengthUnit: 'cm', weightValue: '100', weightUnit: 'g', developmentKey: 'week16', organs: ['heart', 'ears'], tipKey: 'week16' },
  { week: 18, sizeKey: 'bellPepper', lengthValue: 14.2, lengthUnit: 'cm', weightValue: '190', weightUnit: 'g', developmentKey: 'week18', organs: ['ears', 'feet'], tipKey: 'week18' },
  { week: 20, sizeKey: 'banana', lengthValue: 16.4, lengthUnit: 'cm', weightValue: '300', weightUnit: 'g', developmentKey: 'week20', organs: ['ears', 'brain'], tipKey: 'week20' },
  { week: 22, sizeKey: 'papaya', lengthValue: 27.8, lengthUnit: 'cm', weightValue: '430', weightUnit: 'g', developmentKey: 'week22', organs: ['eyes', 'brain'], tipKey: 'week22' },
  { week: 24, sizeKey: 'corn', lengthValue: 30, lengthUnit: 'cm', weightValue: '600', weightUnit: 'g', developmentKey: 'week24', organs: ['ears', 'eyes'], tipKey: 'week24' },
  { week: 26, sizeKey: 'lettuce', lengthValue: 35.6, lengthUnit: 'cm', weightValue: '760', weightUnit: 'g', developmentKey: 'week26', organs: ['eyes', 'brain'], tipKey: 'week26' },
  { week: 28, sizeKey: 'eggplant', lengthValue: 37.6, lengthUnit: 'cm', weightValue: '1', weightUnit: 'kg', developmentKey: 'week28', organs: ['eyes', 'brain'], tipKey: 'week28' },
  { week: 30, sizeKey: 'cabbage', lengthValue: 39.9, lengthUnit: 'cm', weightValue: '1.3', weightUnit: 'kg', developmentKey: 'week30', organs: ['brain', 'heart'], tipKey: 'week30' },
  { week: 32, sizeKey: 'squash', lengthValue: 42.4, lengthUnit: 'cm', weightValue: '1.7', weightUnit: 'kg', developmentKey: 'week32', organs: ['heart', 'feet'], tipKey: 'week32' },
  { week: 34, sizeKey: 'cantaloupe', lengthValue: 45, lengthUnit: 'cm', weightValue: '2.1', weightUnit: 'kg', developmentKey: 'week34', organs: ['hands', 'brain'], tipKey: 'week34' },
  { week: 36, sizeKey: 'honeydew', lengthValue: 47.4, lengthUnit: 'cm', weightValue: '2.6', weightUnit: 'kg', developmentKey: 'week36', organs: ['brain', 'heart'], tipKey: 'week36' },
  { week: 38, sizeKey: 'pumpkin', lengthValue: 49.8, lengthUnit: 'cm', weightValue: '3', weightUnit: 'kg', developmentKey: 'week38', organs: ['heart', 'brain'], tipKey: 'week38' },
  { week: 40, sizeKey: 'watermelon', lengthValue: 51.2, lengthUnit: 'cm', weightValue: '3.4', weightUnit: 'kg', developmentKey: 'week40', organs: ['heart', 'brain', 'eyes', 'ears', 'hands', 'feet'], tipKey: 'week40' },
];

const organLabelKeys: Record<string, string> = {
  heart: 'toolsInternal.fetalDevelopment.organs.heart',
  brain: 'toolsInternal.fetalDevelopment.organs.brain',
  ears: 'toolsInternal.fetalDevelopment.organs.ears',
  eyes: 'toolsInternal.fetalDevelopment.organs.eyes',
  hands: 'toolsInternal.fetalDevelopment.organs.hands',
  feet: 'toolsInternal.fetalDevelopment.organs.feet',
};

const FetalDevelopment3D: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [currentIndex, setCurrentIndex] = useState(4);
  const [userWeek, setUserWeek] = useState<number | null>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [activeAITab, setActiveAITab] = useState<'development' | 'nutrition' | 'exercise' | null>(null);
  
  const { streamChat, isLoading: aiLoading } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setAiInsight('');
    setActiveAITab(null);
  });

  useEffect(() => {
    const saved = localStorage.getItem('pregnancy-current-week');
    if (saved) {
      const week = parseInt(saved);
      const idx = weeklyData.findIndex(d => d.week >= week);
      if (idx !== -1) {
        setCurrentIndex(idx);
        setUserWeek(week);
      }
    }
  }, []);

  const currentData = weeklyData[currentIndex];
  const progressPercent = ((currentData?.week ?? 4) - 4) / 36 * 100;

  const goToPrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (currentIndex < weeklyData.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const getTrimester = (week: number) => {
    if (week <= 12) return { nameKey: 'trimesters.first', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
    if (week <= 27) return { nameKey: 'trimesters.second', color: 'bg-primary/15 text-primary' };
    return { nameKey: 'trimesters.third', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' };
  };

  if (!currentData) return null;

  const trimester = getTrimester(currentData.week);

  const saveCurrentWeek = () => {
    localStorage.setItem('pregnancy-current-week', currentData.week.toString());
    setUserWeek(currentData.week);
  };

  const formatMeasurement = (value: string | number, unit: string) => {
    return `${value} ${t(`toolsInternal.fetalDevelopment.units.${unit}`, { defaultValue: unit })}`;
  };

  const getAIInsight = async (type: 'development' | 'nutrition' | 'exercise') => {
    if (aiLoading) return;
    setActiveAITab(type);
    setAiInsight('');

    const babySize = t(`toolsInternal.fetalDevelopment.sizes.${currentData.sizeKey}`);
    const development = t(`toolsInternal.fetalDevelopment.developments.${currentData.developmentKey}`);
    const trimesterName = t(`toolsInternal.fetalDevelopment.${trimester.nameKey}`);

    const prompts = {
      development: `As a prenatal development specialist, provide detailed insights for pregnancy week ${currentData.week}:

**Baby's Current Size:** ${babySize} (${currentData.lengthValue} ${currentData.lengthUnit}, ${currentData.weightValue} ${currentData.weightUnit})
**Key Development:** ${development}
**Developing Organs:** ${currentData.organs.join(', ')}

Provide:
1. **What's Happening This Week** - Detailed breakdown of baby's development milestones
2. **Sensory Development** - What can baby see, hear, feel at this stage
3. **Brain Development** - Neural connections and cognitive growth
4. **What Baby Can Do** - Reflexes, movements, responses
5. **Connection Tips** - How to bond with your baby this week (talking, music, touch)

Make it personal and exciting! Use emojis and keep the tone warm and encouraging.`,
      
      nutrition: `As a prenatal nutritionist, provide week ${currentData.week} nutrition guidance:

**Baby's Size:** ${babySize} (${currentData.weightValue} ${currentData.weightUnit})
**Key Development Focus:** ${currentData.organs.join(', ')}

Provide:
1. **Critical Nutrients This Week** - Top 5 nutrients for current development stage
2. **Best Foods to Eat** - Specific foods that support baby's growth
3. **Foods to Avoid** - What to limit or eliminate
4. **Meal Ideas** - 3 simple meal suggestions
5. **Hydration Tips** - Water and healthy drinks recommendations
6. **Supplement Check** - Reminder about prenatal vitamins

Include practical, easy-to-follow advice with specific portion sizes.`,
      
      exercise: `As a prenatal fitness specialist, provide safe exercise guidance for week ${currentData.week}:

**Trimester:** ${trimesterName}
**Baby's Development:** ${development}

Provide:
1. **Safe Exercises This Week** - 5 recommended exercises with modifications
2. **Exercises to Avoid** - What movements to skip at this stage
3. **Energy Levels** - What to expect and how to manage
4. **Pelvic Floor Exercises** - Kegel routine for this week
5. **Stretches for Comfort** - Target areas for pregnancy week ${currentData.week}
6. **Activity Duration** - Recommended daily movement goals

Focus on safety first, with modifications for common pregnancy discomforts.`
    };

    await streamChat({
      type: 'pregnancy-assistant',
      messages: [{ role: 'user', content: prompts[type] }],
      context: { week: currentData.week },
      onDelta: (text) => setAiInsight((prev) => prev + text),
      onDone: () => {},
    });
  };

  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  const aiTabsConfig = [
    { key: 'development' as const, labelKey: 'toolsInternal.fetalDevelopment.development', gradient: 'from-violet-500 to-purple-600', lightBg: 'bg-violet-50 dark:bg-violet-950/20', lightText: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800/40' },
    { key: 'nutrition' as const, labelKey: 'toolsInternal.fetalDevelopment.nutrition', gradient: 'from-emerald-500 to-green-600', lightBg: 'bg-emerald-50 dark:bg-emerald-950/20', lightText: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/40' },
    { key: 'exercise' as const, labelKey: 'toolsInternal.fetalDevelopment.exercise', gradient: 'from-amber-500 to-orange-600', lightBg: 'bg-amber-50 dark:bg-amber-950/20', lightText: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800/40' },
  ];

  return (
    <ToolFrame
      title={t('toolsInternal.fetalDevelopment.title')}
      subtitle={t('toolsInternal.fetalDevelopment.subtitle')}
      customIcon="baby-growth"
      mood="nurturing"
      toolId="fetal-development"
    >
      <div className="space-y-4">
        {/* Week Navigator */}
        <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
          <div className="p-3">
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="rounded-xl h-9 w-9 shrink-0 border-border/60 hover:bg-primary/10 hover:border-primary/30 disabled:opacity-30"
              >
                <PrevIcon className="w-4 h-4" />
              </Button>

              <div className="flex-1 overflow-x-auto scrollbar-hide">
                <div className="flex gap-1" dir={isRTL ? 'rtl' : 'ltr'}>
                  {weeklyData.map((wd, idx) => {
                    const isSelected = idx === currentIndex;
                    const isUserWeek = userWeek === wd.week && !isSelected;
                    return (
                      <button
                        key={wd.week}
                        onClick={() => setCurrentIndex(idx)}
                        className={`shrink-0 w-8 h-8 rounded-xl text-[11px] font-semibold transition-all duration-200 ${
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105'
                            : isUserWeek
                              ? 'bg-primary/15 text-primary border border-primary/20'
                              : 'text-foreground/60 hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {wd.week}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                disabled={currentIndex === weeklyData.length - 1}
                className="rounded-xl h-9 w-9 shrink-0 border-border/60 hover:bg-primary/10 hover:border-primary/30 disabled:opacity-30"
              >
                <NextIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress bar */}
            <div className="mt-3 px-0.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${trimester.color}`}>
                  {t(`toolsInternal.fetalDevelopment.${trimester.nameKey}`)}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium tabular-nums">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          </div>
        </div>

        {/* Baby Info Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentData.week}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
              {/* Header strip */}
              <div className="h-1 bg-gradient-to-r from-primary via-pink-400 to-primary/60" />
              
              <div className="p-4">
                {/* Week title + set as my week */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-foreground">
                    {t('toolsInternal.common.week')} {currentData.week}
                  </h2>
                  <Button
                    variant={userWeek === currentData.week ? "secondary" : "outline"}
                    size="sm"
                    onClick={saveCurrentWeek}
                    className={`text-[10px] h-7 px-3 rounded-xl transition-all ${
                      userWeek === currentData.week
                        ? 'bg-primary/10 text-primary border-primary/20 font-semibold'
                        : 'border-border/60 text-foreground/70 hover:bg-primary/5 hover:text-primary hover:border-primary/30'
                    }`}
                  >
                    <Calendar className="w-3 h-3 me-1" />
                    {userWeek === currentData.week
                      ? t('toolsInternal.fetalDevelopment.yourCurrentWeek')
                      : t('toolsInternal.fetalDevelopment.setAsMyWeek')}
                  </Button>
                </div>

                {/* Size visualization */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-pink-100/30 dark:to-pink-900/15 flex items-center justify-center shrink-0 border border-primary/10">
                    <AnimatedBabyIcon className="w-12 h-12" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground mb-2">
                      {t('toolsInternal.fetalDevelopment.sizeOf', {
                        size: t(`toolsInternal.fetalDevelopment.sizes.${currentData.sizeKey}`)
                      })}
                    </p>
                    {/* Measurement pills */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                        <Ruler className="w-3 h-3 text-blue-500" />
                        <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 tabular-nums" dir="ltr">
                          {formatMeasurement(currentData.lengthValue, currentData.lengthUnit)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/30">
                        <Scale className="w-3 h-3 text-pink-500" />
                        <span className="text-[11px] font-semibold text-pink-700 dark:text-pink-400 tabular-nums" dir="ltr">
                          {formatMeasurement(currentData.weightValue, currentData.weightUnit)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Developing Organs */}
                <div className="flex flex-wrap items-center gap-1.5 mt-4">
                  {currentData.organs.map((organ, i) => (
                    <motion.div
                      key={organ}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/8 text-primary text-[10px] border border-primary/10"
                    >
                      {organIconMap[organ]}
                      <span className="font-medium">
                        {t(organLabelKeys[organ] ?? '', { defaultValue: organ })}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Development description */}
                <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                  {t(`toolsInternal.fetalDevelopment.developments.${currentData.developmentKey}`)}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* AI Insights — Clear, Colorful Buttons */}
        <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
          <div className="p-4">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 text-[13px]">
              <div className="p-1.5 rounded-xl bg-gradient-to-br from-primary to-pink-500 shadow-sm text-white">
                <Brain size={14} weight="fill" />
              </div>
              {t('toolsInternal.fetalDevelopment.aiWeeklyInsights')}
            </h3>
            
            {/* AI Action Buttons — Premium animated icons */}
            <div className="grid grid-cols-3 gap-2.5">
              {aiTabsConfig.map(({ key, labelKey, gradient, lightBg, lightText, border }) => {
                const isActive = activeAITab === key;
                const IconComponent = key === 'development' ? AnimatedDevelopmentIcon 
                  : key === 'nutrition' ? AnimatedNutritionIcon 
                  : AnimatedExerciseIcon;
                return (
                  <motion.button
                    key={key}
                    onClick={() => getAIInsight(key)}
                    disabled={aiLoading && !isActive}
                    whileTap={{ scale: 0.95 }}
                    className={`relative rounded-2xl overflow-hidden transition-all duration-200 ${
                      aiLoading && !isActive ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    {isActive && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl`} />
                    )}
                    <div
                      className={`relative z-10 flex flex-col items-center gap-1.5 px-2 py-3 rounded-2xl transition-all duration-200 ${
                        isActive
                          ? 'text-white font-bold shadow-lg'
                          : `${lightBg} border ${border} ${lightText} hover:shadow-md`
                      }`}
                    >
                      {aiLoading && isActive ? (
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-white" />
                        </div>
                      ) : (
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isActive ? 'bg-white/20' : 'bg-white dark:bg-white/10 shadow-sm'
                        }`}>
                          <IconComponent className="w-5 h-5" active={isActive} />
                        </div>
                      )}
                      <span className="text-[10px] font-semibold leading-tight">{t(labelKey)}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* AI Response */}
            <AnimatePresence>
              {aiInsight && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <AIResponseFrame
                    content={aiInsight}
                    isLoading={aiLoading}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Week Tip */}
        <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-pink-50/50 dark:to-pink-950/10 border border-primary/10 p-3.5">
          <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
            {t(`toolsInternal.fetalDevelopment.tips.${currentData.tipKey}`)}
          </p>
        </div>
      </div>
    </ToolFrame>
  );
};

export default FetalDevelopment3D;
