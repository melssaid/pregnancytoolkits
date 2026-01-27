import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Home, Sparkles, Palette, Shield, Baby, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolFrame } from "@/components/ToolFrame";
import MedicalDisclaimer from "@/components/compliance/MedicalDisclaimer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";

const designStyles = [
  { id: "modern", label: "Modern Minimalist", icon: "⬜", colors: "White, gray, black accents" },
  { id: "boho", label: "Boho/Natural", icon: "🌿", colors: "Earthy tones, wood, plants" },
  { id: "classic", label: "Classic/Traditional", icon: "🎀", colors: "Soft pastels, white furniture" },
  { id: "safari", label: "Safari/Jungle", icon: "🦁", colors: "Greens, browns, animals" },
  { id: "space", label: "Space/Celestial", icon: "🌙", colors: "Navy, stars, moon" },
  { id: "rainbow", label: "Rainbow/Colorful", icon: "🌈", colors: "Bright, playful colors" },
];

const essentialItems = [
  { id: "crib", name: "Crib", essential: true },
  { id: "mattress", name: "Crib Mattress", essential: true },
  { id: "dresser", name: "Dresser/Changing Table", essential: true },
  { id: "rocker", name: "Glider/Rocker", essential: false },
  { id: "monitor", name: "Baby Monitor", essential: true },
  { id: "blackout", name: "Blackout Curtains", essential: false },
  { id: "sound", name: "White Noise Machine", essential: false },
  { id: "hamper", name: "Diaper Pail", essential: true },
];

const safetyChecklist = [
  "Crib meets current safety standards",
  "No loose bedding, pillows, or toys in crib",
  "Furniture anchored to walls",
  "Outlet covers installed",
  "Blind cords out of reach",
  "Room temperature 68-72°F",
  "Smoke detector in/near nursery",
];

const AIBabyRoom = () => {
  const { t } = useTranslation();
  const { streamChat, isLoading } = usePregnancyAI();
  
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [roomSize, setRoomSize] = useState("");
  const [style, setStyle] = useState("");
  const [budget, setBudget] = useState("medium");
  const [babyGender, setBabyGender] = useState("unknown");
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [response, setResponse] = useState("");

  const toggleItem = (id: string) => {
    setOwnedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getDesignPlan = async () => {
    const selectedStyle = designStyles.find(s => s.id === style);
    const neededItems = essentialItems.filter(i => !ownedItems.includes(i.id)).map(i => i.name);

    const prompt = `As an interior designer specializing in nurseries, create a personalized baby room design plan:

**Room Size:** ${roomSize || "Average bedroom"} sq ft
**Design Style:** ${selectedStyle?.label || "Not specified"} - ${selectedStyle?.colors || ""}
**Budget:** ${budget === "low" ? "Budget-friendly ($500-1000)" : budget === "medium" ? "Mid-range ($1000-2500)" : "Premium ($2500+)"}
**Baby Gender:** ${babyGender === "boy" ? "Boy" : babyGender === "girl" ? "Girl" : "Unknown/Neutral"}
**Items Still Needed:** ${neededItems.join(", ") || "Have all essentials"}

Provide a complete nursery design plan:
1. **Color Palette** - Primary, secondary, and accent colors
2. **Furniture Layout** - Optimal placement for safety and function
3. **Essential Purchases** - Specific product recommendations with price ranges
4. **Wall Decor Ideas** - Art, decals, or DIY projects
5. **Lighting Plan** - Main light, night light, reading lamp
6. **Storage Solutions** - Organizing clothes, diapers, toys
7. **Safety Features** - Must-have safety installations
8. **Timeline** - When to set up (recommend finishing by week 36)
9. **Budget Breakdown** - How to allocate spending

Include specific brand recommendations and where to buy. Suggest DIY alternatives for budget options.`;

    setResponse("");
    await streamChat({
      type: "pregnancy-assistant",
      messages: [{ role: "user", content: prompt }],
      onDelta: (text) => setResponse((prev) => prev + text),
      onDone: () => {},
    });
  };

  if (!disclaimerAccepted) {
    return (
      <MedicalDisclaimer
        onAccept={() => setDisclaimerAccepted(true)}
        toolName="AI Baby Room Designer"
      />
    );
  }

  return (
    <ToolFrame
      title="Baby Room Designer"
      icon={Home}
      mood="joyful"
    >
      <div className="space-y-6">
        {/* Inspiration Gallery */}
        <div className="grid grid-cols-2 gap-3">
          <img
            src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop"
            alt="Modern nursery"
            className="w-full h-28 object-cover rounded-lg"
          />
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop"
            alt="Cozy nursery"
            className="w-full h-28 object-cover rounded-lg"
          />
        </div>

        {/* Room Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Room Size (sq ft)</Label>
            <Input
              type="number"
              value={roomSize}
              onChange={(e) => setRoomSize(e.target.value)}
              placeholder="120"
            />
          </div>
          <div className="space-y-2">
            <Label>Baby Gender</Label>
            <Select value={babyGender} onValueChange={setBabyGender}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unknown">💚 Unknown/Neutral</SelectItem>
                <SelectItem value="boy">💙 Boy</SelectItem>
                <SelectItem value="girl">💗 Girl</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Design Styles */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            Design Style
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {designStyles.map((s) => (
              <div
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  style === s.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-sm font-medium">{s.label}</span>
                </div>
                <div className="text-xs text-muted-foreground">{s.colors}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <Label>Budget Range</Label>
          <Select value={budget} onValueChange={setBudget}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">💵 Budget-friendly ($500-1000)</SelectItem>
              <SelectItem value="medium">💰 Mid-range ($1000-2500)</SelectItem>
              <SelectItem value="high">💎 Premium ($2500+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Items Already Owned */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Baby className="w-4 h-4 text-primary" />
            Items You Already Have
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {essentialItems.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center gap-2 ${
                  ownedItems.includes(item.id)
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted"
                }`}
              >
                <Checkbox checked={ownedItems.includes(item.id)} />
                <span className="text-sm">{item.name}</span>
                {item.essential && (
                  <span className="text-xs text-amber-600">★</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Safety Checklist */}
        <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600" />
            Safety Checklist
          </h4>
          <ul className="space-y-1 text-sm">
            {safetyChecklist.map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-amber-600">☐</span>
                {item}
              </li>
            ))}
          </ul>
        </Card>

        {/* Get Design Plan */}
        <Button
          onClick={getDesignPlan}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-600"
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? "Designing..." : "Get AI Nursery Design"}
        </Button>

        {/* AI Response */}
        {response && (
          <Card className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
            <MarkdownRenderer content={response} isLoading={isLoading} />
          </Card>
        )}

        {/* Pro Tip */}
        <Card className="p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <strong>Pro tip:</strong> Set up the nursery by week 34-36 to have time 
              for any final adjustments and to enjoy the space before baby arrives!
            </p>
          </div>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default AIBabyRoom;
