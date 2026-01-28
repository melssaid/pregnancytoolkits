import { useState, useCallback, useRef } from "react";
import { Home, Sparkles, Wand2, Download, RotateCcw, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ToolFrame } from "@/components/ToolFrame";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useDisclaimerAccepted } from "@/hooks/useDisclaimerAccepted";
import { useExportDesign } from "@/hooks/useExportDesign";
import { InlineDisclaimer } from "@/components/compliance/InlineDisclaimer";
import MedicalDisclaimer from "@/components/compliance/MedicalDisclaimer";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ROOM_THEMES, 
  FURNITURE_ASSETS,
  type PlacedFurniture, 
  type RoomTheme 
} from "@/components/room-designer/types";

const AIBabyRoom = () => {
  const { streamChat, isLoading } = usePregnancyAI();
  const { isAccepted, isLoading: disclaimerLoading, accept } = useDisclaimerAccepted();
  const { exportAsImage } = useExportDesign();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [selectedTheme, setSelectedTheme] = useState<RoomTheme>(ROOM_THEMES[0]);
  const [placedItems, setPlacedItems] = useState<PlacedFurniture[]>([]);
  const [response, setResponse] = useState("");
  const [showAIPlan, setShowAIPlan] = useState(false);

  const handleAddItem = useCallback((assetId: string) => {
    const asset = FURNITURE_ASSETS.find(a => a.id === assetId);
    if (!asset) return;
    
    const newItem: PlacedFurniture = {
      ...asset,
      instanceId: `${asset.id}-${Date.now()}`,
      position: { x: 30 + Math.random() * 40, y: 30 + Math.random() * 40 },
      rotation: 0,
      scale: 1,
    };
    setPlacedItems(prev => [...prev, newItem]);
    toast.success(`${asset.name} added`);
  }, []);

  const handleRemoveItem = useCallback((instanceId: string) => {
    setPlacedItems(prev => prev.filter(item => item.instanceId !== instanceId));
  }, []);

  const handleReset = useCallback(() => {
    setPlacedItems([]);
    setResponse("");
    setShowAIPlan(false);
  }, []);

  const handleExport = useCallback(async () => {
    await exportAsImage(canvasRef, 'nursery-design');
  }, [exportAsImage]);

  const generateAIPlan = async () => {
    const items = placedItems.map(p => p.name).join(", ");
    const prompt = `As a professional nursery designer, create a complete baby room design plan.

**Theme:** ${selectedTheme.name}
**Color Palette:** Primary: hsl(${selectedTheme.primaryColor}), Accent: hsl(${selectedTheme.accentColor})
**Items Chosen:** ${items || "None yet - suggest essential items"}

Provide a detailed, actionable plan:

1. **Layout Recommendation** - Where to place each piece
2. **Color Coordination** - Wall colors, accents to match theme
3. **Essential Additions** - What else is needed
4. **Safety Tips** - Theme-specific safety considerations
5. **Decor Ideas** - Wall art, textiles, finishing touches
6. **Budget Estimate** - Approximate costs

Be specific and practical.`;

    setResponse("");
    setShowAIPlan(true);
    
    await streamChat({
      type: "pregnancy-assistant",
      messages: [{ role: "user", content: prompt }],
      onDelta: (text) => setResponse(prev => prev + text),
      onDone: () => {},
    });
  };

  if (disclaimerLoading) {
    return (
      <ToolFrame title="AI Baby Room Designer" icon={Home} mood="joyful">
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </ToolFrame>
    );
  }

  if (!isAccepted) {
    return <MedicalDisclaimer onAccept={accept} toolName="AI Baby Room Designer" />;
  }

  return (
    <ToolFrame title="AI Baby Room Designer" icon={Home} mood="joyful">
      <div className="space-y-4">
        
        {/* Theme Selection - Minimal */}
        <div className="flex items-center justify-between gap-2 p-3 bg-muted/30 rounded-xl">
          <span className="text-xs font-medium text-muted-foreground">Theme</span>
          <div className="flex gap-1.5">
            {ROOM_THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                  selectedTheme.id === theme.id 
                    ? 'ring-2 ring-primary ring-offset-1 scale-110' 
                    : 'hover:scale-105'
                }`}
                style={{ background: `linear-gradient(135deg, hsl(${theme.primaryColor}), hsl(${theme.accentColor}))` }}
                title={theme.name}
              >
                {theme.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Design Canvas */}
        <Card className="overflow-hidden" ref={canvasRef}>
          <div 
            className="relative aspect-[4/3] p-4"
            style={{ 
              background: `linear-gradient(135deg, hsl(${selectedTheme.secondaryColor}), hsl(${selectedTheme.primaryColor} / 0.4))` 
            }}
          >
            {/* Placed Items */}
            <AnimatePresence>
              {placedItems.map(item => (
                <motion.button
                  key={item.instanceId}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={() => handleRemoveItem(item.instanceId)}
                  className="absolute w-12 h-12 flex items-center justify-center text-2xl bg-background/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:bg-destructive/20 hover:border-destructive/50 transition-colors cursor-pointer"
                  style={{ 
                    left: `${item.position.x}%`, 
                    top: `${item.position.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  title={`${item.name} - Tap to remove`}
                >
                  {item.icon}
                </motion.button>
              ))}
            </AnimatePresence>

            {/* Empty State */}
            {placedItems.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-muted-foreground/60 text-center px-4">
                  Tap items below to add them to your room
                </p>
              </div>
            )}

            {/* Item Count */}
            {placedItems.length > 0 && (
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs font-medium">
                {placedItems.length} items
              </div>
            )}
          </div>

          {/* Quick Add Bar */}
          <div className="p-3 border-t bg-background/50">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {FURNITURE_ASSETS.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => handleAddItem(asset.id)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-full text-xs font-medium transition-colors"
                >
                  <span>{asset.icon}</span>
                  <span>{asset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={generateAIPlan}
            disabled={isLoading}
            className="flex-1 h-11"
            style={{
              background: `linear-gradient(135deg, hsl(${selectedTheme.primaryColor}), hsl(${selectedTheme.accentColor}))`,
            }}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            {isLoading ? "Generating..." : "Get AI Design Plan"}
          </Button>
          
          <Button variant="outline" size="icon" onClick={handleExport} className="h-11 w-11">
            <Download className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="icon" onClick={handleReset} className="h-11 w-11">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* AI Response */}
        {showAIPlan && (response || isLoading) && (
          <Card className="p-4 border-l-4" style={{ borderLeftColor: `hsl(${selectedTheme.accentColor})` }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" style={{ color: `hsl(${selectedTheme.accentColor})` }} />
              <h4 className="font-semibold text-sm">Your Personalized Design Plan</h4>
            </div>
            <MarkdownRenderer content={response} isLoading={isLoading} />
          </Card>
        )}

        {/* Inline Disclaimer */}
        <InlineDisclaimer compact />
      </div>
    </ToolFrame>
  );
};

export default AIBabyRoom;
