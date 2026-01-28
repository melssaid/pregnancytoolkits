import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';
import { ROOM_THEMES, type RoomTheme } from './types';

interface ThemeSelectorProps {
  selectedTheme: RoomTheme;
  onThemeChange: (theme: RoomTheme) => void;
}

export const ThemeSelector = ({ selectedTheme, onThemeChange }: ThemeSelectorProps) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `hsl(${selectedTheme.accentColor})` }}
        >
          <Palette className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold">Choose Theme</p>
          <p className="text-xs text-muted-foreground">
            Selected: {selectedTheme.icon} {selectedTheme.name}
          </p>
        </div>
      </div>
      
      {/* Theme Grid */}
      <div className="grid grid-cols-5 gap-2">
        {ROOM_THEMES.map((theme) => {
          const isActive = selectedTheme.id === theme.id;
          return (
            <motion.button
              key={theme.id}
              onClick={() => onThemeChange(theme)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive 
                  ? 'ring-2 ring-primary ring-offset-1 bg-primary/10' 
                  : 'hover:bg-muted border border-transparent hover:border-border'
              }`}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm"
                style={{ 
                  background: `linear-gradient(135deg, hsl(${theme.primaryColor}), hsl(${theme.accentColor}))` 
                }}
              >
                {theme.icon}
              </div>
              <span className="text-[9px] font-medium text-center leading-tight line-clamp-1">
                {theme.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
