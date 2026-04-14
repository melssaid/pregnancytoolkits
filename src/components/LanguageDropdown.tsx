import React, { forwardRef } from 'react';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { resetToBrowserLanguage } from '@/i18n';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Create a forwardRef motion button to work with Radix's asChild
const MotionButton = forwardRef<HTMLButtonElement, HTMLMotionProps<"button"> & { className?: string }>(
  ({ children, ...props }, ref) => (
    <motion.button ref={ref} {...props}>
      {children}
    </motion.button>
  )
);

const languages = [
  { code: 'auto', flag: '🌐', short: 'Auto', name: 'Auto' },
  { code: 'en', flag: '🇺🇸', short: 'EN', name: 'English' },
  { code: 'ar', flag: '🇸🇦', short: 'ع', name: 'العربية' },
  { code: 'de', flag: '🇩🇪', short: 'DE', name: 'Deutsch' },
  { code: 'tr', flag: '🇹🇷', short: 'TR', name: 'Türkçe' },
  { code: 'fr', flag: '🇫🇷', short: 'FR', name: 'Français' },
  { code: 'es', flag: '🇪🇸', short: 'ES', name: 'Español' },
  { code: 'pt', flag: '🇵🇹', short: 'PT', name: 'Português' },
];

interface LanguageDropdownProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ 
  className 
}) => {
  const { currentLanguage, changeLanguage, isChanging } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const isAutoMode = !localStorage.getItem('user_selected_language');
  const activeLangCode = isAutoMode ? 'auto' : currentLanguage;
  const currentLang = languages.find(l => l.code === activeLangCode) || languages[1];

  const handleLanguageChange = (langCode: string) => {
    if (langCode === 'auto') {
      resetToBrowserLanguage();
    } else {
      changeLanguage(langCode);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <MotionButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "relative inline-flex items-center justify-center",
            "h-9 w-9 rounded-xl",
            "bg-muted/60 hover:bg-muted",
            "border border-border/50 hover:border-border",
            "transition-all duration-200",
            isChanging && "opacity-70 pointer-events-none",
            className
          )}
        >
          <span className="text-[15px] leading-none flex items-center justify-center w-full h-full mt-[1px]">{currentLang.flag}</span>
          <span className="absolute -top-[3px] -end-[3px] w-[9px] h-[9px] rounded-full bg-emerald-500 ring-[2px] ring-background" />
        </MotionButton>
      </PopoverTrigger>
      
      <PopoverContent 
        align="end" 
        sideOffset={8}
        className="w-auto p-2 bg-popover/95 backdrop-blur-lg border border-border/80 shadow-2xl shadow-primary/10 rounded-xl z-[100]"
      >
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1.5"
          >
            {/* Header */}
            <div className="flex items-center gap-1.5 px-2 pb-1.5 border-b border-border/50">
              <Globe className="h-3 w-3 text-primary" />
              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
                Language
              </span>
            </div>
            
            {/* Language Grid */}
            <div className="grid grid-cols-4 gap-1">
              {languages.map((lang, index) => (
                <motion.button
                  key={lang.code}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    "relative flex flex-col items-center justify-center",
                    "w-10 h-10 rounded-lg",
                    "transition-all duration-200",
                    "hover:bg-accent active:scale-95",
                    activeLangCode === lang.code 
                      ? "bg-primary/15 ring-1.5 ring-primary/40 shadow-sm shadow-primary/20" 
                      : "hover:shadow-sm"
                  )}
                >
                  <span className="text-lg leading-none">{lang.flag}</span>
                  <span className={cn(
                    "text-[8px] font-bold mt-0.5 tracking-tight",
                    activeLangCode === lang.code 
                      ? "text-primary" 
                      : "text-muted-foreground"
                  )}>
                    {lang.short}
                  </span>
                  
                  {/* Active indicator dot */}
                  {activeLangCode === lang.code && (
                    <motion.div
                      layoutId="activeLanguage"
                      className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-primary rounded-full ring-2 ring-popover"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
};