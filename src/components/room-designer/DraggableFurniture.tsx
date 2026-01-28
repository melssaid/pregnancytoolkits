import { motion, useDragControls, PanInfo } from 'framer-motion';
import { X, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import { useState } from 'react';
import type { PlacedFurniture, RoomTheme } from './types';

interface DraggableFurnitureProps {
  item: PlacedFurniture;
  containerRef: React.RefObject<HTMLDivElement>;
  onUpdate: (id: string, updates: Partial<PlacedFurniture>) => void;
  onRemove: (id: string) => void;
  theme: RoomTheme;
  isSelected: boolean;
  onSelect: () => void;
}

export const DraggableFurniture = ({
  item,
  containerRef,
  onUpdate,
  onRemove,
  theme,
  isSelected,
  onSelect,
}: DraggableFurnitureProps) => {
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(100, ((info.point.x - rect.left) / rect.width) * 100));
    const newY = Math.max(0, Math.min(100, ((info.point.y - rect.top) / rect.height) * 100));
    
    onUpdate(item.instanceId, { position: { x: newX, y: newY } });
    setIsDragging(false);
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(item.instanceId, { rotation: (item.rotation + 45) % 360 });
  };

  const handleScale = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    const newScale = Math.max(0.5, Math.min(2, item.scale + delta));
    onUpdate(item.instanceId, { scale: newScale });
  };

  // Determine if this is a "tintable" item (textile category)
  const isTintable = item.category === 'textile';

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        rotate: item.rotation,
      }}
      exit={{ scale: 0, opacity: 0 }}
      whileDrag={{ scale: 1.1, zIndex: 100 }}
      style={{
        position: 'absolute',
        left: `${item.position.x}%`,
        top: `${item.position.y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      className={`group ${isSelected ? 'z-50' : 'z-10'}`}
    >
      <div 
        className={`relative transition-all ${
          isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
        }`}
        style={{
          transform: `scale(${item.scale})`,
        }}
      >
        {/* Furniture item */}
        <motion.div
          className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing"
          style={{
            background: isTintable 
              ? `linear-gradient(135deg, hsl(${theme.primaryColor}), hsl(${theme.secondaryColor}))` 
              : 'hsl(var(--card))',
            border: `2px solid hsl(${theme.primaryColor} / 0.4)`,
            boxShadow: isSelected 
              ? `0 0 0 2px hsl(${theme.accentColor}), 0 4px 12px hsl(${theme.primaryColor} / 0.3)` 
              : '0 2px 8px rgba(0,0,0,0.1)',
          }}
          whileHover={{ scale: 1.08, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-2xl select-none drop-shadow-sm">{item.icon}</span>
        </motion.div>

        {/* Controls - only show when selected */}
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background/95 backdrop-blur rounded-lg shadow-lg border p-1"
          >
            <button
              onClick={handleRotate}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title="Rotate"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => handleScale(e, -0.25)}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title="Smaller"
            >
              <Minimize2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => handleScale(e, 0.25)}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title="Larger"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
            <div className="w-px h-4 bg-border" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.instanceId);
              }}
              className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
              title="Remove"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}

        {/* Label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isDragging || isSelected ? 1 : 0 }}
          className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-foreground text-background text-xs rounded whitespace-nowrap font-medium"
        >
          {item.name}
        </motion.div>
      </div>
    </motion.div>
  );
};
