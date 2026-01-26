import React, { useState } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cookie, Clock, Zap, Heart, Brain, Apple, RefreshCw } from 'lucide-react';

interface Snack {
  id: string;
  name: string;
  calories: number;
  prepTime: string;
  benefit: string;
  ingredients: string[];
  recipe?: string;
  nutrients: string[];
  category: 'energy' | 'protein' | 'comfort' | 'quick';
}

const snacks: Snack[] = [
  {
    id: '1',
    name: 'Apple with Almond Butter',
    calories: 200,
    prepTime: '2 min',
    benefit: 'Sustained energy from fiber and healthy fats',
    ingredients: ['1 medium apple', '2 tbsp almond butter'],
    nutrients: ['Fiber', 'Healthy Fats', 'Vitamin E'],
    category: 'quick'
  },
  {
    id: '2',
    name: 'Greek Yogurt Parfait',
    calories: 250,
    prepTime: '5 min',
    benefit: 'Protein and probiotics for gut health',
    ingredients: ['1 cup Greek yogurt', '1/4 cup granola', '1/2 cup berries', 'Honey drizzle'],
    recipe: 'Layer yogurt, granola, and berries. Drizzle with honey.',
    nutrients: ['Protein', 'Calcium', 'Probiotics'],
    category: 'protein'
  },
  {
    id: '3',
    name: 'Trail Mix Power Bites',
    calories: 180,
    prepTime: '1 min',
    benefit: 'Quick energy boost anytime',
    ingredients: ['Mixed nuts', 'Dark chocolate chips', 'Dried cranberries'],
    nutrients: ['Iron', 'Omega-3', 'Antioxidants'],
    category: 'energy'
  },
  {
    id: '4',
    name: 'Avocado Toast',
    calories: 280,
    prepTime: '5 min',
    benefit: 'Healthy fats for baby brain development',
    ingredients: ['1 slice whole grain bread', '1/2 avocado', 'Salt', 'Everything bagel seasoning'],
    recipe: 'Toast bread, mash avocado on top, season to taste.',
    nutrients: ['Folate', 'Healthy Fats', 'Fiber'],
    category: 'comfort'
  },
  {
    id: '5',
    name: 'Hummus & Veggie Sticks',
    calories: 150,
    prepTime: '3 min',
    benefit: 'Fiber and plant protein',
    ingredients: ['1/4 cup hummus', 'Carrot sticks', 'Cucumber slices', 'Bell pepper strips'],
    nutrients: ['Fiber', 'Vitamin A', 'Protein'],
    category: 'quick'
  },
  {
    id: '6',
    name: 'Cheese & Crackers',
    calories: 220,
    prepTime: '2 min',
    benefit: 'Calcium and protein combo',
    ingredients: ['4 whole grain crackers', '2 oz cheddar cheese'],
    nutrients: ['Calcium', 'Protein', 'Vitamin D'],
    category: 'quick'
  },
  {
    id: '7',
    name: 'Banana Energy Bites',
    calories: 160,
    prepTime: '10 min',
    benefit: 'Natural energy from potassium',
    ingredients: ['1 banana', '1 cup oats', '2 tbsp peanut butter', '1 tbsp honey'],
    recipe: 'Mash banana, mix all ingredients, roll into balls, refrigerate.',
    nutrients: ['Potassium', 'Fiber', 'B Vitamins'],
    category: 'energy'
  },
  {
    id: '8',
    name: 'Cottage Cheese Bowl',
    calories: 180,
    prepTime: '3 min',
    benefit: 'High protein for muscle and baby growth',
    ingredients: ['1 cup cottage cheese', 'Pineapple chunks', 'Walnuts'],
    nutrients: ['Protein', 'Calcium', 'Omega-3'],
    category: 'protein'
  }
];

const categoryColors: Record<string, string> = {
  energy: 'bg-amber-100 text-amber-700',
  protein: 'bg-primary/10 text-primary',
  comfort: 'bg-rose-100 text-rose-700',
  quick: 'bg-emerald-100 text-emerald-700'
};

const categoryIcons: Record<string, React.ElementType> = {
  energy: Zap,
  protein: Heart,
  comfort: Cookie,
  quick: Clock
};

export default function SmartSnackPlanner() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'energy' | 'protein' | 'comfort' | 'quick'>('all');
  const [randomSnack, setRandomSnack] = useState<Snack | null>(null);

  const getRandomSnack = () => {
    const filtered = selectedCategory === 'all' ? snacks : snacks.filter(s => s.category === selectedCategory);
    setRandomSnack(filtered[Math.floor(Math.random() * filtered.length)]);
  };

  const filteredSnacks = selectedCategory === 'all' 
    ? snacks 
    : snacks.filter(s => s.category === selectedCategory);

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName="Smart Snack Planner"
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title="Smart Snack Planner"
      subtitle="Healthy pregnancy snack ideas"
      mood="joyful"
      toolId="snack-planner"
      icon={Cookie}
    >
      <div className="space-y-6">
          {/* Random Generator */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-6 text-center">
              <Apple className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Feeling Hungry?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Let AI pick a perfect snack for you
              </p>
              <Button onClick={getRandomSnack} className="rounded-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Surprise Me!
              </Button>
            </CardContent>
          </Card>

          {/* Random Result */}
          {randomSnack && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{randomSnack.name}</h3>
                  <Badge className={categoryColors[randomSnack.category]}>
                    {randomSnack.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{randomSnack.benefit}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-background rounded-lg p-3 text-center">
                    <span className="text-lg font-bold text-primary">{randomSnack.calories}</span>
                    <span className="text-xs text-muted-foreground block">calories</span>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <span className="text-lg font-bold text-primary">{randomSnack.prepTime}</span>
                    <span className="text-xs text-muted-foreground block">prep time</span>
                  </div>
                </div>

                <div className="mb-3">
                  <h4 className="text-sm font-medium mb-2">Ingredients:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {randomSnack.ingredients.map((ing, i) => (
                      <li key={i}>• {ing}</li>
                    ))}
                  </ul>
                </div>

                {randomSnack.recipe && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <h4 className="text-sm font-medium mb-1">How to make:</h4>
                    <p className="text-sm text-muted-foreground">{randomSnack.recipe}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['all', 'quick', 'energy', 'protein', 'comfort'] as const).map(cat => {
              const Icon = cat !== 'all' ? categoryIcons[cat] : Brain;
              return (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="capitalize whitespace-nowrap"
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {cat}
                </Button>
              );
            })}
          </div>

          {/* Snack List */}
          <div className="space-y-3">
            {filteredSnacks.map(snack => {
              const Icon = categoryIcons[snack.category];
              return (
                <Card key={snack.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${categoryColors[snack.category]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{snack.name}</h4>
                          <span className="text-xs text-muted-foreground">{snack.calories} cal</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{snack.benefit}</p>
                        <div className="flex flex-wrap gap-1">
                          {snack.nutrients.map((n, i) => (
                            <Badge key={i} variant="outline" className="text-xs py-0">
                              {n}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

        {/* Tips */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">💡 Snacking Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Eat every 2-3 hours to maintain energy</li>
              <li>• Keep snacks by your bedside for morning sickness</li>
              <li>• Stay hydrated between snacks</li>
              <li>• Listen to your cravings but balance with nutrition</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
