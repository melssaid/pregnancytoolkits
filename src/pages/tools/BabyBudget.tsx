import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Calculator, Plus, Trash2, Wallet, TrendingDown, TrendingUp, PiggyBank } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalytics } from "@/hooks/useAnalytics";

interface BudgetItem {
  id: string;
  category: string;
  name: string;
  estimatedCost: number;
  actualCost?: number;
  purchased: boolean;
}

interface BudgetData {
  totalBudget: number;
  items: BudgetItem[];
}

const STORAGE_KEY = "baby-budget-data";

const defaultCategories = [
  { id: "nursery", name: "غرفة الطفل", icon: "🛏️" },
  { id: "clothing", name: "الملابس", icon: "👕" },
  { id: "feeding", name: "الرضاعة", icon: "🍼" },
  { id: "transport", name: "التنقل", icon: "🚗" },
  { id: "health", name: "الصحة", icon: "💊" },
  { id: "hygiene", name: "النظافة", icon: "🧴" },
  { id: "other", name: "أخرى", icon: "📦" },
];

const suggestedItems: BudgetItem[] = [
  { id: "crib", category: "nursery", name: "سرير أطفال", estimatedCost: 800, purchased: false },
  { id: "mattress", category: "nursery", name: "مرتبة السرير", estimatedCost: 300, purchased: false },
  { id: "stroller", category: "transport", name: "عربة أطفال", estimatedCost: 1200, purchased: false },
  { id: "carseat", category: "transport", name: "مقعد سيارة", estimatedCost: 600, purchased: false },
  { id: "clothes-pack", category: "clothing", name: "طقم ملابس (10 قطع)", estimatedCost: 400, purchased: false },
  { id: "bottles", category: "feeding", name: "رضّاعات ومستلزمات", estimatedCost: 200, purchased: false },
  { id: "diapers", category: "hygiene", name: "حفاضات (3 أشهر)", estimatedCost: 500, purchased: false },
];

const BabyBudget = () => {
  const { t } = useTranslation();
  const { trackAction } = useAnalytics("baby-budget");
  
  const [data, setData] = useState<BudgetData>({ totalBudget: 10000, items: [] });
  const [newItem, setNewItem] = useState({ name: "", category: "other", cost: "" });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setData(JSON.parse(saved));
    } else {
      setData({ totalBudget: 10000, items: suggestedItems });
    }
  }, []);

  const saveData = (newData: BudgetData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  const addItem = () => {
    if (!newItem.name || !newItem.cost) return;
    
    const item: BudgetItem = {
      id: Date.now().toString(),
      category: newItem.category,
      name: newItem.name,
      estimatedCost: Number(newItem.cost),
      purchased: false,
    };
    
    saveData({ ...data, items: [...data.items, item] });
    setNewItem({ name: "", category: "other", cost: "" });
    setShowAddForm(false);
    trackAction("item_added", { category: newItem.category });
  };

  const togglePurchased = (itemId: string) => {
    const newItems = data.items.map(item =>
      item.id === itemId ? { ...item, purchased: !item.purchased } : item
    );
    saveData({ ...data, items: newItems });
    trackAction("item_purchased");
  };

  const updateActualCost = (itemId: string, cost: number) => {
    const newItems = data.items.map(item =>
      item.id === itemId ? { ...item, actualCost: cost } : item
    );
    saveData({ ...data, items: newItems });
  };

  const deleteItem = (itemId: string) => {
    saveData({ ...data, items: data.items.filter(i => i.id !== itemId) });
    trackAction("item_deleted");
  };

  const totalEstimated = data.items.reduce((sum, i) => sum + i.estimatedCost, 0);
  const totalActual = data.items.reduce((sum, i) => sum + (i.actualCost || 0), 0);
  const totalSpent = data.items.filter(i => i.purchased).reduce((sum, i) => sum + (i.actualCost || i.estimatedCost), 0);
  const remaining = data.totalBudget - totalSpent;
  const budgetProgress = (totalSpent / data.totalBudget) * 100;

  const groupedItems = defaultCategories.map(cat => ({
    ...cat,
    items: data.items.filter(i => i.category === cat.id),
  })).filter(cat => cat.items.length > 0);

  return (
    <ToolFrame
      title={t('tools.babyBudget.title')}
      subtitle={t('tools.babyBudget.description')}
      icon={Calculator}
      mood="empowering"
    >
      <div className="space-y-6">
        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-pink-100/50">
            <CardContent className="pt-4 text-center">
              <Wallet className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">الميزانية الإجمالية</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Input
                  type="number"
                  value={data.totalBudget}
                  onChange={(e) => saveData({ ...data, totalBudget: Number(e.target.value) })}
                  className="w-24 text-center font-bold"
                />
                <span className="text-sm">ر.س</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className={`bg-gradient-to-br ${remaining >= 0 ? 'from-green-100/50 to-emerald-100/50' : 'from-red-100/50 to-rose-100/50'}`}>
            <CardContent className="pt-4 text-center">
              <PiggyBank className={`h-6 w-6 mx-auto mb-2 ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <p className="text-sm text-muted-foreground">المتبقي</p>
              <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {remaining.toLocaleString()} ر.س
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-100/50 to-orange-100/50">
            <CardContent className="pt-4 text-center">
              {totalActual <= totalEstimated ? (
                <TrendingDown className="h-6 w-6 mx-auto text-green-600 mb-2" />
              ) : (
                <TrendingUp className="h-6 w-6 mx-auto text-red-600 mb-2" />
              )}
              <p className="text-sm text-muted-foreground">تم الإنفاق</p>
              <p className="text-2xl font-bold text-amber-600">
                {totalSpent.toLocaleString()} ر.س
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">استخدام الميزانية</span>
              <span className="text-sm text-muted-foreground">{Math.round(budgetProgress)}%</span>
            </div>
            <Progress 
              value={Math.min(budgetProgress, 100)} 
              className={`h-3 ${budgetProgress > 100 ? 'bg-red-100' : ''}`}
            />
          </CardContent>
        </Card>

        {/* Add New Item */}
        <AnimatePresence>
          {showAddForm ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="border-2 border-primary/30">
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>اسم المنتج</Label>
                      <Input
                        value={newItem.name}
                        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="مثال: سرير أطفال"
                      />
                    </div>
                    <div>
                      <Label>التكلفة المتوقعة (ر.س)</Label>
                      <Input
                        type="number"
                        value={newItem.cost}
                        onChange={(e) => setNewItem(prev => ({ ...prev, cost: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>الفئة</Label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2"
                    >
                      {defaultCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addItem} className="flex-1">إضافة</Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>إلغاء</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              إضافة منتج جديد
            </Button>
          )}
        </AnimatePresence>

        {/* Items by Category */}
        {groupedItems.map((category, catIndex) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.05 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>{category.icon} {category.name}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {category.items.reduce((sum, i) => sum + (i.actualCost || i.estimatedCost), 0).toLocaleString()} ر.س
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border transition-all ${
                        item.purchased ? 'bg-green-50 border-green-200' : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={item.purchased}
                          onChange={() => togglePurchased(item.id)}
                          className="mt-1 h-5 w-5 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <h4 className={`font-medium ${item.purchased ? 'line-through text-muted-foreground' : ''}`}>
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-muted-foreground">
                              المتوقع: {item.estimatedCost.toLocaleString()} ر.س
                            </span>
                            {item.purchased && (
                              <div className="flex items-center gap-1">
                                <span className="text-sm">الفعلي:</span>
                                <Input
                                  type="number"
                                  value={item.actualCost || item.estimatedCost}
                                  onChange={(e) => updateActualCost(item.id, Number(e.target.value))}
                                  className="w-20 h-7 text-sm"
                                />
                                <span className="text-sm">ر.س</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Summary */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-blue-900 mb-2">ملخص الميزانية</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>التكلفة المتوقعة:</span>
                <span className="font-medium">{totalEstimated.toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between">
                <span>تم الإنفاق:</span>
                <span className="font-medium">{totalSpent.toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between text-base pt-2 border-t">
                <span className="font-semibold">المتبقي من الميزانية:</span>
                <span className={`font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {remaining.toLocaleString()} ر.س
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default BabyBudget;
