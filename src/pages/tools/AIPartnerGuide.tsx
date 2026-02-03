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

const supportTopics = [
  { id: "emotional", label: "Emotional Support", icon: "💝", description: "How to be emotionally present" },
  { id: "physical", label: "Physical Comfort", icon: "🤲", description: "Massage, help with tasks" },
  { id: "appointments", label: "Medical Appointments", icon: "🏥", description: "Being involved in prenatal care" },
  { id: "communication", label: "Communication", icon: "💬", description: "Understanding mood changes" },
  { id: "bonding", label: "Bonding with Baby", icon: "👶", description: "Connecting before birth" },
  { id: "labor", label: "Labor Preparation", icon: "⏰", description: "Being ready for D-day" },
  { id: "postpartum", label: "Postpartum Planning", icon: "🏠", description: "After baby arrives" },
  { id: "intimacy", label: "Intimacy & Connection", icon: "❤️", description: "Maintaining closeness" },
];

const partnerVideos: Video[] = [
  {
    id: "1",
    title: "Newborn Care Week 1",
    description: "Pediatrician guide to first week with baby",
    youtubeId: "hpgjwK_oQe0",
    duration: "18:00",
    category: "Newborn Care"
  },
  {
    id: "2",
    title: "Caring For Your Newborn",
    description: "Comprehensive newborn care guide for new parents",
    youtubeId: "-CWJYxIvoFQ",
    duration: "15:00",
    category: "Newborn Care"
  },
  {
    id: "3",
    title: "Labor & Birth Positions",
    description: "How partners can help with comfort during labor",
    youtubeId: "nc8IbAAotHo",
    duration: "15:00",
    category: "Labor Support"
  },
  {
    id: "4",
    title: "Hospital Bag Preparation",
    description: "What to pack for labor and delivery",
    youtubeId: "NTulfAOzbp8",
    duration: "8:00",
    category: "Preparation"
  },
];

const AIPartnerGuide = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { streamChat, isLoading } = usePregnancyAI();
  
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [trimester, setTrimester] = useState<string>("second");
  const [partnerType, setPartnerType] = useState<string>("husband");
  const [response, setResponse] = useState("");

  const getAdvice = async () => {
    const topic = supportTopics.find(t => t.id === selectedTopic);
    
    const prompt = `As a pregnancy relationship counselor, provide guidance for a ${partnerType} supporting their pregnant partner:

**Pregnancy Week:** ${settings.pregnancyWeek || 20}
**Trimester:** ${trimester}
**Topic:** ${topic?.label} - ${topic?.description}

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
        toolName="AI Partner Support Guide"
      />
    );
  }

  return (
    <ToolFrame
      title="AI Partner Guide"
      customIcon="partner-guide"
      mood="nurturing"
    >
      <div className="space-y-6">
        {/* Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>I am her...</Label>
            <Select value={partnerType} onValueChange={setPartnerType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="husband">Husband</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="boyfriend">Boyfriend</SelectItem>
                <SelectItem value="wife">Wife</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Trimester</Label>
            <Select value={trimester} onValueChange={setTrimester}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first">First (1-12 weeks)</SelectItem>
                <SelectItem value="second">Second (13-26 weeks)</SelectItem>
                <SelectItem value="third">Third (27-40 weeks)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Topics */}
        <div className="space-y-3">
          <Label>What do you need help with?</Label>
          <div className="grid grid-cols-2 gap-2">
            {supportTopics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedTopic === topic.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted"
                }`}
              >
                <div className="text-2xl mb-1">{topic.icon}</div>
                <div className="font-medium text-sm">{topic.label}</div>
                <div className="text-xs text-muted-foreground">{topic.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Get Advice */}
        <Button
          onClick={getAdvice}
          disabled={isLoading || !selectedTopic}
          className="w-full"
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? "Getting Advice..." : "Get AI Partner Advice"}
        </Button>

        {/* AI Response */}
        {response && (
          <Card className="p-4 bg-muted/50">
            <MarkdownRenderer content={response} isLoading={isLoading} />
          </Card>
        )}

        {/* Quick Tips */}
        <Card className="p-4 bg-muted/30">
          <h4 className="font-medium mb-3">💡 Quick Daily Actions</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">1</span>
              Ask "How are you feeling today?" and truly listen
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">2</span>
              Offer a foot or back massage
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">3</span>
              Take over a household task without being asked
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">4</span>
              Read to the baby bump together
            </li>
          </ul>
        </Card>

        {/* Educational Videos with Thumbnails */}
        <VideoLibrary
          videos={partnerVideos}
          title="Partner Support Videos"
          subtitle="Learn how to be the best support partner"
          accentColor="rose"
        />
      </div>
    </ToolFrame>
  );
};

export default AIPartnerGuide;
