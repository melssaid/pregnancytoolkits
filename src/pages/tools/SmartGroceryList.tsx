import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, Check, Plus, Apple, Milk, Egg, Fish, Leaf, Trash2, Sparkles,
  TrendingUp, Target, Brain, Zap, Heart, BarChart3, ChefHat, Calendar,
  Droplets, Flame, Dumbbell, AlertCircle, CheckCircle2, Clock, RefreshCw
} from 'lucide-react';
import { safeParseLocalStorage, safeSaveToLocalStorage } from '@/lib/safeStorage';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { WeekSlider } from '@/components/WeekSlider';
import { AIInsightCard } from '@/components/ai/AIInsightCard';

interface GroceryItem {
  id: string;
  name: string;
  category: 'produce' | 'dairy' | 'protein' | 'grains' | 'other';
  isChecked: boolean;
  pregnancyBenefit?: string;
  nutrients?: {
    protein?: number;
    iron?: number;
    folate?: number;
    calcium?: number;
    omega3?: number;
  };
}

interface NutritionGoal {
  name: string;
  current: number;
  target: number;
  unit: string;
  icon: React.ElementType;
  color: string;
}

const suggestedItems: GroceryItem[] = [
  { id: '1', name: 'Spinach', category: 'produce', isChecked: false, pregnancyBenefit: 'Rich in folate and iron', nutrients: { iron: 15, folate: 25, calcium: 5 } },
  { id: '2', name: 'Avocados', category: 'produce', isChecked: false, pregnancyBenefit: 'Healthy fats for baby brain', nutrients: { omega3: 10, folate: 15 } },
  { id: '3', name: 'Greek Yogurt', category: 'dairy', isChecked: false, pregnancyBenefit: 'Calcium and probiotics', nutrients: { protein: 12, calcium: 20 } },
  { id: '4', name: 'Eggs', category: 'protein', isChecked: false, pregnancyBenefit: 'Choline for brain development', nutrients: { protein: 15, iron: 8 } },
  { id: '5', name: 'Salmon', category: 'protein', isChecked: false, pregnancyBenefit: 'Omega-3 for baby brain', nutrients: { protein: 20, omega3: 40 } },
  { id: '6', name: 'Lentils', category: 'protein', isChecked: false, pregnancyBenefit: 'Iron and protein', nutrients: { protein: 18, iron: 20, folate: 30 } },
  { id: '7', name: 'Sweet Potatoes', category: 'produce', isChecked: false, pregnancyBenefit: 'Vitamin A and fiber', nutrients: { folate: 8, iron: 5 } },
  { id: '8', name: 'Berries', category: 'produce', isChecked: false, pregnancyBenefit: 'Antioxidants and vitamin C', nutrients: { folate: 5 } },
  { id: '9', name: 'Whole Grain Bread', category: 'grains', isChecked: false, pregnancyBenefit: 'Fiber and B vitamins', nutrients: { iron: 10, folate: 12 } },
  { id: '10', name: 'Oranges', category: 'produce', isChecked: false, pregnancyBenefit: 'Vitamin C for immunity', nutrients: { folate: 10 } },
  { id: '11', name: 'Almonds', category: 'other', isChecked: false, pregnancyBenefit: 'Healthy fats and calcium', nutrients: { protein: 8, calcium: 10, omega3: 5 } },
  { id: '12', name: 'Chicken Breast', category: 'protein', isChecked: false, pregnancyBenefit: 'Lean protein', nutrients: { protein: 25, iron: 6 } },
];

const weeklyRecommendations: Record<string, string[]> = {
  '1': ['Folate-rich foods', 'Whole grains', 'Lean proteins'],
  '2': ['Iron-rich foods', 'Omega-3 sources', 'Calcium foods'],
  '3': ['High-fiber foods', 'Vitamin D sources', 'Hydrating foods'],
};

const categoryIcons: Record<string, React.ElementType> = {
  produce: Apple,
  dairy: Milk,
  protein: Egg,
  grains: Leaf,
  other: ShoppingCart
};

const categoryColors: Record<string, string> = {
  produce: '#22c55e',
  dairy: '#3b82f6',
  protein: '#ef4444',
  grains: '#f59e0b',
  other: '#8b5cf6'
};

const isGroceryItemArray = (data: unknown): data is GroceryItem[] => {
  return Array.isArray(data) && data.every(item =>
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'name' in item &&
    'category' in item &&
    typeof (item as GroceryItem).isChecked === 'boolean'
  );
};

export default function SmartGroceryList() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'produce' | 'dairy' | 'protein' | 'grains' | 'other'>('all');
  const [currentWeek, setCurrentWeek] = useState(20);
  const [activeTab, setActiveTab] = useState('list');
  
  const isInitialized = useRef(false);

  useEffect(() => {
    const saved = safeParseLocalStorage<GroceryItem[]>(
      'pregnancyGroceryList',
      suggestedItems,
      isGroceryItemArray
    );
    setItems(saved);
    isInitialized.current = true;
  }, []);

  const saveItems = useCallback((newItems: GroceryItem[]) => {
    const success = safeSaveToLocalStorage('pregnancyGroceryList', newItems);
    if (!success) {
      toast.error('Failed to save list. Storage may be full.');
    }
  }, []);

  useEffect(() => {
    if (isInitialized.current) {
      saveItems(items);
    }
  }, [items, saveItems]);

  const addItem = () => {
    if (!newItem.trim()) return;
    
    const item: GroceryItem = {
      id: Date.now().toString(),
      name: newItem,
      category: 'other',
      isChecked: false
    };
    
    setItems([...items, item]);
    setNewItem('');
    toast.success('Item added to your list');
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const addSuggested = (suggested: GroceryItem) => {
    if (!items.find(i => i.name === suggested.name)) {
      setItems([...items, { ...suggested, id: Date.now().toString() }]);
      toast.success(`${suggested.name} added to your list`);
    }
  };

  const clearChecked = () => {
    const count = items.filter(item => item.isChecked).length;
    setItems(items.filter(item => !item.isChecked));
    toast.success(`${count} items cleared`);
  };

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const checkedCount = items.filter(i => i.isChecked).length;

  // Calculate nutrition data
  const calculateNutrition = () => {
    const totals = { protein: 0, iron: 0, folate: 0, calcium: 0, omega3: 0 };
    items.forEach(item => {
      if (item.nutrients) {
        totals.protein += item.nutrients.protein || 0;
        totals.iron += item.nutrients.iron || 0;
        totals.folate += item.nutrients.folate || 0;
        totals.calcium += item.nutrients.calcium || 0;
        totals.omega3 += item.nutrients.omega3 || 0;
      }
    });
    return totals;
  };

  const nutrition = calculateNutrition();

  const nutritionGoals: NutritionGoal[] = [
    { name: 'Protein', current: nutrition.protein, target: 100, unit: '%', icon: Dumbbell, color: '#ef4444' },
    { name: 'Iron', current: nutrition.iron, target: 100, unit: '%', icon: Droplets, color: '#f59e0b' },
    { name: 'Folate', current: nutrition.folate, target: 100, unit: '%', icon: Leaf, color: '#22c55e' },
    { name: 'Calcium', current: nutrition.calcium, target: 100, unit: '%', icon: Heart, color: '#3b82f6' },
    { name: 'Omega-3', current: nutrition.omega3, target: 100, unit: '%', icon: Brain, color: '#8b5cf6' },
  ];

  // Category distribution for pie chart
  const categoryData = [
    { name: 'Produce', value: items.filter(i => i.category === 'produce').length, color: categoryColors.produce },
    { name: 'Dairy', value: items.filter(i => i.category === 'dairy').length, color: categoryColors.dairy },
    { name: 'Protein', value: items.filter(i => i.category === 'protein').length, color: categoryColors.protein },
    { name: 'Grains', value: items.filter(i => i.category === 'grains').length, color: categoryColors.grains },
    { name: 'Other', value: items.filter(i => i.category === 'other').length, color: categoryColors.other },
  ].filter(d => d.value > 0);

  // Nutrition bar chart data
  const nutritionChartData = nutritionGoals.map(goal => ({
    name: goal.name,
    current: Math.min(goal.current, 100),
    target: 100,
    fill: goal.color
  }));

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName="Smart Grocery List"
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title="Smart Grocery List"
      subtitle="AI-powered pregnancy nutrition planner"
      mood="joyful"
      toolId="grocery-list"
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        {/* Welcome Section - Compact */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/8 via-primary/4 to-transparent border border-primary/15 p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground text-sm">Smart Pregnancy Nutrition</h2>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Plan meals, track nutrients, and discover superfoods for you and your baby.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Dashboard - Compact */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="bg-gradient-to-br from-primary/8 to-primary/3 border-primary/15">
            <CardContent className="p-2.5 text-center">
              <ShoppingCart className="w-3.5 h-3.5 mx-auto mb-0.5 text-primary" />
              <p className="text-lg font-bold text-primary">{items.length}</p>
              <p className="text-[9px] text-muted-foreground">Items</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/8 to-green-500/3 border-green-500/15">
            <CardContent className="p-2.5 text-center">
              <CheckCircle2 className="w-3.5 h-3.5 mx-auto mb-0.5 text-green-500" />
              <p className="text-lg font-bold text-green-600">{checkedCount}</p>
              <p className="text-[9px] text-muted-foreground">Done</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/8 to-amber-500/3 border-amber-500/15">
            <CardContent className="p-2.5 text-center">
              <Target className="w-3.5 h-3.5 mx-auto mb-0.5 text-amber-500" />
              <p className="text-lg font-bold text-amber-600">{Math.round((nutrition.folate + nutrition.iron + nutrition.calcium) / 3)}%</p>
              <p className="text-[9px] text-muted-foreground">Score</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-violet-500/8 to-violet-500/3 border-violet-500/15">
            <CardContent className="p-2.5 text-center">
              <Leaf className="w-3.5 h-3.5 mx-auto mb-0.5 text-violet-500" />
              <p className="text-lg font-bold text-violet-600">{items.filter(i => i.pregnancyBenefit).length}</p>
              <p className="text-[9px] text-muted-foreground">Super</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-9 p-0.5">
            <TabsTrigger value="list" className="gap-1 text-[11px] py-2 data-[state=active]:shadow-sm">
              <ShoppingCart className="w-3 h-3" />
              List
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="gap-1 text-[11px] py-2 data-[state=active]:shadow-sm">
              <BarChart3 className="w-3 h-3" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="planner" className="gap-1 text-[11px] py-2 data-[state=active]:shadow-sm">
              <Calendar className="w-3 h-3" />
              Planner
            </TabsTrigger>
          </TabsList>

          {/* Shopping List Tab */}
          <TabsContent value="list" className="space-y-3 mt-3">
            {/* Add Item - Inline */}
            <div className="flex gap-2">
              <Input
                placeholder="Add item..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                className="flex-1 h-9 text-sm"
              />
              <Button onClick={addItem} size="sm" className="shrink-0 h-9 px-3">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Progress Bar - Compact */}
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40 border border-border/40">
              <div className="flex-1">
                <Progress 
                  value={items.length > 0 ? (checkedCount / items.length) * 100 : 0} 
                  className="h-1.5"
                />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                {checkedCount}/{items.length}
              </span>
              {checkedCount > 0 && (
                <button 
                  onClick={clearChecked}
                  className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter - Compact */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {(['all', 'produce', 'dairy', 'protein', 'grains', 'other'] as const).map(cat => {
                const Icon = cat === 'all' ? ShoppingCart : categoryIcons[cat];
                const count = cat === 'all' ? items.length : items.filter(i => i.category === cat).length;
                return (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="capitalize whitespace-nowrap gap-1 h-7 px-2 text-[10px]"
                  >
                    <Icon className="w-3 h-3" />
                    {cat}
                    <span className="text-[9px] opacity-70">({count})</span>
                  </Button>
                );
              })}
            </div>

            {/* Shopping List - Compact */}
            <Card className="shadow-sm">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5 text-primary" />
                    Your List
                  </div>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    {filteredItems.length} items
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-6">
                    <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground">No items yet</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
                    {filteredItems.map(item => {
                      const Icon = categoryIcons[item.category];
                      return (
                        <div 
                          key={item.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                            item.isChecked 
                              ? 'bg-muted/40 border-primary/15' 
                              : 'border-border/60 hover:border-primary/20'
                          }`}
                        >
                          <button
                            onClick={() => toggleItem(item.id)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                              item.isChecked 
                                ? 'bg-primary border-primary text-primary-foreground' 
                                : 'border-muted-foreground/50 hover:border-primary'
                            }`}
                          >
                            {item.isChecked && <Check className="w-3 h-3" />}
                          </button>
                          <div 
                            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${categoryColors[item.category]}12` }}
                          >
                            <Icon className="w-3 h-3" style={{ color: categoryColors[item.category] }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`block text-xs font-medium ${item.isChecked ? 'line-through text-muted-foreground' : ''}`}>
                              {item.name}
                            </span>
                            {item.pregnancyBenefit && (
                              <p className="text-[10px] text-muted-foreground truncate">{item.pregnancyBenefit}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground/50 hover:text-destructive transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Superfoods - Compact */}
            {suggestedItems.filter(s => !items.find(i => i.name === s.name)).length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <Leaf className="w-3 h-3 text-primary" />
                  Recommended Superfoods
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedItems.filter(s => !items.find(i => i.name === s.name)).slice(0, 6).map(item => (
                    <Button
                      key={item.id}
                      variant="outline"
                      size="sm"
                      onClick={() => addSuggested(item)}
                      className="gap-1 h-7 px-2 text-[10px] bg-background hover:bg-primary/5"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      {item.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Nutrition Analysis Tab */}
          <TabsContent value="nutrition" className="space-y-3 mt-3">
            {/* Nutrition Goals - Compact */}
            <Card className="shadow-sm">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-primary" />
                  Daily Nutrition Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2.5">
                {nutritionGoals.map((goal) => {
                  const Icon = goal.icon;
                  const percentage = Math.min((goal.current / goal.target) * 100, 100);
                  return (
                    <div key={goal.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="w-6 h-6 rounded-md flex items-center justify-center"
                            style={{ backgroundColor: `${goal.color}12` }}
                          >
                            <Icon className="w-3 h-3" style={{ color: goal.color }} />
                          </div>
                          <span className="text-xs font-medium">{goal.name}</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: goal.color }}>
                          {goal.current}%
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-1.5"
                        style={{ '--progress-color': goal.color } as React.CSSProperties}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Charts Grid - Compact */}
            <div className="grid grid-cols-2 gap-2">
              {/* Category Distribution */}
              <Card className="shadow-sm">
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-xs flex items-center gap-1.5">
                    <BarChart3 className="w-3 h-3 text-primary" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  {categoryData.length > 0 ? (
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={45}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '6px', 
                              border: 'none', 
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              fontSize: '10px',
                              padding: '4px 8px'
                            }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-muted-foreground/20" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Nutrition Bar Chart */}
              <Card className="shadow-sm">
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-xs flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-primary" />
                    Nutrients
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={nutritionChartData} layout="vertical">
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={45}
                          tick={{ fontSize: 9 }}
                        />
                        <Tooltip 
                          formatter={(value: number) => `${value}%`}
                          contentStyle={{ 
                            borderRadius: '6px', 
                            border: 'none', 
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            fontSize: '10px'
                          }}
                        />
                        <Bar 
                          dataKey="current" 
                          radius={[0, 3, 3, 0]}
                          fill="#ec4899"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Nutrition Insights - Compact */}
            <AIInsightCard
              title="AI Nutrition Analysis"
              prompt={`Analyze this pregnancy grocery list for week ${currentWeek} and provide personalized nutrition advice:

Items: ${items.map(i => i.name).join(', ')}

Current nutrition coverage:
- Protein: ${nutrition.protein}%
- Iron: ${nutrition.iron}%
- Folate: ${nutrition.folate}%
- Calcium: ${nutrition.calcium}%
- Omega-3: ${nutrition.omega3}%

Provide:
1. Overall nutrition score assessment
2. Missing nutrients and recommended foods to add
3. Week ${currentWeek} specific recommendations
4. Meal combination suggestions using these ingredients`}
              buttonText="Analyze"
              context={{
                week: currentWeek,
                trimester: currentWeek <= 12 ? 1 : currentWeek <= 27 ? 2 : 3
              }}
            />
          </TabsContent>

          {/* Weekly Planner Tab */}
          <TabsContent value="planner" className="space-y-3 mt-3">
            {/* Week Selector - Compact */}
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40">
              <WeekSlider
                week={currentWeek}
                onChange={setCurrentWeek}
                label=""
                showTrimester
              />
            </div>

            {/* Week Focus - Compact */}
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Target className="w-3 h-3 text-primary" />
                Week {currentWeek} Focus
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(weeklyRecommendations[String(currentWeek % 3 + 1)] || weeklyRecommendations['1']).map((rec, idx) => (
                  <Badge key={idx} variant="outline" className="text-[10px] py-1 px-2 bg-background">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-primary" />
                    {rec}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Meal Ideas - Compact */}
            <Card className="shadow-sm">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs flex items-center gap-1.5">
                  <ChefHat className="w-3.5 h-3.5 text-primary" />
                  Daily Meal Ideas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {[
                  { meal: 'Breakfast', icon: Clock, suggestion: 'Yogurt with berries', color: '#f59e0b' },
                  { meal: 'Lunch', icon: Flame, suggestion: 'Salmon spinach salad', color: '#22c55e' },
                  { meal: 'Dinner', icon: Heart, suggestion: 'Lentil soup', color: '#ec4899' },
                  { meal: 'Snacks', icon: Zap, suggestion: 'Orange + almonds', color: '#8b5cf6' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={item.meal}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/40"
                    >
                      <div 
                        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${item.color}12` }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{item.meal}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{item.suggestion}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* AI Weekly Plan */}
            <AIInsightCard
              title="AI Weekly Meal Plan"
              prompt={`Create a personalized weekly meal plan for pregnancy week ${currentWeek} using these available groceries:

Items: ${items.map(i => i.name).join(', ')}

Consider:
1. Trimester-specific nutritional needs
2. Energy levels and common symptoms at week ${currentWeek}
3. Easy-to-prepare meals for busy days
4. Balanced nutrition throughout the day

Provide a structured 7-day meal plan with breakfast, lunch, dinner, and snacks using the available ingredients.`}
              buttonText="Generate Plan"
              context={{
                week: currentWeek,
                trimester: currentWeek <= 12 ? 1 : currentWeek <= 27 ? 2 : 3
              }}
            />

            {/* Quick Actions - Compact */}
            <div className="flex flex-wrap gap-1.5">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const newItems = suggestedItems.filter(
                    item => !items.find(i => i.name === item.name)
                  ).map(item => ({ ...item, id: Date.now().toString() + item.id }));
                  if (newItems.length > 0) {
                    setItems(prev => [...prev, ...newItems]);
                    toast.success(`${newItems.length} superfoods added to your list`);
                  } else {
                    toast.info('All superfoods are already in your list');
                  }
                }}
                className="gap-1 h-7 px-2 text-[10px]"
              >
                <Plus className="w-2.5 h-2.5" />
                Add All Superfoods
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setItems(suggestedItems.map(i => ({ ...i, id: Date.now().toString() + i.id, isChecked: false })))}
                className="gap-1 h-7 px-2 text-[10px]"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                Reset
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ToolFrame>
  );
}
