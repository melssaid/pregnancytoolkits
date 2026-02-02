import React, { useState, useRef } from 'react';
import { Cookie, Sparkles, Loader2, Heart, AlertTriangle, Salad, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { AIResultDisclaimer } from '@/components/compliance/AIResultDisclaimer';
import { RelatedTools } from '@/components/RelatedTools';
import { Badge } from '@/components/ui/badge';

// Common pregnancy cravings for quick selection
const COMMON_CRAVINGS = [
  { emoji: '🍕', name: 'Pizza', category: 'salty' },
  { emoji: '🍫', name: 'Chocolate', category: 'sweet' },
  { emoji: '🍦', name: 'Ice Cream', category: 'sweet' },
  { emoji: '🍟', name: 'French Fries', category: 'salty' },
  { emoji: '🥤', name: 'Soda', category: 'sweet' },
  { emoji: '🍪', name: 'Cookies', category: 'sweet' },
  { emoji: '🧀', name: 'Cheese', category: 'salty' },
  { emoji: '🍿', name: 'Popcorn', category: 'salty' },
  { emoji: '🍩', name: 'Donuts', category: 'sweet' },
  { emoji: '🌮', name: 'Tacos', category: 'salty' },
  { emoji: '🥓', name: 'Bacon', category: 'salty' },
  { emoji: '🍔', name: 'Burger', category: 'salty' },
];

const AICravingAlternatives: React.FC = () => {
  const [craving, setCraving] = useState('');
  const [week, setWeek] = useState(20);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { streamChat, error } = usePregnancyAI();
  const abortRef = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleCravingSelect = (cravingName: string) => {
    setCraving(cravingName);
  };

  const analyzeAndSuggest = async () => {
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
          // Scroll to results
          setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      });
    } catch (err) {
      console.error('AI error:', err);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCraving('');
    setResult('');
    abortRef.current = true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-primary text-primary-foreground border-0 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGM5Ljk0MSAwIDE4LTguMDU5IDE4LTE4cy04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNHMxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L2c+PC9zdmc+')] opacity-30" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3 text-2xl md:text-3xl">
              <div className="p-3 bg-background/20 rounded-2xl backdrop-blur-sm">
                <Cookie className="w-8 h-8" />
              </div>
              <div>
                <span className="block">AI Craving Alternatives</span>
                <span className="text-sm font-normal opacity-90">Satisfy cravings with healthy swaps</span>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Week Selector */}
        <Card className="shadow-lg border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <label className="font-medium text-foreground whitespace-nowrap">
                Pregnancy Week:
              </label>
              <Input
                type="number"
                min={1}
                max={42}
                value={week}
                onChange={(e) => setWeek(parseInt(e.target.value) || 20)}
                className="w-24 text-center font-bold text-lg"
              />
              <Badge variant="secondary" className="ml-auto">
                {week <= 13 ? '1st Trimester' : week <= 26 ? '2nd Trimester' : '3rd Trimester'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Craving Input */}
        <Card className="shadow-lg border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="w-5 h-5 text-primary" />
              What are you craving?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Type your craving... (e.g., chocolate, pizza, ice cream)"
              value={craving}
              onChange={(e) => setCraving(e.target.value)}
              className="text-lg py-6"
            />
            
            {/* Quick Select */}
            <div>
              <p className="text-sm text-muted-foreground mb-3">Or quick select:</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_CRAVINGS.map((c) => (
                  <Button
                    key={c.name}
                    variant={craving === c.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCravingSelect(c.name)}
                    className={`transition-all hover:scale-105 ${
                      craving === c.name 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-card hover:bg-accent'
                    }`}
                  >
                    <span className="mr-1">{c.emoji}</span>
                    {c.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={analyzeAndSuggest}
                disabled={!craving.trim() || isLoading}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Finding alternatives...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Find Healthy Alternatives
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
                Healthy Alternatives for "{craving}"
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading && !result && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Analyzing your craving...</p>
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
                Why Cravings Happen During Pregnancy
              </h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Hormonal changes</strong> affect your taste buds and smell sensitivity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Nutrient needs</strong> - your body may signal what it lacks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Emotional comfort</strong> - certain foods provide psychological relief</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Blood sugar fluctuations</strong> can trigger sweet cravings</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Related Tools */}
        <RelatedTools currentToolId="ai-craving-alternatives" />
      </div>
    </div>
  );
};

export default AICravingAlternatives;
