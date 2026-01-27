import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Moon, Sparkles, Clock, ThermometerSun, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { ToolFrame } from "@/components/ToolFrame";
import MedicalDisclaimer from "@/components/compliance/MedicalDisclaimer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useSettings } from "@/hooks/useSettings";

const sleepIssues = [
  { id: "back-pain", label: "Back pain", icon: "🔙" },
  { id: "frequent-urination", label: "Frequent urination", icon: "🚽" },
  { id: "leg-cramps", label: "Leg cramps", icon: "🦵" },
  { id: "heartburn", label: "Heartburn", icon: "🔥" },
  { id: "anxiety", label: "Anxiety/racing thoughts", icon: "💭" },
  { id: "baby-movements", label: "Baby movements", icon: "👶" },
  { id: "hot-flashes", label: "Hot flashes", icon: "🌡️" },
  { id: "snoring", label: "Snoring/breathing issues", icon: "😮‍💨" },
];

const AISleepOptimizer = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { streamChat, isLoading } = usePregnancyAI();
  
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [sleepHours, setSleepHours] = useState([6]);
  const [bedtime, setBedtime] = useState("22:00");
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [response, setResponse] = useState("");

  const toggleIssue = (issueId: string) => {
    setSelectedIssues(prev =>
      prev.includes(issueId)
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };

  const analyzeSleep = async () => {
    const issueLabels = selectedIssues.map(id => 
      sleepIssues.find(i => i.id === id)?.label
    ).filter(Boolean);

    const prompt = `As a pregnancy sleep specialist, analyze this sleep profile and provide personalized recommendations:

**Pregnancy Week:** ${settings.pregnancyWeek || 20}
**Current Sleep:** ${sleepHours[0]} hours/night
**Bedtime:** ${bedtime}
**Sleep Issues:** ${issueLabels.join(", ") || "None specified"}

Provide:
1. **Sleep Quality Assessment** - Rate current sleep and identify main concerns
2. **Optimal Sleep Position** - Best positions for pregnancy week ${settings.pregnancyWeek || 20}
3. **Pre-Sleep Routine** - 30-minute wind-down routine
4. **Environment Optimization** - Temperature, lighting, pillow setup
5. **Natural Remedies** - Safe herbs, foods, and techniques
6. **When to Wake** - Optimal wake time for circadian rhythm

Include specific product recommendations (pillows, white noise) and YouTube links for pregnancy sleep meditation.`;

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
        toolName="AI Sleep Quality Optimizer"
      />
    );
  }

  return (
    <ToolFrame
      title="AI Sleep Optimizer"
      icon={Moon}
      mood="calm"
    >
      <div className="space-y-6">
        {/* Sleep Video Guide */}
        <Card className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-200">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Pregnancy Sleep Meditation
          </h3>
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/aEqlQvczMJQ"
              title="Pregnancy Sleep Meditation"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            />
          </div>
        </Card>

        {/* Sleep Hours */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Current Sleep: {sleepHours[0]} hours/night
          </Label>
          <Slider
            value={sleepHours}
            onValueChange={setSleepHours}
            max={12}
            min={3}
            step={0.5}
            className="w-full"
          />
        </div>

        {/* Bedtime */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-primary" />
            Usual Bedtime
          </Label>
          <input
            type="time"
            value={bedtime}
            onChange={(e) => setBedtime(e.target.value)}
            className="w-full p-3 rounded-lg border bg-background min-w-[140px]"
          />
        </div>

        {/* Sleep Issues */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <ThermometerSun className="w-4 h-4 text-primary" />
            Sleep Challenges
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {sleepIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => toggleIssue(issue.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedIssues.includes(issue.id)
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Checkbox checked={selectedIssues.includes(issue.id)} />
                  <span className="text-lg">{issue.icon}</span>
                  <span className="text-sm">{issue.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analyze Button */}
        <Button
          onClick={analyzeSleep}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? "Analyzing..." : "Get AI Sleep Plan"}
        </Button>

        {/* AI Response */}
        {response && (
          <Card className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Your Personalized Sleep Plan
          </h3>
          <MarkdownRenderer content={response} isLoading={isLoading} />
        </Card>
        )}

        {/* Sleep Tips Image */}
        <Card className="p-4 bg-muted/50">
          <img
            src="https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=800&h=400&fit=crop"
            alt="Pregnancy sleep positions"
            className="w-full rounded-lg mb-3"
          />
          <p className="text-sm text-muted-foreground text-center">
            💡 Left-side sleeping is recommended after week 20 for optimal blood flow
          </p>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default AISleepOptimizer;
