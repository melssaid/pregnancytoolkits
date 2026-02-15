import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Check, Star, Baby, ShoppingBag, Home, Car, Heart, Utensils, Moon, Shirt, Thermometer, RotateCcw } from 'lucide-react';
import { getUserId } from '@/hooks/useSupabase';

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

// Organized logically: essentials first, then by type grouping
const gearList: GearItem[] = [
  // Essential - Travel
  { id: '1', nameKey: 'babyGear.items.carSeat', category: 'essential', type: 'travel', descriptionKey: 'babyGear.descriptions.carSeat', priceRange: '$$', tipsKey: 'babyGear.tips.carSeat', whenNeededKey: 'babyGear.whenNeeded.beforeBirth' },
  // Essential - Sleeping
  { id: '2', nameKey: 'babyGear.items.crib', category: 'essential', type: 'sleeping', descriptionKey: 'babyGear.descriptions.crib', priceRange: '$$', tipsKey: 'babyGear.tips.crib', whenNeededKey: 'babyGear.whenNeeded.beforeBirth' },
  { id: '12', nameKey: 'babyGear.items.swaddles', category: 'essential', type: 'sleeping', descriptionKey: 'babyGear.descriptions.swaddles', priceRange: '$', tipsKey: 'babyGear.tips.swaddles', whenNeededKey: 'babyGear.whenNeeded.beforeBirth' },
  // Essential - Health
  { id: '3', nameKey: 'babyGear.items.diapers', category: 'essential', type: 'health', descriptionKey: 'babyGear.descriptions.diapers', priceRange: '$', tipsKey: 'babyGear.tips.diapers', whenNeededKey: 'babyGear.whenNeeded.beforeBirth' },
  // Essential - Feeding
  { id: '4', nameKey: 'babyGear.items.bottles', category: 'essential', type: 'feeding', descriptionKey: 'babyGear.descriptions.bottles', priceRange: '$', tipsKey: 'babyGear.tips.bottles', whenNeededKey: 'babyGear.whenNeeded.beforeBirth' },
  // Essential - Clothing
  { id: '5', nameKey: 'babyGear.items.onesies', category: 'essential', type: 'clothing', descriptionKey: 'babyGear.descriptions.onesies', priceRange: '$', tipsKey: 'babyGear.tips.onesies', whenNeededKey: 'babyGear.whenNeeded.beforeBirth' },
  // New Essential items
  { id: '13', nameKey: 'babyGear.items.thermometer', category: 'essential', type: 'health', descriptionKey: 'babyGear.descriptions.thermometer', priceRange: '$', tipsKey: 'babyGear.tips.thermometer', whenNeededKey: 'babyGear.whenNeeded.beforeBirth' },
  { id: '14', nameKey: 'babyGear.items.burpCloths', category: 'essential', type: 'feeding', descriptionKey: 'babyGear.descriptions.burpCloths', priceRange: '$', tipsKey: 'babyGear.tips.burpCloths', whenNeededKey: 'babyGear.whenNeeded.beforeBirth' },
  // Recommended
  { id: '6', nameKey: 'babyGear.items.stroller', category: 'recommended', type: 'travel', descriptionKey: 'babyGear.descriptions.stroller', priceRange: '$$', tipsKey: 'babyGear.tips.stroller', whenNeededKey: 'babyGear.whenNeeded.firstWeeks' },
  { id: '7', nameKey: 'babyGear.items.monitor', category: 'recommended', type: 'nursery', descriptionKey: 'babyGear.descriptions.monitor', priceRange: '$$', tipsKey: 'babyGear.tips.monitor', whenNeededKey: 'babyGear.whenNeeded.firstWeeks' },
  { id: '8', nameKey: 'babyGear.items.breastPump', category: 'recommended', type: 'feeding', descriptionKey: 'babyGear.descriptions.breastPump', priceRange: '$$', tipsKey: 'babyGear.tips.breastPump', whenNeededKey: 'babyGear.whenNeeded.afterBirth' },
  { id: '10', nameKey: 'babyGear.items.diaperBag', category: 'recommended', type: 'travel', descriptionKey: 'babyGear.descriptions.diaperBag', priceRange: '$', tipsKey: 'babyGear.tips.diaperBag', whenNeededKey: 'babyGear.whenNeeded.afterBirth' },
  { id: '11', nameKey: 'babyGear.items.bathtub', category: 'recommended', type: 'health', descriptionKey: 'babyGear.descriptions.bathtub', priceRange: '$', tipsKey: 'babyGear.tips.bathtub', whenNeededKey: 'babyGear.whenNeeded.firstWeeks' },
  { id: '15', nameKey: 'babyGear.items.changingPad', category: 'recommended', type: 'nursery', descriptionKey: 'babyGear.descriptions.changingPad', priceRange: '$', tipsKey: 'babyGear.tips.changingPad', whenNeededKey: 'babyGear.whenNeeded.beforeBirth' },
  { id: '16', nameKey: 'babyGear.items.nightLight', category: 'recommended', type: 'nursery', descriptionKey: 'babyGear.descriptions.nightLight', priceRange: '$', tipsKey: 'babyGear.tips.nightLight', whenNeededKey: 'babyGear.whenNeeded.firstWeeks' },
  // Nice to Have
  { id: '9', nameKey: 'babyGear.items.swing', category: 'nice-to-have', type: 'nursery', descriptionKey: 'babyGear.descriptions.swing', priceRange: '$$', tipsKey: 'babyGear.tips.swing', whenNeededKey: 'babyGear.whenNeeded.firstMonth' },
  { id: '17', nameKey: 'babyGear.items.bouncer', category: 'nice-to-have', type: 'nursery', descriptionKey: 'babyGear.descriptions.bouncer', priceRange: '$$', tipsKey: 'babyGear.tips.bouncer', whenNeededKey: 'babyGear.whenNeeded.firstMonth' },
  { id: '18', nameKey: 'babyGear.items.playMat', category: 'nice-to-have', type: 'nursery', descriptionKey: 'babyGear.descriptions.playMat', priceRange: '$', tipsKey: 'babyGear.tips.playMat', whenNeededKey: 'babyGear.whenNeeded.firstMonth' },
];

const typeIcons: Record<string, React.ElementType> = {
  feeding: Utensils,
  sleeping: Moon,
  travel: Car,
  clothing: Shirt,
  health: Heart,
  nursery: Home
};

const STORAGE_KEY = 'baby_gear_checked';

export default function BabyGearRecommender() {
  const { t } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'essential' | 'recommended' | 'nice-to-have'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'feeding' | 'sleeping' | 'travel' | 'clothing' | 'health' | 'nursery'>('all');
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const userId = getUserId();
      const saved = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (saved) setCheckedItems(JSON.parse(saved));
    } catch {}
  }, []);

  // Save to localStorage
  const saveCheckedItems = useCallback((items: string[]) => {
    try {
      const userId = getUserId();
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(items));
    } catch {}
  }, []);

  const toggleItem = (id: string) => {
    setCheckedItems(prev => {
      const updated = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      saveCheckedItems(updated);
      return updated;
    });
  };

  const resetAll = () => {
    setCheckedItems([]);
    saveCheckedItems([]);
  };

  const filteredGear = gearList.filter(item => {
    const catMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const typeMatch = selectedType === 'all' || item.type === selectedType;
    return catMatch && typeMatch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'essential': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'recommended': return 'bg-primary/10 text-primary border-primary/20';
      case 'nice-to-have': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const essentials = gearList.filter(i => i.category === 'essential');
  const essentialsProgress = Math.round((essentials.filter(i => checkedItems.includes(i.id)).length / essentials.length) * 100);
  const totalProgress = Math.round((checkedItems.length / gearList.length) * 100);

  const typeFilters = ['all', 'feeding', 'sleeping', 'travel', 'clothing', 'health', 'nursery'] as const;

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
      <div className="space-y-4">
        {/* Progress Section */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{t('babyGear.essentialsProgress')}</h3>
              <Button variant="ghost" size="sm" onClick={resetAll} className="h-7 text-[10px] gap-1">
                <RotateCcw className="w-3 h-3" />
                {t('babyGear.reset')}
              </Button>
            </div>
            
            {/* Essentials Progress */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">{t('babyGear.categories.essential')}</span>
                <span className="text-xs font-bold text-primary">{essentialsProgress}%</span>
              </div>
              <Progress value={essentialsProgress} className="h-2" />
            </div>

            {/* Total Progress */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">{t('babyGear.totalProgress')}</span>
                <span className="text-xs font-bold text-muted-foreground">{totalProgress}%</span>
              </div>
              <Progress value={totalProgress} className="h-1.5" />
            </div>

            <p className="text-[10px] text-muted-foreground">
              {t('babyGear.itemsChecked', { checked: checkedItems.length, total: gearList.length })}
            </p>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="space-y-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {(['all', 'essential', 'recommended', 'nice-to-have'] as const).map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="capitalize whitespace-nowrap text-[11px] h-7 px-2.5"
              >
                {t(`babyGear.filters.${cat === 'nice-to-have' ? 'niceToHave' : cat}`)}
              </Button>
            ))}
          </div>

          {/* Type Filter Dropdown */}
          <Select value={selectedType} onValueChange={(val) => setSelectedType(val as typeof selectedType)}>
            <SelectTrigger className="h-8 text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {typeFilters.map(type => {
                const TypeIcon = type === 'all' ? Package : typeIcons[type];
                return (
                  <SelectItem key={type} value={type} className="text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <TypeIcon className="w-3 h-3" />
                      {t(`babyGear.types.${type === 'all' ? 'all' : type}`)}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Gear List */}
        <div className="space-y-2.5">
          {filteredGear.map(item => {
            const TypeIcon = typeIcons[item.type] || Package;
            const isChecked = checkedItems.includes(item.id);
            return (
              <Card
                key={item.id}
                className={`transition-all ${isChecked ? 'bg-muted/40 border-primary/20' : ''}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => toggleItem(item.id)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                        isChecked
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-muted-foreground/40 hover:border-primary'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <TypeIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                          <h4 className={`text-xs font-semibold truncate ${isChecked ? 'line-through text-muted-foreground' : ''}`}>
                            {t(item.nameKey)}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge variant="outline" className="text-[9px] px-1 py-0">
                            {item.priceRange}
                          </Badge>
                          <Badge className={`${getCategoryColor(item.category)} text-[9px] px-1.5 py-0`}>
                            {t(`babyGear.categories.${item.category === 'nice-to-have' ? 'niceToHave' : item.category}`)}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-[11px] text-muted-foreground mb-1.5">{t(item.descriptionKey)}</p>

                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-accent/5">
                          {t(item.whenNeededKey)}
                        </Badge>
                      </div>

                      <div className="bg-muted/40 rounded-md p-2">
                        <p className="text-[10px] text-muted-foreground">
                          <Star className="w-2.5 h-2.5 inline me-1 text-amber-500" />
                          <strong>{t('babyGear.tip')}:</strong> {t(item.tipsKey)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredGear.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">{t('babyGear.noItemsFound')}</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">{t('babyGear.shoppingSummary')}</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-destructive/5 rounded-lg">
                <div className="text-sm font-bold text-destructive">
                  {essentials.filter(i => checkedItems.includes(i.id)).length}/{essentials.length}
                </div>
                <div className="text-[10px] text-muted-foreground">{t('babyGear.categories.essential')}</div>
              </div>
              <div className="p-2.5 bg-primary/5 rounded-lg">
                <div className="text-sm font-bold text-primary">
                  {gearList.filter(i => i.category === 'recommended' && checkedItems.includes(i.id)).length}/{gearList.filter(i => i.category === 'recommended').length}
                </div>
                <div className="text-[10px] text-muted-foreground">{t('babyGear.categories.recommended')}</div>
              </div>
              <div className="p-2.5 bg-muted rounded-lg">
                <div className="text-sm font-bold text-muted-foreground">
                  {gearList.filter(i => i.category === 'nice-to-have' && checkedItems.includes(i.id)).length}/{gearList.filter(i => i.category === 'nice-to-have').length}
                </div>
                <div className="text-[10px] text-muted-foreground">{t('babyGear.categories.niceToHave')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="bg-muted/30 rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground">
            {t('babyGear.disclaimer')}
          </p>
        </div>
      </div>
    </ToolFrame>
  );
}
