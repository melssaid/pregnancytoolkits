import React, { useState } from 'react';
import { ArrowLeft, Dumbbell, Play, Pause, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MedicalDisclaimer from '../../components/compliance/MedicalDisclaimer';

interface Exercise {
  id: string;
  name: string;
  duration: number;
  trimester: number[];
  difficulty: 'easy' | 'moderate';
  description: string;
  icon: string;
}

const exercises: Exercise[] = [
  { id: '1', name: 'Pelvic Tilts', duration: 60, trimester: [1, 2, 3], difficulty: 'easy', description: 'Gentle core strengthening', icon: '🧘' },
  { id: '2', name: 'Cat-Cow Stretch', duration: 90, trimester: [1, 2, 3], difficulty: 'easy', description: 'Spine flexibility', icon: '🐱' },
  { id: '3', name: 'Prenatal Squats', duration: 60, trimester: [1, 2], difficulty: 'moderate', description: 'Lower body strength', icon: '🏋️' },
  { id: '4', name: 'Arm Circles', duration: 45, trimester: [1, 2, 3], difficulty: 'easy', description: 'Upper body mobility', icon: '💪' },
  { id: '5', name: 'Side Leg Lifts', duration: 60, trimester: [1, 2, 3], difficulty: 'easy', description: 'Hip strengthening', icon: '🦵' },
  { id: '6', name: 'Deep Breathing', duration: 120, trimester: [1, 2, 3], difficulty: 'easy', description: 'Relaxation & oxygen flow', icon: '🌬️' },
];

const AIFitnessCoach: React.FC = () => {
  const navigate = useNavigate();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [currentTrimester, setCurrentTrimester] = useState(2);
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const filteredExercises = exercises.filter(e => e.trimester.includes(currentTrimester));

  const startExercise = (exerciseId: string, duration: number) => {
    setActiveExercise(exerciseId);
    setTimer(duration);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetTimer = () => {
    const exercise = exercises.find(e => e.id === activeExercise);
    if (exercise) setTimer(exercise.duration);
    setIsPlaying(false);
  };

  if (!disclaimerAccepted) {
    return <MedicalDisclaimer toolName="AI Fitness Coach" onAccept={() => setDisclaimerAccepted(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">AI Fitness Coach</h1>
              <p className="text-xs text-gray-500">Safe pregnancy exercises</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Warning Banner */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <strong>Important:</strong> Get your doctor's approval before starting any exercise program during pregnancy. Stop immediately if you feel pain or discomfort.
          </div>
        </div>

        {/* Trimester Selector */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Select Trimester</h2>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((t) => (
              <button
                key={t}
                onClick={() => setCurrentTrimester(t)}
                className={`py-3 rounded-xl font-semibold transition-all ${
                  currentTrimester === t
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t}st Trimester
              </button>
            ))}
          </div>
        </div>

        {/* Active Timer */}
        {activeExercise && (
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white text-center">
            <p className="text-sm opacity-90 mb-2">
              {exercises.find(e => e.id === activeExercise)?.name}
            </p>
            <p className="text-5xl font-bold mb-4">
              {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={togglePlayPause}
                className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <button
                onClick={resetTimer}
                className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Exercise List */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommended Exercises</h2>
          <div className="space-y-3">
            {filteredExercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => startExercise(exercise.id, exercise.duration)}
                className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                  activeExercise === exercise.id
                    ? 'bg-orange-100 border-2 border-orange-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <span className="text-3xl">{exercise.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{exercise.name}</p>
                  <p className="text-sm text-gray-500">{exercise.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-orange-600">{exercise.duration}s</p>
                  <p className="text-xs text-gray-400">{exercise.difficulty}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Safety Tips */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-800">Safety Tips</h3>
          </div>
          <ul className="text-sm text-green-700 space-y-1 ml-7">
            <li>• Stay hydrated before, during, and after exercise</li>
            <li>• Avoid exercises lying flat on your back after 1st trimester</li>
            <li>• Listen to your body and rest when needed</li>
            <li>• Wear comfortable, supportive clothing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIFitnessCoach;
