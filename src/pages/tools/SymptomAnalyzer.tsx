import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Loader2,
  ThermometerSun,
  Baby,
  Brain,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layout } from "@/components/Layout";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";

const commonSymptoms = [
  { id: "nausea", label: "Nausea", icon: "🤢" },
  { id: "fatigue", label: "Fatigue", icon: "😴" },
  { id: "headache", label: "Headache", icon: "🤕" },
  { id: "back-pain", label: "Back Pain", icon: "💆" },
  { id: "swelling", label: "Swollen Feet", icon: "🦶" },
  { id: "cramps", label: "Cramps", icon: "⚡" },
  { id: "heartburn", label: "Heartburn", icon: "🔥" },
  { id: "insomnia", label: "Insomnia", icon: "🌙" },
  { id: "mood-swings", label: "Mood Swings", icon: "😢" },
  { id: "dizziness", label: "Dizziness", icon: "💫" },
  { id: "bleeding", label: "Light Bleeding", icon: "🩸" },
  { id: "discharge", label: "Unusual Discharge", icon: "💧" },
];

export default function SymptomAnalyzer() {
  const { t } = useTranslation();
  const { streamChat, isLoading, error } = usePregnancyAI();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [week, setWeek] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) return;

    setAnalysis("");
    const symptomsText = selectedSymptoms
      .map((id) => commonSymptoms.find((s) => s.id === id)?.label)
      .join(", ");

    const prompt = `I am pregnant in week ${week || "unspecified"}.
I am experiencing the following symptoms: ${symptomsText}.
${additionalNotes ? `Additional notes: ${additionalNotes}` : ""}

Please analyze these symptoms and provide general, informational guidance (not medical diagnosis).`;

    await streamChat({
      type: "symptom-analysis",
      messages: [{ role: "user", content: prompt }],
      context: { week: parseInt(week) || undefined, symptoms: selectedSymptoms },
      onDelta: (chunk) => setAnalysis((prev) => prev + chunk),
      onDone: () => {},
    });
  };

  const reset = () => {
    setSelectedSymptoms([]);
    setAdditionalNotes("");
    setAnalysis("");
  };

  const pageTitle = t("tools.symptomAnalyzer.title");

  return (
    <Layout title={pageTitle} showBack>
      <div className="space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-4 py-2 rounded-full">
            <Stethoscope className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">{pageTitle}</span>
          </div>
        </motion.div>

        {!analysis ? (
          <>
            {/* Week Selector */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Baby className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Pregnancy Week:</span>
                  <Select value={week} onValueChange={setWeek}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 40 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          Week {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Symptoms Grid */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ThermometerSun className="w-5 h-5 text-primary" />
                  Select the symptoms you're experiencing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {commonSymptoms.map((symptom) => (
                    <motion.button
                      key={symptom.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleSymptom(symptom.id)}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                        selectedSymptoms.includes(symptom.id)
                          ? "bg-primary/10 border-primary"
                          : "bg-card border-border/50 hover:border-primary/30"
                      }`}
                    >
                      <span className="text-lg">{symptom.icon}</span>
                      <span className="text-sm">{symptom.label}</span>
                      {selectedSymptoms.includes(symptom.id) && (
                        <CheckCircle className="w-4 h-4 text-primary ml-auto" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <Textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Add any additional notes about your symptoms..."
                  className="min-h-[80px]"
                />
              </CardContent>
            </Card>

            {/* Analyze Button */}
            <Button
              onClick={analyzeSymptoms}
              disabled={selectedSymptoms.length === 0 || isLoading}
              className="w-full gap-2"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Analyze Symptoms with AI
            </Button>
          </>
        ) : (
          <>
            {/* Analysis Result */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    Analysis Result
                  </CardTitle>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedSymptoms.map((id) => {
                      const symptom = commonSymptoms.find((s) => s.id === id);
                      return (
                        <Badge key={id} variant="secondary" className="text-xs">
                          {symptom?.icon} {symptom?.label}
                        </Badge>
                      );
                    })}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {analysis}
                      {isLoading && (
                        <span className="inline-block w-2 h-4 bg-primary/50 animate-pulse ml-1" />
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={reset} variant="outline" className="flex-1">
                New Analysis
              </Button>
            </div>
          </>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-sm text-destructive text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Warning */}
        <Card className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <p className="font-medium">Important Notice:</p>
              <p>
                This analysis is for informational purposes only and is not a substitute
                for medical examination. In case of severe symptoms, bleeding, or acute
                pain, consult your doctor immediately.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
