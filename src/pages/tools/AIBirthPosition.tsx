import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Baby, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolFrame } from "@/components/ToolFrame";
import { MedicalInfoBar } from "@/components/compliance";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useSettings } from "@/hooks/useSettings";
import { VideoLibrary, Video } from "@/components/VideoLibrary";

const birthPreferences = [
  { id: "natural", label: "Natural/Unmedicated" },
  { id: "epidural", label: "With Epidural" },
  { id: "water", label: "Water Birth" },
  { id: "csection", label: "Planned C-Section" },
];

const physicalConditions = [
  { id: "back-pain", label: "Back pain" },
  { id: "hip-pain", label: "Hip pain" },
  { id: "sciatica", label: "Sciatica" },
  { id: "spd", label: "SPD/Pelvic pain" },
  { id: "high-bp", label: "High blood pressure" },
  { id: "none", label: "No specific conditions" },
];

const positions = [
  { id: "squatting", name: "Squatting", description: "Opens pelvis 30%" },
  { id: "hands-knees", name: "Hands & Knees", description: "Relieves back labor" },
  { id: "side-lying", name: "Side Lying", description: "Rest between contractions" },
  { id: "standing", name: "Standing/Walking", description: "Uses gravity" },
];

const birthPositionVideos: Video[] = [
  {
    id: "1",
    title: "Top 5 Pushing Positions for Childbirth",
    description: "Best positions for effective pushing during labor",
    youtubeId: "npGb1aHQteo",
    duration: "10:00",
    category: "Pushing"
  },
  {
    id: "2",
    title: "Birth Faster With Less Pain",
    description: "Childbirth positions for easier labor",
    youtubeId: "nc8IbAAotHo",
    duration: "15:00",
    category: "Labor Positions"
  },
  {
    id: "3",
    title: "Different Pushing Positions in Labour",
    description: "Various positions explained for delivery",
    youtubeId: "i7vcGKtyqCY",
    duration: "12:00",
    category: "Pushing"
  },
  {
    id: "4",
    title: "The Best Positions for Birth",
    description: "Expert guide to optimal birthing positions",
    youtubeId: "CENq9lrciN0",
    duration: "14:00",
    category: "Labor Positions"
  },
];

const AIBirthPosition = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { streamChat, isLoading } = usePregnancyAI();
  
  const [birthPlan, setBirthPlan] = useState("natural");
  const [conditions, setConditions] = useState<string[]>([]);
  const [laborStage, setLaborStage] = useState("early");
  const [response, setResponse] = useState("");

  const toggleCondition = (id: string) => {
    setConditions(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const getRecommendations = async () => {
    const conditionLabels = conditions.map(id => 
      physicalConditions.find(c => c.id === id)?.label
    ).filter(Boolean);

    const prompt = `As a certified doula and birth position specialist, recommend optimal birthing positions:

**Pregnancy Week:** ${settings.pregnancyWeek || 38}
**Birth Preference:** ${birthPreferences.find(b => b.id === birthPlan)?.label}
**Physical Conditions:** ${conditionLabels.join(", ") || "None"}
**Labor Stage:** ${laborStage === "early" ? "Early labor" : laborStage === "active" ? "Active labor" : "Pushing stage"}

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
      <div className="space-y-6">
        {/* Non-intrusive Medical Reminder */}
        <MedicalInfoBar compact />
        
        {/* Position Cards - Professional List */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Common Birth Positions</Label>
          <div className="grid grid-cols-2 gap-2">
            {positions.map((pos) => (
              <Card key={pos.id} className="p-3">
                <h4 className="font-medium text-sm">{pos.name}</h4>
                <p className="text-xs text-muted-foreground">{pos.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Birth Preference */}
        <div className="space-y-3">
          <Label>Birth Preference</Label>
          <RadioGroup value={birthPlan} onValueChange={setBirthPlan} className="space-y-2">
            {birthPreferences.map((pref) => (
              <div 
                key={pref.id} 
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                  birthPlan === pref.id ? "bg-primary/10 border-primary" : "bg-card hover:bg-muted"
                }`}
                onClick={() => setBirthPlan(pref.id)}
              >
                <RadioGroupItem value={pref.id} id={pref.id} />
                <Label htmlFor={pref.id} className="cursor-pointer text-sm flex-1">
                  {pref.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Labor Stage */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Labor Stage
          </Label>
          <RadioGroup value={laborStage} onValueChange={setLaborStage} className="flex gap-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="early" id="early" />
              <Label htmlFor="early">Early</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="active" id="active" />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pushing" id="pushing" />
              <Label htmlFor="pushing">Pushing</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Physical Conditions */}
        <div className="space-y-3">
          <Label>Physical Conditions</Label>
          <div className="grid grid-cols-2 gap-2">
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
                <Checkbox checked={conditions.includes(condition.id)} />
                <span className="text-sm">{condition.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Get Recommendations */}
        <Button
          onClick={getRecommendations}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? "Analyzing..." : "Get AI Position Recommendations"}
        </Button>

        {/* AI Response */}
        {response && (
          <Card className="p-4 bg-muted/50">
            <MarkdownRenderer content={response} isLoading={isLoading} />
          </Card>
        )}

        {/* Educational Videos with Thumbnails */}
        <VideoLibrary
          videos={birthPositionVideos}
          title="Birth Position Videos"
          subtitle="Visual guides for labor positions"
          accentColor="rose"
        />
      </div>
    </ToolFrame>
  );
};

export default AIBirthPosition;
