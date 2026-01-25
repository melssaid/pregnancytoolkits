import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Play, Pause, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  targetArea: string;
  difficulty: string;
  steps: string[];
  icon: string;
}

const backPainExercises: Exercise[] = [
  {
    id: 'cat-cow',
    name: 'Cat-Cow Stretch',
    description: 'Alternating spinal flexion and extension',
    duration: 60,
    targetArea: 'Lower & Upper Back',
    difficulty: 'Easy',
    steps: [
      'Start on hands and knees',
      'Inhale: Drop belly, lift head (Cow)',
      'Exhale: Round spine, tuck chin (Cat)',
      'Move slowly between positions',
      'Repeat 10-15 times'
    ],
    icon: '🐱'
  },
  {
    id: 'pelvic-tilt',
    name: 'Pelvic Tilts',
    description: 'Strengthen core and relieve lower back pressure',
    duration: 45,
    targetArea: 'Lower Back & Core',
    difficulty: 'Easy',
    steps: [
      'Lie on your back with knees bent',
      'Flatten your lower back against the floor',
      'Tilt your pelvis upward slightly',
      'Hold for 5 seconds',
      'Repeat 10-15 times'
    ],
    icon: '🏋️'
  },
  {
    id: 'child-pose',
    name: "Child's Pose",
    description: 'Gentle stretch for the entire back',
    duration: 60,
    targetArea: 'Full Back',
    difficulty: 'Easy',
    steps: [
      'Kneel on the floor',
      'Spread knees wide to accommodate belly',
      'Sit back on heels',
      'Stretch arms forward on floor',
      'Rest and breathe deeply'
    ],
    icon: '🧘'
  },
  {
    id: 'piriformis',
    name: 'Piriformis Stretch',
    description: 'Relieve sciatic pain and hip tension',
    duration: 60,
    targetArea: 'Hips & Lower Back',
    difficulty: 'Moderate',
    steps: [
      'Sit in a chair',
      'Cross one ankle over opposite knee',
      'Gently lean forward',
      'Hold for 30 seconds',
      'Switch sides'
    ],
    icon: '🦵'
  },
  {
    id: 'wall-push',
    name: 'Wall Push-Up',
    description: 'Strengthen upper back and shoulders',
    duration: 45,
    targetArea: 'Upper Back & Arms',
    difficulty: 'Easy',
    steps: [
      'Stand arm-length from wall',
      'Place palms on wall at shoulder height',
      'Slowly bend elbows toward wall',
      'Push back to starting position',
      'Repeat 10-15 times'
    ],
    icon: '💪'
  },
  {
    id: 'side-stretch',
    name: 'Side Body Stretch',
    description: 'Stretch the sides of your torso',
    duration: 45,
    targetArea: 'Side Body',
    difficulty: 'Easy',
    steps: [
      'Stand with feet hip-width apart',
      'Raise one arm overhead',
      'Lean gently to the opposite side',
      'Hold for 15-20 seconds',
      'Switch sides'
    ],
    icon: '🌈'
  }
];

export default function AIBackPainRelief() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('backPainCompletedToday');
    const savedDate = localStorage.getItem('backPainLastDate');
    const today = new Date().toDateString();
    
    if (savedDate === today && saved) {
      setCompletedExercises(JSON.parse(saved));
    } else {
      localStorage.setItem('backPainLastDate', today);
      localStorage.setItem('backPainCompletedToday', '[]');
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && selectedExercise && isActive) {
      completeExercise();
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining, selectedExercise]);

  const completeExercise = () => {
    if (selectedExercise && !completedExercises.includes(selectedExercise.id)) {
      const updated = [...completedExercises, selectedExercise.id];
      setCompletedExercises(updated);
      localStorage.setItem('backPainCompletedToday', JSON.stringify(updated));
    }
    setIsActive(false);
  };

  const startExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setTimeRemaining(exercise.duration);
    setIsActive(true);
  };

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName="AI Back Pain Relief"
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title="AI Back Pain Relief"
      subtitle="Safe exercises to relieve pregnancy-related back pain"
      icon={Activity}
      mood="calm"
      toolId="ai-back-pain-relief"
    >
      <div className="space-y-6">
        {/* Progress */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Today's Relief Routine</h3>
                <p className="text-sm text-muted-foreground">
                  {completedExercises.length}/{backPainExercises.length} exercises completed
                </p>
              </div>
              <div className="text-3xl font-bold text-primary">
                {Math.round((completedExercises.length / backPainExercises.length) * 100)}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Exercise */}
        {selectedExercise && isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-2 border-primary">
              <CardContent className="p-6 text-center">
                <span className="text-6xl block mb-4">{selectedExercise.icon}</span>
                <h3 className="text-xl font-bold mb-2">{selectedExercise.name}</h3>
                
                <div className="text-5xl font-bold text-primary my-6">
                  {timeRemaining}s
                </div>

                <div className="bg-muted/50 p-4 rounded-lg text-left mb-4">
                  <h4 className="font-semibold mb-2">Steps:</h4>
                  {selectedExercise.steps.map((step, i) => (
                    <p key={i} className="text-sm text-muted-foreground">
                      {i + 1}. {step}
                    </p>
                  ))}
                </div>

                <Button variant="outline" onClick={() => setIsActive(false)}>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Exercise List */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">Back Pain Exercises</h3>
            <div className="space-y-3">
              {backPainExercises.map((exercise) => {
                const isCompleted = completedExercises.includes(exercise.id);
                return (
                  <div
                    key={exercise.id}
                    className={`p-4 rounded-lg transition-all ${
                      isCompleted 
                        ? 'bg-green-500/10 border border-green-500/20' 
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{exercise.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{exercise.name}</span>
                          {isCompleted && <CheckCircle className="w-4 h-4 text-green-600" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{exercise.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            {exercise.targetArea}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-muted rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {exercise.duration}s
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isCompleted ? 'outline' : 'default'}
                        onClick={() => startExercise(exercise)}
                        disabled={isActive}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-destructive">Important Safety Notice</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Stop immediately if you experience sharp pain, dizziness, or contractions. 
                  Always consult your healthcare provider before starting any exercise program during pregnancy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
