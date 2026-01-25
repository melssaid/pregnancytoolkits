import React, { useState } from 'react';
import { ArrowLeft, Moon, Plus, TrendingUp, Clock, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SleepEntry {
  date: string;
  bedtime: string;
  wakeTime: string;
  quality: number;
  interruptions: number;
}

const SleepPatternAnalyzer: React.FC = () => {
  const navigate = useNavigate();
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([
    { date: '2026-01-24', bedtime: '22:30', wakeTime: '06:30', quality: 3, interruptions: 2 },
    { date: '2026-01-23', bedtime: '23:00', wakeTime: '07:00', quality: 4, interruptions: 1 },
    { date: '2026-01-22', bedtime: '22:00', wakeTime: '06:00', quality: 2, interruptions: 4 },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<SleepEntry>>({
    quality: 3,
    interruptions: 0
  });

  const calculateSleepHours = (bedtime: string, wakeTime: string) => {
    const [bedH, bedM] = bedtime.split(':').map(Number);
    const [wakeH, wakeM] = wakeTime.split(':').map(Number);
    let hours = wakeH - bedH;
    let mins = wakeM - bedM;
    if (hours < 0) hours += 24;
    return hours + mins / 60;
  };

  const averageSleep = sleepEntries.length > 0
    ? sleepEntries.reduce((acc, e) => acc + calculateSleepHours(e.bedtime, e.wakeTime), 0) / sleepEntries.length
    : 0;

  const averageQuality = sleepEntries.length > 0
    ? sleepEntries.reduce((acc, e) => acc + e.quality, 0) / sleepEntries.length
    : 0;

  const addEntry = () => {
    if (newEntry.bedtime && newEntry.wakeTime) {
      setSleepEntries([{
        date: new Date().toISOString().split('T')[0],
        bedtime: newEntry.bedtime,
        wakeTime: newEntry.wakeTime,
        quality: newEntry.quality || 3,
        interruptions: newEntry.interruptions || 0
      }, ...sleepEntries]);
      setShowAddForm(false);
      setNewEntry({ quality: 3, interruptions: 0 });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Sleep Analyzer</h1>
              <p className="text-xs text-gray-500">Track your sleep patterns</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Avg Sleep</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{averageSleep.toFixed(1)}h</p>
            <p className="text-xs text-gray-500 mt-1">Recommended: 7-9h</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Avg Quality</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{averageQuality.toFixed(1)}/5</p>
            <p className="text-xs text-gray-500 mt-1">Based on {sleepEntries.length} nights</p>
          </div>
        </div>

        {/* Add Sleep Button */}
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Log Last Night's Sleep
        </button>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900">Log Sleep</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Bedtime</label>
                <input
                  type="time"
                  value={newEntry.bedtime || ''}
                  onChange={(e) => setNewEntry({...newEntry, bedtime: e.target.value})}
                  className="w-full p-3 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Wake Time</label>
                <input
                  type="time"
                  value={newEntry.wakeTime || ''}
                  onChange={(e) => setNewEntry({...newEntry, wakeTime: e.target.value})}
                  className="w-full p-3 border rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Quality (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((q) => (
                  <button
                    key={q}
                    onClick={() => setNewEntry({...newEntry, quality: q})}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      newEntry.quality === q
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-3 border rounded-xl text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={addEntry}
                className="flex-1 py-3 bg-indigo-500 text-white rounded-xl font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Sleep History */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sleep</h2>
          <div className="space-y-3">
            {sleepEntries.map((entry, index) => {
              const hours = calculateSleepHours(entry.bedtime, entry.wakeTime);
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{entry.date}</span>
                    <span className="text-indigo-600 font-semibold">{hours.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{entry.bedtime} - {entry.wakeTime}</span>
                    <span>Quality: {entry.quality}/5</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-indigo-800">Sleep Tips for Pregnancy</h3>
          </div>
          <ul className="text-sm text-indigo-700 space-y-1 ml-7">
            <li>• Sleep on your left side for better circulation</li>
            <li>• Use pillows to support your belly and back</li>
            <li>• Limit fluids before bedtime</li>
            <li>• Maintain a consistent sleep schedule</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SleepPatternAnalyzer;
