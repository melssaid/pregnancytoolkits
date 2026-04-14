import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resetToBrowserLanguage } from '@/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'auto', name: '', flag: '🌐', isAuto: true },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
];

interface LanguageSelectorProps {
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, isChanging } = useLanguage();
  const hasManualSelection = localStorage.getItem('user_selected_language') !== null;
  const activeLangCode = hasManualSelection ? currentLanguage : 'auto';

  const handleLanguageChange = (langCode: string) => {
    if (langCode === 'auto') {
      resetToBrowserLanguage();
    } else {
      changeLanguage(langCode);
    }
  };

  const handleResetToAuto = () => {
    resetToBrowserLanguage();
  };

  return (
    <div className={cn("space-y-2", isChanging && "opacity-70 pointer-events-none")}>
      <div className={cn("grid gap-1.5", compact ? "grid-cols-3" : "grid-cols-2 gap-2")}>
        {languages.map((lang) => {
          const isAutoLang = 'isAuto' in lang && lang.isAuto;
          const displayName = isAutoLang 
            ? t('settings.language.auto', 'Auto') 
            : lang.name;
          return (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                "flex items-center gap-2 rounded-lg border transition-all",
                compact ? "px-2 py-1.5 text-xs" : "px-3 py-2.5 text-sm",
                isAutoLang && "col-span-2",
                activeLangCode === lang.code 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-background hover:bg-muted border-border"
              )}
            >
              <span className={compact ? "text-sm" : "text-base"}>{lang.flag}</span>
              <span className="flex-1 text-start truncate">{displayName}</span>
              {activeLangCode === lang.code && (
                <Check className={cn(compact ? "w-3 h-3" : "w-4 h-4")} />
              )}
            </button>
          );
        })}
      </div>
      
      <p className="text-[10px] text-muted-foreground text-center">
        {activeLangCode === 'auto'
          ? t('settings.language.autoDetectNote', 'Using your browser/device language automatically.')
          : t('settings.language.manualNote', 'You have manually selected a language.')}
      </p>
    </div>
  );
};
