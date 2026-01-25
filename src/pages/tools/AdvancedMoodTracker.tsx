import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MedicalDisclaimer } from '@/components/compliance';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calendar, TrendingUp, Brain } from 'lucide-react';
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

  useEffect(() => {
    const saved = localStorage.getItem('moodEntries');
    if (saved) setMoodEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
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
    const recent = moodEntries.slice(-3);
    const avgMood = recent.reduce((acc, entry) => acc + entry.mood, 0) / 3;
    const avgAnxiety = recent.reduce((acc, entry) => acc + entry.anxiety, 0) / 3;
    const avgSleep = recent.reduce((acc, entry) => acc + entry.sleep, 0) / 3;

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

  return (
    <ToolFrame
      title="Advanced Mood Tracker"
      subtitle="AI-powered mood tracking with mental health risk assessment"
      icon={Brain}
      mood="calm"
      toolId="advanced-mood-tracker"
    >
      {showDisclaimer && (
        <MedicalDisclaimer
          toolName="Advanced Mood Tracker"
          onAccept={() => setShowDisclaimer(false)}
        />
      )}

      {!showDisclaimer && (
        <div className="space-y-6">
          {/* Current Mood Assessment */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Today's Assessment
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
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Very Low</span>
                    <span className="font-medium text-foreground">{currentMood}</span>
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
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>None</span>
                    <span className="font-medium text-foreground">{currentAnxiety}</span>
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
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Very Low</span>
                    <span className="font-medium text-foreground">{currentEnergy}</span>
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
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Poor</span>
                    <span className="font-medium text-foreground">{currentSleep}</span>
                    <span>Excellent</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How are you feeling today? Any specific thoughts or events?"
                    className="w-full p-3 border border-border rounded-lg min-h-[100px] text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <Button onClick={addEntry} className="w-full">
                  Save Entry
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Risk Assessment */}
          {moodEntries.length >= 3 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-accent" />
                  AI Risk Assessment
                </h3>
                {(() => {
                  const assessment = getRiskAssessment();
                  return assessment ? (
                    <div className={`p-4 rounded-lg ${
                      assessment.level === 'high' ? 'bg-destructive/10 border border-destructive/20' :
                      assessment.level === 'medium' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                      'bg-green-500/10 border border-green-500/20'
                    }`}>
                      <p className="text-sm mb-3">{assessment.message}</p>
                      <div className="flex gap-2">
                        {assessment.level === 'high' && (
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => window.open('tel:911')}
                          >
                            Emergency Call
                          </Button>
                        )}
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/tools/doctor-questions')}
                        >
                          {assessment.action}
                        </Button>
                      </div>
                    </div>
                  ) : null;
                })()}
              </CardContent>
            </Card>
          )}

          {/* Mood Trends Chart */}
          {moodEntries.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  7-Day Mood Trends
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} name="Mood" />
                      <Line type="monotone" dataKey="anxiety" stroke="hsl(var(--destructive))" strokeWidth={2} name="Anxiety" />
                      <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} name="Energy" />
                      <Line type="monotone" dataKey="sleep" stroke="#3b82f6" strokeWidth={2} name="Sleep" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Entries */}
          {moodEntries.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Entries</h3>
                <div className="space-y-3">
                  {moodEntries.slice(-5).reverse().map((entry) => (
                    <div key={entry.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">
                          {new Date(entry.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        <div className="flex gap-2 text-xs">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                            Mood: {entry.mood}
                          </span>
                        </div>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </ToolFrame>
  );
}
