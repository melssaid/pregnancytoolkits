import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Brain, Loader2, Sparkles, Heart, Utensils, Wind, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolFrame } from "@/components/ToolFrame";
import MedicalDisclaimer from "@/components/compliance/MedicalDisclaimer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { AIActionButton } from '@/components/ai/AIActionButton';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { useSettings } from "@/hooks/useSettings";
import { VideoLibrary } from "@/components/VideoLibrary";
import { nauseaVideosByLang } from "@/data/videoData";

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


const AINauseaRelief = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { streamChat, isLoading } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setResponse('');
  });
  
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [severity, setSeverity] = useState([5]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [vomiting, setVomiting] = useState(false);
  const [response, setResponse] = useState("");

  const toggleTrigger = (id: string) => {
    setTriggers(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const getReliefPlan = async () => {
    const triggerLabels = triggers.map(id => {
      const trigger = nauseaTriggers.find(t => t.id === id);
      return trigger ? t(trigger.labelKey) : null;
    }).filter(Boolean);

    const prompt = `As a pregnancy nausea specialist, provide relief strategies:

**Pregnancy Week:** ${settings.pregnancyWeek || "Not specified"}
**Severity (1-10):** ${severity[0]}
**Triggers:** ${triggerLabels.join(", ") || "Not specified"}
**Vomiting:** ${vomiting ? "Yes, experiencing vomiting" : "No vomiting, just nausea"}

Provide comprehensive nausea relief guidance:
1. **Immediate Relief** - What to do right now when feeling sick
2. **Dietary Changes** - Foods that help, foods to avoid
3. **Eating Schedule** - When and how to eat
4. **Natural Remedies** - Ginger, B6, acupressure points (P6)
5. **Lifestyle Adjustments** - Rest, triggers to avoid
6. **When to Call Doctor** - Warning signs of hyperemesis
7. **Weekly Outlook** - When nausea typically improves

${severity[0] >= 8 ? "⚠️ Note: Severity is high - include information about medical interventions and when hospitalization may be needed." : ""}

Be compassionate - morning sickness is exhausting!`;

    setResponse("");
    await streamChat({
      type: "nausea-relief",
      messages: [{ role: "user", content: prompt }],
      context: { week: Number(settings.pregnancyWeek) || 0 },
      onDelta: (text) => setResponse((prev) => prev + text),
      onDone: () => {},
    });
  };

  if (!disclaimerAccepted) {
    return (
      <MedicalDisclaimer
        onAccept={() => setDisclaimerAccepted(true)}
        toolName="AI Nausea Relief Coach"
      />
    );
  }

  return (
    <ToolFrame
      title={t('toolsInternal.nauseaRelief.title')}
      icon={Heart}
      mood="calm"
      toolId="ai-nausea-relief"
    >
      <div className="space-y-4">
        {/* Quick Relief Card */}
        <Card className="p-3 bg-muted/30 border-primary/20">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
            <Wind className="w-4 h-4 text-primary" />
            {t('toolsInternal.nauseaRelief.quickRemediesTitle')}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {quickRemedies.map((remedy) => (
              <div key={remedy.nameKey} className="text-center p-2 bg-background/50 rounded-lg">
                <div className="text-xs font-medium">{t(remedy.nameKey)}</div>
                <div className="text-[10px] text-muted-foreground">{t(remedy.tipKey)}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Severity Slider */}
        <div className="space-y-3">
          <Label className="flex items-center justify-between text-xs">
            <span>{t('toolsInternal.nauseaRelief.severity')}</span>
            <span className={`font-bold ${
              severity[0] <= 3 ? "text-primary" : 
              severity[0] <= 6 ? "text-primary/70" : "text-destructive"
            }`}>
              {severity[0]}/10
            </span>
          </Label>
          <Slider
            value={severity}
            onValueChange={setSeverity}
            max={10}
            min={1}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('toolsInternal.nauseaRelief.mild')}</span>
            <span>{t('toolsInternal.nauseaRelief.moderate')}</span>
            <span>{t('toolsInternal.nauseaRelief.severe')}</span>
          </div>
        </div>

        {/* Vomiting Checkbox */}
        <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
          <Checkbox 
            id="vomiting" 
            checked={vomiting} 
            onCheckedChange={(checked) => setVomiting(checked as boolean)} 
          />
          <Label htmlFor="vomiting" className="cursor-pointer text-xs">
            {t('toolsInternal.nauseaRelief.vomitingLabel')}
          </Label>
        </div>

        {/* Triggers */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <Utensils className="w-4 h-4 text-primary shrink-0" />
            <span className="leading-snug">{t('toolsInternal.nauseaRelief.triggersLabel')}</span>
          </Label>
          <div className="grid grid-cols-1 gap-1.5">
            {nauseaTriggers.map((trigger) => (
              <div
                key={trigger.id}
                onClick={() => toggleTrigger(trigger.id)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center gap-2 text-xs min-w-0 ${
                  triggers.includes(trigger.id)
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted"
                }`}
              >
                <Checkbox checked={triggers.includes(trigger.id)} className="shrink-0" />
                <span className="leading-snug">{t(trigger.labelKey)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Warning for severe cases */}
        {severity[0] >= 8 && (
          <Card className="p-3 bg-destructive/10 border-destructive/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-destructive text-xs">{t('toolsInternal.nauseaRelief.severeWarningTitle')}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('toolsInternal.nauseaRelief.severeWarningDesc')}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Get Relief Plan */}
        <AIActionButton
          onClick={getReliefPlan}
          isLoading={isLoading}
          label={t('toolsInternal.nauseaRelief.getReliefPlan')}
          loadingLabel={t('toolsInternal.nauseaRelief.creatingPlan')}
        />

        {/* AI Response */}
        {response && (
          <Card className="p-3 bg-muted/50">
            <MarkdownRenderer content={response} isLoading={isLoading} />
          </Card>
        )}

        {/* Encouraging Note */}
        <Card className="p-3 bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('toolsInternal.nauseaRelief.encouragingNote')}
          </p>
        </Card>

        {/* Educational Videos with Thumbnails */}
        <VideoLibrary
          videosByLang={nauseaVideosByLang}
          title={t('toolsInternal.nauseaRelief.videosTitle')}
          subtitle={t('toolsInternal.nauseaRelief.videosSubtitle')}
          accentColor="emerald"
        />
      </div>
    </ToolFrame>
  );
};

export default AINauseaRelief;
