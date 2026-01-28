import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Home, Sparkles, Shield, Lightbulb, Save, Download, RotateCcw, ImageUp } from "lucide-react";
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
        
        {/* Theme Selection - Compact */}
        <Card className="p-3">
          <ThemeSelector
            selectedTheme={selectedTheme}
            onThemeChange={setSelectedTheme}
          />
        </Card>

        {/* Quick Start or Workspace */}
        {!hasDesign ? (
          <div className="space-y-4">
            {/* Upload Zone */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ImageUp className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Upload Your Room</h3>
              </div>
              <UploadZone
                onImageUploaded={handleImageUploaded}
                themeColor={selectedTheme.primaryColor}
              />
            </Card>

            {/* Templates */}
            <Card className="p-4">
              <TemplateGallery
                onSelectTemplate={handleSelectTemplate}
                currentTheme={selectedTheme}
              />
            </Card>
          </div>
        ) : (
          <>
            {/* Workspace Header with Actions */}
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {placedFurniture.length} items placed
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSaveDesign}
                    className="h-8 w-8 relative"
                    aria-label="Save"
                  >
                    <Save className="w-4 h-4" />
                    {hasUnsavedChanges && (
                      <span 
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary"
                      />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleExportDesign}
                    className="h-8 w-8"
                    aria-label="Export JPG"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleStartOver}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    aria-label="Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Canvas with Built-in Asset Library */}
            <div ref={canvasContainerRef}>
              <Card className="overflow-hidden">
                {/* Desktop: Side Asset Library */}
                <div className="hidden md:block">
                  <AssetLibrary onAssetSelect={handleAddFurniture} theme={selectedTheme} />
                </div>
                
                {/* Mobile: Tap canvas to add items */}
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
          </>
        )}

        {/* AI Design Plan Button */}
        {hasDesign && (
          <Button
            onClick={getAIDesignPlan}
            disabled={isLoading}
            className="w-full h-11"
            style={{
              background: `linear-gradient(135deg, hsl(${selectedTheme.primaryColor}), hsl(${selectedTheme.accentColor}))`,
            }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isLoading ? "Generating Plan..." : "Get AI Design Plan"}
          </Button>
        )}

        {/* AI Response */}
        {showDesignPanel && (response || isLoading) && (
          <Card className="p-4 border-l-4" style={{ borderLeftColor: `hsl(${selectedTheme.accentColor})` }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" style={{ color: `hsl(${selectedTheme.accentColor})` }} />
              <h4 className="font-semibold text-sm">Your Design Plan</h4>
            </div>
            <MarkdownRenderer content={response} isLoading={isLoading} />
          </Card>
        )}

        {/* Safety & Tips - Collapsible */}
        <details className="group">
          <summary className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg cursor-pointer list-none">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Safety Checklist</span>
            <span className="ml-auto text-xs text-muted-foreground group-open:hidden">+</span>
            <span className="ml-auto text-xs text-muted-foreground hidden group-open:inline">−</span>
          </summary>
          <Card className="mt-2 p-3">
            <ul className="space-y-2">
              {safetyChecklist.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Checkbox id={`safety-${i}`} className="mt-0.5" />
                  <label htmlFor={`safety-${i}`} className="text-xs text-muted-foreground cursor-pointer">
                    {item}
                  </label>
                </li>
              ))}
            </ul>
          </Card>
        </details>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/20 border border-border/50">
          <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
          <p className="text-xs text-muted-foreground">
            <strong>Pro tip:</strong> Set up the nursery by week 34-36 to have time for adjustments!
          </p>
        </div>
      </div>
    </ToolFrame>
  );
};

export default AIBabyRoom;
