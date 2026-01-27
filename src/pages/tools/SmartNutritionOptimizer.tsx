import React, { useState, useEffect } from 'react';
import { Salad, Apple, Info, Check, AlertCircle, ShoppingBasket } from 'lucide-react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import MedicalDisclaimer from '@/components/compliance/MedicalDisclaimer';

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

export default function SmartNutritionOptimizer() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(12);
  const [dietaryPref, setDietaryPref] = useState('standard');
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [nutrients, setNutrients] = useState<NutrientInfo[]>([]);

  const generateNutritionData = (week: number, diet: string) => {
    const trimester = week <= 13 ? 1 : week <= 26 ? 2 : 3;

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

    if (trimester > 1) {
      selectedPlan.snack.push('Extra fruit or yogurt (300+ kcal)');
    }

    setPlan(selectedPlan);
    setNutrients(keyNutrients);
  };

  useEffect(() => {
    generateNutritionData(currentWeek, dietaryPref);
  }, [currentWeek, dietaryPref]);

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName="Smart Nutrition Optimizer"
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  const trimester = currentWeek <= 13 ? 1 : currentWeek <= 26 ? 2 : 3;

  return (
    <ToolFrame
      title="Smart Nutrition Optimizer"
      subtitle="Personalized meal planning for your pregnancy week"
      icon={Salad}
      mood="joyful"
      toolId="smart-nutrition"
    >
      <div className="space-y-6">
        {/* Week Selector */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Pregnancy Week: <span className="text-primary font-bold">{currentWeek}</span>
              </label>
              <input
                type="range"
                min="4"
                max="42"
                value={currentWeek}
                onChange={(e) => setCurrentWeek(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Week 4</span>
                <span className="font-medium text-primary">Trimester {trimester}</span>
                <span>Week 42</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Dietary Preference</label>
              <div className="flex flex-wrap gap-2">
                {['standard', 'vegetarian', 'vegan'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setDietaryPref(type)}
                    className={`px-4 py-2 rounded-full text-sm capitalize transition-all border-2 ${
                      dietaryPref === type
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted hover:bg-muted/80 border-transparent'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Nutrients */}
        {nutrients.length > 0 && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Apple className="w-5 h-5 text-primary" />
                Key Nutrients for Week {currentWeek}
              </h3>
              <div className="space-y-3">
                {nutrients.map((nutrient, idx) => (
                  <div key={idx} className="bg-muted/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{nutrient.name}</span>
                      <span className="text-sm text-primary font-semibold">{nutrient.amount}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{nutrient.benefits}</p>
                    <div className="flex flex-wrap gap-1">
                      {nutrient.sources.map((source, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-background rounded-full">
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Meal Plan */}
        {plan && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <ShoppingBasket className="w-5 h-5 text-primary" />
                Sample Meal Plan
              </h3>
              
              {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map((meal) => (
                <div key={meal} className="bg-muted/50 rounded-xl p-4">
                  <h4 className="font-medium capitalize mb-2 flex items-center gap-2">
                    {meal === 'breakfast' && '🌅'}
                    {meal === 'lunch' && '☀️'}
                    {meal === 'snack' && '🍎'}
                    {meal === 'dinner' && '🌙'}
                    {meal}
                  </h4>
                  <ul className="space-y-1">
                    {plan[meal].map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                These are general recommendations. Always consult with your healthcare provider 
                for personalized nutrition advice during pregnancy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
