import React, { useState, useEffect, useRef } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX, Timer, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfter: number;
  useCase: string;
  trimester: number[];
}

const breathingPatterns: BreathingPattern[] = [
  {
    id: 'relaxation',
    name: 'Relaxation Breathing',
    description: 'Deep, slow breathing to reduce stress and anxiety',
    inhale: 4,
    hold: 2,
    exhale: 6,
    holdAfter: 0,
    useCase: 'Daily relaxation and stress relief',
    trimester: [1, 2, 3]
  },
  {
    id: 'early-labor',
    name: 'Early Labor Breathing',
    description: 'Slow, rhythmic breathing for early contractions',
    inhale: 4,
    hold: 0,
    exhale: 4,
    holdAfter: 0,
    useCase: 'When contractions are 5+ minutes apart',
    trimester: [3]
  },
  {
    id: 'active-labor',
    name: 'Active Labor Breathing',
    description: 'Patterned breathing for stronger contractions',
    inhale: 3,
    hold: 0,
    exhale: 3,
    holdAfter: 0,
    useCase: 'When contractions are 3-5 minutes apart',
    trimester: [3]
  },
  {
    id: 'transition',
    name: 'Transition Breathing',
    description: 'Light, patterned breathing for intense contractions',
    inhale: 2,
    hold: 0,
    exhale: 2,
    holdAfter: 0,
    useCase: 'During the most intense phase before pushing',
    trimester: [3]
  },
  {
    id: 'calming-478',
    name: '4-7-8 Calming',
    description: 'The classic anxiety-reducing pattern',
    inhale: 4,
    hold: 7,
    exhale: 8,
    holdAfter: 0,
    useCase: 'Before sleep or during anxiety moments',
    trimester: [1, 2, 3]
  }
];

export default function LaborBreathingCoach() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(breathingPatterns[0]);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdAfter'>('inhale');
  const [timer, setTimer] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getPhaseTime = () => {
    switch (phase) {
      case 'inhale': return selectedPattern.inhale;
      case 'hold': return selectedPattern.hold;
      case 'exhale': return selectedPattern.exhale;
      case 'holdAfter': return selectedPattern.holdAfter;
    }
  };

  const getNextPhase = (): 'inhale' | 'hold' | 'exhale' | 'holdAfter' => {
    switch (phase) {
      case 'inhale':
        return selectedPattern.hold > 0 ? 'hold' : 'exhale';
      case 'hold':
        return 'exhale';
      case 'exhale':
        return selectedPattern.holdAfter > 0 ? 'holdAfter' : 'inhale';
      case 'holdAfter':
        return 'inhale';
    }
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev >= getPhaseTime()) {
            const nextPhase = getNextPhase();
            if (nextPhase === 'inhale') {
              setCycleCount(c => c + 1);
            }
            setPhase(nextPhase);
            return 0;
          }
          return prev + 0.1;
        });
        setTotalTime(prev => prev + 0.1);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, phase, selectedPattern]);

  const toggleBreathing = () => {
    setIsActive(!isActive);
  };

  const resetSession = () => {
    setIsActive(false);
    setPhase('inhale');
    setTimer(0);
    setCycleCount(0);
    setTotalTime(0);
  };

  const selectPattern = (pattern: BreathingPattern) => {
    resetSession();
    setSelectedPattern(pattern);
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale': return 'bg-primary';
      case 'hold': return 'bg-amber-500';
      case 'exhale': return 'bg-emerald-500';
      case 'holdAfter': return 'bg-muted';
    }
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'holdAfter': return 'Hold';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ToolFrame
      title="Labor Breathing Coach"
      subtitle="Guided breathing techniques for pregnancy and labor"
      mood="calm"
      toolId="labor-breathing"
      icon={Wind}
    >
      {showDisclaimer && (
        <MedicalDisclaimer
          toolName="Labor Breathing Coach"
          onAccept={() => setShowDisclaimer(false)}
        />
      )}

      {!showDisclaimer && (
        <div className="space-y-6">
          {/* Pattern Selection */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3">Choose Breathing Pattern</h3>
              <div className="space-y-2">
                {breathingPatterns.map(pattern => (
                  <button
                    key={pattern.id}
                    onClick={() => selectPattern(pattern)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      selectedPattern.id === pattern.id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium text-sm">{pattern.name}</div>
                    <div className={`text-xs mt-1 ${
                      selectedPattern.id === pattern.id ? 'opacity-80' : 'text-muted-foreground'
                    }`}>
                      {pattern.inhale}s in • {pattern.hold > 0 ? `${pattern.hold}s hold • ` : ''}{pattern.exhale}s out
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Breathing Visualization */}
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col items-center">
                {/* Animated Circle */}
                <div className="relative w-48 h-48 mb-6">
                  <motion.div
                    animate={{
                      scale: phase === 'inhale' ? [1, 1.4] : 
                             phase === 'exhale' ? [1.4, 1] : 
                             1.4
                    }}
                    transition={{
                      duration: getPhaseTime(),
                      ease: 'easeInOut'
                    }}
                    className={`absolute inset-0 rounded-full ${getPhaseColor()} opacity-30`}
                  />
                  <motion.div
                    animate={{
                      scale: phase === 'inhale' ? [0.6, 1] : 
                             phase === 'exhale' ? [1, 0.6] : 
                             1
                    }}
                    transition={{
                      duration: getPhaseTime(),
                      ease: 'easeInOut'
                    }}
                    className={`absolute inset-4 rounded-full ${getPhaseColor()} flex items-center justify-center`}
                  >
                    <div className="text-center text-white">
                      <div className="text-3xl font-bold">
                        {Math.ceil(getPhaseTime() - timer)}
                      </div>
                      <div className="text-sm font-medium opacity-80">
                        {getPhaseInstruction()}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 w-full mb-6">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{cycleCount}</div>
                    <div className="text-xs text-muted-foreground">Cycles</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{formatTime(totalTime)}</div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {selectedPattern.inhale + selectedPattern.hold + selectedPattern.exhale + selectedPattern.holdAfter}s
                    </div>
                    <div className="text-xs text-muted-foreground">Per Cycle</div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                    className="rounded-full"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                  
                  <Button
                    size="lg"
                    onClick={toggleBreathing}
                    className="rounded-full w-16 h-16"
                  >
                    {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetSession}
                    className="rounded-full"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pattern Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">{selectedPattern.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{selectedPattern.description}</p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Best for:</strong> {selectedPattern.useCase}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">
              ⚠️ Practice these techniques regularly before labor. During actual labor, 
              follow the guidance of your healthcare provider and birthing team.
            </p>
          </div>
        </div>
      )}
    </ToolFrame>
  );
}
