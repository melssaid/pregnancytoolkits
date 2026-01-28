import { motion } from 'framer-motion';
import { Palette, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { ROOM_THEMES, type RoomTheme } from './types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ThemeSelectorProps {
  selectedTheme: RoomTheme;
  onThemeChange: (theme: RoomTheme) => void;
}

export const ThemeSelector = ({ selectedTheme, onThemeChange }: ThemeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-4 right-4 z-20"
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div 
          className="bg-background/95 backdrop-blur-lg rounded-2xl shadow-xl border overflow-hidden"
          style={{ borderColor: `hsl(${selectedTheme.primaryColor} / 0.3)` }}
        >
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `hsl(${selectedTheme.accentColor})` }}
              >
                <Palette className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs text-muted-foreground">Room Theme</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  {selectedTheme.icon} {selectedTheme.name}
                </p>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="p-2 border-t bg-muted/30 max-h-[280px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-1.5">
                {ROOM_THEMES.map((theme) => {
                  const isActive = selectedTheme.id === theme.id;
                  return (
                    <motion.button
                      key={theme.id}
                      onClick={() => onThemeChange(theme)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                        isActive 
                          ? 'ring-2 ring-offset-1 ring-primary' 
                          : 'hover:bg-muted'
                      }`}
                      style={{
                        background: isActive ? `hsl(${theme.primaryColor} / 0.15)` : undefined,
                      }}
                    >
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm"
                        style={{ 
                          background: `linear-gradient(135deg, hsl(${theme.primaryColor}), hsl(${theme.accentColor}))` 
                        }}
                      >
                        {theme.icon}
                      </div>
                      <span className="text-[10px] font-medium text-center leading-tight">{theme.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </motion.div>
  );
};
