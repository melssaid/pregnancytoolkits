import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Utensils,
  Sparkles,
  Loader2,
  Leaf,
  Apple,
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
  { id: "1", title: "Pregnancy Nutrition Basics", description: "Essential nutrients for a healthy pregnancy", youtubeId: "3fYsj_Bk6mk", duration: "8:42", category: "Nutrition" },
  { id: "2", title: "First Trimester Foods", description: "Best foods for early pregnancy", youtubeId: "0DUzm3Fhzz4", duration: "10:15", category: "Trimester Guide" },
  { id: "3", title: "Iron-Rich Pregnancy Meals", description: "Prevent anemia with these recipes", youtubeId: "hnqLZBJLxUI", duration: "7:30", category: "Nutrition" },
  { id: "4", title: "Healthy Pregnancy Snacks", description: "Quick and nutritious snack ideas", youtubeId: "gKfqTPKMFqE", duration: "6:45", category: "Recipes" },
  { id: "5", title: "Foods to Avoid During Pregnancy", description: "What to skip for baby's safety", youtubeId: "N-7mKfT_Wt4", duration: "9:20", category: "Safety" },
];

const mealTypes = [
  { id: "breakfast", label: "Breakfast", icon: "🌅" },
  { id: "lunch", label: "Lunch", icon: "☀️" },
  { id: "dinner", label: "Dinner", icon: "🌙" },
  { id: "snack", label: "Snack", icon: "🍎" },
];

const dietaryPreferences = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "low-sugar", label: "Low Sugar" },
  { id: "high-protein", label: "High Protein" },
  { id: "low-sodium", label: "Low Sodium" },
  { id: "iron-rich", label: "Iron Rich" },
  { id: "calcium-rich", label: "Calcium Rich" },
];

const cravings = [
  { id: "sweet", label: "Sweet", icon: "🍫" },
  { id: "salty", label: "Salty", icon: "🥨" },
  { id: "sour", label: "Sour", icon: "🍋" },
  { id: "spicy", label: "Spicy", icon: "🌶️" },
  { id: "creamy", label: "Creamy", icon: "🍦" },
];

export default function AIMealSuggestion() {
  const { t } = useTranslation();
  const { streamChat, isLoading, error } = usePregnancyAI();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [trimester, setTrimester] = useState<string>("2");
  const [mealType, setMealType] = useState<string>("lunch");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [selectedCraving, setSelectedCraving] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string>("");

  const togglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const getSuggestion = async () => {
    setSuggestion("");

    const mealLabel = mealTypes.find((m) => m.id === mealType)?.label;
    const prefsText = preferences
      .map((id) => dietaryPreferences.find((p) => p.id === id)?.label)
      .filter(Boolean)
      .join(", ");
    const cravingText = cravings.find((c) => c.id === selectedCraving)?.label;

    const prompt = `I am pregnant in the ${
      trimester === "1" ? "first" : trimester === "2" ? "second" : "third"
    } trimester.
I want a healthy ${mealLabel} suggestion.
${prefsText ? `My preferences: ${prefsText}.` : ""}
${cravingText ? `I'm craving something ${cravingText.toLowerCase()}.` : ""}

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
      subtitle="Smart meal suggestions for your pregnancy"
      customIcon="nutrition"
      mood="joyful"
      toolId="ai-meal-suggestion"
    >
      <div className="space-y-6">
        {!suggestion ? (
          <>
            {/* Trimester & Meal Type */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4 space-y-2">
                  <label className="text-xs text-muted-foreground">
                    Pregnancy Stage
                  </label>
                  <Select value={trimester} onValueChange={setTrimester}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">First Trimester</SelectItem>
                      <SelectItem value="2">Second Trimester</SelectItem>
                      <SelectItem value="3">Third Trimester</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-2">
                  <label className="text-xs text-muted-foreground">Meal Type</label>
                  <Select value={mealType} onValueChange={setMealType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mealTypes.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.icon} {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Cravings */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">What are you craving? 😋</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {cravings.map((c) => (
                    <Button
                      key={c.id}
                      variant={selectedCraving === c.id ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setSelectedCraving(selectedCraving === c.id ? "" : c.id)
                      }
                      className="gap-1"
                    >
                      {c.icon} {c.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dietary Preferences */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-600" />
                  Dietary Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {dietaryPreferences.map((pref) => (
                    <label
                      key={pref.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={preferences.includes(pref.id)}
                        onCheckedChange={() => togglePreference(pref.id)}
                      />
                      <span className="text-sm">{pref.label}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Get Suggestion Button */}
            <Button
              onClick={getSuggestion}
              disabled={isLoading}
              className="w-full gap-2"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Suggest a Healthy Meal
            </Button>
          </>
        ) : (
          <>
            {/* Suggestion Result */}
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-green-600" />
                    Meal Suggestion
                  </CardTitle>
                  <div className="flex gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {mealTypes.find((m) => m.id === mealType)?.icon}{" "}
                      {mealTypes.find((m) => m.id === mealType)?.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <MarkdownRenderer 
                  content={suggestion} 
                  isLoading={isLoading} 
                  accentColor="green-500" 
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => setSuggestion("")}
                variant="outline"
                className="flex-1"
              >
                Different Suggestion
              </Button>
              <Button onClick={getSuggestion} disabled={isLoading} className="flex-1 gap-2">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Refresh
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Apple className="w-5 h-5 text-green-600 shrink-0" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Quick Tips:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Eat 5-6 small meals daily</li>
                  <li>Drink 8-10 glasses of water</li>
                  <li>Avoid raw foods</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Educational Videos */}
        <VideoLibrary
          videos={nutritionVideos}
          title="Pregnancy Nutrition Videos"
          subtitle="Expert guidance on healthy eating"
          accentColor="emerald"
        />
      </div>
    </ToolFrame>
  );
}
