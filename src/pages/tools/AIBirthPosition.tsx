import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { Baby, Sparkles, Clock, Brain, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolFrame } from "@/components/ToolFrame";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { useSettings } from "@/hooks/useSettings";
import { VideoLibrary } from "@/components/VideoLibrary";
import { birthPositionVideosByLang } from "@/data/videoData";

const AIBirthPosition = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { streamChat, isLoading } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setResponse('');
  });
  
  const [birthPlan, setBirthPlan] = useState("natural");
  const [conditions, setConditions] = useState<string[]>([]);
  const [laborStage, setLaborStage] = useState("early");
  const [response, setResponse] = useState("");

  const birthPreferences = [
    { id: "natural", labelKey: "toolsInternal.birthPosition.natural" },
    { id: "epidural", labelKey: "toolsInternal.birthPosition.epidural" },
    { id: "water", labelKey: "toolsInternal.birthPosition.waterBirth" },
    { id: "csection", labelKey: "toolsInternal.birthPosition.csection" },
  ];

  const physicalConditions = [
    { id: "back-pain", labelKey: "toolsInternal.birthPosition.backPain" },
    { id: "hip-pain", labelKey: "toolsInternal.birthPosition.hipPain" },
    { id: "sciatica", labelKey: "toolsInternal.birthPosition.sciatica" },
    { id: "spd", labelKey: "toolsInternal.birthPosition.spd" },
    { id: "high-bp", labelKey: "toolsInternal.birthPosition.highBP" },
    { id: "none", labelKey: "toolsInternal.birthPosition.noConditions" },
  ];

  const positions = [
    { id: "squatting", nameKey: "toolsInternal.birthPosition.positions.squatting.name", descKey: "toolsInternal.birthPosition.positions.squatting.desc" },
    { id: "hands-knees", nameKey: "toolsInternal.birthPosition.positions.handsKnees.name", descKey: "toolsInternal.birthPosition.positions.handsKnees.desc" },
    { id: "side-lying", nameKey: "toolsInternal.birthPosition.positions.sideLying.name", descKey: "toolsInternal.birthPosition.positions.sideLying.desc" },
    { id: "standing", nameKey: "toolsInternal.birthPosition.positions.standing.name", descKey: "toolsInternal.birthPosition.positions.standing.desc" },
  ];

  const toggleCondition = (id: string) => {
    setConditions(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const getRecommendations = async () => {
    const conditionLabels = conditions.map(id => 
      t(physicalConditions.find(c => c.id === id)?.labelKey || '')
    ).filter(Boolean);

    const currentLang = i18n.language;
    const langNames: Record<string, string> = {
      en: 'English', ar: 'Arabic', de: 'German', tr: 'Turkish',
      fr: 'French', es: 'Spanish', pt: 'Portuguese'
    };
    const currentLangName = langNames[currentLang] || 'English';
    const langInstruction = currentLang !== 'en' 
      ? `IMPORTANT: Respond ENTIRELY in ${currentLangName}. All text, headers, and recommendations must be in ${currentLangName}.`
      : '';

    const laborStageLabels: Record<string, string> = {
      early: t('toolsInternal.birthPosition.earlyLabor'),
      active: t('toolsInternal.birthPosition.activeLabor'),
      pushing: t('toolsInternal.birthPosition.pushing')
    };

    const prompt = `${langInstruction}

As a certified doula and birth position specialist, recommend optimal birthing positions:

**Pregnancy Week:** ${settings.pregnancyWeek || 38}
**Birth Preference:** ${t(birthPreferences.find(b => b.id === birthPlan)?.labelKey || '')}
**Physical Conditions:** ${conditionLabels.join(", ") || "None"}
**Labor Stage:** ${laborStageLabels[laborStage]}

Provide detailed guidance on:
1. **Best Positions for Your Profile** - Top 3-4 positions with benefits
2. **Position Transitions** - How to move between positions safely
3. **Partner Support Positions** - How partner can help
4. **Equipment Recommendations** - Birth ball, squat bar, etc.
5. **Stage-Specific Positions** - Different positions for each labor stage
6. **Positions to Avoid** - Based on your conditions
7. **Breathing Techniques** - Combined with each position

Include safety considerations and when to change positions.`;

    setResponse("");
    await streamChat({
      type: "pregnancy-assistant",
      messages: [{ role: "user", content: prompt }],
      context: { week: Number(settings.pregnancyWeek) || 38 },
      onDelta: (text) => setResponse((prev) => prev + text),
      onDone: () => {},
    });
  };

  return (
    <ToolFrame
      title={t('toolsInternal.birthPosition.title')}
      subtitle={t('toolsInternal.birthPosition.subtitle')}
      icon={Baby}
      mood="empowering"
      toolId="ai-birth-position"
    >
      <div className="space-y-4">
        
        {/* Position Cards - Professional List */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">{t('toolsInternal.birthPosition.commonPositions')}</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {positions.map((pos) => (
              <Card key={pos.id} className="p-2.5">
                <h4 className="font-medium text-xs">{t(pos.nameKey)}</h4>
                <p className="text-[10px] text-muted-foreground leading-tight">{t(pos.descKey)}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Birth Preference */}
        <div className="space-y-1.5">
          <Label className="text-xs">{t('toolsInternal.birthPosition.birthPreference')}</Label>
          <RadioGroup value={birthPlan} onValueChange={setBirthPlan} className="space-y-1">
            {birthPreferences.map((pref) => (
              <div 
                key={pref.id} 
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                  birthPlan === pref.id ? "bg-primary/10 border-primary" : "bg-card hover:bg-muted"
                }`}
                onClick={() => setBirthPlan(pref.id)}
              >
                <RadioGroupItem value={pref.id} id={pref.id} />
                <Label htmlFor={pref.id} className="cursor-pointer text-xs flex-1">
                  {t(pref.labelKey)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Labor Stage */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs">
            <Clock className="w-3 h-3 text-primary" />
            {t('toolsInternal.birthPosition.laborStage')}
          </Label>
          <RadioGroup value={laborStage} onValueChange={setLaborStage} className="flex gap-3">
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="early" id="early" />
              <Label htmlFor="early" className="text-xs">{t('toolsInternal.birthPosition.earlyLabor')}</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="active" id="active" />
              <Label htmlFor="active" className="text-xs">{t('toolsInternal.birthPosition.activeLabor')}</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="pushing" id="pushing" />
              <Label htmlFor="pushing" className="text-xs">{t('toolsInternal.birthPosition.pushing')}</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Physical Conditions */}
        <div className="space-y-1.5">
          <Label className="text-xs">{t('toolsInternal.birthPosition.physicalConditions')}</Label>
          <div className="grid grid-cols-1 gap-1">
            {physicalConditions.map((condition) => (
              <div
                key={condition.id}
                onClick={() => toggleCondition(condition.id)}
                className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center gap-2 ${
                  conditions.includes(condition.id)
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted"
                }`}
              >
                <Checkbox checked={conditions.includes(condition.id)} className="h-3.5 w-3.5" />
                <span className="text-xs">{t(condition.labelKey)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Get Recommendations */}
        <motion.button onClick={getRecommendations} disabled={isLoading} whileTap={{ scale: 0.92 }} className="w-full relative overflow-hidden rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed">
          <div className="w-full flex items-center justify-center gap-3 px-5 py-3.5 font-semibold text-white text-sm rounded-2xl" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))', boxShadow: '0 4px 20px -4px hsl(var(--primary) / 0.5)' }}>
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin shrink-0" /><span>{t('toolsInternal.birthPosition.analyzing')}</span></> : <><Baby className="w-4 h-4 shrink-0" /><span>{t('toolsInternal.birthPosition.getPositions')}</span></>}
            <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" aria-hidden />
          </div>
        </motion.button>

        {/* AI Response */}
        {response && (
          <Card className="p-3 bg-muted/50">
            <MarkdownRenderer content={response} isLoading={isLoading} />
          </Card>
        )}

        {/* Educational Videos with Thumbnails */}
        <VideoLibrary
          videosByLang={birthPositionVideosByLang}
          title={t('toolsInternal.birthPosition.birthPositionVideos')}
          subtitle={t('toolsInternal.birthPosition.birthPositionVideosSubtitle')}
          accentColor="rose"
        />
      </div>
    </ToolFrame>
  );
};

export default AIBirthPosition;
