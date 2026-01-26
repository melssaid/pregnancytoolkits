import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Play, Pause, Volume2, Flower2, Wind, Sun, Moon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface RelaxationExercise {
  id: string;
  name: string;
  duration: number;
  description: string;
  type: 'breathing' | 'visualization' | 'grounding';
  steps: string[];
}

const exercises: RelaxationExercise[] = [
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    duration: 240,
    description: 'A calming technique used by Navy SEALs',
    type: 'breathing',
    steps: [
      'Breathe in slowly for 4 seconds',
      'Hold your breath for 4 seconds',
      'Exhale slowly for 4 seconds',
      'Hold for 4 seconds',
      'Repeat the cycle'
    ]
  },
  {
    id: 'safe-place',
    name: 'Safe Place Visualization',
    duration: 300,
    description: 'Imagine your perfect peaceful sanctuary',
    type: 'visualization',
    steps: [
      'Close your eyes and take deep breaths',
      'Imagine a place where you feel completely safe',
      'Notice the colors, sounds, and smells',
      'Feel the peace and comfort surrounding you',
      'Stay here as long as you need'
    ]
  },
  {
    id: '5-4-3-2-1',
    name: '5-4-3-2-1 Grounding',
    duration: 180,
    description: 'A sensory technique to reduce anxiety',
    type: 'grounding',
    steps: [
      'Notice 5 things you can SEE',
      'Notice 4 things you can TOUCH',
      'Notice 3 things you can HEAR',
      'Notice 2 things you can SMELL',
      'Notice 1 thing you can TASTE'
    ]
  },
  {
    id: 'progressive-relaxation',
    name: 'Progressive Muscle Relaxation',
    duration: 420,
    description: 'Release tension from head to toe',
    type: 'breathing',
    steps: [
      'Start with your feet - tense for 5 seconds, release',
      'Move to your calves - tense and release',
      'Continue to thighs, abdomen, hands, arms',
      'Tense and release shoulders, neck, face',
      'Feel the wave of relaxation through your body'
    ]
  }
];

const affirmations = [
  "I am capable of handling whatever comes my way",
  "My body knows how to grow this baby perfectly",
  "I trust my body and my instincts",
  "I am surrounded by love and support",
  "Each breath brings calm and peace",
  "I am strong, I am brave, I am enough",
  "My baby feels my love and calm energy",
  "I release worry and embrace peace"
];

export default function AIStressReliefCoach() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<RelaxationExercise | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [currentAffirmation, setCurrentAffirmation] = useState(affirmations[0]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && selectedExercise) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev >= selectedExercise.duration) {
            setIsPlaying(false);
            return 0;
          }
          
          // Change step periodically
          const stepDuration = selectedExercise.duration / selectedExercise.steps.length;
          const newStep = Math.floor(prev / stepDuration);
          if (newStep !== currentStep && newStep < selectedExercise.steps.length) {
            setCurrentStep(newStep);
          }
          
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedExercise, currentStep]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAffirmation(affirmations[Math.floor(Math.random() * affirmations.length)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const startExercise = (exercise: RelaxationExercise) => {
    setSelectedExercise(exercise);
    setCurrentStep(0);
    setTimer(0);
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'breathing': return Wind;
      case 'visualization': return Sparkles;
      case 'grounding': return Flower2;
      default: return Heart;
    }
  };

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName="AI Stress Relief Coach"
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title="AI Stress Relief Coach"
      subtitle="Guided relaxation techniques for pregnancy"
      mood="calm"
      toolId="stress-relief"
      icon={Heart}
    >
      <div className="space-y-6">
          {/* Daily Affirmation */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sun className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Today's Affirmation</span>
              </div>
              <motion.p 
                key={currentAffirmation}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-medium text-foreground italic"
              >
                "{currentAffirmation}"
              </motion.p>
            </CardContent>
          </Card>

          {/* Active Exercise */}
          {selectedExercise && isPlaying && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">{selectedExercise.name}</h3>
                  <div className="text-4xl font-bold text-primary mb-4">
                    {formatTime(timer)}
                  </div>
                  
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-background rounded-xl p-6 mb-4"
                  >
                    <p className="text-lg font-medium">
                      {selectedExercise.steps[currentStep]}
                    </p>
                  </motion.div>

                  <div className="flex justify-center gap-2 mb-4">
                    {selectedExercise.steps.map((_, i) => (
                      <div 
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i === currentStep ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setIsPlaying(false)}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Exercise List */}
          {(!selectedExercise || !isPlaying) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Relaxation Exercises</h3>
              {exercises.map(exercise => {
                const TypeIcon = getTypeIcon(exercise.type);
                return (
                  <Card key={exercise.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <TypeIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{exercise.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {exercise.description}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground">
                              {Math.floor(exercise.duration / 60)} min
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">
                              {exercise.type}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => startExercise(exercise)}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Quick Tips */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Moon className="w-4 h-4 text-primary" />
                Quick Stress Relief Tips
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Take 3 deep breaths right now</li>
                <li>• Step outside for fresh air if possible</li>
                <li>• Drink a glass of water slowly</li>
                <li>• Call someone who makes you smile</li>
                <li>• Put your hand on your belly and connect with baby</li>
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">
              ⚠️ These exercises are for general relaxation. If you experience severe anxiety or depression, 
            please consult your healthcare provider.
          </p>
        </div>
      </div>
    </ToolFrame>
  );
}
