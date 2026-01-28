import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Baby, Sparkles, Activity, Clock } from "lucide-react";
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

const birthPreferences = [
  { id: "natural", label: "Natural/Unmedicated", icon: "🌿" },
  { id: "epidural", label: "With Epidural", icon: "💉" },
  { id: "water", label: "Water Birth", icon: "💧" },
  { id: "csection", label: "Planned C-Section", icon: "🏥" },
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
  { id: "squatting", name: "Squatting", description: "Opens pelvis 30%", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop" },
  { id: "hands-knees", name: "Hands & Knees", description: "Relieves back labor", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop" },
  { id: "side-lying", name: "Side Lying", description: "Rest between contractions", image: "https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=400&h=300&fit=crop" },
  { id: "standing", name: "Standing/Walking", description: "Uses gravity", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop" },
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
      title="Birth Positions"
      icon={Baby}
      mood="empowering"
    >
      <div className="space-y-6">
        {/* Non-intrusive Medical Reminder */}
        <MedicalInfoBar compact />
        
        {/* Position Gallery */}
        <div className="grid grid-cols-2 gap-3">
          {positions.map((pos) => (
            <Card key={pos.id} className="overflow-hidden">
              <img
                src={pos.image}
                alt={pos.name}
                className="w-full h-24 object-cover"
              />
              <div className="p-2">
                <h4 className="font-medium text-sm">{pos.name}</h4>
                <p className="text-xs text-muted-foreground">{pos.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Video Guide */}
        <Card className="p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Birth Positions Demonstration
          </h3>
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/goqbMfKoglc"
              title="Best Labor Positions For Each Phase"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Card>

        {/* Birth Preference */}
        <div className="space-y-3">
          <Label>Birth Preference</Label>
          <RadioGroup value={birthPlan} onValueChange={setBirthPlan} className="grid grid-cols-2 gap-2">
            {birthPreferences.map((pref) => (
              <div key={pref.id} className="flex items-center space-x-2">
                <RadioGroupItem value={pref.id} id={pref.id} />
                <Label htmlFor={pref.id} className="flex items-center gap-1 cursor-pointer">
                  <span>{pref.icon}</span>
                  <span className="text-sm">{pref.label}</span>
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
          className="w-full bg-gradient-to-r from-violet-500 to-purple-600"
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? "Analyzing..." : "Get AI Position Recommendations"}
        </Button>

        {/* AI Response */}
        {response && (
          <Card className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
            <MarkdownRenderer content={response} isLoading={isLoading} />
          </Card>
        )}
      </div>
    </ToolFrame>
  );
};

export default AIBirthPosition;
