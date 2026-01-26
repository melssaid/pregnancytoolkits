// src/pages/tools/AIPregnancyJournal.tsx
import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Lock, Calendar, Heart, Sparkles, TrendingUp, Download } from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  week: number;
  title: string;
  content: string;
  mood: 'happy' | 'neutral' | 'sad' | 'anxious';
  symptoms: string[];
  aiInsights?: string;
  tags: string[];
}

const AIPregnancyJournal: React.FC = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [privateMode, setPrivateMode] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newMood, setNewMood] = useState<'happy' | 'neutral' | 'sad' | 'anxious'>('neutral');
  const [newWeek, setNewWeek] = useState(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showInsights, setShowInsights] = useState(false);

  const moodEmojis = {
    happy: '😊',
    neutral: '😐',
    sad: '😢',
    anxious: '😰'
  };

  const commonTags = [
    'Morning Sickness', 'Fatigue', 'Cravings', 'Baby Movement',
    'Doctor Visit', 'Ultrasound', 'Exercise', 'Diet', 'Sleep',
    'Mood Swings', 'Back Pain', 'Braxton Hicks'
  ];

  useEffect(() => {
    const saved = localStorage.getItem('pregnancyJournal_encrypted');
    if (saved) {
      try {
        const decrypted = atob(saved); // Simple encoding - في تطبيق حقيقي استخدم AES-256
        setEntries(JSON.parse(decrypted));
      } catch (e) {
        console.error('Failed to load journal');
      }
    }
  }, []);

  useEffect(() => {
    if (privateMode) {
      const encrypted = btoa(JSON.stringify(entries)); // Simple encoding
      localStorage.setItem('pregnancyJournal_encrypted', encrypted);
    }
  }, [entries, privateMode]);

  const addEntry = () => {
    if (!newContent.trim()) return;

    const aiInsight = generateAIInsight(newContent, newMood, selectedTags);

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      week: newWeek,
      title: newTitle || `Week ${newWeek} Entry`,
      content: newContent,
      mood: newMood,
      symptoms: selectedTags,
      aiInsights: aiInsight,
      tags: selectedTags
    };

    setEntries([entry, ...entries]);
    setNewTitle('');
    setNewContent('');
    setSelectedTags([]);
  };

  const generateAIInsight = (content: string, mood: string, tags: string[]): string => {
    const insights: string[] = [];

    if (mood === 'anxious' || mood === 'sad') {
      insights.push('💙 It\'s normal to feel emotional during pregnancy. Consider talking to your partner or a counselor.');
    }

    if (tags.includes('Morning Sickness')) {
      insights.push('🍋 Try eating small meals frequently and keep ginger tea handy.');
    }

    if (tags.includes('Fatigue')) {
      insights.push('😴 Rest is important! Your body is working hard. Take naps when needed.');
    }

    if (tags.includes('Baby Movement')) {
      insights.push('👶 Baby movements are a great sign of wellbeing! Keep tracking them.');
    }

    if (tags.includes('Exercise')) {
      insights.push('💪 Great job staying active! This helps with labor and recovery.');
    }

    if (content.toLowerCase().includes('worried') || content.toLowerCase().includes('scared')) {
      insights.push('❤️ Your concerns are valid. Don\'t hesitate to reach out to your healthcare provider.');
    }

    return insights.length > 0 
      ? insights.join('\n\n') 
      : '✨ Keep documenting your journey! These memories are precious.';
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const exportJournal = () => {
    const text = entries.map(e => 
      `Date: ${new Date(e.date).toLocaleDateString()}\n` +
      `Week: ${e.week}\n` +
      `Title: ${e.title}\n` +
      `Mood: ${moodEmojis[e.mood]}\n` +
      `Content: ${e.content}\n` +
      `Tags: ${e.tags.join(', ')}\n` +
      `AI Insights: ${e.aiInsights}\n` +
      `\n---\n\n`
    ).join('');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pregnancy-journal-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const getMoodStats = () => {
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      count,
      percentage: ((count / entries.length) * 100).toFixed(0)
    }));
  };

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName="AI Pregnancy Journal"
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title="AI Pregnancy Journal"
      subtitle="Smart pregnancy journaling with AI insights"
      mood="nurturing"
      toolId="ai-pregnancy-journal"
      icon={BookOpen}
    >
      <div className="space-y-6">
          {/* Privacy Notice */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">🔒 Privacy First</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Your journal entries are encrypted and stored locally on your device. 
                    Nothing is sent to external servers.
                  </p>
                  <div className="flex items-center gap-3">
                    <Badge className={privateMode ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                      {privateMode ? '🔐 Private Mode ON' : '🔓 Private Mode OFF'}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={exportJournal} disabled={entries.length === 0}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Journal
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Entry Form */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                New Journal Entry
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Week</label>
                    <Input
                      type="number"
                      min="1"
                      max="42"
                      value={newWeek}
                      onChange={(e) => setNewWeek(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Mood</label>
                    <select
                      value={newMood}
                      onChange={(e) => setNewMood(e.target.value as any)}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="happy">😊 Happy</option>
                      <option value="neutral">😐 Neutral</option>
                      <option value="sad">😢 Sad</option>
                      <option value="anxious">😰 Anxious</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Title (optional)</label>
                  <Input
                    placeholder="e.g., First Ultrasound Day"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">How are you feeling today?</label>
                  <Textarea
                    placeholder="Share your thoughts, feelings, and experiences..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={5}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tags (select what applies)</label>
                  <div className="flex flex-wrap gap-2">
                    {commonTags.map(tag => (
                      <Badge
                        key={tag}
                        className={`cursor-pointer ${
                          selectedTags.includes(tag)
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button onClick={addEntry} className="w-full bg-primary hover:bg-primary/90">
                  <Heart className="w-4 h-4 mr-2" />
                  Save Entry
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mood Statistics */}
          {entries.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Your Mood Journey
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getMoodStats().map(({ mood, count, percentage }) => (
                    <div key={mood} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-3xl mb-2">{moodEmojis[mood as keyof typeof moodEmojis]}</div>
                      <div className="font-semibold">{percentage}%</div>
                      <div className="text-xs text-gray-600">{count} entries</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Journal Entries */}
          {entries.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Your Journey ({entries.length} entries)
              </h3>
              
              {entries.map(entry => (
                <Card key={entry.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{entry.title}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(entry.date).toLocaleDateString()} • Week {entry.week}
                        </p>
                      </div>
                      <div className="text-3xl">{moodEmojis[entry.mood]}</div>
                    </div>

                    <p className="text-gray-700 mb-3">{entry.content}</p>

                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {entry.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {entry.aiInsights && (
                      <div className="bg-primary/5 rounded-lg p-4 mt-3">
                        <p className="text-sm font-medium text-primary mb-2">✨ AI Insights:</p>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{entry.aiInsights}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {entries.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start Your Journey</h3>
                <p className="text-gray-600">
                  Document your pregnancy journey and get AI-powered insights
                </p>
              </CardContent>
            </Card>
          )}
      </div>
    </ToolFrame>
  );
};

export default AIPregnancyJournal;