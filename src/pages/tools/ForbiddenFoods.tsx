import React, { useState } from 'react';
import { Ban, CheckCircle, Search, AlertCircle, HelpCircle, Info, Sparkles, Loader2 } from 'lucide-react';
import MedicalDisclaimer from '../../components/compliance/MedicalDisclaimer';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ToolFrame } from '@/components/ToolFrame';

interface FoodItem {
  id: string;
  name: string;
  category: 'fish' | 'dairy' | 'meat' | 'drinks' | 'other';
  status: 'safe' | 'avoid' | 'limit';
  reason: string;
}

const foodDatabase: FoodItem[] = [
  { id: '1', name: 'Sushi (Raw Fish)', category: 'fish', status: 'avoid', reason: 'Risk of parasites and bacteria like Listeria' },
  { id: '2', name: 'Soft Cheese (Unpasteurized)', category: 'dairy', status: 'avoid', reason: 'Risk of Listeria contamination' },
  { id: '3', name: 'Coffee', category: 'drinks', status: 'limit', reason: 'Limit caffeine to 200mg/day to reduce risk of low birth weight' },
  { id: '4', name: 'Salmon (Cooked)', category: 'fish', status: 'safe', reason: 'Great source of Omega-3s. Ensure it is fully cooked.' },
  { id: '5', name: 'Deli Meat', category: 'meat', status: 'avoid', reason: 'Listeria risk unless heated until steaming hot' },
  { id: '6', name: 'Raw Eggs', category: 'other', status: 'avoid', reason: 'Risk of Salmonella' },
  { id: '7', name: 'Tuna (Albacore)', category: 'fish', status: 'limit', reason: 'Higher mercury content. Limit to 6oz per week.' },
  { id: '8', name: 'Alcohol', category: 'drinks', status: 'avoid', reason: 'No known safe amount. Can cause fetal alcohol spectrum disorders.' },
  { id: '9', name: 'Hard Cheeses', category: 'dairy', status: 'safe', reason: 'Generally safe as they are pasteurized and have low moisture' },
  { id: '10', name: 'Chicken', category: 'meat', status: 'safe', reason: 'Excellent protein source. Must be fully cooked.' },
];

const ForbiddenFoods: React.FC = () => {
  const { streamChat, isLoading } = usePregnancyAI();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'safe' | 'avoid' | 'limit'>('all');
  const [aiResponse, setAiResponse] = useState('');
  const [showAiResponse, setShowAiResponse] = useState(false);

  const askAIAboutFood = async (food: string) => {
    setAiResponse('');
    setShowAiResponse(true);
    
    await streamChat({
      type: 'pregnancy-assistant',
      messages: [{
        role: 'user',
        content: `Is "${food}" safe to eat during pregnancy? Please provide:

## Safety Status
Is it safe, should be avoided, or limited?

## Why?
Brief explanation of why

## Alternatives
If not safe, suggest safe alternatives

## Preparation Tips
If it can be made safe, explain how`
      }],
      onDelta: (text) => setAiResponse(prev => prev + text),
      onDone: () => {},
    });
  };

  const filteredFoods = foodDatabase.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || food.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (!disclaimerAccepted) {
    return <MedicalDisclaimer toolName="Foods to Avoid Guide" onAccept={() => setDisclaimerAccepted(true)} />;
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'safe': return 'bg-accent/50 text-accent-foreground border-accent';
      case 'avoid': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'limit': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'safe': return <CheckCircle className="w-5 h-5" />;
      case 'avoid': return <Ban className="w-5 h-5" />;
      case 'limit': return <AlertCircle className="w-5 h-5" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  return (
    <ToolFrame
      title="Food Safety Guide"
      subtitle="What to eat & avoid during pregnancy"
      mood="empowering"
      toolId="forbidden-foods"
    >
      <div className="space-y-6">
        {/* Search & Filter */}
        <div className="bg-card rounded-2xl p-4 shadow-sm space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search foods (e.g. sushi, cheese)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {(['all', 'safe', 'limit', 'avoid'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors border-2 ${
                  filter === f 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 border-transparent'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {filteredFoods.map(food => (
            <div key={food.id} className="bg-card rounded-2xl p-4 shadow-sm flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor(food.status)}`}>
                {getStatusIcon(food.status)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{food.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${getStatusColor(food.status)} border-0`}>
                    {food.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {food.reason}
                </p>
              </div>
            </div>
          ))}
          
          {filteredFoods.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No foods found matching "{searchTerm}"</p>
              {searchTerm && (
                <Button 
                  onClick={() => askAIAboutFood(searchTerm)}
                  disabled={isLoading}
                  className="mt-4 gap-2"
                  variant="outline"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-violet-500" />
                  )}
                  Ask AI about "{searchTerm}"
                </Button>
              )}
            </div>
          )}
        </div>

        {/* AI Response */}
        {showAiResponse && (
          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                  <h3 className="font-semibold">AI Food Safety Analysis</h3>
                </div>
                <button 
                  onClick={() => setShowAiResponse(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              {isLoading && !aiResponse && (
                <div className="flex items-center gap-2 text-violet-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analyzing food safety...</span>
                </div>
              )}
              {aiResponse && <MarkdownRenderer content={aiResponse} />}
            </CardContent>
          </Card>
        )}

        {/* Legend/Info */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" /> Quick Rules
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">• <strong>Avoid:</strong> Raw meat/fish, unpasteurized dairy, deli meats (cold).</li>
            <li className="flex items-start gap-2">• <strong>Cook:</strong> Meats to 165°F (75°C).</li>
            <li className="flex items-start gap-2">• <strong>Wash:</strong> All fruits and vegetables thoroughly.</li>
          </ul>
        </div>
      </div>
    </ToolFrame>
  );
};

export default ForbiddenFoods;
