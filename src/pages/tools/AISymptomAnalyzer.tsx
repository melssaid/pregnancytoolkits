import React, { useState } from 'react';
import { Brain, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  frequency: string;
}

const symptomDatabase = [
  { id: 'nausea', name: 'Nausea', category: 'digestive' },
  { id: 'fatigue', name: 'Fatigue', category: 'general' },
  { id: 'headache', name: 'Headache', category: 'neurological' },
  { id: 'backpain', name: 'Back Pain', category: 'musculoskeletal' },
  { id: 'cramps', name: 'Cramping', category: 'abdominal' },
  { id: 'swelling', name: 'Swelling', category: 'circulation' },
  { id: 'heartburn', name: 'Heartburn', category: 'digestive' },
  { id: 'insomnia', name: 'Insomnia', category: 'sleep' },
  { id: 'moodswings', name: 'Mood Swings', category: 'emotional' },
  { id: 'dizziness', name: 'Dizziness', category: 'neurological' },
];

const AISymptomAnalyzer: React.FC = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [currentWeek, setCurrentWeek] = useState(12);
  const [analyzed, setAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<Record<string, string>>({});

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

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) return;
    
    setIsAnalyzing(true);
    setAnalyzed(false);

    setTimeout(() => {
      const results: Record<string, string> = {};
      
      selectedSymptoms.forEach(symptom => {
        let insight = "";
        
        switch(symptom.id) {
          case 'nausea':
            insight = currentWeek < 14 
              ? "Very common in the first trimester. Try small, frequent meals and ginger." 
              : "Less common in week " + currentWeek + ". If severe or accompanied by other symptoms, consult your doctor.";
            break;
          case 'fatigue':
            insight = (currentWeek < 14 || currentWeek > 28)
              ? "Normal for this stage. Your body is working hard! Prioritize rest."
              : "You might be in the 'honeymoon phase', but listen to your body if you need rest.";
            break;
          case 'backpain':
             insight = currentWeek > 20
              ? "Common as baby grows and center of gravity shifts. Gentle stretching and good posture help."
              : "Monitor closely. If accompanied by cramping, contact your provider.";
            break;
          default:
            insight = `${symptom.name} is a known pregnancy symptom. Monitor intensity and frequency.`;
        }
        
        results[symptom.id] = insight;
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
      title="AI Symptom Analyzer"
      subtitle="Educational insights for pregnancy symptoms"
      customIcon="heartbeat"
      mood="calm"
      toolId="ai-symptom-analyzer"
    >
      <div className="space-y-6">
        {/* Disclaimer Banner */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              This tool provides <strong>educational information only</strong>. Always consult your healthcare provider for medical advice.
            </p>
          </CardContent>
        </Card>

        {/* Week Selector */}
        <Card>
          <CardContent className="p-4">
            <label className="block text-sm font-medium mb-2">Current Pregnancy Week</label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="42"
                value={currentWeek}
                onChange={(e) => {
                  setCurrentWeek(Number(e.target.value));
                  setAnalyzed(false);
                }}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">Week {currentWeek}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Symptom Selection */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">Select Your Symptoms</h2>
            <div className="grid grid-cols-2 gap-2">
              {symptomDatabase.map((symptom) => {
                const isSelected = selectedSymptoms.some(s => s.id === symptom.id);
                return (
                  <button
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id, symptom.name)}
                    className={`p-3 rounded-xl text-left transition-all text-sm ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <span className="font-medium">{symptom.name}</span>
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
            className="w-full gap-2"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              `Analyze ${selectedSymptoms.length} Symptom${selectedSymptoms.length > 1 ? 's' : ''}`
            )}
          </Button>
        )}

        {/* Analysis Results */}
        {analyzed && (
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-semibold">Analysis Results (Week {currentWeek})</h2>
              </div>
              
              {selectedSymptoms.map((symptom) => (
                <div key={symptom.id} className="bg-white rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{symptom.name}</h3>
                    <Badge variant="secondary" className="text-xs uppercase">
                      {symptomDatabase.find(d => d.id === symptom.id)?.category || 'general'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysisResult[symptom.id] || "Symptom noted. Discuss persistence with your doctor."}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-primary bg-primary/10 p-2 rounded-lg">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span>Discuss with your healthcare provider for personalized advice</span>
                  </div>
                </div>
              ))}

              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Remember:</strong> Every pregnancy is unique. These insights are for educational purposes only and should not replace professional medical advice.
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
