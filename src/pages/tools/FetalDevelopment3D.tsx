import React, { useState } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Baby, ChevronLeft, ChevronRight, Info, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const weeklyData = [
  { week: 4, size: 'Poppy seed', emoji: '🌱', length: '0.1 cm', weight: '<1 g', development: 'Cells are dividing rapidly. The neural tube is forming.' },
  { week: 6, size: 'Sweet pea', emoji: '🫛', length: '0.6 cm', weight: '<1 g', development: 'Heart begins to beat. Brain and spinal cord are developing.' },
  { week: 8, size: 'Raspberry', emoji: '🫐', length: '1.6 cm', weight: '1 g', development: 'Tiny fingers and toes are forming. Heart is beating steadily.' },
  { week: 10, size: 'Prune', emoji: '🍇', length: '3.1 cm', weight: '4 g', development: 'All vital organs have formed. Baby starts to move.' },
  { week: 12, size: 'Lime', emoji: '🍋', length: '5.4 cm', weight: '14 g', development: 'Reflexes are developing. Fingernails are forming.' },
  { week: 14, size: 'Lemon', emoji: '🍋', length: '8.7 cm', weight: '43 g', development: 'Can make facial expressions. Gender may be visible.' },
  { week: 16, size: 'Avocado', emoji: '🥑', length: '11.6 cm', weight: '100 g', development: 'Can make sucking motions. Bones are hardening.' },
  { week: 18, size: 'Bell pepper', emoji: '🫑', length: '14.2 cm', weight: '190 g', development: 'You may feel first kicks! Ears are in final position.' },
  { week: 20, size: 'Banana', emoji: '🍌', length: '16.4 cm', weight: '300 g', development: 'Can hear sounds. Regular sleep cycles begin.' },
  { week: 22, size: 'Papaya', emoji: '🥭', length: '27.8 cm', weight: '430 g', development: 'Eyebrows and eyelids are fully formed.' },
  { week: 24, size: 'Corn', emoji: '🌽', length: '30 cm', weight: '600 g', development: 'Lungs are developing. Responds to sounds and light.' },
  { week: 26, size: 'Lettuce', emoji: '🥬', length: '35.6 cm', weight: '760 g', development: 'Eyes begin to open. Brain is developing rapidly.' },
  { week: 28, size: 'Eggplant', emoji: '🍆', length: '37.6 cm', weight: '1 kg', development: 'Eyes can open and close. Baby can dream!' },
  { week: 30, size: 'Cabbage', emoji: '🥬', length: '39.9 cm', weight: '1.3 kg', development: 'Brain continues rapid growth. Can regulate body temperature.' },
  { week: 32, size: 'Squash', emoji: '🎃', length: '42.4 cm', weight: '1.7 kg', development: 'Practicing breathing. Bones are fully formed but soft.' },
  { week: 34, size: 'Cantaloupe', emoji: '🍈', length: '45 cm', weight: '2.1 kg', development: 'Fingernails reach fingertips. Fat layers developing.' },
  { week: 36, size: 'Honeydew', emoji: '🍈', length: '47.4 cm', weight: '2.6 kg', development: 'Lungs are nearly mature. Head may engage in pelvis.' },
  { week: 38, size: 'Pumpkin', emoji: '🎃', length: '49.8 cm', weight: '3 kg', development: 'Fully developed and gaining weight. Ready soon!' },
  { week: 40, size: 'Watermelon', emoji: '🍉', length: '51.2 cm', weight: '3.4 kg', development: 'Fully developed and ready for birth! Welcome to the world!' },
];

const FetalDevelopment3D: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(10); // Start at week 20

  const currentData = weeklyData[currentIndex];

  const goToPrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (currentIndex < weeklyData.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const getTrimester = (week: number) => {
    if (week <= 12) return { name: 'First Trimester', color: 'text-emerald-600 bg-emerald-100' };
    if (week <= 27) return { name: 'Second Trimester', color: 'text-amber-600 bg-amber-100' };
    return { name: 'Third Trimester', color: 'text-rose-600 bg-rose-100' };
  };

  const trimester = getTrimester(currentData.week);

  return (
    <ToolFrame
      title="Fetal Development"
      subtitle="Week by week baby growth tracker"
      icon={TrendingUp}
      mood="nurturing"
      toolId="fetal-development"
    >
      <div className="space-y-6">
        {/* Week Navigation */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <div className="text-center">
                <span className={`text-xs px-2 py-1 rounded-full ${trimester.color}`}>
                  {trimester.name}
                </span>
                <p className="text-3xl font-bold text-primary mt-1">Week {currentData.week}</p>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                disabled={currentIndex === weeklyData.length - 1}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Baby Visualization */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentData.week}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="py-8">
                <div className="text-center">
                  <div className="text-8xl mb-4">{currentData.emoji}</div>
                  <p className="text-xl font-bold text-foreground">
                    Size of a {currentData.size}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tap week buttons below to explore
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-sm text-muted-foreground">Length</p>
              <p className="text-2xl font-bold text-foreground">{currentData.length}</p>
              <p className="text-xs text-muted-foreground">head to toe</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-sm text-muted-foreground">Weight</p>
              <p className="text-2xl font-bold text-foreground">{currentData.weight}</p>
              <p className="text-xs text-muted-foreground">approximate</p>
            </CardContent>
          </Card>
        </div>

        {/* Development Info */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Baby className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Development This Week</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {currentData.development}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Week Timeline */}
        <Card>
          <CardContent className="py-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Jump to Week</h3>
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              {weeklyData.map((data, index) => (
                <button
                  key={data.week}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-9 h-9 rounded-full text-xs font-medium transition-all ${
                    index === currentIndex
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {data.week}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Educational Note */}
        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Sizes and weights are approximate averages. Every baby develops at their own pace. Consult your healthcare provider for personalized information about your pregnancy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default FetalDevelopment3D;
