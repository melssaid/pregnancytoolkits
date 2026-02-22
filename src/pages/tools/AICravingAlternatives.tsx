import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Loader2, Heart, AlertTriangle, Salad, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { AIResultDisclaimer } from '@/components/compliance/AIResultDisclaimer';
import { RelatedTools } from '@/components/RelatedTools';
import { Layout } from '@/components/Layout';
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

    const prompt = `I'm in week ${week} of pregnancy and I'm craving: "${craving}"

Please provide:

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
    <Layout showBack>
      <div className="container py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Tool Header */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Salad className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-foreground">{t('toolsInternal.cravingAlternatives.title')}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">{t('toolsInternal.cravingAlternatives.subtitle')}</p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/8 text-[10px] font-medium text-primary">
                    <ShieldCheck className="w-3 h-3" />
                    {t('toolsInternal.cravingAlternatives.pregnancySafe')}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent text-[10px] font-medium text-accent-foreground">
                    <Zap className="w-3 h-3" />
                    {t('toolsInternal.cravingAlternatives.nutrientDense')}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-[10px] font-medium text-foreground">
                    <Sparkles className="w-3 h-3" />
                    AI
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Week Selector - Using new slider component */}
          <WeekSlider
            week={week}
            onChange={handleWeekChange}
            showTrimester
          />

          {/* Craving Input */}
          <Card className="shadow-lg border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="w-5 h-5 text-primary" />
                {t('toolsInternal.cravingAlternatives.whatCraving')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder={t('toolsInternal.cravingAlternatives.inputPlaceholder')}
                value={craving}
                onChange={(e) => setCraving(e.target.value)}
                className="text-lg py-6"
              />
              
              {/* Quick Select */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">{t('toolsInternal.cravingAlternatives.orQuickSelect')}</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_CRAVINGS.map((c) => {
                    const translatedName = t(`toolsInternal.cravingAlternatives.cravings.${c.key}`);
                    return (
                      <Button
                        key={c.key}
                        variant={craving === translatedName ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleCravingSelect(translatedName)}
                        className="transition-all hover:scale-105"
                      >
                        <span className="mr-1">{c.emoji}</span>
                        {translatedName}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={analyzeAndSuggest}
                  disabled={!craving.trim() || isLoading}
                  className="flex-1 py-6 text-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      {t('toolsInternal.common.analyzing', { defaultValue: '...' })}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      {t('toolsInternal.cravingAlternatives.findAlternatives')}
                    </>
                  )}
                </Button>
                {(craving || result) && (
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="py-6"
                  >
                    <RefreshCw className="w-5 h-5" />
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
            <Card ref={resultRef} className="shadow-xl border-border bg-card overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-border">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Salad className="w-6 h-6" />
                  {t('toolsInternal.cravingAlternatives.healthyAlternativesFor', { craving })}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading && !result && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">{t('toolsInternal.cravingAlternatives.analyzingCraving')}</p>
                    </div>
                  </div>
                )}
                
                {result && (
                  <div className="prose prose-pink max-w-none">
                    <MarkdownRenderer content={result} />
                  </div>
                )}
                
                {result && !isLoading && <AIResultDisclaimer />}
              </CardContent>
            </Card>
          )}

          {/* Tips Card */}
          {!result && !isLoading && (
            <Card className="bg-accent/50 border-accent">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
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
      </div>
    </Layout>
  );
};

export default AICravingAlternatives;
