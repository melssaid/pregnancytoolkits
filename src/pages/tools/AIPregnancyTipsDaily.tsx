import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, RefreshCw, Star, Calendar, Brain, Loader2 } from 'lucide-react';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface DailyTip {
  id: string;
  category: 'health' | 'nutrition' | 'exercise' | 'mental' | 'baby';
  tip: string;
  detail: string;
  trimester: number[];
}

const tips: DailyTip[] = [
  { id: '1', category: 'health', tip: 'Stay hydrated!', detail: 'Aim for 8-10 glasses of water daily to support amniotic fluid and reduce swelling.', trimester: [1, 2, 3] },
  { id: '2', category: 'nutrition', tip: 'Eat your greens', detail: 'Leafy greens like spinach and kale are packed with folate essential for neural development.', trimester: [1, 2] },
  { id: '3', category: 'exercise', tip: 'Take a 15-minute walk', detail: 'Walking improves circulation, reduces swelling, and helps with labor preparation.', trimester: [1, 2, 3] },
  { id: '4', category: 'mental', tip: 'Practice gratitude', detail: 'Write down 3 things you\'re grateful for today. This reduces stress and improves mood.', trimester: [1, 2, 3] },
  { id: '5', category: 'baby', tip: 'Talk to your baby', detail: 'Your baby can hear you! Reading or singing strengthens your bond.', trimester: [2, 3] },
  { id: '6', category: 'health', tip: 'Sleep on your left side', detail: 'This position improves blood flow to your baby and reduces pressure on organs.', trimester: [2, 3] },
  { id: '7', category: 'nutrition', tip: 'Include omega-3s', detail: 'Salmon, walnuts, and chia seeds support baby\'s brain development.', trimester: [1, 2, 3] },
  { id: '8', category: 'exercise', tip: 'Do your Kegels', detail: 'Pelvic floor exercises prepare you for labor and prevent incontinence.', trimester: [1, 2, 3] },
  { id: '9', category: 'mental', tip: 'Connect with other moms', detail: 'Join a prenatal class or online community for support and shared experiences.', trimester: [1, 2, 3] },
  { id: '10', category: 'baby', tip: 'Count those kicks', detail: 'After week 28, track baby movements. You should feel 10 kicks in 2 hours.', trimester: [3] },
  { id: '11', category: 'health', tip: 'Elevate your feet', detail: 'Reduce swelling by putting your feet up for 15 minutes several times a day.', trimester: [2, 3] },
  { id: '12', category: 'nutrition', tip: 'Don\'t skip breakfast', detail: 'A protein-rich breakfast stabilizes blood sugar and reduces nausea.', trimester: [1] },
  { id: '13', category: 'exercise', tip: 'Practice prenatal yoga', detail: 'Gentle stretching relieves back pain and prepares your body for labor.', trimester: [1, 2, 3] },
  { id: '14', category: 'mental', tip: 'Take a tech break', detail: 'Step away from screens for 30 minutes to reduce stress and eye strain.', trimester: [1, 2, 3] },
  { id: '15', category: 'baby', tip: 'Create a nursery playlist', detail: 'Play calming music for baby - they\'ll recognize it after birth!', trimester: [2, 3] },
];

const categoryColors: Record<string, string> = {
  health: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  nutrition: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  exercise: 'bg-primary/10 text-primary',
  mental: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  baby: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
};

export default function AIPregnancyTipsDaily() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentTrimester, setCurrentTrimester] = useState(2);
  const [dailyTip, setDailyTip] = useState<DailyTip | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAITip, setShowAITip] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  
  const { streamChat, isLoading, error } = usePregnancyAI();

  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('tipOfTheDayDate');
    const savedTip = localStorage.getItem('tipOfTheDay');
    
    if (savedDate === today && savedTip) {
      setDailyTip(JSON.parse(savedTip));
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
    const filtered = tips.filter(t => t.trimester.includes(currentTrimester));
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    setDailyTip(random);
    setShowAITip(false);
    
    localStorage.setItem('tipOfTheDayDate', new Date().toDateString());
    localStorage.setItem('tipOfTheDay', JSON.stringify(random));
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

  const filteredTips = tips.filter(t => t.trimester.includes(currentTrimester));

  return (
    <ToolFrame
      title="Daily Pregnancy Tips"
      subtitle="AI-curated tips for each trimester"
      mood="joyful"
      toolId="daily-tips"
      icon={Lightbulb}
    >
      {showDisclaimer && (
        <MedicalDisclaimer
          toolName="Daily Pregnancy Tips"
          onAccept={() => setShowDisclaimer(false)}
        />
      )}

      {!showDisclaimer && (
        <div className="space-y-6">
          {/* Trimester Selection */}
          <div className="flex gap-2">
            {[1, 2, 3].map(t => (
              <Button
                key={t}
                variant={currentTrimester === t ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentTrimester(t)}
                className="flex-1"
              >
                Trimester {t}
              </Button>
            ))}
          </div>

          {/* AI Tip Generator */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Button onClick={getNewTip} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Random Tip
                </Button>
                <Button onClick={generateAITip} disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4 mr-2" />
                  )}
                  AI Tip
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
                  <h3 className="font-semibold">AI-Powered Tip</h3>
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
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Tip of the Day</span>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{dailyTip.tip}</h3>
                <p className="text-muted-foreground mb-4">{dailyTip.detail}</p>
                
                <div className="flex items-center justify-between">
                  <Badge className={categoryColors[dailyTip.category]}>
                    {dailyTip.category}
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
                  Your Favorites ({favorites.length})
                </h3>
                <div className="space-y-2">
                  {tips.filter(t => favorites.includes(t.id)).map(tip => (
                    <div key={tip.id} className="p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium text-sm">{tip.tip}</p>
                      <p className="text-xs text-muted-foreground">{tip.detail}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Tips */}
          <div className="space-y-3">
            <h3 className="font-semibold">More Tips for Trimester {currentTrimester}</h3>
            {filteredTips.map(tip => (
              <Card key={tip.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${categoryColors[tip.category]}`}>
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{tip.tip}</h4>
                      <p className="text-xs text-muted-foreground">{tip.detail}</p>
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
      )}
    </ToolFrame>
  );
}