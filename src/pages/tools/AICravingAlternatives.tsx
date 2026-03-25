import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, Heart, AlertTriangle, Salad, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSmartInsight } from '@/hooks/useSmartInsight';
import { AIActionButton } from '@/components/ai/AIActionButton';
import { AIResponseFrame } from '@/components/ai/AIResponseFrame';
import { PrintableReport } from '@/components/PrintableReport';
import { AILoadingDots } from '@/components/ai/AILoadingDots';
import { RelatedTools } from '@/components/RelatedTools';
import { ToolFrame } from '@/components/ToolFrame';
import { ToolHubNav, NUTRITION_HUB_TABS } from '@/components/ToolHubNav';
import { WeekSlider } from '@/components/WeekSlider';

const COMMON_CRAVINGS = [
  { emoji: '🍕', key: 'pizza', category: 'salty' },
  { emoji: '🍫', key: 'chocolate', category: 'sweet' },
  { emoji: '🍦', key: 'iceCream', category: 'sweet' },
  { emoji: '🍟', key: 'frenchFries', category: 'salty' },
  { emoji: '🥤', key: 'soda', category: 'sweet' },
  { emoji: '🍪', key: 'cookies', category: 'sweet' },
  { emoji: '🧀', key: 'cheese', category: 'salty' },
  { emoji: '🍿', key: 'popcorn', category: 'salty' },
  { emoji: '🍩', key: 'donuts', category: 'sweet' },
  { emoji: '🌮', key: 'tacos', category: 'salty' },
  { emoji: '🥓', key: 'bacon', category: 'salty' },
  { emoji: '🍔', key: 'burger', category: 'salty' },
] as const;

const AICravingAlternatives: React.FC = () => {
  const { t } = useTranslation();
  const [craving, setCraving] = useState('');
  const [week, setWeek] = useState(20);
  const { generate, isLoading, content, error, reset } = useSmartInsight({
    section: 'nutrition',
    toolType: 'meal-suggestion',
  });

  const handleCravingSelect = useCallback((cravingName: string) => {
    setCraving(cravingName);
  }, []);

  const handleWeekChange = useCallback((newWeek: number) => {
    setWeek(newWeek);
  }, []);

  const analyzeAndSuggest = useCallback(async () => {
    if (!craving.trim()) return;

    const prompt = `As a prenatal nutrition specialist, provide healthy alternatives for a pregnancy craving at week ${week}:

**Craving:** "${craving}"

Provide:

## Understanding Your Craving
- What nutrient deficiency might this craving indicate?
- Why pregnant women often crave this

## Healthy Alternatives (Top 5)
For each alternative, include:
- Name and emoji
- Why it satisfies the craving
- Nutritional benefits for pregnancy
- Quick preparation tip

## Safety Notes
- Is the original craving safe during pregnancy?
- Any modifications needed to make it safer?
- Portion recommendations

## Smart Swaps
A quick comparison table of the craving vs. healthiest alternative showing calories, sugar, protein, and pregnancy benefits.

Keep suggestions practical, delicious, and easy to prepare. Focus on satisfying the craving while maximizing nutrition for mom and baby.`;

    await generate({ prompt, context: { week } });
  }, [craving, week, generate]);

  const handleReset = useCallback(() => {
    setCraving('');
    reset();
  }, [reset]);

  return (
    <ToolFrame title={t('toolsInternal.cravingAlternatives.title')} subtitle={t('toolsInternal.cravingAlternatives.subtitle')} mood="joyful" toolId="ai-craving-alternatives">
      <ToolHubNav tabs={NUTRITION_HUB_TABS} />
      <div className="space-y-6">

          <WeekSlider week={week} onChange={handleWeekChange} showTrimester />

          {/* Craving Input */}
          <Card className="shadow-lg border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="w-4 h-4 text-primary" />
                {t('toolsInternal.cravingAlternatives.whatCraving')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder={t('toolsInternal.cravingAlternatives.inputPlaceholder')}
                value={craving}
                onChange={(e) => setCraving(e.target.value)}
                className="text-sm py-4"
              />
              
              <div>
                <p className="text-xs text-muted-foreground mb-2">{t('toolsInternal.cravingAlternatives.orQuickSelect')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_CRAVINGS.map((c) => {
                    const translatedName = t(`toolsInternal.cravingAlternatives.cravings.${c.key}`);
                    return (
                      <Button
                        key={c.key}
                        variant={craving === translatedName ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleCravingSelect(translatedName)}
                        className="transition-all hover:scale-105 text-xs h-8 px-2.5"
                      >
                        <span className="mr-1">{c.emoji}</span>
                        {translatedName}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <AIActionButton
                  onClick={analyzeAndSuggest}
                  isLoading={isLoading}
                  disabled={!craving.trim()}
                  label={t('toolsInternal.cravingAlternatives.findAlternatives')}
                  loadingLabel={t('toolsInternal.common.analyzing', { defaultValue: '...' })}
                  className="flex-1"
                  toolType="meal-suggestion"
                  section="nutrition"
                />
                {(craving || content) && (
                  <Button variant="outline" onClick={handleReset} className="h-10 w-10 p-0">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {(content || isLoading) && (
            <div>
              {isLoading && !content && (
                <div className="flex items-center justify-center py-12">
                  <AILoadingDots text={t('toolsInternal.cravingAlternatives.analyzingCraving')} size="md" />
                </div>
              )}
              {content && (
                <PrintableReport title={t('toolsInternal.cravingAlternatives.healthyAlternativesFor', { craving })}>
                  <AIResponseFrame
                    content={content}
                    title={t('toolsInternal.cravingAlternatives.healthyAlternativesFor', { craving })}
                    icon={Salad}
                  />
                </PrintableReport>
              )}
            </div>
          )}

          {/* Tips Card */}
          {!content && !isLoading && (
            <Card className="bg-accent/50 border-accent">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm">
                  <Brain className="w-4 h-4 text-primary" />
                  {t('toolsInternal.cravingAlternatives.whyCravingsHappen')}
                </h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong className="text-foreground">{t('toolsInternal.cravingAlternatives.hormonalChanges')}</strong> {t('toolsInternal.cravingAlternatives.hormonalChangesDesc')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong className="text-foreground">{t('toolsInternal.cravingAlternatives.nutrientNeeds')}</strong> - {t('toolsInternal.cravingAlternatives.nutrientNeedsDesc')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong className="text-foreground">{t('toolsInternal.cravingAlternatives.emotionalComfort')}</strong> - {t('toolsInternal.cravingAlternatives.emotionalComfortDesc')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong className="text-foreground">{t('toolsInternal.cravingAlternatives.bloodSugar')}</strong> {t('toolsInternal.cravingAlternatives.bloodSugarDesc')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}

          <RelatedTools currentToolId="ai-craving-alternatives" />
      </div>
    </ToolFrame>
  );
};

export default AICravingAlternatives;
