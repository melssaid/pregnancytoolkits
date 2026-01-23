import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Utensils, Coffee, Sun, Moon, Apple, RefreshCw, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { useAnalytics } from "@/hooks/useAnalytics";

interface Meal {
  id: string;
  name: string;
  calories: number;
  nutrients: string[];
  trimester: number[];
}

interface DayPlan {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks: string[];
}

const STORAGE_KEY = "meal-planner-data";

const mealOptions: Record<string, Meal[]> = {
  breakfast: [
    { id: "b1", name: "Oatmeal with Fruits & Honey", calories: 350, nutrients: ["Fiber", "Iron", "Vitamins"], trimester: [1, 2, 3] },
    { id: "b2", name: "Boiled Eggs with Whole Wheat Toast", calories: 300, nutrients: ["Protein", "Choline", "Vitamin D"], trimester: [1, 2, 3] },
    { id: "b3", name: "Greek Yogurt with Nuts", calories: 280, nutrients: ["Calcium", "Protein", "Omega-3"], trimester: [1, 2, 3] },
    { id: "b4", name: "Banana & Spinach Smoothie", calories: 250, nutrients: ["Folic Acid", "Potassium", "Iron"], trimester: [1, 2, 3] },
    { id: "b5", name: "Avocado Toast", calories: 320, nutrients: ["Healthy Fats", "Fiber", "Vitamin E"], trimester: [2, 3] },
  ],
  lunch: [
    { id: "l1", name: "Grilled Salmon with Vegetables", calories: 450, nutrients: ["Omega-3", "Protein", "Vitamin D"], trimester: [1, 2, 3] },
    { id: "l2", name: "Grilled Chicken with Brown Rice", calories: 480, nutrients: ["Protein", "Iron", "Vitamin B"], trimester: [1, 2, 3] },
    { id: "l3", name: "Lentil & Vegetable Salad", calories: 380, nutrients: ["Iron", "Plant Protein", "Fiber"], trimester: [1, 2, 3] },
    { id: "l4", name: "Vegetable Soup with Bread", calories: 320, nutrients: ["Vitamins", "Fiber", "Minerals"], trimester: [1, 2, 3] },
    { id: "l5", name: "Pasta with Tomato & Spinach Sauce", calories: 420, nutrients: ["Carbs", "Iron", "Vitamin C"], trimester: [2, 3] },
  ],
  dinner: [
    { id: "d1", name: "Grilled Fish with Sweet Potato", calories: 400, nutrients: ["Protein", "Vitamin A", "Omega-3"], trimester: [1, 2, 3] },
    { id: "d2", name: "Ground Beef with Roasted Vegetables", calories: 420, nutrients: ["Iron", "Zinc", "Protein"], trimester: [2, 3] },
    { id: "d3", name: "Falafel with Hummus & Salad", calories: 380, nutrients: ["Plant Protein", "Fiber", "Iron"], trimester: [1, 2, 3] },
    { id: "d4", name: "Lentil Soup with Bread", calories: 350, nutrients: ["Iron", "Protein", "Folic Acid"], trimester: [1, 2, 3] },
    { id: "d5", name: "Homemade Vegetable Pizza", calories: 450, nutrients: ["Calcium", "Vitamins", "Carbs"], trimester: [2, 3] },
  ],
  snacks: [
    { id: "s1", name: "Apple with Peanut Butter", calories: 200, nutrients: ["Fiber", "Protein", "Healthy Fats"], trimester: [1, 2, 3] },
    { id: "s2", name: "Carrots with Hummus", calories: 150, nutrients: ["Vitamin A", "Protein", "Fiber"], trimester: [1, 2, 3] },
    { id: "s3", name: "Mixed Nuts", calories: 180, nutrients: ["Omega-3", "Protein", "Minerals"], trimester: [1, 2, 3] },
    { id: "s4", name: "Dates with Almonds", calories: 160, nutrients: ["Iron", "Energy", "Fiber"], trimester: [2, 3] },
    { id: "s5", name: "Fruit Yogurt", calories: 140, nutrients: ["Calcium", "Protein", "Probiotics"], trimester: [1, 2, 3] },
  ],
};

const MealPlanner = () => {
  const { t } = useTranslation();
  const { trackAction } = useAnalytics("meal-planner");
  
  const [trimester, setTrimester] = useState<number>(2);
  const [selectedMeals, setSelectedMeals] = useState<DayPlan>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setSelectedMeals(data.meals || { breakfast: [], lunch: [], dinner: [], snacks: [] });
      setTrimester(data.trimester || 2);
    }
  }, []);

  const savePlan = (meals: DayPlan, tri: number) => {
    setSelectedMeals(meals);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ meals, trimester: tri }));
  };

  const toggleMeal = (category: keyof DayPlan, mealId: string) => {
    const current = selectedMeals[category];
    const newSelection = current.includes(mealId)
      ? current.filter(id => id !== mealId)
      : [...current, mealId];
    
    const newMeals = { ...selectedMeals, [category]: newSelection };
    savePlan(newMeals, trimester);
    trackAction("meal_selected", { category, mealId });
  };

  const generateRandomPlan = () => {
    const getRandomMeal = (meals: Meal[]) => {
      const filtered = meals.filter(m => m.trimester.includes(trimester));
      return filtered[Math.floor(Math.random() * filtered.length)]?.id || "";
    };
    
    const newPlan: DayPlan = {
      breakfast: [getRandomMeal(mealOptions.breakfast)],
      lunch: [getRandomMeal(mealOptions.lunch)],
      dinner: [getRandomMeal(mealOptions.dinner)],
      snacks: [getRandomMeal(mealOptions.snacks), getRandomMeal(mealOptions.snacks)],
    };
    
    savePlan(newPlan, trimester);
    trackAction("random_plan_generated");
  };

  const getTotalCalories = () => {
    let total = 0;
    Object.entries(selectedMeals).forEach(([category, mealIds]) => {
      mealIds.forEach(id => {
        const meal = mealOptions[category as keyof typeof mealOptions]?.find(m => m.id === id);
        if (meal) total += meal.calories;
      });
    });
    return total;
  };

  const categoryIcons = {
    breakfast: Coffee,
    lunch: Sun,
    dinner: Moon,
    snacks: Apple,
  };

  const categoryNames = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snacks: "Snacks",
  };

  return (
    <ToolFrame
      title={t('tools.mealPlanner.title')}
      subtitle={t('tools.mealPlanner.description')}
      icon={Utensils}
      mood="nurturing"
    >
      <div className="space-y-6">
        {/* Trimester Selector & Quick Generate */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Trimester:</span>
            <Tabs value={trimester.toString()} onValueChange={(v) => setTrimester(Number(v))}>
              <TabsList>
                <TabsTrigger value="1">First</TabsTrigger>
                <TabsTrigger value="2">Second</TabsTrigger>
                <TabsTrigger value="3">Third</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Button onClick={generateRandomPlan} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Generate Random Plan
          </Button>
        </div>

        {/* Calorie Summary */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Calories</p>
                  <p className="text-2xl font-bold text-green-700">{getTotalCalories()} cal</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Recommended: 2200-2500 cal/day
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meal Categories */}
        {(Object.keys(mealOptions) as Array<keyof DayPlan>).map((category, catIndex) => {
          const IconComp = categoryIcons[category];
          const filteredMeals = mealOptions[category].filter(m => m.trimester.includes(trimester));
          
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <IconComp className="h-5 w-5 text-primary" />
                    {categoryNames[category]}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredMeals.map((meal) => {
                      const isSelected = selectedMeals[category].includes(meal.id);
                      return (
                        <div
                          key={meal.id}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary/5' 
                              : 'border-transparent bg-muted/30 hover:bg-muted/50'
                          }`}
                          onClick={() => toggleMeal(category, meal.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox checked={isSelected} className="mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{meal.name}</h4>
                                <span className="text-sm text-muted-foreground">{meal.calories} cal</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {meal.nutrients.map((nutrient, idx) => (
                                  <span 
                                    key={idx}
                                    className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                                  >
                                    {nutrient}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* Tips */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <Utensils className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Nutrition Tips</p>
                <ul className="text-sm text-amber-700 mt-1 space-y-1 list-disc list-inside">
                  <li>Eat 5-6 small meals instead of 3 large ones</li>
                  <li>Drink 8-10 glasses of water daily</li>
                  <li>Avoid raw and unpasteurized foods</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default MealPlanner;