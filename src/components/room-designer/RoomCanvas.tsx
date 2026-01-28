import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, ZoomIn, ZoomOut, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DraggableFurniture } from './DraggableFurniture';
import type { PlacedFurniture, FurnitureAsset, RoomTheme } from './types';

interface RoomCanvasProps {
  roomImage: string | null;
  placedFurniture: PlacedFurniture[];
  onFurnitureUpdate: (items: PlacedFurniture[]) => void;
  theme: RoomTheme;
  onAddFurniture: (asset: FurnitureAsset) => void;
}

export const RoomCanvas = ({
  roomImage,
  placedFurniture,
  onFurnitureUpdate,
  theme,
  onAddFurniture,
}: RoomCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleUpdateItem = useCallback((id: string, updates: Partial<PlacedFurniture>) => {
    onFurnitureUpdate(
      placedFurniture.map(item =>
        item.instanceId === id ? { ...item, ...updates } : item
      )
    );
  }, [placedFurniture, onFurnitureUpdate]);

  const handleRemoveItem = useCallback((id: string) => {
    onFurnitureUpdate(placedFurniture.filter(item => item.instanceId !== id));
    setSelectedId(null);
    toast.success('Item removed');
  }, [placedFurniture, onFurnitureUpdate]);

  const handleAutoArrange = () => {
    if (placedFurniture.length === 0) {
      toast.error('Add some furniture first!');
      return;
    }

    // Logical arrangement zones
    const zones = [
      { x: 50, y: 25 }, // Top center (crib)
      { x: 20, y: 50 }, // Left middle (chair)
      { x: 80, y: 50 }, // Right middle (dresser)
      { x: 50, y: 75 }, // Bottom center (rug)
      { x: 15, y: 25 }, // Top left (lamp)
      { x: 85, y: 25 }, // Top right (shelf)
    ];

    const rearranged = placedFurniture.map((item, index) => ({
      ...item,
      position: zones[index % zones.length],
      rotation: 0,
    }));

    onFurnitureUpdate(rearranged);
    toast.success('✨ Auto-arranged for optimal flow!');
  };

  const handleClearCanvas = () => {
    if (placedFurniture.length === 0) return;
    onFurnitureUpdate([]);
    setSelectedId(null);
    toast.success('Canvas cleared');
  };

  return (
    <div className="relative">
      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-background/95 backdrop-blur-lg rounded-full shadow-xl border px-2 py-1.5"
        style={{ borderColor: `hsl(${theme.primaryColor} / 0.3)` }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAutoArrange}
          className="rounded-full gap-1.5 text-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Auto-Arrange
        </Button>
        
        <div className="w-px h-5 bg-border" />
        
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded-full transition-colors ${showGrid ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
          title="Toggle grid"
        >
          <Grid3X3 className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => setZoom(Math.min(2, zoom + 0.25))}
          className="p-2 rounded-full hover:bg-muted transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
          className="p-2 rounded-full hover:bg-muted transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        
        <div className="w-px h-5 bg-border" />
        
        <button
          onClick={handleClearCanvas}
          className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          title="Clear all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Canvas */}
      <motion.div
        ref={containerRef}
        className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: roomImage 
            ? 'transparent' 
            : `linear-gradient(135deg, hsl(${theme.secondaryColor}), hsl(${theme.primaryColor} / 0.3))`,
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
        }}
        onClick={() => setSelectedId(null)}
      >
        {/* Room image */}
        {roomImage && (
          <img
            src={roomImage}
            alt="Room"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Overlay tint based on theme */}
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{ background: `hsl(${theme.primaryColor} / 0.1)` }}
        />

        {/* Grid overlay */}
        {showGrid && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(hsl(${theme.primaryColor} / 0.15) 1px, transparent 1px),
                linear-gradient(90deg, hsl(${theme.primaryColor} / 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '10% 10%',
            }}
          />
        )}

        {/* Placed furniture */}
        <AnimatePresence>
          {placedFurniture.map((item) => (
            <DraggableFurniture
              key={item.instanceId}
              item={item}
              containerRef={containerRef}
              onUpdate={handleUpdateItem}
              onRemove={handleRemoveItem}
              theme={theme}
              isSelected={selectedId === item.instanceId}
              onSelect={() => setSelectedId(item.instanceId)}
            />
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {!roomImage && placedFurniture.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl mb-3"
            >
              🏠
            </motion.div>
            <p className="text-sm font-medium">Upload a room photo to get started</p>
            <p className="text-xs">or start adding furniture from the library</p>
          </div>
        )}

        {/* Furniture count badge */}
        {placedFurniture.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur border shadow-lg text-sm font-medium"
            style={{ borderColor: `hsl(${theme.primaryColor} / 0.3)` }}
          >
            {placedFurniture.length} item{placedFurniture.length !== 1 ? 's' : ''}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
