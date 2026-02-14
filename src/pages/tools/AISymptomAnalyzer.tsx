import React, { useState, useEffect, useCallback } from 'react';
import { 
  Brain, CheckCircle, Info, Loader2, Sparkles, Calendar, 
  Clock, Trash2, ChevronDown, ChevronUp, Plus
} from 'lucide-react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { WeekSlider } from '@/components/WeekSlider';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useTranslation } from 'react-i18next';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { safeParseLocalStorage, safeSaveToLocalStorage } from '@/lib/safeStorage';
import { toast } from 'sonner';

const STORAGE_KEY = 'wellness-diary-entries';

const SYMPTOM_IDS = [
  'nausea', 'fatigue', 'headache', 'backpain', 'cramps',
  'swelling', 'heartburn', 'insomnia', 'moodswings', 'dizziness'
] as const;

const MOOD_OPTIONS = ['great', 'good', 'okay', 'tired', 'tough'] as const;
const MOOD_EMOJIS: Record<string, string> = {
  great: '😊', good: '🙂', okay: '😐', tired: '😴', tough: '😟'
};

interface DiaryEntry {
  id: string;
  date: string;
  week: number;
  symptoms: string[];
  mood: string;
  notes: string;
  aiInsight?: string;
  createdAt: string;
}

const AISymptomAnalyzer: React.FC = () => {
  const { t } = useTranslation();
  const { streamChat, isLoading: aiLoading } = usePregnancyAI();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(12);

  // Entry form state
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [aiInsight, setAiInsight] = useState('');
  const [isGettingInsight, setIsGettingInsight] = useState(false);

  // History state
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  useResetOnLanguageChange(() => {
    setAiInsight('');
  });

  // Load saved entries
  useEffect(() => {
    const saved = safeParseLocalStorage<DiaryEntry[]>(
      STORAGE_KEY, [],
      (data): data is DiaryEntry[] => Array.isArray(data)
    );
    setEntries(saved);
  }, []);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const getAIInsight = useCallback(async () => {
    if (selectedSymptoms.length === 0) return;

    setIsGettingInsight(true);
    setAiInsight('');

    const symptomNames = selectedSymptoms.map(id =>
      t(`toolsInternal.symptomAnalyzer.symptoms.${id}`)
    ).join(', ');

    const moodLabel = selectedMood ? t(`toolsInternal.symptomAnalyzer.moods.${selectedMood}`) : '';

    const prompt = `I'm at week ${currentWeek} of pregnancy. Today I'm experiencing: ${symptomNames}.${moodLabel ? ` My mood is: ${moodLabel}.` : ''}${notes ? ` Additional notes: ${notes}` : ''}

Please provide brief, supportive wellness insights about these feelings during week ${currentWeek}. Include practical comfort tips and when to share with my healthcare provider. Keep it concise and warm.`;

    await streamChat({
      type: "symptom-analysis",
      messages: [{ role: "user", content: prompt }],
      context: { week: currentWeek, symptoms: selectedSymptoms },
      onDelta: (text) => setAiInsight(prev => prev + text),
      onDone: () => setIsGettingInsight(false),
    });
  }, [selectedSymptoms, selectedMood, notes, currentWeek, streamChat, t]);

  const saveEntry = () => {
    if (selectedSymptoms.length === 0 && !selectedMood) {
      toast.error(t('toolsInternal.symptomAnalyzer.selectAtLeastOne'));
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      date: today,
      week: currentWeek,
      symptoms: [...selectedSymptoms],
      mood: selectedMood,
      notes,
      aiInsight: aiInsight || undefined,
      createdAt: new Date().toISOString(),
    };

    const updated = [newEntry, ...entries].slice(0, 100); // Keep last 100 entries
    setEntries(updated);
    safeSaveToLocalStorage(STORAGE_KEY, updated);

    // Reset form
    setSelectedSymptoms([]);
    setSelectedMood('');
    setNotes('');
    setAiInsight('');
    toast.success(t('toolsInternal.symptomAnalyzer.entrySaved'));
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    safeSaveToLocalStorage(STORAGE_KEY, updated);
    toast.success(t('toolsInternal.symptomAnalyzer.entryDeleted'));
  };

  const todayEntries = entries.filter(e => e.date === new Date().toISOString().split('T')[0]);

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName={t('tools.wellnessDiary.title')}
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title={t('tools.wellnessDiary.title')}
      subtitle={t('toolsInternal.symptomAnalyzer.subtitle')}
      customIcon="heartbeat"
      mood="calm"
      toolId="wellness-diary"
    >
      <div className="space-y-4">

        {/* Today's summary */}
        {todayEntries.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-xs text-primary font-medium">
                <Calendar className="w-3.5 h-3.5" />
                {t('toolsInternal.symptomAnalyzer.todayEntries', { count: todayEntries.length })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Week Selector */}
        <WeekSlider
          week={currentWeek}
          onChange={setCurrentWeek}
          label={t('toolsInternal.weekSlider.currentWeek')}
          showTrimester
        />

        {/* Mood Selection */}
        <Card>
          <CardContent className="p-3">
            <h2 className="text-sm font-semibold mb-2">{t('toolsInternal.symptomAnalyzer.howFeeling')}</h2>
            <div className="flex gap-2 justify-center">
              {MOOD_OPTIONS.map(mood => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(prev => prev === mood ? '' : mood)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all min-w-[50px] ${
                    selectedMood === mood
                      ? 'bg-primary/15 ring-2 ring-primary/50'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <span className="text-xl">{MOOD_EMOJIS[mood]}</span>
                  <span className="text-[10px] font-medium truncate">
                    {t(`toolsInternal.symptomAnalyzer.moods.${mood}`)}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Symptom Selection */}
        <Card>
          <CardContent className="p-3">
            <h2 className="text-sm font-semibold mb-2">{t('toolsInternal.symptomAnalyzer.selectSymptoms')}</h2>
            <div className="flex flex-wrap gap-1.5">
              {SYMPTOM_IDS.map(id => {
                const isSelected = selectedSymptoms.includes(id);
                return (
                  <Badge
                    key={id}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer text-xs py-1 px-2.5 transition-all ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => toggleSymptom(id)}
                  >
                    {t(`toolsInternal.symptomAnalyzer.symptoms.${id}`)}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent className="p-3">
            <h2 className="text-sm font-semibold mb-2">{t('toolsInternal.symptomAnalyzer.addNotes')}</h2>
            <Textarea
              placeholder={t('toolsInternal.symptomAnalyzer.notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs min-h-[60px] resize-none"
              maxLength={500}
            />
          </CardContent>
        </Card>

        {/* AI Insight Button */}
        {selectedSymptoms.length > 0 && (
          <Button
            onClick={getAIInsight}
            disabled={aiLoading || isGettingInsight}
            variant="outline"
            className="w-full gap-1.5 text-xs h-9"
          >
            {isGettingInsight ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {isGettingInsight 
              ? t('toolsInternal.symptomAnalyzer.analyzing')
              : t('toolsInternal.symptomAnalyzer.getInsights')
            }
          </Button>
        )}

        {/* AI Response */}
        {aiInsight && (
          <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-800/30">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-semibold">{t('toolsInternal.symptomAnalyzer.aiWellnessNotes')}</span>
              </div>
              <MarkdownRenderer content={aiInsight} isLoading={isGettingInsight} accentColor="purple-500" />
            </CardContent>
          </Card>
        )}

        {/* Save Entry Button */}
        <Button
          onClick={saveEntry}
          disabled={selectedSymptoms.length === 0 && !selectedMood}
          className="w-full gap-1.5 text-xs h-9"
        >
          <Plus className="w-3.5 h-3.5" />
          {t('toolsInternal.symptomAnalyzer.saveEntry')}
        </Button>

        {/* History Section */}
        {entries.length > 0 && (
          <Card>
            <CardContent className="p-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between text-sm font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {t('toolsInternal.symptomAnalyzer.diaryHistory')} ({entries.length})
                </div>
                {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showHistory && (
                <div className="mt-3 space-y-2 max-h-[400px] overflow-y-auto">
                  {entries.slice(0, 30).map(entry => (
                    <div
                      key={entry.id}
                      className="bg-muted/50 rounded-lg p-2.5 border border-border"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                            {t('toolsInternal.symptomAnalyzer.week', { week: entry.week })}
                          </Badge>
                          {entry.mood && <span className="text-sm">{MOOD_EMOJIS[entry.mood]}</span>}
                        </div>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-1">
                        {entry.symptoms.map(s => (
                          <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">
                            {t(`toolsInternal.symptomAnalyzer.symptoms.${s}`)}
                          </Badge>
                        ))}
                      </div>

                      {entry.notes && (
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{entry.notes}</p>
                      )}

                      {entry.aiInsight && (
                        <button
                          onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                          className="text-[10px] text-primary mt-1 flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          {expandedEntry === entry.id 
                            ? t('toolsInternal.symptomAnalyzer.hideInsight')
                            : t('toolsInternal.symptomAnalyzer.showInsight')
                          }
                        </button>
                      )}

                      {expandedEntry === entry.id && entry.aiInsight && (
                        <div className="mt-2 p-2 bg-purple-50/50 dark:bg-purple-950/20 rounded text-[11px]">
                          <MarkdownRenderer content={entry.aiInsight} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reminder Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-3">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
              <p>{t('toolsInternal.symptomAnalyzer.remember')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default AISymptomAnalyzer;
