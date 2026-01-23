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
    { id: "b1", name: "شوفان بالفواكه والعسل", calories: 350, nutrients: ["ألياف", "حديد", "فيتامينات"], trimester: [1, 2, 3] },
    { id: "b2", name: "بيض مسلوق مع خبز أسمر", calories: 300, nutrients: ["بروتين", "كولين", "فيتامين D"], trimester: [1, 2, 3] },
    { id: "b3", name: "زبادي يوناني مع المكسرات", calories: 280, nutrients: ["كالسيوم", "بروتين", "أوميغا 3"], trimester: [1, 2, 3] },
    { id: "b4", name: "سموثي الموز والسبانخ", calories: 250, nutrients: ["حمض الفوليك", "بوتاسيوم", "حديد"], trimester: [1, 2, 3] },
    { id: "b5", name: "توست الأفوكادو", calories: 320, nutrients: ["دهون صحية", "ألياف", "فيتامين E"], trimester: [2, 3] },
  ],
  lunch: [
    { id: "l1", name: "سلمون مشوي مع خضار", calories: 450, nutrients: ["أوميغا 3", "بروتين", "فيتامين D"], trimester: [1, 2, 3] },
    { id: "l2", name: "دجاج مشوي مع أرز بني", calories: 480, nutrients: ["بروتين", "حديد", "فيتامين B"], trimester: [1, 2, 3] },
    { id: "l3", name: "سلطة العدس والخضار", calories: 380, nutrients: ["حديد", "بروتين نباتي", "ألياف"], trimester: [1, 2, 3] },
    { id: "l4", name: "شوربة الخضار مع خبز", calories: 320, nutrients: ["فيتامينات", "ألياف", "معادن"], trimester: [1, 2, 3] },
    { id: "l5", name: "معكرونة بصلصة الطماطم والسبانخ", calories: 420, nutrients: ["كربوهيدرات", "حديد", "فيتامين C"], trimester: [2, 3] },
  ],
  dinner: [
    { id: "d1", name: "سمك مشوي مع بطاطا حلوة", calories: 400, nutrients: ["بروتين", "فيتامين A", "أوميغا 3"], trimester: [1, 2, 3] },
    { id: "d2", name: "لحم مفروم مع خضار مشوية", calories: 420, nutrients: ["حديد", "زنك", "بروتين"], trimester: [2, 3] },
    { id: "d3", name: "فلافل مع حمص وسلطة", calories: 380, nutrients: ["بروتين نباتي", "ألياف", "حديد"], trimester: [1, 2, 3] },
    { id: "d4", name: "شوربة العدس مع خبز", calories: 350, nutrients: ["حديد", "بروتين", "حمض الفوليك"], trimester: [1, 2, 3] },
    { id: "d5", name: "بيتزا منزلية بالخضار", calories: 450, nutrients: ["كالسيوم", "فيتامينات", "كربوهيدرات"], trimester: [2, 3] },
  ],
  snacks: [
    { id: "s1", name: "تفاحة مع زبدة الفول السوداني", calories: 200, nutrients: ["ألياف", "بروتين", "دهون صحية"], trimester: [1, 2, 3] },
    { id: "s2", name: "جزر مع حمص", calories: 150, nutrients: ["فيتامين A", "بروتين", "ألياف"], trimester: [1, 2, 3] },
    { id: "s3", name: "مكسرات متنوعة", calories: 180, nutrients: ["أوميغا 3", "بروتين", "معادن"], trimester: [1, 2, 3] },
    { id: "s4", name: "تمر مع لوز", calories: 160, nutrients: ["حديد", "طاقة", "ألياف"], trimester: [2, 3] },
    { id: "s5", name: "زبادي بالفواكه", calories: 140, nutrients: ["كالسيوم", "بروتين", "بروبيوتيك"], trimester: [1, 2, 3] },
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
    breakfast: "الفطور",
    lunch: "الغداء",
    dinner: "العشاء",
    snacks: "الوجبات الخفيفة",
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
            <span className="text-sm text-muted-foreground">الثلث:</span>
            <Tabs value={trimester.toString()} onValueChange={(v) => setTrimester(Number(v))}>
              <TabsList>
                <TabsTrigger value="1">الأول</TabsTrigger>
                <TabsTrigger value="2">الثاني</TabsTrigger>
                <TabsTrigger value="3">الثالث</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Button onClick={generateRandomPlan} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            إنشاء خطة عشوائية
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
                  <p className="text-sm text-muted-foreground">إجمالي السعرات</p>
                  <p className="text-2xl font-bold text-green-700">{getTotalCalories()} سعرة</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                الموصى به: 2200-2500 سعرة/يوم
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
                                <span className="text-sm text-muted-foreground">{meal.calories} سعرة</span>
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
                <p className="font-medium text-amber-900">نصائح غذائية</p>
                <ul className="text-sm text-amber-700 mt-1 space-y-1 list-disc list-inside">
                  <li>تناولي 5-6 وجبات صغيرة بدلاً من 3 وجبات كبيرة</li>
                  <li>اشربي 8-10 أكواب ماء يومياً</li>
                  <li>تجنبي الأطعمة النيئة والمبسترة</li>
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
