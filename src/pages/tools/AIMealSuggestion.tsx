import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
  Utensils, 
  Sparkles, 
  Loader2, 
  Leaf, 
  Apple,
  ChefHat,
  Clock,
  Flame
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Layout } from "@/components/Layout";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";

const mealTypes = [
  { id: "breakfast", label: "فطور", icon: "🌅" },
  { id: "lunch", label: "غداء", icon: "☀️" },
  { id: "dinner", label: "عشاء", icon: "🌙" },
  { id: "snack", label: "وجبة خفيفة", icon: "🍎" },
];

const dietaryPreferences = [
  { id: "vegetarian", label: "نباتي" },
  { id: "low-sugar", label: "قليل السكر" },
  { id: "high-protein", label: "غني بالبروتين" },
  { id: "low-sodium", label: "قليل الملح" },
  { id: "iron-rich", label: "غني بالحديد" },
  { id: "calcium-rich", label: "غني بالكالسيوم" },
];

const cravings = [
  { id: "sweet", label: "حلو", icon: "🍫" },
  { id: "salty", label: "مالح", icon: "🥨" },
  { id: "sour", label: "حامض", icon: "🍋" },
  { id: "spicy", label: "حار", icon: "🌶️" },
  { id: "creamy", label: "كريمي", icon: "🍦" },
];

export default function AIMealSuggestion() {
  const { t } = useTranslation();
  const { streamChat, isLoading, error } = usePregnancyAI();
  const [trimester, setTrimester] = useState<string>("2");
  const [mealType, setMealType] = useState<string>("lunch");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [selectedCraving, setSelectedCraving] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string>("");

  const togglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const getSuggestion = async () => {
    setSuggestion("");

    const mealLabel = mealTypes.find((m) => m.id === mealType)?.label;
    const prefsText = preferences
      .map((id) => dietaryPreferences.find((p) => p.id === id)?.label)
      .filter(Boolean)
      .join("، ");
    const cravingText = cravings.find((c) => c.id === selectedCraving)?.label;

    const prompt = `أنا حامل في الثلث ${trimester === "1" ? "الأول" : trimester === "2" ? "الثاني" : "الثالث"}.
أريد اقتراح ${mealLabel} صحي.
${prefsText ? `تفضيلاتي: ${prefsText}.` : ""}
${cravingText ? `أشتهي شيء ${cravingText}.` : ""}

قدمي لي وصفة سهلة مع المكونات وطريقة التحضير والقيم الغذائية.`;

    await streamChat({
      type: "meal-suggestion",
      messages: [{ role: "user", content: prompt }],
      context: { trimester: parseInt(trimester) },
      onDelta: (chunk) => setSuggestion((prev) => prev + chunk),
      onDone: () => {},
    });
  };

  return (
    <Layout title="اقتراحات الوجبات الذكية" showBack>
      <div className="space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-2 rounded-full">
            <ChefHat className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">وجبات مخصصة بالذكاء الاصطناعي</span>
          </div>
        </motion.div>

        {!suggestion ? (
          <>
            {/* Trimester & Meal Type */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-2">
                  <label className="text-xs text-muted-foreground">مرحلة الحمل</label>
                  <Select value={trimester} onValueChange={setTrimester}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">الثلث الأول</SelectItem>
                      <SelectItem value="2">الثلث الثاني</SelectItem>
                      <SelectItem value="3">الثلث الثالث</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-4 space-y-2">
                  <label className="text-xs text-muted-foreground">نوع الوجبة</label>
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
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">ماذا تشتهين؟ 😋</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {cravings.map((c) => (
                    <Button
                      key={c.id}
                      variant={selectedCraving === c.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCraving(selectedCraving === c.id ? "" : c.id)}
                      className="gap-1"
                    >
                      {c.icon} {c.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dietary Preferences */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-600" />
                  تفضيلات غذائية
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
              اقترحي لي وجبة صحية
            </Button>
          </>
        ) : (
          <>
            {/* Suggestion Result */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-green-600" />
                      اقتراح الوجبة
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
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {suggestion}
                      {isLoading && <span className="inline-block w-2 h-4 bg-green-500/50 animate-pulse ml-1" />}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={() => setSuggestion("")} variant="outline" className="flex-1">
                اقتراح آخر
              </Button>
              <Button onClick={getSuggestion} disabled={isLoading} className="flex-1 gap-2">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                تجديد
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
              <Apple className="w-5 h-5 text-green-600 shrink-0" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">نصائح سريعة:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>تناولي 5-6 وجبات صغيرة يومياً</li>
                  <li>اشربي 8-10 أكواب ماء</li>
                  <li>تجنبي الأطعمة النيئة</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}