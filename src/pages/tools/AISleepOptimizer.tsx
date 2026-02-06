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
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';

const sleepIssueKeys = [
  { id: "back-pain", key: "backPain", icon: "🔙" },
  { id: "frequent-urination", key: "frequentUrination", icon: "🚽" },
  { id: "leg-cramps", key: "legCramps", icon: "🦵" },
  { id: "heartburn", key: "heartburn", icon: "🔥" },
  { id: "anxiety", key: "anxiety", icon: "💭" },
  { id: "baby-movements", key: "babyMovements", icon: "👶" },
  { id: "hot-flashes", key: "hotFlashes", icon: "🌡️" },
  { id: "snoring", key: "snoring", icon: "😮‍💨" },
];

const sleepVideos: Video[] = [
  {
    id: "1",
    title: "Pregnancy Relaxation Meditation",
    description: "Calming meditation for better sleep during pregnancy",
    youtubeId: "pCSjhbVOdYQ",
    duration: "60:00",
    category: "Meditation"
  },
  {
    id: "2",
    title: "Prenatal Sleep Meditation",
    description: "Cozy sleep meditation for expecting mothers",
    youtubeId: "FdeqyQTavzI",
    duration: "25:00",
    category: "Meditation"
  },
  {
    id: "3",
    title: "Prenatal Yoga for Relaxation",
    description: "Deep relaxation yoga nidra for pregnancy",
    youtubeId: "vEcZD8Js2Ws",
    duration: "25:00",
    category: "Sleep Tips"
  },
  {
    id: "4",
    title: "Newborn Sleep Preparation",
    description: "Prepare for baby's sleep schedule",
    youtubeId: "hpgjwK_oQe0",
    duration: "18:00",
    category: "Preparation"
  },
];

const AISleepOptimizer = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { streamChat, isLoading } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setResponse('');
    setMeditationScript('');
    setRoutinePlan('');
  });
  
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
    const issueLabels = selectedIssues.map(id => {
      const issue = sleepIssueKeys.find(i => i.id === id);
      return issue ? t(`toolsInternal.sleepOptimizer.issues.${issue.key}`) : null;
    }).filter(Boolean);

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
    const issueLabels = selectedIssues.map(id => {
      const issue = sleepIssueKeys.find(i => i.id === id);
      return issue ? t(`toolsInternal.sleepOptimizer.issues.${issue.key}`) : null;
    }).filter(Boolean);

    const prompt = `As a sleep meditation specialist for pregnant women, create a calming bedtime meditation script:

**Pregnancy Week:** ${settings.pregnancyWeek || 20}
**Current Sleep Issues:** ${issueLabels.join(", ") || "General sleep difficulty"}

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
    const issueLabels = selectedIssues.map(id => {
      const issue = sleepIssueKeys.find(i => i.id === id);
      return issue ? t(`toolsInternal.sleepOptimizer.issues.${issue.key}`) : null;
    }).filter(Boolean);

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
        toolName={t('toolsInternal.sleepOptimizer.title')}
      />
    );
  }

  return (
    <ToolFrame
      title={t('toolsInternal.sleepOptimizer.title')}
      subtitle={t('toolsInternal.sleepOptimizer.subtitle')}
      customIcon="pregnant-woman"
      mood="calm"
      toolId="ai-sleep-optimizer"
    >
      <div className="space-y-6">
        {/* Sleep Hours */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            {t('toolsInternal.sleepOptimizer.currentSleep', { hours: sleepHours[0] })}
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
            {t('toolsInternal.sleepOptimizer.usualBedtime')}
          </Label>
          <input
            type="time"
            value={bedtime}
            onChange={(e) => setBedtime(e.target.value)}
            className="w-full p-3 rounded-lg border bg-background min-w-[140px]"
          />
        </div>

        {/* Sleep Issues */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <ThermometerSun className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{t('toolsInternal.sleepOptimizer.sleepChallenges')}</span>
          </Label>
          <div className="grid grid-cols-1 gap-1.5">
            {sleepIssueKeys.map((issue) => (
              <div
                key={issue.id}
                onClick={() => toggleIssue(issue.id)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all overflow-hidden ${
                  selectedIssues.includes(issue.id)
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Checkbox checked={selectedIssues.includes(issue.id)} className="shrink-0" />
                  <span className="text-base shrink-0">{issue.icon}</span>
                  <span className="text-xs sm:text-sm truncate">
                    {t(`toolsInternal.sleepOptimizer.issues.${issue.key}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Action Buttons */}
        <div className="grid grid-cols-3 gap-1.5">
          <Button
            onClick={analyzeSleep}
            disabled={isLoading}
            variant={activeTab === 'analysis' ? 'default' : 'outline'}
            className="flex-col h-auto py-2 gap-0.5"
          >
            {isLoading && activeTab === 'analysis' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
            <span className="text-[10px]">{t('toolsInternal.sleepOptimizer.sleepPlan')}</span>
          </Button>
          <Button
            onClick={generateMeditation}
            disabled={isLoading}
            variant={activeTab === 'meditation' ? 'default' : 'outline'}
            className="flex-col h-auto py-2 gap-0.5"
          >
            {isLoading && activeTab === 'meditation' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wind className="w-4 h-4" />
            )}
            <span className="text-[10px]">{t('toolsInternal.sleepOptimizer.meditation')}</span>
          </Button>
          <Button
            onClick={generateRoutine}
            disabled={isLoading}
            variant={activeTab === 'routine' ? 'default' : 'outline'}
            className="flex-col h-auto py-2 gap-0.5"
          >
            {isLoading && activeTab === 'routine' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Bed className="w-4 h-4" />
            )}
            <span className="text-[10px]">{t('toolsInternal.sleepOptimizer.routine')}</span>
          </Button>
        </div>

        {/* AI Response - Tabbed Content */}
        {(response || meditationScript || routinePlan) && (
          <Card className="p-3 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="w-full mb-3">
                <TabsTrigger value="analysis" className="flex-1" disabled={!response}>
                  <Brain className="w-4 h-4 me-1" />
                  {t('toolsInternal.sleepOptimizer.sleepPlan')}
                </TabsTrigger>
                <TabsTrigger value="meditation" className="flex-1" disabled={!meditationScript}>
                  <Wind className="w-4 h-4 me-1" />
                  {t('toolsInternal.sleepOptimizer.meditation')}
                </TabsTrigger>
                <TabsTrigger value="routine" className="flex-1" disabled={!routinePlan}>
                  <Bed className="w-4 h-4 me-1" />
                  {t('toolsInternal.sleepOptimizer.routine')}
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
            {t('toolsInternal.sleepOptimizer.leftSideTip')}
          </p>
        </Card>

        {/* Educational Videos with Thumbnails */}
        <VideoLibrary
          videos={sleepVideos}
          title={t('toolsInternal.sleepOptimizer.sleepVideos')}
          subtitle={t('toolsInternal.sleepOptimizer.sleepVideosSubtitle')}
          accentColor="violet"
        />
      </div>
    </ToolFrame>
  );
};

export default AISleepOptimizer;
