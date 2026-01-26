import React, { useState } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Check, Star, Filter, Baby, ShoppingBag, Home, Car, Heart } from 'lucide-react';

interface GearItem {
  id: string;
  name: string;
  category: 'essential' | 'recommended' | 'nice-to-have';
  type: 'feeding' | 'sleeping' | 'travel' | 'clothing' | 'health' | 'nursery';
  description: string;
  priceRange: '$' | '$$' | '$$$';
  tips: string;
  whenNeeded: string;
}

const gearList: GearItem[] = [
  {
    id: '1',
    name: 'Car Seat (Infant)',
    category: 'essential',
    type: 'travel',
    description: 'Required for bringing baby home from hospital',
    priceRange: '$$',
    tips: 'Look for one that clicks into a stroller. Check expiration dates.',
    whenNeeded: 'Before birth'
  },
  {
    id: '2',
    name: 'Crib or Bassinet',
    category: 'essential',
    type: 'sleeping',
    description: 'Safe sleep surface for baby',
    priceRange: '$$',
    tips: 'Ensure it meets current safety standards. Firm mattress only.',
    whenNeeded: 'Before birth'
  },
  {
    id: '3',
    name: 'Diapers (Newborn size)',
    category: 'essential',
    type: 'health',
    description: 'Stock up on newborn and size 1',
    priceRange: '$',
    tips: 'Don\'t buy too many newborn size - babies grow fast!',
    whenNeeded: 'Before birth'
  },
  {
    id: '4',
    name: 'Baby Bottles',
    category: 'essential',
    type: 'feeding',
    description: 'Even breastfeeding moms often need bottles',
    priceRange: '$',
    tips: 'Start with slow-flow nipples. Get 4-6 bottles initially.',
    whenNeeded: 'Before birth'
  },
  {
    id: '5',
    name: 'Onesies (0-3 months)',
    category: 'essential',
    type: 'clothing',
    description: 'Basic everyday wear for baby',
    priceRange: '$',
    tips: 'Look for front snaps or zippers for easy diaper changes.',
    whenNeeded: 'Before birth'
  },
  {
    id: '6',
    name: 'Stroller',
    category: 'recommended',
    type: 'travel',
    description: 'For walks and outings',
    priceRange: '$$',
    tips: 'Consider one that accepts your car seat for easier transitions.',
    whenNeeded: 'First few weeks'
  },
  {
    id: '7',
    name: 'Baby Monitor',
    category: 'recommended',
    type: 'nursery',
    description: 'Peace of mind while baby sleeps',
    priceRange: '$$',
    tips: 'Audio-only is often sufficient. Video adds convenience.',
    whenNeeded: 'First few weeks'
  },
  {
    id: '8',
    name: 'Breast Pump',
    category: 'recommended',
    type: 'feeding',
    description: 'For breastfeeding moms returning to work',
    priceRange: '$$',
    tips: 'Insurance often covers this. Check before buying.',
    whenNeeded: 'After birth'
  },
  {
    id: '9',
    name: 'Baby Swing',
    category: 'nice-to-have',
    type: 'nursery',
    description: 'Soothing motion for fussy babies',
    priceRange: '$$',
    tips: 'Some babies love them, others don\'t. Consider borrowing first.',
    whenNeeded: 'First month'
  },
  {
    id: '10',
    name: 'Diaper Bag',
    category: 'recommended',
    type: 'travel',
    description: 'For outings with baby',
    priceRange: '$',
    tips: 'Look for one with changing pad and multiple compartments.',
    whenNeeded: 'After birth'
  },
  {
    id: '11',
    name: 'Baby Bathtub',
    category: 'recommended',
    type: 'health',
    description: 'Makes bathing easier and safer',
    priceRange: '$',
    tips: 'The sink works fine too for newborns.',
    whenNeeded: 'First few weeks'
  },
  {
    id: '12',
    name: 'Swaddle Blankets',
    category: 'essential',
    type: 'sleeping',
    description: 'Helps newborns feel secure',
    priceRange: '$',
    tips: 'Muslin ones are breathable and versatile.',
    whenNeeded: 'Before birth'
  }
];

const typeIcons: Record<string, React.ElementType> = {
  feeding: Baby,
  sleeping: Home,
  travel: Car,
  clothing: ShoppingBag,
  health: Heart,
  nursery: Home
};

export default function BabyGearRecommender() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'essential' | 'recommended' | 'nice-to-have'>('all');
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setCheckedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredGear = gearList.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'essential': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'recommended': return 'bg-primary/10 text-primary border-primary/20';
      case 'nice-to-have': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getProgress = () => {
    const essentials = gearList.filter(i => i.category === 'essential');
    const checkedEssentials = essentials.filter(i => checkedItems.includes(i.id));
    return Math.round((checkedEssentials.length / essentials.length) * 100);
  };

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName="Baby Gear Recommender"
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title="Baby Gear Recommender"
      subtitle="Essential items checklist for your new arrival"
      mood="joyful"
      toolId="baby-gear"
      icon={Package}
    >
      <div className="space-y-6">
          {/* Progress */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Essentials Progress</h3>
                <span className="text-2xl font-bold text-primary">{getProgress()}%</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {checkedItems.length} of {gearList.length} items checked
              </p>
            </CardContent>
          </Card>

          {/* Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['all', 'essential', 'recommended', 'nice-to-have'] as const).map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="capitalize whitespace-nowrap"
              >
                {cat === 'all' ? 'All Items' : cat.replace('-', ' ')}
              </Button>
            ))}
          </div>

          {/* Gear List */}
          <div className="space-y-4">
            {filteredGear.map(item => {
              const TypeIcon = typeIcons[item.type] || Package;
              return (
                <Card 
                  key={item.id}
                  className={`transition-all ${checkedItems.includes(item.id) ? 'bg-muted/50 border-primary/30' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
                          checkedItems.includes(item.id) 
                            ? 'bg-primary border-primary text-primary-foreground' 
                            : 'border-muted-foreground hover:border-primary'
                        }`}
                      >
                        {checkedItems.includes(item.id) && <Check className="w-4 h-4" />}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <TypeIcon className="w-4 h-4 text-primary" />
                            <h4 className={`font-semibold ${checkedItems.includes(item.id) ? 'line-through text-muted-foreground' : ''}`}>
                              {item.name}
                            </h4>
                          </div>
                          <Badge className={getCategoryColor(item.category)}>
                            {item.category}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {item.priceRange}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.whenNeeded}
                          </Badge>
                        </div>
                        
                        <div className="bg-muted/50 rounded-lg p-3 mt-2">
                          <p className="text-xs text-muted-foreground">
                            <Star className="w-3 h-3 inline mr-1 text-amber-500" />
                            <strong>Tip:</strong> {item.tips}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Shopping Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-destructive/5 rounded-lg">
                  <div className="text-2xl font-bold text-destructive">
                    {gearList.filter(i => i.category === 'essential').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Essential</div>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {gearList.filter(i => i.category === 'recommended').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Recommended</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-muted-foreground">
                    {gearList.filter(i => i.category === 'nice-to-have').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Nice to Have</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">
              💡 This is a general guide. Your specific needs may vary. 
              Consider borrowing or buying secondhand for items used briefly.
          </p>
        </div>
      </div>
    </ToolFrame>
  );
}
