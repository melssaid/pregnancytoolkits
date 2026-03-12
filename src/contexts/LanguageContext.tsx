import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { updateDocumentDirection, setManualLanguage } from '@/i18n';

interface LanguageContextType {
  currentLanguage: string;
  isRTL: boolean;
  changeLanguage: (lang: string) => void;
  isChanging: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const SUPPORTED_LANGUAGES = ['en', 'ar', 'de', 'tr', 'fr', 'es', 'pt'];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n: i18nHook } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);
  const resolvedLang = (i18nHook.language || i18n.language || 'en').split('-')[0];
  const [currentLanguage, setCurrentLanguage] = useState(
    resolvedLang && SUPPORTED_LANGUAGES.includes(resolvedLang) ? resolvedLang : 'en'
  );

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      const normalizedLang = lng.split('-')[0];
      setCurrentLanguage(normalizedLang);
      updateDocumentDirection(normalizedLang);
      setIsChanging(false);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  // Smooth language change with minimal transition
  const changeLanguage = useCallback(async (lang: string) => {
    if (!SUPPORTED_LANGUAGES.includes(lang) || lang === currentLanguage) return;
    
    setIsChanging(true);
    document.body.classList.add('language-transition');
    
    // Await bundle load so translations appear instantly
    await setManualLanguage(lang);
    
    setTimeout(() => {
      document.body.classList.remove('language-transition');
    }, 300);
  }, [currentLanguage]);

  const isRTL = useMemo(() => currentLanguage === 'ar', [currentLanguage]);

  const value = useMemo(() => ({
    currentLanguage,
    isRTL,
    changeLanguage,
    isChanging
  }), [currentLanguage, isRTL, changeLanguage, isChanging]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
