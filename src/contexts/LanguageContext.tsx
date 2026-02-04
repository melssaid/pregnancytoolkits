import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { i18n } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language?.split('-')[0] || 'en');

  // Update state when i18n language changes
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
  }, [i18n]);

  // Smooth language change with minimal transition
  const changeLanguage = useCallback((lang: string) => {
    if (!SUPPORTED_LANGUAGES.includes(lang) || lang === currentLanguage) return;
    
    setIsChanging(true);
    
    // Apply smooth transition class to body
    document.body.classList.add('language-transition');
    
    // Change language
    setManualLanguage(lang);
    
    // Remove transition class after animation
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
