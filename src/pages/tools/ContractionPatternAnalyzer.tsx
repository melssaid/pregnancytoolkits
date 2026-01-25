import React, { useState, useEffect } from 'react';
import { ArrowLeft, Timer, Play, Square, AlertTriangle, Phone, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MedicalDisclaimer from '../../components/compliance/MedicalDisclaimer';

interface Contraction {
  id: number;
  startTime: Date;
  endTime: Date | null;
  duration: number;
  interval: number | null;
}

const ContractionPatternAnalyzer: React.FC = () => {
  const navigate = useNavigate();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentStart, setCurrentStart] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [contractions, setContractions] = useState<Contraction[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && currentStart) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - currentStart.getTime()) / 1000));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isActive, currentStart]);

  const startContraction = () => {
    setIsActive(true);
    setCurrentStart(new Date());
    setElapsed(0);
  };

  const stopContraction = () => {
    if (currentStart) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - currentStart.getTime()) / 1000);
      const lastContraction = contractions[0];
      const interval = lastContraction
        ? Math.floor((currentStart.getTime() - lastContraction.startTime.getTime()) / 1000 / 60)
        : null;

      setContractions([{
        id: Date.now(),
        startTime: currentStart,
        endTime,
        duration,
        interval
      }, ...contractions]);
    }
    setIsActive(false);
    setCurrentStart(null);
    setElapsed(0);
  };

  const clearAll = () => {
    setContractions([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const avgDuration = contractions.length > 0
    ? contractions.reduce((acc, c) => acc + c.duration, 0) / contractions.length
    : 0;

  const avgInterval = contractions.filter(c => c.interval).length > 0
    ? contractions.filter(c => c.interval).reduce((acc, c) => acc + (c.interval || 0), 0) / contractions.filter(c => c.interval).length
    : 0;

  const shouldCallDoctor = avgDuration >= 60 && avgInterval <= 5 && contractions.length >= 6;

  if (!disclaimerAccepted) {
    return <MedicalDisclaimer toolName="Contraction Timer" onAccept={() => setDisclaimerAccepted(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Contraction Timer</h1>
              <p className="text-xs text-gray-500">Track & analyze patterns</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Emergency Banner */}
        {shouldCallDoctor && (
          <div className="bg-red-500 text-white rounded-2xl p-4 flex items-center gap-4">
            <Phone className="w-8 h-8" />
            <div>
              <p className="font-bold">Time to call your doctor!</p>
              <p className="text-sm opacity-90">Contractions are 5 mins apart, 1 min long, for 1 hour</p>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            This tool is for tracking only. Contact your healthcare provider for medical advice.
          </p>
        </div>

        {/* Timer Display */}
        <div className={`rounded-3xl p-8 text-center ${
          isActive ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white' : 'bg-white shadow-sm'
        }`}>
          <p className={`text-sm mb-2 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
            {isActive ? 'Contraction in progress...' : 'Tap when contraction starts'}
          </p>
          <p className={`text-6xl font-bold mb-6 ${isActive ? 'text-white' : 'text-gray-900'}`}>
            {formatTime(elapsed)}
          </p>
          <button
            onClick={isActive ? stopContraction : startContraction}
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all ${
              isActive
                ? 'bg-white text-red-500 hover:bg-gray-100'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {isActive ? <Square className="w-10 h-10" /> : <Play className="w-10 h-10 ml-2" />}
          </button>
        </div>

        {/* Stats */}
        {contractions.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{contractions.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{formatTime(Math.round(avgDuration))}</p>
              <p className="text-xs text-gray-500">Avg Duration</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{avgInterval.toFixed(1)}m</p>
              <p className="text-xs text-gray-500">Avg Interval</p>
            </div>
          </div>
        )}

        {/* History */}
        {contractions.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">History</h2>
              <button onClick={clearAll} className="text-red-500 text-sm flex items-center gap-1">
                <Trash2 className="w-4 h-4" /> Clear
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {contractions.map((c, i) => (
                <div key={c.id} className="bg-gray-50 rounded-xl p-3 flex justify-between">
                  <div>
                    <p className="font-medium text-gray-900">#{contractions.length - i}</p>
                    <p className="text-xs text-gray-500">
                      {c.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">{formatTime(c.duration)}</p>
                    {c.interval && <p className="text-xs text-gray-500">{c.interval} min apart</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5-1-1 Rule */}
        <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
          <h3 className="font-semibold text-pink-800 mb-2">The 5-1-1 Rule</h3>
          <p className="text-sm text-pink-700">
            Call your healthcare provider when contractions are <strong>5 minutes apart</strong>, lasting <strong>1 minute each</strong>, for at least <strong>1 hour</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContractionPatternAnalyzer;
