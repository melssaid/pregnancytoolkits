import React, { useState, useEffect, useCallback } from 'react';
import { WhenToCallDoctorCard, EvidenceInfoBlock } from '@/components/safety';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AIResponseFrame } from '@/components/ai/AIResponseFrame';
import { PrintableReport } from '@/components/PrintableReport';
import { motion } from 'framer-motion';
import { 
  Brain, Info, Sparkles, Calendar, 
  Clock, Trash2, ChevronDown, ChevronUp, Plus, Heart, SmilePlus, NotebookPen,
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
import { AIActionButton } from '@/components/ai/AIActionButton';
import { safeParseLocalStorage, safeSaveToLocalStorage } from '@/lib/safeStorage';
import { toast } from 'sonner';
import { ToolHubNav, WELLNESS_HUB_TABS } from '@/components/ToolHubNav';
import { Checkbox } from '@/components/ui/checkbox';

const STORAGE_KEY = 'wellness-diary-entries';

const SYMPTOM_IDS = [
  'nausea', 'fatigue', 'headache', 'backpain', 'cramps',
  'swelling', 'heartburn', 'insomnia', 'moodswings', 'dizziness'
] as const;

const MOOD_OPTIONS = ['great', 'good', 'okay', 'tired', 'tough'] as const;

const MOOD_EMOJIS: Record<string, string> = {
  great: '😊',
  good: '🙂',
  okay: '😐',
  tired: '😴',
  tough: '😔',
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
  const { profile: userProfile } = useUserProfile();
  const [currentWeek, setCurrentWeek] = useState(userProfile.pregnancyWeek || 12);
  

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [aiInsight, setAiInsight] = useState('');
  const [isGettingInsight, setIsGettingInsight] = useState(false);

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  useResetOnLanguageChange(() => {
    setAiInsight('');
  });

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

    const prompt = `As a pregnancy wellness guide, provide supportive insights for a woman at week ${currentWeek} of pregnancy experiencing: ${symptomNames}.${moodLabel ? ` Her mood is: ${moodLabel}.` : ''}${notes ? ` Additional notes: ${notes}` : ''}

Provide brief, supportive wellness insights about these feelings during week ${currentWeek}. Include practical comfort tips and when to share with a healthcare provider. Keep it concise and warm.`;

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

    const updated = [newEntry, ...entries].slice(0, 100);
    setEntries(updated);
    safeSaveToLocalStorage(STORAGE_KEY, updated);
    window.dispatchEvent(new Event("storage"));

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
      <ToolHubNav tabs={WELLNESS_HUB_TABS} />
      <div className="space-y-4">

        {/* Today's summary */}
        {todayEntries.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 w-fit">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-primary font-medium">
              {t('toolsInternal.symptomAnalyzer.todayEntries', { count: todayEntries.length })}
            </span>
          </div>
        )}

        {/* Week Selector */}
        <WeekSlider
          week={currentWeek}
          onChange={setCurrentWeek}
          label={t('toolsInternal.weekSlider.currentWeek')}
          showTrimester
        />

        {/* Mood Selection */}
        <Card className="overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <SmilePlus className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">{t('toolsInternal.symptomAnalyzer.howFeeling')}</h2>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {MOOD_OPTIONS.map(mood => {
                return (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(prev => prev === mood ? '' : mood)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                      selectedMood === mood
                        ? 'bg-primary/15 ring-2 ring-primary/40'
                        : 'bg-muted/60 hover:bg-muted'
                    }`}
                  >
                    <span className="text-base">{MOOD_EMOJIS[mood]}</span>
                    <span className="text-[10px] font-medium leading-tight text-center">
                      {t(`toolsInternal.symptomAnalyzer.moods.${mood}`)}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Symptom Selection */}
        <Card className="overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">{t('toolsInternal.symptomAnalyzer.selectSymptoms')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {SYMPTOM_IDS.map(id => {
                const isSelected = selectedSymptoms.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggleSymptom(id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-start transition-all text-xs ${
                      isSelected
                        ? 'bg-primary/10 border border-primary/30'
                        : 'bg-muted/60 hover:bg-muted border border-transparent'
                    }`}
                  >
                    <Checkbox checked={isSelected} className="shrink-0 pointer-events-none" />
                    <span className="font-medium leading-snug">
                      {t(`toolsInternal.symptomAnalyzer.symptoms.${id}`)}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <NotebookPen className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">{t('toolsInternal.symptomAnalyzer.addNotes')}</h2>
            </div>
            <Textarea
              placeholder={t('toolsInternal.symptomAnalyzer.notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs min-h-[60px] resize-none bg-muted/30 border-muted"
              maxLength={500}
            />
          </CardContent>
        </Card>

        {/* AI Insight Button — always visible */}
        <AIActionButton
          onClick={getAIInsight}
          isLoading={isGettingInsight}
          disabled={aiLoading || (selectedSymptoms.length === 0 && !selectedMood)}
          label={t('toolsInternal.symptomAnalyzer.getInsights')}
          loadingLabel={t('toolsInternal.symptomAnalyzer.analyzing')}
        />

        {/* AI Response */}
        {aiInsight && (
          <PrintableReport title={t('toolsInternal.symptomAnalyzer.aiWellnessNotes')} isLoading={isGettingInsight}>
            <AIResponseFrame
              content={aiInsight}
              isLoading={isGettingInsight}
              title={t('toolsInternal.symptomAnalyzer.aiWellnessNotes')}
              icon={Brain}
              toolId="ai-symptom-analyzer"
            />
          </PrintableReport>
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
          <Card className="overflow-hidden">
            <CardContent className="p-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">
                    {t('toolsInternal.symptomAnalyzer.diaryHistory')}
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{entries.length}</Badge>
                </div>
                {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showHistory && (
                <div className="mt-3 space-y-2 max-h-[400px] overflow-y-auto">
                  {entries.slice(0, 30).map(entry => {
                    return (
                      <div key={entry.id} className="bg-muted/40 rounded-xl p-2.5 border border-border/50">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                              {t('toolsInternal.symptomAnalyzer.week', { week: entry.week })}
                            </Badge>
                            {entry.mood && (
                              <span className="text-xs">{MOOD_EMOJIS[entry.mood]}</span>
                            )}
                          </div>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {entry.symptoms.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1">
                            {entry.symptoms.map(s => (
                              <span key={s} className="inline-flex items-center text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                {t(`toolsInternal.symptomAnalyzer.symptoms.${s}`)}
                              </span>
                            ))}
                          </div>
                        )}

                        {entry.notes && (
                          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{entry.notes}</p>
                        )}

                        {entry.aiInsight && (
                          <>
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
                            {expandedEntry === entry.id && (
                              <div className="mt-2 p-2 bg-accent/5 rounded-lg text-[11px]">
                                <MarkdownRenderer content={entry.aiInsight} />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Evidence-based medical info */}
        <EvidenceInfoBlock
          title={t('symptomAnalyzer.evidence.title')}
          content={t('symptomAnalyzer.evidence.content')}
          source={t('symptomAnalyzer.evidence.source')}
        />

        <EvidenceInfoBlock
          title={t('symptomAnalyzer.evidence2.title')}
          content={t('symptomAnalyzer.evidence2.content')}
          source={t('symptomAnalyzer.evidence2.source')}
        />

        {/* When to Call Doctor — educational, non-diagnostic */}
        <WhenToCallDoctorCard context="symptoms" />

        {/* Reminder Card */}
        <Card className="overflow-hidden border-primary/20 bg-primary/5">
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
