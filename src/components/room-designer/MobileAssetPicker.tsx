import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sofa, Lamp, Frame, Shirt } from 'lucide-react';
import { FURNITURE_ASSETS, type FurnitureAsset, type RoomTheme } from './types';

interface MobileAssetPickerProps {
  onAssetSelect: (asset: FurnitureAsset) => void;
  theme: RoomTheme;
}

const CATEGORIES = [
  { id: 'furniture', name: 'Furniture', icon: Sofa },
  { id: 'decor', name: 'Decor', icon: Frame },
  { id: 'lighting', name: 'Lighting', icon: Lamp },
  { id: 'textile', name: 'Textiles', icon: Shirt },
] as const;

export const MobileAssetPicker = ({ onAssetSelect, theme }: MobileAssetPickerProps) => {
  const [activeCategory, setActiveCategory] = useState<string>('furniture');
  
  const filteredAssets = FURNITURE_ASSETS.filter(a => a.category === activeCategory);

  return (
    <div className="space-y-3">
      {/* Category Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-1 py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs font-medium ${
                isActive 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Assets Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
        {filteredAssets.map((asset) => (
          <motion.button
            key={asset.id}
            onClick={() => onAssetSelect(asset)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 w-16 h-16 rounded-xl border bg-card hover:bg-muted/50 transition-all flex flex-col items-center justify-center gap-0.5 p-1"
            style={{ borderColor: `hsl(${theme.primaryColor} / 0.2)` }}
          >
            <span className="text-2xl">{asset.icon}</span>
            <span className="text-[8px] font-medium text-muted-foreground text-center leading-tight line-clamp-1">
              {asset.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
