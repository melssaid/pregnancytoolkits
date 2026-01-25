import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Activity, Play, Pause, Volume2, VolumeX, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MedicalDisclaimer from '../../components/compliance/MedicalDisclaimer';

const KegelExercises: React.FC = () => {
  const navigate = useNavigate();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'squeeze' | 'relax' | 'ready'>('ready');
  const [timeLeft, setTimeLeft] = useState(0);
  const [reps, setReps] = useState(0);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Configuration for levels
  const levels = {
    beginner: { squeeze: 3, relax: 5, targetReps: 10, name: 'Beginner (3s hold)' },
    intermediate: { squeeze: 5, relax: 5, targetReps: 15, name: 'Intermediate (5s hold)' },
    advanced: { squeeze: 10, relax: 10, targetReps: 20, name: 'Advanced (10s hold)' }
  };

  const currentConfig = levels[level];

  // Sound effects
  // In a real app, use useSound hook or HTML5 Audio
  const playSound = (type: 'beep' | 'start' | 'end') => {
    if (!soundEnabled) return;
    // Mock sound function - visual cue is primary for now
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev > 1) return prev - 1;

          // Phase transition logic
          if (phase === 'ready') {
            setPhase('squeeze');
            playSound('start');
            return currentConfig.squeeze;
          } else if (phase === 'squeeze') {
            setPhase('relax');
            playSound('beep');
            return currentConfig.relax;
          } else { // phase === 'relax'
            setReps(r => {
              const newReps = r + 1;
              if (newReps >= currentConfig.targetReps) {
                setIsActive(false);
                setPhase('ready');
                playSound('end');
                return newReps; // Done
              }
              return newReps;
            });
            
            // If not done, go back to squeeze
            if (reps < currentConfig.targetReps - 1) {
              setPhase('squeeze');
              playSound('start');
              return currentConfig.squeeze;
            } else {
               // Finished last rep
               return 0;
            }
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, phase, currentConfig, reps, soundEnabled]);

  const toggleSession = () => {
    if (isActive) {
      setIsActive(false);
      setPhase('ready');
    } else {
      if (reps >= currentConfig.targetReps) setReps(0); // Reset if starting new
      setIsActive(true);
      setPhase('ready');
      setTimeLeft(3); // 3s countdown
    }
  };

  const getCircleStyle = () => {
    const baseStyle = "w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out border-4 ";
    
    if (phase === 'squeeze') {
      return baseStyle + "bg-pink-100 border-pink-500 scale-110 shadow-pink-200 shadow-xl";
    } else if (phase === 'relax') {
      return baseStyle + "bg-blue-50 border-blue-300 scale-100";
    } else {
      return baseStyle + "bg-gray-50 border-gray-200";
    }
  };

  if (!disclaimerAccepted) {
    return <MedicalDisclaimer toolName="Kegel Trainer" onAccept={() => setDisclaimerAccepted(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Kegel Trainer</h1>
              <p className="text-xs text-gray-500">Strengthen pelvic floor</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-8 flex flex-col items-center">
        {/* Level Selector */}
        <div className="w-full bg-white p-2 rounded-xl shadow-sm flex gap-1">
          {(Object.keys(levels) as Array<keyof typeof levels>).map((l) => (
            <button
              key={l}
              onClick={() => {
                setLevel(l);
                setIsActive(false);
                setPhase('ready');
                setReps(0);
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                level === l ? 'bg-pink-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Visualizer */}
        <div className="relative py-8">
          <div className={getCircleStyle()}>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800 mb-1">
                {phase === 'ready' ? (isActive ? timeLeft : 'Start') : timeLeft}
              </p>
              <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
                {phase === 'ready' ? (isActive ? 'Get Ready' : 'Ready') : phase}
              </p>
            </div>
          </div>
          
          {/* Ripples for squeeze */}
          {phase === 'squeeze' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-pink-400 rounded-full opacity-20 animate-ping" />
          )}
        </div>

        {/* Controls */}
        <div className="w-full space-y-6">
          <div className="flex justify-center gap-4">
            <button
              onClick={toggleSession}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                isActive 
                  ? 'bg-white border-2 border-red-100 text-red-500 hover:bg-red-50' 
                  : 'bg-pink-600 text-white hover:bg-pink-700'
              }`}
            >
              {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
            
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 absolute right-8"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Reps Completed</p>
              <p className="text-2xl font-bold text-gray-900">{reps} <span className="text-sm text-gray-400 font-normal">/ {currentConfig.targetReps}</span></p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Session Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.floor(((reps * (currentConfig.squeeze + currentConfig.relax)) + (isActive ? (currentConfig.squeeze + currentConfig.relax - timeLeft) : 0)) / 60)}:
                {(((reps * (currentConfig.squeeze + currentConfig.relax)) + (isActive ? (currentConfig.squeeze + currentConfig.relax - timeLeft) : 0)) % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 w-full">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" /> How to do it
          </h4>
          <p className="text-sm text-blue-800 leading-relaxed">
            Imagine you are trying to stop the flow of urine or stop yourself from passing gas. Squeeze and lift those muscles inward. Don't hold your breath or tighten your stomach/thighs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KegelExercises;
