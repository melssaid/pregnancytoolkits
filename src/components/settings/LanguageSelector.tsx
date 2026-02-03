import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { setManualLanguage, resetToBrowserLanguage } from '@/i18n';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
];

export const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language?.split('-')[0] || 'en';
  const hasManualSelection = localStorage.getItem('user_selected_language') !== null;

  const handleLanguageChange = (langCode: string) => {
    setManualLanguage(langCode);
  };

  const handleResetToAuto = () => {
    resetToBrowserLanguage();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="w-5 h-5 text-primary" />
          {t('settings.language.title', 'Language')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('settings.language.description', 'Choose your preferred language')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant={currentLanguage === lang.code ? 'default' : 'outline'}
              className="justify-start gap-2 h-auto py-3"
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="flex-1 text-start">{lang.name}</span>
              {currentLanguage === lang.code && (
                <Check className="w-4 h-4" />
              )}
            </Button>
          ))}
        </div>
        
        {hasManualSelection && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-muted-foreground"
            onClick={handleResetToAuto}
          >
            <RotateCcw className="w-4 h-4 me-2" />
            {t('settings.language.resetToAuto', 'Use browser language')}
          </Button>
        )}
        
        <p className="text-xs text-muted-foreground mt-3">
          {hasManualSelection 
            ? t('settings.language.manualNote', 'You have manually selected a language.')
            : t('settings.language.autoDetectNote', 'Using your browser language automatically.')}
        </p>
      </CardContent>
    </Card>
  );
};
