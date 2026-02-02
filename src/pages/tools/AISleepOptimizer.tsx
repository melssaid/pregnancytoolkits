import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Moon, Clock, ThermometerSun, Brain, Loader2, Bed, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolFrame } from "@/components/ToolFrame";
import MedicalDisclaimer from "@/components/compliance/MedicalDisclaimer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useSettings } from "@/hooks/useSettings";
import { VideoLibrary, Video } from "@/components/VideoLibrary";

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

const sleepVideos: Video[] = [
  {
    id: "1",
    title: "Best Pregnancy Sleeping Positions By Trimester",
    description: "Learn the best positions for each trimester and what to avoid",
    youtubeId: "llK1G5lHlWM",
    duration: "8:30",
    category: "Sleep Positions"
  },
  {
    id: "2",
    title: "How to Sleep During Third Trimester",
    description: "Safe and comfortable sleep tips for late pregnancy",
    youtubeId: "xdKDw8E6LSs",
    duration: "6:45",
    category: "Sleep Tips"
  },
  {
    id: "3",
    title: "Pregnancy Meditation for Relaxation & Sleep",
    description: "1 hour guided meditation for peaceful sleep",
    youtubeId: "pCSjhbVOdYQ",
    duration: "60:00",
    category: "Meditation"
  },
  {
    id: "4",
    title: "Guided Meditation for Pregnancy Insomnia",
    description: "10-minute meditation to help with sleep difficulties",
    youtubeId: "SXsB3zx4Rxc",
    duration: "10:15",
    category: "Meditation"
  },
  {
    id: "5",
    title: "Pillow Supported Positioning for Pregnancy",
    description: "How to use pillows for better rest and less pain",
    youtubeId: "iIluTuRUjOI",
    duration: "7:20",
    category: "Sleep Tips"
  },
  {
    id: "6",
    title: "Pregnancy Sleep Affirmations",
    description: "Relaxing affirmations to help you drift off to sleep",
    youtubeId: "Ygkgf9RnJ94",
    duration: "30:00",
    category: "Relaxation"
  },
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
  const [activeTab, setActiveTab] = useState<'analysis' | 'meditation' | 'routine'>('analysis');
  const [meditationScript, setMeditationScript] = useState("");
  const [routinePlan, setRoutinePlan] = useState("");

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

  const generateMeditation = async () => {
    const prompt = `As a sleep meditation specialist for pregnant women, create a calming bedtime meditation script:

**Pregnancy Week:** ${settings.pregnancyWeek || 20}
**Current Sleep Issues:** ${selectedIssues.map(id => sleepIssues.find(i => i.id === id)?.label).filter(Boolean).join(", ") || "General sleep difficulty"}

Create a 10-minute guided meditation script that includes:

1. **Opening** (1 min) - Settling into bed, getting comfortable with pregnancy pillow
2. **Body Scan** (3 mins) - Progressive relaxation from head to toes, acknowledging the growing belly
3. **Breathing Exercise** (2 mins) - 4-7-8 breathing adapted for pregnancy
4. **Visualization** (3 mins) - Peaceful scene connecting with baby
5. **Closing** (1 min) - Gentle transition to sleep

Write it as a script that can be read aloud or followed along. Use calm, soothing language. Include pauses indicated by [...]. Make it pregnancy-specific and nurturing.`;

    setMeditationScript("");
    setActiveTab('meditation');
    
    await streamChat({
      type: "pregnancy-assistant",
      messages: [{ role: "user", content: prompt }],
      context: { week: Number(settings.pregnancyWeek) || 20 },
      onDelta: (text) => setMeditationScript((prev) => prev + text),
      onDone: () => {},
    });
  };

  const generateRoutine = async () => {
    const issueLabels = selectedIssues.map(id => 
      sleepIssues.find(i => i.id === id)?.label
    ).filter(Boolean);

    const prompt = `As a pregnancy sleep specialist, create a complete evening routine:

**Pregnancy Week:** ${settings.pregnancyWeek || 20}
**Current Bedtime:** ${bedtime}
**Sleep Issues:** ${issueLabels.join(", ") || "General improvement"}
**Current Sleep Duration:** ${sleepHours[0]} hours

Design a detailed 2-hour wind-down routine:

**Hour 1: Active Wind-Down (2 hours before bed)**
- Light activities to do
- Last food/drink recommendations
- Screen time cutoff

**Hour 2: Passive Wind-Down (1 hour before bed)**
- Bathroom routine
- Bedroom preparation
- Relaxation activities

**Final 30 Minutes**
- Pillow positioning guide
- Breathing exercises
- Mental preparation

Include specific times based on their ${bedtime} bedtime. Add product recommendations (pregnancy pillows, white noise, essential oils that are safe).`;

    setRoutinePlan("");
    setActiveTab('routine');
    
    await streamChat({
      type: "pregnancy-assistant",
      messages: [{ role: "user", content: prompt }],
      context: { week: Number(settings.pregnancyWeek) || 20 },
      onDelta: (text) => setRoutinePlan((prev) => prev + text),
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
      subtitle="Personalized sleep advice for pregnancy"
      customIcon="pregnant-woman"
      mood="calm"
      toolId="ai-sleep-optimizer"
    >
      <div className="space-y-6">
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

        {/* AI Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={analyzeSleep}
            disabled={isLoading}
            variant={activeTab === 'analysis' ? 'default' : 'outline'}
            className="flex-col h-auto py-3 gap-1"
          >
            {isLoading && activeTab === 'analysis' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Brain className="w-5 h-5" />
            )}
            <span className="text-xs">Sleep Plan</span>
          </Button>
          <Button
            onClick={generateMeditation}
            disabled={isLoading}
            variant={activeTab === 'meditation' ? 'default' : 'outline'}
            className="flex-col h-auto py-3 gap-1"
          >
            {isLoading && activeTab === 'meditation' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Wind className="w-5 h-5" />
            )}
            <span className="text-xs">Meditation</span>
          </Button>
          <Button
            onClick={generateRoutine}
            disabled={isLoading}
            variant={activeTab === 'routine' ? 'default' : 'outline'}
            className="flex-col h-auto py-3 gap-1"
          >
            {isLoading && activeTab === 'routine' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Bed className="w-5 h-5" />
            )}
            <span className="text-xs">Routine</span>
          </Button>
        </div>

        {/* AI Response - Tabbed Content */}
        {(response || meditationScript || routinePlan) && (
          <Card className="p-4 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="analysis" className="flex-1" disabled={!response}>
                  <Brain className="w-4 h-4 mr-1" />
                  Sleep Plan
                </TabsTrigger>
                <TabsTrigger value="meditation" className="flex-1" disabled={!meditationScript}>
                  <Wind className="w-4 h-4 mr-1" />
                  Meditation
                </TabsTrigger>
                <TabsTrigger value="routine" className="flex-1" disabled={!routinePlan}>
                  <Bed className="w-4 h-4 mr-1" />
                  Routine
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="analysis" className="max-h-[400px] overflow-y-auto">
                {response && <MarkdownRenderer content={response} isLoading={isLoading && activeTab === 'analysis'} />}
              </TabsContent>
              
              <TabsContent value="meditation" className="max-h-[400px] overflow-y-auto">
                {meditationScript && <MarkdownRenderer content={meditationScript} isLoading={isLoading && activeTab === 'meditation'} />}
              </TabsContent>
              
              <TabsContent value="routine" className="max-h-[400px] overflow-y-auto">
                {routinePlan && <MarkdownRenderer content={routinePlan} isLoading={isLoading && activeTab === 'routine'} />}
              </TabsContent>
            </Tabs>
          </Card>
        )}

        {/* Sleep Tips */}
        <Card className="p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground text-center">
            💡 Left-side sleeping is recommended after week 20 for optimal blood flow
          </p>
        </Card>

        {/* Educational Videos with Thumbnails */}
        <VideoLibrary
          videos={sleepVideos}
          title="Pregnancy Sleep Videos"
          subtitle="Expert tips for better sleep during pregnancy"
          accentColor="violet"
        />
      </div>
    </ToolFrame>
  );
};

export default AISleepOptimizer;
