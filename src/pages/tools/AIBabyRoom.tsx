import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Home, Sparkles, Shield, Lightbulb, Wand2, Save, Download, Layout, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolFrame } from "@/components/ToolFrame";
import MedicalDisclaimer from "@/components/compliance/MedicalDisclaimer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useRoomDesignStorage } from "@/hooks/useRoomDesignStorage";
import { useExportDesign } from "@/hooks/useExportDesign";
import { toast } from "sonner";
import {
  UploadZone,
  RoomCanvas,
  AssetLibrary,
  ThemeSelector,
  TemplateGallery,
  MobileAssetPicker,
  ROOM_THEMES,
  type PlacedFurniture,
  type FurnitureAsset,
  type RoomTheme,
  type DesignTemplate,
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
  const { saveDesign, loadDesign, clearDesign, hasSavedDesign, isLoaded } = useRoomDesignStorage();
  const { exportAsImage } = useExportDesign();
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<RoomTheme>(ROOM_THEMES[0]);
  const [roomImage, setRoomImage] = useState<string | null>(null);
  const [placedFurniture, setPlacedFurniture] = useState<PlacedFurniture[]>([]);
  const [response, setResponse] = useState("");
  const [showDesignPanel, setShowDesignPanel] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load saved design on mount
  useEffect(() => {
    if (isLoaded && hasSavedDesign()) {
      const saved = loadDesign();
      if (saved) {
        setPlacedFurniture(saved.placedFurniture);
        setSelectedTheme(saved.theme);
        setRoomImage(saved.roomImage);
        toast.success("Previous design restored!");
      }
    }
  }, [isLoaded, hasSavedDesign, loadDesign]);

  // Track unsaved changes
  useEffect(() => {
    if (placedFurniture.length > 0 || roomImage) {
      setHasUnsavedChanges(true);
    }
  }, [placedFurniture, roomImage, selectedTheme]);

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
    setShowTemplates(false);
    toast.success(`${asset.name} added!`);
  }, []);

  const handleSaveDesign = useCallback(() => {
    const success = saveDesign(placedFurniture, selectedTheme, roomImage);
    if (success) {
      setHasUnsavedChanges(false);
      toast.success("Design saved!");
    } else {
      toast.error("Failed to save design");
    }
  }, [placedFurniture, selectedTheme, roomImage, saveDesign]);

  const handleExportDesign = useCallback(async () => {
    await exportAsImage(canvasContainerRef, 'baby-room-design');
  }, [exportAsImage]);

  const handleStartOver = useCallback(() => {
    setRoomImage(null);
    setPlacedFurniture([]);
    setResponse("");
    setShowDesignPanel(false);
    setShowTemplates(false);
    setHasUnsavedChanges(false);
    clearDesign();
  }, [clearDesign]);

  const handleSelectTemplate = useCallback((template: DesignTemplate) => {
    const furnitureWithIds: PlacedFurniture[] = template.furniture.map((item, index) => ({
      ...item,
      instanceId: `${item.id}-template-${Date.now()}-${index}`,
    }));
    setPlacedFurniture(furnitureWithIds);
    setSelectedTheme(template.theme);
    setShowTemplates(false);
    toast.success(`Template "${template.name}" applied!`);
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

  const hasDesign = roomImage || placedFurniture.length > 0;

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
      <div className="space-y-4">
        
        {/* Step 1: Theme Selection */}
        <Card className="p-4">
          <ThemeSelector
            selectedTheme={selectedTheme}
            onThemeChange={setSelectedTheme}
          />
        </Card>

        {/* Step 2: Quick Start Options */}
        {!hasDesign && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Wand2 className="w-5 h-5" style={{ color: `hsl(${selectedTheme.accentColor})` }} />
              <h3 className="font-semibold">Start Designing</h3>
            </div>
            
            <div className="space-y-3">
              {/* Upload Option */}
              <UploadZone
                onImageUploaded={handleImageUploaded}
                themeColor={selectedTheme.primaryColor}
              />
              
              {/* Or use templates */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or choose a template</span>
                </div>
              </div>
              
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setShowTemplates(!showTemplates)}
                style={{ borderColor: `hsl(${selectedTheme.primaryColor} / 0.3)` }}
              >
                <Layout className="w-4 h-4" />
                {showTemplates ? "Hide Templates" : "Browse Ready Templates"}
              </Button>
              
              {showTemplates && (
                <div className="pt-2">
                  <TemplateGallery
                    onSelectTemplate={handleSelectTemplate}
                    currentTheme={selectedTheme}
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Step 3: Add Furniture (when design started) */}
        {hasDesign && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🪑</span>
                <h3 className="font-semibold text-sm">Add Furniture</h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {placedFurniture.length} items
              </span>
            </div>
            <MobileAssetPicker 
              onAssetSelect={handleAddFurniture} 
              theme={selectedTheme} 
            />
          </Card>
        )}

        {/* Step 4: Room Canvas (when design started) */}
        {hasDesign && (
          <div ref={canvasContainerRef}>
            <Card className="overflow-hidden">
              {/* Desktop: show asset library sidebar */}
              <div className="hidden md:block relative">
                <AssetLibrary onAssetSelect={handleAddFurniture} theme={selectedTheme} />
              </div>
              
              <div className="p-2 md:pl-[230px]">
                <RoomCanvas
                  roomImage={roomImage}
                  placedFurniture={placedFurniture}
                  onFurnitureUpdate={setPlacedFurniture}
                  theme={selectedTheme}
                  onAddFurniture={handleAddFurniture}
                />
              </div>
            </Card>
          </div>
        )}

        {/* Step 5: Action Buttons */}
        {hasDesign && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDesign}
              className="gap-1.5"
            >
              <Save className="w-4 h-4" />
              Save
              {hasUnsavedChanges && <span className="w-2 h-2 rounded-full bg-amber-500" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportDesign}
              className="gap-1.5"
            >
              <Download className="w-4 h-4" />
              Export JPG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
              className="gap-1.5"
            >
              <Layout className="w-4 h-4" />
              Templates
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartOver}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <RotateCcw className="w-4 h-4" />
              Start Over
            </Button>
          </div>
        )}

        {/* Templates Modal (when design exists) */}
        {hasDesign && showTemplates && (
          <Card className="p-4">
            <TemplateGallery
              onSelectTemplate={handleSelectTemplate}
              currentTheme={selectedTheme}
            />
          </Card>
        )}

        {/* Step 6: Get AI Plan */}
        <Button
          onClick={getAIDesignPlan}
          disabled={isLoading}
          className="w-full text-white"
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

        {/* Safety Checklist */}
        <Card
          className="p-4 border"
          style={{
            background: `hsl(${selectedTheme.primaryColor} / 0.05)`,
            borderColor: `hsl(${selectedTheme.primaryColor} / 0.2)`,
          }}
        >
          <h4 className="font-medium mb-3 flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4" style={{ color: `hsl(${selectedTheme.accentColor})` }} />
            Safety Checklist
          </h4>
          <ul className="space-y-2">
            {safetyChecklist.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <Checkbox id={`safety-${i}`} className="mt-0.5" />
                <label
                  htmlFor={`safety-${i}`}
                  className="text-xs text-muted-foreground cursor-pointer leading-relaxed"
                >
                  {item}
                </label>
              </li>
            ))}
          </ul>
        </Card>

        {/* Pro Tip */}
        <Card className="p-3 bg-muted/50">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <strong>Pro tip:</strong> Set up the nursery by week 34-36 to have
              time for adjustments before baby arrives!
            </p>
          </div>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default AIBabyRoom;
