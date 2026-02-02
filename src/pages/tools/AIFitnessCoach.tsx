import React, { useState, useEffect } from 'react';
import { ArrowLeft, Dumbbell, Play, Pause, RotateCcw, CheckCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MedicalDisclaimer from '../../components/compliance/MedicalDisclaimer';
import { VideoLibrary, Video } from '@/components/VideoLibrary';

const fitnessVideos: Video[] = [
  { id: "1", title: "Safe Prenatal Full Body Workout", description: "Complete workout safe for all trimesters", youtubeId: "pCSjhbVOdYQ", duration: "60:00", category: "Full Workout" },
  { id: "2", title: "Pregnancy Stretching Routine", description: "Gentle stretches for pregnancy comfort", youtubeId: "vEcZD8Js2Ws", duration: "25:00", category: "Stretching" },
  { id: "3", title: "Prenatal Yoga for Beginners", description: "Relaxing yoga flow for pregnant women", youtubeId: "3HPhF_IPJ1E", duration: "15:00", category: "Yoga" },
  { id: "4", title: "Low Impact Prenatal Cardio", description: "Safe cardio workout during pregnancy", youtubeId: "xNfagna9Fxw", duration: "21:00", category: "Cardio" },
];

interface Exercise {
  id: string;
  name: string;
  duration: number; // seconds
  description: string;
  category: 'strength' | 'cardio' | 'flexibility';
  difficulty: 'beginner' | 'intermediate';
}

const exerciseDatabase: Exercise[] = [
  { id: 'squat', name: 'Prenatal Squats', duration: 45, description: 'Stand with feet shoulder-width apart. Lower gently as if sitting in a chair.', category: 'strength', difficulty: 'beginner' },
  { id: 'bird-dog', name: 'Bird Dog', duration: 30, description: 'On hands and knees, extend opposite arm and leg. Hold for balance.', category: 'strength', difficulty: 'intermediate' },
  { id: 'pelvic-tilt', name: 'Pelvic Tilts', duration: 60, description: 'Gently rock your pelvis forward and back to relieve lower back pressure.', category: 'flexibility', difficulty: 'beginner' },
  { id: 'wall-pushup', name: 'Wall Pushups', duration: 45, description: 'Stand arm-length from wall. Lean in and push back out.', category: 'strength', difficulty: 'beginner' },
  { id: 'butterfly', name: 'Butterfly Stretch', duration: 60, description: 'Sit with feet together, knees out. Gently lean forward.', category: 'flexibility', difficulty: 'beginner' },
  { id: 'marching', name: 'Seated Marching', duration: 60, description: 'Sit on a stable chair or ball. Lift knees alternately.', category: 'cardio', difficulty: 'beginner' },
];

const AIFitnessCoach: React.FC = () => {
  const navigate = useNavigate();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(12);
  const [fitnessLevel, setFitnessLevel] = useState<'beginner' | 'intermediate'>('beginner');
  const [generatedWorkout, setGeneratedWorkout] = useState<Exercise[]>([]);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  // Generate workout based on week and level
  const generateWorkout = () => {
    // Filter exercises appropriate for the level
    // (In a real AI app, this would be more complex)
    let exercises = exerciseDatabase.filter(e => 
      fitnessLevel === 'intermediate' ? true : e.difficulty === 'beginner'
    );
    
    // Customize by trimester
    if (currentWeek > 28) {
      // 3rd trimester: focus on flexibility and gentle movement
      exercises = exercises.filter(e => e.category !== 'cardio');
    }

    // Shuffle and pick 3-4 exercises
    const shuffled = [...exercises].sort(() => 0.5 - Math.random());
    setGeneratedWorkout(shuffled.slice(0, 4));
    setActiveExerciseIndex(null);
    setTimer(0);
    setIsPaused(true);
  };

  useEffect(() => {
    generateWorkout();
  }, [currentWeek, fitnessLevel]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused && activeExerciseIndex !== null && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && activeExerciseIndex !== null && !isPaused) {
      setIsPaused(true);
    }
    return () => clearInterval(interval);
  }, [isPaused, timer, activeExerciseIndex]);

  const startExercise = (index: number) => {
    setActiveExerciseIndex(index);
    setTimer(generatedWorkout[index].duration);
    setIsPaused(false);
  };

  if (!disclaimerAccepted) {
    return <MedicalDisclaimer toolName="AI Fitness Coach" onAccept={() => setDisclaimerAccepted(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Fitness Coach</h1>
              <p className="text-xs text-gray-500">Safe workouts for Week {currentWeek}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Controls */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pregnancy Week: {currentWeek}</label>
            <input
              type="range"
              min="4"
              max="40"
              value={currentWeek}
              onChange={(e) => setCurrentWeek(Number(e.target.value))}
              className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Level</label>
            <div className="flex gap-2">
              {(['beginner', 'intermediate'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setFitnessLevel(level)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    fitnessLevel === level 
                      ? 'bg-purple-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Workout List */}
        <div className="space-y-4">
          {generatedWorkout.map((exercise, index) => {
            const isActive = activeExerciseIndex === index;
            const isCompleted = false; // Could add state for this

            return (
              <div 
                key={exercise.id}
                className={`bg-white rounded-2xl overflow-hidden shadow-sm transition-all ${
                  isActive ? 'ring-2 ring-purple-500 transform scale-102' : ''
                }`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isActive ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{exercise.name}</h3>
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full capitalize">
                          {exercise.category}
                        </span>
                      </div>
                    </div>
                    {isActive && (
                      <span className="text-2xl font-mono font-bold text-purple-600">
                        00:{timer.toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 ml-11">{exercise.description}</p>
                  
                  <div className="ml-11 flex gap-2">
                    {isActive ? (
                      <button
                        onClick={() => setIsPaused(!isPaused)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                          isPaused ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                        {isPaused ? 'Resume' : 'Pause'}
                      </button>
                    ) : (
                      <button
                        onClick={() => startExercise(index)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-purple-700 transition-colors"
                      >
                        <Play className="w-4 h-4" /> Start ({exercise.duration}s)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={generateWorkout}
          className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Generate New Workout
        </button>

        {/* Educational Videos */}
        <VideoLibrary
          videos={fitnessVideos}
          title="Prenatal Fitness Videos"
          subtitle="Safe workout guides for every trimester"
          accentColor="violet"
        />

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            <strong>Safety First:</strong> Stop immediately if you feel dizziness, pain, or shortness of breath. Keep water nearby.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIFitnessCoach;
