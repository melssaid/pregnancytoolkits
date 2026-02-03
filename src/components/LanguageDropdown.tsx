import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { setManualLanguage } from '@/i18n';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
  { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', nativeName: 'Türkçe' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷', nativeName: 'Português' },
];

interface LanguageDropdownProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ 
  variant = 'default',
  className 
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language?.split('-')[0] || 'en';
  const currentLang = languages.find(l => l.code === currentLanguage) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    setManualLanguage(langCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={variant === 'compact' ? 'sm' : 'default'}
          className={cn(
            "gap-2 font-medium hover:bg-accent/50 transition-colors",
            variant === 'compact' && "h-9 px-2",
            className
          )}
        >
          <span className="text-xl leading-none">{currentLang.flag}</span>
          {variant === 'default' && (
            <span className="hidden sm:inline text-sm">{currentLang.nativeName}</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-popover border border-border shadow-lg z-50"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={cn(
              "flex items-center gap-3 cursor-pointer py-2.5 px-3",
              "hover:bg-accent focus:bg-accent transition-colors",
              currentLanguage === lang.code && "bg-accent/50"
            )}
          >
            <span className="text-xl leading-none">{lang.flag}</span>
            <div className="flex-1">
              <p className="font-medium text-sm">{lang.nativeName}</p>
              <p className="text-xs text-muted-foreground">{lang.name}</p>
            </div>
            {currentLanguage === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};