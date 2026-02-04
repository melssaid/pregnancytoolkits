import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CupSoda, Sparkles, RefreshCw, Heart, Zap, Moon, Sun, Brain, Loader2 } from 'lucide-react';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface Smoothie {
  id: string;
  name: string;
  benefit: string;
  icon: React.ElementType;
  ingredients: string[];
  instructions: string;
  nutrients: { name: string; value: string }[];
  trimester: number[];
}

const smoothieData = [
  {
    id: '1',
    nameKey: 'morningEnergy',
    benefitKey: 'fightsFatigue',
    icon: Sun,
    ingredientKeys: ['1banana', '1cupSpinach', 'halfCupGreekYogurt', '1tbspAlmondButter', '1cupAlmondMilk', '1tbspHoney'],
    instructionsKey: 'morningEnergyInstructions',
    nutrients: [
      { name: 'Folate', value: '25% DV' },
      { name: 'Iron', value: '15% DV' },
      { name: 'Protein', value: '12g' },
      { name: 'Calcium', value: '20% DV' }
    ],
    trimester: [1, 2, 3]
  },
  {
    id: '2',
    nameKey: 'ironPower',
    benefitKey: 'boostsIron',
    icon: Heart,
    ingredientKeys: ['1cupStrawberries', 'halfCupBeets', '1orange', 'halfCupPomegranate', '1tbspChiaSeeds'],
    instructionsKey: 'ironPowerInstructions',
    nutrients: [
      { name: 'Iron', value: '30% DV' },
      { name: 'Vitamin C', value: '100% DV' },
      { name: 'Fiber', value: '8g' }
    ],
    trimester: [2, 3]
  },
  {
    id: '3',
    nameKey: 'sleepBetter',
    benefitKey: 'promotesSleep',
    icon: Moon,
    ingredientKeys: ['1banana', '1cupCherries', 'halfCupMilk', '1tbspHoney', 'quarterTspCinnamon', '1tbspOats'],
    instructionsKey: 'sleepBetterInstructions',
    nutrients: [
      { name: 'Melatonin', value: 'Natural' },
      { name: 'Magnesium', value: '15% DV' },
      { name: 'Potassium', value: '20% DV' }
    ],
    trimester: [1, 2, 3]
  },
  {
    id: '4',
    nameKey: 'nauseaRelief',
    benefitKey: 'calmsNausea',
    icon: Zap,
    ingredientKeys: ['halfCucumber', '1greenApple', '1inchGinger', 'halfLemon', '1cupCoconutWater', 'freshMint'],
    instructionsKey: 'nauseaReliefInstructions',
    nutrients: [
      { name: 'Electrolytes', value: 'High' },
      { name: 'Vitamin K', value: '25% DV' },
      { name: 'Hydration', value: 'Excellent' }
    ],
    trimester: [1]
  },
  {
    id: '5',
    nameKey: 'brainBuilder',
    benefitKey: 'brainDev',
    icon: Sparkles,
    ingredientKeys: ['1cupBlueberries', 'quarterAvocado', '1tbspFlaxseed', '1tbspWalnuts', '1cupMilk', '1tbspMapleSyrup'],
    instructionsKey: 'brainBuilderInstructions',
    nutrients: [
      { name: 'Omega-3', value: '1.5g' },
      { name: 'DHA', value: '200mg' },
      { name: 'Antioxidants', value: 'High' }
    ],
    trimester: [2, 3]
  },
  {
    id: '6',
    nameKey: 'calciumCrush',
    benefitKey: 'strengthensBones',
    icon: Heart,
    ingredientKeys: ['1cupGreekYogurt', '1banana', '2tbspAlmondButter', '1cupFortifiedAlmondMilk', '1tbspSesameSeeds', 'honeyToTaste'],
    instructionsKey: 'calciumCrushInstructions',
    nutrients: [
      { name: 'Calcium', value: '45% DV' },
      { name: 'Protein', value: '18g' },
      { name: 'Vitamin D', value: '15% DV' }
    ],
    trimester: [1, 2, 3]
  }
];

export default function PregnancySmoothieAI() {
  const { t } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [selectedTrimester, setSelectedTrimester] = useState(2);
  const [currentSmoothie, setCurrentSmoothie] = useState<typeof smoothieData[0] | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAIRecipe, setShowAIRecipe] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [preference, setPreference] = useState('');
  
  const { streamChat, isLoading, error } = usePregnancyAI();

  const getRandomSmoothie = () => {
    const filtered = smoothieData.filter(s => s.trimester.includes(selectedTrimester));
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    setCurrentSmoothie(random);
    setShowAIRecipe(false);
  };

  const generateAISmoothie = async () => {
    setShowAIRecipe(true);
    setAiResponse('');
    setCurrentSmoothie(null);

    await streamChat({
      type: 'smoothie-generator' as any,
      messages: [
        {
          role: 'user',
          content: `I'm in trimester ${selectedTrimester} of my pregnancy. ${preference ? `I prefer: ${preference}.` : ''} Create a unique, delicious, and nutritious smoothie recipe perfect for this stage.`
        }
      ],
      context: { trimester: selectedTrimester },
      onDelta: (text) => setAiResponse(prev => prev + text),
      onDone: () => {}
    });
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const filteredSmoothies = smoothieData.filter(s => s.trimester.includes(selectedTrimester));

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName={t('smoothieAI.title')}
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title={t('smoothieAI.title')}
      subtitle={t('smoothieAI.subtitle')}
      mood="joyful"
      toolId="smoothie-ai"
      icon={CupSoda}
    >
        <div className="space-y-6">
          {/* Trimester Selection */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">{t('smoothieAI.selectTrimester')}</h3>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(tri => (
                  <Button
                    key={tri}
                    variant={selectedTrimester === tri ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedTrimester(tri);
                      setCurrentSmoothie(null);
                      setShowAIRecipe(false);
                    }}
                  >
                    {t('smoothieAI.trimester')} {tri}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Generator */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-3">{t('smoothieAI.createCustom')}</h3>
              <input
                type="text"
                placeholder={t('smoothieAI.preferencePlaceholder')}
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
                className="w-full p-2 mb-3 rounded-lg border border-border bg-background text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={getRandomSmoothie} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('smoothieAI.randomRecipe')}
                </Button>
                <Button onClick={generateAISmoothie} disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4 mr-2" />
                  )}
                  {t('smoothieAI.aiGenerate')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Generated Recipe */}
          {showAIRecipe && aiResponse && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{t('smoothieAI.aiGeneratedRecipe')}</h3>
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

          {/* Current Smoothie */}
          {currentSmoothie && (
            <Card className="border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <currentSmoothie.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{t(`smoothieAI.smoothies.${currentSmoothie.nameKey}`)}</h3>
                      <p className="text-sm text-muted-foreground">{t(`smoothieAI.benefits.${currentSmoothie.benefitKey}`)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(currentSmoothie.id)}
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(currentSmoothie.id) ? 'fill-primary text-primary' : ''}`} />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{t('smoothieAI.ingredients')}:</h4>
                    <ul className="space-y-1">
                      {currentSmoothie.ingredientKeys.map((ing, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">{t('smoothieAI.instructions')}:</h4>
                    <p className="text-sm text-muted-foreground">{currentSmoothie.instructionsKey}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">{t('smoothieAI.nutrition')}:</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentSmoothie.nutrients.map((n, i) => (
                        <Badge key={i} variant="secondary">
                          {n.name}: {n.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Recipes */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('smoothieAI.allRecipes', { trimester: selectedTrimester })}</h3>
            {filteredSmoothies.map(smoothie => (
              <Card 
                key={smoothie.id}
                className="cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => {
                  setCurrentSmoothie(smoothie);
                  setShowAIRecipe(false);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <smoothie.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{t(`smoothieAI.smoothies.${smoothie.nameKey}`)}</h4>
                      <p className="text-xs text-muted-foreground">{t(`smoothieAI.benefits.${smoothie.benefitKey}`)}</p>
                    </div>
                    {favorites.includes(smoothie.id) && (
                      <Heart className="w-4 h-4 fill-primary text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
    </ToolFrame>
  );
}