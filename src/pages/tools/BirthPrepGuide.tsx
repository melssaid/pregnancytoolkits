import React, { useState, useEffect, useRef } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardCheck, 
  Baby, 
  Briefcase, 
  Heart, 
  FileText, 
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Share2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { safeParseLocalStorage, safeSaveToLocalStorage } from '@/lib/safeStorage';

interface ChecklistItem {
  id: string;
  text: string;
  description?: string;
  completed: boolean;
}

interface ChecklistCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

const initialChecklists: ChecklistCategory[] = [
  {
    id: 'hospital-bag',
    title: 'Hospital Bag',
    icon: <Briefcase className="w-5 h-5" />,
    items: [
      { id: 'hb1', text: 'ID & Insurance Cards', description: 'Driver\'s license, insurance cards, hospital registration', completed: false },
      { id: 'hb2', text: 'Birth Plan Copies', description: 'Multiple copies for staff', completed: false },
      { id: 'hb3', text: 'Comfortable Robe & Slippers', completed: false },
      { id: 'hb4', text: 'Nursing Bras & Pads', completed: false },
      { id: 'hb5', text: 'Toiletries', description: 'Toothbrush, shampoo, lip balm, hair ties', completed: false },
      { id: 'hb6', text: 'Phone & Charger', completed: false },
      { id: 'hb7', text: 'Going Home Outfit (You)', description: 'Loose, comfortable clothing', completed: false },
      { id: 'hb8', text: 'Going Home Outfit (Baby)', completed: false },
      { id: 'hb9', text: 'Car Seat', description: 'Installed and ready', completed: false },
      { id: 'hb10', text: 'Snacks & Drinks', completed: false },
      { id: 'hb11', text: 'Pillow from Home', completed: false },
      { id: 'hb12', text: 'Entertainment', description: 'Books, tablet, music', completed: false },
    ],
  },
  {
    id: 'nursery',
    title: 'Nursery Setup',
    icon: <Baby className="w-5 h-5" />,
    items: [
      { id: 'n1', text: 'Crib or Bassinet', description: 'With firm mattress', completed: false },
      { id: 'n2', text: 'Fitted Sheets (2-3)', completed: false },
      { id: 'n3', text: 'Changing Table/Pad', completed: false },
      { id: 'n4', text: 'Diapers (Newborn Size)', completed: false },
      { id: 'n5', text: 'Wipes', completed: false },
      { id: 'n6', text: 'Diaper Cream', completed: false },
      { id: 'n7', text: 'Onesies (6-8)', completed: false },
      { id: 'n8', text: 'Swaddle Blankets', completed: false },
      { id: 'n9', text: 'Baby Monitor', completed: false },
      { id: 'n10', text: 'Night Light', completed: false },
      { id: 'n11', text: 'Dresser/Storage', completed: false },
      { id: 'n12', text: 'Thermometer', completed: false },
    ],
  },
  {
    id: 'birth-plan',
    title: 'Birth Plan',
    icon: <FileText className="w-5 h-5" />,
    items: [
      { id: 'bp1', text: 'Choose Birth Location', description: 'Hospital, birth center, or home', completed: false },
      { id: 'bp2', text: 'Select Healthcare Provider', completed: false },
      { id: 'bp3', text: 'Decide on Labor Positions', completed: false },
      { id: 'bp4', text: 'Pain Management Preferences', description: 'Natural, epidural, other options', completed: false },
      { id: 'bp5', text: 'Birth Support Team', description: 'Partner, doula, family members', completed: false },
      { id: 'bp6', text: 'Environment Preferences', description: 'Music, lighting, aromatherapy', completed: false },
      { id: 'bp7', text: 'Intervention Preferences', completed: false },
      { id: 'bp8', text: 'Cord Cutting Preferences', completed: false },
      { id: 'bp9', text: 'Skin-to-Skin Time', completed: false },
      { id: 'bp10', text: 'Feeding Preferences', description: 'Breastfeeding, formula, combination', completed: false },
    ],
  },
  {
    id: 'postpartum',
    title: 'Postpartum Prep',
    icon: <Heart className="w-5 h-5" />,
    items: [
      { id: 'pp1', text: 'Postpartum Recovery Supplies', description: 'Pads, peri bottle, ice packs', completed: false },
      { id: 'pp2', text: 'Nursing Supplies', description: 'Pump, bottles, storage bags', completed: false },
      { id: 'pp3', text: 'Meal Prep/Delivery Plan', completed: false },
      { id: 'pp4', text: 'Support System Arranged', description: 'Family, friends, hired help', completed: false },
      { id: 'pp5', text: 'Pediatrician Selected', completed: false },
      { id: 'pp6', text: 'Postpartum Checkup Scheduled', completed: false },
      { id: 'pp7', text: 'Mental Health Resources', description: 'Therapist, support groups', completed: false },
      { id: 'pp8', text: 'Partner Leave Arranged', completed: false },
    ],
  },
];

const isValidChecklists = (data: unknown): data is ChecklistCategory[] => {
  return Array.isArray(data) && data.every(cat => 
    typeof cat === 'object' && cat !== null && 
    typeof (cat as ChecklistCategory).id === 'string' &&
    Array.isArray((cat as ChecklistCategory).items)
  );
};

export default function BirthPrepGuide() {
  const [checklists, setChecklists] = useState<ChecklistCategory[]>(initialChecklists);
  const [activeTab, setActiveTab] = useState('hospital-bag');
  const { toast } = useToast();
  const isInitialized = useRef(false);

  useEffect(() => {
    const saved = safeParseLocalStorage<ChecklistCategory[]>('birthPrepChecklists', initialChecklists, isValidChecklists);
    const merged = initialChecklists.map(category => {
      const savedCategory = saved.find(s => s.id === category.id);
      if (savedCategory) {
        return {
          ...category,
          items: category.items.map(item => {
            const savedItem = savedCategory.items.find(si => si.id === item.id);
            return savedItem ? { ...item, completed: savedItem.completed } : item;
          }),
        };
      }
      return category;
    });
    setChecklists(merged);
    isInitialized.current = true;
  }, []);

  useEffect(() => {
    if (!isInitialized.current) return;
    safeSaveToLocalStorage('birthPrepChecklists', checklists);
  }, [checklists]);

  const toggleItem = (categoryId: string, itemId: string) => {
    setChecklists(prev => prev.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: category.items.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
        };
      }
      return category;
    }));
  };

  const getCategoryProgress = (category: ChecklistCategory) => {
    const completed = category.items.filter(item => item.completed).length;
    return Math.round((completed / category.items.length) * 100);
  };

  const getTotalProgress = () => {
    const totalItems = checklists.reduce((sum, cat) => sum + cat.items.length, 0);
    const completedItems = checklists.reduce(
      (sum, cat) => sum + cat.items.filter(item => item.completed).length, 
      0
    );
    return Math.round((completedItems / totalItems) * 100);
  };

  const resetAll = () => {
    setChecklists(initialChecklists);
  };

  const shareChecklist = async () => {
    const activeCategory = checklists.find(c => c.id === activeTab);
    if (!activeCategory) return;

    const completedItems = activeCategory.items.filter(i => i.completed);
    const remainingItems = activeCategory.items.filter(i => !i.completed);

    const text = `📋 Birth Prep: ${activeCategory.title}

✅ COMPLETED (${completedItems.length}):
${completedItems.map(i => `• ${i.text}`).join('\n') || '(none yet)'}

📝 STILL NEEDED (${remainingItems.length}):
${remainingItems.map(i => `• ${i.text}`).join('\n') || '(all done!)'}

Progress: ${getCategoryProgress(activeCategory)}%
— via Pregnancy Toolkits`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `Birth Prep: ${activeCategory.title}`, text });
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied!', description: 'Checklist copied to clipboard.' });
    }
  };

  const shareAllProgress = async () => {
    const text = `🤰 My Birth Preparation Progress

${checklists.map(cat => {
  const completed = cat.items.filter(i => i.completed).length;
  return `${cat.title}: ${completed}/${cat.items.length} (${getCategoryProgress(cat)}%)`;
}).join('\n')}

Overall: ${getTotalProgress()}% complete!
— via Pregnancy Toolkits`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Birth Preparation Progress', text });
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied!', description: 'Progress summary copied to clipboard.' });
    }
  };

  return (
    <ToolFrame
      title="Birth Preparation Guide"
      subtitle="Complete checklist to prepare for labor, delivery, and bringing baby home"
      icon={ClipboardCheck}
      mood="empowering"
      toolId="birth-prep-guide"
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Overall Progress
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-primary">{getTotalProgress()}%</span>
                <Button variant="outline" size="sm" onClick={shareAllProgress} className="gap-1">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
            <Progress value={getTotalProgress()} className="h-3" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {checklists.map((category) => (
                <div key={category.id} className="text-center">
                  <div className="text-sm font-medium">{category.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {category.items.filter(i => i.completed).length}/{category.items.length}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            {checklists.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs sm:text-sm">
                <span className="hidden sm:inline mr-1">{category.icon}</span>
                <span className="truncate">{category.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {checklists.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {category.icon}
                      {category.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {getCategoryProgress(category)}%
                      </span>
                      <Button variant="ghost" size="sm" onClick={shareChecklist} className="gap-1">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Progress value={getCategoryProgress(category)} className="h-2 mb-4" />

                  <div className="space-y-3">
                    {category.items.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-colors border-2 ${
                          item.completed 
                            ? 'bg-accent/30 border-accent' 
                            : 'bg-muted/50 border-transparent'
                        }`}
                      >
                        <Checkbox
                          id={item.id}
                          checked={item.completed}
                          onCheckedChange={() => toggleItem(category.id, item.id)}
                          className="mt-0.5"
                        />
                        <label htmlFor={item.id} className="flex-1 cursor-pointer">
                          <span className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {item.text}
                          </span>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </label>
                        {item.completed && (
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-center">
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <AlertCircle className="w-4 h-4" />
            Reset All Checklists
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Preparation Tips</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-xl">📅</span>
                <p className="text-sm text-muted-foreground">
                  Start preparing around week 32-34 to avoid last-minute stress.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-xl">👶</span>
                <p className="text-sm text-muted-foreground">
                  Install the car seat early and have it inspected at a local fire station.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-xl">🏥</span>
                <p className="text-sm text-muted-foreground">
                  Take a hospital tour and know the best route to get there.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
