import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Brain, Loader2, Sparkles, Clock, ShoppingBag, AlertCircle } from "lucide-react";
import { AIResponseFrame } from "@/components/ai/AIResponseFrame";
import { PrintableReport } from '@/components/PrintableReport';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolFrame } from "@/components/ToolFrame";
import MedicalDisclaimer from "@/components/compliance/MedicalDisclaimer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { AIActionButton } from '@/components/ai/AIActionButton';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { useSettings } from "@/hooks/useSettings";
import { VideoLibrary } from "@/components/VideoLibrary";
import { lactationVideosByLang } from "@/data/videoData";


const feedingGoals = [
  { id: "exclusive", labelKey: "toolsInternal.lactationPrep.feedingGoals.exclusive", icon: "🤱" },
  { id: "combo", labelKey: "toolsInternal.lactationPrep.feedingGoals.combo", icon: "🍼" },
  { id: "pumping", labelKey: "toolsInternal.lactationPrep.feedingGoals.pumping", icon: "⚙️" },
  { id: "unsure", labelKey: "toolsInternal.lactationPrep.feedingGoals.unsure", icon: "🤔" },
];

const concerns = [
  { id: "latch", labelKey: "toolsInternal.lactationPrep.concerns.latch" },
  { id: "supply", labelKey: "toolsInternal.lactationPrep.concerns.supply" },
  { id: "pain", labelKey: "toolsInternal.lactationPrep.concerns.pain" },
  { id: "returning-work", labelKey: "toolsInternal.lactationPrep.concerns.returningWork" },
  { id: "partner-feeding", labelKey: "toolsInternal.lactationPrep.concerns.partnerFeeding" },
  { id: "public", labelKey: "toolsInternal.lactationPrep.concerns.public" },
  { id: "medical", labelKey: "toolsInternal.lactationPrep.concerns.medical" },
  { id: "multiples", labelKey: "toolsInternal.lactationPrep.concerns.multiples" },
];

const essentialSupplies = [
  { nameKey: "toolsInternal.lactationPrep.supplies.nursingBras", essential: true },
  { nameKey: "toolsInternal.lactationPrep.supplies.nursingPads", essential: true },
  { nameKey: "toolsInternal.lactationPrep.supplies.nippleCream", essential: true },
  { nameKey: "toolsInternal.lactationPrep.supplies.breastPump", essential: false },
  { nameKey: "toolsInternal.lactationPrep.supplies.storageBags", essential: false },
  { nameKey: "toolsInternal.lactationPrep.supplies.nursingPillow", essential: false },
  { nameKey: "toolsInternal.lactationPrep.supplies.nursingCover", essential: false },
  { nameKey: "toolsInternal.lactationPrep.supplies.haakaa", essential: false },
];


const AILactationPrep = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { streamChat, isLoading } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setResponse('');
  });
  
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [feedingGoal, setFeedingGoal] = useState("");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [firstTimeMom, setFirstTimeMom] = useState(true);
  const [returningToWork, setReturningToWork] = useState("");
  const [response, setResponse] = useState("");

  const toggleConcern = (id: string) => {
    setSelectedConcerns(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const getLactationPlan = async () => {
    const concernLabels = selectedConcerns.map(id => {
      const concern = concerns.find(c => c.id === id);
      return concern ? t(concern.labelKey) : null;
    }).filter(Boolean);
    const goal = feedingGoals.find(g => g.id === feedingGoal);

    const goalLabel = goal ? t(goal.labelKey) : t('toolsInternal.lactationPrep.notSpecified');
    
    const prompt = `As a breastfeeding preparation guide, create a comprehensive breastfeeding preparation plan:
**Feeding Goal:** ${goalLabel}
**First-Time Mom:** ${firstTimeMom ? t('common.yes') : t('common.no')}
**Concerns:** ${concernLabels.join(", ") || t('toolsInternal.lactationPrep.noneSpecified')}
**Returning to Work:** ${returningToWork || t('toolsInternal.lactationPrep.notSpecified')}

Provide comprehensive breastfeeding preparation:
1. **Before Birth Preparation** - Nipple care, what to learn now
2. **First Hour After Birth** - Skin-to-skin, first latch
3. **First Week Challenges** - What to expect, troubleshooting
4. **Proper Latch Technique** - Step-by-step guidance
5. **Feeding Positions** - Best positions with diagrams description
6. **Supply Building** - How to establish and maintain supply
7. **Common Problems & Solutions** - Engorgement, cracked nipples, etc.
8. **Pumping Guide** - When to start, how to store milk
9. **Partner Support** - How they can help
10. **When to Get Help** - Signs to see a lactation consultant

${returningToWork === "yes" ? "Include detailed back-to-work pumping plan and rights at work." : ""}

Be encouraging and realistic - breastfeeding has a learning curve!`;

    setResponse("");
    await streamChat({
      type: "lactation-prep",
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
        toolName="AI Lactation Preparation"
      />
    );
  }

  return (
    <ToolFrame
      title={t('toolsInternal.lactationPrep.title')}
      subtitle={t('toolsInternal.lactationPrep.subtitle')}
      customIcon="breastfeeding"
      mood="nurturing"
      toolId="ai-lactation-prep"
    >
      <div className="space-y-4">
        {/* Feeding Goal */}
        <div className="space-y-3">
          <Label className="text-xs">{t('toolsInternal.lactationPrep.yourFeedingGoal')}</Label>
          <div className="grid grid-cols-2 gap-2">
            {feedingGoals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => setFeedingGoal(goal.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                  feedingGoal === goal.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted"
                }`}
              >
                <div className="text-base mb-1">{goal.icon}</div>
                <div className="text-xs">{t(goal.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* First Time Mom */}
        <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
          <Checkbox 
            id="first-time" 
            checked={firstTimeMom} 
            onCheckedChange={(checked) => setFirstTimeMom(checked as boolean)} 
          />
          <Label htmlFor="first-time" className="cursor-pointer text-xs">
            {t('toolsInternal.lactationPrep.firstTimeBreastfeeding')}
          </Label>
        </div>

        {/* Returning to Work */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-primary" />
            {t('toolsInternal.lactationPrep.returningToWork')}
          </Label>
          <Select value={returningToWork} onValueChange={setReturningToWork}>
            <SelectTrigger>
              <SelectValue placeholder={t('toolsInternal.lactationPrep.select')} className="text-xs"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">{t('toolsInternal.lactationPrep.workOptions.no')}</SelectItem>
              <SelectItem value="12weeks">{t('toolsInternal.lactationPrep.workOptions.12weeks')}</SelectItem>
              <SelectItem value="6months">{t('toolsInternal.lactationPrep.workOptions.6months')}</SelectItem>
              <SelectItem value="year">{t('toolsInternal.lactationPrep.workOptions.year')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Concerns */}
        <div className="space-y-3">
          <Label className="text-xs">{t('toolsInternal.lactationPrep.anyConcerns')}</Label>
          <div className="grid grid-cols-2 gap-2">
            {concerns.map((concern) => (
              <div
                key={concern.id}
                onClick={() => toggleConcern(concern.id)}
                className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center gap-2 ${
                  selectedConcerns.includes(concern.id)
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted"
                }`}
              >
                <Checkbox checked={selectedConcerns.includes(concern.id)} />
                <span className="text-xs">{t(concern.labelKey)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Essential Supplies */}
        <Card className="p-3 bg-muted/30">
          <h4 className="font-medium mb-2 flex items-center gap-2 text-xs">
            <ShoppingBag className="w-3.5 h-3.5 text-primary" />
            {t('toolsInternal.lactationPrep.suppliesChecklist')}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {essentialSupplies.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={item.essential ? "text-primary" : "text-muted-foreground"}>
                  {item.essential ? "★" : "○"}
                </span>
                {t(item.nameKey)}
              </div>
            ))}
          </div>
        </Card>

        {/* Get Plan */}
        <AIActionButton
          onClick={getLactationPlan}
          isLoading={isLoading}
          label={t('toolsInternal.lactationPrep.getAIGuide')}
          loadingLabel={t('toolsInternal.lactationPrep.creatingGuide')}
        />

        {/* AI Response */}
        {response && (
          <PrintableReport title={t('toolsInternal.lactationPrep.title')} isLoading={isLoading}>
            <AIResponseFrame
              content={response}
              isLoading={isLoading}
              title={t('toolsInternal.lactationPrep.title')}
            />
          </PrintableReport>
        )}

        {/* Support Note */}
        <Card className="p-3 bg-muted/30 border-primary/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-xs">{t('toolsInternal.lactationPrep.needSupport')}</h4>
              <p className="text-[10px] text-muted-foreground mt-1">
                {t('toolsInternal.lactationPrep.supportNote')}
              </p>
            </div>
          </div>
        </Card>

        {/* Educational Videos with Thumbnails */}
        <VideoLibrary
          videosByLang={lactationVideosByLang}
          title={t('toolsInternal.lactationPrep.videosTitle')}
          subtitle={t('toolsInternal.lactationPrep.videosSubtitle')}
          accentColor="rose"
        />
      </div>
    </ToolFrame>
  );
};

export default AILactationPrep;
