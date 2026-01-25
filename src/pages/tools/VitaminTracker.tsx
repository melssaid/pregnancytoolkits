import React, { useState, useEffect } from 'react';
import { ArrowLeft, Pill, Plus, Check, Trash2, Clock, AlertTriangle, Info, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MedicalDisclaimer from '../../components/compliance/MedicalDisclaimer';

interface Vitamin {
  id: string;
  name: string;
  time: string; // morning, noon, evening
  taken: boolean;
  notes?: string;
}

const defaultVitamins = [
  { id: 'folic', name: 'Folic Acid', time: 'morning', taken: false, notes: 'Best with water' },
  { id: 'prenatal', name: 'Prenatal Vitamin', time: 'noon', taken: false, notes: 'With food to avoid nausea' },
  { id: 'iron', name: 'Iron Supplement', time: 'evening', taken: false, notes: 'Avoid with calcium/dairy' },
];

const VitaminTracker: React.FC = () => {
  const navigate = useNavigate();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [vitamins, setVitamins] = useState<Vitamin[]>(() => {
    const saved = localStorage.getItem('vitamin_tracker_data');
    return saved ? JSON.parse(saved) : defaultVitamins;
  });
  const [newVitamin, setNewVitamin] = useState('');
  const [selectedTime, setSelectedTime] = useState('morning');
  const [showInteractionWarning, setShowInteractionWarning] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('vitamin_tracker_data', JSON.stringify(vitamins));
    checkInteractions();
  }, [vitamins]);

  const toggleVitamin = (id: string) => {
    setVitamins(vitamins.map(v => 
      v.id === id ? { ...v, taken: !v.taken } : v
    ));
  };

  const addVitamin = () => {
    if (!newVitamin.trim()) return;
    const newItem: Vitamin = {
      id: Date.now().toString(),
      name: newVitamin,
      time: selectedTime,
      taken: false
    };
    setVitamins([...vitamins, newItem]);
    setNewVitamin('');
  };

  const deleteVitamin = (id: string) => {
    setVitamins(vitamins.filter(v => v.id !== id));
  };

  const checkInteractions = () => {
    const names = vitamins.map(v => v.name.toLowerCase());
    const hasIron = names.some(n => n.includes('iron'));
    const hasCalcium = names.some(n => n.includes('calcium') || n.includes('dairy'));
    
    if (hasIron && hasCalcium) {
      setShowInteractionWarning("Note: Calcium can inhibit Iron absorption. Try to take them at different times of day (e.g., Iron in morning, Calcium at night).");
    } else {
      setShowInteractionWarning(null);
    }
  };

  const resetDaily = () => {
    if (confirm("Reset all checkboxes for a new day?")) {
      setVitamins(vitamins.map(v => ({ ...v, taken: false })));
    }
  };

  if (!disclaimerAccepted) {
    return <MedicalDisclaimer toolName="Smart Vitamin Tracker" onAccept={() => setDisclaimerAccepted(true)} />;
  }

  const getProgress = () => {
    if (vitamins.length === 0) return 0;
    const taken = vitamins.filter(v => v.taken).length;
    return Math.round((taken / vitamins.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <Pill className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Vitamin Tracker</h1>
              <p className="text-xs text-gray-500">Track supplements & interactions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Progress Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Daily Progress</h2>
              <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            <span className="text-3xl font-bold text-teal-600">{getProgress()}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div 
              className="bg-teal-500 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${getProgress()}%` }}
            />
          </div>
          
          <button 
            onClick={resetDaily}
            className="mt-4 text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
          >
            <Calendar className="w-4 h-4" /> Start New Day
          </button>
        </div>

        {/* Interaction Warning */}
        {showInteractionWarning && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">{showInteractionWarning}</p>
          </div>
        )}

        {/* Vitamin List */}
        <div className="space-y-4">
          {['morning', 'noon', 'evening'].map((timeSlot) => {
            const timeVitamins = vitamins.filter(v => v.time === timeSlot);
            if (timeVitamins.length === 0) return null;

            return (
              <div key={timeSlot} className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {timeSlot}
                </h3>
                <div className="space-y-3">
                  {timeVitamins.map((vitamin) => (
                    <div key={vitamin.id} className="flex items-start gap-3 group">
                      <button
                        onClick={() => toggleVitamin(vitamin.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 ${
                          vitamin.taken
                            ? 'bg-teal-500 border-teal-500'
                            : 'border-gray-300 hover:border-teal-400'
                        }`}
                      >
                        {vitamin.taken && <Check className="w-4 h-4 text-white" />}
                      </button>
                      <div className="flex-1">
                        <p className={`font-medium transition-all ${vitamin.taken ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {vitamin.name}
                        </p>
                        {vitamin.notes && (
                          <p className="text-xs text-gray-500">{vitamin.notes}</p>
                        )}
                      </div>
                      <button 
                        onClick={() => deleteVitamin(vitamin.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3">Add Supplement</h3>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Vitamin name (e.g. Magnesium)"
              value={newVitamin}
              onChange={(e) => setNewVitamin(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <div className="flex gap-2">
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none"
              >
                <option value="morning">Morning</option>
                <option value="noon">Noon</option>
                <option value="evening">Evening</option>
              </select>
              <button
                onClick={addVitamin}
                className="flex-1 bg-teal-600 text-white rounded-xl py-2 font-medium hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-100 p-3 rounded-lg">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>Always consult your doctor before starting any new supplement regimen during pregnancy.</p>
        </div>
      </div>
    </div>
  );
};

export default VitaminTracker;
