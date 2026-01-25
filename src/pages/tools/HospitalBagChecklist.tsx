import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  category: 'mom' | 'baby' | 'partner' | 'documents';
  isCustom?: boolean;
}

const defaultItems: ChecklistItem[] = [
  // Mom
  { id: 'm1', text: 'Photo ID and Insurance Card', checked: false, category: 'mom' },
  { id: 'm2', text: 'Birth Plan (multiple copies)', checked: false, category: 'mom' },
  { id: 'm3', text: 'Comfortable nightgown/pajamas', checked: false, category: 'mom' },
  { id: 'm4', text: 'Nursing bras and pads', checked: false, category: 'mom' },
  { id: 'm5', text: 'Toiletries (toothbrush, soap, etc.)', checked: false, category: 'mom' },
  { id: 'm6', text: 'Heavy duty maternity pads', checked: false, category: 'mom' },
  { id: 'm7', text: 'Comfortable going-home outfit', checked: false, category: 'mom' },
  { id: 'm8', text: 'Slippers and socks', checked: false, category: 'mom' },
  { id: 'm9', text: 'Phone and long charging cable', checked: false, category: 'mom' },
  { id: 'm10', text: 'Lip balm and hair ties', checked: false, category: 'mom' },

  // Baby
  { id: 'b1', text: 'Infant car seat (installed)', checked: false, category: 'baby' },
  { id: 'b2', text: 'Going-home outfit', checked: false, category: 'baby' },
  { id: 'b3', text: 'Blanket/Swaddle', checked: false, category: 'baby' },
  { id: 'b4', text: 'Newborn diapers and wipes', checked: false, category: 'baby' },
  { id: 'b5', text: 'Socks or booties', checked: false, category: 'baby' },
  { id: 'b6', text: 'Hat', checked: false, category: 'baby' },
  { id: 'b7', text: 'Burp cloths', checked: false, category: 'baby' },

  // Partner
  { id: 'p1', text: 'Change of clothes', checked: false, category: 'partner' },
  { id: 'p2', text: 'Toiletries', checked: false, category: 'partner' },
  { id: 'p3', text: 'Snacks and drinks', checked: false, category: 'partner' },
  { id: 'p4', text: 'Phone and charger', checked: false, category: 'partner' },
  { id: 'p5', text: 'Pillow and blanket', checked: false, category: 'partner' },
  { id: 'p6', text: 'Camera/Video camera', checked: false, category: 'partner' },
  { id: 'p7', text: 'Cash/Credit cards', checked: false, category: 'partner' },
];

export default function HospitalBagChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [activeTab, setActiveTab] = useState('mom');
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('hospitalBagItems');
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      setItems(defaultItems);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hospitalBagItems', JSON.stringify(items));
  }, [items]);

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const addItem = (category: 'mom' | 'baby' | 'partner') => {
    if (!newItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText,
      checked: false,
      category,
      isCustom: true
    };
    setItems([...items, newItem]);
    setNewItemText('');
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const resetList = () => {
    if (confirm('Are you sure you want to reset the checklist to default?')) {
      setItems(defaultItems);
    }
  };

  const getProgress = (category: string) => {
    const categoryItems = items.filter(item => item.category === category);
    if (categoryItems.length === 0) return 0;
    const checkedItems = categoryItems.filter(item => item.checked);
    return Math.round((checkedItems.length / categoryItems.length) * 100);
  };

  const renderCategoryList = (category: 'mom' | 'baby' | 'partner') => {
    const categoryItems = items.filter(item => item.category === category);
    const progress = getProgress(category);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            {progress}% Completed
          </div>
          <div className="w-1/2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-hawaize-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {categoryItems.map(item => (
            <div 
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                item.checked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-hawaize-primary/50'
              }`}
            >
              <Checkbox 
                checked={item.checked}
                onCheckedChange={() => toggleItem(item.id)}
                className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              />
              <span className={`flex-1 text-sm ${item.checked ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                {item.text}
              </span>
              {item.isCustom && (
                <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)}>
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Add custom item..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem(category)}
          />
          <Button onClick={() => addItem(category)} size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <ToolFrame
      title="Hospital Bag Checklist"
      description="Essential checklist for Mom, Baby, and Partner"
      category="Planning"
      icon={Briefcase}
    >
      {showDisclaimer && (
        <MedicalDisclaimer
          onAccept={() => setShowDisclaimer(false)}
          severity="low"
        />
      )}

      {!showDisclaimer && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Pack Your Bags</CardTitle>
                <Button variant="outline" size="sm" onClick={resetList}>
                  Reset List
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="mom">For Mom</TabsTrigger>
                  <TabsTrigger value="baby">For Baby</TabsTrigger>
                  <TabsTrigger value="partner">Partner</TabsTrigger>
                </TabsList>

                <TabsContent value="mom" className="mt-0">
                  {renderCategoryList('mom')}
                </TabsContent>
                <TabsContent value="baby" className="mt-0">
                  {renderCategoryList('baby')}
                </TabsContent>
                <TabsContent value="partner" className="mt-0">
                  {renderCategoryList('partner')}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Pro Tip</h4>
                  <p className="text-sm text-blue-800">
                    Ideally, have your bags packed and ready by week 36. Keep them in the car or near the front door!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ToolFrame>
  );
}
