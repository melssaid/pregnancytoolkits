import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Check, Plus, Apple, Milk, Egg, Fish, Leaf, Trash2, Sparkles } from 'lucide-react';
import { safeParseLocalStorage, safeSaveToLocalStorage } from '@/lib/safeStorage';
import { toast } from 'sonner';

interface GroceryItem {
  id: string;
  name: string;
  category: 'produce' | 'dairy' | 'protein' | 'grains' | 'other';
  isChecked: boolean;
  pregnancyBenefit?: string;
}

const suggestedItems: GroceryItem[] = [
  { id: '1', name: 'Spinach', category: 'produce', isChecked: false, pregnancyBenefit: 'Rich in folate and iron' },
  { id: '2', name: 'Avocados', category: 'produce', isChecked: false, pregnancyBenefit: 'Healthy fats for baby brain' },
  { id: '3', name: 'Greek Yogurt', category: 'dairy', isChecked: false, pregnancyBenefit: 'Calcium and probiotics' },
  { id: '4', name: 'Eggs', category: 'protein', isChecked: false, pregnancyBenefit: 'Choline for brain development' },
  { id: '5', name: 'Salmon', category: 'protein', isChecked: false, pregnancyBenefit: 'Omega-3 for baby brain' },
  { id: '6', name: 'Lentils', category: 'protein', isChecked: false, pregnancyBenefit: 'Iron and protein' },
  { id: '7', name: 'Sweet Potatoes', category: 'produce', isChecked: false, pregnancyBenefit: 'Vitamin A and fiber' },
  { id: '8', name: 'Berries', category: 'produce', isChecked: false, pregnancyBenefit: 'Antioxidants and vitamin C' },
  { id: '9', name: 'Whole Grain Bread', category: 'grains', isChecked: false, pregnancyBenefit: 'Fiber and B vitamins' },
  { id: '10', name: 'Oranges', category: 'produce', isChecked: false, pregnancyBenefit: 'Vitamin C for immunity' },
  { id: '11', name: 'Almonds', category: 'other', isChecked: false, pregnancyBenefit: 'Healthy fats and calcium' },
  { id: '12', name: 'Chicken Breast', category: 'protein', isChecked: false, pregnancyBenefit: 'Lean protein' },
];

const categoryIcons: Record<string, React.ElementType> = {
  produce: Apple,
  dairy: Milk,
  protein: Egg,
  grains: Leaf,
  other: ShoppingCart
};

// Validator for grocery items
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
  
  // Track initialization to prevent saving empty state
  const isInitialized = useRef(false);

  // Load from localStorage with safe parsing
  useEffect(() => {
    const saved = safeParseLocalStorage<GroceryItem[]>(
      'pregnancyGroceryList',
      suggestedItems,
      isGroceryItemArray
    );
    setItems(saved);
    isInitialized.current = true;
  }, []);

  // Save to localStorage only after initial load
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
    }
  };

  const clearChecked = () => {
    setItems(items.filter(item => !item.isChecked));
  };

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const checkedCount = items.filter(i => i.isChecked).length;

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
      subtitle="Pregnancy-optimized shopping list"
      mood="joyful"
      toolId="grocery-list"
      customIcon="shopping"
    >
      <div className="space-y-6">
        {/* Add Item */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add item to list..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
              />
              <Button onClick={addItem}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-primary">{checkedCount}</span>
                <span className="text-muted-foreground"> / {items.length} items</span>
              </div>
              {checkedCount > 0 && (
                <Button variant="outline" size="sm" onClick={clearChecked}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear Done
                </Button>
              )}
            </div>
            <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${items.length > 0 ? (checkedCount / items.length) * 100 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all', 'produce', 'dairy', 'protein', 'grains', 'other'] as const).map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="capitalize whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Shopping List */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Your List</h3>
            {filteredItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No items in this category
              </p>
            ) : (
              <div className="space-y-2">
                {filteredItems.map(item => {
                  const Icon = categoryIcons[item.category];
                  return (
                    <div 
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        item.isChecked ? 'bg-muted/50 border-primary/20' : 'border-border'
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          item.isChecked 
                            ? 'bg-primary border-primary text-primary-foreground' 
                            : 'border-muted-foreground'
                        }`}
                      >
                        {item.isChecked && <Check className="w-4 h-4" />}
                      </button>
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <span className={item.isChecked ? 'line-through text-muted-foreground' : ''}>
                          {item.name}
                        </span>
                        {item.pregnancyBenefit && (
                          <p className="text-xs text-primary">{item.pregnancyBenefit}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive"
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
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Pregnancy Superfoods
            </h3>
            <div className="flex flex-wrap gap-2">
              {suggestedItems.filter(s => !items.find(i => i.name === s.name)).slice(0, 6).map(item => (
                <button
                  key={item.id}
                  onClick={() => addSuggested(item)}
                  className="inline-flex items-center rounded-full border border-input bg-background px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-primary/10 hover:border-primary cursor-pointer"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {item.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
