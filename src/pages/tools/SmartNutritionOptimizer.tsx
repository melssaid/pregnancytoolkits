import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        { name: 'folicAcid', amount: '600 mcg', benefits: 'neuralDevelopment', sources: ['leafyGreens', 'fortifiedCereals', 'legumes'] },
        { name: 'vitaminB6', amount: '1.9 mg', benefits: 'reducesNausea', sources: ['bananas', 'wholeGrains', 'nuts'] }
      ];
    } else if (trimester === 2) {
      keyNutrients = [
        { name: 'calcium', amount: '1000 mg', benefits: 'boneDevelopment', sources: ['dairy', 'tofu', 'leafyGreens'] },
        { name: 'iron', amount: '27 mg', benefits: 'bloodVolume', sources: ['redMeat', 'spinach', 'lentils'] }
      ];
    } else {
      keyNutrients = [
        { name: 'omega3', amount: '200 mg', benefits: 'brainDevelopment', sources: ['fattyFish', 'walnuts', 'chiaSeeds'] },
        { name: 'vitaminK', amount: '90 mcg', benefits: 'bloodClotting', sources: ['kale', 'broccoli', 'spinach'] }
      ];
    }

    const baseMeals = {
      standard: {
        breakfast: ['oatmealBerries', 'greekYogurtParfait'],
        lunch: ['grilledChickenSalad', 'quinoaBowl'],
        dinner: ['bakedSalmon', 'leanBeefStirFry'],
        snack: ['appleAlmondButter', 'hardBoiledEgg']
      },
      vegetarian: {
        breakfast: ['smoothieBowl', 'avocadoToast'],
        lunch: ['lentilSoup', 'spinachFetaSalad'],
        dinner: ['vegStirFryTofu', 'chickpeaCurry'],
        snack: ['hummusCarrots', 'handfulWalnuts']
      },
      vegan: {
        breakfast: ['chiaPudding', 'tofuScramble'],
        lunch: ['blackBeanBurrito', 'kaleSaladTahini'],
        dinner: ['lentilBolognese', 'tempehStirFry'],
        snack: ['mixedNuts', 'banana']
      }
    };

    const selectedPlan = baseMeals[diet as keyof typeof baseMeals] || baseMeals.standard;

    if (trimester > 1) {
      selectedPlan.snack.push('extraFruit');
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
        toolName={t('toolsInternal.nutritionOptimizer.title')}
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  const trimester = currentWeek <= 13 ? 1 : currentWeek <= 26 ? 2 : 3;

  return (
    <ToolFrame
      title={t('nutritionOptimizer.title')}
      subtitle={t('nutritionOptimizer.subtitle')}
      icon={Salad}
      mood="joyful"
      toolId="smart-nutrition"
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('nutritionOptimizer.pregnancyWeek')}: <span className="text-primary font-bold">{currentWeek}</span>
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
                <span>{t('common.week')} 4</span>
                <span className="font-medium text-primary">{t('nutritionOptimizer.trimester')} {trimester}</span>
                <span>{t('common.week')} 42</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('nutritionOptimizer.dietaryPreference')}</label>
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
                    {t(`nutritionOptimizer.${type}`)}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {nutrients.length > 0 && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Apple className="w-5 h-5 text-primary" />
                {t('nutritionOptimizer.keyNutrients', { week: currentWeek })}
              </h3>
              <div className="space-y-3">
                {nutrients.map((nutrient, idx) => (
                  <div key={idx} className="bg-muted/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{t(`nutritionOptimizer.nutrients.${nutrient.name}`)}</span>
                      <span className="text-sm text-primary font-semibold">{nutrient.amount}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{t(`nutritionOptimizer.benefits.${nutrient.benefits}`)}</p>
                    <div className="flex flex-wrap gap-1">
                      {nutrient.sources.map((source, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-background rounded-full">
                          {t(`nutritionOptimizer.sources.${source}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {plan && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <ShoppingBasket className="w-5 h-5 text-primary" />
                {t('nutritionOptimizer.sampleMealPlan')}
              </h3>
              
              {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map((meal) => (
                <div key={meal} className="bg-muted/50 rounded-xl p-4">
                  <h4 className="font-medium capitalize mb-2">
                    {t(`nutritionOptimizer.${meal}`)}
                  </h4>
                  <ul className="space-y-1">
                    {plan[meal].map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {t(`nutritionOptimizer.meals.${item}`)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                {t('nutritionOptimizer.infoNote')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
