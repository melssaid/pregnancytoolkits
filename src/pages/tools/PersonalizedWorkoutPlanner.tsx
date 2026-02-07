import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Play, Clock, Flame, Heart, AlertTriangle, CheckCircle } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  duration: string;
  reps?: string;
  description: string;
  benefits: string[];
  safeTrimesters: number[];
  modifications: string;
  contraindications: string[];
}

interface WorkoutPlan {
  id: string;
  name: string;
  duration: string;
  intensity: 'low' | 'moderate';
  trimester: number[];
  exercises: Exercise[];
  warnings: string[];
}

const workoutPlans: WorkoutPlan[] = [
  {
    id: 'first-trimester-gentle',
    name: 'First Trimester Gentle Flow',
    duration: '20 min',
    intensity: 'low',
    trimester: [1],
    warnings: ['Stop if you feel nauseous', 'Stay hydrated'],
    exercises: [
      {
        id: '1',
        name: 'Gentle Walking Warm-up',
        duration: '3 min',
        description: 'Walk in place at a comfortable pace',
        benefits: ['Increases blood flow', 'Warms up muscles'],
        safeTrimesters: [1, 2, 3],
        modifications: 'Hold onto a chair if needed',
        contraindications: ['Severe fatigue']
      },
      {
        id: '2',
        name: 'Seated Cat-Cow',
        duration: '2 min',
        reps: '8-10 reps',
        description: 'Gentle spinal flexion and extension while seated',
        benefits: ['Relieves back tension', 'Improves flexibility'],
        safeTrimesters: [1, 2, 3],
        modifications: 'Make movements smaller if uncomfortable',
        contraindications: ['Back injury']
      },
      {
        id: '3',
        name: 'Side Stretches',
        duration: '2 min',
        reps: '5 each side',
        description: 'Gentle side bending to stretch obliques',
        benefits: ['Opens ribcage', 'Improves breathing'],
        safeTrimesters: [1, 2, 3],
        modifications: 'Sit if standing feels unstable',
        contraindications: []
      },
      {
        id: '4',
        name: 'Pelvic Tilts',
        duration: '3 min',
        reps: '10 reps',
        description: 'Tilt pelvis forward and back while standing',
        benefits: ['Strengthens core', 'Relieves lower back'],
        safeTrimesters: [1, 2, 3],
        modifications: 'Hold onto wall for balance',
        contraindications: []
      },
      {
        id: '5',
        name: 'Deep Breathing',
        duration: '3 min',
        description: 'Diaphragmatic breathing to relax',
        benefits: ['Reduces stress', 'Increases oxygen'],
        safeTrimesters: [1, 2, 3],
        modifications: 'Sit if lying down causes dizziness',
        contraindications: []
      }
    ]
  },
  {
    id: 'second-trimester-strength',
    name: 'Second Trimester Strength',
    duration: '25 min',
    intensity: 'moderate',
    trimester: [2],
    warnings: ['Avoid lying flat on back', 'Use modifications as needed'],
    exercises: [
      {
        id: '1',
        name: 'Modified Squats',
        duration: '3 min',
        reps: '12 reps',
        description: 'Wide stance squats with support',
        benefits: ['Strengthens legs', 'Prepares for labor'],
        safeTrimesters: [1, 2, 3],
        modifications: 'Hold onto chair or wall',
        contraindications: ['Pelvic pain', 'SPD']
      },
      {
        id: '2',
        name: 'Wall Push-ups',
        duration: '3 min',
        reps: '10 reps',
        description: 'Push-ups against the wall',
        benefits: ['Strengthens arms and chest', 'Safe for pregnancy'],
        safeTrimesters: [1, 2, 3],
        modifications: 'Step closer to wall for easier reps',
        contraindications: ['Wrist pain']
      },
      {
        id: '3',
        name: 'Side-Lying Leg Lifts',
        duration: '4 min',
        reps: '12 each side',
        description: 'Lift top leg while lying on side',
        benefits: ['Strengthens hips', 'Improves stability'],
        safeTrimesters: [1, 2, 3],
        modifications: 'Use pillow under head',
        contraindications: ['Hip pain']
      },
      {
        id: '4',
        name: 'Kegel Exercises',
        duration: '3 min',
        reps: '15 reps',
        description: 'Contract and release pelvic floor',
        benefits: ['Strengthens pelvic floor', 'Prevents incontinence'],
        safeTrimesters: [1, 2, 3],
        modifications: 'Can do seated or lying down',
        contraindications: []
      },
      {
        id: '5',
        name: 'Cool Down Stretches',
        duration: '5 min',
        description: 'Gentle full-body stretching',
        benefits: ['Reduces muscle tension', 'Promotes relaxation'],
        safeTrimesters: [1, 2, 3],
        modifications: 'Use props for support',
        contraindications: []
      }
    ]
  },
  {
    id: 'third-trimester-prep',
    name: 'Third Trimester Labor Prep',
    duration: '15 min',
    intensity: 'low',
    trimester: [3],
    warnings: ['Focus on breathing', 'Listen to your body'],
    exercises: [
      {
        id: '1',
        name: 'Birth Ball Circles',
        duration: '3 min',
        description: 'Sit on birth ball and make hip circles',
        benefits: ['Opens pelvis', 'Encourages optimal baby position'],
        safeTrimesters: [3],
        modifications: 'Hold onto something for stability',
        contraindications: ['Balance issues']
      },
      {
        id: '2',
        name: 'Deep Squat Hold',
        duration: '2 min',
        reps: '3 holds of 30 sec',
        description: 'Supported deep squat position',
        benefits: ['Opens pelvis', 'Prepares for labor'],
        safeTrimesters: [2, 3],
        modifications: 'Use wall or partner for support',
        contraindications: ['SPD', 'Placenta previa']
      },
      {
        id: '3',
        name: 'Cat-Cow on All Fours',
        duration: '3 min',
        reps: '10 reps',
        description: 'Spinal movement on hands and knees',
        benefits: ['Relieves back pain', 'Encourages baby positioning'],
        safeTrimesters: [1, 2, 3],
        modifications: 'Use pillow under knees',
        contraindications: ['Wrist pain']
      },
      {
        id: '4',
        name: 'Labor Breathing Practice',
        duration: '5 min',
        description: 'Practice breathing patterns for labor',
        benefits: ['Prepares for contractions', 'Reduces anxiety'],
        safeTrimesters: [3],
        modifications: 'Find most comfortable position',
        contraindications: []
      }
    ]
  }
];

export default function PersonalizedWorkoutPlanner() {
  const { t } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [selectedTrimester, setSelectedTrimester] = useState(2);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutPlan | null>(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  const filteredWorkouts = workoutPlans.filter(w => w.trimester.includes(selectedTrimester));

  const startWorkout = (workout: WorkoutPlan) => {
    setActiveWorkout(workout);
    setCurrentExercise(0);
    setCompletedExercises([]);
  };

  const completeExercise = (exerciseId: string) => {
    setCompletedExercises(prev => [...prev, exerciseId]);
    if (activeWorkout && currentExercise < activeWorkout.exercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
    }
  };

  const endWorkout = () => {
    setActiveWorkout(null);
    setCurrentExercise(0);
    setCompletedExercises([]);
  };

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName={t('toolsInternal.workoutPlanner.title')}
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title={t('toolsInternal.workoutPlanner.title')}
      subtitle={t('toolsInternal.workoutPlanner.subtitle')}
      mood="empowering"
      toolId="workout-planner"
      icon={Dumbbell}
    >
      {!activeWorkout && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">{t('toolsInternal.workoutPlanner.selectTrimester')}</h3>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(tri => (
                  <Button
                    key={tri}
                    variant={selectedTrimester === tri ? 'default' : 'outline'}
                    onClick={() => setSelectedTrimester(tri)}
                    className="h-16 flex-col"
                  >
                    <span className="text-lg font-bold">{tri}</span>
                    <span className="text-xs">{t('toolsInternal.workoutPlanner.trimester')}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>


          <div className="space-y-4">
            <h3 className="font-semibold">{t('toolsInternal.workoutPlanner.availableWorkouts')}</h3>
            {filteredWorkouts.map(workout => (
              <Card key={workout.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{workout.name}</h4>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {workout.duration}
                        </Badge>
                        <Badge 
                          className={workout.intensity === 'low' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-amber-100 text-amber-700'
                          }
                        >
                          {t(`toolsInternal.workoutPlanner.intensity.${workout.intensity}`)}
                        </Badge>
                      </div>
                    </div>
                    <Heart className="w-6 h-6 text-primary" />
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {workout.exercises.length} {t('toolsInternal.workoutPlanner.exercise')}s
                  </p>

                  <Button onClick={() => startWorkout(workout)} className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    {t('toolsInternal.workoutPlanner.startWorkout')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeWorkout && (
        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{activeWorkout.name}</h3>
                  <p className="opacity-80 text-sm">
                    {t('toolsInternal.workoutPlanner.exercise')} {currentExercise + 1} {t('toolsInternal.workoutPlanner.of')} {activeWorkout.exercises.length}
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={endWorkout}>
                  {t('toolsInternal.workoutPlanner.endWorkout')}
                </Button>
              </div>
              
              <div className="mt-4 flex gap-1">
                {activeWorkout.exercises.map((_, i) => (
                  <div 
                    key={i}
                    className={`h-2 flex-1 rounded-full ${
                      completedExercises.includes(activeWorkout.exercises[i].id) 
                        ? 'bg-white' 
                        : i === currentExercise 
                        ? 'bg-white/60' 
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {activeWorkout.exercises[currentExercise] && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h4 className="text-2xl font-bold mb-2">
                    {activeWorkout.exercises[currentExercise].name}
                  </h4>
                  <div className="flex justify-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {activeWorkout.exercises[currentExercise].duration}
                    </span>
                    {activeWorkout.exercises[currentExercise].reps && (
                      <span className="flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        {activeWorkout.exercises[currentExercise].reps}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-center text-muted-foreground mb-6">
                  {activeWorkout.exercises[currentExercise].description}
                </p>

                <div className="bg-muted/50 rounded-xl p-4 mb-6">
                  <h5 className="font-medium text-sm mb-2">{t('toolsInternal.workoutPlanner.modification')}:</h5>
                  <p className="text-sm text-muted-foreground">
                    {activeWorkout.exercises[currentExercise].modifications}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {activeWorkout.exercises[currentExercise].benefits.map((benefit, i) => (
                    <Badge key={i} variant="secondary">
                      {benefit}
                    </Badge>
                  ))}
                </div>

                <Button 
                  onClick={() => completeExercise(activeWorkout.exercises[currentExercise].id)}
                  className="w-full h-11 text-sm"
                  disabled={completedExercises.includes(activeWorkout.exercises[currentExercise].id)}
                >
                  {completedExercises.includes(activeWorkout.exercises[currentExercise].id) ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {t('toolsInternal.workoutPlanner.completed')}
                    </>
                  ) : (
                    t('toolsInternal.workoutPlanner.completeExercise')
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {completedExercises.length === activeWorkout.exercises.length && (
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-emerald-800 mb-2">
                  {t('toolsInternal.workoutPlanner.workoutComplete')}
                </h3>
                <p className="text-emerald-700 mb-4">
                  {t('toolsInternal.workoutPlanner.greatJob')}
                </p>
                <Button onClick={endWorkout}>
                  {t('toolsInternal.workoutPlanner.backToWorkouts')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </ToolFrame>
  );
}
