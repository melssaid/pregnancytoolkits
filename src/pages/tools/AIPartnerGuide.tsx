import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolFrame } from "@/components/ToolFrame";
import MedicalDisclaimer from "@/components/compliance/MedicalDisclaimer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useSettings } from "@/hooks/useSettings";
import { VideoLibrary, Video } from "@/components/VideoLibrary";
import { useResetOnLanguageChange } from "@/hooks/useResetOnLanguageChange";

const getPartnerVideos = (t: any): Video[] => [
  {
    id: "1",
    title: t('toolsInternal.partnerGuide.videos.v1.title'),
    description: t('toolsInternal.partnerGuide.videos.v1.description'),
    youtubeId: "hpgjwK_oQe0",
    duration: "18:00",
    category: t('toolsInternal.partnerGuide.videos.v1.category')
  },
  {
    id: "2",
    title: t('toolsInternal.partnerGuide.videos.v2.title'),
    description: t('toolsInternal.partnerGuide.videos.v2.description'),
    youtubeId: "-CWJYxIvoFQ",
    duration: "15:00",
    category: t('toolsInternal.partnerGuide.videos.v2.category')
  },
  {
    id: "3",
    title: t('toolsInternal.partnerGuide.videos.v3.title'),
    description: t('toolsInternal.partnerGuide.videos.v3.description'),
    youtubeId: "nc8IbAAotHo",
    duration: "15:00",
    category: t('toolsInternal.partnerGuide.videos.v3.category')
  },
  {
    id: "4",
    title: t('toolsInternal.partnerGuide.videos.v4.title'),
    description: t('toolsInternal.partnerGuide.videos.v4.description'),
    youtubeId: "NTulfAOzbp8",
    duration: "8:00",
    category: t('toolsInternal.partnerGuide.videos.v4.category')
  }
];

const TOPIC_KEYS = [
  "emotional",
  "physical",
  "appointments",
  "communication",
  "bonding",
  "labor",
  "postpartum",
  "intimacy",
] as const;

const AIPartnerGuide = () => {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const { streamChat, isLoading } = usePregnancyAI();
  
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [trimester, setTrimester] = useState<string>("second");
  const [partnerType, setPartnerType] = useState<string>("husband");
  const [response, setResponse] = useState("");

  useResetOnLanguageChange(() => {
    setResponse('');
  });

  const currentLang = i18n.language;

  const getAdvice = async () => {
    const topicLabel = t(`toolsInternal.partnerGuide.topics.${selectedTopic}.label`);
    const topicDesc = t(`toolsInternal.partnerGuide.topics.${selectedTopic}.desc`);
    const partnerLabel = t(`toolsInternal.partnerGuide.${partnerType}`);
    
    const langInstruction = currentLang !== 'en' 
      ? `IMPORTANT: Respond ENTIRELY in ${currentLang === 'ar' ? 'Arabic' : currentLang === 'de' ? 'German' : currentLang === 'tr' ? 'Turkish' : currentLang === 'fr' ? 'French' : currentLang === 'es' ? 'Spanish' : currentLang === 'pt' ? 'Portuguese' : 'English'}. All text must be in this language.`
      : '';

    const prompt = `${langInstruction}

As a pregnancy relationship counselor, provide guidance for a ${partnerLabel} supporting their pregnant partner:

**Pregnancy Week:** ${settings.pregnancyWeek || 20}
**Trimester:** ${trimester}
**Topic:** ${topicLabel} - ${topicDesc}

Provide compassionate, practical advice including:
1. **Understanding Her Experience** - What she's going through physically and emotionally
2. **Daily Support Actions** - Specific things to do every day
3. **Things to Say** - Helpful phrases and responses
4. **Things to Avoid** - Common mistakes partners make
5. **Special Gestures** - Meaningful ways to show love
6. **Preparing Together** - Activities to do as a couple
7. **Red Flags** - When to encourage professional help

Be warm, practical, and specific. Include real examples.`;

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
        toolName={t('toolsInternal.partnerGuide.title')}
      />
    );
  }

  return (
    <ToolFrame
      title={t('toolsInternal.partnerGuide.title')}
      subtitle={t('toolsInternal.partnerGuide.subtitle')}
      customIcon="partner-guide"
      mood="nurturing"
      toolId="ai-partner-guide"
    >
      <div className="space-y-6">
        {/* Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">{t('toolsInternal.partnerGuide.iAmHer')}</Label>
            <Select value={partnerType} onValueChange={setPartnerType}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="husband">{t('toolsInternal.partnerGuide.husband')}</SelectItem>
                <SelectItem value="partner">{t('toolsInternal.partnerGuide.partner')}</SelectItem>
                <SelectItem value="boyfriend">{t('toolsInternal.partnerGuide.boyfriend')}</SelectItem>
                <SelectItem value="wife">{t('toolsInternal.partnerGuide.wife')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">{t('toolsInternal.partnerGuide.trimester')}</Label>
            <Select value={trimester} onValueChange={setTrimester}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first">{t('toolsInternal.partnerGuide.trimester1')}</SelectItem>
                <SelectItem value="second">{t('toolsInternal.partnerGuide.trimester2')}</SelectItem>
                <SelectItem value="third">{t('toolsInternal.partnerGuide.trimester3')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Topics */}
        <div className="space-y-3">
          <Label className="text-xs">{t('toolsInternal.partnerGuide.whatHelpWith')}</Label>
          <div className="grid grid-cols-2 gap-2">
            {TOPIC_KEYS.map((topicKey) => (
              <div
                key={topicKey}
                onClick={() => setSelectedTopic(topicKey)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                  selectedTopic === topicKey
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted"
                }`}
              >
                <div className="text-xl mb-1">{t(`toolsInternal.partnerGuide.topics.${topicKey}.icon`)}</div>
                <div className="font-medium text-xs truncate">{t(`toolsInternal.partnerGuide.topics.${topicKey}.label`)}</div>
                <div className="text-[10px] text-muted-foreground truncate">{t(`toolsInternal.partnerGuide.topics.${topicKey}.desc`)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Get Advice */}
        <Button
          onClick={getAdvice}
          disabled={isLoading || !selectedTopic}
          className="w-full text-xs h-9"
        >
          <Sparkles className="w-3.5 h-3.5 me-1.5 shrink-0" />
          <span className="truncate">{isLoading ? t('toolsInternal.partnerGuide.gettingAdvice') : t('toolsInternal.partnerGuide.getAdvice')}</span>
        </Button>

        {/* AI Response */}
        {response && (
          <Card className="p-3 bg-muted/50">
            <MarkdownRenderer content={response} isLoading={isLoading} />
          </Card>
        )}

        {/* Quick Tips */}
        <Card className="p-3 bg-muted/30">
          <h4 className="font-medium mb-2 text-xs">💡 {t('toolsInternal.partnerGuide.quickDailyActions')}</h4>
          <ul className="space-y-1.5 text-[10px]">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] shrink-0">1</span>
              <span className="truncate">{t('toolsInternal.partnerGuide.action1')}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] shrink-0">2</span>
              <span className="truncate">{t('toolsInternal.partnerGuide.action2')}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] shrink-0">3</span>
              <span className="truncate">{t('toolsInternal.partnerGuide.action3')}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] shrink-0">4</span>
              <span className="truncate">{t('toolsInternal.partnerGuide.action4')}</span>
            </li>
          </ul>
        </Card>

        {/* Educational Videos with Thumbnails */}
        <VideoLibrary
          videos={getPartnerVideos(t)}
          title={t('toolsInternal.partnerGuide.partnerVideos')}
          subtitle={t('toolsInternal.partnerGuide.partnerVideosSubtitle')}
          accentColor="rose"
        />
      </div>
    </ToolFrame>
  );
};

export default AIPartnerGuide;
