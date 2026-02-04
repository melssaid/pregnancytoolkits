import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { ArrowLeft, Dumbbell, Play, Pause, RotateCcw, CheckCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MedicalDisclaimer from '../../components/compliance/MedicalDisclaimer';
import { VideoLibrary, Video } from '@/components/VideoLibrary';

const fitnessVideos: Video[] = [
  { id: "1", title: "Safe Prenatal Core Workout", description: "10-minute safe abs workout for first trimester", youtubeId: "f7KnXTEpf5M", duration: "10:00", category: "Core" },
  { id: "2", title: "Pregnancy Safe HIIT Cardio", description: "20 minute no repeat low impact workout", youtubeId: "DeaayKWssak", duration: "20:00", category: "Cardio" },
  { id: "3", title: "Prenatal Yoga for Relaxation", description: "Deep relaxation yoga for pregnancy", youtubeId: "vEcZD8Js2Ws", duration: "25:00", category: "Yoga" },
  { id: "4", title: "Pregnancy Relaxation Meditation", description: "Calming meditation for expecting mothers", youtubeId: "pCSjhbVOdYQ", duration: "60:00", category: "Relaxation" },
];

interface Exercise {
  id: string;
  nameKey: string;
  duration: number;
  descriptionKey: string;
  category: 'strength' | 'cardio' | 'flexibility';
  difficulty: 'beginner' | 'intermediate';
}

const exerciseDatabase: Exercise[] = [
  { id: 'squat', nameKey: 'prenatalSquats', duration: 45, descriptionKey: 'prenatalSquatsDesc', category: 'strength', difficulty: 'beginner' },
  { id: 'bird-dog', nameKey: 'birdDog', duration: 30, descriptionKey: 'birdDogDesc', category: 'strength', difficulty: 'intermediate' },
  { id: 'pelvic-tilt', nameKey: 'pelvicTilts', duration: 60, descriptionKey: 'pelvicTiltsDesc', category: 'flexibility', difficulty: 'beginner' },
  { id: 'wall-pushup', nameKey: 'wallPushups', duration: 45, descriptionKey: 'wallPushupsDesc', category: 'strength', difficulty: 'beginner' },
  { id: 'butterfly', nameKey: 'butterflyStretch', duration: 60, descriptionKey: 'butterflyStretchDesc', category: 'flexibility', difficulty: 'beginner' },
  { id: 'marching', nameKey: 'seatedMarching', duration: 60, descriptionKey: 'seatedMarchingDesc', category: 'cardio', difficulty: 'beginner' },
];

const AIFitnessCoach: React.FC = () => {
  const { t } = useTranslation();
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
              <h1 className="text-lg font-bold text-gray-900">{t('toolsInternal.fitnessCoach.title')}</h1>
              <p className="text-xs text-gray-500">{t('toolsInternal.common.week')} {currentWeek}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Controls */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('toolsInternal.fitnessCoach.currentWeek')}: {currentWeek}</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('toolsInternal.fitnessCoach.activityLevel')}</label>
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
                  {t(`toolsInternal.fitnessCoach.${level}`)}
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
                        <h3 className="font-semibold text-gray-900">{t(`toolsInternal.fitnessCoach.exerciseNames.${exercise.nameKey}`)}</h3>
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full capitalize">
                          {t(`toolsInternal.fitnessCoach.categories.${exercise.category}`)}
                        </span>
                      </div>
                    </div>
                    {isActive && (
                      <span className="text-2xl font-mono font-bold text-purple-600">
                        00:{timer.toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 ml-11">{t(`toolsInternal.fitnessCoach.exerciseDescs.${exercise.descriptionKey}`)}</p>
                  
                  <div className="ml-11 flex gap-2">
                    {isActive ? (
                      <button
                        onClick={() => setIsPaused(!isPaused)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                          isPaused ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                        {isPaused ? t('toolsInternal.fitnessCoach.resume') : t('toolsInternal.fitnessCoach.pause')}
                      </button>
                    ) : (
                      <button
                        onClick={() => startExercise(index)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-purple-700 transition-colors"
                      >
                        <Play className="w-4 h-4" /> {t('common.start')} ({exercise.duration}s)
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
          <RotateCcw className="w-4 h-4" /> {t('toolsInternal.fitnessCoach.generatePlan')}
        </button>

        {/* Educational Videos */}
        <VideoLibrary
          videos={fitnessVideos}
          title={t('toolsInternal.fitnessCoach.fitnessVideos')}
          subtitle={t('toolsInternal.fitnessCoach.fitnessVideosSubtitle')}
          accentColor="violet"
        />

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            <strong>{t('toolsInternal.fitnessCoach.safetyFirst')}:</strong> {t('toolsInternal.fitnessCoach.safetyText')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIFitnessCoach;
