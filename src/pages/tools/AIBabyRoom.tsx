import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Home, Sparkles, Palette, Shield, Baby, Lightbulb, Upload, Camera, Wand2, RotateCcw, Check, X, Move } from "lucide-react";
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
import { toast } from "sonner";

const designStyles = [
  { id: "modern", label: "Modern Minimalist", icon: "⬜", colors: "White, gray, black accents" },
  { id: "boho", label: "Boho/Natural", icon: "🌿", colors: "Earthy tones, wood, plants" },
  { id: "classic", label: "Classic/Traditional", icon: "🎀", colors: "Soft pastels, white furniture" },
  { id: "safari", label: "Safari/Jungle", icon: "🦁", colors: "Greens, browns, animals" },
  { id: "space", label: "Space/Celestial", icon: "🌙", colors: "Navy, stars, moon" },
  { id: "rainbow", label: "Rainbow/Colorful", icon: "🌈", colors: "Bright, playful colors" },
];

const furnitureItems = [
  { id: "crib", name: "Crib", icon: "🛏️", position: { x: 50, y: 30 } },
  { id: "dresser", name: "Dresser", icon: "🗄️", position: { x: 80, y: 60 } },
  { id: "rocker", name: "Rocker", icon: "🪑", position: { x: 20, y: 50 } },
  { id: "rug", name: "Area Rug", icon: "🟫", position: { x: 50, y: 70 } },
  { id: "lamp", name: "Floor Lamp", icon: "💡", position: { x: 15, y: 30 } },
  { id: "shelf", name: "Wall Shelf", icon: "📚", position: { x: 85, y: 20 } },
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [roomSize, setRoomSize] = useState("");
  const [style, setStyle] = useState("");
  const [budget, setBudget] = useState("medium");
  const [babyGender, setBabyGender] = useState("unknown");
  const [response, setResponse] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"design" | "arrange">("design");
  const [placedFurniture, setPlacedFurniture] = useState<typeof furnitureItems>([]);
  const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        toast.success("Room photo uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  const addFurniture = (item: typeof furnitureItems[0]) => {
    if (placedFurniture.find(f => f.id === item.id)) {
      toast.error("This item is already placed");
      return;
    }
    setPlacedFurniture([...placedFurniture, { ...item, position: { x: 50, y: 50 } }]);
    toast.success(`${item.name} added to room`);
  };

  const removeFurniture = (id: string) => {
    setPlacedFurniture(placedFurniture.filter(f => f.id !== id));
  };

  const getDesignPlan = async () => {
    const selectedStyle = designStyles.find(s => s.id === style);
    const placedItems = placedFurniture.map(f => f.name).join(", ");

    const prompt = `As an interior designer specializing in nurseries, create a personalized baby room design plan:

**Room Size:** ${roomSize || "Average bedroom"} sq ft
**Design Style:** ${selectedStyle?.label || "Not specified"} - ${selectedStyle?.colors || ""}
**Budget:** ${budget === "low" ? "Budget-friendly ($500-1000)" : budget === "medium" ? "Mid-range ($1000-2500)" : "Premium ($2500+)"}
**Baby Gender:** ${babyGender === "boy" ? "Boy" : babyGender === "girl" ? "Girl" : "Unknown/Neutral"}
**Items Already Placed:** ${placedItems || "None"}
${uploadedImage ? "**Note:** User has uploaded a photo of their room for reference." : ""}

Provide a complete nursery design plan:
1. **Color Palette** - Primary, secondary, and accent colors with HEX codes
2. **Furniture Layout** - Optimal placement for safety and function
3. **Essential Purchases** - Specific product recommendations with price ranges
4. **Wall Decor Ideas** - Art, decals, or DIY projects
5. **Lighting Plan** - Main light, night light, reading lamp suggestions
6. **Storage Solutions** - Organizing clothes, diapers, toys efficiently
7. **Safety Features** - Must-have safety installations
8. **Budget Breakdown** - How to allocate spending

Include specific brand recommendations and where to buy.`;

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
      title="AI Baby Room Designer"
      icon={Home}
      mood="joyful"
    >
      <div className="space-y-5">
        {/* Interactive Hero */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="relative bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Wand2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">AI Nursery Designer</h3>
                <p className="text-white/80 text-sm">Upload, arrange, and get AI recommendations</p>
              </div>
            </div>
            
            {/* Tab Switcher */}
            <div className="flex gap-2 bg-white/10 rounded-xl p-1">
              <button
                onClick={() => setActiveTab("design")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "design" ? "bg-white text-purple-600" : "text-white/80 hover:text-white"
                }`}
              >
                🎨 Design Style
              </button>
              <button
                onClick={() => setActiveTab("arrange")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "arrange" ? "bg-white text-purple-600" : "text-white/80 hover:text-white"
                }`}
              >
                🪑 Arrange Room
              </button>
            </div>
          </div>
        </Card>

        {activeTab === "arrange" && (
          <>
            {/* Room Photo Upload */}
            <Card className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                Upload Your Room Photo
              </h4>
              
              {uploadedImage ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <img src={uploadedImage} alt="Your room" className="w-full h-full object-cover" />
                  
                  {/* Placed furniture overlay */}
                  {placedFurniture.map((item) => (
                    <div
                      key={item.id}
                      className={`absolute cursor-move transition-all ${
                        selectedFurniture === item.id ? "ring-2 ring-primary" : ""
                      }`}
                      style={{
                        left: `${item.position.x}%`,
                        top: `${item.position.y}%`,
                        transform: "translate(-50%, -50%)"
                      }}
                      onClick={() => setSelectedFurniture(item.id)}
                    >
                      <div className="bg-white/90 backdrop-blur rounded-lg p-2 shadow-lg">
                        <span className="text-2xl">{item.icon}</span>
                        {selectedFurniture === item.id && (
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFurniture(item.id); }}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => { setUploadedImage(null); setPlacedFurniture([]); }}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  <Upload className="w-10 h-10 text-primary/50 mb-3" />
                  <p className="text-sm font-medium text-primary">Click to upload room photo</p>
                  <p className="text-xs text-muted-foreground mt-1">or drag and drop (max 5MB)</p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </Card>

            {/* Furniture Palette */}
            <Card className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Move className="w-4 h-4 text-primary" />
                Add Furniture to Room
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {furnitureItems.map((item) => {
                  const isPlaced = placedFurniture.find(f => f.id === item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => !isPlaced && addFurniture(item)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        isPlaced
                          ? "bg-green-100 border-green-300 dark:bg-green-900/30"
                          : "bg-card hover:bg-muted border-border"
                      }`}
                    >
                      <span className="text-2xl block mb-1">{item.icon}</span>
                      <span className="text-xs font-medium">{item.name}</span>
                      {isPlaced && <Check className="w-3 h-3 text-green-600 mx-auto mt-1" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {uploadedImage ? "Click items to add them to your room photo" : "Upload a photo first to place furniture"}
              </p>
            </Card>
          </>
        )}

        {activeTab === "design" && (
          <>
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
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      style === s.id
                        ? "bg-primary/10 border-primary shadow-sm"
                        : "bg-card hover:bg-muted border-border"
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
          </>
        )}

        {/* Safety Checklist */}
        <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600" />
            Safety Checklist
          </h4>
          <ul className="space-y-1.5 text-sm">
            {safetyChecklist.map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <Checkbox id={`safety-${i}`} />
                <label htmlFor={`safety-${i}`} className="text-muted-foreground cursor-pointer">{item}</label>
              </li>
            ))}
          </ul>
        </Card>

        {/* Get Design Plan */}
        <Button
          onClick={getDesignPlan}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? "Designing..." : "Get AI Design Plan"}
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