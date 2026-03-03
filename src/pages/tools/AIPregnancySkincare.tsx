import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Brain, Loader2, Sparkles, Droplet, Sun, Moon as MoonIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolFrame } from "@/components/ToolFrame";
import MedicalDisclaimer from "@/components/compliance/MedicalDisclaimer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { AIActionButton } from '@/components/ai/AIActionButton';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { useSettings } from "@/hooks/useSettings";
import { VideoLibrary } from "@/components/VideoLibrary";
import { skincareVideosByLang } from "@/data/videoData";
const CONCERN_KEYS = [
  "acne",
  "melasma",
  "stretchMarks",
  "dryness",
  "oiliness",
  "sensitivity",
  "itching",
  "glow",
] as const;

const UNSAFE_INGREDIENT_KEYS = [
  "retinol",
  "salicylic",
  "hydroquinone",
  "formaldehyde",
  "chemicalSunscreens",
  "essentialOils",
] as const;

const AIPregnancySkincare = () => {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const { streamChat, isLoading } = usePregnancyAI();
  
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [skinType, setSkinType] = useState("combination");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [budget, setBudget] = useState("medium");
  const [response, setResponse] = useState("");

  const currentLang = i18n.language;

  const toggleConcern = (id: string) => {
    setConcerns(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const getSkincareRoutine = async () => {
    const concernLabels = concerns.map(id => 
      t(`toolsInternal.skincare.concerns.${id}.label`)
    ).filter(Boolean);

    const skinTypeLabel = t(`toolsInternal.skincare.${skinType}`);
    const budgetLabel = budget === "low" ? t('toolsInternal.skincare.budgetLow') : budget === "medium" ? t('toolsInternal.skincare.budgetMedium') : t('toolsInternal.skincare.budgetHigh');

    const langInstruction = currentLang !== 'en' 
      ? `IMPORTANT: Respond ENTIRELY in ${currentLang === 'ar' ? 'Arabic' : currentLang === 'de' ? 'German' : currentLang === 'tr' ? 'Turkish' : currentLang === 'fr' ? 'French' : currentLang === 'es' ? 'Spanish' : currentLang === 'pt' ? 'Portuguese' : 'English'}. All text must be in this language.`
      : '';

    const prompt = `${langInstruction}

As a pregnancy-safe skincare specialist, create a personalized routine:

**Pregnancy Week:** ${settings.pregnancyWeek || "Not specified"}
**Skin Type:** ${skinTypeLabel}
**Concerns:** ${concernLabels.join(", ") || "General pregnancy skincare"}
**Budget:** ${budgetLabel}

Provide a complete pregnancy-safe skincare routine:
1. **Morning Routine** - Step-by-step with specific product recommendations
2. **Evening Routine** - Cleansing, treatment, moisturizing
3. **Weekly Treatments** - Masks, exfoliation (safe options)
4. **Ingredients to Use** - Pregnancy-safe actives
5. **Ingredients to Avoid** - With explanations
6. **Body Care** - For stretch marks, belly care
7. **Product Recommendations** - Specific brands and products

Include natural DIY options when appropriate. Focus ONLY on pregnancy-safe ingredients.`;

    setResponse("");
    await streamChat({
      type: "pregnancy-assistant",
      messages: [{ role: "user", content: prompt }],
      context: { week: Number(settings.pregnancyWeek) || 0 },
      onDelta: (text) => setResponse((prev) => prev + text),
      onDone: () => {},
    });
  };

  if (!disclaimerAccepted) {
    return (
      <MedicalDisclaimer
        onAccept={() => setDisclaimerAccepted(true)}
        toolName={t('toolsInternal.skincare.title')}
      />
    );
  }

  return (
    <ToolFrame
      title={t('toolsInternal.skincare.title')}
      subtitle={t('toolsInternal.skincare.subtitle')}
      icon={Droplet}
      mood="nurturing"
      toolId="ai-pregnancy-skincare"
    >
      <div className="space-y-4">
        {/* Unsafe Ingredients Warning */}
        <Card className="p-3 bg-destructive/5 border-destructive/20">
          <h3 className="font-semibold flex items-center gap-2 text-destructive mb-2 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="leading-snug">{t('toolsInternal.skincare.ingredientsToAvoid')}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {UNSAFE_INGREDIENT_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-2 text-[10px] sm:text-xs min-w-0">
                <span className="shrink-0">{t(`toolsInternal.skincare.unsafeIngredients.${key}.icon`)}</span>
                <span className="leading-snug">{t(`toolsInternal.skincare.unsafeIngredients.${key}.name`)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Skin Type */}
        <div className="space-y-1.5">
          <Label className="text-xs">{t('toolsInternal.skincare.skinType')}</Label>
          <Select value={skinType} onValueChange={setSkinType}>
            <SelectTrigger className="w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="dry">{t('toolsInternal.skincare.dry')}</SelectItem>
              <SelectItem value="oily">{t('toolsInternal.skincare.oily')}</SelectItem>
              <SelectItem value="combination">{t('toolsInternal.skincare.combination')}</SelectItem>
              <SelectItem value="sensitive">{t('toolsInternal.skincare.sensitive')}</SelectItem>
              <SelectItem value="normal">{t('toolsInternal.skincare.normal')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Budget */}
        <div className="space-y-1.5">
          <Label className="text-xs">{t('toolsInternal.skincare.budgetPreference')}</Label>
          <Select value={budget} onValueChange={setBudget}>
            <SelectTrigger className="w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="low">{t('toolsInternal.skincare.budgetLow')}</SelectItem>
              <SelectItem value="medium">{t('toolsInternal.skincare.budgetMedium')}</SelectItem>
              <SelectItem value="high">{t('toolsInternal.skincare.budgetHigh')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Skin Concerns */}
        <div className="space-y-2">
          <Label className="text-xs">{t('toolsInternal.skincare.skinConcerns')}</Label>
          <div className="grid grid-cols-1 gap-1.5">
            {CONCERN_KEYS.map((concernKey) => (
              <div
                key={concernKey}
                onClick={() => toggleConcern(concernKey)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                  concerns.includes(concernKey)
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Checkbox checked={concerns.includes(concernKey)} className="shrink-0" />
                  <span className="text-sm shrink-0">{t(`toolsInternal.skincare.concerns.${concernKey}.icon`)}</span>
                  <span className="text-xs leading-snug">{t(`toolsInternal.skincare.concerns.${concernKey}.label`)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Get Routine */}
        <AIActionButton
          onClick={getSkincareRoutine}
          isLoading={isLoading}
          label={t('toolsInternal.skincare.getRoutine')}
          loadingLabel={t('toolsInternal.skincare.creatingRoutine')}
        />

        {/* AI Response */}
        {response && (
          <Card className="p-3 bg-muted/50">
            <MarkdownRenderer content={response} isLoading={isLoading} />
          </Card>
        )}

        {/* Daily/Nightly Quick Reference */}
        <div className="grid grid-cols-2 gap-1.5">
          <Card className="p-2.5 text-center bg-muted/30">
            <Sun className="w-5 h-5 text-primary mx-auto mb-1 shrink-0" />
            <h4 className="font-medium text-xs">{t('toolsInternal.skincare.morning')}</h4>
            <p className="text-[10px] text-muted-foreground leading-tight">{t('toolsInternal.skincare.morningSteps')}</p>
          </Card>
          <Card className="p-2.5 text-center bg-muted/30">
            <MoonIcon className="w-5 h-5 text-primary mx-auto mb-1 shrink-0" />
            <h4 className="font-medium text-xs">{t('toolsInternal.skincare.evening')}</h4>
            <p className="text-[10px] text-muted-foreground leading-tight">{t('toolsInternal.skincare.eveningSteps')}</p>
          </Card>
        </div>

        {/* Educational Videos with Thumbnails */}
        <VideoLibrary
          videosByLang={skincareVideosByLang(t)}
          title={t('toolsInternal.skincare.skincareVideos')}
          subtitle={t('toolsInternal.skincare.skincareVideosSubtitle')}
          accentColor="violet"
        />
      </div>
    </ToolFrame>
  );
};

export default AIPregnancySkincare;
