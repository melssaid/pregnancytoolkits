import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Calendar, Sparkles, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

interface JournalEntry {
  id: string;
  date: string;
  week: number;
  content: string;
  mood: string;
  highlights: string[];
}

const moods = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🤢', label: 'Nauseous' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '🥰', label: 'Excited' },
];

export default function AIPregnancyJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentContent, setCurrentContent] = useState('');
  const [currentMood, setCurrentMood] = useState('');
  const [currentWeek, setCurrentWeek] = useState(20);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('pregnancyJournalEntries');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('pregnancyJournalEntries', JSON.stringify(entries));
  }, [entries]);

  const generateHighlights = (content: string): string[] => {
    const highlights: string[] = [];
    if (content.toLowerCase().includes('kick')) highlights.push('👶 Felt baby movements');
    if (content.toLowerCase().includes('doctor') || content.toLowerCase().includes('appointment')) highlights.push('🏥 Medical visit');
    if (content.toLowerCase().includes('tired') || content.toLowerCase().includes('sleep')) highlights.push('😴 Rest & recovery');
    if (content.toLowerCase().includes('happy') || content.toLowerCase().includes('excited')) highlights.push('✨ Positive moment');
    if (content.toLowerCase().includes('eat') || content.toLowerCase().includes('food')) highlights.push('🍎 Nutrition note');
    return highlights.length > 0 ? highlights : ['📝 Daily reflection'];
  };

  const addEntry = () => {
    if (!currentContent.trim()) return;
    
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      week: currentWeek,
      content: currentContent,
      mood: currentMood || '😊',
      highlights: generateHighlights(currentContent),
    };
    
    setEntries([entry, ...entries]);
    setCurrentContent('');
    setCurrentMood('');
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  return (
    <ToolFrame
      title="AI Pregnancy Journal"
      subtitle="Document your journey with smart insights and weekly summaries"
      icon={BookOpen}
      mood="nurturing"
      toolId="ai-pregnancy-journal"
    >
      <div className="space-y-6">
        {/* Week Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Pregnancy Week</span>
              <span className="text-2xl font-bold text-primary">Week {currentWeek}</span>
            </div>
            <input
              type="range"
              min="1"
              max="42"
              value={currentWeek}
              onChange={(e) => setCurrentWeek(Number(e.target.value))}
              className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer"
            />
          </CardContent>
        </Card>

        {/* New Entry */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Today's Entry
            </h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">How are you feeling?</label>
              <div className="flex flex-wrap gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood.emoji}
                    onClick={() => setCurrentMood(mood.emoji)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      currentMood === mood.emoji
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {mood.emoji} {mood.label}
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
              placeholder="Write about your day, how you're feeling, any symptoms, baby movements, cravings, or memorable moments..."
              className="min-h-[120px]"
            />

            <Button onClick={addEntry} className="w-full gap-2" disabled={!currentContent.trim()}>
              <Sparkles className="w-4 h-4" />
              Save Entry
            </Button>
          </CardContent>
        </Card>

        {/* Entries List */}
        {entries.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Your Journal</h3>
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-muted/50 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{entry.mood}</span>
                        <div>
                          <p className="font-medium">Week {entry.week}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(entry.date), 'EEEE, MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                          className="p-1.5 rounded-lg hover:bg-background transition-colors"
                        >
                          {expandedEntry === entry.id ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                    
                    {expandedEntry === entry.id && (
                      <div className="mt-3 space-y-3">
                        <p className="text-sm text-foreground">{entry.content}</p>
                        <div className="flex flex-wrap gap-2">
                          {entry.highlights.map((highlight, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Regular journaling helps track your pregnancy journey and can be valuable to share with your healthcare provider. All entries are stored locally on your device.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
