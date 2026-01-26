import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Brain, AlertTriangle, TrendingUp, Calendar, Heart, Moon, Zap, Phone } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [mood, setMood] = useState(5);
  const [anxiety, setAnxiety] = useState(3);
  const [energy, setEnergy] = useState(5);
  const [sleep, setSleep] = useState(7);
  const [notes, setNotes] = useState('');
  const [showRiskAlert, setShowRiskAlert] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('advancedMoodEntries');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load mood entries');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('advancedMoodEntries', JSON.stringify(entries));
  }, [entries]);

  const checkRiskPatterns = (newEntries: MoodEntry[]) => {
    const recent = newEntries.slice(0, 7);
    if (recent.length < 3) return false;
    
    const avgMood = recent.reduce((sum, e) => sum + e.mood, 0) / recent.length;
    const avgAnxiety = recent.reduce((sum, e) => sum + e.anxiety, 0) / recent.length;
    
    return avgMood <= 3 || avgAnxiety >= 7;
  };

  const saveEntry = () => {
    const entry: MoodEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood,
      anxiety,
      energy,
      sleep,
      notes
    };

    const newEntries = [entry, ...entries];
    setEntries(newEntries);
    
    if (checkRiskPatterns(newEntries)) {
      setShowRiskAlert(true);
    }

    setNotes('');
  };

  const getChartData = () => {
    return entries.slice(0, 7).reverse().map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
      mood: entry.mood,
      anxiety: entry.anxiety,
      energy: entry.energy
    }));
  };

  const getMoodLabel = (value: number) => {
    if (value <= 2) return '😢 Very Low';
    if (value <= 4) return '😔 Low';
    if (value <= 6) return '😐 Neutral';
    if (value <= 8) return '😊 Good';
    return '😄 Excellent';
  };

  const getAnxietyLabel = (value: number) => {
    if (value <= 2) return 'Calm';
    if (value <= 4) return 'Slight';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'High';
    return 'Severe';
  };

  return (
    <ToolFrame
      title="Advanced Mood Tracker"
      subtitle="Track your emotional wellbeing with AI insights"
      mood="nurturing"
      toolId="advanced-mood-tracker"
      icon={Brain}
    >
      {showDisclaimer && (
        <MedicalDisclaimer
          toolName="Advanced Mood Tracker"
          onAccept={() => setShowDisclaimer(false)}
        />
      )}

      {!showDisclaimer && (
        <div className="space-y-6">
          {/* Risk Alert */}
          {showRiskAlert && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-destructive mb-2">
                      ⚠️ We're Here For You
                    </h3>
                    <p className="text-sm text-foreground mb-4">
                      Your recent mood patterns suggest you may be going through a difficult time. 
                      This is common during pregnancy, but it's important to get support.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => window.open('tel:988', '_self')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call 988 (Suicide Prevention)
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowRiskAlert(false)}
                      >
                        I'm Okay
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      💙 You can also prepare questions for your next doctor visit using our "Doctor Questions" tool.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Daily Check-in */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                How are you feeling today?
              </h3>
              
              <div className="space-y-6">
                {/* Mood Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Mood</label>
                    <span className="text-sm text-muted-foreground">{getMoodLabel(mood)}</span>
                  </div>
                  <Slider
                    value={[mood]}
                    onValueChange={([v]) => setMood(v)}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Anxiety Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Anxiety Level
                    </label>
                    <span className="text-sm text-muted-foreground">{getAnxietyLabel(anxiety)}</span>
                  </div>
                  <Slider
                    value={[anxiety]}
                    onValueChange={([v]) => setAnxiety(v)}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Energy Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Energy Level</label>
                    <span className="text-sm text-muted-foreground">{energy}/10</span>
                  </div>
                  <Slider
                    value={[energy]}
                    onValueChange={([v]) => setEnergy(v)}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Sleep Hours */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Moon className="w-4 h-4" /> Hours of Sleep
                    </label>
                    <span className="text-sm text-muted-foreground">{sleep} hours</span>
                  </div>
                  <Slider
                    value={[sleep]}
                    onValueChange={([v]) => setSleep(v)}
                    max={12}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                  <Textarea
                    placeholder="Any thoughts or feelings you'd like to record..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button onClick={saveEntry} className="w-full">
                  Save Today's Entry
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Trend Chart */}
          {entries.length >= 3 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  7-Day Trend
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis domain={[0, 10]} className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="Mood"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="anxiety" 
                        stroke="hsl(var(--destructive))" 
                        strokeWidth={2}
                        name="Anxiety"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="energy" 
                        stroke="hsl(var(--accent))" 
                        strokeWidth={2}
                        name="Energy"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Entries */}
          {entries.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Recent Entries
                </h3>
                <div className="space-y-3">
                  {entries.slice(0, 5).map(entry => (
                    <div 
                      key={entry.id} 
                      className="p-4 bg-muted/50 rounded-lg border border-border/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                        <span className="text-2xl">{getMoodLabel(entry.mood).split(' ')[0]}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>Mood: {entry.mood}/10</div>
                        <div>Anxiety: {entry.anxiety}/10</div>
                        <div>Sleep: {entry.sleep}h</div>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground mt-2 italic">"{entry.notes}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medical Disclaimer Note */}
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">
              ⚠️ This tool is for tracking purposes only. If you experience severe mood changes, 
              anxiety, or thoughts of self-harm, please contact your healthcare provider immediately.
            </p>
          </div>
        </div>
      )}
    </ToolFrame>
  );
}
