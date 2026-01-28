import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sofa, Lamp, Frame, Shirt } from 'lucide-react';
import { FURNITURE_ASSETS, type FurnitureAsset, type RoomTheme } from './types';

interface AssetLibraryProps {
  onAssetSelect: (asset: FurnitureAsset) => void;
  theme: RoomTheme;
}

const CATEGORIES = [
  { id: 'furniture', name: 'Furniture', icon: Sofa },
  { id: 'decor', name: 'Decor', icon: Frame },
  { id: 'lighting', name: 'Lighting', icon: Lamp },
  { id: 'textile', name: 'Textiles', icon: Shirt },
] as const;

export const AssetLibrary = ({ onAssetSelect, theme }: AssetLibraryProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('furniture');

  const filteredAssets = FURNITURE_ASSETS.filter(a => a.category === activeCategory);

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="absolute left-0 top-0 bottom-0 z-10 flex"
    >
      {/* Toggle button */}
      <AnimatePresence mode="wait">
        {!isExpanded && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-background/95 backdrop-blur border rounded-r-xl p-2 shadow-lg hover:bg-muted transition-colors"
            style={{ borderColor: `hsl(${theme.primaryColor} / 0.3)` }}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="h-full bg-background/95 backdrop-blur-lg border-r shadow-xl overflow-hidden"
            style={{ borderColor: `hsl(${theme.primaryColor} / 0.2)` }}
          >
            <div className="h-full flex flex-col w-[220px]">
              {/* Header */}
              <div 
                className="p-4 border-b flex items-center justify-between"
                style={{ 
                  background: `linear-gradient(135deg, hsl(${theme.primaryColor} / 0.1), transparent)`,
                  borderColor: `hsl(${theme.primaryColor} / 0.2)` 
                }}
              >
                <div>
                  <h3 className="font-bold text-sm">Asset Library</h3>
                  <p className="text-xs text-muted-foreground">Drag to canvas</p>
                </div>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Categories */}
              <div className="flex gap-1 p-2 border-b" style={{ borderColor: `hsl(${theme.primaryColor} / 0.1)` }}>
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex-1 p-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
                        isActive 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-medium">{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Assets grid */}
              <div className="flex-1 overflow-y-auto p-2">
                <div className="grid grid-cols-2 gap-2">
                  {filteredAssets.map((asset) => (
                    <motion.button
                      key={asset.id}
                      onClick={() => onAssetSelect(asset)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="aspect-square rounded-xl border bg-card hover:bg-muted/50 transition-all flex flex-col items-center justify-center gap-1 p-2 group"
                      style={{ borderColor: `hsl(${theme.primaryColor} / 0.2)` }}
                    >
                      <motion.span 
                        className="text-3xl"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                      >
                        {asset.icon}
                      </motion.span>
                      <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                        {asset.name}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Hint */}
              <div 
                className="p-3 border-t text-center"
                style={{ 
                  background: `hsl(${theme.primaryColor} / 0.05)`,
                  borderColor: `hsl(${theme.primaryColor} / 0.1)` 
                }}
              >
                <p className="text-xs text-muted-foreground">
                  Click to add • Drag to move
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
