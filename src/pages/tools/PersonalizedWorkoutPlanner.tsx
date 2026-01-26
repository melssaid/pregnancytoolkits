import React, { useState } from 'react';
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

  return (
    <ToolFrame
      title="Personalized Workout Planner"
      subtitle="Safe pregnancy exercises for each trimester"
      mood="empowering"
      toolId="workout-planner"
      icon={Dumbbell}
    >
      {showDisclaimer && (
        <MedicalDisclaimer
          toolName="Personalized Workout Planner"
          onAccept={() => setShowDisclaimer(false)}
        />
      )}

      {!showDisclaimer && !activeWorkout && (
        <div className="space-y-6">
          {/* Trimester Selection */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Select Your Trimester</h3>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(t => (
                  <Button
                    key={t}
                    variant={selectedTrimester === t ? 'default' : 'outline'}
                    onClick={() => setSelectedTrimester(t)}
                    className="h-16 flex-col"
                  >
                    <span className="text-lg font-bold">{t}</span>
                    <span className="text-xs">Trimester</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Safety Notice */}
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 mb-1">Before You Start</p>
                  <p className="text-amber-700">
                    Always get clearance from your healthcare provider before starting any exercise program during pregnancy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workout Plans */}
          <div className="space-y-4">
            <h3 className="font-semibold">Available Workouts</h3>
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
                          {workout.intensity} intensity
                        </Badge>
                      </div>
                    </div>
                    <Heart className="w-6 h-6 text-primary" />
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {workout.exercises.length} exercises designed for trimester {workout.trimester.join(', ')}
                  </p>

                  <Button onClick={() => startWorkout(workout)} className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Start Workout
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!showDisclaimer && activeWorkout && (
        <div className="space-y-6">
          {/* Workout Header */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{activeWorkout.name}</h3>
                  <p className="opacity-80 text-sm">
                    Exercise {currentExercise + 1} of {activeWorkout.exercises.length}
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={endWorkout}>
                  End
                </Button>
              </div>
              
              {/* Progress */}
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

          {/* Current Exercise */}
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
                  <h5 className="font-medium text-sm mb-2">Modification:</h5>
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
                  className="w-full h-14 text-lg"
                  disabled={completedExercises.includes(activeWorkout.exercises[currentExercise].id)}
                >
                  {completedExercises.includes(activeWorkout.exercises[currentExercise].id) ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Completed
                    </>
                  ) : (
                    'Complete Exercise'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Workout Complete */}
          {completedExercises.length === activeWorkout.exercises.length && (
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-emerald-800 mb-2">
                  Workout Complete! 🎉
                </h3>
                <p className="text-emerald-700 mb-4">
                  Great job taking care of yourself and your baby!
                </p>
                <Button onClick={endWorkout}>
                  Back to Workouts
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </ToolFrame>
  );
}
