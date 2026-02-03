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
        {/* Smart Header Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-3 text-center">
              <ShoppingCart className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold text-primary">{items.length}</p>
              <p className="text-[10px] text-muted-foreground">Total Items</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-3 text-center">
              <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-green-500" />
              <p className="text-2xl font-bold text-green-600">{checkedCount}</p>
              <p className="text-[10px] text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <CardContent className="p-3 text-center">
              <Target className="w-5 h-5 mx-auto mb-1 text-amber-500" />
              <p className="text-2xl font-bold text-amber-600">{Math.round((nutrition.folate + nutrition.iron + nutrition.calcium) / 3)}%</p>
              <p className="text-[10px] text-muted-foreground">Nutrition Score</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/20">
            <CardContent className="p-3 text-center">
              <Sparkles className="w-5 h-5 mx-auto mb-1 text-violet-500" />
              <p className="text-2xl font-bold text-violet-600">{items.filter(i => i.pregnancyBenefit).length}</p>
              <p className="text-[10px] text-muted-foreground">Superfoods</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list" className="gap-1 text-xs">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Shopping</span> List
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="gap-1 text-xs">
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nutrition</span> Analysis
            </TabsTrigger>
            <TabsTrigger value="planner" className="gap-1 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Weekly</span> Planner
            </TabsTrigger>
          </TabsList>

          {/* Shopping List Tab */}
          <TabsContent value="list" className="space-y-4 mt-4">
            {/* Add Item */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add item to list..."
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                    className="flex-1"
                  />
                  <Button onClick={addItem} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progress Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Shopping Progress</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {checkedCount} / {items.length}
                  </span>
                </div>
                <Progress 
                  value={items.length > 0 ? (checkedCount / items.length) * 100 : 0} 
                  className="h-2"
                />
                {checkedCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearChecked}
                    className="mt-2 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear {checkedCount} completed items
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {(['all', 'produce', 'dairy', 'protein', 'grains', 'other'] as const).map(cat => {
                const Icon = cat === 'all' ? ShoppingCart : categoryIcons[cat];
                const count = cat === 'all' ? items.length : items.filter(i => i.category === cat).length;
                return (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="capitalize whitespace-nowrap gap-1.5"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat}
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>

            {/* Shopping List */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  Your Shopping List
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">No items in this category</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Add items or select from superfoods below</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredItems.map(item => {
                      const Icon = categoryIcons[item.category];
                      return (
                        <div 
                          key={item.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            item.isChecked 
                              ? 'bg-muted/50 border-primary/20' 
                              : 'border-border hover:border-primary/30 hover:bg-muted/30'
                          }`}
                        >
                          <button
                            onClick={() => toggleItem(item.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                              item.isChecked 
                                ? 'bg-primary border-primary text-primary-foreground' 
                                : 'border-muted-foreground hover:border-primary'
                            }`}
                          >
                            {item.isChecked && <Check className="w-4 h-4" />}
                          </button>
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${categoryColors[item.category]}15` }}
                          >
                            <Icon className="w-4 h-4" style={{ color: categoryColors[item.category] }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`block font-medium ${item.isChecked ? 'line-through text-muted-foreground' : ''}`}>
                              {item.name}
                            </span>
                            {item.pregnancyBenefit && (
                              <p className="text-xs text-primary/80 truncate">{item.pregnancyBenefit}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            {suggestedItems.filter(s => !items.find(i => i.name === s.name)).length > 0 && (
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Pregnancy Superfoods
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {suggestedItems.filter(s => !items.find(i => i.name === s.name)).slice(0, 6).map(item => (
                      <Button
                        key={item.id}
                        variant="outline"
                        size="sm"
                        onClick={() => addSuggested(item)}
                        className="gap-1.5 bg-background hover:bg-primary/10 hover:border-primary"
                      >
                        <Plus className="w-3 h-3" />
                        {item.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Nutrition Analysis Tab */}
          <TabsContent value="nutrition" className="space-y-4 mt-4">
            {/* Nutrition Goals */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Daily Nutrition Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                {nutritionGoals.map((goal) => {
                  const Icon = goal.icon;
                  const percentage = Math.min((goal.current / goal.target) * 100, 100);
                  return (
                    <div key={goal.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${goal.color}15` }}
                          >
                            <Icon className="w-3.5 h-3.5" style={{ color: goal.color }} />
                          </div>
                          <span className="text-sm font-medium">{goal.name}</span>
                        </div>
                        <span className="text-sm" style={{ color: goal.color }}>
                          {goal.current}%
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-2"
                        style={{ '--progress-color': goal.color } as React.CSSProperties}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Distribution */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Category Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {categoryData.length > 0 ? (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '8px', 
                              border: 'none', 
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                            }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                      Add items to see distribution
                    </div>
                  )}
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {categoryData.map((cat) => (
                      <div key={cat.name} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span>{cat.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Nutrition Bar Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Nutrient Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={nutritionChartData} layout="vertical">
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={60}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip 
                          formatter={(value: number) => `${value}%`}
                          contentStyle={{ 
                            borderRadius: '8px', 
                            border: 'none', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                          }}
                        />
                        <Bar 
                          dataKey="current" 
                          radius={[0, 4, 4, 0]}
                          fill="#ec4899"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Nutrition Insights */}
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
              buttonText="Get AI Nutrition Analysis"
              context={{
                week: currentWeek,
                trimester: currentWeek <= 12 ? 1 : currentWeek <= 27 ? 2 : 3
              }}
            />
          </TabsContent>

          {/* Weekly Planner Tab */}
          <TabsContent value="planner" className="space-y-4 mt-4">
            {/* Week Selector */}
            <WeekSlider
              week={currentWeek}
              onChange={setCurrentWeek}
              label="Your Pregnancy Week"
              showTrimester
            />

            {/* Week-Specific Recommendations */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  Week {currentWeek} Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(weeklyRecommendations[String(currentWeek % 3 + 1)] || weeklyRecommendations['1']).map((rec, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2 p-3 rounded-xl bg-background border border-border"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Meal Planning Suggestions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-primary" />
                  Smart Meal Ideas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {[
                  { meal: 'Breakfast', icon: Clock, suggestion: 'Greek yogurt parfait with berries and almonds', color: '#f59e0b' },
                  { meal: 'Lunch', icon: Flame, suggestion: 'Salmon salad with spinach and avocado', color: '#22c55e' },
                  { meal: 'Dinner', icon: Heart, suggestion: 'Lentil soup with whole grain bread', color: '#ec4899' },
                  { meal: 'Snacks', icon: Zap, suggestion: 'Orange slices with almond butter', color: '#8b5cf6' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={item.meal}
                      className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50"
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${item.color}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.meal}</p>
                        <p className="text-xs text-muted-foreground">{item.suggestion}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* AI Weekly Plan */}
            <AIInsightCard
              title="AI Weekly Meal Planner"
              prompt={`Create a personalized weekly meal plan for pregnancy week ${currentWeek} using these available groceries:

Items: ${items.map(i => i.name).join(', ')}

Consider:
1. Trimester-specific nutritional needs
2. Energy levels and common symptoms at week ${currentWeek}
3. Easy-to-prepare meals for busy days
4. Balanced nutrition throughout the day

Provide a structured 7-day meal plan with breakfast, lunch, dinner, and snacks using the available ingredients.`}
              buttonText="Generate AI Weekly Plan"
              context={{
                week: currentWeek,
                trimester: currentWeek <= 12 ? 1 : currentWeek <= 27 ? 2 : 3
              }}
            />

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      suggestedItems.forEach(item => {
                        if (!items.find(i => i.name === item.name)) {
                          addSuggested(item);
                        }
                      });
                    }}
                    className="gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add All Superfoods
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setItems(suggestedItems.map(i => ({ ...i, id: Date.now().toString() + i.id, isChecked: false })))}
                    className="gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ToolFrame>
  );
}
