import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Ban, CheckCircle, Search, AlertCircle, HelpCircle, Info, Sparkles, Brain } from 'lucide-react';
import MedicalDisclaimer from '../../components/compliance/MedicalDisclaimer';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { AILoadingDots } from '@/components/ai/AILoadingDots';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ToolFrame } from '@/components/ToolFrame';
import { motion } from 'framer-motion';

interface FoodItem {
  id: string;
  nameKey: string;
  category: 'fish' | 'dairy' | 'meat' | 'drinks' | 'other';
  status: 'safe' | 'avoid' | 'limit';
  reasonKey: string;
}

const foodDatabase: FoodItem[] = [
  { id: '1', nameKey: 'toolsInternal.forbiddenFoods.foods.sushi.name', category: 'fish', status: 'avoid', reasonKey: 'toolsInternal.forbiddenFoods.foods.sushi.reason' },
  { id: '2', nameKey: 'toolsInternal.forbiddenFoods.foods.softCheese.name', category: 'dairy', status: 'avoid', reasonKey: 'toolsInternal.forbiddenFoods.foods.softCheese.reason' },
  { id: '3', nameKey: 'toolsInternal.forbiddenFoods.foods.coffee.name', category: 'drinks', status: 'limit', reasonKey: 'toolsInternal.forbiddenFoods.foods.coffee.reason' },
  { id: '4', nameKey: 'toolsInternal.forbiddenFoods.foods.salmon.name', category: 'fish', status: 'safe', reasonKey: 'toolsInternal.forbiddenFoods.foods.salmon.reason' },
  { id: '5', nameKey: 'toolsInternal.forbiddenFoods.foods.deliMeat.name', category: 'meat', status: 'avoid', reasonKey: 'toolsInternal.forbiddenFoods.foods.deliMeat.reason' },
  { id: '6', nameKey: 'toolsInternal.forbiddenFoods.foods.rawEggs.name', category: 'other', status: 'avoid', reasonKey: 'toolsInternal.forbiddenFoods.foods.rawEggs.reason' },
  { id: '7', nameKey: 'toolsInternal.forbiddenFoods.foods.tuna.name', category: 'fish', status: 'limit', reasonKey: 'toolsInternal.forbiddenFoods.foods.tuna.reason' },
  { id: '8', nameKey: 'toolsInternal.forbiddenFoods.foods.alcohol.name', category: 'drinks', status: 'avoid', reasonKey: 'toolsInternal.forbiddenFoods.foods.alcohol.reason' },
  { id: '9', nameKey: 'toolsInternal.forbiddenFoods.foods.hardCheese.name', category: 'dairy', status: 'safe', reasonKey: 'toolsInternal.forbiddenFoods.foods.hardCheese.reason' },
  { id: '10', nameKey: 'toolsInternal.forbiddenFoods.foods.chicken.name', category: 'meat', status: 'safe', reasonKey: 'toolsInternal.forbiddenFoods.foods.chicken.reason' },
];

const ForbiddenFoods: React.FC = () => {
  const { t } = useTranslation();
  const { streamChat, isLoading } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setAiResponse('');
    setShowAiResponse(false);
  });
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
    const name = t(food.nameKey).toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || food.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (!disclaimerAccepted) {
    return <MedicalDisclaimer toolName={t("toolsInternal.forbiddenFoods.title")} onAccept={() => setDisclaimerAccepted(true)} />;
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
      title={t("toolsInternal.forbiddenFoods.title")}
      subtitle={t("toolsInternal.forbiddenFoods.subtitle")}
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
              placeholder={t("toolsInternal.forbiddenFoods.searchPlaceholder")}
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
                {t(`toolsInternal.forbiddenFoods.filters.${f}`)}
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
                  <h3 className="font-semibold text-foreground">{t(food.nameKey)}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${getStatusColor(food.status)} border-0`}>
                    {t(`toolsInternal.forbiddenFoods.status.${food.status}`)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(food.reasonKey)}
                </p>
              </div>
            </div>
          ))}
          
          {filteredFoods.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">{t("toolsInternal.forbiddenFoods.noResults", { term: searchTerm })}</p>
              {searchTerm && (
                <motion.button onClick={() => askAIAboutFood(searchTerm)} disabled={isLoading} whileTap={{ scale: 0.92 }} className="mt-4 relative overflow-hidden rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed">
                  <div className="flex items-center justify-center gap-2 px-5 py-3 font-semibold text-white text-sm rounded-2xl" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))', boxShadow: '0 4px 20px -4px hsl(var(--primary) / 0.5)' }}>
                    {isLoading ? <AILoadingDots text={t("toolsInternal.forbiddenFoods.analyzing")} /> : <><Brain className="h-4 w-4 shrink-0" /><span>{t("toolsInternal.forbiddenFoods.askAI", { term: searchTerm })}</span></>}
                    <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" aria-hidden />
                  </div>
                </motion.button>
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
                  <h3 className="font-semibold">{t("toolsInternal.forbiddenFoods.aiAnalysis")}</h3>
                </div>
                <button 
                  onClick={() => setShowAiResponse(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              {isLoading && !aiResponse && (
                <div className="flex items-center gap-2 text-primary">
                  <AILoadingDots text={t("toolsInternal.forbiddenFoods.analyzing")} />
                </div>
              )}
              {aiResponse && <MarkdownRenderer content={aiResponse} />}
            </CardContent>
          </Card>
        )}

        {/* Legend/Info */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" /> {t("toolsInternal.forbiddenFoods.quickRules")}
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">• <strong>{t("toolsInternal.forbiddenFoods.rules.avoid")}:</strong> {t("toolsInternal.forbiddenFoods.rules.avoidDesc")}</li>
            <li className="flex items-start gap-2">• <strong>{t("toolsInternal.forbiddenFoods.rules.cook")}:</strong> {t("toolsInternal.forbiddenFoods.rules.cookDesc")}</li>
            <li className="flex items-start gap-2">• <strong>{t("toolsInternal.forbiddenFoods.rules.wash")}:</strong> {t("toolsInternal.forbiddenFoods.rules.washDesc")}</li>
          </ul>
        </div>
      </div>
    </ToolFrame>
  );
};

export default ForbiddenFoods;
