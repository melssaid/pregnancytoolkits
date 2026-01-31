import React, { useState, useEffect } from 'react';
import { Utensils, Plus, Trash2, Sparkles, TrendingUp, Loader2, Coffee, Sun, Moon, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { NutritionService, UserProfileService } from '@/services/supabaseServices';
import { AIService } from '@/services/aiService';

interface MealLog {
  id: string;
  meal_type: string;
  foods: any[];
  calories: number | null;
  ai_suggestions: string | null;
  created_at: string;
}

const MEAL_TYPES = [
  { id: 'breakfast', name: 'الفطور', icon: Coffee, color: 'from-yellow-400 to-orange-400' },
  { id: 'lunch', name: 'الغداء', icon: Sun, color: 'from-green-400 to-teal-400' },
  { id: 'dinner', name: 'العشاء', icon: Moon, color: 'from-purple-400 to-indigo-400' },
  { id: 'snack', name: 'وجبة خفيفة', icon: Cookie, color: 'from-pink-400 to-rose-400' },
];

const AISmartNutritionTracker: React.FC = () => {
  const [todayMeals, setTodayMeals] = useState<MealLog[]>([]);
  const [currentWeek, setCurrentWeek] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [foodInput, setFoodInput] = useState('');
  const [foods, setFoods] = useState<string[]>([]);
  const [calories, setCalories] = useState('');
  const [dailyAnalysis, setDailyAnalysis] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const profile = await UserProfileService.get();
      if (profile?.pregnancy_week) {
        setCurrentWeek(profile.pregnancy_week);
      }
      
      const meals = await NutritionService.getTodayMeals();
      setTodayMeals(meals);
      
    } catch (error: any) {
      console.error('Error loading nutrition:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addFood = () => {
    if (foodInput.trim()) {
      setFoods(prev => [...prev, foodInput.trim()]);
      setFoodInput('');
    }
  };

  const removeFood = (index: number) => {
    setFoods(prev => prev.filter((_, i) => i !== index));
  };

  const saveMeal = async () => {
    if (foods.length === 0) {
      toast({
        title: 'خطأ',
        description: 'أضيفي طعام واحد على الأقل',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSaving(true);
      
      const newMeal = await NutritionService.logMeal(
        selectedMealType,
        foods.map(f => ({ name: f })),
        calories ? parseInt(calories) : undefined,
        currentWeek
      );
      
      setTodayMeals(prev => [...prev, newMeal]);
      setFoods([]);
      setCalories('');
      
      toast({
        title: 'تم الحفظ! ✅',
        description: `تم تسجيل ${MEAL_TYPES.find(m => m.id === selectedMealType)?.name}`
      });

      // Auto analyze
      analyzeMeal(newMeal);
      
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const analyzeMeal = async (meal: MealLog) => {
    try {
      const foodNames = meal.foods.map((f: any) => f.name || f).join('، ');
      const response = await AIService.analyzeNutrition([foodNames], currentWeek);
      
      await NutritionService.updateAiSuggestions(meal.id, response.content);
      
      setTodayMeals(prev => prev.map(m => 
        m.id === meal.id ? { ...m, ai_suggestions: response.content } : m
      ));
    } catch (error) {
      console.error('Analysis error:', error);
    }
  };

  const analyzeDay = async () => {
    if (todayMeals.length === 0) {
      toast({
        title: 'لا توجد وجبات',
        description: 'سجلي وجبة واحدة على الأقل أولاً'
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      
      const allFoods = todayMeals.flatMap(m => 
        m.foods.map((f: any) => f.name || f)
      );
      
      const response = await AIService.analyzeNutrition(allFoods, currentWeek);
      setDailyAnalysis(response.content);
      
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      await NutritionService.delete(id);
      setTodayMeals(prev => prev.filter(m => m.id !== id));
      toast({ title: 'تم الحذف' });
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getTotalCalories = () => {
    return todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  };

  const getMealIcon = (mealType: string) => {
    const meal = MEAL_TYPES.find(m => m.id === mealType);
    return meal ? <meal.icon className="w-5 h-5" /> : <Utensils className="w-5 h-5" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل بياناتك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-gradient-to-r from-green-500 to-teal-500 text-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Utensils className="w-8 h-8" />
              🥗 متتبع التغذية الذكي
            </CardTitle>
            <p className="text-green-100">
              الأسبوع {currentWeek} - سجلي وجباتك واحصلي على نصائح AI
            </p>
          </CardHeader>
        </Card>

        {/* Daily Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MEAL_TYPES.map(meal => {
            const mealLogs = todayMeals.filter(m => m.meal_type === meal.id);
            return (
              <Card key={meal.id} className={`bg-gradient-to-br ${meal.color} text-white shadow-lg`}>
                <CardContent className="p-4 text-center">
                  <meal.icon className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-bold">{meal.name}</p>
                  <p className="text-sm opacity-90">
                    {mealLogs.length > 0 ? `${mealLogs.length} وجبة` : 'لم تسجل'}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Calories Summary */}
        {getTotalCalories() > 0 && (
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="font-medium">إجمالي السعرات اليوم</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {getTotalCalories()} سعرة
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-teal-400 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((getTotalCalories() / 2200) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">الهدف: ~2200 سعرة للحامل</p>
            </CardContent>
          </Card>
        )}

        {/* Add Meal Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              تسجيل وجبة جديدة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Meal Type Selection */}
            <div className="flex flex-wrap gap-2">
              {MEAL_TYPES.map(meal => (
                <Button
                  key={meal.id}
                  variant={selectedMealType === meal.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMealType(meal.id)}
                  className={selectedMealType === meal.id ? `bg-gradient-to-r ${meal.color} border-0` : ''}
                >
                  <meal.icon className="w-4 h-4 ml-1" />
                  {meal.name}
                </Button>
              ))}
            </div>

            {/* Food Input */}
            <div className="flex gap-2">
              <Input
                placeholder="أدخلي اسم الطعام..."
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addFood()}
                className="flex-1"
              />
              <Button onClick={addFood} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Foods List */}
            {foods.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {foods.map((food, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {food}
                    <button
                      onClick={() => removeFood(index)}
                      className="hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Calories */}
            <div>
              <label className="text-sm text-gray-600">السعرات (اختياري)</label>
              <Input
                type="number"
                placeholder="عدد السعرات"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-40"
              />
            </div>

            {/* Save Button */}
            <Button
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
              onClick={saveMeal}
              disabled={isSaving || foods.length === 0}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              حفظ الوجبة
            </Button>
          </CardContent>
        </Card>

        {/* Today's Meals */}
        {todayMeals.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">وجبات اليوم</h2>
              <Button
                variant="outline"
                onClick={analyzeDay}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Sparkles className="w-4 h-4 ml-2" />
                )}
                تحليل اليوم
              </Button>
            </div>

            {todayMeals.map(meal => (
              <Card key={meal.id} className="shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full bg-gradient-to-br ${MEAL_TYPES.find(m => m.id === meal.meal_type)?.color || 'from-gray-400 to-gray-500'} text-white`}>
                        {getMealIcon(meal.meal_type)}
                      </div>
                      <div>
                        <h3 className="font-bold">
                          {MEAL_TYPES.find(m => m.id === meal.meal_type)?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {meal.foods.map((f: any) => f.name || f).join('، ')}
                        </p>
                        {meal.calories && (
                          <p className="text-xs text-gray-500">{meal.calories} سعرة</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => deleteMeal(meal.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {meal.ai_suggestions && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs font-medium text-green-600 mb-1">💡 نصيحة AI:</p>
                      <p className="text-sm text-green-700">{meal.ai_suggestions.slice(0, 200)}...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Daily Analysis */}
        {dailyAnalysis && (
          <Card className="bg-gradient-to-br from-green-50 to-teal-50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-500" />
                تحليل تغذيتك اليوم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-green max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {dailyAnalysis}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <h3 className="font-bold text-amber-800 mb-2">💡 نصائح التغذية للحامل</h3>
            <ul className="text-amber-700 text-sm space-y-1">
              <li>• تناولي 5-6 وجبات صغيرة بدلاً من 3 وجبات كبيرة</li>
              <li>• اشربي 8-10 أكواب ماء يومياً</li>
              <li>• تجنبي الأطعمة النيئة والأجبان غير المبسترة</li>
              <li>• ركزي على البروتين والحديد والكالسيوم</li>
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AISmartNutritionTracker;
