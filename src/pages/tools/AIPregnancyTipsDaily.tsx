import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, RefreshCw, Star, Calendar, Brain, Loader2 } from 'lucide-react';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface DailyTip {
  id: string;
  category: 'health' | 'nutrition' | 'exercise' | 'mental' | 'baby';
  tipKey: string;
  trimester: number[];
}

const tips: DailyTip[] = [
  { id: '1', category: 'health', tipKey: 't1', trimester: [1, 2, 3] },
  { id: '2', category: 'nutrition', tipKey: 't2', trimester: [1, 2] },
  { id: '3', category: 'exercise', tipKey: 't3', trimester: [1, 2, 3] },
  { id: '4', category: 'mental', tipKey: 't4', trimester: [1, 2, 3] },
  { id: '5', category: 'baby', tipKey: 't5', trimester: [2, 3] },
  { id: '6', category: 'health', tipKey: 't6', trimester: [2, 3] },
  { id: '7', category: 'nutrition', tipKey: 't7', trimester: [1, 2, 3] },
  { id: '8', category: 'exercise', tipKey: 't8', trimester: [1, 2, 3] },
  { id: '9', category: 'mental', tipKey: 't9', trimester: [1, 2, 3] },
  { id: '10', category: 'baby', tipKey: 't10', trimester: [3] },
  { id: '11', category: 'health', tipKey: 't11', trimester: [2, 3] },
  { id: '12', category: 'nutrition', tipKey: 't12', trimester: [1] },
  { id: '13', category: 'exercise', tipKey: 't13', trimester: [1, 2, 3] },
  { id: '14', category: 'mental', tipKey: 't14', trimester: [1, 2, 3] },
  { id: '15', category: 'baby', tipKey: 't15', trimester: [2, 3] },
];

const categoryColors: Record<string, string> = {
  health: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  nutrition: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  exercise: 'bg-primary/10 text-primary',
  mental: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  baby: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
};

export default function AIPregnancyTipsDaily() {
  const { t } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentTrimester, setCurrentTrimester] = useState(2);
  const [dailyTip, setDailyTip] = useState<DailyTip | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAITip, setShowAITip] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  
  const { streamChat, isLoading, error } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setAiResponse('');
    setShowAITip(false);
  });

  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('tipOfTheDayDate');
    const savedTipId = localStorage.getItem('tipOfTheDayId');
    
    if (savedDate === today && savedTipId) {
      const found = tips.find(t => t.id === savedTipId);
      if (found) setDailyTip(found);
      else getNewTip();
    } else {
      getNewTip();
    }

    const savedFavorites = localStorage.getItem('favoriteTips');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  useEffect(() => {
    localStorage.setItem('favoriteTips', JSON.stringify(favorites));
  }, [favorites]);

  const getNewTip = () => {
    const filtered = tips.filter(tip => tip.trimester.includes(currentTrimester));
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    setDailyTip(random);
    setShowAITip(false);
    
    localStorage.setItem('tipOfTheDayDate', new Date().toDateString());
    localStorage.setItem('tipOfTheDayId', random.id);
  };

  const generateAITip = async () => {
    setShowAITip(true);
    setAiResponse('');

    await streamChat({
      type: 'daily-tips' as any,
      messages: [
        {
          role: 'user',
          content: `I'm in trimester ${currentTrimester} of my pregnancy. Give me a unique, helpful tip I might not have heard before. Make it specific and actionable.`
        }
      ],
      context: { trimester: currentTrimester },
      onDelta: (text) => setAiResponse(prev => prev + text),
      onDone: () => {}
    });
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const filteredTips = tips.filter(tip => tip.trimester.includes(currentTrimester));

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName={t('dailyTips.title')}
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title={t('dailyTips.title')}
      subtitle={t('dailyTips.subtitle')}
      mood="joyful"
      toolId="daily-tips"
      icon={Lightbulb}
    >
      <div className="space-y-4">
          {/* Trimester Selection */}
          <div className="flex gap-2">
            {[1, 2, 3].map(tri => (
              <Button
                key={tri}
                variant={currentTrimester === tri ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentTrimester(tri)}
                className="flex-1"
              >
                {t('dailyTips.trimester')} {tri}
              </Button>
            ))}
          </div>

          {/* AI Tip Generator */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Button onClick={getNewTip} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('dailyTips.randomTip')}
                </Button>
                <Button onClick={generateAITip} disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4 mr-2" />
                  )}
                  {t('dailyTips.aiTip')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Generated Tip */}
          {showAITip && aiResponse && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{t('dailyTips.aiPoweredTip')}</h3>
                </div>
                <MarkdownRenderer content={aiResponse} />
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-4 text-destructive text-sm">
                {error}
              </CardContent>
            </Card>
          )}

          {/* Tip of the Day */}
          {dailyTip && !showAITip && (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">{t('dailyTips.tipOfTheDay')}</span>
                </div>
                
                <h3 className="text-sm font-bold mb-1.5">{t(`dailyTips.tips.${dailyTip.tipKey}.tip`)}</h3>
                <p className="text-xs text-muted-foreground mb-3">{t(`dailyTips.tips.${dailyTip.tipKey}.detail`)}</p>

                <div className="flex items-center justify-between">
                  <Badge className={categoryColors[dailyTip.category]}>
                    {t(`dailyTips.categories.${dailyTip.category}`)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(dailyTip.id)}
                  >
                    <Star className={`w-4 h-4 ${favorites.includes(dailyTip.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Favorites */}
          {favorites.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  {t('dailyTips.yourFavorites')} ({favorites.length})
                </h3>
                <div className="space-y-2">
                  {tips.filter(tip => favorites.includes(tip.id)).map(tip => (
                    <div key={tip.id} className="p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium text-sm">{t(`dailyTips.tips.${tip.tipKey}.tip`)}</p>
                      <p className="text-xs text-muted-foreground">{t(`dailyTips.tips.${tip.tipKey}.detail`)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Tips */}
          <div className="space-y-3">
            <h3 className="font-semibold">{t('dailyTips.moreTips')} {currentTrimester}</h3>
            {filteredTips.map(tip => (
              <Card key={tip.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${categoryColors[tip.category]}`}>
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{t(`dailyTips.tips.${tip.tipKey}.tip`)}</h4>
                      <p className="text-xs text-muted-foreground">{t(`dailyTips.tips.${tip.tipKey}.detail`)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => toggleFavorite(tip.id)}
                    >
                      <Star className={`w-4 h-4 ${favorites.includes(tip.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </Button>
                  </div>
                </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ToolFrame>
  );
}