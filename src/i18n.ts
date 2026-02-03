import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ar from './locales/ar.json';
import de from './locales/de.json';
import tr from './locales/tr.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import pt from './locales/pt.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  de: { translation: de },
  tr: { translation: tr },
  fr: { translation: fr },
  es: { translation: es },
  pt: { translation: pt },
};

const SUPPORTED_LANGUAGES = ['en', 'ar', 'de', 'tr', 'fr', 'es', 'pt'];
const MANUAL_LANGUAGE_KEY = 'user_selected_language';

// Get the best matching language from browser
const getBrowserLanguage = (): string => {
  const browserLang = navigator.language?.split('-')[0] || 'en';
  return SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : 'en';
};

// Check if user manually selected a language
const getManualLanguage = (): string | null => {
  return localStorage.getItem(MANUAL_LANGUAGE_KEY);
};

// Determine initial language: manual selection > browser language
const getInitialLanguage = (): string => {
  const manualLang = getManualLanguage();
  if (manualLang && SUPPORTED_LANGUAGES.includes(manualLang)) {
    return manualLang;
  }
  return getBrowserLanguage();
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false,
    },
  });

// Function to update document direction based on language
export const updateDocumentDirection = (language: string) => {
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', language);
};

// Function to manually set language (saves to localStorage)
export const setManualLanguage = (language: string) => {
  if (SUPPORTED_LANGUAGES.includes(language)) {
    localStorage.setItem(MANUAL_LANGUAGE_KEY, language);
    i18n.changeLanguage(language);
  }
};

// Function to reset to browser language
export const resetToBrowserLanguage = () => {
  localStorage.removeItem(MANUAL_LANGUAGE_KEY);
  const browserLang = getBrowserLanguage();
  i18n.changeLanguage(browserLang);
};

// Set initial direction
updateDocumentDirection(i18n.language);

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
});

export default i18n;
