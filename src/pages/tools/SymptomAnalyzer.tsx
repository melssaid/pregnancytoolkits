import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Loader2,
  Baby,
  Brain,
  HeartPulse,
  Activity,
  Zap,
  Moon,
  Flame,
  CloudRain,
  Frown,
  Wind,
  Droplets,
  CircleDot,
  RefreshCw,
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
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

const commonSymptoms = [
  { id: "nausea", label: "Nausea", icon: CloudRain, color: "text-green-500" },
  { id: "fatigue", label: "Fatigue", icon: Moon, color: "text-indigo-500" },
  { id: "headache", label: "Headache", icon: Zap, color: "text-amber-500" },
  { id: "back-pain", label: "Back Pain", icon: Activity, color: "text-blue-500" },
  { id: "swelling", label: "Swollen Feet", icon: Droplets, color: "text-cyan-500" },
  { id: "cramps", label: "Cramps", icon: Zap, color: "text-orange-500" },
  { id: "heartburn", label: "Heartburn", icon: Flame, color: "text-red-500" },
  { id: "insomnia", label: "Insomnia", icon: Moon, color: "text-purple-500" },
  { id: "mood-swings", label: "Mood Swings", icon: Frown, color: "text-pink-500" },
  { id: "dizziness", label: "Dizziness", icon: Wind, color: "text-teal-500" },
  { id: "bleeding", label: "Light Bleeding", icon: HeartPulse, color: "text-rose-500" },
  { id: "discharge", label: "Unusual Discharge", icon: CircleDot, color: "text-violet-500" },
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
    <Layout showBack>
      <div className="container py-6 space-y-5">
        {/* Header - Clean and consistent */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{pageTitle}</h1>
              <p className="text-xs text-muted-foreground">
                Select symptoms for personalized insights
              </p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!analysis ? (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Week Selector */}
              <Card className="border-border/50 overflow-hidden">
                <div className="bg-gradient-to-r from-primary/5 to-transparent p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Baby className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium">Pregnancy Week</span>
                      <p className="text-xs text-muted-foreground">For accurate analysis</p>
                    </div>
                    <Select value={week} onValueChange={setWeek}>
                      <SelectTrigger className="w-28 bg-background">
                        <SelectValue placeholder="Week" />
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
                </div>
              </Card>

              {/* Symptoms Grid */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-primary" />
                    What are you experiencing?
                  </CardTitle>
                  {selectedSymptoms.length > 0 && (
                    <Badge variant="secondary" className="w-fit text-xs">
                      {selectedSymptoms.length} selected
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-2">
                    {commonSymptoms.map((symptom, index) => {
                      const isSelected = selectedSymptoms.includes(symptom.id);
                      const IconComponent = symptom.icon;
                      return (
                        <motion.button
                          key={symptom.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => toggleSymptom(symptom.id)}
                          className={`relative flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                            isSelected
                              ? "bg-primary/10 border-primary shadow-sm"
                              : "bg-card border-border/50 hover:border-primary/40 hover:bg-muted/50"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected ? "bg-primary/20" : "bg-muted"
                          }`}>
                            <IconComponent className={`w-4 h-4 ${isSelected ? "text-primary" : symptom.color}`} />
                          </div>
                          <span className={`text-xs font-medium flex-1 text-left ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`}>
                            {symptom.label}
                          </span>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-1.5 right-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Additional Details (Optional)
                  </label>
                  <Textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Describe your symptoms in more detail..."
                    className="min-h-[80px] resize-none text-sm"
                  />
                </CardContent>
              </Card>

              {/* Analyze Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  onClick={analyzeSymptoms}
                  disabled={selectedSymptoms.length === 0 || isLoading}
                  className="w-full gap-2 h-12 text-sm font-semibold shadow-lg"
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Analyze with AI
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Analysis Result */}
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-primary" />
                    </div>
                    <CardTitle className="text-sm">AI Analysis</CardTitle>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {selectedSymptoms.map((id) => {
                      const symptom = commonSymptoms.find((s) => s.id === id);
                      const IconComponent = symptom?.icon;
                      return (
                        <Badge key={id} variant="secondary" className="text-xs gap-1 py-1">
                          {IconComponent && <IconComponent className="w-3 h-3" />}
                          {symptom?.label}
                        </Badge>
                      );
                    })}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-background/60 rounded-xl p-4 border border-border/30">
                    <MarkdownRenderer 
                      content={analysis} 
                      isLoading={isLoading} 
                      accentColor="primary" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Button onClick={reset} variant="outline" className="w-full gap-2 h-11">
                <RefreshCw className="w-4 h-4" />
                Start New Analysis
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="p-4">
                <p className="text-sm text-destructive text-center">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Warning */}
        <Card className="border-amber-500/30 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20">
          <CardContent className="p-4 flex gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
              <p className="font-semibold">Medical Disclaimer</p>
              <p className="leading-relaxed opacity-90">
                This is for informational purposes only. For severe symptoms, bleeding, or acute pain, 
                consult your healthcare provider immediately.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
