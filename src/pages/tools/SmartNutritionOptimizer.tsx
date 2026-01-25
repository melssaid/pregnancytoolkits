import React, { useState, useEffect } from 'react';
import { ArrowLeft, Salad, Apple, Info, Check, AlertCircle, ShoppingBasket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MedicalDisclaimer from '../../components/compliance/MedicalDisclaimer';

// Types
interface NutrientInfo {
  name: string;
  amount: string;
  benefits: string;
  sources: string[];
}

interface MealPlan {
  breakfast: string[];
  lunch: string[];
  snack: string[];
  dinner: string[];
}

const SmartNutritionOptimizer: React.FC = () => {
  const navigate = useNavigate();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(12);
  const [dietaryPref, setDietaryPref] = useState('standard'); // standard, vegetarian, vegan, gluten-free
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [nutrients, setNutrients] = useState<NutrientInfo[]>([]);

  // Function to generate data based on week and preferences
  // This simulates the "Smart" part that was broken before
  const generateNutritionData = (week: number, diet: string) => {
    // 1. Determine Trimester
    const trimester = week <= 13 ? 1 : week <= 26 ? 2 : 3;

    // 2. Select key nutrients based on trimester
    let keyNutrients: NutrientInfo[] = [];
    if (trimester === 1) {
      keyNutrients = [
        { name: 'Folic Acid', amount: '600 mcg', benefits: 'Neural tube development', sources: ['Leafy greens', 'Fortified cereals', 'Legumes'] },
        { name: 'Vitamin B6', amount: '1.9 mg', benefits: 'Reduces nausea', sources: ['Bananas', 'Whole grains', 'Nuts'] }
      ];
    } else if (trimester === 2) {
      keyNutrients = [
        { name: 'Calcium', amount: '1000 mg', benefits: 'Bone development', sources: ['Dairy', 'Tofu', 'Leafy greens'] },
        { name: 'Iron', amount: '27 mg', benefits: 'Blood volume expansion', sources: ['Red meat', 'Spinach', 'Lentils'] }
      ];
    } else {
      keyNutrients = [
        { name: 'Omega-3 (DHA)', amount: '200 mg', benefits: 'Brain development', sources: ['Fatty fish', 'Walnuts', 'Chia seeds'] },
        { name: 'Vitamin K', amount: '90 mcg', benefits: 'Blood clotting', sources: ['Kale', 'Broccoli', 'Spinach'] }
      ];
    }

    // 3. Generate Meal Plan based on Diet
    const baseMeals = {
      standard: {
        breakfast: ['Oatmeal with berries', 'Greek yogurt parfait'],
        lunch: ['Grilled chicken salad', 'Quinoa bowl with veggies'],
        dinner: ['Baked salmon with asparagus', 'Lean beef stir-fry'],
        snack: ['Apple slices with almond butter', 'Hard-boiled egg']
      },
      vegetarian: {
        breakfast: ['Smoothie bowl with seeds', 'Avocado toast'],
        lunch: ['Lentil soup', 'Spinach and feta salad'],
        dinner: ['Vegetable stir-fry with tofu', 'Chickpea curry'],
        snack: ['Hummus with carrots', 'Handful of walnuts']
      },
      vegan: {
        breakfast: ['Chia pudding with almond milk', 'Tofu scramble'],
        lunch: ['Black bean burrito bowl', 'Kale salad with tahini'],
        dinner: ['Lentil bolognese', 'Tempeh stir-fry'],
        snack: ['Mixed nuts', 'Banana']
      }
    };

    const selectedPlan = baseMeals[diet as keyof typeof baseMeals] || baseMeals.standard;

    // Adjust meals slightly for trimester ( caloric needs)
    if (trimester > 1) {
      // Add extra snack for 2nd/3rd trimester
      selectedPlan.snack.push('Cheese stick or trail mix');
    }

    setNutrients(keyNutrients);
    setPlan(selectedPlan);
  };

  // EFFECT: Update data whenever week or diet changes
  useEffect(() => {
    generateNutritionData(currentWeek, dietaryPref);
  }, [currentWeek, dietaryPref]);

  if (!disclaimerAccepted) {
    return <MedicalDisclaimer toolName="Smart Nutrition Optimizer" onAccept={() => setDisclaimerAccepted(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Salad className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Nutrition Optimizer</h1>
              <p className="text-xs text-gray-500">Tailored to your week</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Controls */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pregnancy Week: <span className="text-green-600 font-bold">{currentWeek}</span>
            </label>
            <input
              type="range"
              min="4"
              max="42"
              value={currentWeek}
              onChange={(e) => setCurrentWeek(Number(e.target.value))}
              className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preference</label>
            <div className="flex flex-wrap gap-2">
              {['standard', 'vegetarian', 'vegan'].map((type) => (
                <button
                  key={type}
                  onClick={() => setDietaryPref(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                    dietaryPref === type
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Nutrients */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Apple className="w-5 h-5 text-green-500" />
            Essential Nutrients for Week {currentWeek}
          </h2>
          <div className="space-y-3">
            {nutrients.map((item, index) => (
              <div key={index} className="bg-green-50 rounded-xl p-3 border border-green-100">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-green-900">{item.name}</h3>
                  <span className="text-xs bg-white px-2 py-0.5 rounded-full text-green-700 border border-green-200 font-medium">
                    {item.amount}
                  </span>
                </div>
                <p className="text-sm text-green-800 mb-2">{item.benefits}</p>
                <div className="flex flex-wrap gap-1">
                  {item.sources.map((source, i) => (
                    <span key={i} className="text-xs text-gray-600 bg-white px-2 py-1 rounded-md">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meal Plan */}
        {plan && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBasket className="w-5 h-5 text-orange-500" />
              Suggested Daily Plan
            </h2>
            <div className="space-y-4">
              <MealSection title="Breakfast" items={plan.breakfast} />
              <MealSection title="Lunch" items={plan.lunch} />
              <MealSection title="Dinner" items={plan.dinner} />
              <MealSection title="Snacks" items={plan.snack} />
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            <strong>Hydration Tip:</strong> Don't forget to drink plenty of water! Aim for 8-10 glasses a day to support your increased blood volume.
          </p>
        </div>
      </div>
    </div>
  );
};

const MealSection = ({ title, items }: { title: string; items: string[] }) => (
  <div className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2 text-gray-800">
          <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
          <span className="text-sm">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default SmartNutritionOptimizer;
