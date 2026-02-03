import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ar from './locales/ar.json';
import de from './locales/de.json';
import tr from './locales/tr.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  de: { translation: de },
  tr: { translation: tr },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar', 'de', 'tr'],
    detection: {
      order: ['navigator', 'localStorage', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
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

// Set initial direction
updateDocumentDirection(i18n.language);

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
});

export default i18n;
