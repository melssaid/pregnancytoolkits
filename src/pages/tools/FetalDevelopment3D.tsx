import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Baby, ChevronLeft, ChevronRight, Heart, Brain, Ear, Eye, Hand, Footprints, Scale, Ruler, Sparkles, Calendar, Loader2, Stethoscope, Apple, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface WeekData {
  week: number;
  sizeKey: string;
  length: string;
  weight: string;
  developmentKey: string;
  organs: string[];
  tipKey: string;
}

const weeklyData: WeekData[] = [
  { week: 4, sizeKey: 'poppySeed', length: '0.1 cm', weight: '<1 g', developmentKey: 'week4', organs: ['brain', 'heart'], tipKey: 'week4' },
  { week: 6, sizeKey: 'sweetPea', length: '0.6 cm', weight: '<1 g', developmentKey: 'week6', organs: ['heart', 'brain'], tipKey: 'week6' },
  { week: 8, sizeKey: 'raspberry', length: '1.6 cm', weight: '1 g', developmentKey: 'week8', organs: ['heart', 'hands'], tipKey: 'week8' },
  { week: 10, sizeKey: 'prune', length: '3.1 cm', weight: '4 g', developmentKey: 'week10', organs: ['brain', 'heart'], tipKey: 'week10' },
  { week: 12, sizeKey: 'lime', length: '5.4 cm', weight: '14 g', developmentKey: 'week12', organs: ['hands', 'brain'], tipKey: 'week12' },
  { week: 14, sizeKey: 'lemon', length: '8.7 cm', weight: '43 g', developmentKey: 'week14', organs: ['brain', 'eyes'], tipKey: 'week14' },
  { week: 16, sizeKey: 'avocado', length: '11.6 cm', weight: '100 g', developmentKey: 'week16', organs: ['heart', 'ears'], tipKey: 'week16' },
  { week: 18, sizeKey: 'bellPepper', length: '14.2 cm', weight: '190 g', developmentKey: 'week18', organs: ['ears', 'feet'], tipKey: 'week18' },
  { week: 20, sizeKey: 'banana', length: '16.4 cm', weight: '300 g', developmentKey: 'week20', organs: ['ears', 'brain'], tipKey: 'week20' },
  { week: 22, sizeKey: 'papaya', length: '27.8 cm', weight: '430 g', developmentKey: 'week22', organs: ['eyes', 'brain'], tipKey: 'week22' },
  { week: 24, sizeKey: 'corn', length: '30 cm', weight: '600 g', developmentKey: 'week24', organs: ['ears', 'eyes'], tipKey: 'week24' },
  { week: 26, sizeKey: 'lettuce', length: '35.6 cm', weight: '760 g', developmentKey: 'week26', organs: ['eyes', 'brain'], tipKey: 'week26' },
  { week: 28, sizeKey: 'eggplant', length: '37.6 cm', weight: '1 kg', developmentKey: 'week28', organs: ['eyes', 'brain'], tipKey: 'week28' },
  { week: 30, sizeKey: 'cabbage', length: '39.9 cm', weight: '1.3 kg', developmentKey: 'week30', organs: ['brain', 'heart'], tipKey: 'week30' },
  { week: 32, sizeKey: 'squash', length: '42.4 cm', weight: '1.7 kg', developmentKey: 'week32', organs: ['heart', 'feet'], tipKey: 'week32' },
  { week: 34, sizeKey: 'cantaloupe', length: '45 cm', weight: '2.1 kg', developmentKey: 'week34', organs: ['hands', 'brain'], tipKey: 'week34' },
  { week: 36, sizeKey: 'honeydew', length: '47.4 cm', weight: '2.6 kg', developmentKey: 'week36', organs: ['brain', 'heart'], tipKey: 'week36' },
  { week: 38, sizeKey: 'pumpkin', length: '49.8 cm', weight: '3 kg', developmentKey: 'week38', organs: ['heart', 'brain'], tipKey: 'week38' },
  { week: 40, sizeKey: 'watermelon', length: '51.2 cm', weight: '3.4 kg', developmentKey: 'week40', organs: ['heart', 'brain', 'eyes', 'ears', 'hands', 'feet'], tipKey: 'week40' },
];

const organIcons: Record<string, React.ReactNode> = {
  heart: <Heart className="w-4 h-4" />,
  brain: <Brain className="w-4 h-4" />,
  ears: <Ear className="w-4 h-4" />,
  eyes: <Eye className="w-4 h-4" />,
  hands: <Hand className="w-4 h-4" />,
  feet: <Footprints className="w-4 h-4" />,
};

const FetalDevelopment3D: React.FC = () => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(4); // Start at week 12
  const [userWeek, setUserWeek] = useState<number | null>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [activeAITab, setActiveAITab] = useState<'development' | 'nutrition' | 'exercise' | null>(null);
  
  const { streamChat, isLoading: aiLoading } = usePregnancyAI();

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
  const progressPercent = ((currentData.week - 4) / 36) * 100;

  const goToPrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (currentIndex < weeklyData.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const getTrimester = (week: number) => {
    if (week <= 12) return { nameKey: 'trimesters.first', color: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' };
    if (week <= 27) return { nameKey: 'trimesters.second', color: 'bg-amber-500/20 text-amber-700 dark:text-amber-400' };
    return { nameKey: 'trimesters.third', color: 'bg-rose-500/20 text-rose-700 dark:text-rose-400' };
  };

  const trimester = getTrimester(currentData.week);

  const saveCurrentWeek = () => {
    localStorage.setItem('pregnancy-current-week', currentData.week.toString());
    setUserWeek(currentData.week);
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

**Baby's Current Size:** ${babySize} (${currentData.length}, ${currentData.weight})
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

**Baby's Size:** ${babySize} (${currentData.weight})
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

  return (
    <ToolFrame
      title={t('toolsInternal.fetalDevelopment.title')}
      subtitle={t('toolsInternal.fetalDevelopment.subtitle')}
      customIcon="baby-growth"
      mood="nurturing"
      toolId="fetal-development"
    >
      <div className="space-y-5">
        {/* Progress Bar */}
        <Card className="overflow-hidden">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                {t('toolsInternal.fetalDevelopment.pregnancyProgress')}
              </span>
              <span className="text-sm font-bold text-primary">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2.5" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{t('toolsInternal.common.week')} 4</span>
              <span>{t('toolsInternal.common.week')} 40</span>
            </div>
          </CardContent>
        </Card>

        {/* Week Navigation */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="py-5">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="rounded-full h-12 w-12"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              
              <div className="text-center">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${trimester.color}`}>
                  {t(`toolsInternal.fetalDevelopment.${trimester.nameKey}`)}
                </span>
                <p className="text-4xl font-bold text-primary mt-2">
                  {t('toolsInternal.common.week')} {currentData.week}
                </p>
                {userWeek === currentData.week && (
                  <span className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" /> {t('toolsInternal.fetalDevelopment.yourCurrentWeek')}
                  </span>
                )}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                disabled={currentIndex === weeklyData.length - 1}
                className="rounded-full h-12 w-12"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Baby Visualization */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentData.week}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-pink-100/30 dark:to-pink-900/10 border-primary/20 overflow-hidden">
              <CardContent className="py-8 relative">
                <div className="absolute top-3 end-3">
                  <Button variant="ghost" size="sm" onClick={saveCurrentWeek} className="text-xs">
                    <Calendar className="w-3.5 h-3.5 me-1" />
                    {t('toolsInternal.fetalDevelopment.setAsMyWeek')}
                  </Button>
                </div>
                
                <div className="text-center">
                  <motion.div 
                    className="w-24 h-24 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Baby className="w-12 h-12 text-primary" />
                  </motion.div>
                  <p className="text-xl font-bold text-foreground">
                    {t('toolsInternal.fetalDevelopment.sizeOf', { 
                      size: t(`toolsInternal.fetalDevelopment.sizes.${currentData.sizeKey}`) 
                    })}
                  </p>
                  
                  {/* Developing Organs */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <span className="text-xs text-muted-foreground">
                      {t('toolsInternal.fetalDevelopment.developing')}
                    </span>
                    <div className="flex gap-1.5">
                      {currentData.organs.map((organ, i) => (
                        <motion.div
                          key={organ}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-1.5 rounded-full bg-primary/20 text-primary"
                        >
                          {organIcons[organ]}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-2">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200/50">
            <CardContent className="py-3 text-center">
              <Ruler className="w-4 h-4 mx-auto mb-1 text-blue-600 dark:text-blue-400 shrink-0" />
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                {t('toolsInternal.fetalDevelopment.length')}
              </p>
              <p className="text-lg sm:text-xl font-bold text-blue-700 dark:text-blue-300 truncate">
                {currentData.length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200/50">
            <CardContent className="py-3 text-center">
              <Scale className="w-4 h-4 mx-auto mb-1 text-purple-600 dark:text-purple-400 shrink-0" />
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                {t('toolsInternal.fetalDevelopment.weight')}
              </p>
              <p className="text-lg sm:text-xl font-bold text-purple-700 dark:text-purple-300 truncate">
                {currentData.weight}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Development Info */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Baby className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  {t('toolsInternal.fetalDevelopment.thisWeeksDevelopment')}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {t(`toolsInternal.fetalDevelopment.developments.${currentData.developmentKey}`)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights Section */}
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50">
          <CardContent className="py-3">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-violet-500" />
              {t('toolsInternal.fetalDevelopment.aiWeeklyInsights')}
            </h3>
            
            {/* AI Tab Buttons */}
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              <Button
                variant={activeAITab === 'development' ? 'default' : 'outline'}
                size="sm"
                onClick={() => getAIInsight('development')}
                disabled={aiLoading}
                className="gap-0.5 h-8 px-2"
              >
                {aiLoading && activeAITab === 'development' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Stethoscope className="w-3 h-3" />
                )}
                <span className="text-[10px]">{t('toolsInternal.fetalDevelopment.development')}</span>
              </Button>
              <Button
                variant={activeAITab === 'nutrition' ? 'default' : 'outline'}
                size="sm"
                onClick={() => getAIInsight('nutrition')}
                disabled={aiLoading}
                className="gap-0.5 h-8 px-2"
              >
                {aiLoading && activeAITab === 'nutrition' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Apple className="w-3 h-3" />
                )}
                <span className="text-[10px]">{t('toolsInternal.fetalDevelopment.nutrition')}</span>
              </Button>
              <Button
                variant={activeAITab === 'exercise' ? 'default' : 'outline'}
                size="sm"
                onClick={() => getAIInsight('exercise')}
                disabled={aiLoading}
                className="gap-0.5 h-8 px-2"
              >
                {aiLoading && activeAITab === 'exercise' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Dumbbell className="w-3 h-3" />
                )}
                <span className="text-[10px]">{t('toolsInternal.fetalDevelopment.exercise')}</span>
              </Button>
            </div>

            {/* AI Response */}
            <AnimatePresence>
              {aiInsight && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg max-h-[300px] overflow-y-auto"
                >
                  <MarkdownRenderer content={aiInsight} isLoading={aiLoading} />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Week Tip */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200/50">
          <CardContent className="py-3">
            <p className="text-sm text-center text-amber-800 dark:text-amber-200">
              💡 {t(`toolsInternal.fetalDevelopment.tips.${currentData.tipKey}`)}
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default FetalDevelopment3D;
