import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Moon, Clock, ThermometerSun, Brain, Loader2, Bed, Wind, Heart, Utensils, AlertCircle, Crown } from "lucide-react";
import { motion } from "framer-motion";
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
import { useAIUsage } from "@/contexts/AIUsageContext";
import { AIActionButton } from '@/components/ai/AIActionButton';
import { AIResponseFrame } from '@/components/ai/AIResponseFrame';
import { PrintableReport } from '@/components/PrintableReport';
import { useSettings } from "@/hooks/useSettings";
import { VideoLibrary } from "@/components/VideoLibrary";
import { useResetOnLanguageChange } from "@/hooks/useResetOnLanguageChange";
import { sleepVideosByLang, nauseaVideosByLang } from "@/data/videoData";

// ═══════════════════════════════════════════════════════════════
// Sleep Issues Data
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
// Nausea Data
// ═══════════════════════════════════════════════════════════════
const nauseaTriggers = [
  { id: "morning", labelKey: "toolsInternal.nauseaRelief.triggers.morning" },
  { id: "evening", labelKey: "toolsInternal.nauseaRelief.triggers.evening" },
  { id: "all-day", labelKey: "toolsInternal.nauseaRelief.triggers.allDay" },
  { id: "smells", labelKey: "toolsInternal.nauseaRelief.triggers.smells" },
  { id: "empty-stomach", labelKey: "toolsInternal.nauseaRelief.triggers.emptyStomach" },
  { id: "after-eating", labelKey: "toolsInternal.nauseaRelief.triggers.afterEating" },
  { id: "motion", labelKey: "toolsInternal.nauseaRelief.triggers.motion" },
  { id: "cooking", labelKey: "toolsInternal.nauseaRelief.triggers.cooking" },
];

const quickRemedies = [
  { nameKey: "toolsInternal.nauseaRelief.remedies.lemonWater.name", tipKey: "toolsInternal.nauseaRelief.remedies.lemonWater.tip" },
  { nameKey: "toolsInternal.nauseaRelief.remedies.ginger.name", tipKey: "toolsInternal.nauseaRelief.remedies.ginger.tip" },
  { nameKey: "toolsInternal.nauseaRelief.remedies.iceChips.name", tipKey: "toolsInternal.nauseaRelief.remedies.iceChips.tip" },
  { nameKey: "toolsInternal.nauseaRelief.remedies.dryCrackers.name", tipKey: "toolsInternal.nauseaRelief.remedies.dryCrackers.tip" },
  { nameKey: "toolsInternal.nauseaRelief.remedies.peppermint.name", tipKey: "toolsInternal.nauseaRelief.remedies.peppermint.tip" },
  { nameKey: "toolsInternal.nauseaRelief.remedies.banana.name", tipKey: "toolsInternal.nauseaRelief.remedies.banana.tip" },
];

// ═══════════════════════════════════════════════════════════════
// Sleep Tab
// ═══════════════════════════════════════════════════════════════
function SleepTab() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { streamChat, isLoading } = usePregnancyAI();
  const { isLimitReached } = useAIUsage();

  const [sleepHours, setSleepHours] = useState([6]);
  const [bedtime, setBedtime] = useState("22:00");
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [response, setResponse] = useState("");
  const [activeTab, setActiveTab] = useState<'analysis' | 'meditation' | 'routine'>('analysis');
  const [meditationScript, setMeditationScript] = useState("");
  const [routinePlan, setRoutinePlan] = useState("");

  const toggleIssue = (id: string) => {
    setSelectedIssues(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getIssueLabels = () => selectedIssues.map(id => {
    const issue = sleepIssueKeys.find(i => i.id === id);
    return issue ? t(`toolsInternal.sleepOptimizer.issues.${issue.key}`) : null;
  }).filter(Boolean);

  const analyzeSleep = async () => {
    const prompt = `As a pregnancy sleep wellness guide, analyze this sleep profile:\n\n**Pregnancy Week:** ${settings.pregnancyWeek || "Not specified"}\n**Current Sleep:** ${sleepHours[0]} hours/night\n**Bedtime:** ${bedtime}\n**Sleep Issues:** ${getIssueLabels().join(", ") || "None"}\n\nProvide:\n1. **Sleep Quality Assessment**\n2. **Optimal Sleep Position** for the current pregnancy stage\n3. **Pre-Sleep Routine**\n4. **Environment Optimization**\n5. **Natural Remedies**\n6. **When to Wake**`;
    setResponse("");
    await streamChat({ type: "sleep-analysis", messages: [{ role: "user", content: prompt }], context: { week: Number(settings.pregnancyWeek) || 0 }, onDelta: (text) => setResponse(prev => prev + text), onDone: () => {} });
  };

  const generateMeditation = async () => {
    const prompt = `Create a 10-minute guided bedtime meditation for a pregnant woman (week: ${settings.pregnancyWeek || "not specified"}). Issues: ${getIssueLabels().join(", ") || "General"}. Include: Opening (1 min), Body Scan (3 mins), Breathing (2 mins), Visualization (3 mins), Closing (1 min). Use calm language with [...] pauses.`;
    setMeditationScript(""); setActiveTab('meditation');
    await streamChat({ type: "sleep-analysis", messages: [{ role: "user", content: prompt }], context: { week: Number(settings.pregnancyWeek) || 0 }, onDelta: (text) => setMeditationScript(prev => prev + text), onDone: () => {} });
  };

  const generateRoutine = async () => {
    const prompt = `Create a 2-hour wind-down routine for ${bedtime} bedtime at pregnancy week ${settings.pregnancyWeek || "not specified"}. Sleep issues: ${getIssueLabels().join(", ") || "General"}. Current sleep: ${sleepHours[0]} hours. Include Hour 1 (active), Hour 2 (passive), Final 30 minutes.`;
    setRoutinePlan(""); setActiveTab('routine');
    await streamChat({ type: "sleep-analysis", messages: [{ role: "user", content: prompt }], context: { week: Number(settings.pregnancyWeek) || 0 }, onDelta: (text) => setRoutinePlan(prev => prev + text), onDone: () => {} });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-xs">
          <Clock className="w-3.5 h-3.5 text-primary" />
          {t('toolsInternal.sleepOptimizer.currentSleep', { hours: sleepHours[0] })}
        </Label>
        <Slider value={sleepHours} onValueChange={setSleepHours} max={12} min={3} step={0.5} />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs">
          <Moon className="w-3.5 h-3.5 text-primary" />
          {t('toolsInternal.sleepOptimizer.usualBedtime')}
        </Label>
        <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)} className="w-full p-2 text-sm rounded-lg border bg-background min-w-[140px]" />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs">
          <ThermometerSun className="w-4 h-4 text-primary shrink-0" />
          <span className="leading-snug">{t('toolsInternal.sleepOptimizer.sleepChallenges')}</span>
        </Label>
        <div className="grid grid-cols-1 gap-1.5">
          {sleepIssueKeys.map(issue => (
            <div key={issue.id} onClick={() => toggleIssue(issue.id)}
              className={`p-2.5 rounded-lg border cursor-pointer transition-all overflow-hidden ${selectedIssues.includes(issue.id) ? "bg-primary/10 border-primary" : "bg-card hover:bg-muted"}`}>
              <div className="flex items-center gap-2 min-w-0">
                <Checkbox checked={selectedIssues.includes(issue.id)} className="shrink-0" />
                <span className="text-sm shrink-0">{issue.icon}</span>
                <span className="text-xs leading-snug">{t(`toolsInternal.sleepOptimizer.issues.${issue.key}`)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {[
          { onClick: analyzeSleep, tab: 'analysis', icon: Brain, label: t('toolsInternal.sleepOptimizer.sleepPlan') },
          { onClick: generateMeditation, tab: 'meditation', icon: Wind, label: t('toolsInternal.sleepOptimizer.meditation') },
          { onClick: generateRoutine, tab: 'routine', icon: Bed, label: t('toolsInternal.sleepOptimizer.routine') },
        ].map(({ onClick, tab, icon: Icon, label }) => (
          <motion.button key={tab} onClick={onClick} disabled={isLoading} whileTap={{ scale: 0.92 }} className="relative overflow-hidden rounded-xl disabled:opacity-60">
            <div className={`flex flex-col items-center gap-0.5 py-2 px-1 text-xs rounded-xl font-medium transition-all ${activeTab === tab ? 'text-white' : 'text-foreground bg-muted/60 hover:bg-muted'}`}
              style={activeTab === tab ? { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))' } : {}}>
              {isLoading && activeTab === tab ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
              <span className="text-[10px]">{label}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {(response || meditationScript || routinePlan) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden border border-primary/15 shadow-sm"
        >
          <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))' }} />
          <div className="p-3">
            <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)}>
              <TabsList className="w-full mb-3">
                <TabsTrigger value="analysis" className="flex-1" disabled={!response}><Brain className="w-4 h-4 me-1" />{t('toolsInternal.sleepOptimizer.sleepPlan')}</TabsTrigger>
                <TabsTrigger value="meditation" className="flex-1" disabled={!meditationScript}><Wind className="w-4 h-4 me-1" />{t('toolsInternal.sleepOptimizer.meditation')}</TabsTrigger>
                <TabsTrigger value="routine" className="flex-1" disabled={!routinePlan}><Bed className="w-4 h-4 me-1" />{t('toolsInternal.sleepOptimizer.routine')}</TabsTrigger>
              </TabsList>
              <TabsContent value="analysis" className="max-h-[400px] overflow-y-auto rounded-xl bg-gradient-to-b from-primary/[0.04] to-transparent p-3">{response && <MarkdownRenderer content={response} isLoading={isLoading && activeTab === 'analysis'} />}</TabsContent>
              <TabsContent value="meditation" className="max-h-[400px] overflow-y-auto rounded-xl bg-gradient-to-b from-primary/[0.04] to-transparent p-3">{meditationScript && <MarkdownRenderer content={meditationScript} isLoading={isLoading && activeTab === 'meditation'} />}</TabsContent>
              <TabsContent value="routine" className="max-h-[400px] overflow-y-auto rounded-xl bg-gradient-to-b from-primary/[0.04] to-transparent p-3">{routinePlan && <MarkdownRenderer content={routinePlan} isLoading={isLoading && activeTab === 'routine'} />}</TabsContent>
            </Tabs>
          </div>
          <p className="text-[9px] font-semibold text-muted-foreground/70 text-center pb-2.5 tracking-wide">
            {t('ai.resultDisclaimer', 'AI-generated • Consult your doctor')}
          </p>
        </motion.div>
      )}

      <Card className="p-3 bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">{t('toolsInternal.sleepOptimizer.leftSideTip')}</p>
      </Card>

      <VideoLibrary videosByLang={sleepVideosByLang} title={t('toolsInternal.sleepOptimizer.sleepVideos')} subtitle={t('toolsInternal.sleepOptimizer.sleepVideosSubtitle')} accentColor="violet" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Nausea Tab
// ═══════════════════════════════════════════════════════════════
function NauseaTab() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { streamChat, isLoading } = usePregnancyAI();

  const [severity, setSeverity] = useState([5]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [vomiting, setVomiting] = useState(false);
  const [response, setResponse] = useState("");

  const toggleTrigger = (id: string) => {
    setTriggers(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const getReliefPlan = async () => {
    const triggerLabels = triggers.map(id => { const tr = nauseaTriggers.find(t => t.id === id); return tr ? t(tr.labelKey) : null; }).filter(Boolean);
    const prompt = `As a pregnancy nausea wellness guide, provide comfort strategies:\n\n**Pregnancy Week:** ${settings.pregnancyWeek || "Not specified"}\n**Severity:** ${severity[0]}/10\n**Triggers:** ${triggerLabels.join(", ") || "Not specified"}\n**Vomiting:** ${vomiting ? "Yes" : "No"}\n\nProvide:\n1. **Immediate Relief** - What to do right now\n2. **Dietary Changes** - Foods that help\n3. **Eating Schedule** - When and how to eat\n4. **Natural Remedies** - Ginger, B6, acupressure\n5. **Lifestyle Adjustments** - Triggers to avoid\n6. **When to Consult Provider** - Signs to discuss\n7. **Weekly Outlook** - When improvement is expected\n${severity[0] >= 8 ? "Note: Severity is high - include information about when to seek additional support." : ""}`;
    setResponse("");
    await streamChat({ type: "pregnancy-assistant", messages: [{ role: "user", content: prompt }], context: { week: Number(settings.pregnancyWeek) || 0 }, onDelta: (text) => setResponse(prev => prev + text), onDone: () => {} });
  };

  return (
    <div className="space-y-4">
      <Card className="p-3 bg-muted/30 border-primary/20">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
          <Wind className="w-4 h-4 text-primary" />
          {t('toolsInternal.nauseaRelief.quickRemediesTitle')}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {quickRemedies.map(r => (
            <div key={r.nameKey} className="text-center p-2 bg-background/50 rounded-lg">
              <div className="text-xs font-medium">{t(r.nameKey)}</div>
              <div className="text-[10px] text-muted-foreground">{t(r.tipKey)}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        <Label className="flex items-center justify-between text-xs">
          <span>{t('toolsInternal.nauseaRelief.severity')}</span>
          <span className={`font-bold ${severity[0] <= 3 ? "text-primary" : severity[0] <= 6 ? "text-primary/70" : "text-destructive"}`}>{severity[0]}/10</span>
        </Label>
        <Slider value={severity} onValueChange={setSeverity} max={10} min={1} step={1} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t('toolsInternal.nauseaRelief.mild')}</span>
          <span>{t('toolsInternal.nauseaRelief.moderate')}</span>
          <span>{t('toolsInternal.nauseaRelief.severe')}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
        <Checkbox id="vomiting" checked={vomiting} onCheckedChange={c => setVomiting(c as boolean)} />
        <Label htmlFor="vomiting" className="cursor-pointer text-xs">{t('toolsInternal.nauseaRelief.vomitingLabel')}</Label>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs">
          <Utensils className="w-4 h-4 text-primary shrink-0" />
          <span className="leading-snug">{t('toolsInternal.nauseaRelief.triggersLabel')}</span>
        </Label>
        <div className="grid grid-cols-1 gap-1.5">
          {nauseaTriggers.map(trigger => (
            <div key={trigger.id} onClick={() => toggleTrigger(trigger.id)}
              className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center gap-2 text-xs min-w-0 ${triggers.includes(trigger.id) ? "bg-primary/10 border-primary" : "bg-card hover:bg-muted"}`}>
              <Checkbox checked={triggers.includes(trigger.id)} className="shrink-0" />
              <span className="leading-snug">{t(trigger.labelKey)}</span>
            </div>
          ))}
        </div>
      </div>

      {severity[0] >= 8 && (
        <Card className="p-3 bg-destructive/10 border-destructive/30">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-destructive text-xs">{t('toolsInternal.nauseaRelief.severeWarningTitle')}</h4>
              <p className="text-xs text-muted-foreground mt-1">{t('toolsInternal.nauseaRelief.severeWarningDesc')}</p>
            </div>
          </div>
        </Card>
      )}

      <AIActionButton
        onClick={getReliefPlan}
        isLoading={isLoading}
        label={t('toolsInternal.nauseaRelief.getReliefPlan')}
        loadingLabel={t('toolsInternal.nauseaRelief.creatingPlan')}
      />

      {response && (
        <PrintableReport title={t('toolsInternal.nauseaRelief.title')} isLoading={isLoading}>
          <AIResponseFrame
            content={response}
            isLoading={isLoading}
            title={t('toolsInternal.nauseaRelief.title')}
          />
        </PrintableReport>
      )}

      <Card className="p-3 bg-muted/30 text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">{t('toolsInternal.nauseaRelief.encouragingNote')}</p>
      </Card>

      <VideoLibrary videosByLang={nauseaVideosByLang} title={t('toolsInternal.nauseaRelief.videosTitle')} subtitle={t('toolsInternal.nauseaRelief.videosSubtitle')} accentColor="emerald" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════
export default function PregnancyComfort() {
  const { t } = useTranslation();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  useResetOnLanguageChange(() => {});

  if (!disclaimerAccepted) {
    return <MedicalDisclaimer onAccept={() => setDisclaimerAccepted(true)} toolName={t('tools.pregnancyComfort.title')} />;
  }

  return (
    <ToolFrame
      title={t('tools.pregnancyComfort.title')}
      subtitle={t('tools.pregnancyComfort.description')}
      mood="calm"
      toolId="pregnancy-comfort"
    >
      <Tabs defaultValue="sleep" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="sleep" className="flex-1 text-xs gap-1">
            <Moon className="w-3.5 h-3.5" />
            {t('tools.aiSleepOptimizer.title')}
          </TabsTrigger>
          <TabsTrigger value="nausea" className="flex-1 text-xs gap-1">
            <Heart className="w-3.5 h-3.5" />
            {t('tools.aiNauseaRelief.title')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="sleep"><SleepTab /></TabsContent>
        <TabsContent value="nausea"><NauseaTab /></TabsContent>
      </Tabs>
    </ToolFrame>
  );
}
