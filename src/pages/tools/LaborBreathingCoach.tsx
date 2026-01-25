import React, { useState, useEffect, useCallback } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Wind, Play, Pause, RotateCcw, Clock, Sparkles, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  stage: string;
  inhale: number;
  hold?: number;
  exhale: number;
  cycles: number;
  icon: string;
}

const breathingPatterns: BreathingPattern[] = [
  {
    id: 'slow-deep',
    name: 'Slow Deep Breathing',
    description: 'For early labor and between contractions. Helps you stay calm and relaxed.',
    stage: 'Early Labor',
    inhale: 4,
    exhale: 6,
    cycles: 10,
    icon: '🌊',
  },
  {
    id: 'patterned',
    name: 'Patterned Breathing',
    description: 'For active labor. Light, rhythmic breathing to manage intensity.',
    stage: 'Active Labor',
    inhale: 2,
    exhale: 2,
    cycles: 20,
    icon: '💨',
  },
  {
    id: 'transition',
    name: 'Transition Breathing',
    description: 'For the most intense phase. Short, quick breaths followed by a long exhale.',
    stage: 'Transition Phase',
    inhale: 1,
    hold: 1,
    exhale: 3,
    cycles: 15,
    icon: '🔥',
  },
  {
    id: 'pushing',
    name: 'Push Breathing',
    description: 'For the pushing stage. Deep breath in, hold, and bear down.',
    stage: 'Pushing Stage',
    inhale: 4,
    hold: 6,
    exhale: 2,
    cycles: 5,
    icon: '💪',
  },
  {
    id: 'relaxation',
    name: 'Recovery Breathing',
    description: 'For rest between contractions. Promotes deep relaxation.',
    stage: 'Between Contractions',
    inhale: 4,
    hold: 4,
    exhale: 8,
    cycles: 5,
    icon: '🧘',
  },
];

type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

export default function LaborBreathingCoach() {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(breathingPatterns[0]);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [phaseTime, setPhaseTime] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [totalTime, setTotalTime] = useState(0);

  const getPhaseLabel = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      default: return 'Get Ready';
    }
  };

  const getCurrentPhaseDuration = useCallback(() => {
    switch (phase) {
      case 'inhale': return selectedPattern.inhale;
      case 'hold': return selectedPattern.hold || 0;
      case 'exhale': return selectedPattern.exhale;
      default: return 0;
    }
  }, [phase, selectedPattern]);

  const getNextPhase = useCallback((): BreathPhase => {
    switch (phase) {
      case 'inhale':
        return selectedPattern.hold ? 'hold' : 'exhale';
      case 'hold':
        return 'exhale';
      case 'exhale':
        if (currentCycle >= selectedPattern.cycles) {
          return 'idle';
        }
        return 'inhale';
      default:
        return 'inhale';
    }
  }, [phase, selectedPattern, currentCycle]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && phase !== 'idle') {
      interval = setInterval(() => {
        setPhaseTime((prev) => {
          const duration = getCurrentPhaseDuration();
          if (prev >= duration) {
            const nextPhase = getNextPhase();
            if (nextPhase === 'idle') {
              setIsActive(false);
              setPhase('idle');
              return 0;
            }
            if (nextPhase === 'inhale' && phase === 'exhale') {
              setCurrentCycle((c) => c + 1);
            }
            setPhase(nextPhase);
            return 0;
          }
          return prev + 0.1;
        });
        setTotalTime((t) => t + 0.1);
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [isActive, phase, getCurrentPhaseDuration, getNextPhase]);

  const startExercise = () => {
    setIsActive(true);
    setPhase('inhale');
    setPhaseTime(0);
    setCurrentCycle(1);
    setTotalTime(0);
  };

  const pauseExercise = () => {
    setIsActive(false);
  };

  const resetExercise = () => {
    setIsActive(false);
    setPhase('idle');
    setPhaseTime(0);
    setCurrentCycle(1);
    setTotalTime(0);
  };

  const getProgress = () => {
    const duration = getCurrentPhaseDuration();
    return duration > 0 ? (phaseTime / duration) * 100 : 0;
  };

  const getCircleSize = () => {
    if (phase === 'inhale') {
      return 1 + (phaseTime / selectedPattern.inhale) * 0.3;
    } else if (phase === 'exhale') {
      return 1.3 - (phaseTime / selectedPattern.exhale) * 0.3;
    } else if (phase === 'hold') {
      return 1.3;
    }
    return 1;
  };

  return (
    <ToolFrame
      title="Labor Breathing Coach"
      subtitle="Guided breathing exercises to help you through every stage of labor"
      icon={Wind}
      mood="calm"
      toolId="labor-breathing"
    >
      <div className="space-y-6">
        {/* Pattern Selection */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Select Breathing Pattern
            </h3>
            <div className="grid gap-3">
              {breathingPatterns.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => {
                    resetExercise();
                    setSelectedPattern(pattern);
                  }}
                  className={`p-4 rounded-lg text-left transition-all ${
                    selectedPattern.id === pattern.id
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-muted/50 border-2 border-transparent hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{pattern.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{pattern.name}</span>
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                          {pattern.stage}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{pattern.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>In: {pattern.inhale}s</span>
                        {pattern.hold && <span>Hold: {pattern.hold}s</span>}
                        <span>Out: {pattern.exhale}s</span>
                        <span>× {pattern.cycles} cycles</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Breathing Visualizer */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              {/* Animated Circle */}
              <div className="relative w-48 h-48 mb-6">
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
                  animate={{ scale: getCircleSize() }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                >
                  <motion.div
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center"
                    animate={{ scale: getCircleSize() }}
                    transition={{ duration: 0.1, ease: 'linear' }}
                  >
                    <span className="text-primary-foreground font-bold text-lg">
                      {phase !== 'idle' ? Math.ceil(getCurrentPhaseDuration() - phaseTime) : ''}
                    </span>
                  </motion.div>
                </motion.div>
              </div>

              {/* Phase Label */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center mb-4"
                >
                  <span className="text-2xl font-bold text-primary">{getPhaseLabel()}</span>
                </motion.div>
              </AnimatePresence>

              {/* Progress */}
              {phase !== 'idle' && (
                <div className="w-full max-w-xs mb-4">
                  <Progress value={getProgress()} className="h-2" />
                </div>
              )}

              {/* Cycle Counter */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>Cycle {currentCycle} of {selectedPattern.cycles}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{Math.floor(totalTime)}s</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                {!isActive && phase === 'idle' && (
                  <Button onClick={startExercise} size="lg" className="gap-2">
                    <Play className="w-5 h-5" />
                    Start
                  </Button>
                )}
                {isActive && (
                  <Button onClick={pauseExercise} variant="outline" size="lg" className="gap-2">
                    <Pause className="w-5 h-5" />
                    Pause
                  </Button>
                )}
                {!isActive && phase !== 'idle' && (
                  <Button onClick={() => setIsActive(true)} size="lg" className="gap-2">
                    <Play className="w-5 h-5" />
                    Resume
                  </Button>
                )}
                {(phase !== 'idle' || currentCycle > 1) && (
                  <Button onClick={resetExercise} variant="outline" size="lg" className="gap-2">
                    <RotateCcw className="w-5 h-5" />
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Breathing Tips for Labor</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-xl">💡</span>
                <p className="text-sm text-muted-foreground">
                  Practice these patterns regularly before labor so they become natural during delivery.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-xl">🎯</span>
                <p className="text-sm text-muted-foreground">
                  Focus on making your exhale longer than your inhale to activate your relaxation response.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-xl">🤝</span>
                <p className="text-sm text-muted-foreground">
                  Have your partner breathe with you during labor for support and encouragement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
