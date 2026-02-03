import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { setManualLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const languages = [
  { code: 'en', flag: '🇺🇸', short: 'EN', name: 'English' },
  { code: 'ar', flag: '🇸🇦', short: 'ع', name: 'العربية' },
  { code: 'de', flag: '🇩🇪', short: 'DE', name: 'Deutsch' },
  { code: 'tr', flag: '🇹🇷', short: 'TR', name: 'Türkçe' },
  { code: 'fr', flag: '🇫🇷', short: 'FR', name: 'Français' },
  { code: 'es', flag: '🇪🇸', short: 'ES', name: 'Español' },
  { code: 'pt', flag: '🇵🇹', short: 'PT', name: 'Português' },
];

interface LanguageDropdownProps {
  className?: string;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ 
  className 
}) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const currentLanguage = i18n.language?.split('-')[0] || 'en';
  const currentLang = languages.find(l => l.code === currentLanguage) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    setManualLanguage(langCode);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.92 }}
          className={cn(
            "relative flex items-center justify-center",
            "w-8 h-8 rounded-full",
            "bg-gradient-to-br from-primary/10 to-primary/5",
            "border border-primary/20 hover:border-primary/40",
            "text-primary hover:text-primary/80",
            "transition-all duration-200",
            "shadow-sm hover:shadow-md hover:shadow-primary/10",
            className
          )}
        >
          <Globe className="w-4 h-4" strokeWidth={2} />
          
          {/* Active language indicator */}
          <span className="absolute -bottom-0.5 -end-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-card border border-border text-[8px] font-bold text-foreground shadow-sm">
            {currentLang.short.charAt(0)}
          </span>
        </motion.button>
      </PopoverTrigger>
      
      <PopoverContent 
        align="end" 
        sideOffset={8}
        className="w-[180px] p-2 bg-card border border-border/60 shadow-xl rounded-xl z-[100]"
      >
        <div className="space-y-1">
          <AnimatePresence>
            {languages.map((lang, index) => (
              <motion.button
                key={lang.code}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg",
                  "text-sm font-medium transition-all duration-150",
                  "hover:bg-accent/50 active:scale-[0.98]",
                  currentLanguage === lang.code 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground"
                )}
              >
                <span className="text-lg leading-none">{lang.flag}</span>
                <span className="flex-1 text-start text-xs font-medium truncate">
                  {lang.name}
                </span>
                {currentLanguage === lang.code && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center"
                  >
                    <Check className="w-2.5 h-2.5 text-primary" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </PopoverContent>
    </Popover>
  );
};
