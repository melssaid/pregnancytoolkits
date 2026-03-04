import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Droplet, Sun, Moon as MoonIcon, AlertTriangle, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { AIResponseFrame } from "@/components/ai/AIResponseFrame";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolFrame } from "@/components/ToolFrame";
import MedicalDisclaimer from "@/components/compliance/MedicalDisclaimer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { AIActionButton } from '@/components/ai/AIActionButton';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { useSettings } from "@/hooks/useSettings";
import { VideoLibrary } from "@/components/VideoLibrary";
import { skincareVideosByLang } from "@/data/videoData";
import { SkincareConcernGrid } from "@/components/skincare/SkincareConcernGrid";
import { SkincareUnsafeCard } from "@/components/skincare/SkincareUnsafeCard";
import { SkincareRoutinePreview } from "@/components/skincare/SkincareRoutinePreview";

const AIPregnancySkincare = () => {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const { streamChat, isLoading } = usePregnancyAI();
  
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [skinType, setSkinType] = useState("combination");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [budget, setBudget] = useState("medium");
  const [response, setResponse] = useState("");
  const [showHint, setShowHint] = useState(true);

  const currentLang = i18n.language;

  useResetOnLanguageChange(() => {
    setResponse("");
  });

  const toggleConcern = (id: string) => {
    setConcerns(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
    if (showHint) setShowHint(false);
  };

  const getSkincareRoutine = async () => {
    setShowHint(false);
    const concernLabels = concerns.map(id => 
      t(`toolsInternal.skincare.concerns.${id}.label`)
    ).filter(Boolean);

    const skinTypeLabel = t(`toolsInternal.skincare.${skinType}`);
    const budgetLabel = budget === "low" ? t('toolsInternal.skincare.budgetLow') : budget === "medium" ? t('toolsInternal.skincare.budgetMedium') : t('toolsInternal.skincare.budgetHigh');

    const langInstruction = currentLang !== 'en' 
      ? `IMPORTANT: Respond ENTIRELY in ${currentLang === 'ar' ? 'Arabic' : currentLang === 'de' ? 'German' : currentLang === 'tr' ? 'Turkish' : currentLang === 'fr' ? 'French' : currentLang === 'es' ? 'Spanish' : currentLang === 'pt' ? 'Portuguese' : 'English'}. All text must be in this language.`
      : '';

    const prompt = `${langInstruction}

As a pregnancy skincare wellness guide, create a personalized routine:

**Pregnancy Week:** ${settings.pregnancyWeek || "Not specified"}
**Skin Type:** ${skinTypeLabel}
**Concerns:** ${concernLabels.join(", ") || "General pregnancy skincare"}
**Budget:** ${budgetLabel}

Provide a complete pregnancy-safe skincare routine:
1. **Morning Routine** - Step-by-step with specific product recommendations
2. **Evening Routine** - Cleansing, treatment, moisturizing
3. **Weekly Treatments** - Masks, exfoliation (safe options)
4. **Ingredients to Use** - Pregnancy-safe actives
5. **Ingredients to Avoid** - With explanations
6. **Body Care** - For stretch marks, belly care
7. **Product Recommendations** - Specific brands and products

Include natural DIY options when appropriate. Focus ONLY on pregnancy-safe ingredients.`;

    setResponse("");
    await streamChat({
      type: "skincare-advice",
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
        toolName={t('toolsInternal.skincare.title')}
      />
    );
  }

  return (
    <ToolFrame
      title={t('toolsInternal.skincare.title')}
      subtitle={t('toolsInternal.skincare.subtitle')}
      icon={Droplet}
      mood="nurturing"
      toolId="ai-pregnancy-skincare"
    >
      <div className="space-y-4">
        {/* ═══ Hero Card ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Card className="overflow-hidden border-primary/15 shadow-xl">
            <CardContent className="p-0">
              {/* Status strip */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-gradient-to-r from-primary/8 to-primary/3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Droplet className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground leading-none">
                      {t('toolsInternal.skincare.skinType')}
                    </span>
                    <span className="text-xs font-semibold text-foreground mt-0.5">
                      {t(`toolsInternal.skincare.${skinType}`)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium">
                    {concerns.length > 0 ? `${concerns.length} ✓` : '0'}
                  </span>
                </div>
              </div>

              {/* Main action area */}
              <div className="p-5">
                {/* Gesture hint */}
                <AnimatePresence>
                  {showHint && concerns.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-center mb-4"
                    >
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-flex items-center gap-1.5 text-primary"
                      >
                        <span className="text-lg">👇</span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {t('toolsInternal.skincare.selectConcernsHint')}
                        </span>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Skin Type Selector */}
                <div className="space-y-1.5 mb-4">
                  <Label className="text-xs text-muted-foreground">{t('toolsInternal.skincare.skinType')}</Label>
                  <Select value={skinType} onValueChange={setSkinType}>
                    <SelectTrigger className="w-full text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="dry">{t('toolsInternal.skincare.dry')}</SelectItem>
                      <SelectItem value="oily">{t('toolsInternal.skincare.oily')}</SelectItem>
                      <SelectItem value="combination">{t('toolsInternal.skincare.combination')}</SelectItem>
                      <SelectItem value="sensitive">{t('toolsInternal.skincare.sensitive')}</SelectItem>
                      <SelectItem value="normal">{t('toolsInternal.skincare.normal')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget Selector */}
                <div className="space-y-1.5 mb-4">
                  <Label className="text-xs text-muted-foreground">{t('toolsInternal.skincare.budgetPreference')}</Label>
                  <Select value={budget} onValueChange={setBudget}>
                    <SelectTrigger className="w-full text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="low">{t('toolsInternal.skincare.budgetLow')}</SelectItem>
                      <SelectItem value="medium">{t('toolsInternal.skincare.budgetMedium')}</SelectItem>
                      <SelectItem value="high">{t('toolsInternal.skincare.budgetHigh')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Skin Concerns Grid */}
                <SkincareConcernGrid
                  concerns={concerns}
                  onToggle={toggleConcern}
                />
              </div>

              {/* Action footer */}
              <div className="px-5 pb-5">
                <AIActionButton
                  onClick={getSkincareRoutine}
                  isLoading={isLoading}
                  label={t('toolsInternal.skincare.getRoutine')}
                  loadingLabel={t('toolsInternal.skincare.creatingRoutine')}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Response */}
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AIResponseFrame
              content={response}
              isLoading={isLoading}
              title={t('toolsInternal.skincare.yourRoutine')}
              icon={Sparkles}
            />
          </motion.div>
        )}

        {/* Routine Quick Reference */}
        <SkincareRoutinePreview />

        {/* Unsafe Ingredients Warning */}
        <SkincareUnsafeCard />

        {/* Educational Videos */}
        <VideoLibrary
          videosByLang={skincareVideosByLang(t)}
          title={t('toolsInternal.skincare.skincareVideos')}
          subtitle={t('toolsInternal.skincare.skincareVideosSubtitle')}
          accentColor="violet"
        />
      </div>
    </ToolFrame>
  );
};

export default AIPregnancySkincare;
