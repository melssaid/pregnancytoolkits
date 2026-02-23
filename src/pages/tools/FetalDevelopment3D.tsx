import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Baby, ChevronLeft, ChevronRight, Heart, Brain, Ear, Eye, Hand, Footprints, Scale, Ruler, Calendar, Loader2, Stethoscope, Apple, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

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

const organIcons: Record<string, React.ReactNode> = {
  heart: <Heart className="w-3.5 h-3.5" />,
  brain: <Brain className="w-3.5 h-3.5" />,
  ears: <Ear className="w-3.5 h-3.5" />,
  eyes: <Eye className="w-3.5 h-3.5" />,
  hands: <Hand className="w-3.5 h-3.5" />,
  feet: <Footprints className="w-3.5 h-3.5" />,
};

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
    if (week <= 12) return { nameKey: 'trimesters.first', color: 'bg-accent/20 text-accent-foreground' };
    if (week <= 27) return { nameKey: 'trimesters.second', color: 'bg-primary/15 text-primary' };
    return { nameKey: 'trimesters.third', color: 'bg-secondary text-secondary-foreground' };
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

  return (
    <ToolFrame
      title={t('toolsInternal.fetalDevelopment.title')}
      subtitle={t('toolsInternal.fetalDevelopment.subtitle')}
      customIcon="baby-growth"
      mood="nurturing"
      toolId="fetal-development"
    >
      <div className="space-y-4">
        {/* Week selector strip */}
        <Card className="overflow-hidden border-border">
          <CardContent className="py-3 px-2">
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="rounded-full h-8 w-8 shrink-0"
              >
                <PrevIcon className="w-4 h-4" />
              </Button>

              <div className="flex-1 overflow-x-auto scrollbar-hide">
                <div className="flex gap-1" dir={isRTL ? 'rtl' : 'ltr'}>
                  {weeklyData.map((wd, idx) => (
                    <button
                      key={wd.week}
                      onClick={() => setCurrentIndex(idx)}
                      className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                        idx === currentIndex
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : userWeek === wd.week
                            ? 'bg-primary/15 text-primary'
                            : 'text-muted-foreground hover:bg-muted/60'
                      }`}
                    >
                      {wd.week}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                disabled={currentIndex === weeklyData.length - 1}
                className="rounded-full h-8 w-8 shrink-0"
              >
                <NextIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress + trimester label */}
            <div className="mt-2.5 px-1">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${trimester.color}`}>
                  {t(`toolsInternal.fetalDevelopment.${trimester.nameKey}`)}
                </span>
                <span className="text-[10px] text-muted-foreground tabular-nums">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        {/* Baby Visualization Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentData.week}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-primary/15 overflow-hidden">
              <CardContent className="py-5">
                {/* Week title + set as my week */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-foreground">
                    {t('toolsInternal.common.week')} {currentData.week}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={saveCurrentWeek} className="text-[10px] h-7 px-2 text-muted-foreground">
                    <Calendar className="w-3 h-3 me-1" />
                    {userWeek === currentData.week
                      ? t('toolsInternal.fetalDevelopment.yourCurrentWeek')
                      : t('toolsInternal.fetalDevelopment.setAsMyWeek')}
                  </Button>
                </div>

                {/* Size comparison + measurements */}
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0"
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    <Baby className="w-8 h-8 text-primary" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {t('toolsInternal.fetalDevelopment.sizeOf', {
                        size: t(`toolsInternal.fetalDevelopment.sizes.${currentData.sizeKey}`)
                      })}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Ruler className="w-3 h-3 text-primary" />
                        <span className="font-medium" dir="ltr">
                          {formatMeasurement(currentData.lengthValue, currentData.lengthUnit)}
                        </span>
                      </div>
                      <div className="w-px h-3 bg-border" />
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Scale className="w-3 h-3" />
                        <span className="font-medium" dir="ltr">
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
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px]"
                    >
                      {organIcons[organ]}
                      <span className="font-medium">
                        {t(organLabelKeys[organ] ?? '', { defaultValue: organ })}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Development description */}
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  {t(`toolsInternal.fetalDevelopment.developments.${currentData.developmentKey}`)}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>



        {/* AI Insights Section */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="py-3">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))' }}>
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              {t('toolsInternal.fetalDevelopment.aiWeeklyInsights')}
            </h3>
            
            {/* AI Tab Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {([
                { key: 'development' as const, icon: Stethoscope, labelKey: 'toolsInternal.fetalDevelopment.development' },
                { key: 'nutrition' as const, icon: Apple, labelKey: 'toolsInternal.fetalDevelopment.nutrition' },
                { key: 'exercise' as const, icon: Dumbbell, labelKey: 'toolsInternal.fetalDevelopment.exercise' },
              ]).map(({ key, icon: TabIcon, labelKey }) => {
                const isActive = activeAITab === key;
                return (
                  <motion.button
                    key={key}
                    onClick={() => getAIInsight(key)}
                    disabled={aiLoading}
                    whileTap={{ scale: 0.92 }}
                    className="relative overflow-hidden rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <div
                      className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'text-white font-semibold'
                          : 'bg-card border border-primary/20 text-foreground hover:border-primary/40'
                      }`}
                      style={isActive ? {
                        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))',
                        boxShadow: '0 4px 16px -4px hsl(var(--primary) / 0.45)',
                      } : undefined}
                    >
                      {aiLoading && isActive ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <TabIcon className={`w-4 h-4 ${isActive ? '' : 'text-primary'}`} />
                      )}
                      <span className="text-[10px] font-medium leading-tight">{t(labelKey)}</span>
                    </div>
                    {!isActive && (
                      <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-primary/10 to-transparent pointer-events-none" aria-hidden />
                    )}
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
                  className="mt-3 p-3 bg-muted/30 rounded-lg max-h-[300px] overflow-y-auto"
                >
                  <MarkdownRenderer content={aiInsight} isLoading={aiLoading} />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Week Tip */}
        <Card className="bg-muted/30 border-border">
          <CardContent className="py-3">
            <p className="text-sm text-center text-muted-foreground">
              {t(`toolsInternal.fetalDevelopment.tips.${currentData.tipKey}`)}
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default FetalDevelopment3D;
