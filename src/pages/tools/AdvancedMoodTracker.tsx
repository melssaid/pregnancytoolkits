import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MedicalDisclaimer from '../../components/compliance/MedicalDisclaimer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calendar, TrendingUp, Brain, Sparkles } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  anxiety: number;
  energy: number;
  sleep: number;
  notes: string;
}

export default function AdvancedMoodTracker() {
  const navigate = useNavigate();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [currentMood, setCurrentMood] = useState(5);
  const [currentAnxiety, setCurrentAnxiety] = useState(5);
  const [currentEnergy, setCurrentEnergy] = useState(5);
  const [currentSleep, setCurrentSleep] = useState(5);
  const [notes, setNotes] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  // Safe localStorage read with fallback
  useEffect(() => {
    try {
      const saved = localStorage.getItem('moodEntries');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMoodEntries(parsed);
        } else {
          localStorage.removeItem('moodEntries');
        }
      }
    } catch {
      // If data is corrupted, clear it so the page does not crash
      localStorage.removeItem('moodEntries');
      setMoodEntries([]);
    }
  }, []);

  // Safe localStorage write
  useEffect(() => {
    try {
      localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
    } catch {
      // Ignore storage quota or serialization errors
    }
  }, [moodEntries]);

  const addEntry = () => {
    const entry: MoodEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood: currentMood,
      anxiety: currentAnxiety,
      energy: currentEnergy,
      sleep: currentSleep,
      notes,
    };
    setMoodEntries([...moodEntries, entry]);
    setNotes('');
  };

  const getChartData = () => {
    return moodEntries.slice(-7).map((entry) => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: entry.mood,
      anxiety: entry.anxiety,
      energy: entry.energy,
      sleep: entry.sleep,
    }));
  };

  const getRiskAssessment = () => {
    if (moodEntries.length < 3) return null;
    const recent = moodEntries.slice(-5);
    const avgMood = recent.reduce((acc, entry) => acc + entry.mood, 0) / recent.length;
    const avgAnxiety = recent.reduce((acc, entry) => acc + entry.anxiety, 0) / recent.length;
    const avgSleep = recent.reduce((acc, entry) => acc + entry.sleep, 0) / recent.length;

    if (avgMood <= 3 && avgAnxiety >= 7 && avgSleep <= 4) {
      return {
        level: 'high',
        message: 'High risk detected. Please consult your healthcare provider immediately.',
        action: 'Contact Doctor',
      };
    } else if (avgMood <= 4 || avgAnxiety >= 6) {
      return {
        level: 'medium',
        message: 'Moderate symptoms detected. Monitor closely and discuss with your doctor.',
        action: 'Monitor',
      };
    }
    return {
      level: 'low',
      message: 'Your mood patterns appear within normal range.',
      action: 'Continue Tracking',
    };
  };

  const generateAiInsight = () => {
    if (moodEntries.length < 3) {
      setAiInsight('Add a few more days of tracking to unlock deeper AI insights about your emotional patterns.');
      return;
    }

    const recent = moodEntries.slice(-7);
    const moodTrend = recent[recent.length - 1].mood - recent[0].mood;
    const anxietyTrend = recent[recent.length - 1].anxiety - recent[0].anxiety;

    let insight = 'Your mood has been relatively stable recently.';

    if (moodTrend <= -2) {
      insight = 'Your overall mood seems to be trending down over the last week. Consider scheduling a gentle activity you enjoy and talking about how you feel with someone you trust.';
    } else if (moodTrend >= 2) {
      insight = 'Your mood trend is improving. Whatever you have been doing lately (rest, support, routines) seems to be helping—try to keep those habits consistent.';
    }

    if (anxietyTrend >= 2) {
      insight += ' Anxiety levels are climbing, so adding short breathing exercises or journaling before bed might help you feel more grounded.';
    } else if (anxietyTrend <= -2) {
      insight += ' Anxiety appears to be easing slightly, which is a positive sign—notice what is supporting you and keep leaning on it.';
    }

    setAiInsight(insight);
  };

  const riskAssessment = useMemo(() => getRiskAssessment(), [moodEntries]);

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName="Advanced Mood Tracker"
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full">
            <Calendar className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Advanced Mood Tracker</h1>
              <p className="text-xs text-gray-500">Daily emotional check-in with AI insights</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Today&apos;s Assessment
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mood (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentMood}
                  onChange={(e) => setCurrentMood(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Low</span>
                  <span className="font-medium text-gray-900">{currentMood}</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Anxiety Level (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentAnxiety}
                  onChange={(e) => setCurrentAnxiety(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>None</span>
                  <span className="font-medium text-gray-900">{currentAnxiety}</span>
                  <span>Severe</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Energy Level (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentEnergy}
                  onChange={(e) => setCurrentEnergy(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Low</span>
                  <span className="font-medium text-gray-900">{currentEnergy}</span>
                  <span>Very High</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sleep Quality (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentSleep}
                  onChange={(e) => setCurrentSleep(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Poor</span>
                  <span className="font-medium text-gray-900">{currentSleep}</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How are you feeling today? Any specific thoughts or events?"
                  className="w-full p-3 border border-gray-200 rounded-lg min-h-[100px] text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <Button onClick={addEntry} className="w-full">
                Save Entry
              </Button>
            </div>
          </CardContent>
        </Card>

        {riskAssessment && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-indigo-500" />
                AI Risk Assessment
              </h3>
              <div
                className={`p-4 rounded-lg ${
                  riskAssessment.level === 'high'
                    ? 'bg-red-50 border border-red-200'
                    : riskAssessment.level === 'medium'
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-emerald-50 border border-emerald-200'
                }`}
              >
                <p className="text-sm mb-3 text-gray-800">{riskAssessment.message}</p>
                <div className="flex gap-2">
                  {riskAssessment.level === 'high' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => navigate('/tools/doctor-questions')}
                    >
                      Talk to Doctor
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateAiInsight}
                    className="flex items-center gap-1"
                  >
                    <Sparkles className="w-4 h-4" />
                    Explain My Pattern
                  </Button>
                </div>
              </div>

              {aiInsight && (
                <div className="mt-4 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                  <p className="text-xs uppercase tracking-wide text-indigo-600 font-semibold mb-1">
                    AI Insight
                  </p>
                  <p className="text-sm text-indigo-900 leading-relaxed">{aiInsight}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {moodEntries.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                7-Day Mood Trends
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} className="fill-gray-500" />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} className="fill-gray-500" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Line type="monotone" dataKey="mood" stroke="#4f46e5" strokeWidth={2} name="Mood" />
                    <Line type="monotone" dataKey="anxiety" stroke="#dc2626" strokeWidth={2} name="Anxiety" />
                    <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} name="Energy" />
                    <Line type="monotone" dataKey="sleep" stroke="#3b82f6" strokeWidth={2} name="Sleep" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {moodEntries.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Entries</h3>
              <div className="space-y-3">
                {moodEntries
                  .slice(-5)
                  .reverse()
                  .map((entry) => (
                    <div key={entry.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <div className="flex gap-2 text-xs">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                            Mood: {entry.mood}
                          </span>
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                            Anxiety: {entry.anxiety}
                          </span>
                        </div>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
