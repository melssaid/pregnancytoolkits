import React, { useState } from 'react';
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

const smoothies: Smoothie[] = [
  {
    id: '1',
    name: 'Morning Energy Boost',
    benefit: 'Fights fatigue and provides sustained energy',
    icon: Sun,
    ingredients: ['1 banana', '1 cup spinach', '1/2 cup Greek yogurt', '1 tbsp almond butter', '1 cup almond milk', '1 tbsp honey'],
    instructions: 'Blend all ingredients until smooth. Add ice for a colder smoothie.',
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
    name: 'Iron Power Blend',
    benefit: 'Boosts iron levels and prevents anemia',
    icon: Heart,
    ingredients: ['1 cup strawberries', '1/2 cup beets (cooked)', '1 orange', '1/2 cup pomegranate juice', '1 tbsp chia seeds'],
    instructions: 'Blend beets first with juice, then add remaining ingredients.',
    nutrients: [
      { name: 'Iron', value: '30% DV' },
      { name: 'Vitamin C', value: '100% DV' },
      { name: 'Fiber', value: '8g' }
    ],
    trimester: [2, 3]
  },
  {
    id: '3',
    name: 'Sleep Better Smoothie',
    benefit: 'Promotes relaxation and better sleep',
    icon: Moon,
    ingredients: ['1 banana', '1 cup cherries', '1/2 cup milk', '1 tbsp honey', '1/4 tsp cinnamon', '1 tbsp oats'],
    instructions: 'Blend until smooth. Best consumed 1 hour before bed.',
    nutrients: [
      { name: 'Melatonin', value: 'Natural' },
      { name: 'Magnesium', value: '15% DV' },
      { name: 'Potassium', value: '20% DV' }
    ],
    trimester: [1, 2, 3]
  },
  {
    id: '4',
    name: 'Nausea Relief Green',
    benefit: 'Helps calm morning sickness',
    icon: Zap,
    ingredients: ['1/2 cucumber', '1 green apple', '1 inch fresh ginger', '1/2 lemon (juiced)', '1 cup coconut water', 'Fresh mint leaves'],
    instructions: 'Blend ginger with coconut water first, then add remaining ingredients.',
    nutrients: [
      { name: 'Electrolytes', value: 'High' },
      { name: 'Vitamin K', value: '25% DV' },
      { name: 'Hydration', value: 'Excellent' }
    ],
    trimester: [1]
  },
  {
    id: '5',
    name: 'Brain Builder Blend',
    benefit: 'Supports baby brain development with Omega-3s',
    icon: Sparkles,
    ingredients: ['1 cup blueberries', '1/4 avocado', '1 tbsp flaxseed', '1 tbsp walnuts', '1 cup milk', '1 tbsp maple syrup'],
    instructions: 'Blend walnuts and flaxseed first, then add remaining ingredients.',
    nutrients: [
      { name: 'Omega-3', value: '1.5g' },
      { name: 'DHA', value: '200mg' },
      { name: 'Antioxidants', value: 'High' }
    ],
    trimester: [2, 3]
  },
  {
    id: '6',
    name: 'Calcium Crush',
    benefit: 'Strengthens bones for you and baby',
    icon: Heart,
    ingredients: ['1 cup Greek yogurt', '1 banana', '2 tbsp almond butter', '1 cup fortified almond milk', '1 tbsp sesame seeds', 'Honey to taste'],
    instructions: 'Blend all ingredients until creamy smooth.',
    nutrients: [
      { name: 'Calcium', value: '45% DV' },
      { name: 'Protein', value: '18g' },
      { name: 'Vitamin D', value: '15% DV' }
    ],
    trimester: [1, 2, 3]
  }
];

export default function PregnancySmoothieAI() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [selectedTrimester, setSelectedTrimester] = useState(2);
  const [currentSmoothie, setCurrentSmoothie] = useState<Smoothie | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAIRecipe, setShowAIRecipe] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [preference, setPreference] = useState('');
  
  const { streamChat, isLoading, error } = usePregnancyAI();

  const getRandomSmoothie = () => {
    const filtered = smoothies.filter(s => s.trimester.includes(selectedTrimester));
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

  const filteredSmoothies = smoothies.filter(s => s.trimester.includes(selectedTrimester));

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName="Pregnancy Smoothie AI"
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title="Pregnancy Smoothie AI"
      subtitle="Nutritious smoothie recipes for each trimester"
      mood="joyful"
      toolId="smoothie-ai"
      icon={CupSoda}
    >
        <div className="space-y-6">
          {/* Trimester Selection */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Select Your Trimester</h3>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(t => (
                  <Button
                    key={t}
                    variant={selectedTrimester === t ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedTrimester(t);
                      setCurrentSmoothie(null);
                      setShowAIRecipe(false);
                    }}
                  >
                    Trimester {t}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Generator */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-3">Create a Custom AI Smoothie</h3>
              <input
                type="text"
                placeholder="Any preferences? (e.g., high protein, low sugar)"
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
                className="w-full p-2 mb-3 rounded-lg border border-border bg-background text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={getRandomSmoothie} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Random Recipe
                </Button>
                <Button onClick={generateAISmoothie} disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4 mr-2" />
                  )}
                  AI Generate
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
                  <h3 className="font-semibold">AI-Generated Recipe</h3>
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
                      <h3 className="font-bold text-lg">{currentSmoothie.name}</h3>
                      <p className="text-sm text-muted-foreground">{currentSmoothie.benefit}</p>
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
                    <h4 className="font-medium mb-2">Ingredients:</h4>
                    <ul className="space-y-1">
                      {currentSmoothie.ingredients.map((ing, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Instructions:</h4>
                    <p className="text-sm text-muted-foreground">{currentSmoothie.instructions}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Nutrition:</h4>
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
            <h3 className="font-semibold">All Recipes for Trimester {selectedTrimester}</h3>
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
                      <h4 className="font-medium">{smoothie.name}</h4>
                      <p className="text-xs text-muted-foreground">{smoothie.benefit}</p>
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