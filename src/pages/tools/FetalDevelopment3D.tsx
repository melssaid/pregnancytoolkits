import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Baby, ChevronLeft, ChevronRight, Info, Heart, Brain, Ear, Eye, Hand, Footprints, Scale, Ruler, Sparkles, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const weeklyData = [
  { week: 4, size: 'Poppy seed', emoji: '🌱', length: '0.1 cm', weight: '<1 g', development: 'Cells are dividing rapidly. The neural tube is forming.', organs: ['brain', 'heart'], tip: 'Start taking prenatal vitamins!' },
  { week: 6, size: 'Sweet pea', emoji: '🫛', length: '0.6 cm', weight: '<1 g', development: 'Heart begins to beat. Brain and spinal cord are developing.', organs: ['heart', 'brain'], tip: 'Stay hydrated and rest well.' },
  { week: 8, size: 'Raspberry', emoji: '🫐', length: '1.6 cm', weight: '1 g', development: 'Tiny fingers and toes are forming. Heart is beating steadily.', organs: ['heart', 'hands'], tip: 'First prenatal visit recommended.' },
  { week: 10, size: 'Prune', emoji: '🍇', length: '3.1 cm', weight: '4 g', development: 'All vital organs have formed. Baby starts to move.', organs: ['brain', 'heart'], tip: 'Morning sickness may peak now.' },
  { week: 12, size: 'Lime', emoji: '🍋', length: '5.4 cm', weight: '14 g', development: 'Reflexes are developing. Fingernails are forming.', organs: ['hands', 'brain'], tip: 'End of first trimester!' },
  { week: 14, size: 'Lemon', emoji: '🍋', length: '8.7 cm', weight: '43 g', development: 'Can make facial expressions. Gender may be visible.', organs: ['brain', 'eyes'], tip: 'Energy levels may improve.' },
  { week: 16, size: 'Avocado', emoji: '🥑', length: '11.6 cm', weight: '100 g', development: 'Can make sucking motions. Bones are hardening.', organs: ['heart', 'ears'], tip: 'You might feel flutters!' },
  { week: 18, size: 'Bell pepper', emoji: '🫑', length: '14.2 cm', weight: '190 g', development: 'You may feel first kicks! Ears are in final position.', organs: ['ears', 'feet'], tip: 'Anatomy scan time!' },
  { week: 20, size: 'Banana', emoji: '🍌', length: '16.4 cm', weight: '300 g', development: 'Can hear sounds. Regular sleep cycles begin.', organs: ['ears', 'brain'], tip: 'Halfway there! 🎉' },
  { week: 22, size: 'Papaya', emoji: '🥭', length: '27.8 cm', weight: '430 g', development: 'Eyebrows and eyelids are fully formed.', organs: ['eyes', 'brain'], tip: 'Baby can taste what you eat.' },
  { week: 24, size: 'Corn', emoji: '🌽', length: '30 cm', weight: '600 g', development: 'Lungs are developing. Responds to sounds and light.', organs: ['ears', 'eyes'], tip: 'Viability milestone reached!' },
  { week: 26, size: 'Lettuce', emoji: '🥬', length: '35.6 cm', weight: '760 g', development: 'Eyes begin to open. Brain is developing rapidly.', organs: ['eyes', 'brain'], tip: 'Glucose test may be scheduled.' },
  { week: 28, size: 'Eggplant', emoji: '🍆', length: '37.6 cm', weight: '1 kg', development: 'Eyes can open and close. Baby can dream!', organs: ['eyes', 'brain'], tip: 'Third trimester begins!' },
  { week: 30, size: 'Cabbage', emoji: '🥬', length: '39.9 cm', weight: '1.3 kg', development: 'Brain continues rapid growth. Can regulate body temperature.', organs: ['brain', 'heart'], tip: 'Pack your hospital bag.' },
  { week: 32, size: 'Squash', emoji: '🎃', length: '42.4 cm', weight: '1.7 kg', development: 'Practicing breathing. Bones are fully formed but soft.', organs: ['heart', 'feet'], tip: 'Baby is gaining weight fast!' },
  { week: 34, size: 'Cantaloupe', emoji: '🍈', length: '45 cm', weight: '2.1 kg', development: 'Fingernails reach fingertips. Fat layers developing.', organs: ['hands', 'brain'], tip: 'Prenatal visits every 2 weeks.' },
  { week: 36, size: 'Honeydew', emoji: '🍈', length: '47.4 cm', weight: '2.6 kg', development: 'Lungs are nearly mature. Head may engage in pelvis.', organs: ['brain', 'heart'], tip: 'Baby may drop lower.' },
  { week: 38, size: 'Pumpkin', emoji: '🎃', length: '49.8 cm', weight: '3 kg', development: 'Fully developed and gaining weight. Ready soon!', organs: ['heart', 'brain'], tip: 'Could arrive any day!' },
  { week: 40, size: 'Watermelon', emoji: '🍉', length: '51.2 cm', weight: '3.4 kg', development: 'Fully developed and ready for birth! Welcome to the world!', organs: ['heart', 'brain', 'eyes', 'ears', 'hands', 'feet'], tip: 'Due date! 🎊' },
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
  const [currentIndex, setCurrentIndex] = useState(8); // Start at week 20
  const [userWeek, setUserWeek] = useState<number | null>(null);

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
    if (week <= 12) return { name: 'First Trimester', color: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400', weeks: '1-12' };
    if (week <= 27) return { name: 'Second Trimester', color: 'bg-amber-500/20 text-amber-700 dark:text-amber-400', weeks: '13-27' };
    return { name: 'Third Trimester', color: 'bg-rose-500/20 text-rose-700 dark:text-rose-400', weeks: '28-40' };
  };

  const trimester = getTrimester(currentData.week);

  const saveCurrentWeek = () => {
    localStorage.setItem('pregnancy-current-week', currentData.week.toString());
    setUserWeek(currentData.week);
  };

  return (
    <ToolFrame
      title="Baby Development Timeline"
      subtitle="Week by week journey of your baby's growth"
      customIcon="baby-growth"
      mood="nurturing"
      toolId="fetal-development"
    >
      <div className="space-y-5">
        {/* Progress Bar */}
        <Card className="overflow-hidden">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Pregnancy Progress</span>
              <span className="text-sm font-bold text-primary">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2.5" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Week 4</span>
              <span>Week 40</span>
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
                  {trimester.name}
                </span>
                <p className="text-4xl font-bold text-primary mt-2">Week {currentData.week}</p>
                {userWeek === currentData.week && (
                  <span className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" /> Your current week
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
                <div className="absolute top-3 right-3">
                  <Button variant="ghost" size="sm" onClick={saveCurrentWeek} className="text-xs">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    Set as my week
                  </Button>
                </div>
                
                <div className="text-center">
                  <motion.div 
                    className="text-[100px] mb-3 leading-none"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {currentData.emoji}
                  </motion.div>
                  <p className="text-xl font-bold text-foreground">
                    Size of a {currentData.size}
                  </p>
                  
                  {/* Developing Organs */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <span className="text-xs text-muted-foreground">Developing:</span>
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
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200/50">
            <CardContent className="py-4 text-center">
              <Ruler className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-muted-foreground">Length</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{currentData.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200/50">
            <CardContent className="py-4 text-center">
              <Scale className="w-5 h-5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
              <p className="text-xs text-muted-foreground">Weight</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{currentData.weight}</p>
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
                <h3 className="font-semibold text-foreground">This Week's Development</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {currentData.development}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Tip */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200/50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">Weekly Tip</h3>
                <p className="text-sm text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                  {currentData.tip}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Timeline */}
        <Card className="overflow-hidden">
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Pregnancy Timeline</h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">1st</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">2nd</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-muted-foreground">3rd</span>
                </span>
              </div>
            </div>
            
            {/* Timeline Container */}
            <div className="relative overflow-x-auto pb-3 scrollbar-hide">
              <div className="flex items-center min-w-max px-2">
                {weeklyData.map((data, index) => {
                  const isActive = index === currentIndex;
                  const isUserWeek = userWeek === data.week;
                  const isPast = index < currentIndex;
                  const trimesterColor = data.week <= 12 
                    ? 'bg-emerald-500' 
                    : data.week <= 27 
                      ? 'bg-amber-500' 
                      : 'bg-rose-500';
                  const trimesterBorder = data.week <= 12 
                    ? 'border-emerald-500' 
                    : data.week <= 27 
                      ? 'border-amber-500' 
                      : 'border-rose-500';
                  
                  return (
                    <div key={data.week} className="flex items-center">
                      {/* Timeline Node */}
                      <motion.button
                        onClick={() => setCurrentIndex(index)}
                        className="relative flex flex-col items-center group"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Week Circle */}
                        <div
                          className={`
                            relative z-10 flex items-center justify-center transition-all duration-300
                            ${isActive 
                              ? `w-14 h-14 ${trimesterColor} text-white shadow-lg ring-4 ring-primary/20` 
                              : isPast 
                                ? `w-10 h-10 ${trimesterColor}/80 text-white` 
                                : `w-10 h-10 border-2 ${trimesterBorder} bg-card text-muted-foreground hover:bg-muted`
                            }
                            rounded-full font-semibold text-sm
                          `}
                        >
                          {data.week}
                          {isUserWeek && (
                            <motion.span 
                              className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <Calendar className="w-2.5 h-2.5 text-primary-foreground" />
                            </motion.span>
                          )}
                        </div>
                        
                        {/* Emoji & Size (shown on active) */}
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute -top-8 text-2xl"
                            >
                              {data.emoji}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        {/* Size Label (shown on hover/active) */}
                        <div className={`
                          mt-2 text-[10px] font-medium text-center max-w-[60px] leading-tight
                          transition-opacity duration-200
                          ${isActive ? 'opacity-100 text-foreground' : 'opacity-0 group-hover:opacity-100 text-muted-foreground'}
                        `}>
                          {data.size}
                        </div>
                      </motion.button>
                      
                      {/* Connector Line */}
                      {index < weeklyData.length - 1 && (
                        <div className="relative w-6 h-0.5 mx-0.5">
                          <div className="absolute inset-0 bg-muted" />
                          <motion.div 
                            className={`absolute inset-0 ${trimesterColor}`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: isPast ? 1 : 0 }}
                            style={{ transformOrigin: 'left' }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Trimester Markers */}
            <div className="flex justify-between mt-3 px-2">
              <div className="text-center">
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Week 4-12</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">Week 13-27</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-medium text-rose-600 dark:text-rose-400">Week 28-40</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Educational Note */}
        <Card className="bg-muted/30">
          <CardContent className="py-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Sizes and weights are approximate averages. Every baby develops at their own pace. Consult your healthcare provider for personalized information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default FetalDevelopment3D;
