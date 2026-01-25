import React, { useState, useEffect } from 'react';
import { ArrowLeft, Baby, Plus, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MedicalDisclaimer from '../../components/compliance/MedicalDisclaimer';

interface KickSession {
  date: string;
  kicks: number;
  duration: number; // minutes
  startTime: string;
}

const SmartKickCounter: React.FC = () => {
  const navigate = useNavigate();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [kickCount, setKickCount] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [sessions, setSessions] = useState<KickSession[]>([
    { date: '2026-01-24', kicks: 10, duration: 25, startTime: '10:30 AM' },
    { date: '2026-01-23', kicks: 10, duration: 18, startTime: '11:00 AM' },
    { date: '2026-01-22', kicks: 10, duration: 32, startTime: '09:45 AM' },
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const startSession = () => {
    setIsTracking(true);
    setStartTime(new Date());
    setKickCount(0);
    setElapsed(0);
  };

  const recordKick = () => {
    if (isTracking) {
      const newCount = kickCount + 1;
      setKickCount(newCount);
      
      // Auto-complete at 10 kicks
      if (newCount >= 10) {
        endSession(newCount);
      }
    }
  };

  const endSession = (finalKicks?: number) => {
    const kicks = finalKicks || kickCount;
    if (startTime && kicks > 0) {
      const duration = Math.ceil((Date.now() - startTime.getTime()) / 60000);
      setSessions([{
        date: new Date().toISOString().split('T')[0],
        kicks,
        duration,
        startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }, ...sessions]);
    }
    setIsTracking(false);
    setStartTime(null);
    setKickCount(0);
    setElapsed(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const avgTime = sessions.length > 0
    ? sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length
    : 0;

  if (!disclaimerAccepted) {
    return <MedicalDisclaimer toolName="Kick Counter" onAccept={() => setDisclaimerAccepted(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Baby className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Smart Kick Counter</h1>
              <p className="text-xs text-gray-500">Track baby's movements</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            Contact your healthcare provider if you notice decreased fetal movement.
          </p>
        </div>

        {/* Counter Display */}
        {!isTracking ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
            <Baby className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready to Count?</h2>
            <p className="text-gray-500 text-sm mb-6">
              Tap the button below to start counting your baby's kicks.
              Goal: 10 kicks within 2 hours.
            </p>
            <button
              onClick={startSession}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-4 rounded-xl shadow-lg"
            >
              Start Counting
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-8 text-center text-white">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{formatTime(elapsed)}</span>
              </div>
              <button
                onClick={() => endSession()}
                className="text-sm bg-white/20 px-4 py-2 rounded-full"
              >
                End Session
              </button>
            </div>
            
            <button
              onClick={recordKick}
              className="w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center mx-auto shadow-2xl active:scale-95 transition-transform"
            >
              <span className="text-5xl font-bold text-blue-500">{kickCount}</span>
              <span className="text-sm text-blue-400">kicks</span>
            </button>
            
            <p className="mt-6 text-white/80">
              {10 - kickCount > 0 ? `${10 - kickCount} more kicks to reach goal` : '🎉 Goal reached!'}
            </p>
            
            {/* Progress Bar */}
            <div className="mt-4 h-3 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${Math.min(kickCount * 10, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Sessions</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{sessions.length}</p>
            <p className="text-xs text-gray-500">This week</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-cyan-600 mb-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Avg Time</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{avgTime.toFixed(0)}</p>
            <p className="text-xs text-gray-500">minutes for 10 kicks</p>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h2>
          <div className="space-y-3">
            {sessions.slice(0, 5).map((session, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{session.date}</p>
                  <p className="text-sm text-gray-500">{session.startTime}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">{session.kicks} kicks</p>
                  <p className="text-sm text-gray-500">{session.duration} min</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-800 mb-2">About Kick Counting</h3>
          <p className="text-sm text-blue-700">
            Most healthcare providers recommend counting kicks starting at 28 weeks. 
            You should feel at least 10 movements within 2 hours. Always consult your provider for personalized guidance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmartKickCounter;
