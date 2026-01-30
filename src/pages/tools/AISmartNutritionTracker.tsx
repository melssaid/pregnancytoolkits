import React, { useState, useRef, useCallback } from 'react';
import { Camera, Mic, Plus, TrendingUp, AlertCircle, Check, X, Trash2, Apple, Coffee, Sun, Moon, Loader2 } from 'lucide-react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { toast } from 'sonner';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  vitamins: string[];
  isSafe: boolean;
  safetyNote?: string;
  timestamp: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface NutritionalGoals {
  calories: number;
  protein: number;
  iron: number;
  calcium: number;
  folicAcid: number;
}

const UNSAFE_FOODS = [
  'sushi', 'raw fish', 'raw meat', 'unpasteurized', 'soft cheese', 'brie', 
  'camembert', 'blue cheese', 'raw eggs', 'alcohol', 'wine', 'beer',
  'high mercury fish', 'shark', 'swordfish', 'king mackerel', 'tilefish',
  'deli meat', 'hot dogs', 'pate', 'raw sprouts'
];

const MEAL_ICONS = {
  breakfast: Sun,
  lunch: Coffee,
  dinner: Moon,
  snack: Apple,
};

export default function AISmartNutritionTracker() {
  const [currentTrimester, setCurrentTrimester] = useState<1 | 2 | 3>(2);
  const [todaysFoods, setTodaysFoods] = useState<FoodItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { generateContent, isLoading } = usePregnancyAI();

  const getNutritionalGoals = (): NutritionalGoals => {
    const goals = {
      1: { calories: 1800, protein: 71, iron: 27, calcium: 1000, folicAcid: 600 },
      2: { calories: 2200, protein: 75, iron: 27, calcium: 1000, folicAcid: 600 },
      3: { calories: 2400, protein: 80, iron: 27, calcium: 1000, folicAcid: 600 },
    };
    return goals[currentTrimester];
  };

  const getTodaysTotals = () => {
    return todaysFoods.reduce(
      (acc, food) => ({
        calories: acc.calories + food.calories,
        protein: acc.protein + food.protein,
        carbs: acc.carbs + food.carbs,
        fats: acc.fats + food.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const checkFoodSafety = (foodName: string): { isSafe: boolean; note?: string } => {
    const lowerName = foodName.toLowerCase();
    for (const unsafeFood of UNSAFE_FOODS) {
      if (lowerName.includes(unsafeFood)) {
        return { 
          isSafe: false, 
          note: `⚠️ ${unsafeFood} may not be safe during pregnancy. Consult your doctor.` 
        };
      }
    }
    return { isSafe: true };
  };

  const analyzeFoodWithAI = async (foodDescription: string): Promise<FoodItem | null> => {
    setIsAnalyzing(true);
    try {
      const prompt = `Analyze this food for a pregnant woman and provide nutritional info in JSON format only:
Food: "${foodDescription}"

Return ONLY valid JSON (no markdown, no explanation):
{
  "name": "food name",
  "calories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fats": number (grams),
  "vitamins": ["vitamin names"],
  "pregnancySafe": true/false,
  "safetyNote": "note if unsafe"
}`;

      const result = await generateContent(prompt);
      if (!result) throw new Error('No response');

      // Extract JSON from response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Invalid response format');

      const parsed = JSON.parse(jsonMatch[0]);
      const safetyCheck = checkFoodSafety(foodDescription);

      return {
        id: Date.now().toString(),
        name: parsed.name || foodDescription,
        calories: parsed.calories || 0,
        protein: parsed.protein || 0,
        carbs: parsed.carbs || 0,
        fats: parsed.fats || 0,
        vitamins: parsed.vitamins || [],
        isSafe: safetyCheck.isSafe && parsed.pregnancySafe !== false,
        safetyNote: safetyCheck.note || parsed.safetyNote,
        timestamp: new Date(),
        mealType: selectedMealType,
      };
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Fallback to basic estimation
      return {
        id: Date.now().toString(),
        name: foodDescription,
        calories: 150,
        protein: 5,
        carbs: 20,
        fats: 5,
        vitamins: [],
        isSafe: checkFoodSafety(foodDescription).isSafe,
        safetyNote: checkFoodSafety(foodDescription).note,
        timestamp: new Date(),
        mealType: selectedMealType,
      };
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    toast.info('Analyzing image...');

    // Simulate image analysis (in production, send to AI vision API)
    setTimeout(async () => {
      const mockFoodName = 'Mixed salad with grilled chicken';
      const analyzed = await analyzeFoodWithAI(mockFoodName);
      if (analyzed) {
        setTodaysFoods(prev => [...prev, analyzed]);
        toast.success(`Added: ${analyzed.name}`);
      }
      setIsScanning(false);
    }, 2000);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Browser does not support speech recognition');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;

    setIsListening(true);

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setManualInput(transcript);
      setIsListening(false);
      
      const analyzed = await analyzeFoodWithAI(transcript);
      if (analyzed) {
        setTodaysFoods(prev => [...prev, analyzed]);
        toast.success(`Added: ${analyzed.name}`);
        setManualInput('');
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Speech recognition failed');
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleManualAdd = async () => {
    if (!manualInput.trim()) return;
    
    const analyzed = await analyzeFoodWithAI(manualInput);
    if (analyzed) {
      setTodaysFoods(prev => [...prev, analyzed]);
      toast.success(`Added: ${analyzed.name}`);
      setManualInput('');
    }
  };

  const removeFood = (id: string) => {
    setTodaysFoods(prev => prev.filter(f => f.id !== id));
    toast.info('Item removed');
  };

  const goals = getNutritionalGoals();
  const totals = getTodaysTotals();
  const calorieProgress = Math.min((totals.calories / goals.calories) * 100, 100);
  const proteinProgress = Math.min((totals.protein / goals.protein) * 100, 100);

  const getMealFoods = (mealType: string) => 
    todaysFoods.filter(f => f.mealType === mealType);

  return (
    <ToolFrame
      title="Smart Nutrition Tracker"
      subtitle="AI-powered food analysis with pregnancy nutrition tracking"
      toolId="ai-nutrition-tracker"
    >
      <div className="space-y-6">
        {/* Trimester Selector */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Trimester:</span>
              <Select
                value={currentTrimester.toString()}
                onValueChange={(v) => setCurrentTrimester(parseInt(v) as 1 | 2 | 3)}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">First (Weeks 1-12)</SelectItem>
                  <SelectItem value="2">Second (Weeks 13-26)</SelectItem>
                  <SelectItem value="3">Third (Weeks 27-40)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Calories</span>
                <span>{totals.calories} / {goals.calories} cal</span>
              </div>
              <Progress value={calorieProgress} className="h-3" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Protein</span>
                <span>{totals.protein.toFixed(1)} / {goals.protein}g</span>
              </div>
              <Progress value={proteinProgress} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">{totals.carbs.toFixed(0)}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">{totals.fats.toFixed(0)}g</p>
                <p className="text-xs text-muted-foreground">Fats</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Food Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Add Food</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Meal Type Selector */}
            <div className="flex gap-2 flex-wrap">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((meal) => {
                const Icon = MEAL_ICONS[meal];
                const labels = {
                  breakfast: 'Breakfast',
                  lunch: 'Lunch',
                  dinner: 'Dinner',
                  snack: 'Snack',
                };
                return (
                  <Button
                    key={meal}
                    variant={selectedMealType === meal ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMealType(meal)}
                    className="flex-1 min-w-[70px]"
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {labels[meal]}
                  </Button>
                );
              })}
            </div>

            {/* Input Methods */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter food name..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualAdd()}
                disabled={isAnalyzing}
              />
              <Button 
                onClick={handleManualAdd} 
                disabled={!manualInput.trim() || isAnalyzing}
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
              >
                {isScanning ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 mr-2" />
                )}
                <span className="truncate">{isScanning ? 'Scanning...' : 'Camera Scan'}</span>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleVoiceInput}
                disabled={isListening}
              >
                {isListening ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mic className="w-4 h-4 mr-2" />
                )}
                <span className="truncate">{isListening ? 'Listening...' : 'Voice Input'}</span>
              </Button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleImageCapture}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Today's Foods by Meal */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
            <TabsTrigger value="lunch">Lunch</TabsTrigger>
            <TabsTrigger value="dinner">Dinner</TabsTrigger>
            <TabsTrigger value="snack">Snack</TabsTrigger>
          </TabsList>

          {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-3 mt-4">
              {(tab === 'all' ? todaysFoods : getMealFoods(tab)).length === 0 ? (
                <Card className="border-dashed border-2 border-muted-foreground/20">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Apple className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium mb-1">No food added yet</p>
                    <p className="text-xs text-muted-foreground/70">Use the input above to add your daily meals</p>
                  </CardContent>
                </Card>
              ) : (
                (tab === 'all' ? todaysFoods : getMealFoods(tab)).map((food) => (
                  <Card key={food.id} className={!food.isSafe ? 'border-destructive/50 bg-destructive/5' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{food.name}</h4>
                            {food.isSafe ? (
                              <Badge variant="outline" className="text-primary border-primary">
                                <Check className="w-3 h-3 mr-1" />
                                Safe
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Warning
                              </Badge>
                            )}
                          </div>
                          {food.safetyNote && (
                            <p className="text-xs text-destructive mt-1">{food.safetyNote}</p>
                          )}
                          <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{food.calories} cal</span>
                            <span>•</span>
                            <span>{food.protein}g protein</span>
                            <span>•</span>
                            <span>{food.carbs}g carbs</span>
                          </div>
                          {food.vitamins.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {food.vitamins.slice(0, 4).map((v, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {v}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFood(food.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Safety Warning */}
        {todaysFoods.some(f => !f.isSafe) && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-destructive">Safety Alert</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Some foods you've added may not be safe during pregnancy. Please consult your doctor.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nutrition Tips for {currentTrimester === 1 ? 'First' : currentTrimester === 2 ? 'Second' : 'Third'} Trimester</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 text-muted-foreground">
              {currentTrimester === 1 && (
                <>
                  <li>• Focus on folic acid (600 mcg daily)</li>
                  <li>• Eat small, frequent meals to combat nausea</li>
                  <li>• Try ginger or peppermint tea for morning sickness</li>
                </>
              )}
              {currentTrimester === 2 && (
                <>
                  <li>• Increase calories by 340 extra per day</li>
                  <li>• Focus on iron and calcium for bone development</li>
                  <li>• Include omega-3 for baby's brain development</li>
                </>
              )}
              {currentTrimester === 3 && (
                <>
                  <li>• Increase calories by 450 extra per day</li>
                  <li>• Focus on protein for rapid fetal growth</li>
                  <li>• Eat smaller meals to avoid heartburn</li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
