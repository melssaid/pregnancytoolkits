import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Brain, Heart, AlertTriangle, Salad, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { AIActionButton } from '@/components/ai/AIActionButton';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { AIResponseFrame } from '@/components/ai/AIResponseFrame';
import { PrintableReport } from '@/components/PrintableReport';
import { AILoadingDots } from '@/components/ai/AILoadingDots';
import { AIResultDisclaimer } from '@/components/compliance/AIResultDisclaimer';
import { RelatedTools } from '@/components/RelatedTools';

import { ToolFrame } from '@/components/ToolFrame';
import { ToolHubNav, NUTRITION_HUB_TABS } from '@/components/ToolHubNav';
import { WeekSlider } from '@/components/WeekSlider';

// Common pregnancy cravings for quick selection
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
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { streamChat, error } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setCraving('');
    setResult('');
  });
  const abortRef = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleCravingSelect = useCallback((cravingName: string) => {
    setCraving(cravingName);
  }, []);

  const handleWeekChange = useCallback((newWeek: number) => {
    setWeek(newWeek);
  }, []);

  const analyzeAndSuggest = useCallback(async () => {
    if (!craving.trim()) return;
    
    setIsLoading(true);
    setResult('');
    abortRef.current = false;

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

    try {
      await streamChat({
        type: 'meal-suggestion',
        messages: [{ role: 'user', content: prompt }],
        context: { week },
        onDelta: (text) => {
          if (abortRef.current) return;
          setResult(prev => prev + text);
        },
        onDone: () => {
          setIsLoading(false);
          setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      });
    } catch (err) {
      console.error('AI error:', err);
      setIsLoading(false);
    }
  }, [craving, week, streamChat]);

  const handleReset = useCallback(() => {
    setCraving('');
    setResult('');
    abortRef.current = true;
  }, []);

  return (
    <ToolFrame title={t('toolsInternal.cravingAlternatives.title')} subtitle={t('toolsInternal.cravingAlternatives.subtitle')} mood="joyful" toolId="ai-craving-alternatives">
      <ToolHubNav tabs={NUTRITION_HUB_TABS} />
      <div className="space-y-6">

          {/* Week Selector - Using new slider component */}
          <WeekSlider
            week={week}
            onChange={handleWeekChange}
            showTrimester
          />

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
              
              {/* Quick Select */}
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

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3">
                <AIActionButton
                  onClick={analyzeAndSuggest}
                  isLoading={isLoading}
                  disabled={!craving.trim()}
                  label={t('toolsInternal.cravingAlternatives.findAlternatives')}
                  loadingLabel={t('toolsInternal.common.analyzing', { defaultValue: '...' })}
                  className="flex-1"
                />
                {(craving || result) && (
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="h-10 w-10 p-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
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
          {(result || isLoading) && (
            <div ref={resultRef}>
              {isLoading && !result && (
                <div className="flex items-center justify-center py-12">
                  <AILoadingDots text={t('toolsInternal.cravingAlternatives.analyzingCraving')} size="md" />
                </div>
              )}
              {result && (
                <AIResponseFrame
                  content={result}
                  title={t('toolsInternal.cravingAlternatives.healthyAlternativesFor', { craving })}
                  icon={Salad}
                />
              )}
            </div>
          )}

          {/* Tips Card */}
          {!result && !isLoading && (
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

          {/* Related Tools */}
          <RelatedTools currentToolId="ai-craving-alternatives" />
      </div>
    </ToolFrame>
  );
};

export default AICravingAlternatives;
