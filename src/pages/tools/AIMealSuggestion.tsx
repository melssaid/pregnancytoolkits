import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Utensils,
  Sparkles,
  Loader2,
  Leaf,
  Apple,
  Clock,
  Flame,
  AlertTriangle,
  Heart,
} from "lucide-react";
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
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { VideoLibrary, Video } from "@/components/VideoLibrary";

const nutritionVideos: Video[] = [
  { id: "1", title: "Healthy Pregnancy Meal Plan", description: "Step-by-step guide to healthy eating during pregnancy", youtubeId: "vNZ2GsJOsZc", duration: "18:42", category: "Nutrition" },
  { id: "2", title: "What A Nutritionist Eats Pregnant", description: "Daily meals and tips from a certified nutritionist", youtubeId: "xZs3gCHcjhY", duration: "14:23", category: "Nutrition" },
  { id: "3", title: "Top 10 Foods For Pregnancy", description: "Best foods to eat during pregnancy with free meal plan", youtubeId: "3GTK6MLPJ9g", duration: "12:15", category: "Nutrition" },
  { id: "4", title: "10 Foods I Eat Every Day Pregnant", description: "Daily pregnancy superfoods for you and baby", youtubeId: "2kNGY3gyrEc", duration: "11:30", category: "Nutrition" },
  { id: "5", title: "Diet by Trimester - Dietitian Guide", description: "What to eat in each trimester - expert advice", youtubeId: "dq7ovxsAfX8", duration: "15:45", category: "Trimester Guide" },
  { id: "6", title: "First & Second Trimester Diet", description: "Pregnancy diet chart for healthy baby development", youtubeId: "Y0FdMnvyTC4", duration: "13:20", category: "Trimester Guide" },
  { id: "7", title: "5 Weeks Pregnant - Diet Tips", description: "Early pregnancy dietary and lifestyle changes", youtubeId: "cq4LJM5Vh2o", duration: "10:15", category: "Trimester Guide" },
  { id: "8", title: "Simple Pregnancy Meals", description: "5 quick and nutritious meal ideas for busy moms", youtubeId: "0QZWIuJGVZY", duration: "12:30", category: "Recipes" },
  { id: "9", title: "What I Eat 8 Months Pregnant", description: "Real meals in third trimester - honest and practical", youtubeId: "tAaoN09CHGM", duration: "16:45", category: "Recipes" },
  { id: "10", title: "15 Foods For Healthy Pregnancy", description: "Weekly foods for optimal pregnancy nutrition", youtubeId: "FprOVxmwzR8", duration: "14:20", category: "Recipes" },
  { id: "11", title: "Foods to Avoid While Pregnant", description: "UC Davis dietitian explains pregnancy food safety", youtubeId: "pozcaggYIWk", duration: "11:55", category: "Safety" },
  { id: "12", title: "Gestational Diabetes Diet", description: "Healthy eating with gestational diabetes - nutrition tips", youtubeId: "68NMhivpmWQ", duration: "9:30", category: "Special Diets" },
  { id: "13", title: "Gestational Diabetes Meal Plan", description: "What to eat with gestational diabetes - EatingWell", youtubeId: "DevakSgDEpU", duration: "8:45", category: "Special Diets" },
  { id: "14", title: "Gestational Diabetes Story", description: "Real experience and tips from Diabetes UK", youtubeId: "8xz4VCgx-uE", duration: "6:20", category: "Special Diets" },
  { id: "15", title: "Morning Sickness Smoothie", description: "Nausea-fighting smoothie with ginger and pineapple", youtubeId: "nAQUFef_0nU", duration: "3:45", category: "Special Diets" },
];

const MEAL_TYPE_IDS = ["breakfast", "lunch", "dinner", "snack"] as const;
const DIETARY_PREF_IDS = ["vegetarian", "low-sugar", "high-protein", "low-sodium", "iron-rich", "calcium-rich"] as const;
const CRAVING_IDS = ["sweet", "salty", "sour", "spicy", "creamy"] as const;
const ALLERGY_IDS = ["gluten", "dairy", "nuts", "eggs", "soy", "seafood"] as const;
const PREP_TIME_IDS = ["quick", "medium", "elaborate"] as const;

export default function AIMealSuggestion() {
  const { t } = useTranslation();
  const { streamChat, isLoading, error } = usePregnancyAI();
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
        toolName="AI Meal Suggestion"
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title={t("tools.aiMealSuggestion.title")}
      subtitle={t("toolsInternal.mealSuggestion.subtitle")}
      customIcon="nutrition"
      mood="joyful"
      toolId="ai-meal-suggestion"
    >
      <div className="space-y-5">
        {!suggestion ? (
          <>
            {/* Trimester & Meal Type */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("toolsInternal.mealSuggestion.pregnancyStage")}
                  </label>
                  <Select value={trimester} onValueChange={setTrimester}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">{t("toolsInternal.mealSuggestion.trimesters.first")}</SelectItem>
                      <SelectItem value="2">{t("toolsInternal.mealSuggestion.trimesters.second")}</SelectItem>
                      <SelectItem value="3">{t("toolsInternal.mealSuggestion.trimesters.third")}</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-4 space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("toolsInternal.mealSuggestion.mealType")}
                  </label>
                  <Select value={mealType} onValueChange={setMealType}>
                    <SelectTrigger className="rounded-xl">
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
                </CardContent>
              </Card>
            </div>

            {/* Prep Time */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {t("toolsInternal.mealSuggestion.prepTimeLabel")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {PREP_TIME_IDS.map((p) => (
                    <Button
                      key={p}
                      variant={prepTime === p ? "default" : "outline"}
                      size="sm"
                      className="rounded-full text-xs"
                      onClick={() => setPrepTime(p)}
                    >
                      {t(`toolsInternal.mealSuggestion.prepTimes.${p}`)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cravings */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  {t("toolsInternal.mealSuggestion.whatCraving")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {CRAVING_IDS.map((c) => (
                    <Button
                      key={c}
                      variant={selectedCraving === c ? "default" : "outline"}
                      size="sm"
                      className="rounded-full text-xs"
                      onClick={() =>
                        setSelectedCraving(selectedCraving === c ? "" : c)
                      }
                    >
                      {t(`toolsInternal.mealSuggestion.cravings.${c}`)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dietary Preferences */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-primary" />
                  {t("toolsInternal.mealSuggestion.dietaryPreferences")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {DIETARY_PREF_IDS.map((pref) => (
                    <label
                      key={pref}
                      className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-muted/50 cursor-pointer border border-transparent hover:border-border/50 transition-all"
                    >
                      <Checkbox
                        checked={preferences.includes(pref)}
                        onCheckedChange={() => togglePreference(pref)}
                      />
                      <span className="text-xs font-medium">
                        {t(`toolsInternal.mealSuggestion.preferences.${pref}`)}
                      </span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Allergies */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  {t("toolsInternal.mealSuggestion.allergiesLabel")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {ALLERGY_IDS.map((a) => (
                    <Button
                      key={a}
                      variant={allergies.includes(a) ? "destructive" : "outline"}
                      size="sm"
                      className="rounded-full text-xs"
                      onClick={() => toggleAllergy(a)}
                    >
                      {t(`toolsInternal.mealSuggestion.allergies.${a}`)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Get Suggestion Button */}
            <Button
              onClick={getSuggestion}
              disabled={isLoading}
              className="w-full gap-2 rounded-xl h-12"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {t("toolsInternal.mealSuggestion.suggestMeal")}
            </Button>
          </>
        ) : (
          <>
            {/* Suggestion Result */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-primary" />
                    {t("toolsInternal.mealSuggestion.mealSuggestion")}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {t(`toolsInternal.mealSuggestion.mealTypes.${mealType}`)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
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
                className="flex-1 rounded-xl"
              >
                {t("toolsInternal.mealSuggestion.differentSuggestion")}
              </Button>
              <Button
                onClick={getSuggestion}
                disabled={isLoading}
                className="flex-1 gap-2 rounded-xl"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {t("toolsInternal.mealSuggestion.refresh")}
              </Button>
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-sm text-destructive text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Apple className="w-5 h-5 text-primary shrink-0" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">
                  {t("toolsInternal.mealSuggestion.quickTips")}:
                </p>
                <ul className="list-disc list-inside space-y-1">
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
          videos={nutritionVideos}
          title={t("toolsInternal.mealSuggestion.nutritionVideos")}
          subtitle={t("toolsInternal.mealSuggestion.nutritionVideosSubtitle")}
          accentColor="emerald"
        />
      </div>
    </ToolFrame>
  );
}
