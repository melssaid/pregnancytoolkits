import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Check, Star, Filter, Baby, ShoppingBag, Home, Car, Heart } from 'lucide-react';

interface GearItem {
  id: string;
  nameKey: string;
  category: 'essential' | 'recommended' | 'nice-to-have';
  type: 'feeding' | 'sleeping' | 'travel' | 'clothing' | 'health' | 'nursery';
  descriptionKey: string;
  priceRange: '$' | '$$' | '$$$';
  tipsKey: string;
  whenNeededKey: string;
}

const gearList: GearItem[] = [
  { id: '1', nameKey: 'babyGear.items.carSeat.name', category: 'essential', type: 'travel', descriptionKey: 'babyGear.items.carSeat.description', priceRange: '$$', tipsKey: 'babyGear.items.carSeat.tips', whenNeededKey: 'babyGear.whenNeeded.beforeBirth' },
  { id: '2', nameKey: 'babyGear.items.crib.name', category: 'essential', type: 'sleeping', descriptionKey: 'babyGear.items.crib.description', priceRange: '$$', tipsKey: 'babyGear.items.crib.tips', whenNeededKey: 'babyGear.whenNeeded.beforeBirth' },
  { id: '3', nameKey: 'babyGear.items.diapers.name', category: 'essential', type: 'health', descriptionKey: 'babyGear.items.diapers.description', priceRange: '$', tipsKey: 'babyGear.items.diapers.tips', whenNeededKey: 'babyGear.whenNeeded.beforeBirth' },
  { id: '4', nameKey: 'babyGear.items.bottles.name', category: 'essential', type: 'feeding', descriptionKey: 'babyGear.items.bottles.description', priceRange: '$', tipsKey: 'babyGear.items.bottles.tips', whenNeededKey: 'babyGear.whenNeeded.beforeBirth' },
  { id: '5', nameKey: 'babyGear.items.onesies.name', category: 'essential', type: 'clothing', descriptionKey: 'babyGear.items.onesies.description', priceRange: '$', tipsKey: 'babyGear.items.onesies.tips', whenNeededKey: 'babyGear.whenNeeded.beforeBirth' },
  { id: '6', nameKey: 'babyGear.items.stroller.name', category: 'recommended', type: 'travel', descriptionKey: 'babyGear.items.stroller.description', priceRange: '$$', tipsKey: 'babyGear.items.stroller.tips', whenNeededKey: 'babyGear.whenNeeded.firstWeeks' },
  { id: '7', nameKey: 'babyGear.items.monitor.name', category: 'recommended', type: 'nursery', descriptionKey: 'babyGear.items.monitor.description', priceRange: '$$', tipsKey: 'babyGear.items.monitor.tips', whenNeededKey: 'babyGear.whenNeeded.firstWeeks' },
  { id: '8', nameKey: 'babyGear.items.breastPump.name', category: 'recommended', type: 'feeding', descriptionKey: 'babyGear.items.breastPump.description', priceRange: '$$', tipsKey: 'babyGear.items.breastPump.tips', whenNeededKey: 'babyGear.whenNeeded.afterBirth' },
  { id: '9', nameKey: 'babyGear.items.swing.name', category: 'nice-to-have', type: 'nursery', descriptionKey: 'babyGear.items.swing.description', priceRange: '$$', tipsKey: 'babyGear.items.swing.tips', whenNeededKey: 'babyGear.whenNeeded.firstMonth' },
  { id: '10', nameKey: 'babyGear.items.diaperBag.name', category: 'recommended', type: 'travel', descriptionKey: 'babyGear.items.diaperBag.description', priceRange: '$', tipsKey: 'babyGear.items.diaperBag.tips', whenNeededKey: 'babyGear.whenNeeded.afterBirth' },
  { id: '11', nameKey: 'babyGear.items.bathtub.name', category: 'recommended', type: 'health', descriptionKey: 'babyGear.items.bathtub.description', priceRange: '$', tipsKey: 'babyGear.items.bathtub.tips', whenNeededKey: 'babyGear.whenNeeded.firstWeeks' },
  { id: '12', nameKey: 'babyGear.items.swaddles.name', category: 'essential', type: 'sleeping', descriptionKey: 'babyGear.items.swaddles.description', priceRange: '$', tipsKey: 'babyGear.items.swaddles.tips', whenNeededKey: 'babyGear.whenNeeded.beforeBirth' }
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
  const { t } = useTranslation();
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
        toolName={t('babyGear.title')}
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title={t('babyGear.title')}
      subtitle={t('babyGear.subtitle')}
      mood="joyful"
      toolId="baby-gear"
      icon={Package}
    >
      <div className="space-y-6">
          {/* Progress */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{t('babyGear.essentialsProgress')}</h3>
                <span className="text-2xl font-bold text-primary">{getProgress()}%</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {t('babyGear.itemsChecked', { checked: checkedItems.length, total: gearList.length })}
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
                {t(`babyGear.filters.${cat === 'nice-to-have' ? 'niceToHave' : cat}`)}
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
                              {t(item.nameKey)}
                            </h4>
                          </div>
                          <Badge className={getCategoryColor(item.category)}>
                            {t(`babyGear.categories.${item.category === 'nice-to-have' ? 'niceToHave' : item.category}`)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">{t(item.descriptionKey)}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {item.priceRange}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {t(item.whenNeededKey)}
                          </Badge>
                        </div>
                        
                        <div className="bg-muted/50 rounded-lg p-3 mt-2">
                          <p className="text-xs text-muted-foreground">
                            <Star className="w-3 h-3 inline mr-1 text-amber-500" />
                            <strong>{t('babyGear.tip')}:</strong> {t(item.tipsKey)}
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
              <h3 className="font-semibold mb-4">{t('babyGear.shoppingSummary')}</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-destructive/5 rounded-lg">
                  <div className="text-2xl font-bold text-destructive">
                    {gearList.filter(i => i.category === 'essential').length}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('babyGear.categories.essential')}</div>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {gearList.filter(i => i.category === 'recommended').length}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('babyGear.categories.recommended')}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-muted-foreground">
                    {gearList.filter(i => i.category === 'nice-to-have').length}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('babyGear.categories.niceToHave')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">
              💡 {t('babyGear.disclaimer')}
          </p>
        </div>
      </div>
    </ToolFrame>
  );
}
