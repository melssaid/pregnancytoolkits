import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, Shuffle, Heart, AlertCircle, Sparkles } from 'lucide-react';

interface CravingAlternative {
  craving: string;
  icon: string;
  healthyAlternatives: {
    name: string;
    benefit: string;
    icon: string;
  }[];
}

const cravingAlternatives: CravingAlternative[] = [
  {
    craving: 'Ice Cream',
    icon: '🍦',
    healthyAlternatives: [
      { name: 'Greek Yogurt with Berries', benefit: 'Protein + Probiotics', icon: '🫐' },
      { name: 'Frozen Banana "Nice Cream"', benefit: 'Natural sweetness + Potassium', icon: '🍌' },
      { name: 'Coconut Milk Frozen Treat', benefit: 'Healthy fats + Lower sugar', icon: '🥥' },
    ]
  },
  {
    craving: 'Chocolate',
    icon: '🍫',
    healthyAlternatives: [
      { name: 'Dark Chocolate (70%+)', benefit: 'Antioxidants + Lower sugar', icon: '🍫' },
      { name: 'Chocolate Hummus with Fruit', benefit: 'Fiber + Protein', icon: '🍓' },
      { name: 'Cacao Smoothie', benefit: 'Iron + Magnesium', icon: '🥤' },
    ]
  },
  {
    craving: 'Chips/Salty Snacks',
    icon: '🥔',
    healthyAlternatives: [
      { name: 'Baked Veggie Chips', benefit: 'Vitamins + Lower fat', icon: '🥕' },
      { name: 'Popcorn (air-popped)', benefit: 'Fiber + Whole grain', icon: '🍿' },
      { name: 'Salted Nuts', benefit: 'Protein + Healthy fats', icon: '🥜' },
    ]
  },
  {
    craving: 'Soda/Sweet Drinks',
    icon: '🥤',
    healthyAlternatives: [
      { name: 'Sparkling Water with Fruit', benefit: 'Hydration + No sugar', icon: '💧' },
      { name: 'Coconut Water', benefit: 'Electrolytes + Potassium', icon: '🥥' },
      { name: 'Fruit-Infused Water', benefit: 'Vitamins + Natural flavor', icon: '🍋' },
    ]
  },
  {
    craving: 'French Fries',
    icon: '🍟',
    healthyAlternatives: [
      { name: 'Baked Sweet Potato Fries', benefit: 'Vitamin A + Fiber', icon: '🍠' },
      { name: 'Roasted Chickpeas', benefit: 'Protein + Fiber', icon: '🫘' },
      { name: 'Zucchini Fries (baked)', benefit: 'Low calorie + Vitamins', icon: '🥒' },
    ]
  },
  {
    craving: 'Candy',
    icon: '🍬',
    healthyAlternatives: [
      { name: 'Dried Fruit (no added sugar)', benefit: 'Natural sweetness + Fiber', icon: '🍇' },
      { name: 'Fresh Fruit', benefit: 'Vitamins + Hydration', icon: '🍎' },
      { name: 'Frozen Grapes', benefit: 'Sweet treat + Antioxidants', icon: '🍇' },
    ]
  },
  {
    craving: 'Pizza',
    icon: '🍕',
    healthyAlternatives: [
      { name: 'Whole Wheat Pita Pizza', benefit: 'Fiber + Lower carbs', icon: '🫓' },
      { name: 'Cauliflower Crust Pizza', benefit: 'Vegetables + Lower carbs', icon: '🥦' },
      { name: 'Portobello Mushroom Pizza', benefit: 'Low calorie + Vitamins', icon: '🍄' },
    ]
  },
  {
    craving: 'Cookies',
    icon: '🍪',
    healthyAlternatives: [
      { name: 'Oatmeal Energy Balls', benefit: 'Fiber + Energy', icon: '🥣' },
      { name: 'Banana Oat Cookies', benefit: 'Natural sweetness + Potassium', icon: '🍌' },
      { name: 'Almond Flour Cookies', benefit: 'Protein + Lower carbs', icon: '🥜' },
    ]
  },
];

export default function AICravingAlternatives() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCraving, setSelectedCraving] = useState<CravingAlternative | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cravingFavorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('cravingFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (name: string) => {
    if (favorites.includes(name)) {
      setFavorites(favorites.filter(f => f !== name));
    } else {
      setFavorites([...favorites, name]);
    }
  };

  const getRandomCraving = () => {
    const random = cravingAlternatives[Math.floor(Math.random() * cravingAlternatives.length)];
    setSelectedCraving(random);
  };

  return (
    <ToolFrame
      title="AI Craving Alternatives"
      subtitle="Healthy swaps for your pregnancy cravings"
      icon={UtensilsCrossed}
      mood="joyful"
      toolId="ai-craving-alternatives"
    >
      <div className="space-y-6">
        {/* Random Craving Button */}
        <Button onClick={getRandomCraving} className="w-full gap-2" variant="outline">
          <Shuffle className="w-4 h-4" />
          Random Craving Swap
        </Button>

        {/* Selected Craving Detail */}
        {selectedCraving && (
          <Card className="border-2 border-primary">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <span className="text-5xl">{selectedCraving.icon}</span>
                <h3 className="text-xl font-bold mt-2">Craving {selectedCraving.craving}?</h3>
                <p className="text-sm text-muted-foreground">Try these healthy alternatives:</p>
              </div>
              <div className="space-y-3">
                {selectedCraving.healthyAlternatives.map((alt, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{alt.icon}</span>
                      <div>
                        <p className="font-medium">{alt.name}</p>
                        <p className="text-xs text-muted-foreground">{alt.benefit}</p>
                      </div>
                    </div>
                    <button onClick={() => toggleFavorite(alt.name)}>
                      <Heart 
                        className={`w-5 h-5 ${
                          favorites.includes(alt.name) 
                            ? 'text-primary fill-primary' 
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Cravings Grid */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Common Pregnancy Cravings
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {cravingAlternatives.map((craving) => (
                <button
                  key={craving.craving}
                  onClick={() => setSelectedCraving(craving)}
                  className={`p-4 rounded-lg text-center transition-all ${
                    selectedCraving?.craving === craving.craving
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <span className="text-3xl block mb-1">{craving.icon}</span>
                  <span className="text-xs">{craving.craving}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Favorites */}
        {favorites.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary fill-primary" />
                Your Favorite Swaps
              </h3>
              <div className="flex flex-wrap gap-2">
                {favorites.map((fav) => (
                  <span
                    key={fav}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {fav}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                These are general healthy alternatives. If you have specific dietary restrictions 
                or conditions like gestational diabetes, consult your healthcare provider for 
                personalized advice.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
