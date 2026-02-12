import React, { useState, useCallback } from 'react';
import { Brain, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeekSlider } from '@/components/WeekSlider';
import { useTranslation } from 'react-i18next';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';

interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  frequency: string;
}

const symptomDatabase = [
  { id: 'nausea', name: 'Nausea' },
  { id: 'fatigue', name: 'Fatigue' },
  { id: 'headache', name: 'Headache' },
  { id: 'backpain', name: 'Back Pain' },
  { id: 'cramps', name: 'Cramping' },
  { id: 'swelling', name: 'Swelling' },
  { id: 'heartburn', name: 'Heartburn' },
  { id: 'insomnia', name: 'Insomnia' },
  { id: 'moodswings', name: 'Mood Swings' },
  { id: 'dizziness', name: 'Dizziness' },
];

const AISymptomAnalyzer: React.FC = () => {
  const { t } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [currentWeek, setCurrentWeek] = useState(12);
  const [analyzed, setAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<Record<string, string>>({});

  useResetOnLanguageChange(() => {
    setAnalyzed(false);
    setAnalysisResult({});
  });

  const toggleSymptom = (symptomId: string, symptomName: string) => {
    const exists = selectedSymptoms.find(s => s.id === symptomId);
    if (exists) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== symptomId));
      setAnalyzed(false);
    } else {
      setSelectedSymptoms([...selectedSymptoms, {
        id: symptomId,
        name: symptomName,
        severity: 'mild',
        frequency: 'occasionally'
      }]);
      setAnalyzed(false);
    }
  };

  const getSymptomInsight = (symptomId: string, week: number): string => {
    const prefix = 'toolsInternal.symptomAnalyzer.insights';
    
    switch (symptomId) {
      case 'nausea':
        return week < 14
          ? t(`${prefix}.nausea.early`)
          : t(`${prefix}.nausea.late`);
      case 'fatigue':
        return (week < 14 || week > 28)
          ? t(`${prefix}.fatigue.early`)
          : t(`${prefix}.fatigue.mid`);
      case 'backpain':
        return week > 20
          ? t(`${prefix}.backpain.late`)
          : t(`${prefix}.backpain.early`);
      case 'headache':
        return t(`${prefix}.headache.general`);
      case 'cramps':
        return t(`${prefix}.cramps.general`);
      case 'swelling':
        return t(`${prefix}.swelling.general`);
      case 'heartburn':
        return t(`${prefix}.heartburn.general`);
      case 'insomnia':
        return t(`${prefix}.insomnia.general`);
      case 'moodswings':
        return t(`${prefix}.moodswings.general`);
      case 'dizziness':
        return t(`${prefix}.dizziness.general`);
      default:
        return t(`${prefix}.default`);
    }
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) return;
    
    setIsAnalyzing(true);
    setAnalyzed(false);

    setTimeout(() => {
      const results: Record<string, string> = {};
      
      selectedSymptoms.forEach(symptom => {
        results[symptom.id] = getSymptomInsight(symptom.id, currentWeek);
      });

      setAnalysisResult(results);
      setIsAnalyzing(false);
      setAnalyzed(true);
    }, 1500);
  };

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName="AI Symptom Analyzer"
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
      <div className="space-y-6">

        {/* Week Selector */}
        <WeekSlider
          week={currentWeek}
          onChange={(week) => {
            setCurrentWeek(week);
            setAnalyzed(false);
          }}
          label={t('toolsInternal.weekSlider.currentWeek')}
          showTrimester
        />

        {/* Symptom Selection */}
        <Card>
          <CardContent className="p-3">
            <h2 className="text-base font-semibold mb-3">{t('toolsInternal.symptomAnalyzer.selectSymptoms')}</h2>
            <div className="grid grid-cols-1 gap-1.5">
              {symptomDatabase.map((symptom) => {
                const isSelected = selectedSymptoms.some(s => s.id === symptom.id);
                return (
                  <button
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id, symptom.name)}
                    className={`p-2.5 rounded-lg text-start transition-all text-xs sm:text-sm overflow-hidden ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <span className="font-medium truncate block">{t(`toolsInternal.symptomAnalyzer.symptoms.${symptom.id}`)}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Analyze Button */}
        {selectedSymptoms.length > 0 && (
          <Button
            onClick={analyzeSymptoms}
            disabled={isAnalyzing}
            className="w-full gap-1.5 text-xs h-9"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('toolsInternal.symptomAnalyzer.analyzing')}
              </>
            ) : (
              selectedSymptoms.length > 1 
                ? t('toolsInternal.symptomAnalyzer.analyzeCountPlural', { count: selectedSymptoms.length })
                : t('toolsInternal.symptomAnalyzer.analyzeCount', { count: selectedSymptoms.length })
            )}
          </Button>
        )}

        {/* Analysis Results */}
        {analyzed && (
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                <h2 className="text-sm font-semibold">{t('toolsInternal.symptomAnalyzer.results')} ({t('toolsInternal.symptomAnalyzer.week', { week: currentWeek })})</h2>
              </div>
              
              {selectedSymptoms.map((symptom) => (
              <div key={symptom.id} className="bg-white rounded-lg p-3 border border-border">
                  <div className="flex items-center mb-1.5 gap-2">
                    <h3 className="font-medium text-xs truncate">{t(`toolsInternal.symptomAnalyzer.symptoms.${symptom.id}`)}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {analysisResult[symptom.id] || t('toolsInternal.symptomAnalyzer.insights.defaultFallback')}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-primary bg-primary/10 p-2 rounded-lg">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span>{t('toolsInternal.symptomAnalyzer.discussWithProvider')}</span>
                  </div>
                </div>
              ))}

              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>{t('toolsInternal.common.remember')}:</strong> {t('toolsInternal.symptomAnalyzer.remember')}
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolFrame>
  );
};

export default AISymptomAnalyzer;
