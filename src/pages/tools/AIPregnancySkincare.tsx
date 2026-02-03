import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Droplet, Sun, Moon as MoonIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolFrame } from "@/components/ToolFrame";
import MedicalDisclaimer from "@/components/compliance/MedicalDisclaimer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useSettings } from "@/hooks/useSettings";
import { VideoLibrary, Video } from "@/components/VideoLibrary";

const skinConcerns = [
  { id: "acne", label: "Pregnancy Acne", icon: "🔴" },
  { id: "melasma", label: "Melasma/Dark Spots", icon: "🟤" },
  { id: "stretch-marks", label: "Stretch Marks", icon: "〰️" },
  { id: "dryness", label: "Dry Skin", icon: "🏜️" },
  { id: "oiliness", label: "Oily/Shiny Skin", icon: "✨" },
  { id: "sensitivity", label: "Sensitivity", icon: "❗" },
  { id: "itching", label: "Itching (PUPPP)", icon: "🤚" },
  { id: "glow", label: "Want that pregnancy glow!", icon: "💫" },
];

const unsafeIngredients = [
  { name: "Retinol/Retinoids", risk: "high", icon: "🚫" },
  { name: "Salicylic Acid (high %)", risk: "medium", icon: "⚠️" },
  { name: "Hydroquinone", risk: "high", icon: "🚫" },
  { name: "Formaldehyde", risk: "high", icon: "🚫" },
  { name: "Chemical Sunscreens", risk: "medium", icon: "⚠️" },
  { name: "Essential Oils (some)", risk: "medium", icon: "⚠️" },
];

const skincareVideos: Video[] = [
  {
    id: "1",
    title: "Pregnancy Safe Skincare Routine",
    description: "Board-certified dermatologist Dr. Joyce Park explains safe products",
    youtubeId: "CK9K2TmLG3c",
    duration: "15:30",
    category: "Skincare Routine"
  },
  {
    id: "2",
    title: "Safe Skincare During Pregnancy",
    description: "Dr. Sheila Farhang on what products to use and avoid",
    youtubeId: "OeEQy4PO8Jg",
    duration: "12:00",
    category: "Product Safety"
  },
  {
    id: "3",
    title: "Pregnancy Nutrition for Skin",
    description: "Foods that promote healthy pregnancy and glowing skin",
    youtubeId: "2kNGY3gyrEc",
    duration: "11:30",
    category: "Nutrition"
  },
  {
    id: "4",
    title: "Pregnancy Diet Guide",
    description: "What to eat for healthy skin during pregnancy",
    youtubeId: "pozcaggYIWk",
    duration: "8:42",
    category: "Diet"
  },
];

const AIPregnancySkincare = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { streamChat, isLoading } = usePregnancyAI();
  
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [skinType, setSkinType] = useState("combination");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [budget, setBudget] = useState("medium");
  const [response, setResponse] = useState("");

  const toggleConcern = (id: string) => {
    setConcerns(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const getSkincareRoutine = async () => {
    const concernLabels = concerns.map(id => 
      skinConcerns.find(c => c.id === id)?.label
    ).filter(Boolean);

    const prompt = `As a pregnancy-safe skincare specialist, create a personalized routine:

**Pregnancy Week:** ${settings.pregnancyWeek || 20}
**Skin Type:** ${skinType}
**Concerns:** ${concernLabels.join(", ") || "General pregnancy skincare"}
**Budget:** ${budget === "low" ? "Drugstore products" : budget === "medium" ? "Mid-range" : "Premium/luxury"}

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
      context: { week: Number(settings.pregnancyWeek) || 20 },
      onDelta: (text) => setResponse((prev) => prev + text),
      onDone: () => {},
    });
  };

  if (!disclaimerAccepted) {
    return (
      <MedicalDisclaimer
        onAccept={() => setDisclaimerAccepted(true)}
        toolName="AI Pregnancy Skincare"
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
          <h3 className="font-semibold flex items-center gap-2 text-destructive mb-2 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="truncate">Ingredients to Avoid During Pregnancy</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {unsafeIngredients.map((ing) => (
              <div key={ing.name} className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
                <span className="shrink-0">{ing.icon}</span>
                <span className="truncate">{ing.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Skin Type */}
        <div className="space-y-1.5">
          <Label className="text-sm">Your Skin Type</Label>
          <Select value={skinType} onValueChange={setSkinType}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="dry">Dry</SelectItem>
              <SelectItem value="oily">Oily</SelectItem>
              <SelectItem value="combination">Combination</SelectItem>
              <SelectItem value="sensitive">Sensitive</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Budget */}
        <div className="space-y-1.5">
          <Label className="text-sm">Budget Preference</Label>
          <Select value={budget} onValueChange={setBudget}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="low">💵 Budget-friendly</SelectItem>
              <SelectItem value="medium">💰 Mid-range</SelectItem>
              <SelectItem value="high">💎 Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Skin Concerns */}
        <div className="space-y-2">
          <Label className="text-sm">Your Skin Concerns</Label>
          <div className="grid grid-cols-1 gap-1.5">
            {skinConcerns.map((concern) => (
              <div
                key={concern.id}
                onClick={() => toggleConcern(concern.id)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                  concerns.includes(concern.id)
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Checkbox checked={concerns.includes(concern.id)} className="shrink-0" />
                  <span className="text-base shrink-0">{concern.icon}</span>
                  <span className="text-xs sm:text-sm truncate">{concern.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Get Routine */}
        <Button
          onClick={getSkincareRoutine}
          disabled={isLoading}
          className="w-full text-xs h-9"
        >
          <Sparkles className="w-3.5 h-3.5 me-1.5 shrink-0" />
          <span className="truncate">{isLoading ? "Creating Routine..." : "Get AI Skincare Routine"}</span>
        </Button>

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
            <h4 className="font-medium text-xs">Morning</h4>
            <p className="text-[10px] text-muted-foreground leading-tight">Cleanse → Hydrate → SPF</p>
          </Card>
          <Card className="p-2.5 text-center bg-muted/30">
            <MoonIcon className="w-5 h-5 text-primary mx-auto mb-1 shrink-0" />
            <h4 className="font-medium text-xs">Evening</h4>
            <p className="text-[10px] text-muted-foreground leading-tight">Cleanse → Treat → Nourish</p>
          </Card>
        </div>

        {/* Educational Videos with Thumbnails */}
        <VideoLibrary
          videos={skincareVideos}
          title="Pregnancy Skincare Videos"
          subtitle="Dermatologist-approved skincare guidance"
          accentColor="violet"
        />
      </div>
    </ToolFrame>
  );
};

export default AIPregnancySkincare;
