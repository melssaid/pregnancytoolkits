import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart, Sparkles, MessageCircle, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolFrame } from "@/components/ToolFrame";
import MedicalDisclaimer from "@/components/compliance/MedicalDisclaimer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useSettings } from "@/hooks/useSettings";

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
        {/* Hero Image */}
        <Card className="overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=800&h=350&fit=crop"
            alt="Couple expecting baby"
            className="w-full h-48 object-cover"
          />
          <div className="p-4 bg-gradient-to-r from-pink-500/10 to-rose-500/10">
            <h3 className="font-semibold flex items-center gap-2">
              <HandHeart className="w-5 h-5 text-pink-500" />
              Supporting Your Partner Through Pregnancy
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered guidance for being the best support person
            </p>
          </div>
        </Card>

        {/* Video Resource */}
        <Card className="p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            Partner Communication Tips
          </h3>
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/DugH6BxEWeE"
              title="How to Support Your Partner During Labor"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Card>

        {/* Second Video - For Dads */}
        <Card className="p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            Ultimate Guide for Expecting Dads
          </h3>
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/asxKTBCs1vk"
              title="Ultimate Guide for Expecting Fathers"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Card>

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
          className="w-full bg-gradient-to-r from-pink-500 to-rose-600"
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? "Getting Advice..." : "Get AI Partner Advice"}
        </Button>

        {/* AI Response */}
        {response && (
          <Card className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30">
            <MarkdownRenderer content={response} isLoading={isLoading} />
          </Card>
        )}

        {/* Quick Tips */}
        <Card className="p-4 bg-muted/50">
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
      </div>
    </ToolFrame>
  );
};

export default AIPartnerGuide;
