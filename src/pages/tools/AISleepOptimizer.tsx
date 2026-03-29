import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Moon, Clock, ThermometerSun, Brain, Loader2, Bed, Wind } from "lucide-react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolFrame } from "@/components/ToolFrame";
import MedicalDisclaimer from "@/components/compliance/MedicalDisclaimer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { PrintableReport } from '@/components/PrintableReport';
import { useSmartInsight } from "@/hooks/useSmartInsight";
import { useSettings } from "@/hooks/useSettings";
import { VideoLibrary } from "@/components/VideoLibrary";
import { sleepVideosByLang } from "@/data/videoData";

const sleepIssueKeys = [
  { id: "back-pain", key: "backPain" },
  { id: "frequent-urination", key: "frequentUrination" },
  { id: "leg-cramps", key: "legCramps" },
  { id: "heartburn", key: "heartburn" },
  { id: "anxiety", key: "anxiety" },
  { id: "baby-movements", key: "babyMovements" },
  { id: "hot-flashes", key: "hotFlashes" },
  { id: "snoring", key: "snoring" },
];

const AISleepOptimizer = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();

  // Three separate smart insight hooks for three tabs
  const analysisAI = useSmartInsight({ section: 'sleep', toolType: 'sleep-analysis' });
  const meditationAI = useSmartInsight({ section: 'sleep', toolType: 'sleep-meditation' });
  const routineAI = useSmartInsight({ section: 'sleep', toolType: 'sleep-routine' });

  const isLoading = analysisAI.isLoading || meditationAI.isLoading || routineAI.isLoading;

  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [sleepHours, setSleepHours] = useState([6]);
  const [bedtime, setBedtime] = useState("22:00");
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'analysis' | 'meditation' | 'routine'>('analysis');

  const toggleIssue = (issueId: string) => {
    setSelectedIssues(prev =>
      prev.includes(issueId)
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };

  const getIssueLabels = () => selectedIssues.map(id => {
    const issue = sleepIssueKeys.find(i => i.id === id);
    return issue ? t(`toolsInternal.sleepOptimizer.issues.${issue.key}`) : null;
  }).filter(Boolean);

  const analyzeSleep = async () => {
    const issueLabels = getIssueLabels();
    setActiveTab('analysis');
    await analysisAI.generate({
      prompt: `As a pregnancy sleep wellness guide, analyze this sleep profile and provide personalized recommendations:

**Pregnancy Week:** ${settings.pregnancyWeek || "Not specified"}
**Current Sleep:** ${sleepHours[0]} hours/night
**Bedtime:** ${bedtime}
**Sleep Issues:** ${issueLabels.join(", ") || "None specified"}

Provide:
1. **Sleep Quality Assessment** - Rate current sleep and identify main concerns
2. **Optimal Sleep Position** - Best positions for the current pregnancy stage
3. **Pre-Sleep Routine** - 30-minute wind-down routine
4. **Environment Optimization** - Temperature, lighting, pillow setup
5. **Natural Remedies** - Safe herbs, foods, and techniques
6. **When to Wake** - Optimal wake time for circadian rhythm

Include specific product recommendations (pillows, white noise) and YouTube links for pregnancy sleep meditation.`,
      context: { week: Number(settings.pregnancyWeek) || 0 },
    });
  };

  const generateMeditation = async () => {
    const issueLabels = getIssueLabels();
    setActiveTab('meditation');
    await meditationAI.generate({
      prompt: `As a pregnancy relaxation guide, create a calming bedtime meditation script:

**Pregnancy Week:** ${settings.pregnancyWeek || "Not specified"}
**Current Sleep Issues:** ${issueLabels.join(", ") || "General sleep difficulty"}

Create a 10-minute guided meditation script that includes:

1. **Opening** (1 min) - Settling into bed, getting comfortable with pregnancy pillow
2. **Body Scan** (3 mins) - Progressive relaxation from head to toes, acknowledging the growing belly
3. **Breathing Exercise** (2 mins) - 4-7-8 breathing adapted for pregnancy
4. **Visualization** (3 mins) - Peaceful scene connecting with baby
5. **Closing** (1 min) - Gentle transition to sleep

Write it as a script that can be read aloud or followed along. Use calm, soothing language. Include pauses indicated by [...]. Make it pregnancy-specific and nurturing.`,
      context: { week: Number(settings.pregnancyWeek) || 0 },
    });
  };

  const generateRoutine = async () => {
    const issueLabels = getIssueLabels();
    setActiveTab('routine');
    await routineAI.generate({
      prompt: `As a pregnancy sleep wellness guide, create a complete evening routine:

**Pregnancy Week:** ${settings.pregnancyWeek || "Not specified"}
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

Include specific times based on their ${bedtime} bedtime. Add product recommendations (pregnancy pillows, white noise, essential oils that are safe).`,
      context: { week: Number(settings.pregnancyWeek) || 0 },
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
      <div className="space-y-4">
        {/* Sleep Hours */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-primary" />
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
          <Label className="flex items-center gap-2 text-xs">
            <Moon className="w-3.5 h-3.5 text-primary" />
            {t('toolsInternal.sleepOptimizer.usualBedtime')}
          </Label>
          <input
            type="time"
            value={bedtime}
            onChange={(e) => setBedtime(e.target.value)}
            className="w-full p-2 text-sm rounded-lg border bg-background min-w-[140px]"
          />
        </div>

        {/* Sleep Issues */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <ThermometerSun className="w-4 h-4 text-primary shrink-0" />
            <span className="leading-snug">{t('toolsInternal.sleepOptimizer.sleepChallenges')}</span>
          </Label>
          <div className="grid grid-cols-1 gap-1.5">
            {sleepIssueKeys.map((issue) => (
              <div
                key={issue.id}
                onClick={() => toggleIssue(issue.id)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                  selectedIssues.includes(issue.id)
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Checkbox checked={selectedIssues.includes(issue.id)} className="shrink-0" />
                  <span className="text-xs leading-snug">
                    {t(`toolsInternal.sleepOptimizer.issues.${issue.key}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Action Buttons */}
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { onClick: analyzeSleep, tab: 'analysis', icon: Brain, label: t('toolsInternal.sleepOptimizer.sleepPlan'), ai: analysisAI },
            { onClick: generateMeditation, tab: 'meditation', icon: Wind, label: t('toolsInternal.sleepOptimizer.meditation'), ai: meditationAI },
            { onClick: generateRoutine, tab: 'routine', icon: Bed, label: t('toolsInternal.sleepOptimizer.routine'), ai: routineAI },
          ].map(({ onClick, tab, icon: Icon, label, ai }) => (
            <motion.button
              key={tab}
              onClick={onClick}
              disabled={isLoading}
              whileTap={{ scale: 0.92 }}
              className="relative overflow-hidden rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div
                className={`flex flex-col items-center gap-0.5 py-2 px-1 text-xs rounded-xl font-medium transition-all ${activeTab === tab ? 'text-white' : 'text-foreground bg-muted/60 hover:bg-muted'}`}
                style={activeTab === tab ? { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))' } : {}}
              >
                {ai.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                <span className="text-[10px]">{label}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* AI Response - Tabbed Content */}
        {(analysisAI.content || meditationAI.content || routineAI.content) && (
          <PrintableReport title={t('toolsInternal.sleepOptimizer.title')} isLoading={isLoading}>
            <Card className="p-3 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="w-full mb-3">
                  <TabsTrigger value="analysis" className="flex-1" disabled={!analysisAI.content}>
                    <Brain className="w-4 h-4 me-1" />
                    {t('toolsInternal.sleepOptimizer.sleepPlan')}
                  </TabsTrigger>
                  <TabsTrigger value="meditation" className="flex-1" disabled={!meditationAI.content}>
                    <Wind className="w-4 h-4 me-1" />
                    {t('toolsInternal.sleepOptimizer.meditation')}
                  </TabsTrigger>
                  <TabsTrigger value="routine" className="flex-1" disabled={!routineAI.content}>
                    <Bed className="w-4 h-4 me-1" />
                    {t('toolsInternal.sleepOptimizer.routine')}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="analysis" className="max-h-[400px] overflow-y-auto">
                  {analysisAI.content && <MarkdownRenderer content={analysisAI.content} isLoading={analysisAI.isLoading} />}
                </TabsContent>
                
                <TabsContent value="meditation" className="max-h-[400px] overflow-y-auto">
                  {meditationAI.content && <MarkdownRenderer content={meditationAI.content} isLoading={meditationAI.isLoading} />}
                </TabsContent>
                
                <TabsContent value="routine" className="max-h-[400px] overflow-y-auto">
                  {routineAI.content && <MarkdownRenderer content={routineAI.content} isLoading={routineAI.isLoading} />}
                </TabsContent>
              </Tabs>
            </Card>
          </PrintableReport>
        )}

        {/* Sleep Tips */}
        <Card className="p-3 bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            {t('toolsInternal.sleepOptimizer.leftSideTip')}
          </p>
        </Card>

        {/* Educational Videos with Thumbnails */}
        <VideoLibrary
          videosByLang={sleepVideosByLang}
          title={t('toolsInternal.sleepOptimizer.sleepVideos')}
          subtitle={t('toolsInternal.sleepOptimizer.sleepVideosSubtitle')}
          accentColor="violet"
        />
      </div>
    </ToolFrame>
  );
};

export default AISleepOptimizer;
