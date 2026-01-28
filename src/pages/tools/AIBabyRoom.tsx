import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Home, Sparkles, Shield, Lightbulb, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolFrame } from "@/components/ToolFrame";
import MedicalDisclaimer from "@/components/compliance/MedicalDisclaimer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { toast } from "sonner";
import {
  UploadZone,
  RoomCanvas,
  AssetLibrary,
  ThemeSelector,
  ROOM_THEMES,
  type PlacedFurniture,
  type FurnitureAsset,
  type RoomTheme,
} from "@/components/room-designer";

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
  const [selectedTheme, setSelectedTheme] = useState<RoomTheme>(ROOM_THEMES[0]); // Soft Pink default
  const [roomImage, setRoomImage] = useState<string | null>(null);
  const [placedFurniture, setPlacedFurniture] = useState<PlacedFurniture[]>([]);
  const [response, setResponse] = useState("");
  const [showDesignPanel, setShowDesignPanel] = useState(false);

  const handleImageUploaded = useCallback((imageUrl: string) => {
    setRoomImage(imageUrl);
    toast.success("Room ready for design!");
  }, []);

  const handleAddFurniture = useCallback((asset: FurnitureAsset) => {
    const newItem: PlacedFurniture = {
      ...asset,
      instanceId: `${asset.id}-${Date.now()}`,
      position: { x: 50, y: 50 },
      rotation: 0,
      scale: 1,
    };
    setPlacedFurniture((prev) => [...prev, newItem]);
    toast.success(`${asset.name} added!`);
  }, []);

  const getAIDesignPlan = async () => {
    const furnitureList = placedFurniture.map((f) => f.name).join(", ");

    const prompt = `As a professional nursery interior designer, create a personalized baby room design plan based on:

**Selected Theme:** ${selectedTheme.name} (${selectedTheme.icon})
**Color Palette:** Primary: hsl(${selectedTheme.primaryColor}), Accent: hsl(${selectedTheme.accentColor})
**Furniture Already Placed:** ${furnitureList || "None yet"}
${roomImage ? "**Note:** User has uploaded a room photo for reference." : ""}

Provide a complete, actionable nursery design plan:

1. **Color Harmony** - How to extend the ${selectedTheme.name} theme throughout the room
2. **Furniture Arrangement** - Optimal placement for safety, flow, and aesthetics
3. **Wall Treatment** - Paint, wallpaper, or decal recommendations
4. **Lighting Design** - Natural light optimization + artificial lighting layers
5. **Textile Coordination** - Curtains, rugs, bedding that complement the theme
6. **Storage Solutions** - Clever organization for baby essentials
7. **Safety Considerations** - Theme-specific safety notes
8. **Final Touches** - Decor accessories and personal touches

Include specific product recommendations and estimated costs where helpful.`;

    setResponse("");
    setShowDesignPanel(true);
    
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
    <ToolFrame title="AI Baby Room Designer" icon={Home} mood="joyful">
      <div className="space-y-5">
        {/* Compact Hero Header */}
        <div
          className="flex items-center gap-3 p-3 rounded-xl shadow-md"
          style={{
            background: `linear-gradient(135deg, hsl(${selectedTheme.primaryColor}), hsl(${selectedTheme.accentColor}))`,
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white">AI Interior Designer</h3>
            <p className="text-white/80 text-xs truncate">
              Drag furniture • Choose themes • Get AI tips
            </p>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="relative min-h-[400px] rounded-2xl overflow-hidden border bg-muted/30">
          {/* Theme Selector */}
          <ThemeSelector
            selectedTheme={selectedTheme}
            onThemeChange={setSelectedTheme}
          />

          {/* Asset Library - hidden on mobile, shown on larger screens */}
          <div className="hidden md:block">
            <AssetLibrary onAssetSelect={handleAddFurniture} theme={selectedTheme} />
          </div>

          {/* Upload Zone or Canvas */}
          <div className="p-4 md:pl-[240px]">
            {!roomImage && placedFurniture.length === 0 ? (
              <UploadZone
                onImageUploaded={handleImageUploaded}
                themeColor={selectedTheme.primaryColor}
              />
            ) : (
              <RoomCanvas
                roomImage={roomImage}
                placedFurniture={placedFurniture}
                onFurnitureUpdate={setPlacedFurniture}
                theme={selectedTheme}
                onAddFurniture={handleAddFurniture}
              />
            )}
          </div>
        </div>

        {/* Mobile Asset Library - collapsible horizontal scroll */}
        <div className="md:hidden">
          <Card className="p-3" style={{ borderColor: `hsl(${selectedTheme.primaryColor} / 0.2)` }}>
            <p className="text-xs text-muted-foreground mb-2 font-medium">Tap to add furniture:</p>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {[
                { id: 'crib', name: 'Crib', icon: '🛏️', category: 'furniture' as const, defaultSize: { width: 120, height: 80 } },
                { id: 'nursing-chair', name: 'Chair', icon: '🪑', category: 'furniture' as const, defaultSize: { width: 80, height: 80 } },
                { id: 'dresser', name: 'Dresser', icon: '🗃️', category: 'furniture' as const, defaultSize: { width: 100, height: 50 } },
                { id: 'rug', name: 'Rug', icon: '🟫', category: 'textile' as const, defaultSize: { width: 140, height: 100 } },
                { id: 'floor-lamp', name: 'Lamp', icon: '🪔', category: 'lighting' as const, defaultSize: { width: 40, height: 40 } },
                { id: 'plant', name: 'Plant', icon: '🪴', category: 'decor' as const, defaultSize: { width: 40, height: 50 } },
              ].map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleAddFurniture(asset)}
                  className="flex-shrink-0 w-14 h-14 rounded-xl border bg-card flex flex-col items-center justify-center gap-0.5 hover:bg-muted transition-colors"
                  style={{ borderColor: `hsl(${selectedTheme.primaryColor} / 0.2)` }}
                >
                  <span className="text-xl">{asset.icon}</span>
                  <span className="text-[9px] text-muted-foreground">{asset.name}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Reset button if image is uploaded */}
        {(roomImage || placedFurniture.length > 0) && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRoomImage(null);
                setPlacedFurniture([]);
                setResponse("");
                setShowDesignPanel(false);
              }}
            >
              Start Over
            </Button>
          </div>
        )}

        {/* Safety Checklist */}
        <Card
          className="p-4 border"
          style={{
            background: `hsl(${selectedTheme.primaryColor} / 0.1)`,
            borderColor: `hsl(${selectedTheme.primaryColor} / 0.3)`,
          }}
        >
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: `hsl(${selectedTheme.accentColor})` }} />
            Safety Checklist
          </h4>
          <ul className="space-y-1.5 text-sm">
            {safetyChecklist.map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <Checkbox id={`safety-${i}`} />
                <label
                  htmlFor={`safety-${i}`}
                  className="text-muted-foreground cursor-pointer"
                >
                  {item}
                </label>
              </li>
            ))}
          </ul>
        </Card>

        {/* Get AI Design Plan Button */}
        <Button
          onClick={getAIDesignPlan}
          disabled={isLoading}
          className="w-full"
          size="lg"
          style={{
            background: `linear-gradient(135deg, hsl(${selectedTheme.primaryColor}), hsl(${selectedTheme.accentColor}))`,
          }}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? "Designing..." : "Get AI Design Plan"}
        </Button>

        {/* AI Response */}
        {showDesignPanel && response && (
          <Card
            className="p-4"
            style={{
              background: `linear-gradient(135deg, hsl(${selectedTheme.primaryColor} / 0.1), hsl(${selectedTheme.secondaryColor} / 0.1))`,
            }}
          >
            <MarkdownRenderer content={response} isLoading={isLoading} />
          </Card>
        )}

        {/* Pro Tip */}
        <Card className="p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <strong>Pro tip:</strong> Set up the nursery by week 34-36 to have
              time for any final adjustments and to enjoy the space before baby
              arrives!
            </p>
          </div>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default AIBabyRoom;
