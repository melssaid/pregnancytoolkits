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
            <div className="p-2 border-t bg-muted/30">
              <div className="grid gap-1">
                {ROOM_THEMES.map((theme) => (
                  <motion.button
                    key={theme.id}
                    onClick={() => onThemeChange(theme)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all ${
                      selectedTheme.id === theme.id 
                        ? 'bg-primary/10 ring-1 ring-primary/30' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow-sm"
                      style={{ 
                        background: `linear-gradient(135deg, hsl(${theme.primaryColor}), hsl(${theme.accentColor}))` 
                      }}
                    >
                      {theme.icon}
                    </div>
                    <span className="text-sm font-medium">{theme.name}</span>
                    {selectedTheme.id === theme.id && (
                      <motion.div
                        layoutId="theme-check"
                        className="ml-auto w-2 h-2 rounded-full bg-primary"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
              
              {/* Custom color picker hint */}
              <div className="mt-2 pt-2 border-t border-border/50">
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                  <div className="flex -space-x-1">
                    {ROOM_THEMES.slice(0, 3).map((t) => (
                      <div
                        key={t.id}
                        className="w-4 h-4 rounded-full border-2 border-background"
                        style={{ background: `hsl(${t.accentColor})` }}
                      />
                    ))}
                  </div>
                  <span>Colors apply to furniture & UI</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </motion.div>
  );
};
