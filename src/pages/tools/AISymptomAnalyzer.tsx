import React, { useState, useEffect } from 'react';
import { ArrowLeft, Brain, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MedicalDisclaimer from '../../components/compliance/MedicalDisclaimer';

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
  const navigate = useNavigate();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [currentWeek, setCurrentWeek] = useState(20);
  const [analyzed, setAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<Record<string, string>>({});

  const toggleSymptom = (symptomId: string, symptomName: string) => {
    const exists = selectedSymptoms.find(s => s.id === symptomId);
    if (exists) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== symptomId));
      setAnalyzed(false); // Reset analysis when selection changes
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

    // Simulate AI processing delay
    setTimeout(() => {
      const results: Record<string, string> = {};
      
      selectedSymptoms.forEach(symptom => {
        // Simple rule-based logic to simulate AI analysis
        // In a real app, this would call an AI backend
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

  if (!disclaimerAccepted) {
    return <MedicalDisclaimer toolName="AI Symptom Analyzer" onAccept={() => setDisclaimerAccepted(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">AI Symptom Analyzer</h1>
              <p className="text-xs text-gray-500">Educational insights only</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Disclaimer Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            This tool provides <strong>educational information only</strong>. Always consult your healthcare provider for medical advice.
          </p>
        </div>

        {/* Week Selector */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Pregnancy Week</label>
          <input
            type="range"
            min="1"
            max="42"
            value={currentWeek}
            onChange={(e) => {
              setCurrentWeek(Number(e.target.value));
              setAnalyzed(false); // Reset analysis on week change
            }}
            className="w-full h-2 bg-pink-100 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-center mt-2">
            <span className="text-2xl font-bold text-pink-600">Week {currentWeek}</span>
          </div>
        </div>

        {/* Symptom Selection */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Your Symptoms</h2>
          <div className="grid grid-cols-2 gap-3">
            {symptomDatabase.map((symptom) => {
              const isSelected = selectedSymptoms.some(s => s.id === symptom.id);
              return (
                <button
                  key={symptom.id}
                  onClick={() => toggleSymptom(symptom.id, symptom.name)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-pink-500 text-white shadow-lg'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-sm font-medium">{symptom.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Analyze Button */}
        {selectedSymptoms.length > 0 && (
          <button
            onClick={analyzeSymptoms}
            disabled={isAnalyzing}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              `Analyze ${selectedSymptoms.length} Symptom${selectedSymptoms.length > 1 ? 's' : ''}`
            )}
          </button>
        )}

        {/* Analysis Results */}
        {analyzed && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold text-gray-900">Analysis Results (Week {currentWeek})</h2>
            </div>
            
            {selectedSymptoms.map((symptom) => (
              <div key={symptom.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h3 className="font-medium text-gray-900 mb-2 flex items-center justify-between">
                  {symptom.name}
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-600 uppercase tracking-wide">
                    {symptomDatabase.find(d => d.id === symptom.id)?.category || 'general'}
                  </span>
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {analysisResult[symptom.id] || "Symptom noted. Discuss persistence with your doctor."}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span>Discuss with your healthcare provider for personalized advice</span>
                </div>
              </div>
            ))}

            <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 mt-4">
              <p className="text-sm text-pink-800">
                <strong>Remember:</strong> Every pregnancy is unique. These insights are for educational purposes only and should not replace professional medical advice.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISymptomAnalyzer;
