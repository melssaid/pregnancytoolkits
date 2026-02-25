import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Utensils,
  Sparkles,
  Leaf,
  Apple,
  Clock,
  AlertTriangle,
  Heart,
  Brain,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolFrame } from "@/components/ToolFrame";
import { MedicalDisclaimer } from "@/components/compliance";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { AILoadingDots } from "@/components/ai/AILoadingDots";
import { VideoLibrary } from "@/components/VideoLibrary";
import { nutritionVideosByLang } from "@/data/videoData";
import { RelatedToolLinks } from "@/components/RelatedToolLinks";
import { ToolHubNav, NUTRITION_HUB_TABS } from "@/components/ToolHubNav";

const MEAL_TYPE_IDS = ["breakfast", "lunch", "dinner", "snack"] as const;
const DIETARY_PREF_IDS = ["vegetarian", "low-sugar", "high-protein", "low-sodium", "iron-rich", "calcium-rich"] as const;
const CRAVING_IDS = ["sweet", "salty", "sour", "spicy", "creamy"] as const;
const ALLERGY_IDS = ["gluten", "dairy", "nuts", "eggs", "soy", "seafood"] as const;
const PREP_TIME_IDS = ["quick", "medium", "elaborate"] as const;

export default function AIMealSuggestion() {
  const { t } = useTranslation();
  const { streamChat, isLoading, error } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setSuggestion('');
  });

  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [trimester, setTrimester] = useState<string>("2");
  const [mealType, setMealType] = useState<string>("lunch");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [selectedCraving, setSelectedCraving] = useState<string>("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [prepTime, setPrepTime] = useState<string>("medium");
  const [suggestion, setSuggestion] = useState<string>("");

  const togglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const toggleAllergy = (id: string) => {
    setAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const getSuggestion = async () => {
    setSuggestion("");

    const mealLabel = t(`toolsInternal.mealSuggestion.mealTypes.${mealType}`);
    const prefsText = preferences
      .map((id) => t(`toolsInternal.mealSuggestion.preferences.${id}`))
      .filter(Boolean)
      .join(", ");
    const cravingText = selectedCraving
      ? t(`toolsInternal.mealSuggestion.cravings.${selectedCraving}`)
      : "";
    const allergyText = allergies
      .map((id) => t(`toolsInternal.mealSuggestion.allergies.${id}`))
      .filter(Boolean)
      .join(", ");
    const prepTimeText = t(`toolsInternal.mealSuggestion.prepTimes.${prepTime}`);

    const prompt = `I am pregnant in the ${
      trimester === "1" ? "first" : trimester === "2" ? "second" : "third"
    } trimester.
I want a healthy ${mealLabel} suggestion.
${prefsText ? `My dietary preferences: ${prefsText}.` : ""}
${cravingText ? `I'm craving something ${cravingText.toLowerCase()}.` : ""}
${allergyText ? `I have these allergies/intolerances: ${allergyText}. Please avoid these completely.` : ""}
Preparation time: ${prepTimeText}.

Please provide an easy recipe with ingredients, preparation steps, and nutritional values.`;

    await streamChat({
      type: "meal-suggestion",
      messages: [{ role: "user", content: prompt }],
      context: { trimester: parseInt(trimester) },
      onDelta: (chunk) => setSuggestion((prev) => prev + chunk),
      onDone: () => {},
    });
  };

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName={t("tools.aiMealSuggestion.title")}
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title={t("tools.aiMealSuggestion.title")}
      subtitle={t("toolsInternal.mealSuggestion.subtitle")}
      mood="joyful"
      toolId="ai-meal-suggestion"
    >
      <ToolHubNav tabs={NUTRITION_HUB_TABS} />
      <div className="space-y-3">
        {!suggestion ? (
          <>
            {/* Trimester & Meal Type */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("toolsInternal.mealSuggestion.pregnancyStage")}
                </label>
                <Select value={trimester} onValueChange={setTrimester}>
                  <SelectTrigger className="h-9 text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">{t("toolsInternal.mealSuggestion.trimesters.first")}</SelectItem>
                    <SelectItem value="2">{t("toolsInternal.mealSuggestion.trimesters.second")}</SelectItem>
                    <SelectItem value="3">{t("toolsInternal.mealSuggestion.trimesters.third")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("toolsInternal.mealSuggestion.mealType")}
                </label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger className="h-9 text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPE_IDS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {t(`toolsInternal.mealSuggestion.mealTypes.${m}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Prep Time */}
            <Card className="border-border/50 shadow-none">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs flex items-center gap-1.5 text-foreground">
                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                  {t("toolsInternal.mealSuggestion.prepTimeLabel")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {PREP_TIME_IDS.map((p) => (
                    <Button
                      key={p}
                      variant={prepTime === p ? "default" : "outline"}
                      size="sm"
                      className="rounded-full text-[11px] h-7 px-3"
                      onClick={() => setPrepTime(p)}
                    >
                      {t(`toolsInternal.mealSuggestion.prepTimes.${p}`)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cravings */}
            <Card className="border-border/50 shadow-none">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs flex items-center gap-1.5 text-foreground">
                  <Heart className="w-3.5 h-3.5 text-primary shrink-0" />
                  {t("toolsInternal.mealSuggestion.whatCraving")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {CRAVING_IDS.map((c) => (
                    <Button
                      key={c}
                      variant={selectedCraving === c ? "default" : "outline"}
                      size="sm"
                      className="rounded-full text-[11px] h-7 px-3"
                      onClick={() => setSelectedCraving(selectedCraving === c ? "" : c)}
                    >
                      {t(`toolsInternal.mealSuggestion.cravings.${c}`)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dietary Preferences */}
            <Card className="border-border/50 shadow-none">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs flex items-center gap-1.5 text-foreground">
                  <Leaf className="w-3.5 h-3.5 text-primary shrink-0" />
                  {t("toolsInternal.mealSuggestion.dietaryPreferences")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-2 gap-1.5">
                  {DIETARY_PREF_IDS.map((pref) => (
                    <label
                      key={pref}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer border border-transparent hover:border-border/40 transition-all"
                    >
                      <Checkbox
                        checked={preferences.includes(pref)}
                        onCheckedChange={() => togglePreference(pref)}
                        className="w-3.5 h-3.5"
                      />
                      <span className="text-[11px] font-medium leading-tight">
                        {t(`toolsInternal.mealSuggestion.preferences.${pref}`)}
                      </span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Allergies */}
            <Card className="border-border/50 shadow-none">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs flex items-center gap-1.5 text-foreground">
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
                  {t("toolsInternal.mealSuggestion.allergiesLabel")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {ALLERGY_IDS.map((a) => (
                    <Button
                      key={a}
                      variant={allergies.includes(a) ? "destructive" : "outline"}
                      size="sm"
                      className="rounded-full text-[11px] h-7 px-3"
                      onClick={() => toggleAllergy(a)}
                    >
                      {t(`toolsInternal.mealSuggestion.allergies.${a}`)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Suggest Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={getSuggestion}
              disabled={isLoading}
              className="relative w-full overflow-hidden rounded-xl h-11 flex items-center justify-center gap-2 text-white text-sm font-semibold shadow-lg disabled:opacity-60 disabled:pointer-events-none"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))" }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
              {isLoading ? (
                <AILoadingDots text={t("toolsInternal.common.analyzing", { defaultValue: "..." })} />
              ) : (
                <>
                  <Brain className="w-4 h-4 shrink-0" />
                  <span>{t("toolsInternal.mealSuggestion.suggestMeal")}</span>
                </>
              )}
            </motion.button>
          </>
        ) : (
          <>
            {/* Suggestion Result */}
            <Card className="border-primary/20 bg-primary/5 shadow-none">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-xs flex items-center gap-1.5 text-primary">
                    <Utensils className="w-3.5 h-3.5 shrink-0" />
                    {t("toolsInternal.mealSuggestion.mealSuggestion")}
                  </CardTitle>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    {t(`toolsInternal.mealSuggestion.mealTypes.${mealType}`)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <MarkdownRenderer
                  content={suggestion}
                  isLoading={isLoading}
                  accentColor="primary"
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => setSuggestion("")}
                variant="outline"
                className="flex-1 rounded-xl text-xs h-9 gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                {t("toolsInternal.mealSuggestion.differentSuggestion")}
              </Button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={getSuggestion}
                disabled={isLoading}
                className="relative flex-1 overflow-hidden rounded-xl h-9 flex items-center justify-center gap-1.5 text-white text-xs font-semibold shadow-md disabled:opacity-60 disabled:pointer-events-none"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))" }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                {isLoading ? <AILoadingDots size="sm" /> : <Sparkles className="w-3.5 h-3.5" />}
                {t("toolsInternal.mealSuggestion.refresh")}
              </motion.button>
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/10 shadow-none">
            <CardContent className="p-3">
              <p className="text-xs text-destructive text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="border-border/50 shadow-none">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Apple className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <div className="text-[10px] text-muted-foreground space-y-1 min-w-0">
                <p className="font-semibold text-foreground text-xs">
                  {t("toolsInternal.mealSuggestion.quickTips")}
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>{t("toolsInternal.mealSuggestion.tips.smallMeals")}</li>
                  <li>{t("toolsInternal.mealSuggestion.tips.drinkWater")}</li>
                  <li>{t("toolsInternal.mealSuggestion.tips.avoidRaw")}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Educational Videos */}
        <VideoLibrary
          videosByLang={nutritionVideosByLang}
          title={t("toolsInternal.mealSuggestion.nutritionVideos")}
          subtitle={t("toolsInternal.mealSuggestion.nutritionVideosSubtitle")}
          accentColor="emerald"
        />

        {/* Related Nutrition Tools */}
        <RelatedToolLinks links={[
          { to: "/tools/smart-grocery-list", titleKey: "nutritionLinks.groceryListLink", titleFallback: "Smart Grocery List", descKey: "nutritionLinks.groceryListLinkDesc", descFallback: "Build a pregnancy-optimized shopping list", icon: "cart" },
          { to: "/tools/ai-craving-alternatives", titleKey: "nutritionLinks.cravingLink", titleFallback: "Craving Alternatives", descKey: "nutritionLinks.cravingLinkDesc", descFallback: "Find healthy swaps for your cravings", icon: "utensils" },
          { to: "/tools/vitamin-tracker", titleKey: "nutritionLinks.vitaminTrackerLink", titleFallback: "Vitamin Tracker", descKey: "nutritionLinks.vitaminTrackerLinkDesc", descFallback: "Track daily supplement intake", icon: "pill" },
        ]} />
      </div>
    </ToolFrame>
  );
}
