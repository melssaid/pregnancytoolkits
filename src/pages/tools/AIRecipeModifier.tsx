import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Sparkles, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface RecipeAnalysis {
  safeIngredients: string[];
  unsafeIngredients: { name: string; reason: string; alternative: string }[];
  tips: string[];
  modifiedRecipe: string;
}

const unsafeIngredientsDb: Record<string, { reason: string; alternative: string }> = {
  'raw fish': { reason: 'Risk of parasites and bacteria', alternative: 'cooked salmon or shrimp' },
  'sushi': { reason: 'Raw fish can contain harmful bacteria', alternative: 'vegetable sushi or cooked sushi' },
  'raw eggs': { reason: 'Risk of salmonella', alternative: 'pasteurized eggs or egg substitute' },
  'soft cheese': { reason: 'Risk of listeria from unpasteurized dairy', alternative: 'hard cheese like cheddar' },
  'brie': { reason: 'Soft cheese may contain listeria', alternative: 'pasteurized cream cheese' },
  'feta': { reason: 'Often unpasteurized', alternative: 'pasteurized feta' },
  'deli meat': { reason: 'Risk of listeria', alternative: 'freshly cooked meat or heated until steaming' },
  'rare steak': { reason: 'Undercooked meat can contain bacteria', alternative: 'well-done steak' },
  'alcohol': { reason: 'No safe amount during pregnancy', alternative: 'sparkling water with fruit' },
  'wine': { reason: 'Alcohol can harm fetal development', alternative: 'grape juice or non-alcoholic wine' },
  'beer': { reason: 'Alcohol is unsafe during pregnancy', alternative: 'non-alcoholic beer' },
  'caffeine': { reason: 'Limit to 200mg per day', alternative: 'decaf coffee or herbal tea' },
  'liver': { reason: 'Very high in vitamin A', alternative: 'lean beef or chicken' },
  'raw sprouts': { reason: 'Can harbor bacteria', alternative: 'cooked sprouts or other vegetables' },
};

export default function AIRecipeModifier() {
  const { t } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [recipe, setRecipe] = useState('');
  const [analysis, setAnalysis] = useState<RecipeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeRecipe = () => {
    if (!recipe.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const lowerRecipe = recipe.toLowerCase();
      const foundUnsafe: { name: string; reason: string; alternative: string }[] = [];
      const safeIngredients: string[] = [];
      let modifiedRecipe = recipe;
      
      Object.entries(unsafeIngredientsDb).forEach(([ingredient, info]) => {
        if (lowerRecipe.includes(ingredient)) {
          foundUnsafe.push({ name: ingredient, ...info });
          modifiedRecipe = modifiedRecipe.replace(
            new RegExp(ingredient, 'gi'),
            `[MODIFIED: ${info.alternative}]`
          );
        }
      });

      // Extract some safe ingredients
      const commonSafe = ['chicken', 'vegetables', 'rice', 'pasta', 'olive oil', 'garlic', 'onion', 'tomato', 'potato'];
      commonSafe.forEach(ing => {
        if (lowerRecipe.includes(ing)) safeIngredients.push(ing);
      });

      const tips = [
        'Always cook meat to safe internal temperatures',
        'Wash all fruits and vegetables thoroughly',
        'Avoid cross-contamination with raw meats',
        'Check that all dairy products are pasteurized'
      ];

      setAnalysis({
        safeIngredients,
        unsafeIngredients: foundUnsafe,
        tips,
        modifiedRecipe: foundUnsafe.length > 0 ? modifiedRecipe : recipe
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  const resetAnalysis = () => {
    setRecipe('');
    setAnalysis(null);
  };

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName={t('toolsInternal.recipeModifier.title')}
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title={t('toolsInternal.recipeModifier.title')}
      subtitle={t('toolsInternal.recipeModifier.subtitle')}
      mood="joyful"
      toolId="recipe-modifier"
      icon={ChefHat}
    >
      <div className="space-y-4">
          {!analysis ? (
            <>
              {/* Input */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    {t('toolsInternal.recipeModifier.pasteRecipe')}
                  </h3>
                  <Textarea
                    placeholder={t('toolsInternal.recipeModifier.placeholder')}
                    value={recipe}
                    onChange={(e) => setRecipe(e.target.value)}
                    rows={8}
                    className="mb-4"
                  />
                  <Button 
                    onClick={analyzeRecipe} 
                    className="w-full"
                    disabled={!recipe.trim() || isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('toolsInternal.recipeModifier.analyzing')}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        {t('toolsInternal.recipeModifier.analyzeRecipe')}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Example */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">{t('toolsInternal.recipeModifier.exampleTitle')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(unsafeIngredientsDb).slice(0, 8).map(ing => (
                      <Badge key={ing} variant="outline" className="capitalize">
                        {ing}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Analysis Results */}
              {analysis.unsafeIngredients.length > 0 ? (
                <Card className="border-amber-200 bg-amber-50/50">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-amber-700">
                      <AlertTriangle className="w-4 h-4" />
                      {t('toolsInternal.recipeModifier.ingredientsToModify', { count: analysis.unsafeIngredients.length })}
                    </h3>
                    <div className="space-y-3">
                      {analysis.unsafeIngredients.map((item, index) => (
                        <div key={index} className="bg-background rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium capitalize text-destructive">{item.name}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-medium text-primary capitalize">{item.alternative}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-emerald-200 bg-emerald-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h3 className="text-sm font-semibold text-emerald-700">{t('toolsInternal.recipeModifier.recipeSafe')}</h3>
                        <p className="text-sm text-emerald-600">
                          {t('toolsInternal.recipeModifier.noUnsafeFound')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Safe Ingredients */}
              {analysis.safeIngredients.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      {t('toolsInternal.recipeModifier.safeFound')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.safeIngredients.map(ing => (
                        <Badge key={ing} className="bg-emerald-100 text-emerald-700 capitalize">
                          {ing}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Modified Recipe */}
              {analysis.unsafeIngredients.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">{t('toolsInternal.recipeModifier.modifiedRecipe')}</h4>
                    <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap">
                      {analysis.modifiedRecipe}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tips */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">{t('toolsInternal.recipeModifier.safetyTips')}</h4>
                  <ul className="space-y-2">
                    {analysis.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Button onClick={resetAnalysis} variant="outline" className="w-full">
                {t('toolsInternal.recipeModifier.analyzeAnother')}
              </Button>
            </>
          )}

          {/* Disclaimer */}
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">
              {t('toolsInternal.recipeModifier.disclaimer')}
            </p>
        </div>
      </div>
    </ToolFrame>
  );
}
