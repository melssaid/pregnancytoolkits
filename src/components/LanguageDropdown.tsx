import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown } from 'lucide-react';
import { setManualLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const languages = [
  { code: 'en', flag: '🇺🇸', short: 'EN' },
  { code: 'ar', flag: '🇸🇦', short: 'ع' },
  { code: 'de', flag: '🇩🇪', short: 'DE' },
  { code: 'tr', flag: '🇹🇷', short: 'TR' },
  { code: 'fr', flag: '🇫🇷', short: 'FR' },
  { code: 'es', flag: '🇪🇸', short: 'ES' },
  { code: 'pt', flag: '🇵🇹', short: 'PT' },
];

interface LanguageDropdownProps {
  variant?: 'default' | 'compact';
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
        <button
          className={cn(
            "inline-flex items-center gap-1 h-8 px-2 rounded-md",
            "text-xs font-medium text-foreground",
            "bg-muted/50 hover:bg-muted border border-border/50",
            "transition-all duration-200 active:scale-95",
            className
          )}
        >
          <span className="text-sm leading-none">{currentLang.flag}</span>
          <span className="text-[10px] font-semibold">{currentLang.short}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        sideOffset={8}
        className="w-auto min-w-[140px] p-1.5 bg-popover border border-border shadow-xl z-[100]"
      >
        <div className="grid grid-cols-2 gap-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                "flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-md",
                "text-xs font-medium transition-all duration-150",
                "hover:bg-accent active:scale-95",
                currentLanguage === lang.code 
                  ? "bg-primary/10 text-primary ring-1 ring-primary/30" 
                  : "text-foreground"
              )}
            >
              <span className="text-base leading-none">{lang.flag}</span>
              <span className="text-[10px] font-semibold">{lang.short}</span>
              {currentLanguage === lang.code && (
                <Check className="h-3 w-3 text-primary" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};