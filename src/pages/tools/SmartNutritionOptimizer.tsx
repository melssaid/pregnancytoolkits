import React, { useState } from 'react';
import { ArrowLeft, Apple, Plus, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MedicalDisclaimer from '../../components/compliance/MedicalDisclaimer';

interface NutrientGoal {
  name: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

const SmartNutritionOptimizer: React.FC = () => {
  const navigate = useNavigate();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(20);
  
  const [nutrients] = useState<NutrientGoal[]>([
    { name: 'Folic Acid', current: 450, target: 600, unit: 'mcg', color: 'bg-green-500' },
    { name: 'Iron', current: 18, target: 27, unit: 'mg', color: 'bg-red-500' },
    { name: 'Calcium', current: 800, target: 1000, unit: 'mg', color: 'bg-blue-500' },
    { name: 'Protein', current: 55, target: 71, unit: 'g', color: 'bg-purple-500' },
    { name: 'DHA', current: 150, target: 200, unit: 'mg', color: 'bg-yellow-500' },
    { name: 'Vitamin D', current: 400, target: 600, unit: 'IU', color: 'bg-orange-500' },
  ]);

  const foodSuggestions = [
    { name: 'Spinach Salad', nutrients: ['Iron', 'Folic Acid'], icon: '🥗' },
    { name: 'Greek Yogurt', nutrients: ['Calcium', 'Protein'], icon: '🥛' },
    { name: 'Salmon', nutrients: ['DHA', 'Protein', 'Vitamin D'], icon: '🐟' },
    { name: 'Eggs', nutrients: ['Protein', 'Vitamin D'], icon: '🥚' },
    { name: 'Lentils', nutrients: ['Iron', 'Protein', 'Folic Acid'], icon: '🫘' },
    { name: 'Almonds', nutrients: ['Calcium', 'Protein'], icon: '🥜' },
  ];

  if (!disclaimerAccepted) {
    return <MedicalDisclaimer toolName="Smart Nutrition Optimizer" onAccept={() => setDisclaimerAccepted(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Apple className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Smart Nutrition</h1>
              <p className="text-xs text-gray-500">Week {currentWeek} recommendations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            Consult a registered dietitian for personalized nutrition advice.
          </p>
        </div>

        {/* Week Selector */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pregnancy Week</label>
          <input
            type="range"
            min="1"
            max="42"
            value={currentWeek}
            onChange={(e) => setCurrentWeek(Number(e.target.value))}
            className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-center mt-2">
            <span className="text-2xl font-bold text-green-600">Week {currentWeek}</span>
          </div>
        </div>

        {/* Nutrient Progress */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Nutrient Goals</h2>
          <div className="space-y-4">
            {nutrients.map((nutrient) => {
              const percentage = Math.min((nutrient.current / nutrient.target) * 100, 100);
              return (
                <div key={nutrient.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{nutrient.name}</span>
                    <span className="text-gray-500">
                      {nutrient.current}/{nutrient.target} {nutrient.unit}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${nutrient.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Food Suggestions */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Suggested Foods</h2>
          <div className="grid grid-cols-2 gap-3">
            {foodSuggestions.map((food) => (
              <button
                key={food.name}
                className="bg-gray-50 hover:bg-green-50 rounded-xl p-4 text-left transition-colors"
              >
                <span className="text-3xl">{food.icon}</span>
                <p className="font-medium text-gray-900 mt-2">{food.name}</p>
                <p className="text-xs text-gray-500 mt-1">{food.nutrients.join(', ')}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Educational Note */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-800">
            <strong>Important:</strong> These are general recommendations based on standard pregnancy nutrition guidelines. Individual needs may vary. Always consult your healthcare provider.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmartNutritionOptimizer;
