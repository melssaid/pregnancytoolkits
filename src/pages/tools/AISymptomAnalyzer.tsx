import React, { useState } from 'react';
import { ArrowLeft, Brain, AlertTriangle, CheckCircle, Info } from 'lucide-react';
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

  const toggleSymptom = (symptomId: string, symptomName: string) => {
    const exists = selectedSymptoms.find(s => s.id === symptomId);
    if (exists) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== symptomId));
    } else {
      setSelectedSymptoms([...selectedSymptoms, {
        id: symptomId,
        name: symptomName,
        severity: 'mild',
        frequency: 'occasionally'
      }]);
    }
  };

  const analyzeSymptoms = () => {
    setAnalyzed(true);
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
            onChange={(e) => setCurrentWeek(Number(e.target.value))}
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
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Analyze {selectedSymptoms.length} Symptom{selectedSymptoms.length > 1 ? 's' : ''}
          </button>
        )}

        {/* Analysis Results */}
        {analyzed && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold text-gray-900">Educational Insights</h2>
            </div>
            
            {selectedSymptoms.map((symptom) => (
              <div key={symptom.id} className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-2">{symptom.name}</h3>
                <p className="text-sm text-gray-600">
                  {symptom.name} during week {currentWeek} is commonly reported by pregnant women. 
                  This is typically related to hormonal changes and physical adaptations during pregnancy.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
                  <Info className="w-4 h-4" />
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
